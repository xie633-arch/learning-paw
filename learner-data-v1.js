import { cards as baseCards } from './cards.js';
import { curricula, extraCards, tests } from './platform-data.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const STATE_VERSION = 5;
const SCHEMA_VERSION = '1.0';
const nativeSetItem = typeof Storage !== 'undefined' ? Storage.prototype.setItem : null;
const nativeGetItem = typeof Storage !== 'undefined' ? Storage.prototype.getItem : null;

const allCards = () => [...baseCards, ...extraCards];
const cardMap = () => new Map(allCards().map(card => [card.card_id || card.id, card]));

const lessonMap = () => {
  const map = new Map();
  Object.entries(curricula).forEach(([domain, curriculum]) => {
    (curriculum.steps || []).forEach(step => {
      map.set(step.lesson_id || step.id, { domain, step });
    });
  });
  return map;
};

const assessmentForDomain = domain => tests[domain] || null;
const assessmentIdFor = domain => assessmentForDomain(domain)?.assessment_id || `${domain || 'general'}-diagnostic-v1`;

function safeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function inferDomainFromHistory(item, card) {
  if (item?.domain) return item.domain;
  if (card?.domain) return card.domain;
  if (item?.deck === '手机产品专家') return 'phone';
  if (item?.deck === '韩语') return 'korean';
  if (item?.deck === '商圈与零售') return 'retail';
  if (item?.deck === '行业与商业') return 'industry';
  return 'unknown';
}

function historyEvent(item, index, cards) {
  const card = cards.get(item.cardId) || cards.get(item.card_id);
  const occurredAt = item.reviewedAt || item.occurred_at || new Date().toISOString();
  const legacyId = item.id || `${item.cardId || 'card'}-${occurredAt}-${index}`;
  const listening = item.modality === 'listening' || Boolean(card?.audioText);
  return {
    schema_version: SCHEMA_VERSION,
    event_id: `evt-history-${legacyId}`,
    occurred_at: occurredAt,
    domain: inferDomainFromHistory(item, card),
    event_type: listening ? 'listening_attempt' : 'practice_attempt',
    content_id: card?.card_id || card?.id || item.cardId || null,
    concept_id: card?.concept_id || null,
    skill: card?.skill || item.category || null,
    result: {
      rating: item.rating || null,
      correct: null,
      confidence: null,
    },
    duration_ms: Number.isFinite(item.duration_ms) ? item.duration_ms : null,
    session_id: item.sessionId || item.session_id || null,
    source: 'learning_paw',
    device_id: null,
    algorithm: item.engine || null,
    response_text: item.answer || '',
    category: item.category || card?.category || '',
    session_mode: item.sessionMode || null,
    local_day: item.day || null,
    legacy_history_id: legacyId,
  };
}

function questionLookup(domain) {
  const assessment = assessmentForDomain(domain);
  const lookup = new Map();
  (assessment?.questions || []).forEach((item, index) => {
    const prompt = item.prompt || item.q || '';
    lookup.set(prompt, { item, index });
  });
  return lookup;
}

