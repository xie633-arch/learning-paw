import { cards as baseCards } from './cards.js';
import { curricula, domainOverrides, extraCards, tests } from './platform-data.js';

export const SCHEMA_VERSIONS = {
  content: '1.0',
  curriculum: '1.0',
  studyEvent: '1.0',
  assessment: '1.0',
};

const publicOwnSource = {
  kind: 'self-authored',
  name: 'Personal Learning OS',
  url: null,
};

const newCards = [
  {
    id: 'phone-system-001',
    concept_id: 'phone.system.system-thinking',
    domain: 'phone',
    deck: '手机产品专家',
    category: '系统串联',
    type: 'scenario_recall',
    skill: 'system-linking',
    level: 2,
    question: '用户说“这台手机芯片很强，所以一定不会卡”，你会怎样拆解这个判断？',
    answer: '不能把整机流畅只归因于芯片。应同时看 SoC 性能与能效、内存与存储、散热、系统调度、应用适配、后台管理和长期持续性能。零售表达要把“单点参数”升级成“整机系统体验”。',
    source: publicOwnSource,
    license: 'CC-BY-4.0-self-authored',
  },
  {
    id: 'phone-scenario-001',
    concept_id: 'phone.retail.need-to-demo',
    domain: 'phone',
    deck: '手机产品专家',
    category: '场景分析',
    type: 'scenario_recall',
    skill: 'retail-demo',
    level: 3,
    question: '一位经常出差的商务用户只说“我要信号稳、续航好、别耽误事”。产品专家下一步最应该做什么？',
    answer: '先把抽象诉求继续拆成场景：高铁/地库/电梯弱网、跨城移动、长时间会议、导航、热点、临时补电等，再选择通信、续航、快充、可靠性与生态能力做有针对性的 Demo，而不是先背参数。',
    source: publicOwnSource,
    license: 'CC-BY-4.0-self-authored',
  },
  {
    id: 'phone-competition-001',
    concept_id: 'phone.competition.price-rights',
    domain: 'phone',
    deck: '手机产品专家',
    category: '竞品判断',
    type: 'scenario_recall',
    skill: 'competitive-intelligence',
    level: 3,
    question: '竞品官方价没有变化，但门店突然更难卖了。为什么仍然需要重新做竞对分析？',
    answer: '真实竞争条件可能已经变化，例如平台券、国补、以旧换新、赠品、金融分期、渠道返利、库存结构、门店主推和新品节奏。竞对分析要看真实到手价与零售承接，而不是只盯官方 MSRP。',
    source: publicOwnSource,
    license: 'CC-BY-4.0-self-authored',
  },
  {
    id: 'retail-spatial-001',
    concept_id: 'retail.spatial.traffic-source',
    domain: 'retail',
    deck: '商圈与零售',
    category: '商圈空间',
    type: 'visual_reasoning',
    skill: 'spatial-analysis',
    level: 2,
    image: './assets/retail-spatial-case-01.svg',
    question: '观察这张虚拟商圈图：目标门店最值得优先验证的三类客流来源是什么？',
    answer: '优先验证地铁换乘客流、购物中心目的性消费客流、办公区工作日客流；同时把住宅社区作为晚间/周末补充来源。答案不是“图上谁离得近谁最重要”，还要继续验证时段、动线、停留目的和可达性。',
    source: publicOwnSource,
    license: 'CC-BY-4.0-self-authored',
  },
  {
    id: 'retail-spatial-002',
    concept_id: 'retail.spatial.competitor-anchor',
    domain: 'retail',
    deck: '商圈与零售',
    category: '商圈空间',
    type: 'visual_reasoning',
    skill: 'spatial-analysis',
    level: 3,
    image: './assets/retail-spatial-case-01.svg',
    question: '图中竞品店位于商场主入口附近。对目标门店而言，最值得研究的不是“距离多少米”，而是什么？',
    answer: '要研究竞品是否截流主入口客流、消费者在两店之间的比较顺序、竞品是否成为商圈锚点、目标店入口可见性以及从地铁/主入口到店的真实动线。空间位置必须与消费者旅程一起分析。',
    source: publicOwnSource,
    license: 'CC-BY-4.0-self-authored',
  },
  {
    id: 'retail-case-013',
    concept_id: 'retail.ops.conversion-diagnosis',
    domain: 'retail',
    deck: '商圈与零售',
    category: '经营诊断',
    type: 'scenario_recall',
    skill: 'diagnosis',
    level: 3,
    question: '某店周末客流同比上涨 20%，销量却没有增长。第一轮诊断应该如何展开？',
    answer: '先拆有效进店、接待率、体验率、需求结构、转化率、客单、库存可售率、主推产品竞争力和价格权益，再比较客流结构是否发生变化。不能把“客流上涨”直接等同于“可转化购买客流上涨”。',
    source: publicOwnSource,
    license: 'CC-BY-4.0-self-authored',
  },
  {
    id: 'industry-evidence-001',
    concept_id: 'industry.evidence.china-q2-2026',
    domain: 'industry',
    deck: '行业与商业',
    category: '真实市场数据',
    type: 'evidence_reasoning',
    skill: 'market-intelligence',
    level: 2,
    question: 'IDC 2026 Q2 中国智能手机初步数据显示：市场约 6600 万台、同比下降 4.3%，华为份额 22.6%、苹果 18.1%。从这组数字可以先得到什么、不能直接得到什么？',
    answer: '可以先确认市场总体承压、头部品牌结构和同比方向；不能仅凭份额推导利润、sell-out、渠道库存或长期业务质量。还要继续看 ASP、利润、库存、sell-in/sell-out、价格权益与产品组合。来源：IDC Quarterly Mobile Phone Tracker，2026-07-14（初步数据）。',
    source: {
      kind: 'public-research',
      name: 'IDC Quarterly Mobile Phone Tracker',
      url: 'https://www.idc.com/resource-center/blog/china-smartphone-market-decline-q2-2026/',
      as_of: '2026-07-14',
    },
    license: 'facts-paraphrased-with-source-link',
  },
  {
    id: 'industry-evidence-002',
    concept_id: 'industry.evidence.methodology-difference',
    domain: 'industry',
    deck: '行业与商业',
    category: '证据判断',
    type: 'evidence_reasoning',
    skill: 'source-evaluation',
    level: 3,
    question: 'Counterpoint 对 2026 Q2 中国智能手机出货给出约同比 -2%，IDC 初步数据为 -4.3%。遇到这种差异，分析师应该怎么做？',
    answer: '不要挑一个更符合自己观点的数字。先核对统计口径、覆盖范围、sell-in/sell-out、发布时间、初步/最终版本和四舍五入，再把差异本身作为证据不确定性呈现。来源：Counterpoint 2026-07-20；IDC 2026-07-14。',
    source: {
      kind: 'public-research',
      name: 'Counterpoint + IDC',
      url: 'https://counterpointresearch.com/en/insights/china-smartphone-shipments-slip-2-percent-yoy-in-q2-2026',
      as_of: '2026-07-20',
    },
    license: 'facts-paraphrased-with-source-link',
  },
  {
    id: 'industry-evidence-003',
    concept_id: 'industry.evidence.revenue-vs-volume',
    domain: 'industry',
    deck: '行业与商业',
    category: '真实市场数据',
    type: 'evidence_reasoning',
    skill: 'business-interpretation',
    level: 3,
    question: 'Counterpoint 显示 2026 Q2 全球智能手机出货量同比下降，但行业收入同比增长、ASP 上升。这个组合最值得训练什么判断？',
    answer: '要把“量”和“价值”分开看。出货下降并不必然意味着收入下降，价格上涨与高端产品占比提升可能推动收入和 ASP。进一步要判断增长来自真实高端化、成本推动涨价，还是结构变化。来源：Counterpoint，2026-07-31。',
    source: {
      kind: 'public-research',
      name: 'Counterpoint Global Smartphone Revenue Q2 2026',
      url: 'https://counterpointresearch.com/en/insights/global-smartphone-revenue-up-7-percent-q2-2026-despite-shipment-slump',
      as_of: '2026-07-31',
    },
    license: 'facts-paraphrased-with-source-link',
  },
  {
    id: 'industry-evidence-004',
    concept_id: 'industry.evidence.concentration',
    domain: 'industry',
    deck: '行业与商业',
    category: '市场结构',
    type: 'evidence_reasoning',
    skill: 'market-structure',
    level: 3,
    question: 'IDC Q2 2026 中国市场前六家厂商合计份额约 96%。这一高集中度最合理的业务含义是什么？',
    answer: '它说明市场竞争高度集中，小品牌获得规模、渠道资源和用户心智的难度更高。但高集中度本身不能证明竞争减弱，头部之间仍可能发生激烈的价格、产品、渠道和生态竞争。来源：IDC，2026-07-14。',
    source: {
      kind: 'public-research',
      name: 'IDC China Smartphone Q2 2026',
      url: 'https://www.idc.com/resource-center/blog/china-smartphone-market-decline-q2-2026/',
      as_of: '2026-07-14',
    },
    license: 'facts-paraphrased-with-source-link',
  },
];

