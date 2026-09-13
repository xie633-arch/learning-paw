import { phoneKnowledgeTopics } from './phone-knowledge-v09.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.10.0';
const SKILL = 'product_judgment';
const ASSESSMENT_ID = 'phone-product-lab-v1';

const caseMeta = {
  'refresh-120hz': {
    index: 0,
    title: '同样 120 Hz，屏幕体验就一样吗？',
    correct: 1,
    conceptIds: ['refresh-rate', 'frame-time', 'ltpo'],
  },
  'cpu-cores-ghz': {
    index: 1,
    title: '“几核 / GHz”为什么不能直接排性能？',
    correct: 2,
    conceptIds: ['cpu-core-count', 'cpu-clock', 'cpu-ipc'],
  },
  'battery-capacity': {
    index: 2,
    title: '电池越大，续航就一定越长吗？',
    correct: 1,
    conceptIds: ['mah-wh', 'charge-curve', 'perf-watt'],
  },
  'camera-pixels': {
    index: 3,
    title: '长焦 5000 万像素，就一定比 1200 万更强吗？',
    correct: 1,
    conceptIds: ['pixel', 'focal-length', 'aperture'],
  },
  'thermal-sustained': {
    index: 4,
    title: '为什么 VC 均热板属于“性能课”？',
    correct: 1,
    conceptIds: ['vc-thermal', 'thermal-throttling', 'sustained-performance'],
  },
};

const conceptMap = new Map();
phoneKnowledgeTopics.forEach(topic => {
  topic.concepts.forEach(concept => conceptMap.set(concept.id, { ...concept, topicTitle: topic.title }));
});

const revalidationPending = new Set();
let renderQueued = false;

function safeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function selectedDomainIsPhone() {
  return document.querySelector('#domainName')?.textContent?.trim() === '手机产品专家';
}

function writeAttempt(caseId, selectedIndex, isRevalidation) {
  const meta = caseMeta[caseId];
  if (!meta) return null;
  const correct = selectedIndex === meta.correct;
  const state = readState();
  const events = Array.isArray(state.studyEvents) ? [...state.studyEvents] : [];
  const occurredAt = new Date().toISOString();
  const attemptId = safeId(`product-lab-${caseId}`);

  meta.conceptIds.forEach(conceptId => {
    events.push({
      schema_version: '1.0',
      event_id: `${attemptId}-${conceptId}`,
      occurred_at: occurredAt,
      domain: 'phone',
      event_type: 'assessment_attempt',
      content_id: `product-lab:${caseId}`,
      concept_id: conceptId,
      skill: SKILL,
      result: {
        rating: null,
        correct,
        score: correct ? 1 : 0,
        max_score: 1,
        confidence: null,
      },
      duration_ms: null,
      session_id: attemptId,
      source: 'phone_product_lab',
      device_id: null,
      algorithm: 'objective_scoring',
      assessment_id: ASSESSMENT_ID,
      selected_answer: selectedIndex,
      correct_answer: meta.correct,
      case_id: caseId,
      revalidation: Boolean(isRevalidation),
      revalidation_error_type: 'assessment_error',
    });
  });

  state.studyEvents = events;
  const progress = state.productLabProgress && typeof state.productLabProgress === 'object'
    ? { ...state.productLabProgress }
    : {};
  const prior = progress[caseId] || { attempts: 0, revalidations: 0 };
  progress[caseId] = {
    ...prior,
    attempts: Number(prior.attempts || 0) + 1,
    revalidations: Number(prior.revalidations || 0) + (isRevalidation ? 1 : 0),
    last_correct: correct,
    last_attempt_at: occurredAt,
    needs_revalidation: !correct,
    last_attempt_type: isRevalidation ? 'revalidation' : 'initial',
  };
  state.productLabProgress = progress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return { correct, meta, isRevalidation };
}

