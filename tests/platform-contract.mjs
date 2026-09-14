import { domains as baseDomains, cards as baseCards } from '../cards.js';
import { curricula, domainOverrides, extraCards, tests } from '../platform-data.js';
import { koreanAssessments, koreanAssessmentStages } from '../korean-assessment-data-v05.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const DOMAIN_IDS = ['phone', 'korean', 'retail', 'industry'];
const allCards = [...baseCards, ...extraCards];
const effectiveDomains = new Map(baseDomains.map(domain => [
  domain.id,
  { ...domain, ...(domainOverrides[domain.id] || {}) },
]));

assert(
  DOMAIN_IDS.every(id => effectiveDomains.has(id)),
  `platform domain registry incomplete: expected ${DOMAIN_IDS.join(', ')}`,
);

for (const domainId of DOMAIN_IDS) {
  const domain = effectiveDomains.get(domainId);
  assert(domain.status === 'active', `${domainId}: domain must be active in the integrated platform`);
  assert(domain.name && domain.description, `${domainId}: domain identity/description missing`);

  const curriculum = curricula[domainId];
  assert(curriculum, `${domainId}: curriculum missing`);
  assert(Array.isArray(curriculum.steps) && curriculum.steps.length >= 8, `${domainId}: curriculum must contain a meaningful route`);

  const stepIds = new Set();
  curriculum.steps.forEach((step, index) => {
    const prefix = `${domainId}: curriculum step ${index + 1}`;
    assert(step.id && !stepIds.has(step.id), `${prefix}: missing or duplicate id`);
    stepIds.add(step.id);
    assert(step.title, `${prefix}: title missing`);
    assert(step.summary, `${prefix}: summary missing`);
    assert(step.task, `${prefix}: task missing`);
    assert(step.output, `${prefix}: output missing`);
  });

  const cards = allCards.filter(card => card.domain === domainId);
  assert(cards.length >= 5, `${domainId}: practice bank is too small (${cards.length})`);
  const cardIds = new Set();
  cards.forEach((card, index) => {
    const prefix = `${domainId}: card ${index + 1}`;
    assert(card.id && !cardIds.has(card.id), `${prefix}: missing or duplicate id`);
    cardIds.add(card.id);
    assert(card.question && card.answer, `${prefix}: question/answer missing`);
  });

  if (domainId !== 'korean') {
    const assessment = tests[domainId];
    assert(assessment, `${domainId}: formal assessment missing`);
    assert(Array.isArray(assessment.questions) && assessment.questions.length >= 10, `${domainId}: formal assessment must contain at least 10 items`);
    assessment.questions.forEach((question, index) => {
      const prefix = `${domainId}: formal item ${index + 1}`;
      assert(question.q, `${prefix}: prompt missing`);
      assert(Array.isArray(question.options) && question.options.length >= 2, `${prefix}: options missing`);
      assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length, `${prefix}: invalid correct answer`);
      assert(question.explanation, `${prefix}: explanation missing`);
    });
  }
}

const requiredKoreanStages = ['baseline', 'week1', 'week2', 'week3', 'month1'];
const stageKeys = new Set(koreanAssessmentStages.filter(stage => stage.implemented).map(stage => stage.assessment_key));
requiredKoreanStages.forEach(key => {
  assert(stageKeys.has(key), `korean: required assessment stage ${key} is not implemented`);
  const assessment = koreanAssessments[key];
  assert(assessment, `korean: assessment data missing for ${key}`);
  assert(Array.isArray(assessment.items) && assessment.items.length > 0, `korean: ${key} has no assessment items`);
});

for (const key of ['week1', 'week2', 'week3', 'month1']) {
  koreanAssessments[key].items.forEach((item, index) => {
    const prefix = `korean ${key}: item ${index + 1}`;
    assert(item.item_id && item.skill, `${prefix}: stable item/skill metadata missing`);
    assert(Array.isArray(item.concept_ids) && item.concept_ids.length > 0, `${prefix}: concept_ids missing`);
    assert(item.prompt, `${prefix}: prompt missing`);
    if (item.type === 'mcq' || item.type === 'audio_mcq') {
      assert(Array.isArray(item.options) && item.options.length >= 2, `${prefix}: options missing`);
      assert(Number.isInteger(item.correct_answer) && item.correct_answer >= 0 && item.correct_answer < item.options.length, `${prefix}: invalid correct_answer`);
    }
    if (item.type === 'typing') {
      const accepted = item.accepted_answers || (item.target ? [item.target] : []);
      assert(accepted.length > 0, `${prefix}: typing target/accepted answers missing`);
    }
  });
}

console.log(
  `Platform contract OK: ${DOMAIN_IDS.length} active domains, shared curriculum/practice contract, ` +
  'phone/retail/industry formal assessments, Korean staged assessment path.',
);