function migrateTestResult(result, domain) {
  const assessment = assessmentForDomain(domain);
  const assessmentId = assessmentIdFor(domain);
  const attemptId = `attempt-${result.id || safeId('legacy')}`;
  const lookup = questionLookup(domain);
  const maxScore = assessment?.max_score || 100;
  const answers = asArray(result.answers);
  const fallbackItemScore = answers.length ? Math.round(maxScore / answers.length) : 0;
  const itemResults = answers.map((answer, index) => {
    const match = lookup.get(answer.question || '');
    const item = match?.item;
    const itemMax = item?.max_score || fallbackItemScore;
    const correctIndex = answer.correctIndex ?? item?.correct_answer ?? item?.answer ?? null;
    const correct = typeof answer.correct === 'boolean'
      ? answer.correct
      : answer.selectedIndex === correctIndex;
    return {
      item_id: item?.item_id || `${assessmentId}-legacy-item-${String(index + 1).padStart(2, '0')}`,
      section_id: item?.section_id || item?.skill || 'general',
      skill: item?.skill || 'general',
      concept_ids: asArray(item?.concept_ids),
      prompt: answer.question || item?.prompt || item?.q || '',
      selected_answer: answer.selectedIndex ?? null,
      correct_answer: correctIndex,
      correct,
      score: correct ? itemMax : 0,
      max_score: itemMax,
      explanation: answer.explanation || item?.explanation || '',
      duration_ms: answer.duration_ms ?? null,
    };
  });

  const sectionScores = {};
  itemResults.forEach(item => {
    const key = item.section_id || item.skill || 'general';
    const current = sectionScores[key] || { score: 0, max_score: 0 };
    current.score += Number(item.score || 0);
    current.max_score += Number(item.max_score || 0);
    sectionScores[key] = current;
  });

  return {
    schema_version: SCHEMA_VERSION,
    attempt_id: attemptId,
    assessment_id: assessmentId,
    domain,
    started_at: result.startedAt || result.completedAt || new Date().toISOString(),
    completed_at: result.completedAt || null,
    score: Number(result.score || 0),
    max_score: maxScore,
    section_scores: sectionScores,
    item_results: itemResults,
    source: 'learning_paw',
    legacy_test_result_id: result.id || null,
  };
}

function assessmentEvents(attempt) {
  const events = [];
  (attempt.item_results || []).forEach((item, index) => {
    events.push({
      schema_version: SCHEMA_VERSION,
      event_id: `evt-${attempt.attempt_id}-item-${item.item_id || index + 1}`,
      occurred_at: attempt.completed_at || attempt.started_at,
      domain: attempt.domain || 'unknown',
      event_type: 'assessment_attempt',
      content_id: item.item_id || null,
      concept_id: item.concept_ids?.[0] || null,
      skill: item.skill || item.section_id || null,
      result: {
        rating: null,
        correct: Boolean(item.correct),
        score: Number(item.score || 0),
        max_score: Number(item.max_score || 0),
        confidence: null,
      },
      duration_ms: item.duration_ms ?? null,
      session_id: attempt.attempt_id,
      source: 'learning_paw',
      device_id: null,
      algorithm: 'objective_scoring',
      assessment_id: attempt.assessment_id,
      selected_answer: item.selected_answer ?? null,
      correct_answer: item.correct_answer ?? null,
    });
  });

  events.push({
    schema_version: SCHEMA_VERSION,
    event_id: `evt-${attempt.attempt_id}-completed`,
    occurred_at: attempt.completed_at || attempt.started_at,
    domain: attempt.domain || 'unknown',
    event_type: 'assessment_completed',
    content_id: attempt.assessment_id,
    concept_id: null,
    skill: null,
    result: {
      rating: null,
      correct: null,
      score: Number(attempt.score || 0),
      max_score: Number(attempt.max_score || 0),
      confidence: null,
    },
    duration_ms: null,
    session_id: attempt.attempt_id,
    source: 'learning_paw',
    device_id: null,
    algorithm: 'objective_scoring',
  });
  return events;
}

