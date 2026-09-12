import { curricula } from './platform-data.js';
import { lessonContentById } from './lesson-content-v05.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function currentKoreanLesson() {
  const progress = readState().lessonProgress || {};
  return (curricula.korean?.steps || []).find(step => !progress[step.id]) || null;
}

function isKoreanSelected() {
  return document.querySelector('#domainName')?.textContent?.trim() === '韩语';
}

function ensureStyles() {
  if (document.querySelector('#koreanLearningUiV05Styles')) return;
  const style = document.createElement('style');
  style.id = 'koreanLearningUiV05Styles';
  style.textContent = `
    .korean-reader-overlay { position:fixed; inset:0; z-index:1100; background:rgba(17,24,39,.42); display:grid; place-items:center; padding:18px; }
    .korean-reader-panel { width:min(860px,100%); max-height:min(90vh,960px); overflow:auto; background:#fff; color:#111827; border-radius:26px; padding:24px; box-shadow:0 26px 80px rgba(17,24,39,.25); -webkit-overflow-scrolling:touch; }
    .korean-reader-top { display:flex; align-items:center; justify-content:space-between; gap:12px; position:sticky; top:-24px; padding:18px 0 12px; background:#fff; z-index:3; }
    .korean-reader-title { margin:4px 0 8px; font-size:clamp(28px,5vw,40px); line-height:1.2; letter-spacing:-.03em; }
    .korean-reader-summary { margin:0 0 18px; font-size:16px; line-height:1.7; color:#697386; }
    .korean-reader-intro { padding:16px 18px; margin:0 0 18px; border-radius:18px; background:#f4f6f8; line-height:1.75; }
    .korean-reader-section { padding:18px 0; border-top:1px solid #e8ebef; }
    .korean-reader-section h3 { margin:0 0 10px; font-size:19px; }
    .korean-reader-section p { margin:7px 0; color:#475467; line-height:1.78; }
    .korean-reader-section ul { margin:8px 0 0; padding-left:22px; }
    .korean-reader-section li { margin:8px 0; color:#344054; line-height:1.68; }
    .korean-checkpoint { margin:8px 0 20px; padding:16px 18px; border-radius:18px; background:#eef7f0; color:#28543a; line-height:1.7; }
    .korean-resource-box, .korean-voice-box { display:grid; gap:12px; margin:18px 0; padding:18px; border-radius:18px; background:#f7f8fa; }
    .korean-resource-item { display:grid; gap:7px; padding:14px 0; border-top:1px solid #e5e7eb; }
    .korean-resource-item:first-of-type { border-top:0; padding-top:0; }
    .korean-resource-meta { color:#667085; font-size:13px; }
    .korean-resource-print { color:#344054; line-height:1.7; }
    .korean-resource-link { display:inline-flex; width:max-content; max-width:100%; align-items:center; justify-content:center; min-height:42px; padding:9px 13px; border-radius:12px; background:#111827; color:#fff; text-decoration:none; font-weight:700; }
    .korean-resource-note { font-size:13px; color:#667085; line-height:1.6; }
    .korean-voice-targets { margin:0; padding-left:22px; color:#344054; }
    .korean-voice-prompt { white-space:pre-wrap; max-height:280px; overflow:auto; padding:13px; border-radius:14px; background:#fff; border:1px solid #e5e7eb; color:#344054; line-height:1.65; font-size:13px; }
    .korean-reader-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; position:sticky; bottom:-24px; padding:14px 0 2px; background:linear-gradient(180deg,rgba(255,255,255,0),#fff 30%); }
    body.korean-reader-open { overflow:hidden; }
    #openKoreanLessonReaderBtn { min-height:52px; }
    @media(max-width:720px){
      .korean-reader-overlay { padding:0; place-items:stretch; background:#fff; }
      .korean-reader-panel { width:100%; height:100%; max-height:none; border-radius:0; padding:20px 18px calc(22px + env(safe-area-inset-bottom)); }
      .korean-reader-top { top:-20px; padding-top:max(18px, env(safe-area-inset-top)); }
      .korean-reader-actions { grid-template-columns:1fr; bottom:calc(-22px - env(safe-area-inset-bottom)); padding-bottom:calc(12px + env(safe-area-inset-bottom)); }
    }
    @media(prefers-color-scheme:dark){
      .korean-reader-overlay { background:rgba(0,0,0,.72); }
      .korean-reader-panel,.korean-reader-top { background:#181c22; color:#f3f4f6; }
      .korean-reader-summary,.korean-reader-section p,.korean-reader-section li,.korean-resource-print,.korean-voice-targets { color:#aab2bf; }
      .korean-reader-intro,.korean-resource-box,.korean-voice-box { background:#242932; }
      .korean-reader-section,.korean-resource-item { border-color:#303640; }
      .korean-checkpoint { background:#203329; color:#a9dbb7; }
      .korean-resource-link { background:#f3f4f6; color:#111827; }
      .korean-resource-meta,.korean-resource-note { color:#8f98a6; }
      .korean-voice-prompt { background:#181c22; border-color:#303640; color:#cbd2dc; }
      .korean-reader-actions { background:linear-gradient(180deg,rgba(24,28,34,0),#181c22 30%); }
    }
  `;
  document.head.append(style);
}

