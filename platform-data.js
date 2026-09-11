export const domainOverrides = {
  retail: {
    status: 'active',
    statusLabel: '可学习',
    description: '从用户、商圈、渠道、门店到活动、O2O 与经营复盘，训练零售 GTM 判断。',
    modes: [
      { label: '零售经营基础', status: '可用' },
      { label: '用户 / 门店案例', status: '可用' },
      { label: '正式测试', status: '可用' },
    ],
  },
  industry: {
    status: 'active',
    statusLabel: '可学习',
    description: '理解市场、品牌、价格带、产品组合、渠道、商业模式与竞争动作。',
    modes: [
      { label: '行业框架', status: '可用' },
      { label: '商业判断', status: '可用' },
      { label: '正式测试', status: '可用' },
    ],
  },
};

export const curricula = {
  phone: {
    title: '手机 Retail GTM 八阶段路线',
    source: '基于私有 Obsidian 的《华为手机 Retail GTM 两个月学习打卡计划_全产品线版》整理。',
    steps: [
      {
        id: 'phone-portfolio',
        title: '01｜产品组合',
        summary: '先理解 Mate、Pura、nova、畅享、折叠为什么同时存在，而不是从参数开始。',
        keyPoints: ['产品线战略角色', '用户与价格带', '系列之间的分工与避免内耗'],
        task: '不看资料，用 3 分钟说清 5 类产品线各自承担什么业务角色。',
        output: '产品矩阵一页纸',
      },
      {
        id: 'phone-tech',
        title: '02｜技术平台',
        summary: '把芯片、屏幕、影像、通信、电池、折叠结构从“参数”翻译成用户价值。',
        keyPoints: ['技术原理够用即可', '参数 → 场景体验', '哪些能力适合传播 / Demo / 基础支撑'],
        task: '随机选 3 个参数，分别写出用户场景与零售表达。',
        output: '技术 × 用户价值地图',
      },
      {
        id: 'phone-os',
        title: '03｜系统与生态',
        summary: '理解 HarmonyOS、AI 与多设备协同如何影响体验、连带与迁移成本。',
        keyPoints: ['系统价值而非功能列表', '手机 × 平板 / PC / 穿戴', '生态对复购与连带的影响'],
        task: '设计一个“手机 + 平板 + 穿戴”的真实用户场景方案。',
        output: '终端生态场景图',
      },
      {
        id: 'phone-user',
        title: '04｜用户与产品匹配',
        summary: '从消费者 Need State 与任务出发，判断什么人应该买什么，而不是背销售话术。',
        keyPoints: ['高端商务', '影像时尚', '游戏 / 学生 / 家庭 / 大众等用户', '需求与产品线匹配'],
        task: '选 3 类用户，分别写出购买任务、关键顾虑、最适合的产品线。',
        output: '用户 × 产品匹配矩阵',
      },
      {
        id: 'phone-competition',
        title: '05｜市场与竞争',
        summary: '按价格带、用户与场景拆竞争，而不是只做品牌对品牌。',
        keyPoints: ['高端旗舰', '影像 / 折叠 / 中端 / 大众价位', '价格权益与渠道动作'],
        task: '任选一个价位段，写清主要玩家、核心用户、购买理由和华为应对。',
        output: '细分市场竞争地图',
      },
      {
        id: 'phone-retail',
        title: '06｜零售 GTM',
        summary: '理解产品怎样在门店被看见、被理解、被体验，最终转化。',
        keyPoints: ['陈列与可见性', 'Demo 与体验链路', '导购培训 / O2O / 物料 / 活动'],
        task: '选一款产品，设计“入口看见 → 上手体验 → 价值理解 → 转化”的门店链路。',
        output: '零售转化链路',
      },
      {
        id: 'phone-launch',
        title: '07｜上市与经营',
        summary: '把新品上市拆成节奏、权益、备货、传播、门店承接与日度经营。',
        keyPoints: ['上市节奏', '价格 / 权益 / 渠道 / 物料', '预售与首销', '流速 / 库存 / 风险'],
        task: '用 Who → Why → What → How → Where → When → Measure 写一份新品上市骨架。',
        output: '新品 GTM 骨架',
      },
      {
        id: 'phone-review',
        title: '08｜综合实战与复盘',
        summary: '从“卖得好不好”升级到产品、用户、价格、竞争、渠道、流量、转化与库存的系统诊断。',
        keyPoints: ['指标拆解', '事实 / 判断 / 假设分离', '问题定位与验证', '形成下一轮动作'],
        task: '挑一个真实业务现象，至少提出 3 个可验证原因，并给出验证方法。',
        output: 'GTM 会诊报告',
      },
    ],
  },
  retail: {
    title: '零售 GTM 八步学习路线',
    source: '只使用公开安全的通用零售方法，私人工作资料继续保留在 Obsidian。',
    steps: [
      { id: 'retail-user', title: '01｜用户与 Need State', summary: '先回答顾客为什么来、要完成什么任务，再谈产品与活动。', keyPoints: ['Need State', 'JTBD', '购买触发 / 阻力'], task: '把一个真实顾客描述改写成 JTBD。', output: '用户任务卡' },
      { id: 'retail-journey', title: '02｜决策旅程', summary: '理解种草、到店、体验、比较、成交、服务与复购之间的关系。', keyPoints: ['触点', '关键摩擦', '转化节点'], task: '画一条从线上看到内容到到店成交的链路。', output: '决策旅程图' },
      { id: 'retail-space', title: '03｜商圈与空间', summary: '把门店放回商圈里看：客群、动线、竞品、流量来源与时段结构。', keyPoints: ['商圈边界', '客群结构', '动线 / 锚点 / 竞品'], task: '选一个商圈，列出至少 3 类核心客流来源。', output: '商圈扫描表' },
      { id: 'retail-store', title: '04｜门店与陈列', summary: '陈列不是摆整齐，而是降低消费者理解产品价值的成本。', keyPoints: ['可见性', '黄金位置', '体验顺序', '主推与资源约束'], task: '任选一张门店平面图，解释入口第一桌为什么应该这样放。', output: '陈列逻辑图' },
      { id: 'retail-demo', title: '05｜体验与 Demo', summary: '把抽象卖点转成可感知、可比较、可记住的体验。', keyPoints: ['场景化', '低学习成本', '对比前后差异'], task: '为一个手机卖点设计 60 秒 Demo。', output: 'Demo 卡' },
      { id: 'retail-channel', title: '06｜渠道 / O2O / 履约', summary: '理解库存、线上曝光、接单、交付、服务承接与异常处理。', keyPoints: ['线上线下库存', '履约率', '服务接力', '异常机制'], task: '写出 O2O 下单到交付的标准链路与 2 个风险点。', output: 'O2O 履约图' },
      { id: 'retail-ops', title: '07｜活动与用户经营', summary: '活动、权益、会员、复购与口碑应围绕经营目标，而不是只追求热闹。', keyPoints: ['活动目标', '权益设计', '用户留存', '口碑与转介绍'], task: '给一个节促活动写清目标、对象、动作和 KPI。', output: '活动经营卡' },
      { id: 'retail-review', title: '08｜经营数据与复盘', summary: '用客流、转化、客单、库存、连带、履约等指标找到经营问题。', keyPoints: ['漏斗', '流速与库存', '异常归因', '验证闭环'], task: '给“销量下降”提出至少 5 个不同层级的解释变量。', output: '零售会诊表' },
    ],
  },
  industry: {
    title: '行业与商业八步路线',
    source: '使用通用商业与手机行业分析框架，避免把私人业务材料公开到部署仓库。',
    steps: [
      { id: 'industry-market', title: '01｜市场结构', summary: '先看市场规模、增速、集中度、换机周期与价格带，再看单一品牌。', keyPoints: ['规模与增速', '份额与集中度', '价格带结构'], task: '解释“份额上涨”为什么不一定等于业务质量变好。', output: '市场结构表' },
      { id: 'industry-brand', title: '02｜品牌与定位', summary: '区分品牌心智、用户资产、产品定位与传播口号。', keyPoints: ['目标用户', '差异化心智', '品牌溢价'], task: '选两个品牌，用一句话区分各自高端心智。', output: '品牌定位卡' },
      { id: 'industry-portfolio', title: '03｜产品组合', summary: '理解系列、价格带、生命周期与 SKU 如何共同完成市场覆盖。', keyPoints: ['Good / Better / Best', '价格带覆盖', '生命周期与自我蚕食'], task: '解释为什么品牌不能只卖旗舰。', output: '产品组合图' },
      { id: 'industry-pricing', title: '04｜价格与权益', summary: '挂牌价、到手价、补贴、赠品、金融与以旧换新共同决定真实交易价格。', keyPoints: ['价格瀑布', '权益组合', '价格保护'], task: '把一个“降价 500 元”拆成消费者、渠道、品牌三方影响。', output: '价格权益表' },
      { id: 'industry-channel', title: '05｜渠道与区域', summary: '线上、品牌店、运营商、经销商、综合卖场承担不同角色。', keyPoints: ['覆盖效率', '渠道利益', '区域差异'], task: '比较直营与经销模式各自的优缺点。', output: '渠道角色图' },
      { id: 'industry-model', title: '06｜商业模式与生态', summary: '硬件利润只是一个层面，还要看服务、生态、订阅、连带与用户生命周期价值。', keyPoints: ['收入来源', '生态协同', 'LTV'], task: '解释生态为什么能提高复购与迁移成本。', output: '商业模式图' },
      { id: 'industry-competition', title: '07｜竞争情报', summary: '竞争分析要同时看产品、价格、权益、渠道、门店、传播与用户反应。', keyPoints: ['事实核验', '竞争动作', '反证与风险'], task: '把一条竞品新闻拆成事实、判断、待验证假设。', output: '竞情卡' },
      { id: 'industry-strategy', title: '08｜战略判断', summary: '从现象上升到结构性原因，并用情景分析判断下一步。', keyPoints: ['驱动因素', '情景预测', '战略取舍'], task: '对一个市场趋势写基准 / 乐观 / 悲观三个情景。', output: '情景分析页' },
    ],
  },
};

