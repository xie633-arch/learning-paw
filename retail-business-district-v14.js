import { curricula, extraCards, domainOverrides } from './platform-data.js';
import { lessonContentById } from './lesson-content-v05.js';

const VERSION = '0.14.0';
const retail = curricula.retail;

const battleSteps = [
  {
    id: 'retail-district-map',
    title: '04｜商圈地图：边界、锚点与流量来源',
    summary: '先把商圈画成一张可经营的地图：消费者从哪里来、为什么来、经过哪里、被什么节点截流。',
    keyPoints: ['商圈边界不是行政边界', '核心 / 次级 / 辐射圈', '交通、Mall、办公、学校、社区、景区等锚点', '时段化客流'],
    task: '选择一个真实商圈，画出 3 层辐射圈、主要锚点和至少 4 类客流来源，并标注工作日 / 周末差异。',
    output: '商圈作战底图',
  },
  {
    id: 'retail-district-userflow',
    title: '05｜用户时空：谁在什么时候为什么出现',
    summary: '把“人很多”拆成不同用户、不同任务与不同时间窗口，找到真正值得经营的流量。',
    keyPoints: ['用户 × 情境 × Need State', '使用者 / 付款者 / 决策者', '购买事件与候选集', '高价值时段与低价值流量'],
    task: '为同一商圈写出工作日午间、下班后、周末三种用户结构，并分别判断最可能的换机任务。',
    output: '商圈用户时空表',
  },
  {
    id: 'retail-district-position',
    title: '06｜阵地网络：门店分层与角色配置',
    summary: '商圈作战不是平均经营每家店，而是识别旗舰阵地、主力阵地、机会阵地、服务阵地与线上履约节点。',
    keyPoints: ['阵地分层', '不同店型承担不同任务', '品牌店 / 综合渠道 / 运营商 / 服务中心 / O2O节点', '资源不平均分配'],
    task: '给一个商圈中的 5 个假想阵地分配角色，并解释每个阵地最应该承担认知、体验、成交、服务还是履约。',
    output: '阵地角色矩阵',
  },
  {
    id: 'retail-district-competition',
    title: '07｜竞争战场：预算、竞品、权益与导购',
    summary: '真正的竞争发生在同一用户、同一预算和同一时刻的候选集中，要看真实成交条件而不只是参数。',
    keyPoints: ['价格带与候选集', '挂牌价 ≠ 真实交易条件', '竞品陈列 / Demo / 权益 / 导购推荐', '竞争情报节点'],
    task: '任选一个价格带，写出“用户任务—候选品牌—真实权益—首推理由—关键 Demo—主要异议”。',
    output: '商圈竞争 Battlecard',
  },
  {
    id: 'retail-district-partner',
    title: '08｜伙伴网络：把区域资源变成用户触点',
    summary: '学校、社区、企业、商业体、运营商、渠道伙伴与服务节点都可能成为长期用户经营阵地，而不是一次活动场地。',
    keyPoints: ['伙伴价值交换', '资源 / 用户 / 场景匹配', '活动之后仍有承接', '线索与用户资产沉淀'],
    task: '选择学校、企业、社区、商业体中的两类伙伴，分别设计双方价值、用户场景、行动入口和后续承接。',
    output: '伙伴资源网络图',
  },
  {
    id: 'retail-district-plan',
    title: '09｜作战设计：目标 × 商圈 × 阵地 × 伙伴',
    summary: '把地图、用户、阵地、竞争与伙伴收敛成有目标、有资源、有节奏、有责任人的区域作战方案。',
    keyPoints: ['Business Objective', 'Where to Play', 'How to Win', '资源与责任', '周 / 月节奏'],
    task: '围绕一个明确经营目标，写出目标用户、重点阵地、核心动作、伙伴、权益、Demo、人员、时间和 KPI。',
    output: '商圈作战一页纸',
  },
  {
    id: 'retail-district-storeplan',
    title: '10｜一店一策：把区域策略落到单店动作',
    summary: '同一商圈内不同门店的客流、竞争、团队与库存不同，区域策略必须转译为门店级的优先动作。',
    keyPoints: ['门店目标', '主攻用户 / 价格带', '主推产品与体验', '人员与权益', '库存与 O2O', '验证指标'],
    task: '给同一商圈的“品牌旗舰店”和“综合渠道专区”各写一份不同的一店一策，并解释为什么不能复制同一模板。',
    output: '一店一策 Action Card',
  },
  {
    id: 'retail-district-warroom',
    title: '11｜战情室：数据看板、会诊与战后复盘',
    summary: '商圈作战最终要形成可验证的经营循环：看事实、找差距、形成假设、下动作、再验证。',
    keyPoints: ['流量 → 体验 → 成交 → 服务漏斗', 'Sell-out / ASP / 结构 / 库存 / O2O', '事实 / 判断 / 假设', '复盘后改变下一轮资源配置'],
    task: '针对“重点商圈销量下滑”提出至少 5 个不同层级假设，为每个假设指定证据、指标与下一步动作。',
    output: '商圈战情看板 + 会诊表',
  },
];

