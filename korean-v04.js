import { curricula, domainOverrides } from './platform-data.js';

const PROGRAM_ID = 'korean-topik-2027';
const minutePlan = { minimum: 20, standard: 50, intensive: 80 };

const defaultActivities = [
  { id: 'review', type: 'fsrs_review', minutes: 10 },
  { id: 'lesson', type: 'concept_learning', minutes: 18 },
  { id: 'input', type: 'listening', minutes: 8 },
  { id: 'production', type: 'active_recall', minutes: 8 },
  { id: 'voice', type: 'pronunciation_shadowing', minutes: 8 },
  { id: 'exit_check', type: 'micro_assessment', minutes: 4 },
];

const lesson = ({
  day,
  phase,
  title,
  summary,
  keyPoints = [],
  task,
  output,
  concepts = [],
  activities = defaultActivities,
  exitCriteria = [],
  examAlignment = null,
}) => ({
  id: `ko-day-${String(day).padStart(3, '0')}`,
  lesson_id: `ko-day-${String(day).padStart(3, '0')}`,
  program_id: PROGRAM_ID,
  phase_id: phase,
  day_index: day,
  title: day === 0 ? `Day 0｜${title}` : `Day ${day}｜${title}`,
  summary,
  keyPoints,
  task,
  output,
  objectives: [summary],
  new_concepts: concepts,
  estimated_minutes: minutePlan,
  review_policy: 'fsrs_due',
  activities,
  exit_criteria: exitCriteria,
  exam_alignment: examAlignment,
});

const weeklyCheckActivities = [
  { id: 'review', type: 'fsrs_review', minutes: 8 },
  { id: 'assessment', type: 'weekly_check', minutes: 25 },
  { id: 'remediation', type: 'targeted_review', minutes: 12 },
  { id: 'voice', type: 'pronunciation_reading', minutes: 5 },
];

const milestoneActivities = [
  { id: 'assessment', type: 'milestone_assessment', minutes: 35 },
  { id: 'writing', type: 'writing', minutes: 10 },
  { id: 'voice', type: 'ai_conversation', minutes: 10, status: 'planned-interface' },
  { id: 'pronunciation', type: 'pronunciation_reading', minutes: 8 },
  { id: 'review', type: 'reflection', minutes: 7 },
];

domainOverrides.korean = {
  status: 'active',
  statusLabel: '可学习',
  description: '以 2027 TOPIK II 4级为长期目标，100天为第一阶段；课程、FSRS、听说读写与语音训练并行。',
  modes: [
    { label: 'Day 0–28 课程路线', status: '可用' },
    { label: '主动表达 / 听写 / TTS', status: '可用' },
    { label: 'AI Conversation', status: '下一阶段' },
    { label: 'Pronunciation Lab', status: '下一阶段' },
  ],
};

