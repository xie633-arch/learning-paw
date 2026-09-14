import { extraCards, curricula } from './platform-data.js';
import { hangulGatePassed } from './korean-hangul-gate-compat-v071.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.15.0';

function readState() {
  if (typeof localStorage === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

export const KOREAN_VOCAB_ITEMS_V15 = [
  { id:'ko-vocab-001', lesson_id:'ko-day-008', word:'한국', meaning:'韩国', pos:'名词', level:'A1', example:'한국에 가요.', example_meaning:'去韩国。', concept_id:'ko.vocab.korea' },
  { id:'ko-vocab-002', lesson_id:'ko-day-008', word:'밥', meaning:'饭；饭食', pos:'名词', level:'A1', example:'밥을 먹어요.', example_meaning:'吃饭。', concept_id:'ko.vocab.meal' },
  { id:'ko-vocab-003', lesson_id:'ko-day-008', word:'집', meaning:'家；房子', pos:'名词', level:'A1', example:'집에 가요.', example_meaning:'回家。', concept_id:'ko.vocab.home' },
  { id:'ko-vocab-004', lesson_id:'ko-day-008', word:'책', meaning:'书', pos:'名词', level:'A1', example:'책이 있어요.', example_meaning:'有书。', concept_id:'ko.vocab.book' },
  { id:'ko-vocab-005', lesson_id:'ko-day-009', word:'학교', meaning:'学校', pos:'名词', level:'A1', example:'학교에 가요.', example_meaning:'去学校。', concept_id:'ko.vocab.school' },
  { id:'ko-vocab-006', lesson_id:'ko-day-009', word:'회사', meaning:'公司', pos:'名词', level:'A1', example:'회사에 가요.', example_meaning:'去公司。', concept_id:'ko.vocab.company' },
  { id:'ko-vocab-007', lesson_id:'ko-day-012', word:'안녕하세요', meaning:'你好', pos:'表达', level:'A1', example:'안녕하세요. 저는 리위예요.', example_meaning:'你好，我是李宇。', concept_id:'ko.vocab.hello' },
  { id:'ko-vocab-008', lesson_id:'ko-day-012', word:'감사합니다', meaning:'谢谢', pos:'表达', level:'A1', example:'정말 감사합니다.', example_meaning:'真的非常感谢。', concept_id:'ko.vocab.thanks' },
  { id:'ko-vocab-009', lesson_id:'ko-day-012', word:'죄송합니다', meaning:'对不起；抱歉', pos:'表达', level:'A1', example:'늦어서 죄송합니다.', example_meaning:'对不起，我迟到了。', concept_id:'ko.vocab.sorry' },
  { id:'ko-vocab-010', lesson_id:'ko-day-012', word:'괜찮아요', meaning:'没关系；还可以', pos:'表达', level:'A1', example:'네, 괜찮아요.', example_meaning:'嗯，没关系。', concept_id:'ko.vocab.okay' },
  { id:'ko-vocab-011', lesson_id:'ko-day-012', word:'네', meaning:'是；好的', pos:'副词/应答', level:'A1', example:'네, 알겠어요.', example_meaning:'好的，我知道了。', concept_id:'ko.vocab.yes' },
  { id:'ko-vocab-012', lesson_id:'ko-day-012', word:'아니요', meaning:'不是；不', pos:'副词/应答', level:'A1', example:'아니요, 괜찮아요.', example_meaning:'不，没关系。', concept_id:'ko.vocab.no' },
  { id:'ko-vocab-013', lesson_id:'ko-day-013', word:'저', meaning:'我（谦称）', pos:'代词', level:'A1', example:'저는 학생이에요.', example_meaning:'我是学生。', concept_id:'ko.vocab.i-humble' },
  { id:'ko-vocab-014', lesson_id:'ko-day-013', word:'학생', meaning:'学生', pos:'名词', level:'A1', example:'저는 학생이에요.', example_meaning:'我是学生。', concept_id:'ko.vocab.student' },
  { id:'ko-vocab-015', lesson_id:'ko-day-013', word:'사람', meaning:'人', pos:'名词', level:'A1', example:'저는 중국 사람이에요.', example_meaning:'我是中国人。', concept_id:'ko.vocab.person' },
  { id:'ko-vocab-016', lesson_id:'ko-day-018', word:'가다', meaning:'去', pos:'动词', level:'A1', example:'오늘 학교에 가요.', example_meaning:'今天去学校。', concept_id:'ko.vocab.go' },
  { id:'ko-vocab-017', lesson_id:'ko-day-018', word:'먹다', meaning:'吃', pos:'动词', level:'A1', example:'밥을 먹어요.', example_meaning:'吃饭。', concept_id:'ko.vocab.eat' },
  { id:'ko-vocab-018', lesson_id:'ko-day-018', word:'보다', meaning:'看', pos:'动词', level:'A1', example:'영화를 봐요.', example_meaning:'看电影。', concept_id:'ko.vocab.see' },
  { id:'ko-vocab-019', lesson_id:'ko-day-018', word:'공부하다', meaning:'学习', pos:'动词', level:'A1', example:'한국어를 공부해요.', example_meaning:'学习韩语。', concept_id:'ko.vocab.study' },
  { id:'ko-vocab-020', lesson_id:'ko-day-019', word:'있다', meaning:'有；在', pos:'动词/形容词', level:'A1', example:'책이 있어요.', example_meaning:'有书。', concept_id:'ko.vocab.exist' },
  { id:'ko-vocab-021', lesson_id:'ko-day-019', word:'없다', meaning:'没有；不在', pos:'动词/形容词', level:'A1', example:'시간이 없어요.', example_meaning:'没有时间。', concept_id:'ko.vocab.not-exist' },
  { id:'ko-vocab-022', lesson_id:'ko-day-022', word:'카페', meaning:'咖啡店', pos:'名词', level:'A1', example:'카페에서 공부해요.', example_meaning:'在咖啡店学习。', concept_id:'ko.vocab.cafe' },
  { id:'ko-vocab-023', lesson_id:'ko-day-023', word:'오늘', meaning:'今天', pos:'名词/副词', level:'A1', example:'오늘 회사에 가요.', example_meaning:'今天去公司。', concept_id:'ko.vocab.today' },
  { id:'ko-vocab-024', lesson_id:'ko-day-023', word:'내일', meaning:'明天', pos:'名词/副词', level:'A1', example:'내일 학교에 가요.', example_meaning:'明天去学校。', concept_id:'ko.vocab.tomorrow' },
  { id:'ko-vocab-025', lesson_id:'ko-day-024', word:'좋아하다', meaning:'喜欢', pos:'动词', level:'A1', example:'저는 커피를 좋아해요.', example_meaning:'我喜欢咖啡。', concept_id:'ko.vocab.like' },
  { id:'ko-vocab-026', lesson_id:'ko-day-025', word:'싶다', meaning:'想；想要（用于 -고 싶다）', pos:'辅助形容词', level:'A1', example:'한국에 가고 싶어요.', example_meaning:'我想去韩国。', concept_id:'ko.vocab.want' },
  { id:'ko-vocab-027', lesson_id:'ko-day-026', word:'커피', meaning:'咖啡', pos:'名词', level:'A1', example:'커피를 좋아해요.', example_meaning:'喜欢咖啡。', concept_id:'ko.vocab.coffee' },
  { id:'ko-vocab-028', lesson_id:'ko-day-026', word:'우유', meaning:'牛奶', pos:'名词', level:'A1', example:'우유를 마셔요.', example_meaning:'喝牛奶。', concept_id:'ko.vocab.milk' },
  { id:'ko-vocab-029', lesson_id:'ko-day-027', word:'피곤하다', meaning:'疲惫；累', pos:'形容词', level:'A1', example:'오늘 조금 피곤해요.', example_meaning:'今天有点累。', concept_id:'ko.vocab.tired' },
  { id:'ko-vocab-030', lesson_id:'ko-day-027', word:'시간', meaning:'时间', pos:'名词', level:'A1', example:'시간이 있어요?', example_meaning:'有时间吗？', concept_id:'ko.vocab.time' },
];

function reviewCount(state, cardId) {
  return (Array.isArray(state.history) ? state.history : []).filter(item => (item.cardId || item.card_id) === cardId).length;
}

export function vocabTrainingMode(count = 0) {
  if (count <= 0) return 'recognition';
  if (count === 1) return 'recall';
  if (count === 2) return 'recognition';
  if (count === 3) return 'listening';
  if (count === 4) return 'recall';
  return count % 3 === 0 ? 'listening' : count % 3 === 1 ? 'recall' : 'context';
}

export function buildVocabCard(item, state = {}) {
  const count = reviewCount(state, item.id);
  const mode = vocabTrainingMode(count);
  return {
    id: item.id,
    card_id: item.id,
    domain: 'korean',
    deck: '韩语',
    category: '核心词汇',
    type: mode === 'listening' ? 'listening' : 'active_recall',
    practice_type: mode === 'listening' ? 'listening_dictation' : mode === 'recall' ? 'active_recall' : 'recognition',
    skill: mode === 'listening' ? 'listening_recognition' : mode === 'recall' ? 'vocabulary_recall' : mode === 'context' ? 'contextual_use' : 'vocabulary_recognition',
    concept_id: item.concept_id,
    lesson_ids: [item.lesson_id],
    introduction_policy: 'curriculum_unlock',
    question: `KV15:${item.id}`,
    prompt: `KV15:${item.id}`,
    answer: item.meaning,
    audioText: item.word,
    tts: item.example,
    word: item.word,
    meaning: item.meaning,
    example: item.example,
    example_meaning: item.example_meaning,
    part_of_speech: item.pos,
    level: item.level,
    vocab_mode: mode,
    source: { kind:'self-authored', name:'Learning Paw Korean Vocabulary V0.15', url:null },
    source_id: 'learning-paw-korean-vocab-v15',
    license: 'self-authored',
  };
}

export function unlockedVocabItems(state = readState(), curriculum = curricula.korean) {
  if (!hangulGatePassed(state)) return [];
  const steps = curriculum?.steps || [];
  const completed = new Set(Object.keys(state.lessonProgress || {}).filter(id => state.lessonProgress[id]));
  const current = steps.find(step => !completed.has(step.id))?.id || null;
  const unlockedLessons = new Set(completed);
  if (current) unlockedLessons.add(current);
  return KOREAN_VOCAB_ITEMS_V15.filter(item => unlockedLessons.has(item.lesson_id));
}

if (typeof window !== 'undefined') {
  const state = readState();
  const cards = unlockedVocabItems(state).map(item => buildVocabCard(item, state));
  const existing = new Set(extraCards.map(card => card.id || card.card_id));
  cards.forEach(card => {
    if (!existing.has(card.id)) {
      extraCards.push(card);
      existing.add(card.id);
    }
  });
  window.__KOREAN_VOCAB_V15__ = {
    version: VERSION,
    items: KOREAN_VOCAB_ITEMS_V15,
    unlocked: cards,
    trainingMode: vocabTrainingMode,
  };
}