function ensureStyles() {
  if (document.querySelector('#phoneAdaptiveV10Styles')) return;
  const style = document.createElement('style');
  style.id = 'phoneAdaptiveV10Styles';
  style.textContent = `
    .pa-shell { margin-top:18px; padding-top:16px; border-top:1px solid rgba(23,32,51,.08); }
    .pa-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .pa-head h3 { margin:2px 0 4px; font-size:18px; }
    .pa-count { flex:0 0 auto; padding:6px 9px; border-radius:999px; background:#fff2e8; color:#9a4d13; font-size:11px; font-weight:800; }
    .pa-count.clear { background:#edf7ef; color:#2f6a45; }
    .pa-list { display:grid; gap:10px; margin-top:12px; }
    .pa-case { border:1px solid rgba(23,32,51,.08); border-radius:16px; padding:13px; background:#fff; }
    .pa-case.resolved { opacity:.72; background:#f8faf9; }
    .pa-case-top { display:flex; gap:10px; justify-content:space-between; align-items:flex-start; }
    .pa-case-title { font-weight:850; color:#1f2937; line-height:1.45; }
    .pa-status { flex:0 0 auto; font-size:10px; font-weight:850; padding:5px 8px; border-radius:999px; background:#fff0ed; color:#b54736; }
    .pa-status.resolved { background:#edf7ef; color:#2f6a45; }
    .pa-concepts { display:flex; flex-wrap:wrap; gap:6px; margin:9px 0; }
    .pa-chip { padding:4px 7px; border-radius:999px; background:#f2f4f7; color:#667085; font-size:10px; font-weight:750; }
    .pa-remedy { margin:8px 0; border-radius:13px; background:#f8fafc; padding:0 11px; }
    .pa-remedy summary { cursor:pointer; padding:10px 0; font-size:12px; font-weight:800; color:#475467; }
    .pa-concept-card { padding:10px 0; border-top:1px solid #eaecf0; }
    .pa-concept-card strong { display:block; font-size:12px; color:#344054; margin-bottom:4px; }
    .pa-concept-card p { margin:4px 0; color:#667085; font-size:11px; line-height:1.6; }
    .pa-trap { color:#9a4d13 !important; }
    .pa-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
    .pa-actions button { min-height:38px; padding:8px 11px; font-size:12px; }
    .pa-empty { margin-top:10px; padding:13px; border-radius:14px; background:#f4f8f5; color:#56705f; font-size:12px; line-height:1.6; }
    .pl-adaptive-note { margin-top:12px; padding:11px 12px; border-radius:13px; background:#f7f8fa; color:#5f6878; font-size:12px; line-height:1.6; }
    .pl-adaptive-note.wrong { background:#fff5ed; color:#9a4d13; }
    .pl-adaptive-note.resolved { background:#eef8f0; color:#2f6a45; }
    .pl-adaptive-note button { margin-top:8px; min-height:36px; padding:7px 10px; font-size:12px; }
    .pl-revalidation-banner { margin:0 0 12px; padding:10px 12px; border-radius:12px; background:#eef4ff; color:#34558b; font-size:12px; line-height:1.55; }
    @media (prefers-color-scheme:dark) {
      .pa-case { background:#181d24; border-color:#303640; }
      .pa-case.resolved { background:#1c2320; }
      .pa-case-title { color:#f3f4f6; }
      .pa-chip,.pa-remedy,.pl-adaptive-note { background:#242a32; color:#aeb7c5; }
      .pa-concept-card { border-color:#303640; }
      .pa-concept-card strong { color:#e5e7eb; }
      .pa-concept-card p { color:#aeb7c5; }
      .pl-adaptive-note.wrong { background:#31251a; color:#f1b779; }
      .pl-adaptive-note.resolved { background:#1f3025; color:#9bd1aa; }
      .pl-revalidation-banner { background:#202c41; color:#a9c4f2; }
    }
  `;
  document.head.append(style);
}

function ensureErrorBank() {
  const weakCard = document.querySelector('#weakCard');
  if (!weakCard || document.querySelector('#phoneAdaptiveErrorBank')) return;
  const shell = document.createElement('div');
  shell.id = 'phoneAdaptiveErrorBank';
  shell.className = 'pa-shell';
  shell.innerHTML = `
    <div class="pa-head">
      <div><p class="eyebrow">ADAPTIVE LOOP · V1</p><h3>Product Lab Error Bank</h3></div>
      <span id="phoneAdaptiveCount" class="pa-count">0 active</span>
    </div>
    <p class="muted small">真实判断题答错后进入这里。先补 Concept，再回原案例重新验证；通过后自动 resolved。</p>
    <div id="phoneAdaptiveList" class="pa-list"></div>
  `;
  const weakList = weakCard.querySelector('#weakList');
  if (weakList) weakList.after(shell);
  else weakCard.append(shell);
}

