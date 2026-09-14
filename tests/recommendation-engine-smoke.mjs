import { rankLearningRecommendations, recommendationSummary } from '../learner-recommendation-v13.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const NOW = new Date('2026-09-14T14:30:00+08:00');
const domains = ['phone', 'korean', 'retail', 'industry'];

function assessmentWeakState(domain) {
  const concept = `${domain}.concept.primary`;
  const skill = `${domain}-application`;
  const key = `${concept}::${skill}`;
  return {
    learnerSignals: {
      [key]: {
        concept_id: concept,
        content_id: `${domain}-item-01`,
        domain,
        skill,
        attempts: 4,
        ratings: { good: 0, hard: 0, again: 0 },
        assessment: { correct: 1, incorrect: 3 },
        revalidations: { passed: 0, failed: 0 },
        last_seen_at: '2026-09-14T13:00:00+08:00',
      },
    },
    errorRecords: [
      {
        error_id: `err-${domain}-primary`,
        concept_id: concept,
        content_id: `${domain}-item-01`,
        domain,
        skill,
        error_type: 'assessment_error',
        severity: 'high',
        occurrences: 3,
        status: 'active',
        last_seen_at: '2026-09-14T13:00:00+08:00',
      },
    ],
  };
}

// Same evidence must produce the same policy across all four domains.
let referenceScore = null;
for (const domain of domains) {
  const ranked = rankLearningRecommendations(assessmentWeakState(domain), domain, { now: NOW });
  assert(ranked.length === 1, `${domain}: expected one recommendation, got ${ranked.length}`);
  const top = ranked[0];
  assert(top.domain === domain, `${domain}: recommendation leaked domain`);
  assert(top.action === 'targeted_review_then_revalidate', `${domain}: wrong action ${top.action}`);
  assert(top.reason_codes.includes('active_assessment_error'), `${domain}: missing active assessment reason`);
  assert(top.reason_codes.includes('repeated_error'), `${domain}: repeated evidence not recognized`);
  assert(top.reason_codes.includes('assessment_weakness'), `${domain}: assessment ratio not recognized`);
  assert(top.priority_score >= 80, `${domain}: strong evidence priority too low: ${top.priority_score}`);
  if (referenceScore === null) referenceScore = top.priority_score;
  assert(top.priority_score === referenceScore, `${domain}: domain-specific scoring drifted (${top.priority_score} vs ${referenceScore})`);
}

// Recall gaps should recommend spaced recall, not formal-test remediation.
const recallState = {
  learnerSignals: {
    'shared.recall::retrieval': {
      concept_id: 'shared.recall', content_id: 'card-recall', domain: 'phone', skill: 'retrieval', attempts: 3,
      ratings: { good: 1, hard: 1, again: 1 }, assessment: { correct: 0, incorrect: 0 },
      revalidations: { passed: 0, failed: 0 }, last_seen_at: '2026-09-14T12:00:00+08:00',
    },
  },
  errorRecords: [{
    error_id: 'err-recall', concept_id: 'shared.recall', content_id: 'card-recall', domain: 'phone', skill: 'retrieval',
    error_type: 'recall_gap', severity: 'medium', occurrences: 2, status: 'active', last_seen_at: '2026-09-14T12:00:00+08:00',
  }],
};
const recall = rankLearningRecommendations(recallState, 'phone', { now: NOW })[0];
assert(recall?.action === 'spaced_recall', `recall gap should use spaced recall, got ${recall?.action}`);

// Failed revalidation becomes the strongest instruction: remediate before another check.
const failedState = assessmentWeakState('retail');
failedState.learnerSignals['retail.concept.primary::retail-application'].revalidations.failed = 2;
const failed = rankLearningRecommendations(failedState, 'retail', { now: NOW })[0];
assert(failed.action === 'remediate_then_revalidate', `failed revalidation policy wrong: ${failed.action}`);
assert(failed.reason_codes.includes('failed_revalidation'), 'failed revalidation evidence missing');

// A resolved concept must not be resurrected just because historical misses remain in LearnerSignal.
const resolvedState = {
  learnerSignals: {
    'korean.resolved::listening': {
      concept_id: 'korean.resolved', content_id: 'ko-item', domain: 'korean', skill: 'listening', attempts: 5,
      ratings: { good: 1, hard: 1, again: 1 }, assessment: { correct: 1, incorrect: 2 },
      revalidations: { passed: 1, failed: 0 }, last_seen_at: '2026-09-14T13:50:00+08:00',
    },
  },
  errorRecords: [{
    error_id: 'err-resolved', concept_id: 'korean.resolved', content_id: 'ko-item', domain: 'korean', skill: 'listening',
    error_type: 'assessment_error', severity: 'high', occurrences: 2, status: 'resolved', last_seen_at: '2026-09-14T13:00:00+08:00',
  }],
};
assert(rankLearningRecommendations(resolvedState, 'korean', { now: NOW }).length === 0, 'resolved concept was incorrectly resurrected');

// Cross-domain facts must never enter the selected domain ranking.
const mixedState = assessmentWeakState('industry');
const phoneState = assessmentWeakState('phone');
Object.assign(mixedState.learnerSignals, phoneState.learnerSignals);
mixedState.errorRecords.push(...phoneState.errorRecords);
const mixed = recommendationSummary(mixedState, 'industry', { now: NOW });
assert(mixed.count === 1, `industry recommendation leaked phone evidence: ${mixed.count}`);
assert(mixed.top?.domain === 'industry', 'recommendation summary top domain mismatch');

console.log('Recommendation engine smoke OK: four domains share one Concept×Skill scoring policy; resolved facts stay resolved and actions follow evidence type.');
