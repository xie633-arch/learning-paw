import {
  KOREAN_TUTOR_VERSION,
  DEFAULT_TUTOR_SETTINGS,
  buildTutorPrompt,
  normalizeTutorSettings,
  tutorContentId,
} from './korean-tutor-v16.js';

const ROOT_STORAGE_KEY = 'personal-learning-os:v0.1';
const TUTOR_STORAGE_KEY = 'learning-paw:korean-tutor:v1';
const SESSION_MINUTES = 30;
let syncing = false;

function readJson(key, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key) || '') || fallback; }
  catch { return fallback; }
}

function readTutorSettings() {
  return normalizeTutorSettings({ ...DEFAULT_TUTOR_SETTINGS, ...readJson(TUTOR_STORAGE_KEY, {}) });
}

function saveTutorSettings(value) {
  const next = normalizeTutorSettings(value);
  localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(next));
  return next;
}

function readRootState() {
  return readJson(ROOT_STORAGE_KEY, {});
}

function writeRootState(state) {
  localStorage.setItem(ROOT_STORAGE_KEY, JSON.stringify(state));
}

function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function safeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isKoreanSelected() {
  return document.querySelector('#domainName')?.textContent?.trim() === '韩语';
}

function recentTutorEvents() {
  const state = readRootState();
  const events = Array.isArray(state.studyEvents) ? state.studyEvents : [];
  return events
    .filter(event => event?.domain === 'korean' && event?.event_type === 'conversation_session' && event?.source === 'chatgpt')
    .sort((a, b) => String(b.occurred_at || '').localeCompare(String(a.occurred_at || '')));
}

function recordTutorSession(settings) {
  const state = readRootState();
  const events = Array.isArray(state.studyEvents) ? state.studyEvents : [];
  const occurredAt = new Date().toISOString();
  const sessionId = safeId('ko-tutor');
  const event = {
    schema_version: '1.0',
    event_id: `evt-${sessionId}`,
    occurred_at: occurredAt,
    domain: 'korean',
    event_type: 'conversation_session',
    content_id: tutorContentId(settings),
    concept_id: null,
    skill: 'integrated_tutoring',
    result: { rating: null, correct: null, confidence: null },
    duration_ms: SESSION_MINUTES * 60 * 1000,
    session_id: sessionId,
    source: 'chatgpt',
    device_id: null,
    algorithm: null,
    local_day: localDayKey(),
    textbook: {
      name: '延世韩国语',
      volume: settings.volume,
      lesson: settings.lesson,
      focus: settings.focus || '',
    },
  };
  writeRootState({ ...state, studyEvents: [...events, event] });
  window.dispatchEvent(new CustomEvent('learning-paw:korean-tutor-updated', { detail: event }));
  return event;
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  if (button) {
    const before = button.textContent;
    button.textContent = '已复制 ✓';
    setTimeout(() => { button.textContent = before; }, 1400);
  }
}

function ensureStyles() {
  if (document.querySelector('#koreanTutorUiV16Styles')) return;
  const style = document.createElement('style');
  style.id = 'koreanTutorUiV16Styles';
  style.textContent = `
    .korean-tutor-panel { display:grid; gap:16px; }
    .korean-tutor-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    .korean-tutor-field { display:grid; gap:7px; }
    .korean-tutor-field.full { grid-column:1/-1; }
    .korean-tutor-field label { font-size:12px; font-weight:700; color:#667085; }
    .korean-tutor-field input,.korean-tutor-field textarea { width:100%; box-sizing:border-box; border:1px solid #d0d5dd; border-radius:12px; padding:11px 12px; background:#fff; color:#111827; font:inherit; }
    .korean-tutor-field textarea { min-height:84px; resize:vertical; line-height:1.55; }
    .korean-tutor-flow { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; }
    .korean-tutor-flow div { padding:11px 9px; border-radius:14px; background:#f4f6f8; min-height:72px; }
    .korean-tutor-flow strong { display:block; margin-bottom:4px; font-size:13px; }
    .korean-tutor-flow span { font-size:11px; color:#667085; line-height:1.45; }
    .korean-tutor-prompt { max-height:310px; overflow:auto; white-space:pre-wrap; word-break:break-word; padding:14px; border-radius:14px; background:#f7f8fa; color:#344054; font-size:13px; line-height:1.65; }
    .korean-tutor-actions { display:flex; flex-wrap:wrap; gap:9px; }
    .korean-tutor-note { margin:0; font-size:12px; color:#667085; line-height:1.6; }
    .korean-tutor-status { padding:11px 13px; border-radius:13px; background:#eef7f0; color:#28543a; font-size:13px; line-height:1.55; }
    #koreanTutorStats strong { font-size:1.45rem; }
    @media(max-width:720px){
      .korean-tutor-grid { grid-template-columns:1fr 1fr; }
      .korean-tutor-flow { grid-template-columns:1fr; }
      .korean-tutor-flow div { min-height:0; display:grid; grid-template-columns:84px 1fr; align-items:center; }
    }
    @media(prefers-color-scheme:dark){
      .korean-tutor-field label,.korean-tutor-note,.korean-tutor-flow span { color:#aab2bf; }
      .korean-tutor-field input,.korean-tutor-field textarea { background:#181c22; border-color:#303640; color:#f3f4f6; }
      .korean-tutor-flow div,.korean-tutor-prompt { background:#242932; color:#d6dbe3; }
      .korean-tutor-status { background:#203329; color:#a9dbb7; }
    }
  `;
  document.head.append(style);
}

