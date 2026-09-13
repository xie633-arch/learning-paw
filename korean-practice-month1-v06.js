import { curricula, extraCards } from './platform-data.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const source = { kind:'self-authored', name:'Personal Learning OS Korean Curriculum', url:null };

const card = ({ id, day, concept, category, skill, practice='active_recall', question, answer, audioText=null, tts=null }) => ({
  id,
  card_id:id,
  concept_id:concept,
  lesson_ids:[`ko-day-${String(day).padStart(3,'0')}`],
  introduction_policy:'curriculum_unlock',
  domain:'korean',
  deck:'韩语',
  category,
  practice_type:practice,
  type:audioText ? 'listening' : 'active_recall',
  skill,
  level:1,
  question,
  prompt:question,
  answer,
  ...(audioText ? { audioText } : {}),
  ...(tts || audioText ? { tts:tts || audioText } : {}),
  source,
  source_id:'source-self-authored-learning-os-korean',
  license:'CC-BY-4.0-self-authored',
});

const month1Cards = [
  card({ id:'ko-d8-001', day:8, concept:'ko.pronunciation.batchim-basic', category:'Week 2｜받침', skill:'hangul_reading', question:'밥 / 집 / 책 / 한국 这些词和开音节词相比，多了什么结构？', answer:'它们至少有一个音节以辅音收尾，也就是有 받침（收音）。例如 밥 的 받침 是 ㅂ，집 的 받침是 ㅂ，책 的 받침是 ㄱ。' }),
  card({ id:'ko-d8-002', day:8, concept:'ko.pronunciation.batchim-basic', category:'Week 2｜听辨', skill:'listening_recognition', practice:'listening_dictation', question:'听音频，写下三个带 받침 的词。', answer:'밥 / 집 / 책', audioText:'밥 집 책' }),

  card({ id:'ko-d9-001', day:9, concept:'ko.pronunciation.batchim-common', category:'Week 2｜받침', skill:'hangul_reading', question:'分别指出 문 / 공 / 집 的 받침。', answer:'문 → ㄴ；공 → ㅇ；집 → ㅂ。先做到“看到末尾辅音”，再逐步熟悉真实发音。' }),
  card({ id:'ko-d9-002', day:9, concept:'ko.pronunciation.batchim-common', category:'Week 2｜听写', skill:'listening_recognition', practice:'listening_dictation', question:'听音频，用韩语键盘写下三个词。', answer:'문 / 공 / 집', audioText:'문 공 집' }),

  card({ id:'ko-d10-001', day:10, concept:'ko.pronunciation.liaison', category:'Week 2｜连音', skill:'pronunciation_awareness', question:'为什么 책이 不适合逐字停成“책 / 이”来读？', answer:'当前一个音节有 받침、后一个音节以元音开始时，真实语流中常会发生连音。책이 自然听感接近 [채기]。初级先建立“写法和实际连读声音可能不同”的意识。', tts:'책이' }),
  card({ id:'ko-d10-002', day:10, concept:'ko.pronunciation.liaison', category:'Week 2｜听辨', skill:'listening_recognition', practice:'listening_dictation', question:'听两遍，把短语写下来。', answer:'한국어', audioText:'한국어' }),

  card({ id:'ko-d11-001', day:11, concept:'ko.pronunciation.nasalization', category:'Week 2｜音变', skill:'pronunciation_awareness', question:'국물 的自然发音为什么可能让初学者听起来像“궁물”？', answer:'这是常见鼻音化现象。这里先记住：不要只按字面逐辅音硬拼，听力里要允许 받침 在相邻辅音影响下发生变化。', tts:'국물' }),
  card({ id:'ko-d11-002', day:11, concept:'ko.pronunciation.nasalization', category:'Week 2｜听辨', skill:'listening_discrimination', practice:'listening_dictation', question:'听音频后写下这个词的标准拼写，不要按听感改写。', answer:'국물', audioText:'국물' }),

  card({ id:'ko-d12-001', day:12, concept:'ko.expression.greetings', category:'Week 2｜生存表达', skill:'vocabulary_recognition', question:'第一次见面时，안녕하세요 / 감사합니다 / 죄송합니다 分别最常用于什么场景？', answer:'안녕하세요＝你好；감사합니다＝谢谢；죄송합니다＝对不起/抱歉。重点是看到场景能主动调用，而不是只会中韩互译。' }),
  card({ id:'ko-d12-002', day:12, concept:'ko.expression.greetings', category:'Week 2｜听辨', skill:'listening_recognition', practice:'listening_dictation', question:'听音频，把两句礼貌表达写下来。', answer:'감사합니다 / 죄송합니다', audioText:'감사합니다 죄송합니다' }),

  card({ id:'ko-d13-001', day:13, concept:'ko.grammar.copula-polite', category:'Week 2｜自我介绍', skill:'grammar_production', question:'“我是学生。”和“我是中国人。”分别怎么说？', answer:'저는 학생이에요. / 저는 중국 사람이에요.' , tts:'저는 학생이에요. 저는 중국 사람이에요.' }),
  card({ id:'ko-d13-002', day:13, concept:'ko.expression.self-intro-basic', category:'Week 2｜主动表达', skill:'speaking_production', practice:'production', question:'不看答案，连续说三句：你好 → 我是中国人 → 我是学生。', answer:'안녕하세요. 저는 중국 사람이에요. 저는 학생이에요.', tts:'안녕하세요. 저는 중국 사람이에요. 저는 학생이에요.' }),

  card({ id:'ko-d15-001', day:15, concept:'ko.grammar.sov', category:'Week 3｜句子结构', skill:'grammar_understanding', question:'韩语最基础的句子顺序和中文常见顺序有什么不同？', answer:'韩语常见基础顺序是 S-O-V：主语/主题 → 宾语 → 动词，动词通常在句尾。学习时不要逐字照中文顺序搬过去。' }),
  card({ id:'ko-d15-002', day:15, concept:'ko.grammar.sov', category:'Week 3｜句子结构', skill:'production', practice:'sentence_building', question:'把“저는 / 한국어를 / 배워요”按韩语自然顺序排成一句话。', answer:'저는 한국어를 배워요.（我学习韩语。）', tts:'저는 한국어를 배워요.' }),

  card({ id:'ko-d16-001', day:16, concept:'ko.grammar.eun-neun', category:'Week 3｜助词', skill:'grammar_understanding', question:'저__ 학생이에요。这里应该用 는 还是 은？为什么？', answer:'저는 학생이에요。저 以元音结尾，所以接 는。初级先掌握：元音后 는，辅音后 은。' }),
  card({ id:'ko-d16-002', day:16, concept:'ko.grammar.eun-neun', category:'Week 3｜主动表达', skill:'production', practice:'production', question:'用 저는 开头说两句关于自己的话。', answer:'示例：저는 중국 사람이에요. 저는 학생이에요. 重点是主动使用 은/는，而不是背固定答案。', tts:'저는 중국 사람이에요. 저는 학생이에요.' }),

  card({ id:'ko-d17-001', day:17, concept:'ko.grammar.i-ga', category:'Week 3｜助词', skill:'grammar_understanding', question:'책__ 있어요。这里应该填 이 还是 가？', answer:'책이 있어요。책 以辅音结尾，所以用 이；元音结尾名词通常接 가。' }),
  card({ id:'ko-d17-002', day:17, concept:'ko.grammar.i-ga', category:'Week 3｜听辨', skill:'listening_comprehension', practice:'listening_dictation', question:'听音频，写下完整句子。', answer:'책이 있어요.', audioText:'책이 있어요' }),

  card({ id:'ko-d18-001', day:18, concept:'ko.grammar.eul-reul', category:'Week 3｜助词', skill:'grammar_understanding', question:'“我喜欢咖啡”里，커피 后面本阶段练习哪个宾语助词？', answer:'커피를 좋아해요。커피 以元音结尾，所以接 를。辅音结尾名词通常接 을。', tts:'저는 커피를 좋아해요.' }),
  card({ id:'ko-d18-002', day:18, concept:'ko.vocab.core-verbs-1', category:'Week 3｜动词', skill:'vocabulary_production', question:'把 먹다 / 보다 / 하다 / 좋아하다 / 배우다 分别说出中文核心意思。', answer:'吃 / 看 / 做 / 喜欢 / 学习。后面会继续把词典形变成真实口语形式。' }),

  card({ id:'ko-d19-001', day:19, concept:'ko.grammar.present-polite', category:'Week 3｜现在时', skill:'grammar_production', question:'把 먹다 / 가다 / 하다 变成礼貌现在时。', answer:'먹어요 / 가요 / 해요', tts:'먹어요 가요 해요' }),
  card({ id:'ko-d19-002', day:19, concept:'ko.grammar.present-polite', category:'Week 3｜听辨', skill:'listening_comprehension', practice:'listening_dictation', question:'听音频，写下三个礼貌现在时动词。', answer:'먹어요 / 가요 / 해요', audioText:'먹어요 가요 해요' }),

  card({ id:'ko-d20-001', day:20, concept:'ko.grammar.itda-eopda', category:'Week 3｜存在表达', skill:'grammar_understanding', question:'책이 있어요 / 책이 없어요 分别是什么意思？', answer:'有书 / 没有书。있어요 表示有、在；없어요 表示没有、不在。', tts:'책이 있어요. 책이 없어요.' }),
  card({ id:'ko-d20-002', day:20, concept:'ko.grammar.itda-eopda', category:'Week 3｜主动表达', skill:'production', practice:'production', question:'看你身边一个物品，用 있어요 或 없어요 说一句。', answer:'示例：책이 있어요. / 커피가 없어요. 重点是自己选真实对象。' }),

  card({ id:'ko-d22-001', day:22, concept:'ko.grammar.e-eseo', category:'Week 4｜地点', skill:'grammar_understanding', question:'在“去学校”和“在学校学习”里，地点助词分别优先练什么？', answer:'학교에 가요（去学校）/ 학교에서 공부해요（在学校学习）。初级先记：에 常和目的地/存在位置联系；에서 常标记动作发生的场所。', tts:'학교에 가요. 학교에서 공부해요.' }),
  card({ id:'ko-d22-002', day:22, concept:'ko.grammar.e-eseo', category:'Week 4｜听辨', skill:'listening_comprehension', practice:'listening_dictation', question:'听音频，写下完整句子。', answer:'카페에서 공부해요.', audioText:'카페에서 공부해요' }),

  card({ id:'ko-d23-001', day:23, concept:'ko.vocab.core-verbs-2', category:'Week 4｜日常行动', skill:'vocabulary_production', question:'가요 / 와요 / 공부해요 / 일해요 / 만나요 分别是什么意思？', answer:'去 / 来 / 学习 / 工作 / 见面。' }),
  card({ id:'ko-d23-002', day:23, concept:'ko.vocab.core-verbs-2', category:'Week 4｜主动表达', skill:'production', practice:'production', question:'回答：오늘 어디에 가요? 그리고 뭐 해요?', answer:'示例：오늘 카페에 가요. 카페에서 공부해요. 请尽量换成自己的真实答案。', tts:'오늘 카페에 가요. 카페에서 공부해요.' }),

  card({ id:'ko-d24-001', day:24, concept:'ko.expression.likes', category:'Week 4｜兴趣', skill:'production', practice:'production', question:'用 좋아해요 说三样你真的喜欢的东西。', answer:'示例：저는 커피를 좋아해요. 저는 음악을 좋아해요. 저는 영화를 좋아해요. 可以替换成自己的内容。', tts:'저는 커피를 좋아해요. 저는 음악을 좋아해요. 저는 영화를 좋아해요.' }),
  card({ id:'ko-d24-002', day:24, concept:'ko.expression.likes', category:'Week 4｜听辨', skill:'listening_comprehension', practice:'listening_dictation', question:'听音频，写下完整句子。', answer:'저는 음악을 좋아해요.', audioText:'저는 음악을 좋아해요' }),

  card({ id:'ko-d25-001', day:25, concept:'ko.grammar.go-sipeoyo', category:'Week 4｜愿望', skill:'grammar_production', question:'가다 / 먹다 / 보다 加上 -고 싶어요 后分别怎么说？', answer:'가고 싶어요 / 먹고 싶어요 / 보고 싶어요', tts:'가고 싶어요. 먹고 싶어요. 보고 싶어요.' }),
  card({ id:'ko-d25-002', day:25, concept:'ko.grammar.go-sipeoyo', category:'Week 4｜主动表达', skill:'production', practice:'production', question:'回答：주말에 뭐 하고 싶어요?', answer:'示例：주말에 영화를 보고 싶어요. / 카페에 가고 싶어요. 请换成自己的真实愿望。' }),

  card({ id:'ko-d26-001', day:26, concept:'ko.grammar.an-negation', category:'Week 4｜否定', skill:'grammar_production', question:'把 가요 / 먹어요 / 좋아해요 变成最基础的 안 否定。', answer:'안 가요 / 안 먹어요 / 안 좋아해요', tts:'안 가요. 안 먹어요. 안 좋아해요.' }),
  card({ id:'ko-d26-002', day:26, concept:'ko.grammar.an-negation', category:'Week 4｜听辨', skill:'listening_comprehension', practice:'listening_dictation', question:'听音频，写下完整句子。', answer:'저는 커피를 안 좋아해요.', audioText:'저는 커피를 안 좋아해요' }),

  card({ id:'ko-d27-001', day:27, concept:'ko.vocab.time-basic', category:'Week 4｜时间', skill:'vocabulary_recognition', question:'오늘 / 내일 / 어제 / 지금 分别是什么意思？', answer:'今天 / 明天 / 昨天 / 现在。' }),
  card({ id:'ko-d27-002', day:27, concept:'ko.writing.daily-life-1', category:'Week 4｜日常输出', skill:'production', practice:'production', question:'不用追求复杂，尝试用已学内容说或写 3 句“我的今天”。', answer:'示例：오늘 카페에 가요. 카페에서 공부해요. 저는 커피를 좋아해요. 重点是把旧知识串起来。' }),
];

function unlockedLessonIds() {
  let progress = {};
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    progress = state.lessonProgress || {};
  } catch {}
  const steps = curricula.korean?.steps || [];
  const unlocked = new Set(steps.filter(step => progress[step.id]).map(step => step.id));
  const current = steps.find(step => !progress[step.id]);
  if (current) unlocked.add(current.id);
  return unlocked;
}

const unlocked = unlockedLessonIds();
const existing = new Set(extraCards.map(item => item.id));
month1Cards.forEach(item => {
  if ((item.lesson_ids || []).some(id => unlocked.has(id)) && !existing.has(item.id)) {
    extraCards.push(item);
    existing.add(item.id);
  }
});

window.__KOREAN_MONTH1_PRACTICE_V06__ = {
  version:'0.6.0',
  total_cards:month1Cards.length,
  loaded_cards:month1Cards.filter(item => (item.lesson_ids || []).some(id => unlocked.has(id))).length,
};