if (retail) {
  retail.title = '零售 GTM｜基础经营 + 商圈作战专题';
  retail.source = '通用零售方法 + 已沉淀的“目标 × 商圈 × 阵地 × 伙伴”商圈作战框架；公开部署版不包含私人经营数据。';
  const baseSpace = retail.steps?.find(step => step.id === 'retail-space');
  if (baseSpace) {
    Object.assign(baseSpace, {
      title: '03｜商圈作战总览：从门店周边到区域经营',
      summary: '商圈不是门店周边几百米，也不是一次外拓活动，而是区域内用户、阵地、伙伴与转化链路的持续经营系统。',
      keyPoints: ['目标 × 商圈 × 阵地 × 伙伴', '区域用户资源', '阵地网络', '从线索到成交再到用户经营'],
      task: '用一句话解释“商圈作战为什么不是在门店周围做活动”，再画出目标—商圈—阵地—伙伴四层关系。',
      output: '商圈作战总框架',
    });
  }

  const existingIds = new Set((retail.steps || []).map(step => step.id));
  const insertAt = Math.max(0, (retail.steps || []).findIndex(step => step.id === 'retail-space') + 1);
  const missing = battleSteps.filter(step => !existingIds.has(step.id));
  retail.steps.splice(insertAt, 0, ...missing);
}

if (domainOverrides.retail) {
  domainOverrides.retail.description = '从用户研究进入商圈作战：地图、客流、阵地、竞争、伙伴、一店一策、O2O 与经营复盘。';
  domainOverrides.retail.modes = [
    { label: '零售经营基础', status: '可用' },
    { label: '商圈作战专题', status: '可用' },
    { label: '用户 / 门店案例', status: '可用' },
    { label: '正式测试', status: '可用' },
  ];
}

lessonContentById['retail-space'] = {
  intro: '商圈作战不是“门店周边做活动”的高级说法。它真正管理的是一个区域里的用户资源与转化网络：哪些用户在什么时刻出现、会进入哪些候选渠道、哪些阵地最能影响选择、竞品在哪里截流、哪些伙伴能长期提供触点，以及成交之后如何继续服务和经营。核心框架可以压缩成：目标 × 商圈 × 阵地 × 伙伴。',
  sections: [
    {
      title: '一、先把研究对象从“店”升级成“区域经营系统”',
      bullets: [
        '门店只是一个阵地。用户可能在线上产生需求，在交通或商业锚点形成候选，在综合渠道横向比较，在品牌店深度体验，最后通过门店或 O2O 成交。',
        '商圈分析因此不能只统计附近有多少店，而要回答：用户从哪里来、为什么来、在哪些节点改变选择、购买以后由谁继续承接。',
        '学校、社区、企业、商业体、运营商、服务中心、综合渠道和线上即时零售，都可能是商圈网络的一部分。',
      ],
    },
    {
      title: '二、目标 × 商圈 × 阵地 × 伙伴',
      bullets: [
        '目标：这轮经营究竟要解决什么——拉新、高端突破、新品首销、竞品拦截、去库存、生态连带、用户召回，目标不同，资源配置完全不同。',
        '商圈：目标用户在哪些区域、时段和事件下出现，真实需求与预算结构是什么。',
        '阵地：哪些门店 / 渠道 / 服务 / O2O 节点最能影响认知、体验、成交或服务。',
        '伙伴：谁拥有用户、场景、流量或服务资源，品牌能用什么价值交换形成长期合作。',
      ],
    },
    {
      title: '三、一条真正能指导动作的链路',
      paragraphs: [
        '可以用“商圈 → 店型 → 用户 → 预算 → 竞品 → 权益 → 导购 → Demo → 成交”逐层追问。它不是为了画一张漂亮地图，而是为了找到具体的转化断点：是目标用户没进店、首推被竞品截走、真实到手价没有竞争力、Demo 没证明价值、主销 SKU 缺货，还是成交后的服务没有形成下一次关系。',
      ],
    },
    {
      title: '四、学完这个专题你应该能独立产出什么',
      bullets: ['一张商圈作战底图', '一张用户时空表', '一张阵地与伙伴网络图', '一张价格带竞争 Battlecard', '一份商圈作战一页纸', '两份差异化一店一策', '一套战情看板与复盘机制'],
    },
  ],
  checkpoint: '看到“商圈活动”四个字时，先问：它服务哪个经营目标？覆盖什么 Need State？依托哪个阵地和伙伴？活动之后的线索、成交和用户关系由谁承接？如果回答不出来，就还不是完整的商圈作战。',
};

