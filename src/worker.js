const SESSION_COOKIE = 'learning_paw_session';
const STATE_COOKIE = 'learning_paw_oauth_state';
const SESSION_TTL_SECONDS = 24 * 60 * 60;
const STATE_TTL_SECONDS = 10 * 60;

const encoder = new TextEncoder();

export default {
  async fetch(request, env) {
    const configError = validateConfig(env);
    if (configError) return privateError(503, configError);

    const url = new URL(request.url);

    if (url.pathname === '/auth/login') {
      return beginLogin(request, env);
    }
    if (url.pathname === '/auth/callback') {
      return finishLogin(request, env);
    }
    if (url.pathname === '/auth/logout') {
      return logoutResponse(url.origin);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return privateError(405, 'Method not allowed.');
    }

    const session = await readSession(request, env);
    if (!session) {
      const returnTo = `${url.pathname}${url.search}`;
      const loginUrl = new URL('/auth/login', url.origin);
      loginUrl.searchParams.set('return', returnTo);
      return redirect(loginUrl.toString());
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    headers.set('Cache-Control', 'private, no-cache');
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    headers.set('Referrer-Policy', 'same-origin');

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};

function validateConfig(env) {
  const required = [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'ALLOWED_GITHUB_USER_ID',
    'SESSION_SECRET',
  ];
  const missing = required.filter(name => !env[name]);
  return missing.length ? 'Private access is not configured.' : '';
}

async function beginLogin(request, env) {
  const url = new URL(request.url);
  const returnTo = sanitizeReturnTo(url.searchParams.get('return'));
  const nonce = randomToken(24);
  const expiresAt = Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS;
  const returnToken = toBase64Url(encoder.encode(returnTo));
  const unsignedState = `${nonce}.${returnToken}.${expiresAt}`;
  const signature = await sign(unsignedState, env.SESSION_SECRET);

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback`);
  authorizeUrl.searchParams.set('state', nonce);
  authorizeUrl.searchParams.set('allow_signup', 'false');

  return redirect(authorizeUrl.toString(), [
    cookie(STATE_COOKIE, `${unsignedState}.${signature}`, STATE_TTL_SECONDS),
  ]);
}

async function finishLogin(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedNonce = url.searchParams.get('state');
  const stateCookie = getCookie(request, STATE_COOKIE);
  const state = await verifyState(stateCookie, returnedNonce, env.SESSION_SECRET);

  if (!code || !state) {
    return privateError(401, 'The sign-in request is invalid or expired.');
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'learning-paw-auth',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/auth/callback`,
    }),
  });
  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  const accessToken = tokenPayload.access_token;
  if (!tokenResponse.ok || !accessToken) {
    return privateError(401, 'GitHub sign-in could not be completed.');
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'learning-paw-auth',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  const user = await userResponse.json().catch(() => ({}));
  if (!userResponse.ok || String(user.id) !== String(env.ALLOWED_GITHUB_USER_ID)) {
    return privateError(403, 'This GitHub account is not allowed.');
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = toBase64Url(encoder.encode(JSON.stringify({
    sub: String(user.id),
    exp: expiresAt,
  })));
  const signature = await sign(payload, env.SESSION_SECRET);

  return redirect(`${url.origin}${state.returnTo}`, [
    cookie(STATE_COOKIE, '', 0),
    cookie(SESSION_COOKIE, `${payload}.${signature}`, SESSION_TTL_SECONDS),
  ]);
}

async function readSession(request, env) {
  const value = getCookie(request, SESSION_COOKIE);
  if (!value) return null;
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra) return null;
  if (!await verify(payload, signature, env.SESSION_SECRET)) return null;

  try {
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    const now = Math.floor(Date.now() / 1000);
    if (session.exp <= now) return null;
    if (String(session.sub) !== String(env.ALLOWED_GITHUB_USER_ID)) return null;
    return session;
  } catch {
    return null;
  }
}

async function verifyState(value, returnedNonce, secret) {
  if (!value || !returnedNonce) return null;
  const parts = value.split('.');
  if (parts.length !== 4) return null;
  const [nonce, returnToken, expiresAtText, signature] = parts;
  if (!constantTimeEqual(nonce, returnedNonce)) return null;
  const unsignedState = `${nonce}.${returnToken}.${expiresAtText}`;
  if (!await verify(unsignedState, signature, secret)) return null;
  const expiresAt = Number(expiresAtText);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null;

  try {
    const returnTo = sanitizeReturnTo(new TextDecoder().decode(fromBase64Url(returnToken)));
    return { returnTo };
  } catch {
    return null;
  }
}

function sanitizeReturnTo(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/auth/')) {
    return '/';
  }
  return value;
}

function logoutResponse(origin) {
  return redirect(`${origin}/auth/login`, [cookie(SESSION_COOKIE, '', 0)]);
}

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function redirect(location, cookies = []) {
  const headers = new Headers({
    Location: location,
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  });
  for (const value of cookies) headers.append('Set-Cookie', value);
  return new Response(null, { status: 302, headers });
}

function privateError(status, message) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

function randomToken(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function verify(value, signature, secret) {
  const expected = await sign(value, secret);
  return constantTimeEqual(expected, signature);
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function fromBase64Url(value) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}