export const visualSources = {
  phone: [
    {
      name: 'HUAWEI Mate 80',
      url: 'https://consumer.huawei.com/cn/phones/mate80/',
      focus: '后摄 Deco、直板旗舰轮廓、Mate 系列设计语言',
    },
    {
      name: 'HUAWEI Pura 80',
      url: 'https://consumer.huawei.com/cn/phones/pura80/',
      focus: '影像 Deco、色彩与 Pura 系列视觉辨识',
    },
    {
      name: 'HUAWEI Mate X7',
      url: 'https://consumer.huawei.com/cn/phones/mate-x7/',
      focus: '大折叠形态、展开 / 折叠状态、结构辨识',
    },
  ],
};

export const extraCards = [
  { id: 'phone-gtm-001', domain: 'phone', deck: '手机产品专家', category: '产品组合', question: '为什么手机品牌需要多条产品线，而不是只做一款“全能旗舰”？', answer: '因为不同用户的预算、审美、场景和购买任务不同。多产品线可以覆盖不同价格带与人群，同时承担高端心智、规模、影像、年轻化、折叠创新等不同业务角色。' },
  { id: 'phone-gtm-002', domain: 'phone', deck: '手机产品专家', category: '用户匹配', question: '产品定位和用户画像有什么区别？', answer: '产品定位回答“这款产品希望在谁心中占据什么位置”；用户画像描述某类用户的特征。GTM 更关注 Need State、任务、购买驱动和阻力，而不是只看年龄职业。' },
  { id: 'phone-gtm-003', domain: 'phone', deck: '手机产品专家', category: '零售 GTM', question: '为什么零售 Demo 不能只是把功能全部演示一遍？', answer: 'Demo 的目标是让消费者快速感知差异并把卖点连接到自己的场景。功能越多不代表越有效，关键是短、可感知、可比较、与需求相关。' },
  { id: 'phone-gtm-004', domain: 'phone', deck: '手机产品专家', category: '上市', question: '新品上市中的 Who → Why → What → How → Where → When → Measure 分别在解决什么？', answer: 'Who 是目标用户；Why 是购买理由；What 是产品与核心价值；How 是传播/体验/转化方式；Where 是渠道与场景；When 是节奏；Measure 是衡量成功的指标。' },
  { id: 'phone-gtm-005', domain: 'phone', deck: '手机产品专家', category: '经营复盘', question: '销量下降时，为什么不能直接归因于“导购能力不够”？', answer: '销量同时受产品、价格、权益、竞争、库存、客流、转化、陈列、培训、渠道、O2O 等多因素影响。应先拆指标与证据，再形成待验证假设。' },
  { id: 'phone-gtm-006', domain: 'phone', deck: '手机产品专家', category: '竞争', question: '为什么竞品分析不能只比较参数？', answer: '真实竞争还包括品牌心智、价格、权益、渠道利润、门店覆盖、发布节奏、用户资产与服务。参数只是产品层的一部分。' },
  { id: 'phone-gtm-007', domain: 'phone', deck: '手机产品专家', category: '生态', question: '生态为什么可能影响下一次换机选择？', answer: '多设备协同、数据与服务连续性会提升使用便利，也形成迁移成本。生态体验越深，用户换到另一平台需要重新学习、迁移或放弃已有协同。' },
  { id: 'phone-gtm-008', domain: 'phone', deck: '手机产品专家', category: '价格权益', question: '为什么挂牌价不能代表消费者真实交易价格？', answer: '实际到手价还会受到补贴、优惠券、以旧换新、赠品、金融分期、渠道活动等影响。GTM 需要看完整价格权益组合。' },

  { id: 'retail-001', domain: 'retail', deck: '商圈与零售', category: '用户研究', question: 'Need State 与传统人口画像的核心区别是什么？', answer: '人口画像描述“这个人是谁”；Need State 更关心“他在当前情境下为什么需要解决某个问题”。同一年龄职业的人可能处于完全不同的需求状态。' },
  { id: 'retail-002', domain: 'retail', deck: '商圈与零售', category: '用户研究', question: 'JTBD 的一句话核心是什么？', answer: '用户不是购买产品本身，而是在特定情境中“雇佣”产品帮助自己完成一个任务、取得进展。' },
  { id: 'retail-003', domain: 'retail', deck: '商圈与零售', category: '门店陈列', question: '陈列最核心的经营目的是什么？', answer: '降低消费者发现、理解和体验产品价值的成本，并在有限空间里匹配主推策略、客流和人员资源。' },
  { id: 'retail-004', domain: 'retail', deck: '商圈与零售', category: '体验 Demo', question: '一个好的零售 Demo 通常具备哪些特点？', answer: '与真实需求相关、时间短、前后差异可感知、消费者能自己上手、能形成记忆点，并自然连接到购买理由。' },
  { id: 'retail-005', domain: 'retail', deck: '商圈与零售', category: '经营漏斗', question: '零售漏斗中“客流很多但销量不高”至少应继续拆哪几层？', answer: '可继续看有效接待、体验率、需求匹配、转化率、客单、缺货、价格权益竞争力等，不能只看总客流。' },
  { id: 'retail-006', domain: 'retail', deck: '商圈与零售', category: 'O2O', question: 'O2O 履约为什么不只是“把货送到用户手里”？', answer: '手机等复杂产品还涉及库存准确、接单、打包、交付、验机、激活、贴膜、迁移、售后承接等完整体验。' },
  { id: 'retail-007', domain: 'retail', deck: '商圈与零售', category: '活动运营', question: '设计门店活动时，第一步应该先确定什么？', answer: '先确定经营目标与目标人群，例如拉新、转化、连带、去库存、用户召回等，再设计权益、传播和现场动作。' },
  { id: 'retail-008', domain: 'retail', deck: '商圈与零售', category: '用户经营', question: '为什么成交不是用户经营的终点？', answer: '后续服务、使用体验、会员触达、复购、连带和转介绍都会影响用户生命周期价值与品牌关系。' },
  { id: 'retail-009', domain: 'retail', deck: '商圈与零售', category: '商圈', question: '做商圈分析时为什么不能只统计附近有多少家店？', answer: '还要看客流来源、消费目的、时段、交通动线、办公/住宅/文旅属性、竞品锚点和门店可达性。' },
  { id: 'retail-010', domain: 'retail', deck: '商圈与零售', category: '库存', question: '库存管理里“有库存”为什么仍可能无法形成销售？', answer: '库存可能在错误的门店、错误 SKU、错误颜色或容量，也可能没有被上架、展示、推荐或同步到线上，因此要看可售库存与结构。' },
  { id: 'retail-011', domain: 'retail', deck: '商圈与零售', category: '现场管理', question: '晨会 / 午会在门店现场管理中的价值是什么？', answer: '统一目标与信息、同步活动权益与缺货风险、明确人员分工，并及时把当天问题反馈到团队，减少信息断层。' },
  { id: 'retail-012', domain: 'retail', deck: '商圈与零售', category: '复盘', question: '零售复盘时为什么要区分事实、判断和待验证假设？', answer: '事实是已观察或已核验的数据；判断是基于事实的解释；假设是还需要证据验证的可能原因。混在一起会导致错误归因和错误动作。' },

  { id: 'industry-001', domain: 'industry', deck: '行业与商业', category: '市场', question: '市场份额上升为什么不一定代表业务质量一定改善？', answer: '份额可能由降价、低端放量、竞争对手缺货等推动。还要同时看 ASP、利润、库存、用户结构、产品组合和可持续性。' },
  { id: 'industry-002', domain: 'industry', deck: '行业与商业', category: '市场', question: '出货量（sell-in）与终端销量（sell-out）有什么区别？', answer: 'sell-in 是厂商向渠道出货；sell-out 是渠道真正卖给消费者。两者偏离可能意味着渠道库存积压或去库存。' },
  { id: 'industry-003', domain: 'industry', deck: '行业与商业', category: '价格', question: 'ASP 是什么，为什么重要？', answer: 'ASP 是平均销售价格。它能帮助观察品牌或市场的价格结构与高端化程度，但需要结合销量和利润一起看。' },
  { id: 'industry-004', domain: 'industry', deck: '行业与商业', category: '产品组合', question: '什么是产品组合中的“自我蚕食”？', answer: '同一品牌的不同产品过于接近，导致新产品主要抢走自家旧产品或兄弟系列销量，而没有带来新增用户或更高价值。' },
  { id: 'industry-005', domain: 'industry', deck: '行业与商业', category: '品牌', question: '品牌定位和传播口号为什么不能等同？', answer: '定位是希望在目标用户心中长期占据的差异化位置；口号只是某一阶段表达定位的传播形式。' },
  { id: 'industry-006', domain: 'industry', deck: '行业与商业', category: '渠道', question: '为什么直营和经销渠道通常需要并存？', answer: '直营有利于品牌体验、数据和标准控制；经销有利于快速覆盖和本地经营。不同市场、城市和品类需要不同组合。' },
  { id: 'industry-007', domain: 'industry', deck: '行业与商业', category: '商业模式', question: 'LTV 指什么？', answer: 'Customer Lifetime Value，用户生命周期价值。它关注一个用户在长期内带来的收入、利润、复购、连带和服务价值，而不是只看一次交易。' },
  { id: 'industry-008', domain: 'industry', deck: '行业与商业', category: '生态', question: '生态竞争为什么不仅是“设备多”？', answer: '关键在设备之间是否形成无缝协同、统一账号与服务、数据连续性，以及这些能力是否真正提升用户效率和粘性。' },
  { id: 'industry-009', domain: 'industry', deck: '行业与商业', category: '竞争情报', question: '竞情里“事实”和“解释”应该如何区分？', answer: '事实必须有可核验来源，例如价格、发布日期、门店数量；解释是对事实背后意图与影响的分析，不能把分析写成已知事实。' },
  { id: 'industry-010', domain: 'industry', deck: '行业与商业', category: '战略', question: '情景分析的价值是什么？', answer: '它不是预测唯一答案，而是围绕关键不确定性构建多个可能未来，提前判断各情景下的风险、机会与动作。' },
  { id: 'industry-011', domain: 'industry', deck: '行业与商业', category: '上市', question: '为什么发布会热度高不等于上市成功？', answer: '上市成功还取决于产品力、价格权益、供货、渠道覆盖、门店承接、口碑、转化和持续经营。传播只是链路的一部分。' },
  { id: 'industry-012', domain: 'industry', deck: '行业与商业', category: '分析方法', question: '行业分析为什么需要“反证”？', answer: '为了避免只寻找支持原观点的信息。主动寻找相反证据能检验判断是否稳健，并暴露替代解释与风险。' },
];

