#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html.parser
import json
import mimetypes
import os
import re
import struct
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
)
MAX_BYTES_DEFAULT = 25 * 1024 * 1024


class ImageCandidateParser(html.parser.HTMLParser):
    def __init__(self, base_url: str) -> None:
        super().__init__(convert_charrefs=True)
        self.base_url = base_url
        self.candidates: list[tuple[int, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        d = {k.lower(): (v or "") for k, v in attrs}
        if tag.lower() == "meta":
            prop = (d.get("property") or d.get("name") or "").lower()
            content = d.get("content", "")
            if prop in {"og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"} and content:
                self._add(100, content, prop)
        elif tag.lower() == "img":
            for key, score in (("src", 60), ("data-src", 55), ("data-original", 55), ("data-lazy-src", 50)):
                if d.get(key):
                    self._add(score, d[key], f"img:{key}")
            srcset = d.get("srcset", "") or d.get("data-srcset", "")
            if srcset:
                for item in srcset.split(","):
                    url = item.strip().split(" ")[0]
                    if url:
                        self._add(65, url, "img:srcset")

    def _add(self, score: int, url: str, reason: str) -> None:
        url = urllib.parse.urljoin(self.base_url, url.strip())
        if url.startswith(("http://", "https://")):
            self.candidates.append((score, url, reason))


def request_bytes(url: str, *, referer: str | None, timeout: int, retries: int, max_bytes: int, accept: str) -> tuple[bytes, dict[str, str], str]:
    headers = {
        "User-Agent": DEFAULT_UA,
        "Accept": accept,
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }
    if referer:
        headers["Referer"] = referer
    last_exc: Exception | None = None
    for attempt in range(retries + 1):
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                final_url = resp.geturl()
                out = bytearray()
                while True:
                    chunk = resp.read(1024 * 256)
                    if not chunk:
                        break
                    out.extend(chunk)
                    if len(out) > max_bytes:
                        raise ValueError(f"response exceeds max bytes ({max_bytes})")
                hdrs = {k.lower(): v for k, v in resp.headers.items()}
                return bytes(out), hdrs, final_url
        except Exception as exc:
            last_exc = exc
            if attempt >= retries:
                break
            time.sleep(min(2 ** attempt, 4))
    assert last_exc is not None
    raise last_exc


def detect_image_type(data: bytes, content_type: str = "") -> tuple[str | None, str | None]:
    ct = content_type.split(";", 1)[0].strip().lower()
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png", "image/png"
    if data[:3] == b"\xff\xd8\xff":
        return ".jpg", "image/jpeg"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return ".gif", "image/gif"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp", "image/webp"
    stripped = data.lstrip()
    if stripped.startswith(b"<svg") or b"<svg" in stripped[:1024].lower():
        return ".svg", "image/svg+xml"
    if ct.startswith("image/"):
        ext = mimetypes.guess_extension(ct) or ""
        if ext == ".jpe": ext = ".jpg"
        return ext or None, ct
    return None, None


def image_dimensions(data: bytes, ext: str | None) -> tuple[int | None, int | None]:
    try:
        if ext == ".png" and len(data) >= 24:
            return struct.unpack(">II", data[16:24])
        if ext == ".gif" and len(data) >= 10:
            return struct.unpack("<HH", data[6:10])
        if ext == ".webp" and len(data) >= 30 and data[12:16] == b"VP8X":
            w = 1 + int.from_bytes(data[24:27], "little")
            h = 1 + int.from_bytes(data[27:30], "little")
            return w, h
        if ext == ".jpg":
            i = 2
            while i + 9 < len(data):
                if data[i] != 0xFF:
                    i += 1; continue
                marker = data[i + 1]; i += 2
                if marker in {0xD8, 0xD9}: continue
                if i + 2 > len(data): break
                seglen = int.from_bytes(data[i:i+2], "big")
                if marker in range(0xC0, 0xC4) and i + 7 <= len(data):
                    h = int.from_bytes(data[i+3:i+5], "big")
                    w = int.from_bytes(data[i+5:i+7], "big")
                    return w, h
                i += max(seglen, 2)
    except Exception:
        pass
    return None, None


def sanitize_filename(name: str) -> str:
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name).strip().strip(".")
    return name or "image"


def discover_candidates(source_page: str, timeout: int, retries: int) -> list[dict[str, str | int]]:
    data, hdrs, final_url = request_bytes(source_page, referer=None, timeout=timeout, retries=retries, max_bytes=5 * 1024 * 1024, accept="text/html,application/xhtml+xml")
    charset = "utf-8"
    m = re.search(r"charset=([\w-]+)", hdrs.get("content-type", ""), re.I)
    if m: charset = m.group(1)
    text = data.decode(charset, errors="replace")
    parser = ImageCandidateParser(final_url); parser.feed(text)
    dedup: dict[str, tuple[int, str]] = {}
    for score, url, reason in parser.candidates:
        old = dedup.get(url)
        if old is None or score > old[0]: dedup[url] = (score, reason)
    ranked = sorted(({"score": score, "url": url, "reason": reason} for url, (score, reason) in dedup.items()), key=lambda x: (-int(x["score"]), str(x["url"])))
    return ranked[:30]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("manifest")
    ap.add_argument("--vault-root", default=".")
    ap.add_argument("--timeout", type=int, default=20)
    ap.add_argument("--retries", type=int, default=2)
    ap.add_argument("--max-bytes", type=int, default=MAX_BYTES_DEFAULT)
    ap.add_argument("--min-width", type=int, default=480)
    args = ap.parse_args()
    vault = Path(args.vault_root).resolve()
    manifest_path = (vault / args.manifest).resolve()
    payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    failures = 0; downloaded = 0; discovered = 0
    for asset in payload.get("assets", []):
        aid = str(asset.get("id", "?")); required = bool(asset.get("required", True))
        source_page = asset.get("source_page"); image_url = asset.get("image_url")
        referer = asset.get("referer") or source_page
        filename = asset.get("filename"); target_dir_raw = asset.get("target_dir")
        if not image_url:
            if not source_page:
                print(f"[{aid}] BLOCKED: missing image_url and source_page"); failures += int(required); continue
            try:
                candidates = discover_candidates(source_page, args.timeout, args.retries)
                discovered += 1; failures += int(required)
                print(f"[{aid}] DISCOVERED {len(candidates)} candidates from {source_page}")
                for c in candidates: print(f"  - score={c['score']} {c['reason']}: {c['url']}")
                print(f"[{aid}] ACTION: choose a verified candidate and set image_url; no automatic guess was made.")
            except Exception as exc:
                print(f"[{aid}] BLOCKED discovery: {exc}", file=sys.stderr); failures += int(required)
            continue
        if not filename or not target_dir_raw:
            print(f"[{aid}] BLOCKED: filename and target_dir are required", file=sys.stderr); failures += int(required); continue
        try:
            data, hdrs, final_url = request_bytes(image_url, referer=referer, timeout=args.timeout, retries=args.retries, max_bytes=args.max_bytes, accept="image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")
            ext, mime = detect_image_type(data, hdrs.get("content-type", ""))
            if not ext: raise ValueError(f"response is not a recognized image (content-type={hdrs.get('content-type')})")
            target_dir = (vault / target_dir_raw).resolve(); safe_name = sanitize_filename(filename)
            suffix = Path(safe_name).suffix.lower()
            if suffix not in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}: safe_name += ext
            elif suffix != ext and not (suffix == ".jpeg" and ext == ".jpg"): safe_name = str(Path(safe_name).with_suffix(ext))
            asset_path = target_dir / safe_name
            w, h = image_dimensions(data, ext); dim = f"{w}x{h}" if w and h else "unknown-dimensions"
            if w and w < args.min_width: print(f"[{aid}] WARNING: low raster width {w}px < {args.min_width}px")
            target_dir.mkdir(parents=True, exist_ok=True); asset_path.write_bytes(data)
            downloaded += 1
            print(f"[{aid}] VERIFIED {mime} {len(data)} bytes {dim} -> {asset_path.relative_to(vault)} (final_url={final_url})")
        except (urllib.error.URLError, urllib.error.HTTPError, OSError, ValueError) as exc:
            print(f"[{aid}] BLOCKED: {exc}", file=sys.stderr); failures += int(required)
    print(f"SUMMARY downloaded={downloaded} discovery_only={discovered} required_failures={failures}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
