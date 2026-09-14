import { cards as baseCards } from './cards.js';
import { curricula, extraCards } from './platform-data.js';
import {
  deriveRouteProgress,
  deriveWeakSignals,
  deriveLatestAssessment,
} from './study-event-read-model-v12.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.12.2';
const allCards = [...baseCards, ...extraCards];
const cardById = new Map(allCards.map(card => [card.card_id || card.id, card]));
const DOMAIN_LABELS = {
  phone: '手机产品专家',
  korean: '韩语',
  retail: '商圈与零售',
  industry: '行业与商业',
};

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function selectedDomainId() {
  const selected = document.querySelector('#domainGrid [data-domain].selected')?.dataset.domain;
  if (selected && DOMAIN_LABELS[selected]) return selected;
  const saved = readState()?.preferences?.lastDomain;
  if (saved && DOMAIN_LABELS[saved]) return saved;
  const label = document.querySelector('#domainName')?.textContent?.trim();
  return Object.entries(DOMAIN_LABELS).find(([, name]) => name === label)?.[0] || 'phone';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

function patchRoute(state, domainId) {
  const curriculum = curricula[domainId];
  const routeList = document.querySelector('#routeList');
  const progressText = document.querySelector('#routeProgressText');
  const todayProgress = document.querySelector('#todayProgressText');
  if (!curriculum || !routeList) return null;

  const progress = deriveRouteProgress(state, domainId, curriculum);
  const routeLabel = `完成 ${progress.completed} / ${progress.total}`;
  const todayLabel = `${progress.completed} / ${progress.total}`;
  if (progressText && progressText.textContent !== routeLabel) progressText.textContent = routeLabel;
  if (todayProgress && todayProgress.textContent !== todayLabel) todayProgress.textContent = todayLabel;

  routeList.querySelectorAll('[data-step-id]').forEach(button => {
    const stepId = button.dataset.stepId;
    const item = button.closest('.route-item');
    const done = progress.completedIds.has(stepId);
    const current = progress.current && (progress.current.id || progress.current.lesson_id) === stepId;
    item?.classList.toggle('done', done);
    item?.classList.toggle('current', Boolean(current));
    const indexNode = item?.querySelector('.route-index');
    if (indexNode) {
      const stepIndex = (curriculum.steps || []).findIndex(step => (step.id || step.lesson_id) === stepId);
      const nextIndex = done ? '✓' : String(stepIndex + 1);
      if (indexNode.textContent !== nextIndex) indexNode.textContent = nextIndex;
    }
    const nextButtonText = done ? '取消完成' : '标记完成';
    if (button.textContent !== nextButtonText) button.textContent = nextButtonText;
  });

  return progress;
}

function weakTitle(weak) {
  const card = cardById.get(weak.contentId);
  if (card) return card.category ? `${card.category}｜${card.question}` : card.question;
  return weak.conceptId || weak.contentId || weak.skill || '未命名薄弱点';
}

function weakMeta(weak) {
  const parts = [weak.skill || 'general'];
  if (weak.errorType === 'assessment_error') parts.push('验收错误');
  else if (weak.errorType === 'recall_gap') parts.push('回忆缺口');
  if (weak.occurrences) parts.push(`出现 ${weak.occurrences} 次`);
  if (weak.assessment?.incorrect) parts.push(`客观错 ${weak.assessment.incorrect} 次`);
  if (weak.ratings?.again) parts.push(`不认识 ${weak.ratings.again} 次`);
  return parts.join(' · ');
}

function severityPercent(weak) {
  if (weak.severity === 'high') return 100;
  if (weak.severity === 'medium') return 66;
  return 40;
}

function patchWeak(state, domainId) {
  const weakList = document.querySelector('#weakList');
  const weakButton = document.querySelector('#weakDrillBtn');
  if (!weakList) return [];

  const weak = deriveWeakSignals(state, domainId, 3);
  weakList.innerHTML = '';

  if (!weak.length) {
    const empty = document.createElement('div');
    empty.className = 'weak-empty';
    empty.textContent = 'StudyEvent 当前没有 active 薄弱点。真实错误出现后，会按 Concept × Skill 进入这里并等待针对性重验证。';
    weakList.append(empty);
    if (weakButton) {
      weakButton.disabled = true;
      weakButton.textContent = '暂无重验证';
    }
    return weak;
  }

  weak.forEach(item => {
    const row = document.createElement('div');
    row.className = 'weak-item';

    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = weakTitle(item);
    const meta = document.createElement('span');
    meta.className = 'muted small';
    meta.textContent = weakMeta(item);
    copy.append(title, meta);

    const meterWrap = document.createElement('div');
    const meter = document.createElement('div');
    meter.className = 'weak-meter';
    const bar = document.createElement('span');
    bar.style.width = `${severityPercent(item)}%`;
    meter.append(bar);
    const score = document.createElement('div');
    score.className = 'weak-score';
    score.textContent = `${item.severity === 'high' ? '高优先级' : item.severity === 'medium' ? '中优先级' : '待巩固'} · StudyEvent`;
    meterWrap.append(meter, score);

    row.append(copy, meterWrap);
    weakList.append(row);
  });

  if (weakButton) {
    weakButton.disabled = false;
    weakButton.textContent = '进入重验证';
  }
  return weak;
}

function patchLatestAssessment(state, domainId) {
  const node = document.querySelector('#lastTestResult');
  if (!node) return null;
  const latest = deriveLatestAssessment(state, domainId);
  if (!latest) {
    node.textContent = '当前领域还没有已完成的正式验收记录。';
    return null;
  }

  const score = latest.maxScore > 0 ? `${latest.score} / ${latest.maxScore}` : String(latest.score);
  const label = latest.assessmentId ? `｜${latest.assessmentId}` : '';
  const date = formatDate(latest.completedAt);
  node.textContent = `最近一次正式验收：${score}${label}${date ? `｜${date}` : ''}`;
  return latest;
}

function patchAll() {
  const state = readState();
  const domainId = selectedDomainId();
  const route = patchRoute(state, domainId);
  const weak = patchWeak(state, domainId);
  const latestAssessment = patchLatestAssessment(state, domainId);
  window.__STUDY_EVENT_UI_V122__.current = {
    domainId,
    route: route ? {
      completed: route.completed,
      total: route.total,
      currentId: route.current?.id || route.current?.lesson_id || null,
    } : null,
    weakCount: weak.length,
    latestAssessment,
  };
}

function bindWeakAction() {
  const button = document.querySelector('#weakDrillBtn');
  if (!button || button.dataset.studyEventUiBound === '1') return;
  button.dataset.studyEventUiBound = '1';
  button.addEventListener('click', event => {
    const state = readState();
    const domainId = selectedDomainId();
    if (!deriveWeakSignals(state, domainId, 3).length) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const bank = document.querySelector('#adaptiveLearningV11') || document.querySelector('#phoneAdaptiveErrorBank');
    bank?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, true);
}

let queued = false;
function schedulePatch() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    patchAll();
    bindWeakAction();
  });
}

window.__STUDY_EVENT_UI_V122__ = {
  version: VERSION,
  current: null,
  patch: patchAll,
};

bindWeakAction();
patchAll();
window.addEventListener('learning-data-updated', schedulePatch);
window.addEventListener('storage', schedulePatch);
const domainName = document.querySelector('#domainName');
if (domainName) new MutationObserver(schedulePatch).observe(domainName, { childList: true, subtree: true, characterData: true });
const routeList = document.querySelector('#routeList');
if (routeList) new MutationObserver(schedulePatch).observe(routeList, { childList: true, subtree: true });
