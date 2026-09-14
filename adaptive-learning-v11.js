import { cards as baseCards } from './cards.js';
import { extraCards, tests } from './platform-data.js';
import { koreanExitChecks } from './korean-exit-check-v06.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.11.0';
const allCards = [...baseCards, ...extraCards];
const cardById = new Map(allCards.map(card => [card.card_id || card.id, card]));

const domainNameToId = new Map([
  ['手机产品专家', 'phone'],
  ['韩语', 'korean'],
  ['商圈与零售', 'retail'],
  ['行业与商业', 'industry'],
]);

const formalByConcept = new Map();
const formalByItem = new Map();
Object.entries(tests).forEach(([domain, assessment]) => {
  (assessment.questions || []).forEach((question, index) => {
    const meta = { domain, assessment, question, index };
    formalByItem.set(question.item_id, meta);
    (question.concept_ids || []).forEach(conceptId => formalByConcept.set(conceptId, meta));
  });
});

const koreanByConcept = new Map();
const koreanByItem = new Map();
Object.entries(koreanExitChecks).forEach(([lessonId, check]) => {
  (check.items || []).forEach((item, index) => {
    const meta = { domain: 'korean', lessonId, check, item, index };
    koreanByItem.set(item.item_id, meta);
    koreanByConcept.set(item.concept_id, meta);
  });
});

let processingKorean = false;
let renderQueued = false;
let overlayRecord = null;

function safeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function selectedDomainId() {
  const selected = document.querySelector('#domainGrid [data-domain].selected')?.dataset.domain;
  if (selected) return selected;
  return domainNameToId.get(document.querySelector('#domainName')?.textContent?.trim()) || 'phone';
}

function sameError(record, conceptId, contentId, skill, errorType = 'assessment_error') {
  if (!record || record.status !== 'active' || record.error_type !== errorType) return false;
  const left = record.concept_id || `content:${record.content_id || 'unknown'}`;
  const right = conceptId || `content:${contentId || 'unknown'}`;
  return left === right && (record.skill || 'general') === (skill || 'general');
}

function appendEvent(event) {
  const state = readState();
  state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
  if (!state.studyEvents.some(existing => existing.event_id === event.event_id)) {
    state.studyEvents.push(event);
    writeState(state);
  }
}

function processKoreanExitChecks() {
  if (processingKorean) return;
  processingKorean = true;
  try {
    const state = readState();
    const storedChecks = state.koreanExitChecks && typeof state.koreanExitChecks === 'object' ? state.koreanExitChecks : {};
    state.adaptiveV11 ||= {};
    state.adaptiveV11.koreanExitProcessed ||= {};
    state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
    const existingEventIds = new Set(state.studyEvents.map(event => event.event_id));
    const activeErrors = Array.isArray(state.errorRecords) ? state.errorRecords : [];
    let changed = false;

    Object.entries(storedChecks).forEach(([lessonId, attempt]) => {
      const check = koreanExitChecks[lessonId];
      if (!check || !attempt?.completed_at || !Array.isArray(attempt.results)) return;
      const token = `${lessonId}:${attempt.completed_at}`;
      if (state.adaptiveV11.koreanExitProcessed[token]) return;
      const sessionId = `korean-exit-${lessonId}-${String(attempt.completed_at).replace(/[^0-9A-Za-z]/g, '')}`;

      attempt.results.forEach((result, resultIndex) => {
        const itemIndex = Number.isInteger(result.index) ? result.index : resultIndex;
        const item = check.items?.[itemIndex];
        if (!item) return;
        const correct = Boolean(result.correct);
        const revalidation = correct && activeErrors.some(record => sameError(record, item.concept_id, item.item_id, item.skill));
        const eventId = `evt-${sessionId}-${item.item_id}`;
        if (existingEventIds.has(eventId)) return;
        state.studyEvents.push({
          schema_version: '1.0',
          event_id: eventId,
          occurred_at: attempt.completed_at,
          domain: 'korean',
          event_type: 'assessment_attempt',
          content_id: item.item_id,
          concept_id: item.concept_id,
          skill: item.skill,
          result: { rating: null, correct, score: correct ? 1 : 0, max_score: 1, confidence: null },
          duration_ms: null,
          session_id: sessionId,
          source: 'korean_exit_check',
          device_id: null,
          algorithm: 'objective_scoring',
          assessment_id: check.assessment_id,
          prompt: item.prompt,
          selected_answer: result.selected ?? null,
          correct_answer: item.type === 'typing' ? (item.accepted || []) : item.answer,
          revalidation,
          revalidation_error_type: 'assessment_error',
          lesson_id: lessonId,
        });
        existingEventIds.add(eventId);
        changed = true;
      });

      const completedId = `evt-${sessionId}-completed`;
      if (!existingEventIds.has(completedId)) {
        state.studyEvents.push({
          schema_version: '1.0',
          event_id: completedId,
          occurred_at: attempt.completed_at,
          domain: 'korean',
          event_type: 'assessment_completed',
          content_id: check.assessment_id,
          concept_id: null,
          skill: 'lesson_exit_check',
          result: { rating: null, correct: null, score: Number(attempt.score || 0), max_score: Number(attempt.max_score || check.items.length), confidence: null, passed: Boolean(attempt.passed) },
          duration_ms: null,
          session_id: sessionId,
          source: 'korean_exit_check',
          device_id: null,
          algorithm: 'objective_scoring',
          assessment_id: check.assessment_id,
          lesson_id: lessonId,
        });
        existingEventIds.add(completedId);
        changed = true;
      }

      state.adaptiveV11.koreanExitProcessed[token] = new Date().toISOString();
      changed = true;
    });

    if (changed) writeState(state);
  } finally {
    processingKorean = false;
  }
}

