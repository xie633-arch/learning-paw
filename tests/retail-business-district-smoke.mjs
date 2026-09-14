import { curricula, extraCards } from '../platform-data.js';
import { lessonContentById } from '../lesson-content-v05.js';
import { businessDistrictCourseSnapshot } from '../retail-business-district-v141.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const snapshot = businessDistrictCourseSnapshot();
const retail = curricula.retail;

assert(snapshot.version === '0.14.1', `unexpected business-district version: ${snapshot.version}`);
assert(retail?.steps?.length === 16, `retail route should contain 16 lessons, got ${retail?.steps?.length || 0}`);
assert(snapshot.lessonIds.length === 9, `business-district专题 should contain 9 lessons, got ${snapshot.lessonIds.length}`);
assert(snapshot.lessonContentReady, 'one or more business-district lessons are missing intro/sections/checkpoint content');
assert(snapshot.cardCount >= 12, `business-district practice bank should contain at least 12 cards, got ${snapshot.cardCount}`);

const expectedIds = [
  'retail-user',
  'retail-journey',
  'retail-space',
  'retail-district-map',
  'retail-district-userflow',
  'retail-district-position',
  'retail-district-competition',
  'retail-district-partner',
  'retail-district-plan',
  'retail-district-storeplan',
  'retail-district-warroom',
  'retail-store',
  'retail-demo',
  'retail-channel',
  'retail-ops',
  'retail-review',
];
assert(retail.steps.map(step => step.id).join('|') === expectedIds.join('|'), 'retail route order is not the intended 16-lesson progression');

retail.steps.forEach((step, index) => {
  const expectedPrefix = String(index + 1).padStart(2, '0');
  assert(step.title.startsWith(`${expectedPrefix}｜`), `${step.id}: expected title prefix ${expectedPrefix}｜, got ${step.title}`);
  assert(step.summary && step.task && step.output, `${step.id}: route metadata is incomplete`);
});

snapshot.lessonIds.forEach(id => {
  const content = lessonContentById[id];
  assert(content?.intro?.length > 30, `${id}: intro too shallow or missing`);
  assert(content?.sections?.length >= 3, `${id}: expected at least 3 learning sections`);
  assert(content?.checkpoint?.length > 20, `${id}: checkpoint missing or too shallow`);
});

const districtCards = extraCards.filter(card => card.id?.startsWith('retail-district-'));
assert(districtCards.length >= 12, `expected at least 12 district practice cards, got ${districtCards.length}`);
districtCards.forEach(card => {
  assert(card.domain === 'retail', `${card.id}: wrong domain`);
  assert(card.concept_id && card.skill, `${card.id}: missing Concept × Skill metadata`);
  assert(card.question && card.answer, `${card.id}: missing practice content`);
});

console.log('Retail business-district smoke OK: 16-lesson route, 9-lesson专题, full reading content and Concept×Skill practice bank are ready.');
