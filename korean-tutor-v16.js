import { cards as baseCards } from './cards.js';
import { curricula, domainOverrides, extraCards } from './platform-data.js';
import { buildYonseiTutorGuide } from './korean-yonsei-guide-v17.js';

export const KOREAN_TUTOR_VERSION = '0.16.0';
export const DEFAULT_TUTOR_SETTINGS = Object.freeze({
  volume: '1',
  lesson: '1',
  focus: '',
  previousFocus: '',
});

const clean = value => String(value ?? '').trim();

export function normalizeTutorSettings(value = {}) {
  return {
    volume: clean(value.volume) || DEFAULT_TUTOR_SETTINGS.volume,
    lesson: clean(value.lesson) || DEFAULT_TUTOR_SETTINGS.lesson,
    focus: clean(value.focus),
    previousFocus: clean(value.previousFocus),
  };
}

export function tutorContentId(value = {}) {
  const settings = normalizeTutorSettings(value);
  const safe = part => clean(part).toLowerCase().replace(/[^0-9a-z\u3131-\uD79D]+/gi, '-').replace(/^-+|-+$/g, '') || 'unspecified';
  return `yonsei-${safe(settings.volume)}-${safe(settings.lesson)}`;
}

export function buildTutorPrompt(value = {}) {
  const settings = normalizeTutorSettings(value);
  const guide = buildYonseiTutorGuide(settings);
  const focus = settings.focus || guide?.autoFocus || '当前册 / 课尚未纳入内置官方课程地图。先根据用户提供的教材页码或照片确认范围，不要凭空补写教材内容。';
  const officialTopic = guide
    ? `${guide.book} · 第 ${guide.lesson} 课 ${guide.titleKo}（${guide.titleZh}）`
    : '未匹配到内置官方课程地图';
  const expressions = guide?.expressions?.length
    ? guide.expressions.join(' / ')
    : '根据用户提供的教材页面提取，不自行假定。';
  const practiceTask = guide?.task || '围绕用户给出的教材内容安排理解练习和主动输出。';
  const exitCheck = guide?.exitCheck || '用一个最小输出任务验证今天的内容是否真正掌握。';
  const previous = settings.previousFocus
    ? `上次需要继续关注：${settings.previousFocus}`
    : '如果没有提供上次遗留问题，就从与今天教材内容直接相关的最短热身开始。';

  return `你是我的一对一韩语私教老师。请严格以《延世韩国语》作为课程主线，完成一节约 30 分钟的互动私教课。

【当前教材进度】
- 教材：《延世韩国语》
- 册 / 级：${settings.volume}
- 课：${settings.lesson}
- 官方课程主题：${officialTopic}
- 今天的教材范围 / 重点：${focus}
- 可用于本课输出的基础表达：${expressions}
- 今日主动输出任务：${practiceTask}
- 今日完成标准：${exitCheck}
- ${previous}

【教材使用原则】
- 如果内置官方课程地图已匹配，就直接按上面的官方单元主题和 Learning Paw 今日重点开始，不要反过来要求我先填写“今天学什么”。
- 单元标题与顺序来自延世大学官方课程 / 出版目录；Learning Paw 的中文讲解、任务和练习是为学习重新组织的内容，不是教材原文。
- 如果我上传教材照片、页码或贴出一小段课文，以我提供的实际页面为最高优先级，用来进一步校准语法点和课文位置。
- 不要大段复述、重构或分发受版权保护的教材正文。

【这节课怎么上】
1. 0–5 分钟｜旧课热身：只复习与当前课直接相关的旧知识，用提问让我先开口。
2. 5–12 分钟｜教材学习：围绕当前官方单元主题和今天重点解释必要的语法、表达或理解难点。
3. 12–20 分钟｜理解与受控练习：用辨析、替换、造句、课文理解等方式确认我真的懂了。
4. 20–27 分钟｜主动输出：围绕本课做问答、情景对话、复述或中→韩表达，尽可能让我说，而不是你一直讲。
5. 27–30 分钟｜纠错与复盘：总结最值得修正的问题，并按“今日完成标准”验证是否掌握。

【互动规则】
- 一次只给我一个问题或一个小任务，等我回答后再继续；根据我的实际回答动态调整难度。
- 不要一次性把整节课、答案或长篇讲义全部展示出来。
- 难语法可以先用中文讲清楚，再逐步提高韩语输出比例。
- 纠错时关注语法、助词、时态、语序、发音线索和表达自然度；每轮优先指出最重要的 1–2 个问题，并让我重说。
- 不要因为你“觉得重要”就跳出《延世韩国语》当前进度提前教学；只有为理解本课所必需时才补充。
- 词汇记忆由“墨墨记忆卡”负责。不要给我制作单词卡、FSRS 复习表、墨墨导入内容，也不要把课堂时间变成孤立背单词。
- 不需要每一处小错误都打断我；先保证表达完成，再做最有价值的纠正。

【结束时固定输出】
只在课程结束时给一个简短的“私教复盘”：
1. 今天实际推进到的教材位置；
2. 我今天最典型的 3 个错误或表达问题；
3. 下次课优先回看的 2 个点；
4. 今天的教材目标：已掌握 / 基本掌握 / 需要继续练。
不要附加单词卡清单。

现在直接根据当前官方单元主题和今天重点开始上课，先给我第一个问题。`;
}

function isKoreanCard(card) {
  return card?.domain === 'korean' || card?.deck === '韩语';
}

function stripKoreanCards(collection) {
  const kept = collection.filter(card => !isKoreanCard(card));
  const removed = collection.length - kept.length;
  collection.splice(0, collection.length, ...kept);
  return removed;
}

export function removeLegacyKoreanPractice() {
  return {
    base: stripKoreanCards(baseCards),
    extra: stripKoreanCards(extraCards),
  };
}

const removedCards = removeLegacyKoreanPractice();

curricula.korean = {
  schema_version: '1.0',
  program_id: 'korean-yonsei-private-tutor',
  name: '韩语｜延世韩国语 × AI 私教',
  title: '韩语｜《延世韩国语》教材进度',
  domain: 'korean',
  status: 'active',
  source: '《延世韩国语》为用户自有教材；Learning Paw 内置官方单元导航和原创学习指导，不重新分发教材正文。',
  goal: {
    primary: '按《延世韩国语》持续推进，并把教材知识转化为可理解、可输出的韩语能力',
    milestone: '每天约 30 分钟 AI 私教：旧课热身 → 教材学习 → 理解练习 → 主动输出 → 纠错复盘',
  },
  steps: [],
};

domainOverrides.korean = {
  status: 'active',
  statusLabel: '可学习',
  description: '以《延世韩国语》为唯一课程主线；Learning Paw 自动提供官方单元导航、今日重点、30 分钟 AI 私教任务与学习记录，墨墨记忆卡负责词汇记忆。',
  modes: [
    { label: '《延世韩国语》官方单元导航', status: '可用' },
    { label: '每日 30 分钟 AI 私教', status: '可用' },
    { label: '语法 / 课文 / 听说输出', status: '可用' },
    { label: '阶段复盘与验收', status: '可用' },
  ],
};

if (typeof window !== 'undefined') {
  window.__KOREAN_TUTOR_V16__ = {
    version: KOREAN_TUTOR_VERSION,
    removedCards,
    buildTutorPrompt,
    normalizeTutorSettings,
    tutorContentId,
  };
}