lessonContentById['retail-district-map'] = {
  intro: '一张有用的商圈地图不是“把门店图标放在地图上”，而是把需求发生地、流量来源、关键动线、竞争节点与可触达资源放在同一空间里。边界来自真实用户行为，而不是行政边界。',
  sections: [
    {
      title: '一、先画三层，而不是先画店',
      bullets: [
        '核心圈：高频、强影响、可快速到达，是门店日常自然客流与直接竞争最强的区域。',
        '次级圈：到店需要明确目的或被活动 / 内容触发，通常对权益、交通与场景更敏感。',
        '辐射圈：低频但可能在新品、高端服务、企业团购、文旅或大型活动中产生价值。',
      ],
    },
    {
      title: '二、六类锚点决定流量为什么存在',
      bullets: ['交通：地铁、公交、停车与换乘节点。', '商业：Mall、百货、餐饮、娱乐与核心街区。', '办公：写字楼、产业园、政企机构。', '居住：社区与家庭生活圈。', '教育：高校、中学、培训与学生生活区。', '文旅 / 公共服务：景区、医院、政务、展会等事件型流量。'],
    },
    {
      title: '三、地图上至少标五种“箭头”',
      bullets: ['人流从哪里进入', '人流主要去向', '竞品在哪个节点截流', '我们在哪个节点可以触达 / 承接', '线上订单由哪个实体节点履约'],
    },
    {
      title: '四、地图一定要带时间',
      paragraphs: ['工作日午间、下班后、周末、节假日可能是完全不同的生意。只看日均客流会抹掉真实机会，因此地图至少要有“时段层”，后续活动、排班与主推才能跟着变化。'],
    },
  ],
  checkpoint: '如果地图只能回答“哪里有店”，还不能作战；至少要能回答“用户从哪里来、为什么来、什么时候来、会被谁截走、我们在哪里行动”。',
};

lessonContentById['retail-district-userflow'] = {
  intro: '商圈中的“客流”不是同质流量。真正有经营意义的是：用户 × 情境 × Need State × 购买事件 × 决策角色。人多不等于机会大，高质量流量来自明确任务和可被改变的决策节点。',
  sections: [
    {
      title: '一、把“路过的人”拆成购买事件',
      bullets: ['旧机损坏 / 突发换机', '新品驱动换机', '升学 / 入职 / 出差 / 旅行等生活事件', '礼赠 / 家庭购机', '服务回店带来的换新或连带', '线上种草后到店验证'],
    },
    {
      title: '二、识别完整决策单元',
      paragraphs: ['尤其在学生、家庭、礼赠和企业场景中，使用者、付款者、推荐者与最终否决者可能不是同一个人。商圈用户研究不能只看“眼前是谁”，还要看谁影响预算、候选集和最终决定。'],
    },
    {
      title: '三、建立时段 × Need State 表',
      bullets: ['工作日午间：时间短，可能更需要明确目的与快速交付。', '下班后：通勤客流增加，体验时间与服务需求可能变化。', '周末：家庭 / 朋友共同决策更多，比较与体验可能更充分。', '节假日 / 活动期：文旅、礼赠、新品与促销事件可能改变客群结构。'],
    },
    {
      title: '四、不要把“高客流”当唯一优先级',
      paragraphs: ['商圈经营更应该比较“可触达人数 × 目标用户纯度 × 需求强度 × 可改变概率 × 单客价值 × 后续 LTV”。有些低流量阵地反而可能拥有更高价值、更明确任务的用户。'],
    },
  ],
  checkpoint: '为一个时段写出三类用户，不允许只写年龄职业；每类必须包含：为什么此刻出现、要完成什么任务、谁付款 / 决定、最可能比较什么。',
};

