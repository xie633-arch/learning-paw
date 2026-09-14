import { koreanAssessments } from './korean-assessment-data-v05.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.11.2';
let renderQueued = false;

const itemByConcept = new Map();
const itemById = new Map();
Object.entries(koreanAssessments).forEach(([assessmentKey, assessment]) => {
  if (assessmentKey === 'baseline' || !Array.isArray(assessment.items)) return;
  assessment.items.forEach((item, index) => {
    const meta = { assessmentKey, assessment, item, index };
    itemById.set(item.item_id, meta);
    (item.concept_ids || []).forEach(conceptId => itemByConcept.set(conceptId, meta));
  });
});

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function safeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalize(value) {
  return String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').replace(/[.!?。！？]+$/g, '');
}

function selectedDomainIsKorean() {
  const selected = document.querySelector('#domainGrid [data-domain].selected')?.dataset.domain;
  if (selected) return selected === 'korean';
  return document.querySelector('#domainName')?.textContent?.trim() === '韩语';
}

function metaForRecord(record) {
  return itemByConcept.get(record.concept_id) || itemById.get(record.content_id) || null;
}

function activeStageRecords() {
  const state = readState();
  return (Array.isArray(state.errorRecords) ? state.errorRecords : [])
    .filter(record => record.domain === 'korean' && record.status === 'active' && metaForRecord(record));
}

function ensureStyles() {
  if (document.querySelector('#koreanStageAdaptiveStyles')) return;
  const style = document.createElement('style');
  style.id = 'koreanStageAdaptiveStyles';
  style.textContent = `
    .ksa-section{margin-top:14px;padding-top:14px;border-top:1px dashed rgba(23,32,51,.12)}
    .ksa-title-row{display:flex;justify-content:space-between;align-items:center;gap:10px}.ksa-title-row strong{font-size:13px}.ksa-count{padding:4px 7px;border-radius:999px;background:#eef4ff;color:#34558b;font-size:10px;font-weight:800}
    .ksa-list{display:grid;gap:10px;margin-top:10px}.ksa-item{padding:12px;border-radius:14px;background:#f8fafc;border:1px solid rgba(23,32,51,.08)}.ksa-item h4{margin:0 0 6px;font-size:13px;line-height:1.5}.ksa-meta{font-size:11px;color:#667085;line-height:1.55}.ksa-actions{margin-top:9px}.ksa-actions button{min-height:36px;padding:7px 10px;font-size:12px}
    .ksa-overlay{position:fixed;inset:0;z-index:1780;background:rgba(15,23,42,.5);display:grid;place-items:center;padding:18px}.ksa-panel{width:min(700px,100%);max-height:92vh;overflow:auto;background:#fff;color:#111827;border-radius:24px;padding:22px;box-shadow:0 28px 90px rgba(15,23,42,.28)}.ksa-panel h2{font-size:24px;line-height:1.35;margin:6px 0 12px}.ksa-copy{color:#667085;line-height:1.7}.ksa-options{display:grid;gap:10px;margin-top:14px}.ksa-option{width:100%;text-align:left;padding:13px 15px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827}.ksa-input{width:100%;box-sizing:border-box;padding:13px 15px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827;font:inherit}.ksa-result{margin-top:14px;padding:13px;border-radius:14px;background:#eef7f0;color:#28543a;line-height:1.65}.ksa-result.warn{background:#fff5e8;color:#7a4b12}.ksa-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.ksa-audio{margin:4px 0 10px}
    @media(max-width:720px){.ksa-overlay{padding:0;background:#fff}.ksa-panel{width:100%;height:100%;max-height:none;border-radius:0;padding:20px 18px calc(28px + env(safe-area-inset-bottom))}}
    @media(prefers-color-scheme:dark){.ksa-item,.ksa-panel,.ksa-option,.ksa-input{background:#181d24;color:#f3f4f6;border-color:#303640}.ksa-item{background:#20252d}.ksa-meta,.ksa-copy{color:#aeb7c5}.ksa-result{background:#1f3025;color:#9bd1aa}.ksa-result.warn{background:#382d1f;color:#f2c98d}}
  `;
  document.head.append(style);
}