function lessonEvents(current, previous) {
  const events = [];
  const lessons = lessonMap();
  const currentProgress = asObject(current.lessonProgress);
  const previousProgress = asObject(previous?.lessonProgress);

  Object.entries(currentProgress).forEach(([lessonId, completedAt]) => {
    const alreadyPresent = asArray(current.studyEvents).some(event =>
      event.event_type === 'lesson_completed' && event.content_id === lessonId && event.occurred_at === completedAt
    );
    if (alreadyPresent) return;
    const metadata = lessons.get(lessonId);
    events.push({
      schema_version: SCHEMA_VERSION,
      event_id: `evt-lesson-${lessonId}-${String(completedAt).replace(/[^0-9A-Za-z]/g, '')}`,
      occurred_at: completedAt || new Date().toISOString(),
      domain: metadata?.domain || 'unknown',
      event_type: 'lesson_completed',
      content_id: lessonId,
      concept_id: null,
      skill: 'curriculum_progress',
      result: { completed: true },
      duration_ms: null,
      session_id: null,
      source: 'learning_paw',
      device_id: null,
      algorithm: null,
    });
  });

  Object.keys(previousProgress).forEach(lessonId => {
    if (lessonId in currentProgress) return;
    const metadata = lessons.get(lessonId);
    events.push({
      schema_version: SCHEMA_VERSION,
      event_id: safeId(`evt-lesson-reset-${lessonId}`),
      occurred_at: new Date().toISOString(),
      domain: metadata?.domain || 'unknown',
      event_type: 'curriculum_status_changed',
      content_id: lessonId,
      concept_id: null,
      skill: 'curriculum_progress',
      result: { completed: false },
      duration_ms: null,
      session_id: null,
      source: 'learning_paw',
      device_id: null,
      algorithm: null,
    });
  });
  return events;
}

function deriveErrorRecords(events) {
  const records = new Map();
  const sorted = [...events].sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at));

  sorted.forEach(event => {
    const recallGap = ['practice_attempt', 'listening_attempt', 'review_rating'].includes(event.event_type)
      && event.result?.rating === 'again';
    const assessmentError = event.event_type === 'assessment_attempt' && event.result?.correct === false;
    const successfulRevalidation = event.revalidation === true && (
      (event.event_type === 'assessment_attempt' && event.result?.correct === true)
      || (['practice_attempt', 'listening_attempt', 'review_rating'].includes(event.event_type) && event.result?.rating === 'good')
    );

    if (successfulRevalidation) {
      const concept = event.concept_id || `content:${event.content_id || 'unknown'}`;
      const skill = event.skill || 'general';
      const requestedType = event.revalidation_error_type
        || (event.event_type === 'assessment_attempt' ? 'assessment_error' : 'recall_gap');
      const key = `${concept}::${skill}::${requestedType}`;
      const existing = records.get(key);
      if (existing?.status === 'active') {
        existing.status = 'resolved';
        existing.resolved_at = event.occurred_at;
        existing.resolution_event_id = event.event_id;
        existing.next_action = 'none';
        existing.evidence_event_ids.push(event.event_id);
        existing.last_seen_at = event.occurred_at;
        existing.revalidations = Number(existing.revalidations || 0) + 1;
      }
      return;
    }

    if (!recallGap && !assessmentError) return;

    const concept = event.concept_id || `content:${event.content_id || 'unknown'}`;
    const skill = event.skill || 'general';
    const errorType = assessmentError ? 'assessment_error' : 'recall_gap';
    const key = `${concept}::${skill}::${errorType}`;
    const existing = records.get(key) || {
      error_id: `err-${simpleHash(key)}`,
      concept_id: event.concept_id || null,
      content_id: event.content_id || null,
      domain: event.domain,
      skill,
      error_type: errorType,
      severity: 'medium',
      evidence_event_ids: [],
      occurrences: 0,
      first_seen_at: event.occurred_at,
      last_seen_at: event.occurred_at,
      status: 'active',
      next_action: assessmentError ? 'targeted_review' : 'spaced_recall',
      schema_version: SCHEMA_VERSION,
      revalidations: 0,
      resolved_at: null,
      resolution_event_id: null,
    };

    existing.content_id = event.content_id || existing.content_id;
    existing.domain = event.domain || existing.domain;
    existing.status = 'active';
    existing.next_action = assessmentError ? 'targeted_review' : 'spaced_recall';
    existing.resolved_at = null;
    existing.resolution_event_id = null;
    existing.evidence_event_ids.push(event.event_id);
    existing.occurrences += 1;
    if (new Date(event.occurred_at).getTime() < new Date(existing.first_seen_at).getTime()) existing.first_seen_at = event.occurred_at;
    if (new Date(event.occurred_at).getTime() > new Date(existing.last_seen_at).getTime()) existing.last_seen_at = event.occurred_at;
    if (existing.occurrences >= 3) existing.severity = 'high';
    records.set(key, existing);
  });

  return [...records.values()].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    return new Date(b.last_seen_at) - new Date(a.last_seen_at);
  });
}

