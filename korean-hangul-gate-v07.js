import { curricula, domainOverrides } from './platform-data.js';
import { lessonContentById } from './lesson-content-v05.js';
import { koreanAssessments, koreanAssessmentStages } from './korean-assessment-data-v05.js';

const VERSION = '0.7.0';
const GATE_LESSON_ID = 'ko-hangul-gate';
const GATE_ASSESSMENT_ID = 'ko-hangul-gate-v1';

const gateLesson = {
  id: GATE_LESSON_ID,
  lesson_id: GATE_LESSON_ID,
  program_id: 'korean-topik-2027',
  phase_id: 'ko-phase-0-hangul-gate',
  day_index: 0,
  title: '前置门槛｜韩文字母通关考核',
  summary: '韩文字母基础改为站外自学。你可以用 B 站或自己喜欢的网课学习；Learning Paw 只负责验收，通过后再进入正式韩语课程。',
  keyPoints: ['基础辅音 / 元音', '送气音 / 紧音 / 复合元音辨认', '辅音 + 元音音节拼读', '基础听辨', '韩语键盘输入'],
  task: '先在站外完成韩文字母学习。准备好后直接参加通关考核；未通过就针对错项补课后重测。',
  output: 'Hangul Gate Pass',
  objectives: ['不依赖罗马音，稳定识别基础韩文字母并完成简单音节拼读。'],
  new_concepts: ['ko.hangul.gate'],
  estimated_minutes: { minimum: 0, standard: 0, intensive: 0 },
  review_policy: 'external_self_study_then_assessment',
  activities: [{ id: 'assessment', type: 'prerequisite_gate', minutes: 12 }],
  exit_criteria: ['总分 ≥ 85', '字母识别 ≥ 80%', '音节组合 ≥ 80%'],
  exam_alignment: null,
};