function ensureStyles() {
  if (document.querySelector('#adaptiveLearningV11Styles')) return;
  const style = document.createElement('style');
  style.id = 'adaptiveLearningV11Styles';
  style.textContent = `
    .al-shell{margin-top:18px;padding-top:16px;border-top:1px solid rgba(23,32,51,.08)}
    .al-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.al-head h3{margin:2px 0 4px;font-size:18px}.al-count{flex:0 0 auto;padding:6px 9px;border-radius:999px;background:#fff2e8;color:#9a4d13;font-size:11px;font-weight:800}.al-count.clear{background:#edf7ef;color:#2f6a45}
    .al-list{display:grid;gap:10px;margin-top:12px}.al-error{padding:13px;border:1px solid rgba(23,32,51,.08);border-radius:16px;background:#fff}.al-error-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.al-error-title{font-weight:850;line-height:1.5;color:#1f2937}.al-type{flex:0 0 auto;padding:4px 7px;border-radius:999px;background:#f2f4f7;color:#667085;font-size:10px;font-weight:800}.al-meta{margin-top:7px;color:#667085;font-size:11px;line-height:1.6}.al-actions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}.al-actions button{min-height:38px;padding:8px 11px;font-size:12px}.al-empty{margin-top:10px;padding:13px;border-radius:14px;background:#f4f8f5;color:#56705f;font-size:12px;line-height:1.6}
    .al-overlay{position:fixed;inset:0;z-index:1750;background:rgba(15,23,42,.5);display:grid;place-items:center;padding:18px}.al-panel{width:min(720px,100%);max-height:92vh;overflow:auto;background:#fff;color:#111827;border-radius:24px;padding:22px;box-shadow:0 28px 90px rgba(15,23,42,.28)}.al-panel h2{font-size:24px;line-height:1.35;margin:6px 0 12px}.al-copy{color:#667085;line-height:1.7}.al-answer{margin-top:14px;padding:14px;border-radius:14px;background:#f6f7f9;line-height:1.7}.al-options{display:grid;gap:10px;margin-top:14px}.al-option{width:100%;text-align:left;padding:13px 15px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827}.al-input{width:100%;box-sizing:border-box;padding:13px 15px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827;font:inherit}.al-result{margin-top:14px;padding:13px;border-radius:14px;background:#eef7f0;color:#28543a;line-height:1.65}.al-result.warn{background:#fff5e8;color:#7a4b12}.al-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.al-row button{min-height:42px}.al-rating{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
    @media(max-width:720px){.al-overlay{padding:0;background:#fff}.al-panel{width:100%;height:100%;max-height:none;border-radius:0;padding:20px 18px calc(28px + env(safe-area-inset-bottom))}.al-rating{grid-template-columns:1fr}}
    @media(prefers-color-scheme:dark){.al-error,.al-panel,.al-option,.al-input{background:#181d24;color:#f3f4f6;border-color:#303640}.al-error-title{color:#f3f4f6}.al-meta,.al-copy{color:#aeb7c5}.al-type,.al-answer{background:#242a32;color:#aeb7c5}.al-result{background:#1f3025;color:#9bd1aa}.al-result.warn{background:#382d1f;color:#f2c98d}}
  `;
  document.head.append(style);
}

