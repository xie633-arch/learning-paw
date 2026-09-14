import {
  deriveCompletedLessons,
  deriveRouteProgress,
  deriveWeakSignals,
  deriveLatestAssessment,
} from '../study-event-read-model-v12.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const lessonId = 'retail-user-jtbd';
const curriculum = {
  steps: [
    { id: lessonId, title: '用户与 JTBD' },
    { id: 'retail-space', title: '商圈空间' },
  ],
};

const baseState = {
  lessonProgress: {},
  studyEvents: [
    {
      event_id: 'evt-lesson-done',
      occurred_at: '2026-09-14T10:00:00+08:00',
      domain: 'retail',
      event_type: 'lesson_completed',
      content_id: lessonId,
      result: { completed: true },
    },
  ],
  assessmentAttempts: [],
  errorRecords: [],
  learnerSignals: {},
};

const completed = deriveCompletedLessons(baseState, 'retail');
assert(completed.has(lessonId), 'lesson_completed event was not reflected in completed lessons');
let route = deriveRouteProgress(baseState, 'retail', curriculum);
assert(route.completed === 1, `expected 1 completed lesson, got ${route.completed}`);
assert(route.current?.id === 'retail-space', `expected retail-space current lesson, got ${route.current?.id}`);

const resetState = structuredClone(baseState);
resetState.studyEvents.push({
  event_id: 'evt-lesson-reset',
  occurred_at: '2026-09-14T11:00:00+08:00',
  domain: 'retail',
  event_type: 'curriculum_status_changed',
  content_id: lessonId,
  result: { completed: false },
});
resetState.lessonProgress[lessonId] = '2026-09-14T10:00:00+08:00';

const resetCompleted = deriveCompletedLessons(resetState, 'retail');
assert(!resetCompleted.has(lessonId), 'later reset event must override older lesson_completed and legacy lessonProgress');
route = deriveRouteProgress(resetState, 'retail', curriculum);
assert(route.completed === 0, `reset route expected 0 completed, got ${route.completed}`);
assert(route.current?.id === lessonId, `reset route expected first lesson current, got ${route.current?.id}`);

const weakState = {
  errorRecords: [
    {
      error_id: 'err-low', domain: 'retail', concept_id: 'retail.demo', content_id: 'card-demo', skill: 'demo',
      error_type: 'recall_gap', severity: 'medium', occurrences: 1, status: 'active', last_seen_at: '2026-09-14T09:00:00+08:00',
    },
    {
      error_id: 'err-high', domain: 'retail', concept_id: 'retail.need-state', content_id: 'retail-foundation-01', skill: 'need-state',
      error_type: 'assessment_error', severity: 'high', occurrences: 3, status: 'active', last_seen_at: '2026-09-14T12:00:00+08:00',
    },
    {
      error_id: 'err-resolved', domain: 'retail', concept_id: 'retail.o2o', content_id: 'retail-foundation-02', skill: 'o2o',
      error_type: 'assessment_error', severity: 'high', occurrences: 4, status: 'resolved', last_seen_at: '2026-09-14T13:00:00+08:00',
    },
  ],
  learnerSignals: {
    'retail.need-state::need-state': {
      attempts: 4,
      ratings: { good: 0, hard: 0, again: 0 },
      assessment: { correct: 1, incorrect: 3 },
      revalidations: { passed: 0, failed: 1 },
    },
  },
};
const weak = deriveWeakSignals(weakState, 'retail', 3);
assert(weak.length === 2, `expected 2 active weak signals, got ${weak.length}`);
assert(weak[0].errorId === 'err-high', `high severity error should rank first, got ${weak[0].errorId}`);
assert(weak[0].assessment.incorrect === 3, 'learner signal assessment evidence was not merged');

const assessmentState = {
  assessmentAttempts: [
    {
      attempt_id: 'attempt-old', assessment_id: 'retail-foundation-100-v1', domain: 'retail',
      score: 70, max_score: 100, completed_at: '2026-09-13T10:00:00+08:00',
    },
    {
      attempt_id: 'attempt-new', assessment_id: 'retail-foundation-100-v1', domain: 'retail',
      score: 90, max_score: 100, completed_at: '2026-09-14T10:00:00+08:00',
    },
  ],
  studyEvents: [],
};
const latest = deriveLatestAssessment(assessmentState, 'retail');
assert(latest?.attemptId === 'attempt-new', `latest assessment attempt not selected: ${latest?.attemptId}`);
assert(latest.score === 90 && latest.maxScore === 100, 'latest assessment score is incorrect');

const eventOnlyAssessment = deriveLatestAssessment({
  assessmentAttempts: [],
  studyEvents: [
    {
      event_id: 'evt-assessment-complete', occurred_at: '2026-09-14T12:00:00+08:00', domain: 'korean',
      event_type: 'assessment_completed', content_id: 'ko-week1-check-v1', assessment_id: 'ko-week1-check-v1',
      session_id: 'ko-stage-1', result: { score: 82, max_score: 100 },
    },
  ],
}, 'korean');
assert(eventOnlyAssessment?.score === 82, 'assessment_completed StudyEvent fallback failed');
assert(eventOnlyAssessment?.assessmentId === 'ko-week1-check-v1', 'event-only assessment id missing');

console.log('StudyEvent read model smoke OK: route reset semantics, weak ranking and latest assessment derive from learner facts.');