koreanAssessments.hangulGate = {
  schema_version: '1.0',
  assessment_id: GATE_ASSESSMENT_ID,
  name: '韩文字母通关考核｜通过后解锁正式课程',
  domain: 'korean',
  purpose: 'prerequisite_gate',
  mode: 'exam',
  scoring: 'objective_weighted',
  max_score: 100,
  pass_rule: {
    total_min: 85,
    section_min_ratio: {
      hangul_recognition: 0.8,
      syllable_composition: 0.8,
    },
  },
  description: '这不是字母教学课，而是前置能力验收。建议先用 B 站或你喜欢的课程自学韩文字母；准备好后再来考试。通过后 Learning Paw 才会进入 받침、音变、生存表达与后续语法。',
  result_note: '未通过很正常：按错题定位薄弱字母或拼读规则，回站外课程补强后再测。平台不会要求你重新完成一整套站内字母课程。',
  sections: [
    { id: 'hangul_recognition', label: '字母识别', max_score: 40 },
    { id: 'syllable_composition', label: '音节组合', max_score: 30 },
    { id: 'listening_discrimination', label: '基础听辨', max_score: 20 },
    { id: 'typing', label: '韩语输入', max_score: 10 },
  ],
  items: [
    { item_id:'ko-gate-01', section_id:'hangul_recognition', skill:'hangul_reading', type:'mcq', max_score:8, concept_ids:['ko.hangul.basic-vowels'], prompt:'下面哪一个是元音 ㅓ？', options:['ㅏ','ㅓ','ㅗ','ㅜ'], correct_answer:1, explanation:'ㅓ 是基础元音之一。' },
    { item_id:'ko-gate-02', section_id:'hangul_recognition', skill:'hangul_reading', type:'mcq', max_score:8, concept_ids:['ko.hangul.basic-consonants'], prompt:'下面哪一个是辅音 ㅁ？', options:['ㄴ','ㄹ','ㅁ','ㅂ'], correct_answer:2, explanation:'ㅁ 是基础辅音。' },
    { item_id:'ko-gate-03', section_id:'hangul_recognition', skill:'hangul_reading', type:'mcq', max_score:8, concept_ids:['ko.pronunciation.plain-aspirated-tense'], prompt:'下面哪一个是与 ㄱ 对应的送气音？', options:['ㄲ','ㅋ','ㄷ','ㅊ'], correct_answer:1, explanation:'ㅋ 是与 ㄱ 对应的送气音。' },
    { item_id:'ko-gate-04', section_id:'hangul_recognition', skill:'hangul_reading', type:'mcq', max_score:8, concept_ids:['ko.pronunciation.plain-aspirated-tense'], prompt:'下面哪一个是紧音 ㅆ？', options:['ㅅ','ㅆ','ㅈ','ㅊ'], correct_answer:1, explanation:'ㅆ 是 ㅅ 对应的紧音。' },
    { item_id:'ko-gate-05', section_id:'hangul_recognition', skill:'hangul_reading', type:'mcq', max_score:8, concept_ids:['ko.hangul.compound-vowels'], prompt:'下面哪一个是复合元音 ㅘ？', options:['ㅗ','ㅏ','ㅘ','ㅝ'], correct_answer:2, explanation:'ㅘ 由 ㅗ + ㅏ 组合而来。' },

    { item_id:'ko-gate-06', section_id:'syllable_composition', skill:'hangul_reading', type:'mcq', max_score:6, concept_ids:['ko.hangul.syllable-block'], prompt:'ㄱ + ㅏ 应组合成哪个音节？', options:['거','고','가','구'], correct_answer:2, explanation:'ㄱ + ㅏ = 가。' },
    { item_id:'ko-gate-07', section_id:'syllable_composition', skill:'hangul_reading', type:'mcq', max_score:6, concept_ids:['ko.hangul.syllable-block'], prompt:'ㄴ + ㅓ 应组合成哪个音节？', options:['나','너','노','누'], correct_answer:1, explanation:'ㄴ + ㅓ = 너。' },
    { item_id:'ko-gate-08', section_id:'syllable_composition', skill:'hangul_reading', type:'mcq', max_score:6, concept_ids:['ko.hangul.syllable-block'], prompt:'ㅂ + ㅜ 应组合成哪个音节？', options:['바','버','보','부'], correct_answer:3, explanation:'ㅂ + ㅜ = 부。' },
    { item_id:'ko-gate-09', section_id:'syllable_composition', skill:'hangul_reading', type:'mcq', max_score:6, concept_ids:['ko.hangul.syllable-block'], prompt:'ㅈ + ㅕ 应组合成哪个音节？', options:['자','저','져','조'], correct_answer:2, explanation:'ㅈ + ㅕ = 져。' },
    { item_id:'ko-gate-10', section_id:'syllable_composition', skill:'hangul_reading', type:'mcq', max_score:6, concept_ids:['ko.hangul.syllable-block'], prompt:'ㅋ + ㅘ 应组合成哪个音节？', options:['카','커','코','콰'], correct_answer:3, explanation:'ㅋ + ㅘ = 콰。' },

    { item_id:'ko-gate-11', section_id:'listening_discrimination', skill:'listening_recognition', type:'audio_mcq', max_score:10, concept_ids:['ko.hangul.syllable-block'], prompt:'点击播放，只根据声音选择你听到的音节。', audio_text:'나', options:['가','나','다','마'], correct_answer:1, explanation:'播放内容是 나。' },
    { item_id:'ko-gate-12', section_id:'listening_discrimination', skill:'listening_recognition', type:'audio_mcq', max_score:10, concept_ids:['ko.hangul.syllable-block'], prompt:'点击播放，只根据声音选择你听到的音节。', audio_text:'커', options:['카','커','코','쿠'], correct_answer:1, explanation:'播放内容是 커。' },
    { item_id:'ko-gate-13', section_id:'typing', skill:'typing', type:'typing', max_score:10, concept_ids:['ko.typing.basic'], prompt:'请切换韩语键盘，不复制粘贴，准确输入：가 나 다', target:'가 나 다', accepted_answers:['가 나 다'], explanation:'目标是确认你已经能完成最基础的韩文输入。' },
  ],
};

