import {
  KOREAN_YONSEI_GUIDE_VERSION,
  YONSEI_LEVEL1_LESSONS,
  YONSEI_OFFICIAL_SOURCES,
  buildYonseiAutoFocus,
  buildYonseiTutorGuide,
  resolveYonseiLesson,
} from '../korean-yonsei-guide-v17.js';

const tutor = await import('../korean-tutor-v16.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(KOREAN_YONSEI_GUIDE_VERSION === '0.17.0', `unexpected guide version ${KOREAN_YONSEI_GUIDE_VERSION}`);
assert(YONSEI_LEVEL1_LESSONS.length === 20, `expected 20 official Level 1 lesson topics, got ${YONSEI_LEVEL1_LESSONS.length}`);
assert(YONSEI_OFFICIAL_SOURCES.length >= 4, 'expected Yonsei KLI / Press official sources');
assert(YONSEI_OFFICIAL_SOURCES.every(source => /^https:\/\/(www\.)?(yskli\.com|press\.yonsei\.ac\.kr)\//.test(source.url)), 'guide contains a non-Yonsei source URL');

const lesson1 = resolveYonseiLesson({ volume: '1', lesson: '1' });
assert(lesson1?.book === '1-1', `lesson 1 should map to New Yonsei Korean 1-1, got ${lesson1?.book}`);
assert(lesson1?.titleKo === '인사와 소개', `unexpected lesson 1 title: ${lesson1?.titleKo}`);
assert(lesson1?.titleZh === '问候与介绍', `unexpected lesson 1 Chinese title: ${lesson1?.titleZh}`);

const lesson11 = resolveYonseiLesson({ volume: '1', lesson: '11' });
assert(lesson11?.book === '1-2', `lesson 11 should map to New Yonsei Korean 1-2, got ${lesson11?.book}`);
assert(resolveYonseiLesson({ volume: '1-1', lesson: '11' }) === null, '1-1 should not accept lesson 11');
assert(resolveYonseiLesson({ volume: '1-2', lesson: '1' }) === null, '1-2 should not accept lesson 1');

const focus = buildYonseiAutoFocus({ volume: '1', lesson: '1' });
assert(focus.includes('인사와 소개'), 'automatic focus should include the official lesson topic');
assert(focus.includes('问候与介绍'), 'automatic focus should include the Chinese lesson label');
assert(focus.includes('今日学习目标'), 'automatic focus should provide a learner-facing goal');

const guide = buildYonseiTutorGuide({ volume: '1', lesson: '1' });
assert(guide?.expressions?.length >= 4, 'lesson guide should contain reusable expression anchors');
assert(guide?.task?.includes('AI'), 'lesson guide should contain an active-output task');
assert(guide?.sourceNote?.includes('不复制教材正文'), 'guide should clearly separate official structure from original teaching guidance');

const automaticPrompt = tutor.buildTutorPrompt({ volume: '1', lesson: '1', focus: '' });
assert(automaticPrompt.includes('인사와 소개'), 'tutor prompt should auto-resolve the official lesson topic');
assert(automaticPrompt.includes('今天的教材范围 / 重点：官方单元主题'), 'tutor prompt should auto-provide today focus when the user leaves it blank');
assert(automaticPrompt.includes('不要反过来要求我先填写“今天学什么”'), 'tutor prompt must not push curriculum planning back to the learner');
assert(!automaticPrompt.includes('请先只问一个问题确认今天的教材范围'), 'old manual-focus fallback must be removed for mapped lessons');

const manualPrompt = tutor.buildTutorPrompt({ volume: '1', lesson: '1', focus: '教材第 12 页，课文 A' });
assert(manualPrompt.includes('教材第 12 页，课文 A'), 'page-specific user notes should override the automatic focus when supplied');
assert(manualPrompt.includes('인사와 소개'), 'manual page notes should still retain official unit context');

console.log('Korean Yonsei guide smoke OK: official Level 1 map + automatic daily focus + tutor prompt contract are valid.');
