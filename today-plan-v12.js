import { cards as baseCards } from './cards.js';
import { curricula, extraCards, tests } from './platform-data.js';
import {
  deriveTodayPracticeStats,
  deriveCompletedLessons,
  hasCompletedAssessment,
} from './study-event-read-model-v12.js';
import { rankActiveErrorRecommendations } from './learner-recommendation-v13.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.12.2';

export const DAILY_REVIEW_LIMIT = 10;
export const DAILY_NEW_LIMIT = 5;
export const DAILY_REVALIDATION_LIMIT = 3;

const DOMAIN_LABELS = {
  phone: '手机产品专家',
  korean: '韩语',
  retail: '商圈与零售',
  industry: '行业与商业',
};

const KOREAN_STAGE_MILESTONES = {
  'ko-day-000': { assessmentId: 'ko-baseline-day0-v1', label: 'Day 0 入学基线' },
  'ko-day-007': { assessmentId: 'ko-week1-check-v1', label: 'Week 1 阶段验收' },
  'ko-day-014': { assessmentId: 'ko-week2-check-v1', label: 'Week 2 阶段验收' },
  'ko-day-021': { assessmentId: 'ko-week3-check-v1', label: 'Week 3 阶段验收' },
  'ko-day-028': { assessmentId: 'ko-month1-check-v1', label: 'Month 1 阶段验收' },
};

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function localDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dueTimestamp(record) {
  if (!record) return Infinity;
  if (record.engine === 'fsrs' && record.card) {
    const value = record.card.due;
    const time = typeof value === 'number' ? value : new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
  }
  const time = Number(record.due);
  return Number.isFinite(time) ? time : 0;
}

function historyDomain(item, cardById) {
  if (item?.domain) return item.domain;
  const card = cardById.get(item?.cardId || item?.card_id);
  if (card?.domain) return card.domain;
  if (item?.deck === '手机产品专家') return 'phone';
  if (item?.deck === '韩语') return 'korean';
  if (item?.deck === '商圈与零售') return 'retail';
  if (item?.deck === '行业与商业') return 'industry';
  return 'unknown';
}

function legacyPracticeStats(state, domainId, cards, dayKey) {
  const history = asArray(state.history);
  const cardById = new Map(cards.map(card => [card.id || card.card_id, card]));
  const todayHistory = history.filter(item => item.day === dayKey && historyDomain(item, cardById) === domainId);
  const beforeTodayIds = new Set(
    history
      .filter(item => item.day !== dayKey && historyDomain(item, cardById) === domainId)
      .map(item => item.cardId || item.card_id)
      .filter(Boolean),
  );
  const newTodayIds = new Set(
    todayHistory
      .filter(item => {
        const id = item.cardId || item.card_id;
        return id && !beforeTodayIds.has(id);
      })
      .map(item => item.cardId || item.card_id),
  );
  return {
    source: 'history-compat',
    reviewedToday: todayHistory.length,
    knownToday: todayHistory.filter(item => item.rating === 'good').length,
    newToday: newTodayIds.size,
    eventCount: todayHistory.length,
  };
}

function assessmentPlan(domainId, state, curriculum, currentLesson, completedSteps) {
  if (domainId === 'korean') {
    const milestone = currentLesson ? KOREAN_STAGE_MILESTONES[currentLesson.id] : null;
    if (!milestone) {
      return {
        kind: 'staged',
        available: true,
        recommended: false,
        label: '阶段验收按课程节点触发',
        assessmentId: null,
      };
    }
    const completed = hasCompletedAssessment(state, {
      domainId: 'korean',
      assessmentId: milestone.assessmentId,
    });
    return {
      kind: 'staged',
      available: true,
      recommended: !completed,
      label: completed ? `${milestone.label}已完成` : milestone.label,
      assessmentId: milestone.assessmentId,
    };
  }

  const assessment = tests[domainId] || null;
  if (!assessment) {
    return { kind: 'none', available: false, recommended: false, label: '暂无正式验收', assessmentId: null };
  }

  const curriculumComplete = Boolean(curriculum?.steps?.length) && completedSteps >= curriculum.steps.length;
  const assessmentId = assessment.assessment_id || `${domainId}-foundation-100-v1`;
  const priorLegacyTest = asArray(state.testResults).some(result => (result.domainId || result.domain) === domainId);
  const completed = hasCompletedAssessment(state, { domainId, assessmentId }) || priorLegacyTest;
  return {
    kind: 'formal',
    available: true,
    recommended: curriculumComplete && !completed,
    label: curriculumComplete && !completed ? '建议完成首次 100 分验收' : '100 分验收可用',
    assessmentId,
  };
}

