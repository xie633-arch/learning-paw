import { curricula } from './platform-data.js';
import { lessonContentById } from './lesson-content-v05.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const DOMAIN_LABELS = {
  phone: '手机产品专家',
  retail: '商圈与零售',
  industry: '行业与商业',
  korean: '韩语',
};

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function selectedDomainId() {
  const state = readState();
  if (state?.preferences?.lastDomain) return state.preferences.lastDomain;
  const name = document.querySelector('#domainName')?.textContent?.trim();
  return Object.entries(DOMAIN_LABELS).find(([, label]) => label === name)?.[0] || 'phone';
}

function currentLesson() {
  const domainId = selectedDomainId();
  const curriculum = curricula[domainId];
  if (!curriculum) return { domainId, curriculum: null, step: null };
  const progress = readState().lessonProgress || {};
  const step = (curriculum.steps || []).find(item => !progress[item.id]) || null;
  return { domainId, curriculum, step };
}

function ensureStyles() {
  if (document.querySelector('#learningUiV05Styles')) return;
  const style = document.createElement('style');
  style.id = 'learningUiV05Styles';
  style.textContent = `
    .lesson-reader-overlay {
      position: fixed; inset: 0; z-index: 1000; background: rgba(17,24,39,.42);
      display: grid; place-items: center; padding: 18px;
    }
    .lesson-reader-panel {
      width: min(820px, 100%); max-height: min(88vh, 920px); overflow: auto;
      background: #fff; color: #111827; border-radius: 26px; padding: 24px;
      box-shadow: 0 26px 80px rgba(17,24,39,.25); -webkit-overflow-scrolling: touch;
    }
    .lesson-reader-top { display:flex; align-items:center; justify-content:space-between; gap:12px; position:sticky; top:-24px; padding:18px 0 12px; background:#fff; z-index:2; }
    .lesson-reader-top button { flex:0 0 auto; }
    .lesson-reader-title { margin:4px 0 8px; font-size:clamp(28px,5vw,40px); line-height:1.2; letter-spacing:-.03em; }
    .lesson-reader-summary { margin:0 0 18px; font-size:16px; line-height:1.7; color:#697386; }
    .lesson-reader-intro { padding:16px 18px; margin:0 0 18px; border-radius:18px; background:#f4f6f8; line-height:1.75; }
    .lesson-section { padding:18px 0; border-top:1px solid #e8ebef; }
    .lesson-section h3 { margin:0 0 10px; font-size:19px; }
    .lesson-section p { margin:7px 0; color:#475467; line-height:1.78; }
    .lesson-section ul { margin:8px 0 0; padding-left:22px; }
    .lesson-section li { margin:8px 0; color:#344054; line-height:1.68; }
    .lesson-checkpoint { margin:8px 0 20px; padding:16px 18px; border-radius:18px; background:#eef7f0; color:#28543a; line-height:1.7; }
    .lesson-task-box { display:grid; gap:12px; padding:18px; border-radius:18px; background:#f7f8fa; margin:18px 0; }
    .lesson-task-box p { margin:4px 0 0; line-height:1.7; }
    .lesson-reader-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; position:sticky; bottom:-24px; padding:14px 0 2px; background:linear-gradient(180deg,rgba(255,255,255,0),#fff 30%); }
    .mobile-bottom-nav { display:none; }
    #openLessonReaderBtn { min-height:52px; }
    body.lesson-reader-open { overflow:hidden; }

    @media (max-width: 720px) {
      .app-shell { padding-bottom: calc(92px + env(safe-area-inset-bottom)) !important; }
      .domain-grid {
        display:flex !important; overflow-x:auto; gap:10px; scroll-snap-type:x mandatory;
        padding:2px 2px 10px; margin-right:-18px; -webkit-overflow-scrolling:touch;
      }
      .domain-grid::-webkit-scrollbar { display:none; }
      .domain-choice { min-width:min(82vw, 330px); flex:0 0 auto; scroll-snap-align:start; }
      .mobile-bottom-nav {
        position:fixed; left:12px; right:12px; bottom:max(10px, env(safe-area-inset-bottom)); z-index:900;
        display:grid; grid-template-columns:repeat(5,1fr); gap:4px; padding:8px;
        border:1px solid rgba(17,24,39,.08); border-radius:22px;
        background:rgba(255,255,255,.94); box-shadow:0 14px 44px rgba(17,24,39,.16);
        backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
      }
      .mobile-bottom-nav button {
        min-width:0; padding:7px 2px; border-radius:14px; background:transparent; color:#667085;
        display:flex; flex-direction:column; align-items:center; gap:3px; font-size:10px; font-weight:700;
      }
      .mobile-bottom-nav button span:first-child { font-size:19px; line-height:1; }
      .mobile-bottom-nav button.active { background:#111827; color:#fff; }
      .lesson-reader-overlay { padding:0; place-items:stretch; background:#fff; }
      .lesson-reader-panel { width:100%; max-height:none; height:100%; border-radius:0; padding:20px 18px calc(22px + env(safe-area-inset-bottom)); }
      .lesson-reader-top { top:-20px; padding-top:max(18px, env(safe-area-inset-top)); }
      .lesson-reader-actions { grid-template-columns:1fr; bottom:calc(-22px - env(safe-area-inset-bottom)); padding-bottom:calc(12px + env(safe-area-inset-bottom)); }
      .focus-card .button-row { display:grid; grid-template-columns:1fr; }
    }

    @media (prefers-color-scheme: dark) {
      .lesson-reader-overlay { background:rgba(0,0,0,.72); }
      .lesson-reader-panel, .lesson-reader-top { background:#181c22; color:#f3f4f6; }
      .lesson-reader-summary, .lesson-section p, .lesson-section li { color:#aab2bf; }
      .lesson-reader-intro, .lesson-task-box { background:#242932; }
      .lesson-section { border-color:#303640; }
      .lesson-checkpoint { background:#203329; color:#a9dbb7; }
      .lesson-reader-actions { background:linear-gradient(180deg,rgba(24,28,34,0),#181c22 30%); }
      .mobile-bottom-nav { background:rgba(24,28,34,.94); border-color:#303640; }
      .mobile-bottom-nav button { color:#aab2bf; }
      .mobile-bottom-nav button.active { background:#f3f4f6; color:#111827; }
    }
  `;
  document.head.append(style);
}