lessonContentById['retail-district-position'] = {
  intro: '商圈里不是每个点位都应该承担同样任务。阵地分层的目的，是把有限的样机、人员、培训、活动、权益和库存投到最能改变用户决策的地方。',
  sections: [
    {
      title: '一、五类典型阵地角色',
      bullets: [
        '品牌形象 / 旗舰阵地：完整表达品牌、产品与生态，承担高端体验和新品心智。',
        '主力成交阵地：稳定客流和销量，需要强库存、强导购、强权益承接。',
        '综合比较阵地：消费者横向比较密集，是竞品拦截、首推与真实价格竞争的重要情报点。',
        '服务阵地：通过维修、保养、迁移等高信任触点承接用户关系，并识别换新机会。',
        '履约节点：服务 O2O / 即时零售，重点看可售库存、响应与交付体验。',
      ],
    },
    {
      title: '二、分层不是贴永久标签',
      paragraphs: ['阵地角色会随着新品、库存、人员能力、客流、竞品动作和经营目标变化。新品首销期某店可能承担体验展示，成熟期又转为高效成交；因此应按周期复核，而不是一次分级后不再调整。'],
    },
    {
      title: '三、资源配置要回答“为什么这里更多”',
      bullets: ['样机与物料', '核心 SKU 库存', '重点导购 / 培训', '活动预算', '权益权限', '高端服务与 O2O 能力'],
    },
    {
      title: '四、阵地之间要能接力',
      paragraphs: ['一个阵地不必完成全部任务。可以由线上内容获客、综合渠道完成比较、品牌店深度体验、O2O 完成最终交付、服务中心持续经营。关键是用户和线索不能在组织边界处断掉。'],
    },
  ],
  checkpoint: '如果你把所有店都写成“提升销量”，说明还没有做阵地设计。为每个阵地明确一个首要角色，再配置与角色一致的资源和 KPI。',
};

lessonContentById['retail-district-competition'] = {
  intro: '商圈竞争不是“华为对 OPPO / vivo / 小米 / Apple”的静态品牌比较，而是同一用户、同一预算、同一时间、同一渠道中的候选集竞争。真正改变成交的，往往是产品价值与真实交易条件共同作用。',
  sections: [
    {
      title: '一、竞争至少同时看七层',
      bullets: ['目标用户 / Need State', '价格带与主销 SKU', '产品与场景价值', '真实到手价与权益', '陈列与首屏信息', 'Demo 与导购首推', '库存 / 服务 / 交付'],
    },
    {
      title: '二、导购是竞争链路的一部分',
      paragraphs: ['综合渠道尤其适合观察“谁被第一推荐、为什么推荐、用户听完后追问什么”。导购推荐可能受到产品理解、成功经验、激励、库存、权益复杂度和用户反馈共同影响，不能简单归因于态度。'],
    },
    {
      title: '三、价格要看交易瀑布',
      bullets: ['官方 / 挂牌价', '即时优惠 / 平台补贴', '以旧换新', '分期 / 信用购', '赠品与服务权益', '渠道店补 / 可执行权限', '最终净支付与风险感知'],
    },
    {
      title: '四、Battlecard 必须能指导现场动作',
      paragraphs: ['好的竞品卡不是参数表，而是回答：这类用户为什么会选对手、我们在哪个环节失去他、现场最应该先问什么、证明什么、用什么权益降低哪个阻力，以及哪些情况应该承认对手更适合。'],
    },
  ],
  checkpoint: '做一张 Battlecard 时至少写出“用户任务—候选集—真实权益—导购首推—关键 Demo—主要异议—我方动作”，少一半都还不够现场可用。',
};