export function buildTodayPlan({
  domainId,
  state = {},
  cards = [...baseCards, ...extraCards],
  curriculum = curricula[domainId],
  now = new Date(),
  dailyReviewLimit = DAILY_REVIEW_LIMIT,
  dailyNewLimit = DAILY_NEW_LIMIT,
  dailyRevalidationLimit = DAILY_REVALIDATION_LIMIT,
} = {}) {
  if (!domainId || !DOMAIN_LABELS[domainId]) throw new Error(`Unknown learning domain: ${domainId || 'missing'}`);

  const schedules = asObject(state.schedules);
  const nowDate = now instanceof Date ? now : new Date(now);
  const timestamp = nowDate.getTime();
  const dayKey = localDayKey(nowDate);
  const domainCards = cards.filter(card => card.domain === domainId);

  const steps = asArray(curriculum?.steps);
  const completedLessonIds = deriveCompletedLessons(state, domainId);
  const completedSteps = steps.filter(step => completedLessonIds.has(step.id)).length;
  const currentLesson = steps.find(step => !completedLessonIds.has(step.id)) || null;

  const scheduledDue = domainCards
    .filter(card => schedules[card.id] && dueTimestamp(schedules[card.id]) <= timestamp)
    .sort((a, b) => dueTimestamp(schedules[a.id]) - dueTimestamp(schedules[b.id]));
  const unseen = domainCards.filter(card => !schedules[card.id]);

  const eventPractice = deriveTodayPracticeStats(state, domainId, nowDate);
  const legacyPractice = legacyPracticeStats(state, domainId, cards, dayKey);
  const useStudyEvents = eventPractice.eventCount > 0 || asArray(state.history).length === 0;
  const practice = useStudyEvents ? eventPractice : legacyPractice;

  const remainingReview = Math.max(0, dailyReviewLimit - practice.reviewedToday);
  const remainingNew = Math.max(0, dailyNewLimit - practice.newToday);
  const duePlanned = Math.min(scheduledDue.length, remainingReview);
  const newPlanned = Math.min(unseen.length, remainingNew, Math.max(0, remainingReview - duePlanned));

  const rankedErrors = rankActiveErrorRecommendations(state, domainId, { now: nowDate });
  const activeErrors = rankedErrors.map(entry => entry.error);
  const plannedEntries = rankedErrors.slice(0, dailyRevalidationLimit);
  const plannedErrors = plannedEntries.map(entry => entry.error);

  const assessment = assessmentPlan(domainId, state, curriculum, currentLesson, completedSteps);

  const lessonAction = currentLesson ? 1 : 0;
  const reviewAction = duePlanned + newPlanned > 0 ? 1 : 0;
  const revalidationAction = plannedErrors.length > 0 ? 1 : 0;
  const assessmentAction = assessment.recommended ? 1 : 0;

  return {
    version: VERSION,
    domainId,
    domainLabel: DOMAIN_LABELS[domainId],
    generatedAt: new Date(timestamp).toISOString(),
    lesson: {
      current: currentLesson ? {
        id: currentLesson.id,
        title: currentLesson.title,
        summary: currentLesson.summary,
      } : null,
      completed: completedSteps,
      total: steps.length,
      complete: steps.length > 0 && completedSteps >= steps.length,
      source: completedLessonIds.size > 0 ? 'StudyEvent + compatibility bridge' : 'curriculum',
    },
    review: {
      source: practice.source,
      scheduledDue: scheduledDue.length,
      unseen: unseen.length,
      reviewedToday: practice.reviewedToday,
      knownToday: practice.knownToday,
      newToday: practice.newToday,
      duePlanned,
      newPlanned,
      count: duePlanned + newPlanned,
      available: scheduledDue.length + unseen.length,
      dailyLimit: dailyReviewLimit,
      dailyNewLimit,
    },
    revalidation: {
      source: 'LearnerRecommendation + ErrorRecord',
      active: activeErrors.length,
      highSeverity: activeErrors.filter(record => record.severity === 'high').length,
      planned: plannedErrors.length,
      limit: dailyRevalidationLimit,
      errorIds: plannedErrors.map(record => record.error_id).filter(Boolean),
      recommendationScores: plannedEntries.map(entry => entry.priority_score),
      actions: plannedEntries.map(entry => entry.action),
      recommendationIds: plannedEntries.map(entry => entry.recommendation?.recommendation_id || null),
    },
    assessment,
    workload: {
      actionGroups: lessonAction + reviewAction + revalidationAction + assessmentAction,
      lesson: lessonAction,
      review: reviewAction,
      revalidation: revalidationAction,
      assessment: assessmentAction,
    },
  };
}

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function selectedDomainId() {
  const selected = document.querySelector('#domainGrid [data-domain].selected')?.dataset.domain;
  if (selected && DOMAIN_LABELS[selected]) return selected;
  const saved = readState()?.preferences?.lastDomain;
  if (saved && DOMAIN_LABELS[saved]) return saved;
  const name = document.querySelector('#domainName')?.textContent?.trim();
  return Object.entries(DOMAIN_LABELS).find(([, label]) => label === name)?.[0] || 'phone';
}