function deriveLearnerSignals(events) {
  const signals = new Map();
  events.forEach(event => {
    if (!event.concept_id && !event.content_id) return;
    if (!['practice_attempt', 'listening_attempt', 'assessment_attempt'].includes(event.event_type)) return;
    const conceptId = event.concept_id || `content:${event.content_id}`;
    const skill = event.skill || 'general';
    const key = `${conceptId}::${skill}`;
    const signal = signals.get(key) || {
      concept_id: event.concept_id || null,
      content_id: event.content_id || null,
      domain: event.domain,
      skill,
      attempts: 0,
      ratings: { good: 0, hard: 0, again: 0 },
      assessment: { correct: 0, incorrect: 0 },
      revalidations: { passed: 0, failed: 0 },
      last_seen_at: event.occurred_at,
    };
    signal.attempts += 1;
    if (event.result?.rating && signal.ratings[event.result.rating] !== undefined) {
      signal.ratings[event.result.rating] += 1;
    }
    if (event.result?.correct === true) signal.assessment.correct += 1;
    if (event.result?.correct === false) signal.assessment.incorrect += 1;
    if (event.revalidation === true && event.result?.correct === true) signal.revalidations.passed += 1;
    if (event.revalidation === true && event.result?.correct === false) signal.revalidations.failed += 1;
    if (new Date(event.occurred_at).getTime() > new Date(signal.last_seen_at).getTime()) signal.last_seen_at = event.occurred_at;
    signals.set(key, signal);
  });
  return Object.fromEntries(signals);
}

function deriveIntroducedContent(events, cards) {
  const introduced = {};
  const sorted = [...events].sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at));
  sorted.forEach(event => {
    if (!['practice_attempt', 'listening_attempt'].includes(event.event_type)) return;
    const cardId = event.content_id;
    if (!cardId || introduced[cardId]) return;
    const card = cards.get(cardId);
    introduced[cardId] = {
      introduced_at: event.occurred_at,
      lesson_id: card?.lesson_ids?.[0] || null,
      source: 'first_observed_practice',
    };
  });
  return introduced;
}

function simpleHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function enrichState(input, previous = null) {
  const state = asObject(input);
  state.version = Math.max(Number(state.version || 0), STATE_VERSION);
  state.studyEvents = asArray(state.studyEvents);
  state.assessmentAttempts = asArray(state.assessmentAttempts);
  state.errorRecords = asArray(state.errorRecords);
  state.introducedContent = asObject(state.introducedContent);
  state.learnerSignals = asObject(state.learnerSignals);
  state.migrations = asObject(state.migrations);

  const cards = cardMap();
  const eventsById = new Map(state.studyEvents.map(event => [event.event_id, event]));

  asArray(state.history).forEach((item, index) => {
    const event = historyEvent(item, index, cards);
    if (!eventsById.has(event.event_id)) eventsById.set(event.event_id, event);
  });

  const attemptsById = new Map(state.assessmentAttempts.map(attempt => [attempt.attempt_id, attempt]));
  asArray(state.testResults).forEach(result => {
    const domain = result.domainId || result.domain || 'unknown';
    const attempt = migrateTestResult(result, domain);
    if (!attemptsById.has(attempt.attempt_id)) attemptsById.set(attempt.attempt_id, attempt);
  });

  attemptsById.forEach(attempt => {
    assessmentEvents(attempt).forEach(event => {
      if (!eventsById.has(event.event_id)) eventsById.set(event.event_id, event);
    });
  });

  lessonEvents({ ...state, studyEvents: [...eventsById.values()] }, previous || state).forEach(event => {
    if (!eventsById.has(event.event_id)) eventsById.set(event.event_id, event);
  });

  state.studyEvents = [...eventsById.values()].sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at));
  state.assessmentAttempts = [...attemptsById.values()].sort((a, b) => new Date(a.completed_at || a.started_at) - new Date(b.completed_at || b.started_at));
  state.errorRecords = deriveErrorRecords(state.studyEvents);
  state.introducedContent = deriveIntroducedContent(state.studyEvents, cards);
  state.learnerSignals = deriveLearnerSignals(state.studyEvents);
  state.migrations.history_to_study_event_v1 ||= new Date().toISOString();
  state.migrations.assessment_attempt_v1 ||= new Date().toISOString();
  state.migrations.error_record_resolution_v1 ||= new Date().toISOString();
  state.migrations.learner_data_compat_v1 = new Date().toISOString();
  return state;
}

