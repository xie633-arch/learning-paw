export const domains = [
  {
    id: 'phone',
    icon: '📱',
    name: '手机产品专家',
    description: '手机硬件、参数→体验、后续看图识机与竞品训练。',
    status: 'active',
    statusLabel: '可学习',
    modes: [
      { label: '主动回忆', status: '可用' },
      { label: '参数 → 体验', status: '可用' },
      { label: '看图识机', status: '下一阶段' },
    ],
  },
  {
    id: 'korean',
    icon: '🇰🇷',
    name: '韩语',
    description: '主动表达、听力与跟读优先，最终接入 AI 连续语音对话。',
    status: 'active',
    statusLabel: '可学习',
    modes: [
      { label: '中 → 韩主动表达', status: '可用' },
      { label: '听力 / 跟读', status: '可用' },
      { label: 'AI 情景口语', status: '下一阶段' },
    ],
  },
  {
    id: 'retail',
    icon: '🗺️',
    name: '商圈与零售',
    description: '商圈空间认知、渠道、门店、用户与零售经营案例训练。',
    status: 'planned',
    statusLabel: '规划中',
    modes: [
      { label: '商圈识别', status: '规划中' },
      { label: '零售案例', status: '规划中' },
    ],
  },
  {
    id: 'industry',
    icon: '🌍',
    name: '行业与商业',
    description: '品牌、市场结构、渠道区域、商业模式与战略判断。',
    status: 'planned',
    statusLabel: '规划中',
    modes: [
      { label: '行业知识', status: '规划中' },
      { label: '商业判断', status: '规划中' },
    ],
  },
];