function ensureReader() {
  let overlay = document.querySelector('#lessonReaderOverlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'lessonReaderOverlay';
  overlay.className = 'lesson-reader-overlay hidden';
  overlay.innerHTML = `
    <article class="lesson-reader-panel" role="dialog" aria-modal="true" aria-labelledby="lessonReaderTitle">
      <div class="lesson-reader-top">
        <div>
          <p class="eyebrow" id="lessonReaderEyebrow">TODAY LESSON</p>
        </div>
        <button id="closeLessonReaderBtn" class="ghost" type="button">关闭</button>
      </div>
      <div id="lessonReaderBody"></div>
    </article>
  `;
  document.body.append(overlay);
  overlay.querySelector('#closeLessonReaderBtn').addEventListener('click', closeReader);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeReader();
  });
  return overlay;
}

function appendText(tag, text, className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderReader() {
  const { domainId, step } = currentLesson();
  if (!step) return false;
  const overlay = ensureReader();
  const body = overlay.querySelector('#lessonReaderBody');
  const content = lessonContentById[step.id];
  body.innerHTML = '';

  body.append(appendText('p', DOMAIN_LABELS[domainId] || domainId, 'eyebrow'));
  const title = appendText('h1', step.title, 'lesson-reader-title');
  title.id = 'lessonReaderTitle';
  body.append(title);
  body.append(appendText('p', step.summary || '', 'lesson-reader-summary'));

  if (content?.intro) body.append(appendText('div', content.intro, 'lesson-reader-intro'));

  if (content?.sections?.length) {
    content.sections.forEach(section => {
      const block = document.createElement('section');
      block.className = 'lesson-section';
      block.append(appendText('h3', section.title));
      (section.paragraphs || []).forEach(text => block.append(appendText('p', text)));
      if (section.bullets?.length) {
        const list = document.createElement('ul');
        section.bullets.forEach(text => list.append(appendText('li', text)));
        block.append(list);
      }
      body.append(block);
    });
  } else {
    const block = document.createElement('section');
    block.className = 'lesson-section';
    block.append(appendText('h3', '本课重点'));
    const list = document.createElement('ul');
    (step.keyPoints || []).forEach(text => list.append(appendText('li', text)));
    block.append(list);
    body.append(block);
  }

  if (content?.checkpoint) {
    const checkpoint = document.createElement('div');
    checkpoint.className = 'lesson-checkpoint';
    checkpoint.append(appendText('strong', '学完先检查自己：'));
    checkpoint.append(document.createElement('br'));
    checkpoint.append(document.createTextNode(content.checkpoint));
    body.append(checkpoint);
  }

  const task = document.createElement('section');
  task.className = 'lesson-task-box';
  const taskPart = document.createElement('div');
  taskPart.append(appendText('strong', '今天要做什么'));
  taskPart.append(appendText('p', step.task || '完成本课学习任务。'));
  task.append(taskPart);
  const outputPart = document.createElement('div');
  outputPart.append(appendText('strong', '建议输出'));
  outputPart.append(appendText('p', step.output || '完成本课输出。'));
  task.append(outputPart);
  body.append(task);

  const actions = document.createElement('div');
  actions.className = 'lesson-reader-actions';
  const trainBtn = document.createElement('button');
  trainBtn.type = 'button';
  trainBtn.className = 'ghost';
  trainBtn.textContent = '去训练 / 复习';
  trainBtn.addEventListener('click', () => {
    closeReader();
    document.querySelector('#trainingHub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const doneBtn = document.createElement('button');
  doneBtn.type = 'button';
  doneBtn.className = 'primary';
  doneBtn.textContent = '我已完成本课';
  doneBtn.addEventListener('click', () => {
    document.querySelector('#completeLessonBtn')?.click();
    closeReader();
  });
  actions.append(trainBtn, doneBtn);
  body.append(actions);

  return true;
}

function openReader() {
  if (!renderReader()) return;
  const overlay = document.querySelector('#lessonReaderOverlay');
  overlay.classList.remove('hidden');
  overlay.querySelector('.lesson-reader-panel').scrollTop = 0;
  document.body.classList.add('lesson-reader-open');
}

function closeReader() {
  document.querySelector('#lessonReaderOverlay')?.classList.add('hidden');
  document.body.classList.remove('lesson-reader-open');
}

function syncTodayLearningButton() {
  const oldButton = document.querySelector('#toggleLessonBtn');
  const completeButton = document.querySelector('#completeLessonBtn');
  if (!oldButton || !completeButton) return;
  const { domainId, step } = currentLesson();

  let openButton = document.querySelector('#openLessonReaderBtn');
  if (domainId === 'korean' || !step) {
    oldButton.style.display = '';
    openButton?.remove();
    return;
  }

  oldButton.style.display = 'none';
  if (!openButton) {
    openButton = document.createElement('button');
    openButton.id = 'openLessonReaderBtn';
    openButton.type = 'button';
    openButton.className = 'ghost';
    openButton.textContent = '开始今日学习';
    openButton.addEventListener('click', openReader);
    completeButton.before(openButton);
  }
  openButton.disabled = !step;
}

function ensureBottomNav() {
  if (document.querySelector('#mobileBottomNav')) return;
  const domainSection = document.querySelector('.domain-card-shell');
  if (domainSection) domainSection.id = 'domainHub';

  const nav = document.createElement('nav');
  nav.id = 'mobileBottomNav';
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', '学习平台快捷导航');
  const items = [
    ['☀️', '今日', 'todayLearningCard'],
    ['✍️', '训练', 'trainingHub'],
    ['🧭', '路线', 'routeCard'],
    ['🎯', '薄弱', 'weakCard'],
    ['▦', '领域', 'domainHub'],
  ];
  items.forEach(([icon, label, targetId], index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.target = targetId;
    if (index === 0) button.classList.add('active');
    button.innerHTML = `<span>${icon}</span><span>${label}</span>`;
    button.addEventListener('click', () => {
      document.querySelector(`#${targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      nav.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    });
    nav.append(button);
  });
  document.body.append(nav);

  const home = document.querySelector('#homeView');
  if (home) {
    const syncVisibility = () => nav.classList.toggle('hidden', home.classList.contains('hidden'));
    syncVisibility();
    new MutationObserver(syncVisibility).observe(home, { attributes: true, attributeFilter: ['class'] });
  }
}

function syncEnhancements() {
  syncTodayLearningButton();
}

ensureStyles();
ensureReader();
ensureBottomNav();
syncEnhancements();

const lessonTitle = document.querySelector('#todayLessonTitle');
const domainName = document.querySelector('#domainName');
if (lessonTitle) new MutationObserver(() => queueMicrotask(syncEnhancements)).observe(lessonTitle, { childList: true, subtree: true, characterData: true });
if (domainName) new MutationObserver(() => queueMicrotask(syncEnhancements)).observe(domainName, { childList: true, subtree: true, characterData: true });
window.addEventListener('storage', syncEnhancements);
