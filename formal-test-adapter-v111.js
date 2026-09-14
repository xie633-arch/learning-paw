import { tests } from './platform-data.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.11.1';
let processing = false;

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function lookupFor(domain) {
  const map = new Map();
  (tests[domain]?.questions || []).forEach((question, index) => {
    map.set(question.q || question.prompt || '', { question, index });
  });
  return map;
}

function enrichAttemptItem(item, question) {
  if (!item || !question) return false;
  let changed = false;
  const stableConcepts = Array.isArray(question.concept_ids) ? question.concept_ids : [];
  const assignments = {
    item_id: question.item_id,
    section_id: question.section_id || question.skill || 'general',
    skill: question.skill || 'general',
    concept_ids: stableConcepts,
  };
  Object.entries(assignments).forEach(([key, value]) => {
    const current = item[key];
    const differs = Array.isArray(value)
      ? JSON.stringify(current || []) !== JSON.stringify(value)
      : current !== value;
    if (differs) {
      item[key] = value;
      changed = true;
    }
  });
  return changed;
}

function enrichStudyEvent(event, question, assessmentId) {
  if (!event || !question) return false;
  let changed = false;
  const assignments = {
    content_id: question.item_id,
    concept_id: question.concept_ids?.[0] || null,
    skill: question.skill || question.section_id || 'general',
    assessment_id: assessmentId,
  };
  Object.entries(assignments).forEach(([key, value]) => {
    if (event[key] !== value) {
      event[key] = value;
      changed = true;
    }
  });
  return changed;
}

export function processFormalTestMetadata() {
  if (processing) return false;
  processing = true;
  try {
    const state = readState();
    const testResults = Array.isArray(state.testResults) ? state.testResults : [];
    if (!testResults.length) return false;

    state.assessmentAttempts = Array.isArray(state.assessmentAttempts) ? state.assessmentAttempts : [];
    state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
    state.adaptiveV11 ||= {};
    state.adaptiveV11.formalMetadataProcessed ||= {};
    let changed = false;

    testResults.forEach(result => {
      const domain = result.domainId || result.domain || 'unknown';
      const assessment = tests[domain];
      if (!assessment) return;
      const lookup = lookupFor(domain);
      const attemptId = `attempt-${result.id}`;
      const assessmentId = assessment.assessment_id || `${domain}-foundation-100-v1`;
      const token = `${domain}:${result.id}:${result.completedAt || ''}`;

      const attempt = state.assessmentAttempts.find(item => item.attempt_id === attemptId);
      const sessionEvents = state.studyEvents.filter(event =>
        event.event_type === 'assessment_attempt' && event.session_id === attemptId
      );

      (result.answers || []).forEach((answer, answerIndex) => {
        const match = lookup.get(answer.question || '');
        const question = match?.question;
        if (!question) return;
        const correct = typeof answer.correct === 'boolean'
          ? answer.correct
          : Number(answer.selectedIndex) === Number(answer.correctIndex ?? question.answer);

        const attemptItem = attempt?.item_results?.find(item => item.prompt === (answer.question || ''))
          || attempt?.item_results?.[answerIndex];
        if (attemptItem && enrichAttemptItem(attemptItem, question)) changed = true;

        let event = sessionEvents.find(item => item.content_id === question.item_id)
          || sessionEvents.find(item => item.selected_answer === (answer.selectedIndex ?? null)
            && item.result?.correct === correct
            && (!item.concept_id || String(item.content_id || '').includes('legacy-item')));

        if (event) {
          if (enrichStudyEvent(event, question, assessmentId)) changed = true;
          return;
        }

        event = {
          schema_version: '1.0',
          event_id: `evt-${attemptId}-metadata-${question.item_id}`,
          occurred_at: result.completedAt || new Date().toISOString(),
          domain,
          event_type: 'assessment_attempt',
          content_id: question.item_id,
          concept_id: question.concept_ids?.[0] || null,
          skill: question.skill || question.section_id || 'general',
          result: {
            rating: null,
            correct,
            score: correct ? Number(question.max_score || 10) : 0,
            max_score: Number(question.max_score || 10),
            confidence: null,
          },
          duration_ms: answer.duration_ms ?? null,
          session_id: attemptId,
          source: 'learning_paw',
          device_id: null,
          algorithm: 'objective_scoring',
          assessment_id: assessmentId,
          selected_answer: answer.selectedIndex ?? null,
          correct_answer: answer.correctIndex ?? question.answer ?? null,
          metadata_backfill: true,
        };
        state.studyEvents.push(event);
        sessionEvents.push(event);
        changed = true;
      });

      if (!state.adaptiveV11.formalMetadataProcessed[token]) {
        state.adaptiveV11.formalMetadataProcessed[token] = new Date().toISOString();
        changed = true;
      }
    });

    if (changed) writeState(state);
    return changed;
  } finally {
    processing = false;
  }
}

processFormalTestMetadata();
window.addEventListener('learning-data-updated', processFormalTestMetadata);
window.__FORMAL_TEST_ADAPTER_V111__ = { version: VERSION, process: processFormalTestMetadata };
