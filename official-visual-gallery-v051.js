const officialVisuals = [
  {
    name: 'HUAWEI Mate 80',
    local: './assets/official/mate80_official_hero.png',
    remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/mate80/list/green.png',
    source: 'https://consumer.huawei.com/cn/phones/mate80/',
    focus: 'Mate 系列直板旗舰设计、后摄 Deco 与高端商务产品识别',
  },
  {
    name: 'HUAWEI Pura 80',
    local: './assets/official/pura80_official_hero.png',
    remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura80/list/velvet-gold.png',
    source: 'https://consumer.huawei.com/cn/phones/pura80/',
    focus: 'Pura 系列影像与设计语言、机身配色和后摄辨识',
  },
  {
    name: 'HUAWEI nova 16',
    local: './assets/official/nova16_official_hero.png',
    remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/nova16/list/blue.png',
    source: 'https://consumer.huawei.com/cn/phones/nova16/',
    focus: 'nova 系列年轻化设计、人像与潮流产品线识别',
  },
  {
    name: 'HUAWEI 畅享 90',
    local: './assets/official/changxiang90_official_hero.png',
    remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/changxiang-90/list/black.png',
    source: 'https://consumer.huawei.com/cn/phones/changxiang-90/',
    focus: '畅享系列大众产品定位、外观与基础产品线识别',
  },
  {
    name: 'HUAWEI Mate X7',
    local: './assets/official/matex7_official_hero.png',
    remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/mate-x7/list/white.png',
    source: 'https://consumer.huawei.com/cn/phones/mate-x7/',
    focus: '折叠形态、Mate X 系列轮廓与折叠旗舰识别',
  },
];

function isPhoneDomain() {
  return document.querySelector('#domainName')?.textContent?.trim() === '手机产品专家';
}

function ensureStyle() {
  if (document.querySelector('#officialVisualGalleryStyles')) return;
  const style = document.createElement('style');
  style.id = 'officialVisualGalleryStyles';
  style.textContent = `
    .official-visual-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
    .official-visual-item { overflow:hidden; border:1px solid #e4e7ec; border-radius:18px; background:#f8f9fb; }
    .official-visual-image-wrap { aspect-ratio:1/1; display:grid; place-items:center; padding:14px; background:#fff; }
    .official-visual-image { width:100%; height:100%; object-fit:contain; display:block; }
    .official-visual-copy { padding:13px; display:grid; gap:7px; }
    .official-visual-copy strong { font-size:14px; }
    .official-visual-copy p { margin:0; color:#667085; font-size:11px; line-height:1.55; }
    .official-visual-source { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .official-visual-source span { font-size:10px; color:#667085; }
    .official-visual-source a { text-decoration:none; font-size:11px; font-weight:750; padding:7px 9px; border-radius:10px; background:#111827; color:#fff; }
    .official-visual-note { margin:0 0 12px; color:#667085; font-size:12px; line-height:1.6; }
    @media (max-width:720px) {
      .official-visual-grid { grid-template-columns:1fr; }
      .official-visual-item { display:grid; grid-template-columns:42% 1fr; align-items:stretch; }
      .official-visual-image-wrap { aspect-ratio:auto; min-height:150px; }
      .official-visual-copy { align-content:center; }
    }
    @media (prefers-color-scheme:dark) {
      .official-visual-item { background:#242932; border-color:#303640; }
      .official-visual-image-wrap { background:#fff; }
      .official-visual-copy p, .official-visual-source span, .official-visual-note { color:#aab2bf; }
      .official-visual-source a { background:#f3f4f6; color:#111827; }
    }
  `;
  document.head.append(style);
}

function buildGallery() {
  const list = document.querySelector('#visualSourceList');
  const card = document.querySelector('#visualCard');
  if (!list || !card || !isPhoneDomain()) return;
  if (list.dataset.officialGallery === '1') return;

  list.dataset.officialGallery = '1';
  list.innerHTML = '';

  const note = document.createElement('p');
  note.className = 'official-visual-note';
  note.textContent = '覆盖 Mate、Pura、nova、畅享与折叠五类产品线。以下均为华为官网已核验产品图，不使用 AI 生成外观；优先读取本地 assets，官网 CDN 仅作兜底。';
  list.append(note);

  const grid = document.createElement('div');
  grid.className = 'official-visual-grid';

  officialVisuals.forEach(item => {
    const article = document.createElement('article');
    article.className = 'official-visual-item';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'official-visual-image-wrap';
    const img = document.createElement('img');
    img.className = 'official-visual-image';
    img.src = item.local;
    img.alt = `${item.name} 华为官方产品图`;
    img.loading = 'lazy';
    img.dataset.fallback = '0';
    img.addEventListener('error', () => {
      if (img.dataset.fallback === '1') return;
      img.dataset.fallback = '1';
      img.src = item.remote;
    });
    imageWrap.append(img);

    const copy = document.createElement('div');
    copy.className = 'official-visual-copy';
    const name = document.createElement('strong');
    name.textContent = item.name;
    const focus = document.createElement('p');
    focus.textContent = item.focus;
    const source = document.createElement('div');
    source.className = 'official-visual-source';
    const label = document.createElement('span');
    label.textContent = '来源：华为官网';
    const link = document.createElement('a');
    link.href = item.source;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '官方页';
    source.append(label, link);
    copy.append(name, focus, source);
    article.append(imageWrap, copy);
    grid.append(article);
  });

  list.append(grid);
}

function resetAndBuild() {
  const list = document.querySelector('#visualSourceList');
  if (!list) return;
  if (!isPhoneDomain()) {
    delete list.dataset.officialGallery;
    return;
  }
  if (!list.dataset.officialGallery) buildGallery();
}

ensureStyle();
queueMicrotask(resetAndBuild);

const domainName = document.querySelector('#domainName');
if (domainName) {
  new MutationObserver(() => {
    const list = document.querySelector('#visualSourceList');
    if (list) delete list.dataset.officialGallery;
    window.setTimeout(resetAndBuild, 0);
  }).observe(domainName, { childList:true, subtree:true, characterData:true });
}

const list = document.querySelector('#visualSourceList');
if (list) {
  new MutationObserver(() => {
    if (!isPhoneDomain()) return;
    if (!list.dataset.officialGallery) window.setTimeout(resetAndBuild, 0);
  }).observe(list, { childList:true });
}