const oldSteps = curricula.korean?.steps || [];
if (curricula.korean) {
  const laterSteps = oldSteps.filter(step => {
    const match = /^ko-day-(\d{3})$/.exec(step.id || '');
    if (!match) return step.id !== GATE_LESSON_ID;
    return Number(match[1]) >= 8;
  });
  curricula.korean.steps = [gateLesson, ...laterSteps];
  curricula.korean.title = '韩语｜字母通关后正式学习路线';
  curricula.korean.source = '韩文字母改为站外自学 + Learning Paw 前置通关考核；通过后进入 받침、音变、表达、语法与 TOPIK 基础。';
}

koreanAssessmentStages.splice(0, koreanAssessmentStages.length,
  { id:'hangulGate', assessment_key:'hangulGate', lesson_id:GATE_LESSON_ID, title:'韩文字母通关考核', prerequisite_lessons:[], implemented:true },
  { id:'week2', assessment_key:'week2', lesson_id:'ko-day-014', title:'Day 14｜Week 2 阶段验收', prerequisite_lessons:['ko-day-008','ko-day-009','ko-day-010','ko-day-011','ko-day-012','ko-day-013'], implemented:true },
  { id:'week3', assessment_key:'week3', lesson_id:'ko-day-021', title:'Day 21｜Week 3 阶段验收', prerequisite_lessons:['ko-day-015','ko-day-016','ko-day-017','ko-day-018','ko-day-019','ko-day-020'], implemented:true },
  { id:'month1', assessment_key:'month1', lesson_id:'ko-day-028', title:'Day 28｜Month 1 综合验收', prerequisite_lessons:['ko-day-022','ko-day-023','ko-day-024','ko-day-025','ko-day-026','ko-day-027'], implemented:true },
);

if (domainOverrides.korean) {
  domainOverrides.korean.description = '韩文字母先用 B 站等外部课程自学，通过 Learning Paw 通关考核后，再进入 받침、音变、表达、语法、听说读写与 TOPIK 基础。';
  domainOverrides.korean.modes = [
    { label: '韩文字母前置通关考核', status: '可用' },
    { label: '通过后：正式课程路线', status: '锁定至通过' },
    { label: '主动表达 / 听写 / TTS', status: '通过后解锁' },
    { label: 'ChatGPT Voice 每日任务', status: '通过后解锁' },
  ];
}

lessonContentById[GATE_LESSON_ID] = {
  intro: '这一关不负责“教会你韩文字母”。请先用 B 站或任何你觉得顺手的网课把基础字母学完。Learning Paw 在这里扮演的是验收员：确认你已经具备继续学习韩语所需的最低识读能力，再把后面的课程放出来。',
  sections: [
    { title: '先去站外学什么', bullets: ['基础辅音与元音', '送气音、紧音的基本辨认', '常见复合元音', '辅音 + 元音组成音节块', '最基础的韩语键盘输入'] },
    { title: '什么时候回来考试', bullets: ['看到基础字母时不需要逐个查表', '不依赖罗马音也能慢慢拼读简单音节', '能够区分最基础的元音 / 辅音形状', '愿意接受少量听辨和输入测试'] },
    { title: '通过规则', bullets: ['总分至少 85 / 100', '字母识别至少 80%', '音节组合至少 80%', '不过就按错项回外部课程补强，不需要在平台重复刷字母课'] },
  ],
  checkpoint: '准备好后直接点击“阶段验收 / 韩文字母通关考核”。只有通过这一关，Learning Paw 才会把下一阶段韩语课程作为 Today Plan 的正式学习任务。',
  resources: [],
};

if (typeof window !== 'undefined') {
  window.__KOREAN_HANGUL_GATE_V07__ = {
    version: VERSION,
    lessonId: GATE_LESSON_ID,
    assessmentId: GATE_ASSESSMENT_ID,
    passScore: 85,
  };
}