function ensureOverlay() {
  let overlay = document.querySelector('#koreanLessonReaderOverlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'koreanLessonReaderOverlay';
  overlay.className = 'korean-reader-overlay hidden';
  overlay.innerHTML = `
    <article class="korean-reader-panel" role="dialog" aria-modal="true" aria-labelledby="koreanReaderTitle">
      <div class="korean-reader-top">
        <p class="eyebrow">🇰🇷 TODAY KOREAN</p>
        <button id="closeKoreanReaderBtn" class="ghost" type="button">关闭</button>
      </div>
      <div id="koreanReaderBody"></div>
    </article>
  `;
  document.body.append(overlay);
  overlay.querySelector('#closeKoreanReaderBtn').addEventListener('click', closeReader);
  overlay.addEventListener('click', event => { if (event.target === overlay) closeReader(); });
  return overlay;
}

function text(tag, value, className = '') {
  const node = document.createElement(tag);
  node.textContent = value || '';
  if (className) node.className = className;
  return node;
}

function renderResources(body, resources = []) {
  if (!resources.length) return;
  const box = document.createElement('section');
  box.className = 'korean-resource-box';
  box.append(text('h3', '🖨️ 本周打印 / 配套资料'));
  box.append(text('p', '不用自己找。下面只放官方来源；打开后按标注范围打印即可。整本通常不需要打印。', 'korean-resource-note'));
  resources.forEach(resource => {
    const item = document.createElement('div');
    item.className = 'korean-resource-item';
    item.append(text('strong', `${resource.label || '配套资料'}｜${resource.title}`));
    item.append(text('div', resource.type || '官方资料', 'korean-resource-meta'));
    item.append(text('div', resource.print || '', 'korean-resource-print'));
    if (resource.purpose) item.append(text('div', `用途：${resource.purpose}`, 'korean-resource-note'));
    const link = document.createElement('a');
    link.className = 'korean-resource-link';
    link.href = resource.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '打开官方 PDF 下载页';
    item.append(link);
    if (resource.note) item.append(text('div', resource.note, 'korean-resource-note'));
    box.append(item);
  });
  body.append(box);
}

function renderVoice(body, voiceTask) {
  if (!voiceTask) return;
  const box = document.createElement('section');
  box.className = 'korean-voice-box';
  box.append(text('h3', `🎙️ ${voiceTask.title}`));
  box.append(text('p', `建议时长：约 ${voiceTask.duration_minutes} 分钟。完成本课内容后，复制下面 Prompt 到 ChatGPT Voice。`, 'korean-resource-note'));
  if (voiceTask.targets?.length) {
    const list = document.createElement('ul');
    list.className = 'korean-voice-targets';
    voiceTask.targets.forEach(item => list.append(text('li', item)));
    box.append(list);
  }
  const prompt = text('div', voiceTask.prompt || '', 'korean-voice-prompt');
  box.append(prompt);
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'ghost';
  copyBtn.textContent = '复制完整 Voice Prompt';
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(voiceTask.prompt || '');
      copyBtn.textContent = '已复制 ✓';
      setTimeout(() => { copyBtn.textContent = '复制完整 Voice Prompt'; }, 1600);
    } catch {
      copyBtn.textContent = '复制失败，请长按上方 Prompt';
    }
  });
  box.append(copyBtn);
  body.append(box);
}