function ensureTutorPanel() {
  const hub = document.querySelector('#trainingHub');
  if (!hub) return null;
  let panel = hub.querySelector('#koreanTutorPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'koreanTutorPanel';
    panel.className = 'korean-tutor-panel hidden';
    hub.append(panel);
  }
  return panel;
}

function renderTutorPanel() {
  const panel = ensureTutorPanel();
  if (!panel) return;
  const settings = readTutorSettings();
  const eventsToday = recentTutorEvents().filter(event => event.local_day === localDayKey()).length;
  panel.innerHTML = `
    <div class="korean-tutor-grid">
      <div class="korean-tutor-field"><label for="koreanTutorVolume">《延世韩国语》册 / 级</label><input id="koreanTutorVolume" inputmode="text" /></div>
      <div class="korean-tutor-field"><label for="koreanTutorLesson">当前课</label><input id="koreanTutorLesson" inputmode="text" /></div>
      <div class="korean-tutor-field full"><label for="koreanTutorFocus">今天教材范围 / 重点（可写页码、课文、语法）</label><textarea id="koreanTutorFocus" placeholder="例如：第 3 课语法 1；课文 A；35–38 页"></textarea></div>
      <div class="korean-tutor-field full"><label for="koreanTutorPrevious">上次遗留 / 今天想重点纠正（可选）</label><textarea id="koreanTutorPrevious" placeholder="例如：은/는 和 이/가 还是容易混"></textarea></div>
    </div>
    <div class="korean-tutor-flow">
      <div><strong>0–5 分钟</strong><span>旧课热身</span></div>
      <div><strong>5–12 分钟</strong><span>教材学习</span></div>
      <div><strong>12–20 分钟</strong><span>理解练习</span></div>
      <div><strong>20–27 分钟</strong><span>主动输出</span></div>
      <div><strong>27–30 分钟</strong><span>纠错复盘</span></div>
    </div>
    <div>
      <strong>今日私教 Prompt</strong>
      <p class="korean-tutor-note">教材决定学什么；ChatGPT 负责讲解、追问、输出和纠错；墨墨负责词汇记忆。</p>
    </div>
    <div id="koreanTutorPrompt" class="korean-tutor-prompt"></div>
    <div class="korean-tutor-actions">
      <button id="koreanTutorCopyBtn" class="primary" type="button">复制私教指令</button>
      <button id="koreanTutorOpenBtn" class="ghost" type="button">复制并打开 ChatGPT</button>
      <button id="koreanTutorCompleteBtn" class="ghost" type="button">完成今日私教</button>
    </div>
    <div id="koreanTutorStatus" class="korean-tutor-status">今天已记录 ${eventsToday} 节私教。完成一节后再点“完成今日私教”，网站会写入学习记录。</div>
  `;

  const volume = panel.querySelector('#koreanTutorVolume');
  const lesson = panel.querySelector('#koreanTutorLesson');
  const focus = panel.querySelector('#koreanTutorFocus');
  const previous = panel.querySelector('#koreanTutorPrevious');
  volume.value = settings.volume;
  lesson.value = settings.lesson;
  focus.value = settings.focus;
  previous.value = settings.previousFocus;

  const currentValue = () => normalizeTutorSettings({
    volume: volume.value,
    lesson: lesson.value,
    focus: focus.value,
    previousFocus: previous.value,
  });
  const refreshPrompt = () => { panel.querySelector('#koreanTutorPrompt').textContent = buildTutorPrompt(currentValue()); };
  refreshPrompt();

  [volume, lesson, focus, previous].forEach(input => {
    input.addEventListener('input', refreshPrompt);
    input.addEventListener('change', () => {
      saveTutorSettings(currentValue());
      syncKoreanUI();
    });
  });
  panel.querySelector('#koreanTutorCopyBtn').addEventListener('click', event => copyText(buildTutorPrompt(currentValue()), event.currentTarget));
  panel.querySelector('#koreanTutorOpenBtn').addEventListener('click', async event => {
    await copyText(buildTutorPrompt(currentValue()), event.currentTarget);
    window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
  });
  panel.querySelector('#koreanTutorCompleteBtn').addEventListener('click', () => {
    const saved = saveTutorSettings(currentValue());
    recordTutorSession(saved);
  });
}

