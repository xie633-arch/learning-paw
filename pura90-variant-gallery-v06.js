const STORAGE_KEY = 'personal-learning-os:v0.1';

const family = {
  name: 'HUAWEI Pura 90 系列',
  note: '型号与配色均以华为中国官网当前公开信息为准。若未来新增 Ultra 等型号，只需扩展同一 Variant 数据结构，不在当前系列中虚构不存在的型号。',
  models: [
    {
      id: 'pura90',
      name: 'Pura 90',
      positioning: '标准旗舰｜轻薄、影像与长续航',
      source: 'https://consumer.huawei.com/cn/phones/pura90/',
      colors: [
        { name: '罗兰紫', swatch: '#777aa0', local: './assets/official/pura90/pura90_roland-purple.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90/img/design/design-color-phone-1.png' },
        { name: '雪域白', swatch: '#f4f3ef', local: './assets/official/pura90/pura90_snow-white.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90/img/design/design-color-phone-2.png' },
        { name: '丝绒黑', swatch: '#262626', local: './assets/official/pura90/pura90_velvet-black.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90/img/design/design-color-phone-3.png' },
      ],
    },
    {
      id: 'pura90-pro',
      name: 'Pura 90 Pro',
      positioning: 'Pro 旗舰｜更强影像与微距长焦',
      source: 'https://consumer.huawei.com/cn/phones/pura90-pro/',
      colors: [
        { name: '粉红芭乐', swatch: '#e99a9e', local: './assets/official/pura90/pura90pro_pink-guava.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90-pro/img/design/design-color-phone-1.png' },
        { name: '橘子汽水', swatch: '#efa46e', local: './assets/official/pura90/pura90pro_orange-soda.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90-pro/img/design/design-color-phone-2.png' },
        { name: '椰青白', swatch: '#f2f0e6', local: './assets/official/pura90/pura90pro_coconut-white.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90-pro/img/design/design-color-phone-3.png' },
        { name: '桑果黑', swatch: '#4d4b4b', local: './assets/official/pura90/pura90pro_mulberry-black.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90-pro/img/design/design-color-phone-4.png' },
      ],
    },
    {
      id: 'pura90-pro-max',
      name: 'Pura 90 Pro Max',
      positioning: '顶配旗舰｜2 亿长焦与更大屏旗舰体验',
      source: 'https://consumer.huawei.com/cn/phones/pura90-pro-max/',
      colors: [
        { name: '橘子海', swatch: '#f27d4b', local: './assets/official/pura90/pura90promax_orange-sea.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90-pro-max/img/design/design-color-1.jpg' },
        { name: '霞光紫', swatch: '#8373d1', local: './assets/official/pura90/pura90promax_glow-purple.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90-pro-max/img/design/design-color-2.jpg' },
        { name: '翡翠湖', swatch: '#768668', local: './assets/official/pura90/pura90promax_jade-lake.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90-pro-max/img/design/design-color-3.jpg' },
        { name: '晨曦金', swatch: '#dfc9a2', local: './assets/official/pura90/pura90promax_dawn-gold.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90-pro-max/img/design/design-color-4.jpg' },
        { name: '曜石黑', swatch: '#232323', local: './assets/official/pura90/pura90promax_obsidian-black.png', remote: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90-pro-max/img/design/design-color-5.jpg' },
      ],
    },
  ],
};

function currentPhoneLessonId() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (state?.preferences?.lastDomain !== 'phone') return null;
    const order = ['phone-portfolio','phone-tech','phone-os','phone-user','phone-competition','phone-retail','phone-launch','phone-review'];
    return order.find(id => !state?.lessonProgress?.[id]) || null;
  } catch {
    return null;
  }
}

