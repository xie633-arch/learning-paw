const { cards } = await import('../cards.js');
const { extraCards, curricula, domainOverrides } = await import('../platform-data.js');

extraCards.push({ id: 'legacy-ko-test-card', domain: 'korean', deck: '韩语', question: 'legacy', answer: 'legacy' });

const beforeBaseKorean = cards.filter(card => card.domain === 'korean' || card.deck === '韩语').length;
if (beforeBaseKorean <= 0) throw new Error('test fixture expected legacy Korean base cards');

const tutor = await import('../korean-tutor-v16.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(cards.every(card => card.domain !== 'korean' && card.deck !== '韩语'), 'legacy Korean base cards were not removed');
assert(extraCards.every(card => card.domain !== 'korean' && card.deck !== '韩语'), 'legacy Korean extra cards were not removed');
assert(curricula.korean?.program_id === 'korean-yonsei-private-tutor', `unexpected Korean program: ${curricula.korean?.program_id}`);
assert(Array.isArray(curricula.korean?.steps) && curricula.korean.steps.length === 0, 'Korean runtime should not recreate a parallel in-site textbook curriculum');
assert(domainOverrides.korean?.description?.includes('延世韩国语'), 'Korean domain copy should name Yonsei Korean');
assert(domainOverrides.korean?.description?.includes('墨墨记忆卡'), 'Korean domain copy should delegate vocabulary memory to MoMo');
assert(domainOverrides.korean?.modes?.some(mode => mode.label.includes('30 分钟 AI 私教')), '30-minute AI tutor mode missing');

const prompt = tutor.buildTutorPrompt({
  volume: '1',
  lesson: '3',
  focus: '第 35–38 页，语法 1',
  previousFocus: '助词容易混',
});
assert(prompt.includes('《延世韩国语》'), 'tutor prompt missing Yonsei spine');
assert(prompt.includes('约 30 分钟'), 'tutor prompt missing 30-minute duration');
assert(prompt.includes('第 35–38 页，语法 1'), 'tutor prompt missing textbook focus');
assert(prompt.includes('一次只给我一个问题'), 'tutor prompt missing interactive one-question-at-a-time rule');
assert(prompt.includes('不要给我制作单词卡'), 'tutor prompt must explicitly disable vocab-card generation');
assert(prompt.includes('墨墨记忆卡'), 'tutor prompt must delegate vocabulary memory to MoMo');
assert(tutor.tutorContentId({ volume: '1', lesson: '3' }) === 'yonsei-1-3', 'unexpected tutor content id');

console.log(`Korean tutor smoke OK: removed ${beforeBaseKorean} legacy base cards; Yonsei + 30-minute ChatGPT tutor runtime is active.`);