function productLabRecords() {
  const state = readState();
  return (Array.isArray(state.errorRecords) ? state.errorRecords : [])
    .filter(record => record.domain === 'phone' && record.skill === SKILL && String(record.content_id || '').startsWith('product-lab:'));
}

function groupRecords(records) {
  const groups = new Map();
  records.forEach(record => {
    const caseId = String(record.content_id || '').replace(/^product-lab:/, '');
    if (!caseMeta[caseId]) return;
    const group = groups.get(caseId) || { caseId, records: [] };
    group.records.push(record);
    groups.set(caseId, group);
  });
  return [...groups.values()].sort((a, b) => caseMeta[a.caseId].index - caseMeta[b.caseId].index);
}

function conceptRemedyHtml(conceptId) {
  const concept = conceptMap.get(conceptId);
  if (!concept) return '';
  return `
    <div class="pa-concept-card">
      <strong>${concept.name} · ${concept.topicTitle}</strong>
      <p>${concept.one}</p>
      <p><b>为什么重要：</b>${concept.why}</p>
      <p class="pa-trap"><b>常见误区：</b>${concept.trap}</p>
    </div>
  `;
}

function renderErrorBank() {
  ensureErrorBank();
  const shell = document.querySelector('#phoneAdaptiveErrorBank');
  const list = document.querySelector('#phoneAdaptiveList');
  const count = document.querySelector('#phoneAdaptiveCount');
  if (!shell || !list || !count) return;

  shell.classList.toggle('hidden', !selectedDomainIsPhone());
  if (!selectedDomainIsPhone()) return;

  const groups = groupRecords(productLabRecords());
  const active = groups.filter(group => group.records.some(record => record.status === 'active'));
  const resolved = groups.filter(group => !group.records.some(record => record.status === 'active'));
  count.textContent = `${active.length} active`;
  count.classList.toggle('clear', active.length === 0);

  if (!groups.length) {
    list.innerHTML = '<div class="pa-empty">还没有 Product Lab 错误。这里不会因为“知识库很大”自动制造任务；只有真实判断失误才进入 Error Bank。</div>';
    return;
  }

  list.innerHTML = [...active, ...resolved].map(group => {
    const meta = caseMeta[group.caseId];
    const isActive = group.records.some(record => record.status === 'active');
    const conceptIds = [...new Set(group.records.map(record => record.concept_id).filter(Boolean))];
    const occurrences = Math.max(...group.records.map(record => Number(record.occurrences || 0)), 0);
    return `
      <div class="pa-case${isActive ? '' : ' resolved'}" data-error-case="${group.caseId}">
        <div class="pa-case-top">
          <div class="pa-case-title">${meta.title}</div>
          <span class="pa-status${isActive ? '' : ' resolved'}">${isActive ? `待补救 · ${occurrences}x` : '已解决'}</span>
        </div>
        <div class="pa-concepts">${conceptIds.map(id => `<span class="pa-chip">${conceptMap.get(id)?.name || id}</span>`).join('')}</div>
        ${isActive ? `
          <details class="pa-remedy">
            <summary>查看补救卡 · 先复习这些 Concept</summary>
            ${conceptIds.map(conceptRemedyHtml).join('')}
          </details>
          <div class="pa-actions"><button type="button" class="primary" data-pa-revalidate="${group.caseId}">补救后重新验证</button></div>
        ` : '<div class="muted small">已经通过后续重新验证。保留历史记录，但不再算当前薄弱。</div>'}
      </div>
    `;
  }).join('');
}

function activeNavButton(kind) {
  if (kind === 'weak') {
    const mobile = document.querySelector('#mobileBottomNav button[data-target="weakCard"]');
    const desktop = document.querySelector('#uxDesktopTabs button[data-ux-tab="weak"]');
    return window.matchMedia('(max-width: 720px)').matches ? mobile : desktop;
  }
  if (kind === 'route') {
    const mobile = document.querySelector('#mobileBottomNav button[data-target="routeCard"]');
    const desktop = document.querySelector('#uxDesktopTabs button[data-ux-tab="route"]');
    return window.matchMedia('(max-width: 720px)').matches ? mobile : desktop;
  }
  return null;
}