const mobileCards = [
  {
    id: 'hardware-soc-001',
    deck: '手机产品专家',
    category: 'SoC / 性能',
    question: 'SoC 是什么？',
    answer: 'System on Chip，系统级芯片。它把 CPU、GPU、NPU、ISP、Modem 等多类计算与控制模块集成到一个芯片体系中。'
  },
  {
    id: 'hardware-cpu-001',
    deck: '手机产品专家',
    category: 'SoC / 性能',
    question: 'CPU 在手机中的主要作用是什么？',
    answer: '负责通用计算、逻辑执行和大量系统任务，是整机计算的核心之一。'
  },
  {
    id: 'hardware-gpu-001',
    deck: '手机产品专家',
    category: 'SoC / 性能',
    question: 'GPU 在手机中的主要作用是什么？',
    answer: '主要负责图形渲染、游戏画面计算，以及部分适合并行处理的计算任务。'
  },
  {
    id: 'hardware-npu-001',
    deck: '手机产品专家',
    category: 'SoC / 性能',
    question: 'NPU 的主要作用是什么？',
    answer: '面向神经网络与 AI 任务进行高效计算，提升端侧 AI 的速度和能效。'
  },
  {
    id: 'hardware-performance-001',
    deck: '手机产品专家',
    category: 'SoC / 性能',
    question: '为什么跑分高不等于游戏体验一定更好？',
    answer: '游戏体验还受到散热、功耗调度、内存、游戏适配、网络、触控和长期持续性能影响。跑分只能反映部分性能。'
  },
  {
    id: 'hardware-performance-002',
    deck: '手机产品专家',
    category: 'SoC / 性能',
    question: '为什么“持续性能”比短时峰值性能更值得关注？',
    answer: '用户长时间游戏、拍摄或视频处理时，更在意性能能否稳定输出，而不是短时间内达到一次峰值。'
  },
  {
    id: 'hardware-modem-001',
    deck: '手机产品专家',
    category: '通信',
    question: 'Modem 在手机通信链路中主要负责什么？',
    answer: '负责蜂窝通信协议与数字基带处理，把手机的数据需求转化为可以进入射频链路的通信信号。'
  },
  {
    id: 'hardware-rf-001',
    deck: '手机产品专家',
    category: '通信',
    question: '射频前端位于通信链路的什么位置？',
    answer: '位于基带/射频收发器与天线之间，承担放大、滤波、开关等射频信号处理。'
  },
  {
    id: 'hardware-pa-001',
    deck: '手机产品专家',
    category: '通信',
    question: 'PA（Power Amplifier，功率放大器）的主要作用是什么？',
    answer: '放大发射信号，让信号具备足够功率通过天线有效发射出去。'
  },
  {
    id: 'hardware-lna-001',
    deck: '手机产品专家',
    category: '通信',
    question: 'LNA（Low Noise Amplifier，低噪声放大器）的主要作用是什么？',
    answer: '在接收端放大微弱射频信号，同时尽量减少额外噪声。'
  },
  {
    id: 'hardware-antenna-001',
    deck: '手机产品专家',
    category: '通信',
    question: '天线的主要作用是什么？',
    answer: '在电信号与电磁波之间完成转换，实现无线信号的发射和接收。'
  },
  {
    id: 'hardware-network-001',
    deck: '手机产品专家',
    category: '通信',
    question: '“快接入”对用户意味着什么？',
    answer: '手机可以更快完成网络接入或重新连接，减少等待和断网感知。'
  },
  {
    id: 'hardware-network-002',
    deck: '手机产品专家',
    category: '通信',
    question: '“低时延”对用户意味着什么？',
    answer: '游戏、视频通话、远程控制等实时业务响应更快，操作到反馈之间的等待更短。'
  },
  {
    id: 'hardware-network-003',
    deck: '手机产品专家',
    category: '通信',
    question: '“稳切换”对用户意味着什么？',
    answer: '移动过程中从一个小区或频段切换到另一个时，通话和数据业务更不容易中断。'
  },
  {
    id: 'hardware-display-001',
    deck: '手机产品专家',
    category: '屏幕',
    question: '刷新率是什么？',
    answer: '屏幕每秒更新画面的次数，单位 Hz。更高刷新率通常可以提升滚动和动画流畅度。'
  },
  {
    id: 'hardware-display-002',
    deck: '手机产品专家',
    category: '屏幕',
    question: '触控采样率和刷新率有什么区别？',
    answer: '刷新率描述屏幕显示更新速度；触控采样率描述屏幕检测手指输入的频率。'
  },
  {
    id: 'hardware-display-003',
    deck: '手机产品专家',
    category: '屏幕',
    question: 'LTPO 的主要价值是什么？',
    answer: '让屏幕刷新率能够更灵活地动态变化，在流畅体验与功耗之间取得更好的平衡。'
  },
  {
    id: 'hardware-display-004',
    deck: '手机产品专家',
    category: '屏幕',
    question: '为什么不能只看峰值亮度比较两块屏幕？',
    answer: '峰值亮度往往只在特定区域和条件下出现，还需要看全局亮度、色彩、护眼、功耗与实际户外可读性。'
  },
  {
    id: 'hardware-camera-001',
    deck: '手机产品专家',
    category: '影像',
    question: '大底传感器通常能带来什么优势？',
    answer: '在相同条件下具备获得更多进光量的潜力，有利于夜景、动态范围和画质，但最终效果仍取决于光学、算法和调校。'
  },
  {
    id: 'hardware-camera-002',
    deck: '手机产品专家',
    category: '影像',
    question: '可变光圈的核心用户价值是什么？',
    answer: '可以根据场景控制进光量和景深，在低光、多人合影、风景、人像等场景获得更灵活的光学控制。'
  },
  {
    id: 'hardware-camera-003',
    deck: '手机产品专家',
    category: '影像',
    question: '长焦为什么不仅仅是“拍得远”？',
    answer: '长焦还会改变构图和透视关系，适合人像、舞台、建筑、细节和长焦微距等场景。'
  },
  {
    id: 'hardware-camera-004',
    deck: '手机产品专家',
    category: '影像',
    question: 'OIS 光学防抖主要解决什么问题？',
    answer: '通过镜组或传感器补偿手抖，提高低光拍摄和长焦拍摄的稳定性。'
  },
  {
    id: 'hardware-camera-005',
    deck: '手机产品专家',
    category: '影像',
    question: 'ISP 在影像链路中的主要作用是什么？',
    answer: '对相机传感器输出进行图像信号处理，例如降噪、颜色、HDR、曝光等基础图像处理。'
  },
  {
    id: 'hardware-camera-006',
    deck: '手机产品专家',
    category: '影像',
    question: '为什么零售讲影像不能只讲像素？',
    answer: '像素只是一个参数。消费者更关心具体场景中能否拍清、拍稳、拍得好看，以及后续编辑和分享是否方便。'
  },
  {
    id: 'hardware-battery-001',
    deck: '手机产品专家',
    category: '电池 / 快充 / 散热',
    question: 'mAh 代表什么？',
    answer: '毫安时，是电池容量常见单位之一，用于描述可储存电荷量，但不能单独决定真实续航。'
  },
  {
    id: 'hardware-battery-002',
    deck: '手机产品专家',
    category: '电池 / 快充 / 散热',
    question: '为什么电池容量更大不一定续航更长？',
    answer: '续航还受到 SoC 能效、屏幕功耗、系统调度、网络、应用负载和用户使用方式影响。'
  },
  {
    id: 'hardware-charge-001',
    deck: '手机产品专家',
    category: '电池 / 快充 / 散热',
    question: '快充功率高对用户最直接的价值是什么？',
    answer: '缩短补电等待时间，让碎片时间更容易恢复可用续航。'
  },
  {
    id: 'hardware-charge-002',
    deck: '手机产品专家',
    category: '电池 / 快充 / 散热',
    question: '为什么“峰值充电功率”不能代表完整充电体验？',
    answer: '还要看高功率维持时间、温度控制、充电曲线、电池容量和实际充满时间。'
  },
  {
    id: 'hardware-thermal-001',
    deck: '手机产品专家',
    category: '电池 / 快充 / 散热',
    question: '散热能力为什么会直接影响持续性能？',
    answer: '芯片长时间高负载会产生热量。如果热量不能及时导出，系统往往需要降频控温，最终导致性能下降。'
  },
  {
    id: 'hardware-retail-001',
    deck: '手机产品专家',
    category: '参数 → 体验',
    question: '为什么产品专家不能只背参数？',
    answer: '因为消费者购买的是体验和任务完成能力。产品专家需要把参数转化成场景价值、适用人群、购买理由和可演示的体验。'
  }
];