lessonContentById['retail-district-partner'] = {
  intro: '伙伴经营不是“找个地方办活动”。真正有价值的伙伴关系，是双方在用户、场景、服务或资源上形成持续交换，并且活动结束后仍有线索承接和下一次触达理由。',
  sections: [
    {
      title: '一、伙伴可能提供四种核心资源',
      bullets: ['用户资源：稳定覆盖某类人群。', '场景资源：用户在真实任务中自然出现。', '信任资源：伙伴拥有更高的触达与推荐可信度。', '履约 / 服务资源：帮助完成交付、服务或长期触达。'],
    },
    {
      title: '二、品牌也必须给伙伴价值',
      bullets: ['提升伙伴自身用户体验', '带来流量或会员价值', '提供产品 / 服务能力', '共同活动内容', '员工 / 学生 / 企业专属方案', '可衡量的商业回报'],
    },
    {
      title: '三、把一次活动改造成长期链路',
      paragraphs: ['目标用户 → 伙伴触点 → 低门槛体验 / 服务 → 高意向线索 → 到店 / O2O → 成交 → 服务 / CRM → 下一次换新或连带。只有链路后半段有人负责，一次活动才可能沉淀为长期用户资产。'],
    },
    {
      title: '四、伙伴优先级也要计算',
      bullets: ['目标用户匹配度', '覆盖规模', '触达频次', '信任强度', '合作成本', '可追踪性', '长期复用可能性'],
    },
  ],
  checkpoint: '如果合作方案只有“场地 + 礼品 + 到场人数”，还不是伙伴经营；必须补上双方价值、目标 Need State、CTA、线索归属、后续责任和转化窗口。',
};

lessonContentById['retail-district-plan'] = {
  intro: '前面所有分析最终都必须收敛成一个作战选择：为了什么目标，我们选择哪个商圈、哪些用户和阵地，用哪组资源与伙伴，在什么节奏下改变什么行为。分析越多，不做取舍就越没有经营价值。',
  sections: [
    {
      title: '一、先写 Business Objective，再写活动',
      bullets: ['目标必须具体：例如新品高端突破、竞品用户转化、重点价格带提升、老客换新、生态连带，而不是笼统“提升销量”。', '目标决定用户、阵地、预算、权益和 KPI；同一动作在不同目标下可能价值完全不同。'],
    },
    {
      title: '二、Where to Play：决定在哪里赢',
      bullets: ['优先商圈 / 子区域', '优先用户 Need State', '优先价格带 / 产品任务', '优先阵地', '优先伙伴'],
    },
    {
      title: '三、How to Win：把杠杆组合起来',
      bullets: ['产品价值表达', '陈列 / Demo', '价格 / 权益 / 金融 / 换新', '导购赋能', '活动与外拓', 'O2O / 履约', '服务', 'CRM / 用户经营'],
    },
    {
      title: '四、一页作战方案的最低字段',
      bullets: ['目标', '证据', '目标用户', '核心机会', '重点阵地', '伙伴', '动作', 'Owner', '时间节奏', '资源', 'KPI', '验证窗口', '下一次决策'],
    },
  ],
  checkpoint: '删掉方案中的“加强、提升、持续关注”等模糊词，确保每个动作都能回答：谁在何处做什么，希望改变哪个用户行为，用什么指标验证。',
};

lessonContentById['retail-district-storeplan'] = {
  intro: '商圈策略如果不能落到单店，就只是区域口号。一店一策不是每家店写一份漂亮文档，而是根据店型、客流、竞争、团队、库存和线上能力，明确这家店此刻最应该做什么、少做什么。',
  sections: [
    {
      title: '一、一店一策先回答六个差异',
      bullets: ['客流从哪里来、什么时段最有价值', '主要用户 Need State', '主要竞争品牌与价格带', '团队强项 / 短板', '库存与主销 SKU', '服务 / O2O / 伙伴资源'],
    },
    {
      title: '二、门店动作卡',
      bullets: ['本周期唯一核心目标', '主攻用户', '主推组合', '入口 / 陈列', 'Top 3 Demo', 'Top 3 异议', '权益使用', '导购分工', '库存 / O2O', '外拓 / CRM', '每日 / 每周指标'],
    },
    {
      title: '三、旗舰店与综合渠道不能复制模板',
      paragraphs: ['旗舰阵地更适合完整品牌体验、生态、高端服务与新品心智；综合渠道则更容易发生横向比较、价格竞争和导购首推。两者的作战任务、话术、情报价值与 KPI 本来就不同。'],
    },
    {
      title: '四、一店一策要有“停止做什么”',
      paragraphs: ['资源有限。真正的策略一定包含取舍：某些低价值活动不做、某些 SKU 不主推、某些时段减少投入，把资源集中到最能改变目标结果的地方。'],
    },
  ],
  checkpoint: '为两种不同店型各写一页策略。如果两份内容只换了门店名字，说明还没有做到“一店一策”。',
};