function ensureSection() {
  const generic = document.querySelector('#adaptiveLearningV11');
  if (!generic) return null;
  let section = document.querySelector('#koreanStageAdaptive');
  if (section) return section;
  section = document.createElement('div');
  section.id = 'koreanStageAdaptive';
  section.className = 'ksa-section';
  section.innerHTML = `
    <div class="ksa-title-row"><strong>韩语阶段验收错题</strong><span id="koreanStageAdaptiveCount" class="ksa-count">0</span></div>
    <p class="muted small">Week 1 / 2 / 3 / Month 1 的客观错题会在这里按原题单独重测；通过后自动 resolved，不要求整套考试重做。</p>
    <div id="koreanStageAdaptiveList" class="ksa-list"></div>`;
  generic.append(section);
  return section;
}

function hideGenericDuplicates(records) {
  const ids = new Set(records.map(record => record.error_id));
  document.querySelectorAll('#adaptiveLearningList [data-adaptive-error]').forEach(row => {
    const shouldHide = ids.has(row.dataset.adaptiveError);
    if (row.classList.contains('hidden') !== shouldHide) row.classList.toggle('hidden', shouldHide);
  });
}

function render() {
  const section = ensureSection();
  if (!section) return;
  const records = activeStageRecords();
  const visible = selectedDomainIsKorean();
  section.classList.toggle('hidden', !visible);
  hideGenericDuplicates(records);
  if (!visible) return;

  const count = section.querySelector('#koreanStageAdaptiveCount');
  const list = section.querySelector('#koreanStageAdaptiveList');
  count.textContent = String(records.length);
  if (!records.length) {
    list.innerHTML = '<div class="al-empty">当前没有阶段验收错题。Week 1 / 2 / 3 / Month 1 出现客观失误后会自动进入这里。</div>';
    return;
  }

  list.innerHTML = records.slice(0, 12).map(record => {
    const meta = metaForRecord(record);
    const item = meta.item;
    return `<div class="ksa-item" data-ksa-error="${record.error_id}">
      <h4>${item.prompt}</h4>
      <div class="ksa-meta">${meta.assessment.name} · ${item.skill || record.skill || 'general'} · ${item.concept_ids?.[0] || record.concept_id || ''}</div>
      <div class="ksa-actions"><button type="button" class="primary" data-ksa-revalidate="${record.error_id}">单题重新验证</button></div>
    </div>`;
  }).join('');
}