function ensureStyles() {
  if (document.querySelector('#pura90VariantGalleryStyles')) return;
  const style = document.createElement('style');
  style.id = 'pura90VariantGalleryStyles';
  style.textContent = `
    .variant-gallery-section { padding:20px 0; border-top:1px solid #e8ebef; }
    .variant-gallery-head { display:grid; gap:5px; margin-bottom:14px; }
    .variant-gallery-head h3 { margin:0; font-size:20px; }
    .variant-gallery-head p { margin:0; color:#667085; font-size:12px; line-height:1.65; }
    .variant-model-tabs { display:flex; gap:8px; overflow-x:auto; padding:2px 1px 8px; scrollbar-width:none; }
    .variant-model-tabs::-webkit-scrollbar { display:none; }
    .variant-model-btn { flex:0 0 auto; min-height:42px; padding:9px 13px; border:1px solid #d9dee7; border-radius:999px; background:#fff; color:#344054; font-size:12px; font-weight:800; }
    .variant-model-btn[aria-pressed='true'] { background:#111827; color:#fff; border-color:#111827; }
    .variant-gallery-stage { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(220px,.8fr); gap:16px; align-items:stretch; margin-top:6px; }
    .variant-hero { min-height:360px; border:1px solid #e4e7ec; border-radius:20px; background:#fff; display:grid; place-items:center; overflow:hidden; }
    .variant-hero img { width:100%; height:100%; max-height:460px; object-fit:contain; display:block; padding:12px; }
    .variant-side { border:1px solid #e4e7ec; border-radius:20px; padding:16px; background:#f8f9fb; display:flex; flex-direction:column; gap:14px; }
    .variant-side h4 { margin:0; font-size:22px; }
    .variant-positioning { margin:-7px 0 0; color:#667085; font-size:12px; line-height:1.5; }
    .variant-color-label { display:flex; justify-content:space-between; gap:10px; font-size:12px; color:#667085; }
    .variant-color-label strong { color:#111827; }
    .variant-color-list { display:flex; flex-wrap:wrap; gap:9px; }
    .variant-color-btn { display:flex; align-items:center; gap:7px; min-height:40px; padding:8px 10px; border:1px solid #d7dce5; border-radius:12px; background:#fff; color:#344054; font-size:11px; font-weight:750; }
    .variant-color-btn[aria-pressed='true'] { border-color:#111827; box-shadow:inset 0 0 0 1px #111827; }
    .variant-color-dot { width:18px; height:18px; border-radius:50%; border:1px solid rgba(17,24,39,.16); box-shadow:0 0 0 2px #fff inset; }
    .variant-thumbs { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:7px; margin-top:auto; }
    .variant-thumb { min-width:0; padding:4px; aspect-ratio:1/1; border:1px solid #dde1e8; border-radius:10px; background:#fff; overflow:hidden; }
    .variant-thumb img { width:100%; height:100%; object-fit:contain; }
    .variant-thumb[aria-pressed='true'] { border-color:#111827; box-shadow:inset 0 0 0 1px #111827; }
    .variant-source-link { margin-top:2px; text-decoration:none; text-align:center; min-height:40px; display:grid; place-items:center; border-radius:12px; background:#edf0f4; color:#344054; font-size:11px; font-weight:800; }
    @media (max-width:720px) {
      .variant-gallery-stage { grid-template-columns:1fr; }
      .variant-hero { min-height:330px; }
      .variant-hero img { max-height:420px; padding:8px; }
      .variant-side { padding:14px; }
      .variant-side h4 { font-size:20px; }
      .variant-model-btn { min-height:40px; }
    }
    @media (prefers-color-scheme:dark) {
      .variant-gallery-section { border-color:#303640; }
      .variant-gallery-head p, .variant-positioning, .variant-color-label { color:#aab2bf; }
      .variant-hero { background:#fff; border-color:#303640; }
      .variant-side { background:#242932; border-color:#303640; }
      .variant-side h4, .variant-color-label strong { color:#f3f4f6; }
      .variant-model-btn, .variant-color-btn, .variant-thumb { background:#181c22; color:#d7dce5; border-color:#3a4049; }
      .variant-model-btn[aria-pressed='true'] { background:#f3f4f6; color:#111827; border-color:#f3f4f6; }
      .variant-color-btn[aria-pressed='true'], .variant-thumb[aria-pressed='true'] { border-color:#f3f4f6; box-shadow:inset 0 0 0 1px #f3f4f6; }
      .variant-source-link { background:#303640; color:#e6e9ee; }
    }
  `;
  document.head.append(style);
}

