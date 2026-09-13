const STORAGE_KEY = 'personal-learning-os:v0.1';

const portfolioVisuals = [
  ['Mate 80', './assets/official/mate80_official_hero.png', '高端旗舰 / 商务旗舰', 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/mate80/list/green.png'],
  ['Pura 90', './assets/official/pura90/pura90_roland-purple.png', '影像 / 设计 / 时尚表达', 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/pura90/img/design/design-color-phone-1.png'],
  ['nova 16', './assets/official/nova16_official_hero.png', '年轻 / 人像 / 潮流社交', 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/nova16/list/blue.png'],
  ['畅享 90', './assets/official/changxiang90_official_hero.png', '大众 / 务实 / 易用', 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/changxiang-90/list/black.png'],
  ['Mate X7', './assets/official/matex7_official_hero.png', '折叠旗舰 / 高端创新', 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/mate-x7/list/white.png'],
];

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
  if (document.querySelector('#lessonOfficialVisualStyles')) return;
  const style = document.createElement('style');
  style.id = 'lessonOfficialVisualStyles';
  style.textContent = `
    .lesson-official-visuals { padding:18px 0; border-top:1px solid #e8ebef; }
    .lesson-official-visuals h3 { margin:0 0 6px; font-size:19px; }
    .lesson-official-visuals > p { margin:0 0 12px; color:#667085; font-size:12px; line-height:1.6; }
    .lesson-official-visual-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; }
    .lesson-official-visual-card { overflow:hidden; border-radius:14px; border:1px solid #e4e7ec; background:#f8f9fb; }
    .lesson-official-visual-card img { display:block; width:100%; aspect-ratio:1/1.18; object-fit:contain; padding:8px; background:#fff; }
    .lesson-official-visual-card div { padding:9px; }
    .lesson-official-visual-card strong { display:block; font-size:12px; margin-bottom:3px; }
    .lesson-official-visual-card span { display:block; font-size:9px; color:#667085; line-height:1.4; }
    @media (max-width:720px) {
      .lesson-official-visual-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .lesson-official-visual-card:last-child { grid-column:1 / -1; display:grid; grid-template-columns:42% 1fr; align-items:center; }
      .lesson-official-visual-card:last-child img { aspect-ratio:1/1; }
      .lesson-official-visual-card strong { font-size:13px; }
      .lesson-official-visual-card span { font-size:10px; }
    }
    @media (prefers-color-scheme:dark) {
      .lesson-official-visuals { border-color:#303640; }
      .lesson-official-visuals > p, .lesson-official-visual-card span { color:#aab2bf; }
      .lesson-official-visual-card { background:#242932; border-color:#303640; }
    }
  `;
  document.head.append(style);
}

function inject() {
  if (currentPhoneLessonId() !== 'phone-portfolio') return;
  const body = document.querySelector('#lessonReaderBody');
  if (!body || body.querySelector('.lesson-official-visuals')) return;
  const title = body.querySelector('#lessonReaderTitle');
  if (!title || !title.textContent.includes('产品组合')) return;

  const section = document.createElement('section');
  section.className = 'lesson-official-visuals';
  const heading = document.createElement('h3');
  heading.textContent = '先看真实产品：五条产品线长什么样';
  const note = document.createElement('p');
  note.textContent = '全部使用华为官网已核验的当前产品图。先形成产品线视觉印象，再理解它们为什么承担不同业务角色。Pura 已更新为当前 Pura 90 系列。';
  const grid = document.createElement('div');
  grid.className = 'lesson-official-visual-grid';
  portfolioVisuals.forEach(([name, src, role, fallback]) => {
    const card = document.createElement('article');
    card.className = 'lesson-official-visual-card';
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${name} 华为官方产品图`;
    img.loading = 'lazy';
    img.dataset.fallback = '0';
    img.addEventListener('error', () => {
      if (img.dataset.fallback === '1') return;
      img.dataset.fallback = '1';
      img.src = fallback;
    });
    const copy = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = name;
    const span = document.createElement('span');
    span.textContent = role;
    copy.append(strong, span);
    card.append(img, copy);
    grid.append(card);
  });
  section.append(heading, note, grid);

  const intro = body.querySelector('.lesson-reader-intro');
  if (intro) intro.after(section);
  else title.after(section);
}

ensureStyles();
const body = document.querySelector('#lessonReaderBody');
if (body) new MutationObserver(() => queueMicrotask(inject)).observe(body, { childList:true, subtree:true });
document.addEventListener('click', event => {
  if (event.target.closest('#openLessonReaderBtn')) window.setTimeout(inject, 0);
});