function ensureOverlay() {
  let overlay = document.querySelector('#koreanStageAdaptiveOverlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'koreanStageAdaptiveOverlay';
  overlay.className = 'ksa-overlay hidden';
  overlay.innerHTML = '<div class="ksa-panel" role="dialog" aria-modal="true"><div id="koreanStageAdaptiveBody"></div></div>';
  document.body.append(overlay);
  return overlay;
}

function node(tag, text = '', cls = '') {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (cls) element.className = cls;
  return element;
}

function showOverlay(...nodes) {
  const overlay = ensureOverlay();
  const body = overlay.querySelector('#koreanStageAdaptiveBody');
  body.innerHTML = '';
  nodes.filter(Boolean).forEach(item => body.append(item));
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  document.querySelector('#koreanStageAdaptiveOverlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function speak(text) {
  if (!text || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = .85;
  speechSynthesis.speak(utterance);
}

function writeRevalidation(record, meta, correct, selected) {
  const state = readState();
  state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
  const item = meta.item;
  state.studyEvents.push({
    schema_version: '1.0',
    event_id: safeId('evt-ko-stage-revalidation'),
    occurred_at: new Date().toISOString(),
    domain: 'korean',
    event_type: 'assessment_attempt',
    content_id: item.item_id,
    concept_id: record.concept_id || item.concept_ids?.[0] || null,
    skill: record.skill || item.skill || 'general',
    result: { rating: null, correct, score: correct ? Number(item.max_score || 1) : 0, max_score: Number(item.max_score || 1), confidence: null },
    duration_ms: null,
    session_id: null,
    source: 'adaptive_error_bank',
    device_id: null,
    algorithm: 'targeted_revalidation',
    assessment_id: meta.assessment.assessment_id,
    selected_answer: selected,
    correct_answer: item.type === 'typing' ? (item.accepted_answers || [item.target]) : item.correct_answer,
    prompt: item.prompt,
    revalidation: true,
    revalidation_error_type: 'assessment_error',
  });
  writeState(state);
}

function openRevalidation(errorId) {
  const state = readState();
  const record = (state.errorRecords || []).find(item => item.error_id === errorId && item.status === 'active');
  if (!record) return;
  const meta = metaForRecord(record);
  if (!meta) return;
  const item = meta.item;
  const body = [node('div', 'KOREAN STAGE REVALIDATION', 'eyebrow'), node('h2', item.prompt), node('p', `来自 ${meta.assessment.name}。这里只重测真正答错的知识点；答对后自动 resolved。`, 'ksa-copy')];

  if (item.type === 'audio_mcq') {
    const audio = node('button', '🔊 播放韩语', 'ghost ksa-audio');
    audio.type = 'button';
    audio.addEventListener('click', () => speak(item.audio_text));
    body.push(audio);
  }

  const result = node('div', '', 'ksa-result hidden');
  const close = node('button', '关闭', 'ghost');
  close.type = 'button';
  close.addEventListener('click', closeOverlay);

  const finish = (correct, selected) => {
    writeRevalidation(record, meta, correct, selected);
    result.className = `ksa-result${correct ? '' : ' warn'}`;
    result.textContent = correct
      ? `✓ 重新验证通过。${item.explanation ? ` ${item.explanation}` : ''}`
      : `这次仍未通过，错题会继续保留。${item.explanation ? ` ${item.explanation}` : ''}`;
    result.classList.remove('hidden');
  };

  if (item.type === 'typing') {
    const input = document.createElement('input');
    input.className = 'ksa-input';
    input.placeholder = '请直接输入答案';
    const submit = node('button', '提交验证', 'primary');
    submit.type = 'button';
    submit.addEventListener('click', () => {
      const value = normalize(input.value);
      if (!value) return;
      const accepted = item.accepted_answers || [item.target];
      const correct = accepted.some(answer => normalize(answer) === value);
      input.disabled = true;
      submit.disabled = true;
      finish(correct, input.value);
    });
    const row = node('div', '', 'ksa-row');
    row.append(close, submit);
    body.push(input, row, result);
  } else {
    const options = node('div', '', 'ksa-options');
    (item.options || []).forEach((text, index) => {
      const button = node('button', `${String.fromCharCode(65 + index)}. ${text}`, 'ksa-option');
      button.type = 'button';
      button.addEventListener('click', () => {
        options.querySelectorAll('button').forEach(candidate => { candidate.disabled = true; });
        finish(index === Number(item.correct_answer), index);
      });
      options.append(button);
    });
    const row = node('div', '', 'ksa-row');
    row.append(close);
    body.push(options, result, row);
  }
  showOverlay(...body);
}

function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    render();
  });
}

function bind() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-ksa-revalidate]');
    if (!button) return;
    event.preventDefault();
    openRevalidation(button.dataset.ksaRevalidate);
  });
  window.addEventListener('learning-data-updated', scheduleRender);
  const domainName = document.querySelector('#domainName');
  if (domainName) new MutationObserver(scheduleRender).observe(domainName, { childList: true, subtree: true, characterData: true });
  const genericList = document.querySelector('#adaptiveLearningList');
  if (genericList) new MutationObserver(scheduleRender).observe(genericList, { childList: true, subtree: true });
}

ensureStyles();
ensureSection();
ensureOverlay();
bind();
render();

window.__KOREAN_STAGE_ADAPTIVE_V112__ = {
  version: VERSION,
  trackedItems: itemById.size,
  render,
};
