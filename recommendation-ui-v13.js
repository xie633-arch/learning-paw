import { cards as baseCards } from './cards.js';
import { extraCards } from './platform-data.js';
import { recommendationSummary } from './learner-recommendation-v13.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.13.0';
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

function ensureStyles() {
  if (document.querySelector('#recommendationUiV13Styles')) return;
  const style = document.createElement('style');
  style.id = 'recommendationUiV13Styles';
  style.textContent = `
    .rec13-focus{margin-top:10px;padding:12px 13px;border-radius:14px;background:#fff;border:1px solid rgba(17,24,39,.06)}
    .rec13-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.rec13-head b{font-size:12px}.rec13-priority{font-size:10px;font-weight:800;padding:4px 8px;border-radius:999px;background:#f2f4f7;color:#475467}
    .rec13-title{margin:7px 0 2px;font-size:13px;font-weight:800;color:#1d2939}.rec13-action{font-size:11px;line-height:1.55;color:#475467}.rec13-reasons{margin-top:6px;font-size:10px;line-height:1.5;color:#667085}.rec13-empty{font-size:11px;line-height:1.55;color:#667085}
    .rec13-focus.high{border-color:rgba(180,83,9,.18);background:#fffbf5}.rec13-focus.medium{border-color:rgba(37,99,235,.12);background:#f8fbff}
    .rec13-cta{margin-top:8px;min-height:32px;padding:6px 9px;font-size:10px}
    @media(prefers-color-scheme:dark){.rec13-focus{background:#181d24;border-color:#303640}.rec13-focus.high{background:#332a20;border-color:#57432c}.rec13-focus.medium{background:#1b2737;border-color:#31445e}.rec13-title{color:#f3f4f6}.rec13-action,.rec13-reasons,.rec13-empty{color:#aeb7c5}.rec13-priority{background:#2b313b;color:#c0c7d2}}
  `;
  document.head.append(style);
}

function priorityBand(score) {
  if (score >= 70) return { key: 'high', label: '高优先级' };
  if (score >= 40) return { key: 'medium', label: '建议关注' };
  return { key: 'watch', label: '观察' };
}

function recommendationTitle(rec) {
  const card = cardById.get(rec.content_id);
  if (card) return card.category ? `${card.category}｜${card.question}` : card.question;
  return rec.concept_id || rec.content_id || rec.skill || '当前学习焦点';
}

function ensureFocusNode() {
  const shell = document.querySelector('#todayPlanOverview');
  if (!shell) return null;
  let node = shell.querySelector('#recommendationFocusV13');
  if (node) return node;
  node = document.createElement('div');
  node.id = 'recommendationFocusV13';
  const actions = shell.querySelector('.tp12-actions');
  if (actions) actions.before(node); else shell.append(node);
  return node;
}

function bindAction(node, rec) {
  const button = node.querySelector('[data-rec13-action]');
  if (!button) return;
  button.addEventListener('click', () => {
    if (rec.error_id) {
      window.__LEARNING_PAW_UX_V08__?.activateTab?.('weak', { scroll: false });
      const bank = document.querySelector('#adaptiveLearningV11') || document.querySelector('#phoneAdaptiveErrorBank') || document.querySelector('#weakCard');
      bank?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.__LEARNING_PAW_UX_V08__?.activateTab?.('training', { scroll: false });
    document.querySelector('#trainingHub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function render() {
  const node = ensureFocusNode();
  if (!node) return null;
  const domainId = selectedDomainId();
  const summary = recommendationSummary(readState(), domainId, { limit: 3 });
  const top = summary.top;

  if (!top) {
    node.className = 'rec13-focus';
    node.innerHTML = '<div class="rec13-head"><b>推荐焦点</b><span class="rec13-priority">无需插队</span></div><div class="rec13-empty">当前没有足够证据要求额外插队处理；继续课程与正常 FSRS 复习即可。</div>';
  } else {
    const band = priorityBand(top.priority_score);
    const reasons = top.reasons.slice(0, 2).map(reason => reason.text).join('；');
    node.className = `rec13-focus ${band.key}`;
    node.innerHTML = `
      <div class="rec13-head"><b>推荐焦点</b><span class="rec13-priority">${band.label}</span></div>
      <div class="rec13-title"></div>
      <div class="rec13-action"></div>
      <div class="rec13-reasons"></div>
      <button type="button" class="ghost rec13-cta" data-rec13-action>去处理这个焦点</button>`;
    node.querySelector('.rec13-title').textContent = recommendationTitle(top);
    node.querySelector('.rec13-action').textContent = top.action_label;
    node.querySelector('.rec13-reasons').textContent = reasons ? `依据：${reasons}` : '依据：当前 Learner Signal';
    bindAction(node, top);
  }

  window.__RECOMMENDATION_UI_V13__.current = summary;
  return summary;
}

let queued = false;
function scheduleRender() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    render();
  });
}

ensureStyles();
window.__RECOMMENDATION_UI_V13__ = { version: VERSION, current: null, render };
render();
window.addEventListener('learning-data-updated', scheduleRender);
window.addEventListener('storage', scheduleRender);
const domainName = document.querySelector('#domainName');
if (domainName) new MutationObserver(scheduleRender).observe(domainName, { childList: true, subtree: true, characterData: true });
const todayPlan = document.querySelector('#todayPlanOverview');
if (todayPlan) new MutationObserver(scheduleRender).observe(todayPlan, { childList: true, subtree: true });