function syncTrainingPanel(korean) {
  const hub = document.querySelector('#trainingHub');
  if (!hub) return;
  const generic = hub.querySelector('.training-actions');
  const panel = ensureTutorPanel();
  const eyebrow = hub.querySelector('.section-heading .eyebrow');
  const heading = hub.querySelector('.section-heading h2');
  if (korean) {
    generic?.classList.add('hidden');
    panel?.classList.remove('hidden');
    if (eyebrow) eyebrow.textContent = 'PRIVATE TUTOR';
    if (heading) heading.textContent = 'AI 韩语私教';
    renderTutorPanel();
  } else {
    generic?.classList.remove('hidden');
    panel?.classList.add('hidden');
    if (eyebrow) eyebrow.textContent = 'TRAIN';
    if (heading) heading.textContent = '训练中心';
  }
}

function syncHero(korean) {
  const hero = document.querySelector('.hero.card');
  if (!hero) return;
  const genericStats = document.querySelector('#dueCount')?.closest('.stats-grid');
  if (!korean) {
    genericStats?.classList.remove('hidden');
    hero.querySelector('#koreanTutorStats')?.remove();
    return;
  }
  genericStats?.classList.add('hidden');
  let stats = hero.querySelector('#koreanTutorStats');
  if (!stats) {
    stats = document.createElement('div');
    stats.id = 'koreanTutorStats';
    stats.className = 'stats-grid';
    hero.append(stats);
  }
  const settings = readTutorSettings();
  const today = recentTutorEvents().filter(event => event.local_day === localDayKey()).length;
  stats.innerHTML = `
    <div><strong>${settings.volume}</strong><span>当前册 / 级</span></div>
    <div><strong>${settings.lesson}</strong><span>当前课</span></div>
    <div><strong>${today}</strong><span>今日私教</span></div>
  `;
}

function syncToday(korean) {
  if (!korean) return;
  const settings = readTutorSettings();
  const eventsToday = recentTutorEvents().filter(event => event.local_day === localDayKey()).length;
  const progress = document.querySelector('#todayProgressText');
  const title = document.querySelector('#todayLessonTitle');
  const summary = document.querySelector('#todayLessonSummary');
  const chips = document.querySelector('#todayLessonChips');
  const details = document.querySelector('#todayLessonDetails');
  const toggle = document.querySelector('#toggleLessonBtn');
  const complete = document.querySelector('#completeLessonBtn');
  if (progress) progress.textContent = eventsToday ? '今日已完成' : '30 分钟';
  if (title) title.textContent = `《延世韩国语》${settings.volume} · 第 ${settings.lesson} 课`;
  if (summary) summary.textContent = settings.focus || '先在“私教”页填写今天看到的页码、课文或语法范围，再开始 30 分钟一对一训练。';
  if (chips) chips.innerHTML = '<span class="chip">📘 教材主线</span><span class="chip">🎙️ AI 私教</span><span class="chip">🧠 墨墨背词</span>';
  if (details) {
    details.innerHTML = '<strong>今日私教流程</strong><p>旧课热身 5 分钟 → 教材学习 7 分钟 → 理解练习 8 分钟 → 主动输出 7 分钟 → 纠错复盘 3 分钟。</p><p>网站不再提供韩语单词卡 / FSRS 词汇复习；词汇交给墨墨记忆卡。</p>';
  }
  if (toggle) { toggle.style.display = ''; toggle.disabled = false; toggle.textContent = details?.classList.contains('hidden') ? '查看私教流程' : '收起私教流程'; }
  document.querySelector('#openKoreanLessonReaderBtn')?.remove();
  if (complete) { complete.disabled = false; complete.textContent = eventsToday ? '再上一节私教' : '开始 30 分钟私教'; }
}

function syncRoute(korean) {
  if (!korean) return;
  const settings = readTutorSettings();
  const title = document.querySelector('#routeTitle');
  const source = document.querySelector('#routeSource');
  const progress = document.querySelector('#routeProgressText');
  const list = document.querySelector('#routeList');
  if (title) title.textContent = '《延世韩国语》教材进度';
  if (source) source.textContent = '教材内容以你手中的《延世韩国语》为准。Learning Paw 只记录课次与私教学习事实，不复制或分发教材正文。';
  if (progress) progress.textContent = `第 ${settings.volume} 册 / 级 · 第 ${settings.lesson} 课`;
  if (list) list.innerHTML = `
    <div class="route-item current">
      <span class="route-index">→</span>
      <div class="route-copy"><strong>当前：第 ${settings.volume} 册 / 级 · 第 ${settings.lesson} 课</strong><span>${settings.focus || '尚未填写今天的具体页码 / 课文 / 语法范围'}</span></div>
      <span class="status-badge">私教页可修改</span>
    </div>
  `;
}