const addUniqueCards = () => {
  const existing = new Set([...baseCards, ...extraCards].map(card => card.id));
  newCards.forEach(card => {
    if (!existing.has(card.id)) {
      extraCards.push(card);
      existing.add(card.id);
    }
  });
};

const normalizeContent = () => {
  [...baseCards, ...extraCards].forEach(card => {
    card.schema_version ||= SCHEMA_VERSIONS.content;
    card.concept_id ||= `legacy.${card.domain || 'general'}.${card.id}`;
    card.type ||= card.image ? 'visual_recall' : card.audioText ? 'listening' : 'active_recall';
    card.skill ||= card.category || 'general';
    card.level ||= 1;
    card.source ||= publicOwnSource;
    card.license ||= 'self-authored-or-legacy';
  });
};

const normalizeCurricula = () => {
  Object.values(curricula).forEach(curriculum => {
    curriculum.schema_version ||= SCHEMA_VERSIONS.curriculum;
    (curriculum.steps || []).forEach((step, index) => {
      step.schema_version ||= SCHEMA_VERSIONS.curriculum;
      step.order ||= index + 1;
      step.objective ||= step.summary;
      step.prerequisite ||= index === 0 ? [] : [curriculum.steps[index - 1].id];
    });
  });
};

const advancedTests = {
  phone: {
    schema_version: SCHEMA_VERSIONS.assessment,
    title: '手机产品专家｜100 分综合验收',
    description: '10 题 × 10 分，不再只考参数记忆；覆盖系统串联、用户场景、竞品、零售 GTM 与经营诊断。',
    questions: [
      { skill: 'system-linking', difficulty: 2, q: '用户说“芯片强就一定长期流畅”，最完整的回应是？', options: ['对，只看芯片即可', '还要看散热、系统调度、内存存储、应用适配和持续性能', '只需要看电池容量', '只需要看屏幕刷新率'], answer: 1, explanation: '整机体验是多个子系统共同作用的结果。' },
      { skill: 'display', difficulty: 1, q: 'LTPO 的核心用户价值更接近？', options: ['只提高分辨率', '让刷新率灵活动态变化，在流畅与功耗之间平衡', '一定让屏幕更亮', '只提升触控速度'], answer: 1, explanation: 'LTPO 重点是动态刷新率能力。' },
      { skill: 'scenario', difficulty: 3, q: '经常高铁出差的商务用户强调“别断网、别没电”。下一步最合理？', options: ['直接背完整参数表', '继续拆弱网、移动切换、热点、导航、补电等具体场景，再做针对性 Demo', '只推荐最高价机型', '只比较相机像素'], answer: 1, explanation: '先把需求落到真实任务，再连接通信、续航、快充和可靠性能力。' },
      { skill: 'camera', difficulty: 2, q: '为什么长焦的零售价值不能只说“拍得远”？', options: ['因为长焦与构图无关', '长焦还影响构图与透视，覆盖人像、舞台、建筑、细节等场景', '因为数字变焦永远更好', '因为长焦只用于夜景'], answer: 1, explanation: '参数要翻译成用户可感知的场景价值。' },
      { skill: 'competitive-intelligence', difficulty: 3, q: '竞品官方价没变，但门店竞争突然加剧，第一步应补查什么？', options: ['只查处理器', '真实到手价、补贴、赠品、金融、渠道主推与库存', '只查广告口号', '只看微博热搜'], answer: 1, explanation: '真实交易条件可能已变化。' },
      { skill: 'retail-demo', difficulty: 3, q: '一个 60 秒零售 Demo 最重要的设计原则是？', options: ['尽可能展示全部功能', '围绕目标用户任务，让差异短、可感知、可比较', '只讲技术名词', '只展示参数页面'], answer: 1, explanation: 'Demo 服务理解和转化，不服务功能数量。' },
      { skill: 'gtm', difficulty: 2, q: 'Who → Why → What → How → Where → When → Measure 中，Measure 的作用是？', options: ['定义目标用户', '定义传播口号', '定义成功指标与验证方法', '定义产品颜色'], answer: 2, explanation: 'Measure 负责把上市目标变成可衡量结果。' },
      { skill: 'diagnosis', difficulty: 3, q: '某机型销量下滑，最不应该直接做的是？', options: ['拆客流、转化、库存和价格权益', '比较竞争动作', '直接归因“导购不行”并结束分析', '形成可验证假设'], answer: 2, explanation: '单一归因会掩盖产品、价格、库存、竞争和渠道等变量。' },
      { skill: 'ecosystem', difficulty: 2, q: '生态为什么可能影响下一次换机？', options: ['因为设备越多越好', '协同与数据连续性提高便利，同时形成迁移成本', '因为所有 App 都只能在一个品牌运行', '因为生态与复购无关'], answer: 1, explanation: '生态价值来自持续体验与迁移成本，而不是设备数量本身。' },
      { skill: 'product-strategy', difficulty: 3, q: '为什么品牌通常不会只做一款“全能旗舰”？', options: ['因为旗舰不需要用户', '不同价格带、人群和业务角色需要不同产品线共同覆盖', '因为产品越多一定越赚钱', '只是为了增加 SKU'], answer: 1, explanation: '产品组合承担用户覆盖、规模、高端心智与创新等不同任务。' },
    ],
  },
  retail: {
    schema_version: SCHEMA_VERSIONS.assessment,
    title: '商圈与零售｜100 分综合验收',
    description: '10 题 × 10 分，加入商圈空间、经营诊断、O2O、活动与用户经营场景。',
    questions: [
      { skill: 'need-state', difficulty: 2, q: '两个同龄白领走进同一家店，一个换碎屏手机、一个准备出国。最能说明什么？', options: ['年龄可以完全解释需求', 'Need State 比单纯人口属性更接近当下购买任务', '职业决定唯一产品', '两人一定买同一款'], answer: 1, explanation: '相同人口属性可能处于完全不同的需求状态。' },
      { skill: 'spatial-analysis', difficulty: 3, q: '商场主入口旁有强势竞品店，目标店在同层更深处。最值得先验证？', options: ['两店直线距离', '主入口客流是否被截流、比较顺序和真实动线', '店员年龄', '商场背景音乐'], answer: 1, explanation: '空间判断要与消费者旅程和锚点效应结合。' },
      { skill: 'traffic-quality', difficulty: 3, q: '周末客流上涨 20%，销量不涨，第一轮诊断最合理？', options: ['马上增加广告', '拆有效进店、接待、体验、转化、库存和客流结构', '直接判断导购能力下降', '只看总客流'], answer: 1, explanation: '总客流并不等于可转化客流。' },
      { skill: 'display', difficulty: 2, q: '陈列为什么不能理解为“把产品摆整齐”？', options: ['因为陈列只服务拍照', '它要降低发现、理解和体验产品价值的成本', '陈列与经营无关', '只要产品多就行'], answer: 1, explanation: '陈列本质是可见性、理解和转化设计。' },
      { skill: 'demo', difficulty: 2, q: '好的 Demo 最不应该？', options: ['让消费者上手', '围绕真实场景', '一次塞入所有功能', '让前后差异可感知'], answer: 2, explanation: '功能堆砌会增加认知负担。' },
      { skill: 'o2o', difficulty: 3, q: 'O2O 手机订单“送达”后仍可能体验失败，最典型原因？', options: ['包装颜色不够漂亮', '激活、验机、贴膜、迁移或售后承接断层', '骑手没有介绍芯片', '用户没有逛店'], answer: 1, explanation: '复杂耐用品的履约包含服务接力。' },
      { skill: 'campaign', difficulty: 3, q: '做节促活动时，最先定义什么？', options: ['礼品数量', '经营目标和目标人群', '海报颜色', '主持人口播'], answer: 1, explanation: '活动设计必须先服务明确经营目标。' },
      { skill: 'inventory', difficulty: 2, q: '系统显示“有库存”但仍无法形成销售，可能因为？', options: ['库存永远等于可售', 'SKU/颜色/容量错配、未上架、未展示或线上未同步', '库存与销售无关', '只可能是客流问题'], answer: 1, explanation: '要看可售库存和结构，而不只是总量。' },
      { skill: 'user-ops', difficulty: 2, q: '成交为什么不是用户经营终点？', options: ['因为还要一直发广告', '服务、复购、连带和转介绍影响长期价值', '因为成交不重要', '只为了增加会员数'], answer: 1, explanation: '用户生命周期价值跨越单次交易。' },
      { skill: 'review', difficulty: 3, q: '“销量下降是因为导购能力不足”在没有更多证据时属于？', options: ['事实', '已证实结论', '待验证假设', '行业标准'], answer: 2, explanation: '归因必须与事实和验证方法分开。' },
    ],
  },
  industry: {
    schema_version: SCHEMA_VERSIONS.assessment,
    title: '行业与商业｜100 分证据验收',
    description: '10 题 × 10 分，把真实 2026 Q2 市场证据与商业判断结合，训练“数据 → 结论”的边界。',
    questions: [
      { skill: 'market-evidence', difficulty: 2, q: 'IDC 初步数据显示 2026 Q2 中国智能手机市场同比下降、华为份额领先。仅凭这组份额最不能直接判断什么？', options: ['市场整体承压', '品牌相对份额位置', '品牌利润与渠道库存一定改善', '头部厂商集中度较高'], answer: 2, explanation: '份额不能直接推出利润、库存和 sell-out 质量。来源：IDC 2026-07-14。' },
      { skill: 'source-evaluation', difficulty: 3, q: 'IDC 与 Counterpoint 对同一季度中国市场同比降幅不同，最专业的处理是？', options: ['选更支持自己观点的数字', '先核对统计口径、初步/最终、sell-in/out 与方法，再呈现差异', '取两者平均就是真实值', '忽略其中一家'], answer: 1, explanation: '来源差异本身属于分析中的不确定性。' },
      { skill: 'sell-in-out', difficulty: 2, q: 'sell-in 明显强于 sell-out 最值得警惕什么？', options: ['渠道库存可能累积', '消费者一定更喜欢产品', 'ASP 一定上升', '品牌份额一定稳定'], answer: 0, explanation: '渠道进货快于消费者购买可能形成库存压力。' },
      { skill: 'value-vs-volume', difficulty: 3, q: '行业出货下降但收入和 ASP 上升，最合理的初步解释？', options: ['数据一定错误', '价格上涨或高端产品占比提升可能推动价值增长', '销量下降一定导致收入下降', 'ASP 与产品结构无关'], answer: 1, explanation: '量与价值需要拆开分析。Counterpoint 2026 Q2 全球数据呈现这一组合。' },
      { skill: 'concentration', difficulty: 3, q: '前六品牌合计份额约 96% 更接近说明？', options: ['市场没有竞争', '市场高度集中，小品牌规模与渠道获取更难，但头部竞争仍可能激烈', '所有品牌利润都很高', '消费者没有选择'], answer: 1, explanation: '集中度描述结构，不代表竞争强度自动下降。' },
      { skill: 'pricing', difficulty: 2, q: '官方价不变但真实到手价下降，可能来自？', options: ['补贴、券、以旧换新、赠品或金融权益', '只有芯片变化', '只可能是库存为零', '品牌定位自动改变'], answer: 0, explanation: '真实交易价格由完整权益组合决定。' },
      { skill: 'portfolio', difficulty: 2, q: '产品组合出现“自我蚕食”最典型的是？', options: ['竞品销量增长', '同品牌相近产品互相抢销量但未创造足够新增价值', '用户换机周期缩短', '渠道覆盖增加'], answer: 1, explanation: '内部重叠会损害组合效率。' },
      { skill: 'channel', difficulty: 2, q: '直营与经销并存的核心原因？', options: ['直营没有成本', '控制体验与快速覆盖之间存在取舍', '经销一定更高端', '两者完全相同'], answer: 1, explanation: '渠道组合是在控制力、效率与覆盖之间权衡。' },
      { skill: 'evidence', difficulty: 3, q: '一条新闻写“某品牌增长 20%，说明策略成功”。最先补什么？', options: ['更多形容词', '统计口径、基期、份额/ASP/利润/库存及替代解释', '品牌口号', '产品颜色'], answer: 1, explanation: '增长数字需要基期、口径和业务质量证据。' },
      { skill: 'scenario', difficulty: 3, q: '情景分析最重要的目的是什么？', options: ['预测唯一正确答案', '围绕关键不确定性准备多个可能未来与对应动作', '替代所有数据', '只写最乐观结果'], answer: 1, explanation: '情景分析是为不确定性做准备，而不是伪装成精确预测。' },
    ],
  },
};