const koreanCards = [
  {
    id: 'ko-production-001',
    deck: '韩语',
    category: '基础表达',
    question: '用韩语说：你好。',
    answer: '안녕하세요.\n常用礼貌问候语。',
    tts: '안녕하세요.',
    promptLabel: '先写下你能想出的韩语',
    placeholder: '不要先看答案，先把韩语写出来……'
  },
  {
    id: 'ko-production-002',
    deck: '韩语',
    category: '基础表达',
    question: '用韩语说：谢谢。',
    answer: '감사합니다.\n正式、常用的“谢谢”。',
    tts: '감사합니다.',
    promptLabel: '先写下你能想出的韩语',
    placeholder: '先主动回忆，再看参考答案……'
  },
  {
    id: 'ko-production-003',
    deck: '韩语',
    category: '基础表达',
    question: '用韩语说：对不起。',
    answer: '죄송합니다.\n较正式、礼貌的道歉表达。',
    tts: '죄송합니다.',
    promptLabel: '先写下你能想出的韩语'
  },
  {
    id: 'ko-production-004',
    deck: '韩语',
    category: '基础表达',
    question: '用韩语说：没关系 / 没事。',
    answer: '괜찮아요.\n也可以根据语境表达“可以”“还好”。',
    tts: '괜찮아요.',
    promptLabel: '先写下你能想出的韩语'
  },
  {
    id: 'ko-production-005',
    deck: '韩语',
    category: '生存韩语',
    question: '用韩语说：请慢一点说。',
    answer: '천천히 말해 주세요.\n천천히 = 慢慢地；말해 주세요 = 请说。',
    tts: '천천히 말해 주세요.',
    promptLabel: '先写下你能想出的韩语'
  },
  {
    id: 'ko-production-006',
    deck: '韩语',
    category: '生存韩语',
    question: '用韩语说：请再说一遍。',
    answer: '다시 말해 주세요.\n다시 = 再、重新。',
    tts: '다시 말해 주세요.',
    promptLabel: '先写下你能想出的韩语'
  },
  {
    id: 'ko-production-007',
    deck: '韩语',
    category: '基础句型',
    question: '用韩语说：这个是什么？',
    answer: '이게 뭐예요?\n이게 = 这个；뭐예요? = 是什么？',
    tts: '이게 뭐예요?',
    promptLabel: '先写下你能想出的韩语'
  },
  {
    id: 'ko-production-008',
    deck: '韩语',
    category: '生存韩语',
    question: '用韩语说：洗手间在哪里？',
    answer: '화장실이 어디예요?\n어디예요? = 在哪里？',
    tts: '화장실이 어디예요?',
    promptLabel: '先写下你能想出的韩语'
  },
  {
    id: 'ko-production-009',
    deck: '韩语',
    category: '主动表达',
    question: '用韩语说：我喜欢咖啡。',
    answer: '저는 커피를 좋아해요.\n좋아해요 = 喜欢。',
    tts: '저는 커피를 좋아해요.',
    promptLabel: '先写下完整韩语句子'
  },
  {
    id: 'ko-production-010',
    deck: '韩语',
    category: '主动表达',
    question: '用韩语说：我想学韩语。',
    answer: '저는 한국어를 배우고 싶어요.\n-고 싶어요 = 想做……。',
    tts: '저는 한국어를 배우고 싶어요.',
    promptLabel: '先写下完整韩语句子'
  },
  {
    id: 'ko-production-011',
    deck: '韩语',
    category: '主动表达',
    question: '用韩语说：今天有点累。',
    answer: '오늘 좀 피곤해요.\n좀 = 有点；피곤해요 = 累。',
    tts: '오늘 좀 피곤해요.',
    promptLabel: '先写下完整韩语句子'
  },
  {
    id: 'ko-production-012',
    deck: '韩语',
    category: '基础句型',
    question: '用韩语说：现在几点？',
    answer: '지금 몇 시예요?\n지금 = 现在；몇 시예요? = 几点？',
    tts: '지금 몇 시예요?',
    promptLabel: '先写下你能想出的韩语'
  },
  {
    id: 'ko-listen-001',
    deck: '韩语',
    category: '听力 / 听写',
    question: '听音频，写下你听到的韩语。',
    answer: '괜찮아요.\n意思：没关系 / 没事 / 可以。',
    audioText: '괜찮아요.',
    tts: '괜찮아요.',
    promptLabel: '写下你听到的韩语',
    placeholder: '可以重复播放，但先不要看答案……'
  },
  {
    id: 'ko-listen-002',
    deck: '韩语',
    category: '听力 / 听写',
    question: '听音频，写下你听到的韩语。',
    answer: '천천히 말해 주세요.\n意思：请慢一点说。',
    audioText: '천천히 말해 주세요.',
    tts: '천천히 말해 주세요.',
    promptLabel: '写下你听到的韩语'
  },
  {
    id: 'ko-listen-003',
    deck: '韩语',
    category: '听力 / 听写',
    question: '听音频，写下你听到的韩语。',
    answer: '오늘 좀 피곤해요.\n意思：今天有点累。',
    audioText: '오늘 좀 피곤해요.',
    tts: '오늘 좀 피곤해요.',
    promptLabel: '写下你听到的韩语'
  },
  {
    id: 'ko-listen-004',
    deck: '韩语',
    category: '听力 / 听写',
    question: '听音频，写下你听到的韩语。',
    answer: '한국어를 배우고 싶어요.\n意思：我想学韩语。',
    audioText: '한국어를 배우고 싶어요.',
    tts: '한국어를 배우고 싶어요.',
    promptLabel: '写下你听到的韩语'
  }
];

export const cards = [
  ...mobileCards.map(card => ({ domain: 'phone', ...card })),
  ...koreanCards.map(card => ({ domain: 'korean', ...card })),
];