function syncWeak(korean) {
  const card = document.querySelector('#weakCard');
  if (!card) return;
  const eyebrow = card.querySelector('.section-heading .eyebrow');
  const heading = card.querySelector('.section-heading h2');
  const button = document.querySelector('#weakDrillBtn');
  const list = document.querySelector('#weakList');
  if (!korean) {
    if (eyebrow) eyebrow.textContent = 'WEAK SPOTS';
    if (heading) heading.textContent = '薄弱知识';
    if (button) button.hidden = false;
    return;
  }
  if (eyebrow) eyebrow.textContent = 'TUTOR HISTORY';
  if (heading) heading.textContent = '私教记录';
  if (button) button.hidden = true;
  if (!list) return;
  const events = recentTutorEvents().slice(0, 5);
  if (!events.length) {
    list.innerHTML = '<div class="weak-empty">还没有私教记录。完成第一节 30 分钟私教后，这里会留下教材位置和学习时间。</div>';
    return;
  }
  list.innerHTML = events.map(event => {
    const textbook = event.textbook || {};
    const when = event.occurred_at ? new Date(event.occurred_at).toLocaleString('zh-CN', { hour12: false }) : '';
    return `<div class="weak-item"><div><strong>《延世韩国语》${textbook.volume || '?'} · 第 ${textbook.lesson || '?'} 课</strong><span class="muted small">${textbook.focus || '30 分钟 AI 私教'}</span></div><div class="muted small">${when}</div></div>`;
  }).join('');
}

function syncDomainCopy(korean) {
  const koreanSmall = document.querySelector('#domainGrid [data-domain="korean"] .domain-choice-copy small');
  if (koreanSmall) koreanSmall.textContent = '30 分钟 AI 私教';
  if (!korean) return;
  const lead = document.querySelector('#homeLead');
  if (lead) lead.textContent = '《延世韩国语》决定学什么；Learning Paw 负责教材进度与私教任务；ChatGPT 负责 30 分钟互动教学；墨墨负责词汇记忆。';
  const notice = document.querySelector('#koreanNotice');
  if (notice) {
    const title = notice.querySelector('h2');
    const body = notice.querySelector('p.muted');
    if (title) title.textContent = '《延世韩国语》 × AI 韩语私教';
    if (body) body.textContent = '保留原来的 Learning Paw 学习框架，但韩语不再做站内单词卡 / FSRS 词汇复习。每天从网站生成一节约 30 分钟私教任务，在 ChatGPT 完成讲解、练习、输出、纠错与复盘。';
  }
}

function syncTabLabels(korean) {
  const training = document.querySelector('#uxDesktopTabs [data-ux-tab="training"]');
  const weak = document.querySelector('#uxDesktopTabs [data-ux-tab="weak"]');
  if (training) training.textContent = korean ? '私教' : '训练';
  if (weak) weak.textContent = korean ? '复盘' : '薄弱';
}

function syncKoreanUI() {
  if (syncing) return;
  syncing = true;
  queueMicrotask(() => {
    try {
      const korean = isKoreanSelected();
      syncTrainingPanel(korean);
      syncHero(korean);
      syncToday(korean);
      syncRoute(korean);
      syncWeak(korean);
      syncDomainCopy(korean);
      syncTabLabels(korean);
    } finally {
      syncing = false;
    }
  });
}

function bindTodayActions() {
  document.addEventListener('click', event => {
    if (!isKoreanSelected()) return;
    const toggle = event.target.closest('#toggleLessonBtn');
    const complete = event.target.closest('#completeLessonBtn');
    if (!toggle && !complete) return;
    event.preventDefault();
    event.stopPropagation();
    if (toggle) {
      const details = document.querySelector('#todayLessonDetails');
      const hidden = details?.classList.toggle('hidden');
      toggle.textContent = hidden ? '查看私教流程' : '收起私教流程';
      return;
    }
    window.__LEARNING_PAW_UX_V08__?.activateTab?.('training');
    document.querySelector('#koreanTutorPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, true);
}

ensureStyles();
ensureTutorPanel();
bindTodayActions();
syncKoreanUI();

const domainName = document.querySelector('#domainName');
if (domainName) new MutationObserver(syncKoreanUI).observe(domainName, { childList: true, subtree: true, characterData: true });
window.addEventListener('learning-paw:korean-tutor-updated', syncKoreanUI);
window.addEventListener('storage', syncKoreanUI);

window.__KOREAN_TUTOR_UI_V16__ = { version: KOREAN_TUTOR_VERSION, render: syncKoreanUI };