function readStoredState() {
  try {
    const raw = nativeGetItem?.call(window.localStorage, STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeEnrichedState(input, previous = null) {
  const enriched = enrichState(input, previous);
  const serialized = JSON.stringify(enriched);
  nativeSetItem?.call(window.localStorage, STORAGE_KEY, serialized);
  updateRuntimeStatus(enriched);
  return enriched;
}

function updateRuntimeStatus(state) {
  window.__LEARNER_DATA_V1__ = {
    schema_version: SCHEMA_VERSION,
    state_version: STATE_VERSION,
    study_event_count: asArray(state.studyEvents).length,
    assessment_attempt_count: asArray(state.assessmentAttempts).length,
    active_error_count: asArray(state.errorRecords).filter(item => item.status === 'active').length,
    resolved_error_count: asArray(state.errorRecords).filter(item => item.status === 'resolved').length,
    introduced_content_count: Object.keys(asObject(state.introducedContent)).length,
    learner_signal_count: Object.keys(asObject(state.learnerSignals)).length,
    source_of_truth: 'StudyEvent v1',
  };
  window.dispatchEvent(new CustomEvent('learning-data-updated', { detail: window.__LEARNER_DATA_V1__ }));
}

if (typeof window !== 'undefined' && nativeSetItem && nativeGetItem) {
  const stored = readStoredState();
  if (stored) {
    try {
      writeEnrichedState(stored, stored);
    } catch (error) {
      console.warn('StudyEvent v1 初始迁移失败，保留旧学习数据继续运行。', error);
    }
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    if (this !== window.localStorage || key !== STORAGE_KEY) {
      return nativeSetItem.call(this, key, value);
    }
    try {
      const incoming = JSON.parse(value);
      const previous = readStoredState();
      const enriched = enrichState(incoming, previous);
      const serialized = JSON.stringify(enriched);
      nativeSetItem.call(this, key, serialized);
      updateRuntimeStatus(enriched);
      return undefined;
    } catch (error) {
      console.warn('StudyEvent v1 写入增强失败，回退保存原始状态。', error);
      return nativeSetItem.call(this, key, value);
    }
  };

  const exportBtn = document.querySelector('#exportBtn');
  exportBtn?.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    try {
      const current = readStoredState() || {};
      const enriched = writeEnrichedState(current, current);
      const payload = {
        app: 'Personal Learning OS',
        exportedAt: new Date().toISOString(),
        dataSchema: 'StudyEvent v1',
        state: enriched,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const day = new Date().toLocaleDateString('en-CA');
      link.download = `learning-os-backup-${day}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('StudyEvent v1 导出失败。', error);
      window.alert('学习数据导出失败，请刷新页面后重试。');
    }
  }, true);

  const summaryMessage = document.querySelector('#summaryMessage');
  if (summaryMessage) {
    const fixSummaryCopy = () => {
      if (summaryMessage.textContent.includes('本轮独立掌握率')) {
        summaryMessage.textContent = summaryMessage.textContent.replace('本轮独立掌握率', '本轮自评熟练率');
      }
    };
    new MutationObserver(fixSummaryCopy).observe(summaryMessage, { childList: true, subtree: true, characterData: true });
  }
}

export { enrichState };