function goToWeak() {
  activeNavButton('weak')?.click();
  requestAnimationFrame(() => document.querySelector('#phoneAdaptiveErrorBank')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function prepareCaseForRevalidation(caseId) {
  const meta = caseMeta[caseId];
  if (!meta) return;
  revalidationPending.add(caseId);
  activeNavButton('route')?.click();

  requestAnimationFrame(() => {
    const tabs = document.querySelectorAll('#phoneProductLabTabs .pl-tab');
    tabs[meta.index]?.click();
    requestAnimationFrame(() => {
      const caseNode = document.querySelector(`#phoneProductLabBody .pl-case[data-case-id="${caseId}"]`);
      if (!caseNode) return;
      caseNode.querySelectorAll('.pl-option').forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'wrong');
      });
      caseNode.querySelector('.pl-feedback')?.classList.remove('show');
      caseNode.querySelector('#phoneProductLabNext')?.remove();
      if (!caseNode.querySelector('.pl-revalidation-banner')) {
        const banner = document.createElement('div');
        banner.className = 'pl-revalidation-banner';
        banner.textContent = '重新验证模式：请在补救后重新独立判断。本次答对会把对应 ErrorRecord 标记为 resolved；答错则继续保留。';
        caseNode.querySelector('.pl-prompt')?.before(banner);
      }
      document.querySelector('#phoneProductLab')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function attachFeedbackNote(caseId, result) {
  const feedback = document.querySelector(`#phoneProductLabBody .pl-case[data-case-id="${caseId}"] .pl-feedback`);
  if (!feedback || feedback.querySelector('.pl-adaptive-note')) return;
  const note = document.createElement('div');
  if (!result.correct) {
    note.className = 'pl-adaptive-note wrong';
    note.innerHTML = `这次错误已经进入 <strong>Error Bank</strong>，对应 ${result.meta.conceptIds.length} 个核心 Concept。<br><button type="button" class="ghost" data-pa-go-weak="1">去薄弱页补救</button>`;
  } else if (result.isRevalidation) {
    note.className = 'pl-adaptive-note resolved';
    note.textContent = '✓ 重新验证通过：对应 Product Lab ErrorRecord 已自动标记为 resolved。';
  } else {
    note.className = 'pl-adaptive-note';
    note.textContent = '✓ 本次判断已记录到 Learner Signal。正确首次作答不会制造 Error Bank 任务。';
  }
  feedback.append(note);
}

function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    renderErrorBank();
  });
}

function bindProductLabAttempts() {
  document.addEventListener('click', event => {
    const option = event.target.closest('#phoneProductLabBody .pl-option');
    if (!option || option.disabled) return;
    const caseNode = option.closest('.pl-case[data-case-id]');
    const caseId = caseNode?.dataset.caseId;
    const meta = caseMeta[caseId];
    if (!meta) return;
    const selectedIndex = Number(option.dataset.option);
    const isRevalidation = revalidationPending.has(caseId);

    queueMicrotask(() => {
      const result = writeAttempt(caseId, selectedIndex, isRevalidation);
      if (!result) return;
      if (isRevalidation) revalidationPending.delete(caseId);
      attachFeedbackNote(caseId, result);
      scheduleRender();
    });
  }, true);
}

function bindAdaptiveActions() {
  document.addEventListener('click', event => {
    const weakButton = event.target.closest('[data-pa-go-weak]');
    if (weakButton) {
      event.preventDefault();
      goToWeak();
      return;
    }
    const revalidate = event.target.closest('[data-pa-revalidate]');
    if (revalidate) {
      event.preventDefault();
      prepareCaseForRevalidation(revalidate.dataset.paRevalidate);
    }
  });
}

function bindDomainObserver() {
  const domainName = document.querySelector('#domainName');
  if (!domainName) return;
  new MutationObserver(scheduleRender).observe(domainName, { childList: true, subtree: true, characterData: true });
}

ensureStyles();
ensureErrorBank();
bindProductLabAttempts();
bindAdaptiveActions();
bindDomainObserver();
renderErrorBank();
window.addEventListener('learning-data-updated', scheduleRender);

window.__PHONE_ADAPTIVE_V10__ = {
  version: VERSION,
  cases: Object.keys(caseMeta).length,
  skill: SKILL,
  prepareCaseForRevalidation,
  render: renderErrorBank,
};
