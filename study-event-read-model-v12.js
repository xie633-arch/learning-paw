const VERSION = '0.12.2';

const PRACTICE_EVENT_TYPES = new Set(['practice_attempt', 'listening_attempt', 'review_rating']);
const LESSON_EVENT_TYPES = new Set(['lesson_completed', 'curriculum_status_changed']);

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

function eventTime(event) {
  const time = new Date(event?.occurred_at || 0).getTime();
  return Number.isFinite(time) ? time : 0;
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
    .sort((a, b) => eventTime(a) - eventTime(b));
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
  const lessonState = new Map();
  const lessonEventSeen = new Set();

  asArray(state?.studyEvents)
    .filter(event => event.domain === domainId)
    .filter(event => LESSON_EVENT_TYPES.has(event.event_type))
    .filter(event => event.content_id)
    .sort((a, b) => eventTime(a) - eventTime(b))
    .forEach(event => {
      const lessonId = event.content_id;
      lessonEventSeen.add(lessonId);
      if (event.event_type === 'curriculum_status_changed') {
        lessonState.set(lessonId, event.result?.completed === true);
      } else {
        lessonState.set(lessonId, event.result?.completed !== false);
      }
    });

  // Compatibility bridge: only use lessonProgress when the lesson has no StudyEvent fact yet.
  Object.entries(asObject(state?.lessonProgress)).forEach(([lessonId, completedAt]) => {
    if (!completedAt || lessonEventSeen.has(lessonId)) return;
    lessonState.set(lessonId, true);
  });

  return new Set(
    [...lessonState.entries()]
      .filter(([, completed]) => completed)
      .map(([lessonId]) => lessonId),
  );
}

export function deriveRouteProgress(state, domainId, curriculum) {
  const steps = asArray(curriculum?.steps);
  const completedIds = deriveCompletedLessons(state, domainId);
  const completed = steps.filter(step => completedIds.has(step.id || step.lesson_id)).length;
  const current = steps.find(step => !completedIds.has(step.id || step.lesson_id)) || null;
  return {
    source: 'StudyEvent + lessonProgress compatibility bridge',
    completedIds,
    completed,
    total: steps.length,
    current,
    complete: steps.length > 0 && completed >= steps.length,
  };
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

export function deriveLatestAssessment(state, domainId) {
  const attempts = asArray(state?.assessmentAttempts)
    .filter(attempt => attempt.domain === domainId && attempt.completed_at)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

  if (attempts.length) {
    const attempt = attempts[0];
    return {
      source: 'assessmentAttempts',
      assessmentId: attempt.assessment_id || null,
      score: Number(attempt.score || 0),
      maxScore: Number(attempt.max_score || 0),
      completedAt: attempt.completed_at,
      attemptId: attempt.attempt_id || null,
    };
  }

  const completedEvents = asArray(state?.studyEvents)
    .filter(event => event.domain === domainId && event.event_type === 'assessment_completed')
    .sort((a, b) => eventTime(b) - eventTime(a));
  if (!completedEvents.length) return null;

  const event = completedEvents[0];
  return {
    source: 'studyEvents',
    assessmentId: event.assessment_id || event.content_id || null,
    score: Number(event.result?.score || 0),
    maxScore: Number(event.result?.max_score || 0),
    completedAt: event.occurred_at || null,
    attemptId: event.session_id || null,
  };
}

function signalKey(record) {
  const concept = record.concept_id || `content:${record.content_id || 'unknown'}`;
  return `${concept}::${record.skill || 'general'}`;
}

function severityRank(value) {
  if (value === 'high') return 2;
  if (value === 'medium') return 1;
  return 0;
}

export function deriveWeakSignals(state, domainId, limit = 3) {
  const signals = asObject(state?.learnerSignals);
  return asArray(state?.errorRecords)
    .filter(record => record.domain === domainId && record.status === 'active')
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity)
      || Number(b.occurrences || 0) - Number(a.occurrences || 0)
      || new Date(b.last_seen_at || 0).getTime() - new Date(a.last_seen_at || 0).getTime())
    .slice(0, Math.max(0, limit))
    .map(record => {
      const signal = signals[signalKey(record)] || {};
      return {
        source: 'ErrorRecord + LearnerSignal',
        errorId: record.error_id || null,
        conceptId: record.concept_id || null,
        contentId: record.content_id || null,
        skill: record.skill || 'general',
        errorType: record.error_type || 'unknown',
        severity: record.severity || 'medium',
        occurrences: Number(record.occurrences || 0),
        lastSeenAt: record.last_seen_at || null,
        attempts: Number(signal.attempts || 0),
        ratings: signal.ratings || { good: 0, hard: 0, again: 0 },
        assessment: signal.assessment || { correct: 0, incorrect: 0 },
        revalidations: signal.revalidations || { passed: 0, failed: 0 },
      };
    });
}

export function learnerReadModel(state, domainId, now = new Date(), curriculum = null) {
  return {
    version: VERSION,
    domainId,
    practice: deriveTodayPracticeStats(state, domainId, now),
    completedLessons: [...deriveCompletedLessons(state, domainId)],
    route: curriculum ? deriveRouteProgress(state, domainId, curriculum) : null,
    weak: deriveWeakSignals(state, domainId),
    latestAssessment: deriveLatestAssessment(state, domainId),
  };
}

if (typeof window !== 'undefined') {
  window.__STUDY_EVENT_READ_MODEL_V12__ = {
    version: VERSION,
    deriveTodayPracticeStats,
    deriveCompletedLessons,
    deriveRouteProgress,
    hasCompletedAssessment,
    deriveLatestAssessment,
    deriveWeakSignals,
    learnerReadModel,
  };
}