function makeImage(source, alt) {
  const img = document.createElement('img');
  img.src = source.local;
  img.alt = alt;
  img.loading = 'lazy';
  img.dataset.fallback = '0';
  img.addEventListener('error', () => {
    if (img.dataset.fallback === '1') return;
    img.dataset.fallback = '1';
    img.src = source.remote;
  });
  return img;
}

function renderGallery(section) {
  let modelIndex = 0;
  let colorIndex = 0;
  const tabs = section.querySelector('.variant-model-tabs');
  const hero = section.querySelector('.variant-hero');
  const side = section.querySelector('.variant-side');

  function draw() {
    const model = family.models[modelIndex];
    const color = model.colors[colorIndex] || model.colors[0];
    tabs.innerHTML = '';
    family.models.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'variant-model-btn';
      button.textContent = item.name;
      button.setAttribute('aria-pressed', String(index === modelIndex));
      button.addEventListener('click', () => { modelIndex = index; colorIndex = 0; draw(); });
      tabs.append(button);
    });

    hero.innerHTML = '';
    hero.append(makeImage(color, `${model.name} ${color.name} 华为官方产品图`));
    side.innerHTML = '';
    const title = document.createElement('h4');
    title.textContent = model.name;
    const positioning = document.createElement('p');
    positioning.className = 'variant-positioning';
    positioning.textContent = model.positioning;
    const label = document.createElement('div');
    label.className = 'variant-color-label';
    label.innerHTML = `<span>选择颜色</span><strong>${color.name}</strong>`;
    const colorList = document.createElement('div');
    colorList.className = 'variant-color-list';
    model.colors.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'variant-color-btn';
      button.setAttribute('aria-pressed', String(index === colorIndex));
      const dot = document.createElement('span');
      dot.className = 'variant-color-dot';
      dot.style.background = item.swatch;
      const text = document.createElement('span');
      text.textContent = item.name;
      button.append(dot, text);
      button.addEventListener('click', () => { colorIndex = index; draw(); });
      colorList.append(button);
    });
    const thumbs = document.createElement('div');
    thumbs.className = 'variant-thumbs';
    model.colors.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'variant-thumb';
      button.setAttribute('aria-label', `${model.name} ${item.name}`);
      button.setAttribute('aria-pressed', String(index === colorIndex));
      button.append(makeImage(item, `${model.name} ${item.name} 缩略图`));
      button.addEventListener('click', () => { colorIndex = index; draw(); });
      thumbs.append(button);
    });
    const source = document.createElement('a');
    source.className = 'variant-source-link';
    source.href = model.source;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = '查看华为官网当前型号';
    side.append(title, positioning, label, colorList, thumbs, source);
  }
  draw();
}

function inject() {
  if (currentPhoneLessonId() !== 'phone-portfolio') return;
  const body = document.querySelector('#lessonReaderBody');
  if (!body || body.querySelector('.variant-gallery-section')) return;
  const title = body.querySelector('#lessonReaderTitle');
  if (!title || !title.textContent.includes('产品组合')) return;
  const section = document.createElement('section');
  section.className = 'variant-gallery-section';
  section.innerHTML = `
    <div class="variant-gallery-head">
      <p class="eyebrow">PRODUCT FAMILY SELECTOR</p>
      <h3>${family.name}｜型号 × 配色</h3>
      <p>${family.note}</p>
    </div>
    <div class="variant-model-tabs" role="group" aria-label="Pura 90 型号选择"></div>
    <div class="variant-gallery-stage">
      <div class="variant-hero"></div>
      <div class="variant-side"></div>
    </div>
  `;
  const existingVisuals = body.querySelector('.lesson-official-visuals');
  if (existingVisuals) existingVisuals.after(section);
  else {
    const intro = body.querySelector('.lesson-reader-intro');
    if (intro) intro.after(section);
    else title.after(section);
  }
  renderGallery(section);
}

ensureStyles();
const body = document.querySelector('#lessonReaderBody');
if (body) new MutationObserver(() => queueMicrotask(inject)).observe(body, { childList:true, subtree:true });
document.addEventListener('click', event => {
  if (event.target.closest('#openLessonReaderBtn')) window.setTimeout(inject, 0);
});
