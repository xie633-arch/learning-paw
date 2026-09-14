import './korean-v04.js';
import './korean-hangul-gate-v07.js';
import { curricula } from '../platform-data.js';
import { koreanAssessments, koreanAssessmentStages } from '../korean-assessment-data-v05.js';
import { KOREAN_VOCAB_ITEMS_V15, buildVocabCard, vocabTrainingMode, unlockedVocabItems } from '../korean-vocab-v15.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(curricula.korean.steps[0]?.id === 'ko-hangul-gate', `Korean route should begin with Hangul gate, got ${curricula.korean.steps[0]?.id}`);
assert(!curricula.korean.steps.some(step => /^ko-day-00[1-7]$/.test(step.id)), 'old in-app Hangul Day 1-7 lessons should be removed from the primary route');
assert(koreanAssessmentStages[0]?.id === 'hangulGate', `first Korean assessment stage should be hangulGate, got ${koreanAssessmentStages[0]?.id}`);
assert(koreanAssessments.hangulGate?.pass_rule?.total_min === 85, 'Hangul gate pass score should be 85');
assert(koreanAssessments.hangulGate?.pass_rule?.section_min_ratio?.hangul_recognition === 0.8, 'Hangul recognition floor should be 80%');
assert(koreanAssessments.hangulGate?.pass_rule?.section_min_ratio?.syllable_composition === 0.8, 'syllable composition floor should be 80%');

assert(KOREAN_VOCAB_ITEMS_V15.length >= 30, `expected at least 30 starter vocabulary items, got ${KOREAN_VOCAB_ITEMS_V15.length}`);
for (const item of KOREAN_VOCAB_ITEMS_V15) {
  assert(item.word && item.meaning, `${item.id}: missing word/meaning`);
  assert(item.example && item.example_meaning, `${item.id}: missing bilingual example`);
  assert(item.lesson_id && item.concept_id, `${item.id}: missing lesson/concept metadata`);
}

assert(vocabTrainingMode(0) === 'recognition', 'new vocabulary should begin with Korean→meaning recognition');
assert(vocabTrainingMode(1) === 'recall', 'second encounter should require meaning→Korean recall');
assert(vocabTrainingMode(3) === 'listening', 'fourth encounter should introduce listening recall');

const sample = KOREAN_VOCAB_ITEMS_V15.find(item => item.word === '학교');
const freshCard = buildVocabCard(sample, { history: [] });
assert(freshCard.question === `KV15:${sample.id}`, 'vocab UI should receive stable card identity instead of brittle visible copy');
assert(freshCard.audioText === '학교', 'word audio text should be Korean headword');
assert(freshCard.tts === sample.example, 'answer audio should use the Korean example sentence');
assert(freshCard.skill === 'vocabulary_recognition', `fresh card should train recognition, got ${freshCard.skill}`);

const recallCard = buildVocabCard(sample, { history: [{ cardId: sample.id, rating:'good' }] });
assert(recallCard.skill === 'vocabulary_recall', `second encounter should train active recall, got ${recallCard.skill}`);

const listeningCard = buildVocabCard(sample, { history: [0,1,2].map(i => ({ cardId: sample.id, rating:'good', i })) });
assert(listeningCard.skill === 'listening_recognition', `listening encounter should train sound recognition, got ${listeningCard.skill}`);

const locked = unlockedVocabItems({ assessmentAttempts: [], lessonProgress: {} }, curricula.korean);
assert(locked.length === 0, 'vocabulary must stay locked before Hangul gate pass');

const passedState = {
  assessmentAttempts: [{ assessment_id:'ko-hangul-gate-v1', passed:true, completed_at:new Date().toISOString() }],
  lessonProgress: { 'ko-hangul-gate': new Date().toISOString() },
};
const unlocked = unlockedVocabItems(passedState, curricula.korean);
assert(unlocked.length > 0, 'vocabulary should unlock after Hangul gate pass');
assert(unlocked.every(item => item.lesson_id === 'ko-day-008'), `first unlocked vocab should follow current Day 8 lesson, got ${unlocked.map(item => item.lesson_id).join(',')}`);

console.log('Korean vocab smoke OK: external Hangul gate, 30-word audio metadata, staged unlock and recognition→recall→listening modes are valid.');
