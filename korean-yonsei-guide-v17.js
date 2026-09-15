export const KOREAN_YONSEI_GUIDE_VERSION = '0.17.0';

export const YONSEI_OFFICIAL_SOURCES = Object.freeze([
  {
    id: 'yonsei-kli-level1',
    label: '延世大学韩国语学堂｜1级课程目标',
    url: 'https://www.yskli.com/course.php?mid=K01_01',
  },
  {
    id: 'yonsei-kli-intensive',
    label: '延世大学韩国语学堂｜1级课程进度',
    url: 'https://www.yskli.com/course.php?mid=K01_04',
  },
  {
    id: 'yonsei-press-level1',
    label: '延世大学出版社｜NEW YONSEI KOREAN 1 官方目录',
    url: 'https://press.yonsei.ac.kr/eng/info/search_detail.asp?bgbn=R&cate1=A1&idx=1875&page=1',
  },
  {
    id: 'yonsei-press-reference',
    label: '延世大学出版社｜教材资料 / 音频入口',
    url: 'https://press.yonsei.ac.kr/refer/refer.asp',
  },
]);

const rawLessons = [
  [1, '1-1', '인사와 소개', '问候与介绍', '完成第一次见面时的基础问候和自我介绍。', '问候 → 说姓名 / 身份 / 国籍 → 听懂对方的简短介绍。', ['안녕하세요', '저는 ___예요/이에요', '저는 ___ 사람이에요', '만나서 반갑습니다'], '和 AI 做一次“第一次见面”的 4–6 轮对话，至少完成问候、姓名和身份/国籍介绍。'],
  [2, '1-1', '물건', '物品', '能识别身边常见物品，并进行最基础的“这是什么”问答。', '物品名称 → 指认 → 是什么 / 是不是 → 简短回答。', ['이것', '그것', '무엇', '___예요/이에요'], '让 AI 连续展示 5 个日常物品情境，你用韩语完成识别和问答。'],
  [3, '1-1', '학교', '学校', '能围绕学校中的地点、人物和基础活动进行简单表达。', '学校场景 → 地点 / 存在 → 基础位置和学习活动表达。', ['학교', '교실', '학생', '있어요 / 없어요'], '用 3–5 句介绍“我的学校 / 教室里有什么”，再回答 AI 的追问。'],
  [4, '1-1', '친구', '朋友', '能用非常基础的句子介绍朋友并交换个人信息。', '人物关系 → 姓名 / 身份 → 简单特征与共同活动。', ['친구', '이름', '같이', '좋아해요'], '向 AI 介绍一位朋友，并回答至少 3 个关于这位朋友的问题。'],
  [5, '1-1', '고향', '故乡', '能说明自己来自哪里，并围绕家乡做简短交流。', '国家 / 城市 → 来自哪里 → 家乡的基础描述。', ['고향', '나라', '도시', '에서 왔어요'], '用韩语说出自己的国家和城市，并完成 4 轮“你来自哪里”的互问互答。'],
  [6, '1-1', '학교생활', '学校生活', '能描述非常基础的学校日常与学习安排。', '课程 / 时间 → 学习活动 → 简短日常安排。', ['수업', '공부해요', '가요', '와요'], '用时间顺序说 3–5 句“我的学校一天”，AI 负责追问并纠错。'],
  [7, '1-1', '음식', '食物', '能表达基础饮食偏好并完成简单点餐。', '食物名称 → 喜欢 / 不喜欢 → 想吃 / 点餐。', ['음식', '좋아해요', '먹어요', '주세요'], '完成一次咖啡店或餐厅点单角色扮演，至少点 2 样东西。'],
  [8, '1-1', '하루 생활', '一天生活', '能按时间顺序描述自己的基础日常。', '时间 → 起床 / 学习 / 吃饭 / 休息 → 一天顺序。', ['아침', '점심', '저녁', '일어나요'], '用 5 句左右描述“我的一天”，AI 只在表达完成后集中纠正。'],
  [9, '1-1', '주말', '周末', '能谈论周末常做的事情和简单计划。', '周末活动 → 去哪里 / 做什么 → 简单计划表达。', ['주말', '가요', '만나요', '쉬어요'], '和 AI 讨论“这个周末做什么”，完成至少 5 轮来回。'],
  [10, '1-1', '지난 일', '过去的事情', '能用初级方式谈论已经发生的日常事件。', '过去时间 → 做了什么 → 去了哪里 → 简单感受。', ['어제', '갔어요', '먹었어요', '했어요'], '用 4–6 句讲昨天发生的事情，并接受 AI 的时态纠错。'],
  [11, '1-2', '약속', '约定', '能进行最基础的约时间、约地点与确认。', '邀请 → 时间 → 地点 → 接受 / 调整。', ['약속', '언제', '어디', '만나요'], '和 AI 完成一次约见面的对话，至少包含时间和地点。'],
  [12, '1-2', '가족', '家人', '能介绍家庭成员与最基础的家庭信息。', '家庭成员 → 人数 / 关系 → 简单介绍。', ['가족', '부모님', '형제', '있어요'], '用 4–5 句介绍家庭，并回答 AI 的 3 个追问。'],
  [13, '1-2', '쇼핑', '购物', '能询问价格、数量，并完成基础购买对话。', '商品 → 价格 → 数量 → 购买。', ['얼마예요', '주세요', '하나', '두 개'], '完成一次商店购物角色扮演，至少询价并购买 2 件商品。'],
  [14, '1-2', '생일', '生日', '能谈论生日、日期与简单庆祝活动。', '日期 → 生日 → 祝贺 → 活动。', ['생일', '언제예요', '축하해요', '선물'], '告诉 AI 你的生日并设计一个简单生日计划。'],
  [15, '1-2', '전화', '电话', '能完成非常基础的电话开场、找人和留言。', '接电话 → 找人 → 不在 / 留言 → 结束。', ['여보세요', '계세요', '전화', '메시지'], '和 AI 做一次 6 轮左右的电话角色扮演。'],
  [16, '1-2', '교통', '交通', '能谈论常见交通方式与简单出行。', '去哪里 → 坐什么 → 多久 / 怎么去。', ['버스', '지하철', '타요', '가요'], '告诉 AI 从住处到一个目的地怎么去，并回答路线追问。'],
  [17, '1-2', '길 찾기', '找路', '能听懂和表达最基础的方向与位置。', '问路 → 方位 → 直走 / 左右 → 到达。', ['어디예요', '왼쪽', '오른쪽', '쭉'], '完成一次游客问路角色扮演，AI 随机改变目的地。'],
  [18, '1-2', '날씨와 계절', '天气与季节', '能描述基础天气、季节和相关活动。', '天气 → 季节 → 喜欢 / 穿什么 / 做什么。', ['날씨', '봄', '여름', '추워요 / 더워요'], '比较两个季节，并说出你更喜欢哪一个以及原因。'],
  [19, '1-2', '여행', '旅行', '能围绕目的地、交通、住宿和活动做基础旅行交流。', '去哪里 → 怎么去 → 住哪里 → 做什么。', ['여행', '호텔', '사진', '가고 싶어요'], '和 AI 一起制定一个 1 天旅行计划，并用韩语做核心决定。'],
  [20, '1-2', '방학과 휴일', '假期与休息日', '能谈论假期计划与已经做过的简单活动。', '假期 → 计划 → 活动 → 回顾。', ['방학', '휴일', '계획', '쉬어요'], '用 5 句左右说明下一次假期计划，再回答 AI 的追问。'],
];