lessonContentById['retail-district-warroom'] = {
  intro: '商圈作战需要“战情室”而不是月底解释会。战情室的任务是尽快发现：哪里偏离目标、为什么可能偏离、需要什么证据、下一步小范围动作是什么。核心纪律是事实、判断、假设分开。',
  sections: [
    {
      title: '一、指标分四层看，不要只看 Sell-out',
      bullets: ['获客：Reach、目标人群、到店、活动到场。', '体验：接待、停留、Demo率、高意向。', '成交：转化、Sell-out、ASP、版本结构、权益、缺货。', '长期：服务、会员、复购、换新、连带、转介绍、O2O履约。'],
    },
    {
      title: '二、会诊顺序',
      bullets: ['先确认事实是否真的发生', '把总量拆到商圈 / 阵地 / 时段 / 用户 / SKU', '列出互相独立的原因假设', '为每个假设指定证据', '选最小可验证动作', '规定复盘窗口和下一次决策'],
    },
    {
      title: '三、常见错误归因',
      bullets: ['销量下降 = 导购不努力', '客流高 = 活动成功', '库存有货 = 不存在供给问题', '竞品降价 = 我们也必须降价', '活动当天没成交 = 活动无效'],
    },
    {
      title: '四、真正的闭环',
      paragraphs: ['目标 → 执行 → Study / Business Fact → 差距 → 假设 → 动作 → 再验证。好的复盘会改变下一轮商圈、阵地、伙伴或资源配置，而不是只形成一份说明材料。'],
    },
  ],
  checkpoint: '面对“重点商圈销量下降”，至少提出来自流量、用户、竞争、体验、权益、供给 / 库存、人员 / 执行七个不同层级的假设，再决定先验证哪一个。',
};