function ensureBank() {
  const weakCard = document.querySelector('#weakCard');
  if (!weakCard) return null;
  let shell = document.querySelector('#adaptiveLearningV11');
  if (shell) return shell;
  shell = document.createElement('div');
  shell.id = 'adaptiveLearningV11';
  shell.className = 'al-shell';
  shell.innerHTML = `
    <div class="al-head"><div><p class="eyebrow">ADAPTIVE ERROR BANK · V2</p><h3>通用薄弱知识闭环</h3></div><span id="adaptiveLearningCount" class="al-count">0 active</span></div>
    <p class="muted small">普通复习、正式测试和韩语 Exit Check 共用这一套错误记录。只有真实暴露的错误进入这里；补救任务不会自动挤占今日 FSRS 上限。</p>
    <div id="adaptiveLearningList" class="al-list"></div>`;
  const productBank = document.querySelector('#phoneAdaptiveErrorBank');
  if (productBank?.parentElement === weakCard) productBank.before(shell);
  else {
    const weakList = weakCard.querySelector('#weakList');
    if (weakList) weakList.after(shell); else weakCard.append(shell);
  }
  return shell;
}

function ensureOverlay() {
  let overlay = document.querySelector('#adaptiveLearningOverlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'adaptiveLearningOverlay';
  overlay.className = 'al-overlay hidden';
  overlay.innerHTML = '<div class="al-panel" role="dialog" aria-modal="true"><div id="adaptiveLearningOverlayBody"></div></div>';
  document.body.append(overlay);
  return overlay;
}

function closeOverlay() {
  document.querySelector('#adaptiveLearningOverlay')?.classList.add('hidden');
  document.body.style.overflow = '';
  overlayRecord = null;
}

function showOverlay(...nodes) {
  const overlay = ensureOverlay();
  const body = overlay.querySelector('#adaptiveLearningOverlayBody');
  body.innerHTML = '';
  nodes.filter(Boolean).forEach(node => body.append(node));
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function node(tag, text = '', className = '') {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function metaForRecord(record) {
  const card = cardById.get(record.content_id);
  if (card) return { kind: 'recall', card };
  const formal = formalByConcept.get(record.concept_id) || formalByItem.get(record.content_id);
  if (formal) return { kind: 'formal', ...formal };
  const korean = koreanByConcept.get(record.concept_id) || koreanByItem.get(record.content_id);
  if (korean) return { kind: 'korean_exit', ...korean };
  return { kind: 'unknown' };
}

function typeLabel(meta, record) {
  if (meta.kind === 'recall') return '复习卡';
  if (meta.kind === 'formal') return '正式测试';
  if (meta.kind === 'korean_exit') return 'Exit Check';
  return record.error_type === 'recall_gap' ? '记忆缺口' : '测试错题';
}

function titleFor(meta, record) {
  if (meta.kind === 'recall') return meta.card.question;
  if (meta.kind === 'formal') return meta.question.q;
  if (meta.kind === 'korean_exit') return meta.item.prompt;
  return record.concept_id || record.content_id || '未命名薄弱点';
}

function detailFor(meta, record) {
  if (meta.kind === 'recall') return `${meta.card.category || '未分类'} · ${record.skill || 'recall'}`;
  if (meta.kind === 'formal') return `${meta.question.concept_label || meta.question.q} · ${record.skill || meta.question.skill}`;
  if (meta.kind === 'korean_exit') return `${meta.lessonId.replace('ko-day-', 'Day ')} · ${record.skill || meta.item.skill}`;
  return `${record.skill || 'general'} · ${record.error_type}`;
}

function renderBank() {
  const shell = ensureBank();
  if (!shell) return;
  const domain = selectedDomainId();
  const state = readState();
  const records = Array.isArray(state.errorRecords) ? state.errorRecords : [];
  const scoped = records.filter(record => record.domain === domain && record.skill !== 'product_judgment');
  const active = scoped.filter(record => record.status === 'active');
  const resolved = scoped.filter(record => record.status === 'resolved');
  const count = shell.querySelector('#adaptiveLearningCount');
  const list = shell.querySelector('#adaptiveLearningList');
  count.textContent = `${active.length} active · ${resolved.length} resolved`;
  count.classList.toggle('clear', active.length === 0);

  if (!active.length) {
    list.innerHTML = '<div class="al-empty">当前没有需要补救的错误。之后如果在复习中选“不认识”、正式测试答错，或韩语 Exit Check 失误，这里会自动出现对应任务。</div>';
    return;
  }

  list.innerHTML = active.slice(0, 12).map(record => {
    const meta = metaForRecord(record);
    const actionable = meta.kind !== 'unknown';
    return `<div class="al-error" data-adaptive-error="${record.error_id}">
      <div class="al-error-top"><div class="al-error-title">${titleFor(meta, record)}</div><span class="al-type">${typeLabel(meta, record)}</span></div>
      <div class="al-meta">${detailFor(meta, record)} · 出现 ${Number(record.occurrences || 1)} 次${record.severity === 'high' ? ' · 高频错误' : ''}</div>
      ${actionable ? `<div class="al-actions"><button type="button" class="primary" data-adaptive-revalidate="${record.error_id}">针对性重新验证</button></div>` : '<div class="al-meta">这是旧版学习数据形成的错误记录；后续新任务会自动升级为可直接验证的格式。</div>'}
    </div>`;
  }).join('');
}

function activeRecordById(errorId) {
  return (readState().errorRecords || []).find(record => record.error_id === errorId && record.status === 'active') || null;
}

function writeRecallRevalidation(record, rating) {
  appendEvent({
    schema_version: '1.0', event_id: safeId('evt-adaptive-recall'), occurred_at: new Date().toISOString(), domain: record.domain,
    event_type: 'practice_attempt', content_id: record.content_id, concept_id: record.concept_id || null, skill: record.skill || 'general',
    result: { rating, correct: null, confidence: null }, duration_ms: null, session_id: null, source: 'adaptive_error_bank', device_id: null,
    algorithm: 'targeted_revalidation', revalidation: true, revalidation_error_type: 'recall_gap',
  });
}

function writeAssessmentRevalidation(record, meta, correct, selectedAnswer) {
  const question = meta.kind === 'formal' ? meta.question : meta.item;
  const assessmentId = meta.kind === 'formal' ? meta.assessment.assessment_id : meta.check.assessment_id;
  appendEvent({
    schema_version: '1.0', event_id: safeId('evt-adaptive-assessment'), occurred_at: new Date().toISOString(), domain: record.domain,
    event_type: 'assessment_attempt', content_id: record.content_id, concept_id: record.concept_id || question.concept_ids?.[0] || question.concept_id || null,
    skill: record.skill || question.skill || 'general', result: { rating: null, correct, score: correct ? 1 : 0, max_score: 1, confidence: null },
    duration_ms: null, session_id: null, source: 'adaptive_error_bank', device_id: null, algorithm: 'targeted_revalidation', assessment_id: assessmentId,
    selected_answer: selectedAnswer, correct_answer: question.answer ?? question.accepted ?? null, prompt: question.q || question.prompt,
    revalidation: true, revalidation_error_type: 'assessment_error',
  });
}

function renderRecallOverlay(record, meta) {
  const title = node('h2', meta.card.question);
  const copy = node('p', '先独立回忆，再展开参考答案。这里是 Error Bank 的针对性验证，不会额外增加今日 FSRS 数量。', 'al-copy');
  const textarea = document.createElement('textarea');
  textarea.className = 'al-input'; textarea.rows = 4; textarea.placeholder = '先写下你能回忆出来的内容……';
  const answer = node('div', meta.card.answer, 'al-answer hidden');
  const reveal = node('button', '查看参考答案', 'primary'); reveal.type = 'button';
  const close = node('button', '关闭', 'ghost'); close.type = 'button'; close.addEventListener('click', closeOverlay);
  const row = node('div', '', 'al-row'); row.append(close, reveal);
  const rating = node('div', '', 'al-rating hidden');
  [['good','认识'],['hard','模糊'],['again','不认识']].forEach(([value,label]) => {
    const button = node('button', label, value === 'good' ? 'primary' : 'ghost'); button.type='button';
    button.addEventListener('click', () => {
      writeRecallRevalidation(record, value);
      const passed = value === 'good';
      showOverlay(node('h2', passed ? '重新验证通过 ✓' : '继续保留在 Error Bank'), node('div', passed ? '这条记忆缺口已经标记为 resolved；原有 FSRS 排程仍然保留。' : '这条知识仍然需要复习，系统不会因为一次补救就假装已经掌握。', `al-result${passed ? '' : ' warn'}`), (()=>{const b=node('button','返回薄弱页','primary'); b.addEventListener('click',closeOverlay); return b;})());
    });
    rating.append(button);
  });
  reveal.addEventListener('click', () => { answer.classList.remove('hidden'); rating.classList.remove('hidden'); reveal.disabled = true; });
  showOverlay(node('div','REVALIDATION','eyebrow'), title, copy, textarea, answer, row, rating);
}

function speakKorean(text) {
  if (!text || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;
  speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang='ko-KR'; utterance.rate=.85; speechSynthesis.speak(utterance);
}

function normalize(value) {
  return String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').replace(/[.!?。！？]+$/g, '');
}

function renderAssessmentOverlay(record, meta) {
  const question = meta.kind === 'formal' ? meta.question : meta.item;
  const prompt = question.q || question.prompt;
  const body = [];
  body.push(node('div', meta.kind === 'formal' ? 'FORMAL TEST REVALIDATION' : 'KOREAN EXIT REVALIDATION', 'eyebrow'));
  body.push(node('h2', prompt));
  body.push(node('p', '这次只重测真正答错的知识点。答对后对应 ErrorRecord 自动 resolved；答错则继续保留。', 'al-copy'));

  if (question.type === 'audio_mcq') {
    const audio = node('button', '🔊 播放韩语', 'ghost'); audio.type='button'; audio.addEventListener('click',()=>speakKorean(question.audio)); body.push(audio);
  }

  const resultBox = node('div', '', 'al-result hidden');
  const finish = (correct, selected) => {
    writeAssessmentRevalidation(record, meta, correct, selected);
    resultBox.className = `al-result${correct ? '' : ' warn'}`;
    const explanation = meta.kind === 'formal' ? question.explanation : '';
    resultBox.textContent = correct ? `✓ 重新验证通过。${explanation ? ` ${explanation}` : ''}` : `这次仍未通过，ErrorRecord 会继续保留。${explanation ? ` ${explanation}` : ''}`;
    resultBox.classList.remove('hidden');
  };

  if (question.type === 'typing') {
    const input = document.createElement('input'); input.className='al-input'; input.placeholder='请直接输入答案'; body.push(input);
    const submit = node('button','提交验证','primary'); submit.type='button';
    submit.addEventListener('click',()=>{
      const value=normalize(input.value); if(!value) return;
      const correct=(question.accepted || []).some(answer=>normalize(answer)===value); submit.disabled=true; input.disabled=true; finish(correct,input.value);
    });
    const close=node('button','关闭','ghost'); close.type='button'; close.addEventListener('click',closeOverlay); const row=node('div','','al-row'); row.append(close,submit); body.push(row,resultBox);
  } else {
    const options = node('div', '', 'al-options');
    (question.options || []).forEach((text,index)=>{
      const button=node('button',`${String.fromCharCode(65+index)}. ${text}`,'al-option'); button.type='button';
      button.addEventListener('click',()=>{ options.querySelectorAll('button').forEach(x=>x.disabled=true); finish(index===Number(question.answer),index); }); options.append(button);
    });
    const close=node('button','关闭','ghost'); close.type='button'; close.addEventListener('click',closeOverlay); const row=node('div','','al-row'); row.append(close); body.push(options,resultBox,row);
  }
  showOverlay(...body);
}

function openRevalidation(errorId) {
  const record = activeRecordById(errorId);
  if (!record) return;
  overlayRecord = record;
  const meta = metaForRecord(record);
  if (meta.kind === 'recall') renderRecallOverlay(record, meta);
  else if (meta.kind === 'formal' || meta.kind === 'korean_exit') renderAssessmentOverlay(record, meta);
}

function bindActions() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-adaptive-revalidate]');
    if (!button) return;
    event.preventDefault();
    openRevalidation(button.dataset.adaptiveRevalidate);
  });
}

function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; renderBank(); });
}

function scheduleKoreanProcessing() {
  queueMicrotask(() => { processKoreanExitChecks(); scheduleRender(); });
}

ensureStyles();
ensureBank();
ensureOverlay();
bindActions();
processKoreanExitChecks();
renderBank();
window.addEventListener('learning-data-updated', scheduleKoreanProcessing);
const domainName = document.querySelector('#domainName');
if (domainName) new MutationObserver(scheduleRender).observe(domainName, { childList:true, subtree:true, characterData:true });

window.__ADAPTIVE_LEARNING_V11__ = {
  version: VERSION,
  formalConcepts: formalByConcept.size,
  koreanConcepts: koreanByConcept.size,
  render: renderBank,
  processKoreanExitChecks,
};
