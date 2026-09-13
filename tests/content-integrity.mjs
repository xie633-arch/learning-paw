globalThis.window = globalThis.window || {};
globalThis.document = globalThis.document || {
  querySelector() { return null; },
};

globalThis.localStorage = globalThis.localStorage || {
  getItem() { return null; },
  setItem() {},
  removeItem() {},
};

await import('../korean-v04.js');
const { curricula } = await import('../platform-data.js');
const { lessonContentById } = await import('../lesson-content-v05.js');
await import('../korean-lesson-content-v05.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const expectedDomains = {
  phone: 8,
  retail: 8,
  industry: 8,
  korean: 29,
};

for (const [domain, expectedCount] of Object.entries(expectedDomains)) {
  const curriculum = curricula[domain];
  assert(curriculum, `missing curriculum: ${domain}`);
  const steps = curriculum.steps || [];
  assert(steps.length === expectedCount, `${domain}: expected ${expectedCount} lessons, got ${steps.length}`);

  for (const step of steps) {
    assert(step.id, `${domain}: lesson missing id`);
    assert(step.title, `${step.id}: missing title`);
    assert(step.summary, `${step.id}: missing summary`);
    assert(step.task, `${step.id}: missing task`);
    assert(step.output, `${step.id}: missing output`);

    const content = lessonContentById[step.id];
    assert(content, `${step.id}: missing built-in lesson content`);
    assert(content.intro, `${step.id}: lesson content missing intro`);
    assert(Array.isArray(content.sections) && content.sections.length > 0, `${step.id}: lesson content missing sections`);
  }
}

const allIds = Object.values(curricula)
  .flatMap(curriculum => (curriculum?.steps || []).map(step => step.id));
const duplicateLessonIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
assert(duplicateLessonIds.length === 0, `duplicate lesson ids: ${[...new Set(duplicateLessonIds)].join(', ')}`);

const koreanIds = (curricula.korean.steps || []).map(step => step.id);
for (let day = 0; day <= 28; day += 1) {
  const id = `ko-day-${String(day).padStart(3, '0')}`;
  assert(koreanIds.includes(id), `Korean curriculum missing ${id}`);
}

assert(lessonContentById['phone-portfolio']?.sections?.length > 0, 'phone portfolio content unavailable');
assert(lessonContentById['retail-user']?.sections?.length > 0, 'retail lesson content unavailable');
assert(lessonContentById['industry-market']?.sections?.length > 0, 'industry lesson content unavailable');
assert(lessonContentById['ko-day-000']?.sections?.length > 0, 'Korean Day 0 content unavailable');
assert(lessonContentById['ko-day-028']?.sections?.length > 0, 'Korean Day 28 content unavailable');

console.log(`Content integrity OK: ${allIds.length} lessons across phone/retail/industry/Korean, all with built-in learning content.`);
