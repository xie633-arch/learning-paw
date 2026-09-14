const VERSION = '0.12.0';

const PRACTICE_EVENT_TYPES = new Set(['practice_attempt', 'listening_attempt', 'review_rating']);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function localDayKey(date) {
  const value = date instanceof Date ? date : new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function eventDay(event) {
  if (event.local_day) return event.local_day;
  if (!event.occurred_at) return null;
  const date = new Date(event.occurred_at);
  return Number.isNaN(date.getTime()) ? null : localDayKey(date);
}

export function practiceEvents(state, domainId) {
  return asArray(state?.studyEvents)
    .filter(event => event.domain === domainId)
    .filter(event => PRACTICE_EVENT_TYPES.has(event.event_type))
    .filter(event => event.revalidation !== true);
}

export function deriveTodayPracticeStats(state, domainId, now = new Date()) {
  const events = practiceEvents(state, domainId)
    .filter(event => event.content_id)
    .sort((a, b) => new Date(a.occurred_at || 0) - new Date(b.occurred_at || 0));
  const today = localDayKey(now);
  const firstSeenDay = new Map();

  events.forEach(event => {
    if (!firstSeenDay.has(event.content_id)) firstSeenDay.set(event.content_id, eventDay(event));
  });

  const todayEvents = events.filter(event => eventDay(event) === today);
  const newTodayIds = new Set(
    todayEvents
      .filter(event => firstSeenDay.get(event.content_id) === today)
      .map(event => event.content_id),
  );

  return {
    source: 'studyEvents',
    reviewedToday: todayEvents.length,
    knownToday: todayEvents.filter(event => event.result?.rating === 'good').length,
    newToday: newTodayIds.size,
    newTodayIds: [...newTodayIds],
    eventCount: events.length,
  };
}

export function deriveCompletedLessons(state, domainId) {
  const ids = new Set();
  asArray(state?.studyEvents).forEach(event => {
    if (event.domain !== domainId) return;
    if (event.event_type !== 'lesson_completed') return;
    if (event.result?.completed === false) return;
    if (event.content_id) ids.add(event.content_id);
  });

  // Compatibility bridge while some screens still write lessonProgress first.
  Object.entries(asObject(state?.lessonProgress)).forEach(([lessonId, completedAt]) => {
    if (completedAt) ids.add(lessonId);
  });

  return ids;
}

export function hasCompletedAssessment(state, { domainId, assessmentId } = {}) {
  if (!domainId && !assessmentId) return false;

  const attempts = asArray(state?.assessmentAttempts);
  if (attempts.some(attempt => {
    if (!attempt.completed_at) return false;
    if (assessmentId && attempt.assessment_id !== assessmentId) return false;
    if (domainId && attempt.domain !== domainId) return false;
    return true;
  })) return true;

  return asArray(state?.studyEvents).some(event => {
    if (event.event_type !== 'assessment_completed') return false;
    if (assessmentId && event.content_id !== assessmentId && event.assessment_id !== assessmentId) return false;
    if (domainId && event.domain !== domainId) return false;
    return true;
  });
}

export function learnerReadModel(state, domainId, now = new Date()) {
  return {
    version: VERSION,
    domainId,
    practice: deriveTodayPracticeStats(state, domainId, now),
    completedLessons: [...deriveCompletedLessons(state, domainId)],
  };
}

if (typeof window !== 'undefined') {
  window.__STUDY_EVENT_READ_MODEL_V12__ = {
    version: VERSION,
    deriveTodayPracticeStats,
    deriveCompletedLessons,
    hasCompletedAssessment,
    learnerReadModel,
  };
}