export const YONSEI_LEVEL1_LESSONS = Object.freeze(rawLessons.map(([lesson, book, titleKo, titleZh, objective, focus, expressions, task]) => Object.freeze({
  level: 1,
  lesson,
  book,
  titleKo,
  titleZh,
  objective,
  focus,
  expressions: Object.freeze(expressions),
  task,
  exitCheck: `不看提示，围绕“${titleZh}”完成 30–60 秒连续表达或 4–6 轮对话；如果核心信息表达不出来，下次继续本课。`,
})));

function normalizedLessonNumber(value) {
  const number = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(number) ? number : null;
}

export function resolveYonseiLesson(value = {}) {
  const volume = String(value.volume ?? '1').trim();
  const lessonNumber = normalizedLessonNumber(value.lesson);
  if (!lessonNumber) return null;

  // The current built-in map follows Yonsei KLI's present Level 1 / New Yonsei Korean sequence.
  // Accept either the user's simple "1" level value or the physical book labels 1-1 / 1-2.
  if (!['1', '1-1', '1-2'].includes(volume)) return null;
  const lesson = YONSEI_LEVEL1_LESSONS.find(item => item.lesson === lessonNumber) || null;
  if (!lesson) return null;
  if (volume === '1-1' && lesson.lesson > 10) return null;
  if (volume === '1-2' && lesson.lesson <= 10) return null;
  return lesson;
}

export function buildYonseiAutoFocus(value = {}) {
  const lesson = resolveYonseiLesson(value);
  if (!lesson) return '';
  return `官方单元主题：${lesson.titleKo}（${lesson.titleZh}）；今日学习目标：${lesson.objective}；30 分钟重点：${lesson.focus}`;
}

export function buildYonseiTutorGuide(value = {}) {
  const lesson = resolveYonseiLesson(value);
  if (!lesson) return null;
  return {
    ...lesson,
    autoFocus: buildYonseiAutoFocus(value),
    sourceNote: '单元标题与顺序来自延世大学官方课程 / 出版目录；Learning Paw 的中文讲解、任务和练习为重新组织的学习指导，不复制教材正文。',
    sources: YONSEI_OFFICIAL_SOURCES,
  };
}

if (typeof window !== 'undefined') {
  window.__KOREAN_YONSEI_GUIDE_V17__ = {
    version: KOREAN_YONSEI_GUIDE_VERSION,
    lessons: YONSEI_LEVEL1_LESSONS,
    sources: YONSEI_OFFICIAL_SOURCES,
    resolve: resolveYonseiLesson,
    buildFocus: buildYonseiAutoFocus,
    buildGuide: buildYonseiTutorGuide,
  };
}