const battleCards = [
  {
    id: 'retail-district-001', domain: 'retail', deck: '商圈与零售', category: '商圈作战',
    concept_id: 'retail.district.system', skill: 'business-district-strategy',
    question: '为什么“商圈作战”不能等同于“门店周边做活动”？',
    answer: '因为商圈作战经营的是区域内持续存在的用户、阵地、伙伴和转化链路。活动只是其中一种动作；真正的作战还要管理目标用户、门店/渠道角色、竞品截流、权益与Demo、服务承接、O2O和长期用户关系。',
  },
  {
    id: 'retail-district-002', domain: 'retail', deck: '商圈与零售', category: '商圈作战',
    concept_id: 'retail.district.objective', skill: 'business-district-strategy',
    question: '“目标 × 商圈 × 阵地 × 伙伴”四层分别回答什么？',
    answer: '目标回答要改变什么经营结果；商圈回答目标用户在哪里、何时出现；阵地回答哪些触点最能影响认知/体验/成交/服务；伙伴回答谁拥有用户、场景、流量或服务资源并能形成长期协同。',
  },
  {
    id: 'retail-district-003', domain: 'retail', deck: '商圈与零售', category: '商圈地图',
    concept_id: 'retail.district.map', skill: 'spatial-diagnosis',
    question: '一张可作战的商圈地图至少比“门店地图”多哪四类信息？',
    answer: '至少还要有流量锚点、用户/时段、关键动线与竞品截流节点，并进一步标出可触达阵地、伙伴和O2O履约节点。',
  },
  {
    id: 'retail-district-004', domain: 'retail', deck: '商圈与零售', category: '用户时空',
    concept_id: 'retail.district.userflow', skill: 'need-state-analysis',
    question: '为什么商圈客流不能只按“年轻人/上班族/家庭”分类？',
    answer: '人口标签不足以指导动作。需要继续拆到情境、购买事件、Need State、使用者/付款者/决策者和候选集，才能判断什么触点和GTM动作真正能改变选择。',
  },
  {
    id: 'retail-district-005', domain: 'retail', deck: '商圈与零售', category: '阵地分层',
    concept_id: 'retail.district.position', skill: 'channel-role-design',
    question: '为什么商圈内的门店不应该平均分配资源？',
    answer: '不同阵地在认知、体验、比较、成交、服务和履约中的影响力不同。资源应围绕经营目标和阵地角色配置，而不是平均分配样机、库存、人员、活动和权益。',
  },
  {
    id: 'retail-district-006', domain: 'retail', deck: '商圈与零售', category: '竞争战场',
    concept_id: 'retail.district.competition', skill: 'competitive-battlecard',
    question: '商圈竞争为什么要看“真实交易条件”而不是只看官方价？',
    answer: '消费者的真实选择还受补贴、以旧换新、分期、赠品、服务权益、渠道权限、库存和导购推荐影响。官方价只是交易条件的一部分。',
  },
  {
    id: 'retail-district-007', domain: 'retail', deck: '商圈与零售', category: '伙伴经营',
    concept_id: 'retail.district.partner', skill: 'partner-operation',
    question: '一次学校或企业活动怎样才能从“活动”升级为“伙伴经营”？',
    answer: '要明确双方价值、目标Need State、稳定触点、现场体验/服务、CTA、线索归属、到店/履约承接、CRM责任和后续转化窗口，而不是只统计到场和礼品。',
  },
  {
    id: 'retail-district-008', domain: 'retail', deck: '商圈与零售', category: '作战设计',
    concept_id: 'retail.district.plan', skill: 'gtm-action-design',
    question: '商圈作战方案为什么必须先写 Business Objective？',
    answer: '因为目标决定优先用户、商圈、阵地、资源、权益、KPI和验证方式。若先做活动再找目标，很容易堆动作但无法判断资源是否有效。',
  },
  {
    id: 'retail-district-009', domain: 'retail', deck: '商圈与零售', category: '一店一策',
    concept_id: 'retail.district.storeplan', skill: 'store-strategy',
    question: '“一店一策”最核心的不是每家店都写一份文档，而是什么？',
    answer: '根据店型、客流、用户、竞品、团队、库存、O2O和伙伴资源的差异做真正的经营取舍，明确该店此刻最重要的目标、动作与停止事项。',
  },
  {
    id: 'retail-district-010', domain: 'retail', deck: '商圈与零售', category: '经营复盘',
    concept_id: 'retail.district.warroom', skill: 'business-diagnosis',
    question: '重点商圈销量下降时，为什么不能先归因于“导购能力不够”？',
    answer: '因为可能来自流量、用户结构、竞品、价格权益、Demo、库存/SKU、O2O、人员排班等多层因素。应先确认事实、拆指标、形成互相独立的假设，再验证。',
  },
  {
    id: 'retail-district-011', domain: 'retail', deck: '商圈与零售', category: '经营指标',
    concept_id: 'retail.district.kpi', skill: 'business-diagnosis',
    question: '为什么商圈作战不能只用 Sell-out 评价？',
    answer: 'Sell-out 是结果指标。要定位问题还需要获客、到店、体验、Demo、高意向、转化、ASP、结构、缺货、权益、服务、复购和O2O履约等过程与长期指标。',
  },
  {
    id: 'retail-district-012', domain: 'retail', deck: '商圈与零售', category: '完整链路',
    concept_id: 'retail.district.funnel', skill: 'business-district-strategy',
    question: '“商圈 → 店型 → 用户 → 预算 → 竞品 → 权益 → 导购 → Demo → 成交”这条链最大的价值是什么？',
    answer: '它迫使经营者逐层定位真实转化断点，而不是只看门店或销量结果，从而把商圈分析转成具体的陈列、导购、Demo、权益、库存、伙伴和服务动作。',
  },
];

const existingCardIds = new Set(extraCards.map(card => card.id || card.card_id));
extraCards.push(...battleCards.filter(card => !existingCardIds.has(card.id)));

if (typeof window !== 'undefined') {
  window.__RETAIL_BUSINESS_DISTRICT_V14__ = {
    version: VERSION,
    lessonIds: ['retail-space', ...battleSteps.map(step => step.id)],
    cardIds: battleCards.map(card => card.id),
  };
}
