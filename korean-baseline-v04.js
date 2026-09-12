import { extraCards } from './platform-data.js';
import { curricula } from './platform-data.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';

const selfSource = {
  kind: 'self-authored',
  name: 'Personal Learning OS Korean Baseline',
  url: null,
};

const baselineCards = [
  {
    id: 'ko-day0-baseline-001',
    card_id: 'ko-day0-baseline-001',
    concept_id: 'ko.baseline.hangul',
    lesson_ids: ['ko-day-000'],
    introduction_policy: 'curriculum_unlock',
    domain: 'korean',
    deck: '韩语',
    category: 'Day 0｜识读基线',
    practice_type: 'baseline_assessment',
    type: 'active_recall',
    skill: 'hangul_reading',
    level: 0,
    question: '基线检查：不查资料，你现在能认出这些韩文字母中的多少个？ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ / ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ',
    prompt: '把你现在认识的写出来；完全不认识也没关系。',
    answer: '这不是教学题，也不要求达到固定分数。只记录真实起点：辅音 ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ；元音 ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ。',
    source: selfSource,
    source_id: 'source-self-authored-learning-os-korean-baseline',
    license: 'self-authored',
  },
  {
    id: 'ko-day0-baseline-002',
    card_id: 'ko-day0-baseline-002',
    concept_id: 'ko.baseline.hangul',
    lesson_ids: ['ko-day-000'],
    introduction_policy: 'curriculum_unlock',
    domain: 'korean',
    deck: '韩语',
    category: 'Day 0｜拼读基线',
    practice_type: 'baseline_assessment',
    type: 'active_recall',
    skill: 'hangul_reading',
    level: 0,
    question: '基线检查：不看罗马音，试着读出 가 / 나 / 다 / 마 / 바 / 사。不会就直接记录“不认识”。',
    prompt: '先写下你认为的读法，或直接写“不认识”。',
    answer: 'Day 0 只判断你是否已经具备基础拼读能力。不会完全正常，Day 1 会从音节块结构正式开始。',
    tts: '가 나 다 마 바 사',
    source: selfSource,
    source_id: 'source-self-authored-learning-os-korean-baseline',
    license: 'self-authored',
  },
  {
    id: 'ko-day0-baseline-003',
    card_id: 'ko-day0-baseline-003',
    concept_id: 'ko.baseline.pronunciation',
    lesson_ids: ['ko-day-000'],
    introduction_policy: 'curriculum_unlock',
    domain: 'korean',
    deck: '韩语',
    category: 'Day 0｜听辨基线',
    practice_type: 'listening_baseline',
    type: 'listening',
    skill: 'listening_recognition',
    level: 0,
    question: '基线听辨：播放音频后，写下你听到的内容。听不出来也直接记录。',
    prompt: '只写自己听到的，不猜答案。',
    answer: '가 / 나 / 다',
    audioText: '가 나 다',
    tts: '가 나 다',
    source: selfSource,
    source_id: 'source-self-authored-learning-os-korean-baseline',
    license: 'self-authored',
  },
  {
    id: 'ko-day0-baseline-004',
    card_id: 'ko-day0-baseline-004',
    concept_id: 'ko.baseline.typing',
    lesson_ids: ['ko-day-000'],
    introduction_policy: 'curriculum_unlock',
    domain: 'korean',
    deck: '韩语',
    category: 'Day 0｜输入基线',
    practice_type: 'typing_baseline',
    type: 'active_recall',
    skill: 'typing',
    level: 0,
    question: '基线输入：如果设备已经有韩语键盘，尝试输入 가 / 나 / 다；如果没有或不会切换，就写“不会”。',
    prompt: '直接输入结果，或者写“不会”。',
    answer: 'Day 0 只记录起点。能输入 가 / 나 / 다 即可；不会不会扣分，后续课程会正式加入韩语键盘练习。',
    source: selfSource,
    source_id: 'source-self-authored-learning-os-korean-baseline',
    license: 'self-authored',
  },
];

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const state = JSON.parse(raw);
    return state?.lessonProgress && typeof state.lessonProgress === 'object' ? state.lessonProgress : {};
  } catch {
    return {};
  }
}

const steps = curricula.korean?.steps || [];
const progress = loadProgress();
const currentLesson = steps.find(step => !progress[step.id]) || null;
const day0Completed = Boolean(progress['ko-day-000']);
const shouldExposeBaseline = !day0Completed && currentLesson?.id === 'ko-day-000';

if (shouldExposeBaseline) {
  const existingIds = new Set(extraCards.map(card => card.id));
  baselineCards.forEach(card => {
    if (!existingIds.has(card.id)) {
      extraCards.push(card);
      existingIds.add(card.id);
    }
  });
}

window.__KOREAN_BASELINE_V04__ = {
  currentLesson: currentLesson?.id || null,
  baselineCardCount: baselineCards.length,
  active: shouldExposeBaseline,
};