const option = (text) => text;

export const tests = {
  phone: {
    title: '手机产品专家｜100 分基础验收',
    description: '10 道客观题，每题 10 分。先验证基础框架，复杂场景题后续再接人工 / AI 评阅。',
    questions: [
      { q: 'SoC 最准确的描述是？', options: [option('只负责 CPU 运算'), option('把多类计算与控制模块集成到一个芯片体系'), option('只负责蜂窝通信'), option('手机的操作系统')], answer: 1, explanation: 'SoC 通常集成 CPU、GPU、NPU、ISP、Modem 等多类模块。' },
      { q: 'LTPO 屏幕最核心的价值是？', options: [option('只提高分辨率'), option('只提高触控采样率'), option('让刷新率更灵活动态变化以平衡流畅与功耗'), option('让屏幕一定更亮')], answer: 2, explanation: 'LTPO 的价值在于更灵活的刷新率调节。' },
      { q: '为什么跑分高不等于游戏体验一定更好？', options: [option('跑分完全没有意义'), option('还受散热、调度、内存、网络、适配等影响'), option('只和屏幕尺寸有关'), option('只和电池容量有关')], answer: 1, explanation: '长期体验由多个系统共同决定。' },
      { q: 'OIS 主要解决什么？', options: [option('提高网络速率'), option('光学层面补偿抖动'), option('增加存储空间'), option('提升扬声器音量')], answer: 1, explanation: 'OIS 是光学防抖。' },
      { q: '电池容量更大却不一定续航更长，最主要因为？', options: [option('续航还受芯片、屏幕、系统、网络和负载影响'), option('mAh 没有任何意义'), option('只要快充高就一定更省电'), option('只和手机重量有关')], answer: 0, explanation: '续航是整机系统效率问题。' },
      { q: 'GTM 中的 Who 首先在回答什么？', options: [option('目标用户是谁'), option('广告投放在哪'), option('什么时候上市'), option('KPI 是多少')], answer: 0, explanation: 'Who 是目标用户与核心对象。' },
      { q: '为什么产品专家不能只背参数？', options: [option('参数都不重要'), option('消费者购买的是任务完成能力与体验，参数需要转成场景价值'), option('只需要讲品牌'), option('只需要讲价格')], answer: 1, explanation: '参数必须连接到体验、场景和购买理由。' },
      { q: '新品上市中 Measure 负责什么？', options: [option('定义用户'), option('定义渠道'), option('衡量结果是否达到目标'), option('确定产品颜色')], answer: 2, explanation: 'Measure 是指标与验证。' },
      { q: '做竞品分析时，下面哪项最完整？', options: [option('只比芯片跑分'), option('只比相机参数'), option('产品、价格、权益、渠道、零售、用户与节奏共同看'), option('只看社交媒体声量')], answer: 2, explanation: '真实竞争是多维的。' },
      { q: '销量下降时，最合理的第一步是？', options: [option('直接判断导购能力差'), option('先拆产品、价格、库存、客流、转化等事实与指标'), option('马上全面降价'), option('只增加广告')], answer: 1, explanation: '先诊断，再归因，再行动。' },
    ],
  },
  retail: {
    title: '商圈与零售｜100 分基础验收',
    description: '10 道客观题，每题 10 分，覆盖用户、门店、O2O 与经营复盘。',
    questions: [
      { q: 'Need State 比人口画像更强调什么？', options: ['年龄与职业', '当前情境中的任务与需求状态', '用户住址', '社交平台偏好'], answer: 1, explanation: 'Need State 关注特定情境下要解决的问题。' },
      { q: 'JTBD 的核心是？', options: ['描述产品功能', '理解用户雇佣产品完成什么任务', '统计门店面积', '设计广告口号'], answer: 1, explanation: 'JTBD 关注用户想取得的进展。' },
      { q: '陈列的核心经营目标更接近哪项？', options: ['把商品摆得越多越好', '降低发现、理解与体验价值的成本', '所有产品平均分配位置', '只追求拍照好看'], answer: 1, explanation: '陈列服务于理解与转化。' },
      { q: '好的 Demo 最不应该做什么？', options: ['围绕真实场景', '让差异可感知', '一次演示所有功能', '让消费者上手'], answer: 2, explanation: '功能堆砌会增加理解成本。' },
      { q: '客流高但销量低，下一步优先看？', options: ['只看员工人数', '体验率、转化率、价格、库存与需求匹配', '只看天气', '只改门店音乐'], answer: 1, explanation: '应继续拆漏斗与关键影响变量。' },
      { q: 'O2O 履约中容易被忽略但很重要的是？', options: ['只看骑手速度', '验机、激活、迁移与服务承接', '只看包装颜色', '只看门头'], answer: 1, explanation: '复杂产品需要完整交付体验。' },
      { q: '门店活动设计第一步应是？', options: ['先买礼品', '先确定经营目标与目标人群', '先做海报', '先定主持人'], answer: 1, explanation: '活动应服务经营目标。' },
      { q: '用户经营为什么延伸到成交之后？', options: ['为了多发消息', '服务、复购、连带与转介绍影响长期价值', '成交不重要', '只为了会员数量'], answer: 1, explanation: '用户生命周期价值不止一次交易。' },
      { q: '商圈分析除了门店数量，还必须关注？', options: ['客流来源、动线、时段和竞品锚点', '店员星座', '装修颜色', '员工手机品牌'], answer: 0, explanation: '商圈分析本质是空间与客流结构。' },
      { q: '复盘里“待验证假设”是指？', options: ['已经证实的数据', '尚未证实、需要进一步验证的原因解释', '结论性事实', '固定 SOP'], answer: 1, explanation: '假设必须通过数据或观察继续验证。' },
    ],
  },
  industry: {
    title: '行业与商业｜100 分基础验收',
    description: '10 道客观题，每题 10 分，覆盖市场、品牌、渠道与战略分析。',
    questions: [
      { q: '市场份额上涨但 ASP 明显下降，可能说明？', options: ['业务质量一定改善', '可能依赖更低价产品放量，需要结合利润与结构判断', '一定是高端化成功', '与产品组合无关'], answer: 1, explanation: '份额必须与价格结构、利润、用户和库存一起分析。' },
      { q: 'sell-in 与 sell-out 的区别是？', options: ['一个是广告一个是销售', '前者渠道进货，后者终端卖给消费者', '前者线上后者线下', '没有区别'], answer: 1, explanation: '两者偏离可反映渠道库存变化。' },
      { q: 'ASP 是？', options: ['平均销售价格', '市场份额', '库存周转', '广告投放成本'], answer: 0, explanation: 'ASP = Average Selling Price。' },
      { q: '产品自我蚕食指什么？', options: ['竞品抢走销量', '同品牌产品彼此抢销量且未明显创造新增价值', '经销商降价', '用户换机周期变长'], answer: 1, explanation: '组合设计需要控制内部重叠。' },
      { q: '品牌定位最准确的理解是？', options: ['一句广告口号', '在目标用户心中长期占据的差异化位置', '产品参数表', '门店数量'], answer: 1, explanation: '口号只是定位表达的一种形式。' },
      { q: '直营渠道的典型优势是？', options: ['完全没有成本', '更强的体验、数据与标准控制', '天然覆盖所有下沉市场', '不需要库存'], answer: 1, explanation: '直营换来更强控制，但覆盖成本也更高。' },
      { q: 'LTV 关注什么？', options: ['单次交易金额', '用户整个生命周期的长期价值', '门店租金', '单款产品的 BOM'], answer: 1, explanation: 'LTV 关注长期收入、利润与连带。' },
      { q: '生态竞争最核心的是？', options: ['设备数量越多越好', '设备与服务之间是否形成真实协同和连续体验', '只看耳机销量', '只看账号数量'], answer: 1, explanation: '生态价值来自协同、连续性和粘性。' },
      { q: '竞争情报中最应该避免的是？', options: ['核验来源', '区分事实与解释', '把未经验证的推测写成事实', '寻找反证'], answer: 2, explanation: '推测必须明确标记为判断或假设。' },
      { q: '情景分析的目的更接近哪项？', options: ['预测唯一正确答案', '围绕关键不确定性准备多个未来及对应动作', '替代所有数据分析', '只写最乐观结果'], answer: 1, explanation: '情景分析用于提升对不确定性的准备度。' },
    ],
  },
};