function renderReader() {
  const step = currentKoreanLesson();
  if (!step) return false;
  const content = lessonContentById[step.id];
  const overlay = ensureOverlay();
  const body = overlay.querySelector('#koreanReaderBody');
  body.innerHTML = '';

  const title = text('h1', step.title, 'korean-reader-title');
  title.id = 'koreanReaderTitle';
  body.append(title);
  body.append(text('p', step.summary || '', 'korean-reader-summary'));
  if (content?.intro) body.append(text('div', content.intro, 'korean-reader-intro'));

  (content?.sections || []).forEach(section => {
    const block = document.createElement('section');
    block.className = 'korean-reader-section';
    block.append(text('h3', section.title));
    (section.paragraphs || []).forEach(value => block.append(text('p', value)));
    if (section.bullets?.length) {
      const list = document.createElement('ul');
      section.bullets.forEach(value => list.append(text('li', value)));
      block.append(list);
    }
    body.append(block);
  });

  if (content?.checkpoint) {
    const checkpoint = document.createElement('div');
    checkpoint.className = 'korean-checkpoint';
    checkpoint.append(text('strong', '学完先检查自己：'));
    checkpoint.append(document.createElement('br'));
    checkpoint.append(document.createTextNode(content.checkpoint));
    body.append(checkpoint);
  }

  const task = document.createElement('section');
  task.className = 'korean-resource-box';
  task.append(text('h3', '✅ 今天要完成'));
  task.append(text('div', step.task || '完成本课学习任务。', 'korean-resource-print'));
  task.append(text('div', `建议输出：${step.output || '完成本课输出。'}`, 'korean-resource-note'));
  body.append(task);

  renderResources(body, content?.resources || []);
  renderVoice(body, step.voice_task);

  const actions = document.createElement('div');
  actions.className = 'korean-reader-actions';
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
  const overlay = ensureOverlay();
  overlay.classList.remove('hidden');
  overlay.querySelector('.korean-reader-panel').scrollTop = 0;
  document.body.classList.add('korean-reader-open');
}

function closeReader() {
  document.querySelector('#koreanLessonReaderOverlay')?.classList.add('hidden');
  document.body.classList.remove('korean-reader-open');
}

function syncButton() {
  const oldButton = document.querySelector('#toggleLessonBtn');
  const completeButton = document.querySelector('#completeLessonBtn');
  let button = document.querySelector('#openKoreanLessonReaderBtn');

  if (!isKoreanSelected()) {
    button?.remove();
    if (oldButton) oldButton.style.display = '';
    return;
  }

  if (oldButton) oldButton.style.display = 'none';
  if (!completeButton) return;
  if (!button) {
    button = document.createElement('button');
    button.id = 'openKoreanLessonReaderBtn';
    button.type = 'button';
    button.className = 'ghost';
    button.textContent = '开始今日韩语学习';
    button.addEventListener('click', openReader);
    completeButton.before(button);
  }
  button.disabled = !currentKoreanLesson();
}

ensureStyles();
ensureOverlay();
syncButton();

const domainName = document.querySelector('#domainName');
const lessonTitle = document.querySelector('#todayLessonTitle');
if (domainName) new MutationObserver(() => queueMicrotask(syncButton)).observe(domainName, { childList:true, subtree:true, characterData:true });
if (lessonTitle) new MutationObserver(() => queueMicrotask(syncButton)).observe(lessonTitle, { childList:true, subtree:true, characterData:true });

window.__KOREAN_LEARNING_UI_V05__ = { version: '0.5.0' };