const applyTests = () => {
  Object.entries(advancedTests).forEach(([domainId, test]) => {
    tests[domainId] = test;
  });
};

const applyDomainModes = () => {
  domainOverrides.phone ||= {};
  domainOverrides.retail ||= {};
  domainOverrides.industry ||= {};
  domainOverrides.phone.modes = [
    { label: '主动回忆 / 系统串联', status: '可用' },
    { label: '场景 / GTM / 竞品', status: '可用' },
    { label: '综合 100 分验收', status: '可用' },
  ];
  domainOverrides.retail.modes = [
    { label: '商圈空间 / 经营诊断', status: '可用' },
    { label: '门店 / O2O / 用户经营', status: '可用' },
    { label: '综合 100 分验收', status: '可用' },
  ];
  domainOverrides.industry.modes = [
    { label: '真实市场证据', status: '可用' },
    { label: '商业判断 / 竞争情报', status: '可用' },
    { label: '证据型 100 分验收', status: '可用' },
  ];
};

const fixSummaryWording = () => {
  const node = document.querySelector('#summaryMessage');
  if (!node) return;
  const rewrite = () => {
    if (node.textContent.includes('本轮独立掌握率')) {
      node.textContent = node.textContent.replace('本轮独立掌握率', '本轮自评熟练率');
    }
  };
  new MutationObserver(rewrite).observe(node, { childList: true, characterData: true, subtree: true });
  rewrite();
};

addUniqueCards();
normalizeContent();
normalizeCurricula();
applyTests();
applyDomainModes();
fixSummaryWording();

window.__LEARNING_OS_SCHEMA__ = {
  versions: SCHEMA_VERSIONS,
  contentCount: baseCards.length + extraCards.length,
  release: '0.4.0',
};