function ensureStyles() {
  if (document.querySelector('#todayPlanV12Styles')) return;
  const style = document.createElement('style');
  style.id = 'todayPlanV12Styles';
  style.textContent = `
    .tp12-shell{margin:16px 0 4px;padding:14px;border:1px solid rgba(17,24,39,.08);border-radius:18px;background:rgba(248,250,252,.88)}
    .tp12-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.tp12-head strong{font-size:13px}.tp12-badge{padding:4px 8px;border-radius:999px;background:#eef2f6;color:#475467;font-size:10px;font-weight:800}
    .tp12-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:10px}.tp12-item{padding:11px;border-radius:14px;background:#fff;border:1px solid rgba(17,24,39,.06)}.tp12-item b{display:block;font-size:12px;margin-bottom:4px}.tp12-item span{display:block;color:#667085;font-size:11px;line-height:1.55}.tp12-item.priority{border-color:rgba(180,83,9,.18);background:#fffbf5}.tp12-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.tp12-actions button{min-height:34px;padding:7px 10px;font-size:11px}
    @media(max-width:520px){.tp12-grid{grid-template-columns:1fr}}
    @media(prefers-color-scheme:dark){.tp12-shell{background:#20252d;border-color:#303640}.tp12-badge{background:#2b313b;color:#c0c7d2}.tp12-item{background:#181d24;border-color:#303640}.tp12-item span{color:#aeb7c5}.tp12-item.priority{background:#332a20;border-color:#57432c}}
  `;
  document.head.append(style);
}

function ensureShell() {
  const card = document.querySelector('#todayLearningCard');
  if (!card) return null;
  let shell = card.querySelector('#todayPlanOverview');
  if (shell) return shell;
  shell = document.createElement('div');
  shell.id = 'todayPlanOverview';
  shell.className = 'tp12-shell';
  const buttons = card.querySelector('.button-row');
  if (buttons) buttons.before(shell); else card.append(shell);
  return shell;
}

function syncHeroStats(plan) {
  const reviewed = document.querySelector('#reviewedToday');
  const known = document.querySelector('#knownToday');
  if (reviewed) reviewed.textContent = String(plan.review.reviewedToday);
  if (known) known.textContent = String(plan.review.knownToday);
}

function render() {
  const shell = ensureShell();
  if (!shell) return null;
  const domainId = selectedDomainId();
  const plan = buildTodayPlan({ domainId, state: readState() });
  syncHeroStats(plan);

  const lessonText = plan.lesson.current
    ? plan.lesson.current.title
    : plan.lesson.total ? '课程路线已完成' : '当前没有课程任务';
  const reviewText = plan.review.count > 0
    ? `${plan.review.count} 张：到期 ${plan.review.duePlanned} + 新卡 ${plan.review.newPlanned}`
    : plan.review.available > 0 ? '今日建议额度已完成，可自选加练' : '当前没有复习任务';
  const weakText = plan.revalidation.planned > 0
    ? `${plan.revalidation.planned} 项优先重验证${plan.revalidation.active > plan.revalidation.planned ? `（共 ${plan.revalidation.active} 项 active）` : ''}`
    : '当前没有需要重验证的错误';
  const assessmentText = plan.assessment.label || '当前无需额外验收';

  shell.innerHTML = `
    <div class="tp12-head"><strong>统一 Today Plan</strong><span class="tp12-badge">${plan.workload.actionGroups} 个行动组</span></div>
    <div class="tp12-grid">
      <div class="tp12-item${plan.lesson.current ? ' priority' : ''}"><b>① 课程</b><span>${lessonText}</span></div>
      <div class="tp12-item${plan.review.count ? ' priority' : ''}"><b>② 复习</b><span>${reviewText}</span></div>
      <div class="tp12-item${plan.revalidation.planned ? ' priority' : ''}"><b>③ 薄弱重验证</b><span>${weakText}</span></div>
      <div class="tp12-item${plan.assessment.recommended ? ' priority' : ''}"><b>④ 验收</b><span>${assessmentText}</span></div>
    </div>
    <div class="tp12-actions">
      ${plan.review.count ? '<button type="button" class="ghost" data-tp12-target="training">去训练</button>' : ''}
      ${plan.revalidation.planned ? '<button type="button" class="ghost" data-tp12-target="weak">去薄弱</button>' : ''}
      ${plan.assessment.recommended && plan.assessment.kind === 'formal' ? '<button type="button" class="ghost" data-tp12-target="training">去验收</button>' : ''}
    </div>`;

  shell.querySelectorAll('[data-tp12-target]').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.tp12Target;
      window.__LEARNING_PAW_UX_V08__?.activateTab?.(target, { scroll: false });
      document.querySelector(target === 'weak' ? '#weakCard' : '#trainingHub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  window.__TODAY_PLAN_V12__.current = plan;
  return plan;
}

let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    render();
  });
}

ensureStyles();
ensureShell();

window.__TODAY_PLAN_V12__ = {
  version: VERSION,
  dailyReviewLimit: DAILY_REVIEW_LIMIT,
  dailyNewLimit: DAILY_NEW_LIMIT,
  dailyRevalidationLimit: DAILY_REVALIDATION_LIMIT,
  build: domainId => buildTodayPlan({ domainId, state: readState() }),
  render,
  current: null,
};

render();
window.addEventListener('learning-data-updated', scheduleRender);
window.addEventListener('storage', scheduleRender);
const domainName = document.querySelector('#domainName');
if (domainName) new MutationObserver(scheduleRender).observe(domainName, { childList: true, subtree: true, characterData: true });