curricula.korean = {
  schema_version: '1.0',
  program_id: PROGRAM_ID,
  name: '韩语 TOPIK 4 长期学习计划',
  title: '韩语｜Day 0–28 基础课程路线',
  domain: 'korean',
  status: 'active',
  source: '自有课程设计；详细总纲与课程地图保存在私有 Obsidian Vault。',
  goal: {
    primary: '2027 TOPIK II 4级',
    stretch: 'TOPIK 5级',
    milestone: '100天完成第一阶段，建立初级完整基础并进入 TOPIK 中级轨道',
  },
  steps: [
    lesson({
      day: 0,
      phase: 'ko-phase-0-baseline',
      title: '入学基线',
      summary: '建立韩文识读、声音辨别、已有词汇、发音、韩语键盘与学习负荷基线，不用 TOPIK II 难题制造挫败感。',
      keyPoints: ['识读基线', '发音样本', '韩语键盘', '20 / 50 / 80 分钟模式'],
      task: '完成简短识读与输入法检查，并留下固定发音样本；结果只用于决定起点。',
      output: 'Day 0 Baseline',
      concepts: ['ko.baseline.hangul', 'ko.baseline.pronunciation', 'ko.baseline.typing'],
      activities: [
        { id: 'hangul', type: 'baseline_assessment', minutes: 8 },
        { id: 'sound', type: 'listening_baseline', minutes: 5 },
        { id: 'voice', type: 'pronunciation_reading', minutes: 5 },
        { id: 'typing', type: 'typing_baseline', minutes: 4 },
        { id: 'load', type: 'preference_setup', minutes: 3 },
      ],
      exitCriteria: ['建立基线记录即可，不要求达到固定分数'],
    }),

    lesson({ day: 1, phase: 'ko-phase-1-hangul', title: '韩文是怎么组成的', summary: '理解韩文音节块，由基础辅音和元音组合读出简单音节。', keyPoints: ['ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ', 'ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ', '辅音 + 元音'], task: '解释 가 / 나 / 다 如何组成，并完成基础听辨与少量规范书写。', output: '能解释并慢速拼读基础音节', concepts: ['ko.hangul.basic-vowels', 'ko.hangul.basic-consonants', 'ko.hangul.syllable-block'] }),
    lesson({ day: 2, phase: 'ko-phase-1-hangul', title: '补齐基础辅音与元音', summary: '补齐常用基础辅音并加入 ㅐ / ㅔ，扩大可拼读音节范围。', keyPoints: ['ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ', 'ㅐ ㅔ', '자 차 카 타 파 하'], task: '随机看到 10 个音节，先自己慢速读出，再核对。', output: '10 个随机音节拼读', concepts: ['ko.hangul.more-consonants', 'ko.hangul.ae-e'] }),
    lesson({ day: 3, phase: 'ko-phase-1-hangul', title: '送气音与紧音初识', summary: '先建立平音、送气音、紧音是不同声音的意识，不追求一天全部发准。', keyPoints: ['ㄱ/ㅋ/ㄲ', 'ㄷ/ㅌ/ㄸ', 'ㅂ/ㅍ/ㅃ', 'ㅈ/ㅊ/ㅉ', 'ㅅ/ㅆ'], task: '做最小对比跟读，记录自己最难区分的 1–2 组。', output: '个人发音风险标签', concepts: ['ko.pronunciation.plain-aspirated-tense'] }),
    lesson({ day: 4, phase: 'ko-phase-1-hangul', title: '复合元音', summary: '理解复合元音的组合规律，并第一次把韩语键盘纳入学习。', keyPoints: ['ㅑ ㅕ ㅛ ㅠ', 'ㅘ ㅝ ㅚ ㅟ ㅢ', 'Hangul Typing'], task: '拼读 20 个音节，并用韩语键盘输入其中一部分。', output: '20 个音节 + 5 分钟输入练习', concepts: ['ko.hangul.compound-vowels', 'ko.typing.basic'] }),
    lesson({ day: 5, phase: 'ko-phase-1-hangul', title: '第一次真实词拼读', summary: '从孤立音节进入真实高频词，看到韩文先读，再看中文意思。', keyPoints: ['나 / 너 / 우리', '한국', '커피 / 바나나 / 우유'], task: '先读 7 个真实词，再做听词选韩文、手写与跟读。', output: '第一批真实词拼读', concepts: ['ko.vocab.first-words'] }),
    lesson({ day: 6, phase: 'ko-phase-1-hangul', title: '速度与准确率', summary: '把 Week 1 字母知识串起来，提高随机拼读与键盘输入稳定性。', keyPoints: ['30 个随机音节', '10 个简单词', '固定发音样本'], task: '完成音节与词拼读，并复读 Day 0 固定发音样本。', output: 'Week 1 预验收记录', concepts: ['ko.hangul.fluency-1'] }),
    lesson({ day: 7, phase: 'ko-phase-1-hangul', title: 'Week 1 验收', summary: '验证基础字母识别、音节拼读、简单词拼读、声音辨别和键盘输入。', keyPoints: ['基础字母 ≥90%', '不依赖罗马音', '薄弱项回炉'], task: '完成 Week 1 检查，只补薄弱，不大量加新内容。', output: 'Week 1 Check', concepts: ['ko.assessment.week1'], activities: weeklyCheckActivities, exitCriteria: ['基础字母识别 ≥ 90%', '无罗马音可慢速拼读简单音节'] }),

    lesson({ day: 8, phase: 'ko-phase-2-batchim', title: '받침 是什么', summary: '理解音节末尾辅音，开始读带收音的真实词。', keyPoints: ['ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅇ', '한국 / 밥 / 집 / 책'], task: '对比开音节和有 받침 音节，完成基础跟读。', output: '받침 入门拼读', concepts: ['ko.pronunciation.batchim-basic'] }),
    lesson({ day: 9, phase: 'ko-phase-2-batchim', title: '받침 基础读法', summary: '通过常见词掌握高频 받침 读法，并开始听到词后输入韩文。', keyPoints: ['高频 받침', '听写 5–8 词', 'Typing'], task: '听写 5–8 个简单词并用韩语键盘输入。', output: '基础听写', concepts: ['ko.pronunciation.batchim-common'] }),
    lesson({ day: 10, phase: 'ko-phase-2-batchim', title: '连音', summary: '理解元音开头音节前常见的连读现象，训练“听到的声音”和“写出来的词”之间的对应。', keyPoints: ['连音', '先听后看', '遮住文本跟读'], task: '真实短语跟读两轮，第二轮遮住文字。', output: '连音听辨与跟读', concepts: ['ko.pronunciation.liaison'] }),
    lesson({ day: 11, phase: 'ko-phase-2-batchim', title: '鼻音化与高频音变初识', summary: '只学最影响初级听力的高频音变，目标是听到时不把它误判成另一个词。', keyPoints: ['鼻音化', '高频音变', 'Pronunciation Bank'], task: '听辨高频样本并建立第一批发音风险标签。', output: 'Pronunciation Bank 初版', concepts: ['ko.pronunciation.nasalization'] }),
    lesson({ day: 12, phase: 'ko-phase-2-batchim', title: '问候与礼貌表达', summary: '把发音基础放入真正的生存韩语，完成第一次 30–60 秒见面问候。', keyPoints: ['안녕하세요', '감사합니다', '죄송합니다', '괜찮아요', '네 / 아니요'], task: '先主动说，再看参考表达；完成短见面场景。', output: '30–60 秒问候场景', concepts: ['ko.expression.greetings'] }),
    lesson({ day: 13, phase: 'ko-phase-2-batchim', title: '“我是……”与身份表达', summary: '用 저는 ___예요/이에요 建立第一套可扩展的自我介绍结构。', keyPoints: ['저는', '예요 / 이에요', '사람 / 학생 / 회사원', '중국 / 한국'], task: '做 3 句自我介绍，并回答姓名、身份、来自哪里的基础问题。', output: '3 句自我介绍', concepts: ['ko.grammar.copula-polite', 'ko.expression.self-intro-basic'] }),
    lesson({ day: 14, phase: 'ko-phase-2-batchim', title: 'Week 2 验收', summary: '检查 받침、高频音变、生存表达与 30–60 秒自我介绍。', keyPoints: ['받침', '音变听辨', '5 个生存表达', '短自我介绍'], task: '完成 Week 2 Check，并把未过项标记为下一周优先复习。', output: 'Week 2 Check', concepts: ['ko.assessment.week2'], activities: weeklyCheckActivities, exitCriteria: ['能读常见 받침 词', '能完成基础问候与身份表达'] }),

    lesson({ day: 15, phase: 'ko-phase-3-sentence', title: '韩语句子的基本顺序', summary: '建立 SOV 基础概念，不再按中文顺序硬翻韩语。', keyPoints: ['SOV', '저 / 저는', '最简单陈述句'], task: '自己组成 5 个最简单韩语句子。', output: '5 个基础句', concepts: ['ko.grammar.sov'] }),
    lesson({ day: 16, phase: 'ko-phase-3-sentence', title: '은/는', summary: '先掌握主题标记的基础用法，用于自我介绍和简单对比，不提前塞入全部语用细节。', keyPoints: ['主题标记', '自我介绍', '基础对比'], task: '完成中文/意图 → 韩语的主题句主动输出。', output: '은/는 主动表达', concepts: ['ko.grammar.eun-neun'] }),
    lesson({ day: 17, phase: 'ko-phase-3-sentence', title: '이/가', summary: '建立主语标记入门概念，并和 은/는 做最基础的对照。', keyPoints: ['主语标记', '은/는 基础对照', '错句纠正'], task: '判断并修正 5 个简单句。', output: '助词基础纠错', concepts: ['ko.grammar.i-ga'] }),
    lesson({ day: 18, phase: 'ko-phase-3-sentence', title: '을/를 + 常见动词', summary: '建立宾语结构，并把 먹다 / 보다 / 하다 / 좋아하다 / 배우다 放进句子。', keyPoints: ['을/를', '먹다 / 보다 / 하다', '좋아하다 / 배우다'], task: '主动表达 5 句，并完成短句听辨。', output: '5 个宾语结构句', concepts: ['ko.grammar.eul-reul', 'ko.vocab.core-verbs-1'] }),
    lesson({ day: 19, phase: 'ko-phase-3-sentence', title: '아요/어요 礼貌现在时', summary: '理解词典形和实际口语形式的区别，掌握第一批高频动词现在时。', keyPoints: ['词典形', '아요/어요', '完整句输入'], task: '根据中文提示输入完整韩语句，并用已学动词完成问答。', output: '现在时句子组', concepts: ['ko.grammar.present-polite'] }),
    lesson({ day: 20, phase: 'ko-phase-3-sentence', title: '있어요 / 없어요', summary: '表达有/没有、在/不在，把物品、家人、地点放进真实问答。', keyPoints: ['있어요', '없어요', '物品 / 家人 / 地点'], task: '围绕桌面或房间物品完成问答。', output: '存在表达问答', concepts: ['ko.grammar.itda-eopda'] }),
    lesson({ day: 21, phase: 'ko-phase-3-sentence', title: 'Week 3 综合日', summary: '把助词、现在时和高频动词合并到连续表达中，目标是独立组成基础陈述句。', keyPoints: ['은/는 / 이/가 / 을/를', '现在时', '高频动词', '3 分钟受控交流'], task: '完成综合练习和 3 分钟受控口语；AI 语音接口未上线时用自问自答/录音替代。', output: 'Week 3 Check', concepts: ['ko.assessment.week3'], activities: weeklyCheckActivities, exitCriteria: ['能独立组成基础陈述句', '不只依赖固定问候语'] }),

    lesson({ day: 22, phase: 'ko-phase-4-daily-life', title: '에 / 에서', summary: '建立地点与动作场所的基础区分，并进入极短日常阅读。', keyPoints: ['에', '에서', '学校 / 公司 / 家 / 咖啡店'], task: '读一段极短日常活动描述，并写 4 个地点句。', output: '地点表达', concepts: ['ko.grammar.e-eseo'] }),
    lesson({ day: 23, phase: 'ko-phase-4-daily-life', title: '去 / 来 / 做什么', summary: '用 가다 / 오다 / 하다 / 공부하다 / 일하다 / 만나다 描述最基础的日常行动。', keyPoints: ['가다 / 오다', '공부하다 / 일하다', '만나다'], task: '回答今天去哪里、做什么，并对自己的回答再追问一层。', output: '日常行动问答', concepts: ['ko.vocab.core-verbs-2'] }),
    lesson({ day: 24, phase: 'ko-phase-4-daily-life', title: '喜欢与兴趣', summary: '用 좋아해요 谈食物、音乐、电影、运动、咖啡等第一批真实兴趣。', keyPoints: ['좋아해요', '兴趣主题词', '自由造句'], task: '做兴趣问答，并自由写 5 句。', output: '兴趣表达 5 句', concepts: ['ko.expression.likes'] }),
    lesson({ day: 25, phase: 'ko-phase-4-daily-life', title: '-고 싶어요', summary: '表达“想做……”，把愿望和兴趣、旅行、食物等真实场景连接。', keyPoints: ['-고 싶어요', '愿望', '周末 / 韩国旅行'], task: '说 5 个愿望句，并回答周末想做什么、去韩国想去哪里。', output: '愿望表达', concepts: ['ko.grammar.go-sipeoyo'] }),
    lesson({ day: 26, phase: 'ko-phase-4-daily-life', title: '안 + 基础否定', summary: '掌握第一种高频基础否定，能做肯定/否定回答并听出差别。', keyPoints: ['안 가요', '안 먹어요', '안 좋아해요'], task: '完成肯定/否定对照、错句纠正和简短听力判断。', output: '否定表达', concepts: ['ko.grammar.an-negation'] }),
    lesson({ day: 27, phase: 'ko-phase-4-daily-life', title: '时间、今天与日常', summary: '学习第一批时间词，写出 5–8 句“我的一天”极简版，不急着塞完全部数字系统。', keyPoints: ['오늘 / 내일 / 어제 / 지금', '아침 / 저녁', '极简日记'], task: '写 5–8 句“我的一天”，并做一轮日常问答。', output: '极简日常短文', concepts: ['ko.vocab.time-basic', 'ko.writing.daily-life-1'] }),
    lesson({
      day: 28,
      phase: 'ko-phase-4-daily-life',
      title: 'Month 1 阶段验收',
      summary: '综合验证拼读、받침、词汇、基础语法、听读、短写作和受控口语，并与 Day 0 固定发音样本比较。',
      keyPoints: ['随机拼读', '基础听读', '5–8 句写作', '3–5 分钟受控交流', 'Day 0 发音对比'],
      task: '完成 Month 1 Assessment；根据结果决定正常进入第二月还是安排针对性补强。',
      output: 'Month 1 学习报告',
      concepts: ['ko.assessment.month1'],
      activities: milestoneActivities,
      exitCriteria: ['无罗马音可慢速拼读常见韩文', '能理解并生成基础 SOV 句', '能进行 3–5 分钟受控日常问答'],
      examAlignment: { target: 'TOPIK_I_foundation', skills: ['listening', 'reading', 'writing'] },
    }),
  ],
};

// V0.4 仍由 app.js 负责页面；这里只修正韩语模块旧的“保持现状”提示，避免和已接入 Curriculum 冲突。
const patchKoreanLead = () => {
  const lead = document.querySelector('#homeLead');
  const domainName = document.querySelector('#domainName');
  if (!lead || !domainName) return;
  const sync = () => {
    if (domainName.textContent.trim() === '韩语' && lead.textContent.includes('保持现状')) {
      lead.textContent = 'Day 0–28 基础课程已接入：新课由 Curriculum 推进，旧知识由 FSRS 回来；AI Conversation 与 Pronunciation Lab 将沿同一学习记录继续接入。';
    }
  };
  new MutationObserver(sync).observe(lead, { childList: true, subtree: true, characterData: true });
  new MutationObserver(sync).observe(domainName, { childList: true, subtree: true, characterData: true });
  queueMicrotask(sync);
};

patchKoreanLead();

window.__KOREAN_CURRICULUM__ = {
  program_id: PROGRAM_ID,
  version: '0.4.2',
  lessons: curricula.korean.steps.length,
  sourceOfTruth: 'Obsidian 02_语言/韩语',
};
