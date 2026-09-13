import { curricula, domainOverrides, extraCards } from './platform-data.js';
import { lessonContentById } from './lesson-content-v05.js';

export const phoneKnowledgeSources = {
  arm: {
    label: 'Arm Learning Paths',
    url: 'https://github.com/ArmDeveloperEcosystem/arm-learning-paths',
    note: 'CPU、缓存、内存延迟、性能分析等公开技术学习资料。',
  },
  androidCpu: {
    label: 'Android Performance Hint API',
    url: 'https://source.android.com/docs/core/perf/performance-hint-api',
    note: 'CPU 动态频率、核心类型、功耗与热约束。',
  },
  androidRender: {
    label: 'Android Slow rendering',
    url: 'https://developer.android.com/topic/performance/vitals/render',
    note: '60 / 90 / 120 fps 与帧时间、掉帧和 jank。',
  },
  androidThermal: {
    label: 'Android Thermal API',
    url: 'https://developer.android.com/games/optimize/adpf/thermal',
    note: '热状态、持续性能与 thermal throttling。',
  },
  androidArchitecture: {
    label: 'Android Platform Architecture',
    url: 'https://source.android.com/docs/core/architecture',
    note: 'App、Framework、Runtime、HAL、Kernel 与硬件的系统分层。',
  },
  qualcomm: {
    label: 'Qualcomm Smartphone Technology',
    url: 'https://www.qualcomm.com/smartphones',
    note: 'CPU、GPU、NPU、ISP、Modem-RF 等移动 SoC 异构计算组成。',
  },
  samsungLpddr: {
    label: 'Samsung LPDDR',
    url: 'https://semiconductor.samsung.com/dram/lpddr/',
    note: '移动低功耗 DRAM、数据速率与功耗效率。',
  },
  samsungUfs: {
    label: 'Samsung UFS 4.0',
    url: 'https://semiconductor.samsung.com/estorage/ufs/ufs-4-0/',
    note: '移动闪存顺序读写、能效与 UFS 基础。',
  },
};

export const phoneKnowledgeTopics = [
  {
    id: 'soc-cpu', icon: '🧠', title: 'SoC 与 CPU', level: '基础 → 进阶',
    summary: '搞懂“几核、多少 GHz、为什么同样八核也可能完全不同”。',
    concepts: [
      { id: 'soc', name: 'SoC', one: 'System on Chip，把 CPU、GPU、NPU、ISP、通信与内存控制等模块整合进同一芯片体系。', why: '手机空间、功耗和散热都受限，高度集成有利于性能/能效/体积协同。', trap: 'SoC 不等于 CPU；“芯片型号”也不能直接推出整机体验。', sources: ['qualcomm'] },
      { id: 'cpu-core-count', name: 'CPU 核心数', one: '核心数表示 CPU 中可并行执行任务的处理核心数量之一。', why: '更多核心可提高并行吞吐，但前提是任务可并行、调度合理且功耗热设计允许。', trap: '8 核不必然比 6 核快；核心架构、频率、IPC、缓存、内存和软件都重要。', sources: ['androidCpu', 'arm'] },
      { id: 'cpu-core-types', name: '大核 / 中核 / 小核', one: '移动 SoC 常用不同性能/能效特性的核心组合来覆盖短时高性能与长期低功耗任务。', why: '前台重任务可能需要高性能核心，后台轻任务更适合高能效核心。', trap: '“一直跑大核”并不代表体验更好，反而可能迅速增加功耗和热负荷。', sources: ['androidCpu'] },
      { id: 'cpu-clock', name: 'CPU 频率 / GHz', one: 'GHz 表示每秒十亿级时钟周期，是 CPU 运行节奏指标之一。', why: '在同一架构与条件下，提高频率通常能增加单位时间执行机会，但同时会增加功耗与发热。', trap: '3.8 GHz 不等于一定比 3.2 GHz 快；不同架构每周期完成的工作不同，而且手机频率会动态变化。', sources: ['androidCpu'] },
      { id: 'cpu-ipc', name: 'IPC', one: 'IPC（Instructions Per Cycle）可理解为 CPU 每个时钟周期能完成多少有效指令工作的指标之一。', why: '性能既与频率有关，也与每周期做多少工作有关，因此不能只比 GHz。', trap: 'IPC 也不是一个脱离工作负载的固定万能分数。', sources: ['arm'] },
      { id: 'dvfs', name: 'DVFS', one: '动态电压频率调节会根据负载、功耗和温度实时改变 CPU/GPU 工作频率。', why: '手机需要在响应速度、续航和温度之间持续平衡。', trap: '规格页的“最高频率”通常不是整段使用过程持续不变的频率。', sources: ['androidCpu'] },
      { id: 'cache', name: 'L1 / L2 / L3 Cache', one: 'Cache 是比主内存更靠近 CPU 的高速小容量存储层，用于降低取数据等待。', why: 'CPU 很快时，数据是否及时送到核心会直接影响实际效率。', trap: '缓存容量越大并不自动等于所有场景都更快，访问模式和架构同样重要。', sources: ['arm'] },
    ],
  },
  {
    id: 'gpu-frame', icon: '🎮', title: 'GPU、FPS 与帧时间', level: '基础 → 场景',
    summary: '从“游戏多少帧”进阶到帧时间、稳帧和持续性能。',
    concepts: [
      { id: 'gpu', name: 'GPU', one: 'GPU 擅长大量并行的图形和计算任务，是游戏渲染、界面合成等体验的重要计算单元。', why: '复杂画面、分辨率和特效都增加 GPU 工作量。', trap: 'GPU 强不等于游戏一定稳，还受散热、调度、游戏适配和帧率目标影响。', sources: ['qualcomm'] },
      { id: 'fps', name: 'FPS', one: 'FPS 是每秒实际生成/显示多少帧画面的速率指标。', why: '更高且稳定的 FPS 通常带来更顺滑的运动和更低的视觉延迟。', trap: '峰值 120 FPS 没有“长期稳定 90 FPS”一定好。', sources: ['androidRender'] },
      { id: 'frame-time', name: 'Frame Time', one: '帧时间是生成一帧允许的时间预算：60fps 约 16ms、90fps 约 11ms、120fps 约 8ms。', why: '真正的卡顿往往是某些帧超时，而不是只看平均 FPS。', trap: '平均帧率相同，两台设备的帧时间波动也可能完全不同。', sources: ['androidRender'] },
      { id: 'frame-pacing', name: 'Frame Pacing / 稳帧', one: 'Frame Pacing 关注帧与帧之间是否均匀，而不是只追求最高帧率。', why: '均匀输出的 60fps 往往比频繁 120→70→110 的波动更舒适。', trap: '“高帧率”与“帧率稳定”是两个问题。', sources: ['androidRender'] },
      { id: 'sustained-performance', name: '持续性能', one: '持续性能描述设备在数分钟乃至更长时间负载下还能维持多少性能。', why: '游戏、导航、长时间拍摄和 AI 等场景不是 30 秒跑分。', trap: '短时峰值不能代替长期体验评价。', sources: ['androidThermal'] },
    ],
  },
  {
    id: 'memory-storage', icon: '💾', title: '内存与存储', level: '基础 → 进阶',
    summary: '区分 RAM、LPDDR、带宽、延迟、UFS 与容量。',
    concepts: [
      { id: 'ram-vs-storage', name: 'RAM vs 存储', one: 'RAM 是运行中程序的工作内存；UFS 等闪存负责长期保存系统、App、照片和文件。', why: '多任务能力和文件加载速度属于不同链路，不能只看“多少 GB”。', trap: '12GB RAM 和 512GB 存储不是同一种容量。', sources: ['samsungLpddr', 'samsungUfs'] },
      { id: 'lpddr', name: 'LPDDR', one: 'LPDDR 是面向移动设备优化的低功耗 DRAM，追求速度、带宽和能效平衡。', why: 'CPU/GPU/NPU 都需要持续从内存读取和写入数据。', trap: 'LPDDR 代际更高不等于整机所有场景同比例变快。', sources: ['samsungLpddr'] },
      { id: 'memory-bandwidth', name: '内存带宽', one: '带宽描述单位时间内能搬运多少数据。', why: '高分辨率图形、AI、影像处理等任务可能需要大量数据吞吐。', trap: '带宽高与访问延迟低不是同一个概念。', sources: ['samsungLpddr', 'arm'] },
      { id: 'memory-latency', name: '内存延迟', one: '延迟描述一次数据请求需要等待多久才能得到响应。', why: '某些随机、小块、强依赖链的任务对延迟非常敏感。', trap: '只看 GB/s 会忽略等待时间。', sources: ['arm'] },
      { id: 'ufs', name: 'UFS', one: 'UFS 是智能手机常见的高性能闪存存储标准，负责系统、App 和文件的长期存储。', why: 'App 安装、加载、文件读写、照片视频保存都会受到存储表现影响。', trap: 'UFS 代际只是基础，控制器、NAND、固件和系统调度也会影响体验。', sources: ['samsungUfs'] },
      { id: 'seq-random-io', name: '顺序 / 随机读写', one: '顺序读写更像连续大文件传输；随机读写更接近大量零散小数据访问。', why: 'App 启动、多任务和数据库访问往往不能只用顺序 MB/s 判断。', trap: '规格页最大顺序速度不是所有操作的真实速度。', sources: ['samsungUfs'] },
    ],
  },
  {
    id: 'display', icon: '🖥️', title: '屏幕与显示', level: '基础 → 产品',
    summary: '刷新率、触控、分辨率、亮度、LTPO 与护眼。',
    concepts: [
      { id: 'refresh-rate', name: '刷新率 Hz', one: '刷新率表示屏幕每秒最多更新画面的次数，例如 60 / 90 / 120Hz。', why: '影响滚动、动画和高帧内容的显示上限。', trap: '120Hz 屏幕不代表游戏一定运行在 120fps。', sources: ['androidRender'] },
      { id: 'touch-sampling', name: '触控采样率', one: '触控采样率描述屏幕检测触摸输入的频率，与显示刷新率不同。', why: '高采样率可缩短输入被检测到的等待，但整体触控延迟还包含系统与应用处理。', trap: '不能把触控采样率直接当成屏幕刷新率。', sources: [] },
      { id: 'resolution-ppi', name: '分辨率 / PPI', one: '分辨率描述像素总量，PPI 描述单位英寸像素密度。', why: '影响文字与图像细腻度，同时也可能增加渲染负载和功耗。', trap: '分辨率更高并不代表所有用户都能明显感知，也不代表色彩和亮度更好。', sources: [] },
      { id: 'brightness', name: '全局 / 峰值亮度', one: '峰值亮度常只在特定窗口和条件下触发，全局亮度更接近日常大面积高亮能力。', why: '户外可读性、HDR 高光和功耗评价需要区分测试条件。', trap: '两个“3000nit”如果口径不同不能直接横比。', sources: [] },
      { id: 'ltpo', name: 'LTPO / 自适应刷新', one: 'LTPO 可帮助 OLED 在更宽范围动态调节刷新率。', why: '静态内容降低刷新率可省电，滑动和动画再提升刷新率。', trap: '支持 LTPO 不代表所有 App、所有时刻都会使用同一刷新策略。', sources: [] },
      { id: 'pwm', name: 'PWM 调光', one: 'PWM 通过快速开关改变感知亮度，是 OLED 常见调光方式之一。', why: '频率、占空比、亮度区间和个体敏感度共同影响视觉舒适性。', trap: '单独一个“高频 PWM”数字不能完整代表护眼体验。', sources: [] },
    ],
  },
  {
    id: 'camera', icon: '📷', title: '影像系统', level: '基础 → 产品',
    summary: '传感器、像素、光圈、焦距、OIS、ISP 与计算摄影。',
    concepts: [
      { id: 'sensor-size', name: '传感器尺寸', one: '更大的感光面积通常提供更高的进光潜力，但画质仍由镜头、曝光、算法和处理链共同决定。', why: '夜景、动态范围、运动抓拍等都会受到信噪比基础影响。', trap: '“大底”不是自动等于所有场景画质更好。', sources: [] },
      { id: 'pixel', name: '像素 / 像素合并', one: '像素数量影响采样分辨率，像素合并可在部分模式下用多个像素共同形成更大的有效采样单元。', why: '高像素可以服务裁切和细节，也会带来更高数据处理量。', trap: '2 亿像素不等于一定比 5000 万像素拍得好。', sources: [] },
      { id: 'aperture', name: '光圈', one: '光圈影响进光量和景深；数值、镜头结构和焦段需结合理解。', why: '低光、运动和景深控制都与光圈有关。', trap: '只比较 f 数字容易忽略传感器尺寸、焦距和算法。', sources: [] },
      { id: 'focal-length', name: '焦距 / 等效焦距', one: '焦距决定视角和构图关系，广角、主摄和长焦对应不同取景方式。', why: '长焦价值不仅是“放大”，还包括透视、人物和远景构图。', trap: '数字变焦倍率不能等同于独立光学焦段质量。', sources: [] },
      { id: 'ois', name: 'OIS', one: '光学防抖通过移动镜组或传感器补偿手抖。', why: '长焦和低光时尤其有价值，可帮助降低模糊和提升曝光稳定性。', trap: 'OIS 不能冻结被摄物体自身运动。', sources: [] },
      { id: 'isp-computational', name: 'ISP / 计算摄影', one: 'ISP 和算法负责曝光、降噪、HDR、色彩、融合等大量图像处理。', why: '今天的手机影像是光学硬件与计算链路共同结果。', trap: '镜头规格相似的手机也可能有完全不同成片。', sources: ['qualcomm'] },
    ],
  },
  {
    id: 'connectivity', icon: '📡', title: '通信系统', level: '基础 → 链路',
    summary: 'Modem、RF、PA/LNA、天线、MIMO、载波聚合与时延。',
    concepts: [
      { id: 'modem', name: 'Modem / 基带', one: '负责蜂窝协议和数字通信处理，是手机接入移动网络的核心链路之一。', why: '决定设备支持的制式、频段能力和很多网络处理上限。', trap: '“Modem 强”不代表弱网体验只由 Modem 决定。', sources: ['qualcomm'] },
      { id: 'rf-front-end', name: '射频前端', one: '位于收发器与天线之间，包含功放、滤波、开关、低噪放等器件。', why: '不同频段的发射、接收和抗干扰都依赖射频链路。', trap: '通信不是“基带 + 一根天线”这么简单。', sources: ['qualcomm'] },
      { id: 'pa-lna', name: 'PA / LNA', one: 'PA 负责放大发射信号，LNA 负责低噪声放大接收到的微弱信号。', why: '一发一收分别影响上行覆盖和弱信号接收能力。', trap: '功率越大不是无限越好，还受法规、功耗和热约束。', sources: [] },
      { id: 'antenna', name: '天线系统', one: '天线完成电信号与电磁波转换，实际手机通常是多天线复杂布局。', why: '握持、机身结构、频段和天线调谐都可能影响网络表现。', trap: '单看“几根天线”不能判断通信质量。', sources: [] },
      { id: 'mimo', name: 'MIMO', one: '多输入多输出利用多路天线和空间通道提升吞吐、可靠性或覆盖能力。', why: '现代 4G/5G/Wi-Fi 都广泛依赖多天线。', trap: 'MIMO 理论能力是否实现还取决于网络、频段和现场环境。', sources: [] },
      { id: 'carrier-aggregation', name: '载波聚合', one: '把多个载波资源组合使用以提高可用带宽和吞吐能力。', why: '手机和网络共同支持时可显著提升峰值速率。', trap: '实验室峰值速率不代表任何地点都能达到。', sources: [] },
    ],
  },
  {
    id: 'battery-thermal', icon: '🔋', title: '电池、充电与散热', level: '基础 → 持续体验',
    summary: '容量只是起点，还要理解功率、充电曲线、热设计和降频。',
    concepts: [
      { id: 'mah-wh', name: 'mAh 与 Wh', one: 'mAh 描述电荷容量，Wh 更直接表示能量；比较不同电压体系时 Wh 更有物理意义。', why: '真实续航最终取决于可用能量与整机功耗。', trap: '电池 mAh 更大不等于续航一定更长。', sources: [] },
      { id: 'power-watt', name: '功率 W', one: '功率描述单位时间能量转换速度，充电“多少瓦”和芯片“多少瓦功耗”都属于功率。', why: '功率越高，补能或热量产生速度都可能更高。', trap: '峰值充电功率不是整段充电过程恒定功率。', sources: [] },
      { id: 'charge-curve', name: '充电曲线', one: '实际充电功率会随电量、温度、电池状态和协议动态变化。', why: '完整充电体验要看前段补电速度、持续时间、温控和充满时间。', trap: '只比“100W vs 66W”可能严重简化体验。', sources: [] },
      { id: 'vc-thermal', name: 'VC / 热扩散', one: 'VC 等热设计帮助把热点热量扩散到更大面积，再通过机身与环境散出。', why: '更好的热路径有助于维持长期性能和控制局部烫感。', trap: 'VC 面积更大不自动等于温度一定更低，材料、布局和控制策略都重要。', sources: ['androidThermal'] },
      { id: 'thermal-throttling', name: 'Thermal Throttling', one: '当温度接近限制时，系统会降低 CPU/GPU/内存等负载或频率来保护设备。', why: '这是“跑一会儿变慢”的常见机制基础。', trap: '降频并不一定说明设计失败，它也是安全与可持续性的必要控制。', sources: ['androidThermal'] },
      { id: 'perf-watt', name: 'Performance per Watt', one: '每瓦性能关注用同样能量完成多少计算，而不是只追求最大峰值。', why: '手机电池和散热空间有限，能效往往决定长期体验。', trap: '高峰值但低能效可能很快受到温度和续航约束。', sources: ['androidCpu', 'arm'] },
    ],
  },
  {
    id: 'sensor-interaction', icon: '🧭', title: '传感器与交互', level: '补全整机',
    summary: '理解那些不显眼、却一直参与体验的硬件。',
    concepts: [
      { id: 'accelerometer', name: '加速度计', one: '检测设备沿各轴的加速度变化，可用于姿态、运动和交互判断。', why: '旋转、计步、游戏控制等都会使用它。', trap: '它和陀螺仪功能相关但不是同一种传感器。', sources: [] },
      { id: 'gyroscope', name: '陀螺仪', one: '检测角速度，适合感知设备旋转。', why: '相机防抖、游戏控制、AR 等场景常依赖它。', trap: '单个传感器通常需要和其他传感器融合。', sources: [] },
      { id: 'gnss', name: 'GNSS', one: '通过卫星导航系统进行定位，GPS 只是其中一个系统名称。', why: '导航、运动轨迹、打车和位置服务依赖它。', trap: '定位体验还受天线、城市峡谷、网络辅助和算法影响。', sources: [] },
      { id: 'haptics', name: '线性马达 / Haptics', one: '触觉马达把系统事件转成可感知振动反馈。', why: '键盘、手势、游戏和系统操作的“质感”部分来自触觉调校。', trap: '马达尺寸只是基础，波形和系统调校同样重要。', sources: [] },
      { id: 'audio-chain', name: '音频链路', one: '扬声器、麦克风、Codec、放大器、算法共同决定录放音体验。', why: '通话、视频、音乐、游戏和语音助手都依赖完整音频系统。', trap: '“双扬声器”并不自动等于音质优秀。', sources: [] },
    ],
  },
  {
    id: 'foldable', icon: '📖', title: '折叠结构', level: '形态 → 工程',
    summary: '从“能折”进阶到铰链、屏幕、可靠性、重量和软件协同。',
    concepts: [
      { id: 'hinge', name: '铰链', one: '铰链控制折叠轨迹、支撑、悬停和机身受力，是折叠机机械系统核心。', why: '影响厚度、手感、可靠性和屏幕折叠形态。', trap: '铰链零件少或多不能单独说明可靠性。', sources: [] },
      { id: 'fold-radius', name: '弯折半径', one: '柔性屏在折叠时需要受控弯曲路径，弯折半径会影响应力和结构空间。', why: '与折痕、厚度、屏幕寿命和铰链设计存在关联。', trap: '折痕是系统工程结果，不能只归因于屏幕材料。', sources: [] },
      { id: 'utg-film', name: '柔性屏保护层', one: '折叠屏需要兼顾可弯折与表面保护，通常采用柔性盖板/薄玻璃与多层结构。', why: '耐刮、触感、折痕和抗冲击之间需要取舍。', trap: '折叠内屏的表面材料与传统直板玻璃不能按同一方式理解。', sources: [] },
      { id: 'weight-space', name: '内部空间与重量', one: '铰链和双屏结构占用空间，使电池、散热、相机和重量设计更难平衡。', why: '同一芯片在折叠和直板机上可能采取不同性能/散热策略。', trap: '折叠机不能只按展开后的屏幕大小评价。', sources: [] },
      { id: 'fold-software', name: '折叠软件适配', one: '大屏、多窗口、内外屏接续和布局重排决定形态是否真正转化成效率。', why: '硬件展开只是前提，软件适配决定新增屏幕面积有没有价值。', trap: '“屏幕更大”不自动等于生产力更高。', sources: ['androidArchitecture'] },
    ],
  },
  {
    id: 'os-hardware', icon: '⚙️', title: '操作系统 × 硬件', level: '系统理解',
    summary: '回答“操作系统到底怎么调动 CPU、GPU、内存和屏幕”。',
    concepts: [
      { id: 'kernel', name: 'Kernel', one: '内核负责进程、线程、内存、设备驱动、调度等底层资源管理。', why: 'App 不会直接随意控制硬件，而是通过系统抽象和内核完成资源使用。', trap: '操作系统不只是“桌面和设置界面”。', sources: ['androidArchitecture'] },
      { id: 'hal', name: 'HAL', one: 'Hardware Abstraction Layer 用统一接口隔离上层系统与不同硬件实现差异。', why: '系统服务可以通过稳定接口使用相机、音频、传感器等硬件能力。', trap: 'HAL 不是硬件本身，而是软硬件之间的重要抽象层。', sources: ['androidArchitecture'] },
      { id: 'runtime', name: 'Runtime', one: '应用运行时负责执行应用代码并提供内存管理、编译/解释等机制。', why: '同一硬件上，不同运行时和编译优化也会改变应用表现。', trap: 'App 卡顿不一定意味着 CPU 不够强。', sources: ['androidArchitecture'] },
      { id: 'scheduler', name: 'Scheduler', one: '调度器决定哪些线程什么时候运行、在哪类 CPU 核心上运行。', why: '大小核、动态频率和多任务都离不开系统调度。', trap: '用户看到的是整机调度结果，不是规格页某个核心单独工作。', sources: ['androidCpu'] },
      { id: 'render-pipeline', name: '界面渲染链路', one: '一次交互要经过输入、应用逻辑、UI 构建、渲染与显示等多环节。', why: '任何环节超出帧预算都可能造成掉帧或延迟。', trap: '“掉帧 = GPU 不行”是过度简化。', sources: ['androidRender'] },
      { id: 'software-optimization', name: '软件适配 / 优化', one: '应用是否正确利用线程、图形接口、内存和系统 API，会显著影响同一硬件的实际体验。', why: '产品体验是硬件能力和软件实现共同结果。', trap: '参数领先并不能保证所有第三方 App 都自动获得同比例提升。', sources: ['androidArchitecture'] },
    ],
  },
];

export const phoneKnowledgeCards = [
  ['pk-cpu-core-count', 'SoC / CPU', '为什么不能用“8 核一定比 6 核快”判断手机性能？', '核心数量只表示并行资源的一部分。核心架构、大小核组合、频率、IPC、缓存、内存、系统调度、功耗和散热都会影响实际性能。', 'cpu-core-count'],
  ['pk-cpu-ghz', 'SoC / CPU', 'CPU 的 3.8 GHz 到底表示什么？为什么它不能直接等于“更快”？', '3.8 GHz 表示每秒约 38 亿个时钟周期。性能还取决于每周期完成多少工作（IPC）、核心架构、缓存、内存、调度和热约束，因此不同 CPU 不能只比 GHz。', 'cpu-clock'],
  ['pk-cpu-ipc', 'SoC / CPU', 'IPC 和 GHz 分别回答什么问题？', 'GHz 更接近“每秒有多少时钟周期”，IPC 更接近“每个周期能完成多少有效工作”。两者共同影响 CPU 吞吐，但还不是完整整机性能。', 'cpu-ipc'],
  ['pk-dvfs', 'SoC / CPU', '为什么手机 CPU 不会一直运行在规格页最高频率？', '手机会通过 DVFS 根据负载、温度和功耗动态调整频率与电压。最高频率通常是可达到的峰值状态，不是持续固定状态。', 'dvfs'],
  ['pk-cache', 'SoC / CPU', 'CPU 已经很快了，为什么还需要 L1/L2/L3 Cache？', 'CPU 计算速度远高于从主内存取数据的速度。Cache 把常用数据放在更靠近 CPU 的高速层，减少等待，缓解“算得快但数据送不过来”的问题。', 'cache'],
  ['pk-frame-time', 'GPU / 显示', '60 / 90 / 120fps 分别大约有多少帧时间预算？', '60fps 约 16ms/帧，90fps 约 11ms/帧，120fps 约 8ms/帧。帧率越高，每帧必须更快完成，CPU/GPU 与软件链路压力也更高。', 'frame-time'],
  ['pk-refresh-fps', 'GPU / 显示', '120Hz 屏幕为什么不等于游戏一定有 120fps？', 'Hz 是屏幕刷新上限，FPS 是应用/游戏实际生成帧的速度。还要看游戏是否支持、CPU/GPU 能否持续输出、系统策略和温度。', 'refresh-rate'],
  ['pk-ram-storage', '内存 / 存储', '12GB RAM 和 512GB 存储为什么不能放在一起比较？', 'RAM 是程序运行时的工作内存，512GB 通常是 UFS 等长期存储容量。一个影响运行中的数据工作区，一个负责长期保存系统、App 和文件。', 'ram-vs-storage'],
  ['pk-bandwidth-latency', '内存 / 存储', '内存带宽和内存延迟有什么区别？', '带宽描述单位时间能搬多少数据，延迟描述一次请求要等多久。大吞吐任务更看重带宽，依赖链和随机访问也会非常在意延迟。', 'memory-bandwidth'],
  ['pk-ufs-io', '内存 / 存储', '为什么 UFS 的最大顺序读写速度不能代表所有 App 启动体验？', 'App 启动会包含大量随机读取、小文件访问、CPU 解码、系统调度等环节。顺序 MB/s 主要代表连续大块数据传输能力。', 'seq-random-io'],
  ['pk-thermal', '电池 / 散热', 'Thermal throttling 为什么会让手机“玩一会儿后变慢”？', '持续高负载会累积热量；当设备接近温度限制，系统会降低 CPU/GPU 等负载或频率，以控制温度和保证安全，因此持续性能可能下降。', 'thermal-throttling'],
  ['pk-soc', 'SoC / CPU', '为什么手机 SoC 里同时需要 CPU、GPU、NPU、ISP 和 Modem？', '不同任务的计算特点不同。CPU 擅长通用和逻辑任务，GPU 擅长并行图形，NPU面向AI，ISP处理影像，Modem处理通信。异构分工能在移动设备的功耗和空间限制下提高效率。', 'soc'],
  ['pk-os-scheduler', '系统 / 硬件', '操作系统在“CPU 性能”里到底做了什么？', '系统调度器会决定线程何时运行、运行在哪类核心上，并结合负载、功耗和温度动态分配资源。用户感受到的是硬件与系统调度共同结果。', 'scheduler'],
  ['pk-render', '系统 / 硬件', '页面卡顿为什么不一定是 GPU 不够强？', '一次界面更新涉及输入、应用逻辑、UI 构建、线程调度、GPU 渲染和屏幕显示。任何环节超出帧时间预算都可能出现掉帧。', 'render-pipeline'],
  ['pk-perf-watt', '电池 / 散热', '为什么手机芯片评价要关注 Performance per Watt？', '手机靠电池供电且散热空间有限。每瓦性能越高，越有机会在相同功耗/热量下提供更强或更持久的体验；只追求峰值可能很快遇到温度和续航限制。', 'perf-watt'],
].map(([id, category, question, answer, conceptId]) => ({
  id,
  domain: 'phone',
  deck: '手机产品专家',
  category,
  question,
  answer,
  concept_id: conceptId,
  skill: 'explain',
  unlockAfterLesson: 'phone-portfolio',
  source: 'phone-knowledge-v09',
}));

const existingIds = new Set(extraCards.map(card => card.id));
phoneKnowledgeCards.forEach(card => {
  if (!existingIds.has(card.id)) extraCards.push(card);
});

const phoneModes = [
  { label: '今日课程 + 主动回忆', status: '可用' },
  { label: '手机技术知识库', status: '可用' },
  { label: '参数 → 机制 → 体验', status: '可用' },
  { label: '看图识机 / 产品 Variant', status: '可用' },
  { label: '正式测试', status: '可用' },
];
domainOverrides.phone = { ...(domainOverrides.phone || {}), modes: phoneModes };

const phoneTech = curricula.phone?.steps?.find(step => step.id === 'phone-tech');
if (phoneTech) {
  phoneTech.summary = '进入技术知识库：SoC/CPU、GPU、内存存储、屏幕、影像、通信、电池热管理、传感器、折叠与 OS×硬件。';
  phoneTech.keyPoints = ['先懂 Core / GHz / IPC / Cache 等基础', '参数 → 技术机制 → 用户体验', '知识库很大，但每天只引入少量概念进入 FSRS'];
  phoneTech.task = '先在“路线 → 手机技术知识库”中任选一个专题，能解释 3 个概念，再完成今日训练。';
  phoneTech.output = '技术概念 × 用户体验 × Retail GTM 三列表';
}

lessonContentById['phone-tech'] = {
  intro: '这一课从 V0.9 开始不再是一篇“六类硬件概览”，而是进入手机技术知识库。目标不是把所有工程细节一次背完，而是建立一个可以不断扩展的 Concept Tree：先弄清参数是什么，再理解机制、边界和真实用户感知。知识库可以有几十个概念，但每天只让少量新概念进入训练。',
  sections: [
    {
      title: '第一层：先把手机看成一套系统',
      bullets: [
        '计算：SoC → CPU / GPU / NPU / ISP / Modem，各自处理不同任务。',
        '数据：Cache → LPDDR 内存 → UFS 存储，决定数据怎样被快速供给和保存。',
        '显示：CPU/GPU 生成内容后，还要经过渲染链路和屏幕刷新；120Hz 不等于 120fps。',
        '能量与热：电池提供能量，芯片消耗功率并产生热量，DVFS 与 thermal throttling 决定能否长期维持。',
        '系统：Kernel、HAL、Runtime、Scheduler 把 App 请求转成对硬件资源的实际调度。',
      ],
    },
    {
      title: '第二层：把“参数比较”升级成“机制比较”',
      bullets: [
        '核心数：问的是并行资源之一，不是“核心越多一定越快”。',
        'GHz：问的是时钟节奏，不包含每周期完成多少工作，也不代表能长期维持峰值。',
        'IPC / Cache / 内存：解释为什么同频率 CPU、同核心数产品也可能表现不同。',
        'FPS / Frame Time：解释为什么平均帧率高仍然可能卡，以及 120fps 对每帧只有约 8ms 时间预算。',
        'LPDDR / UFS：分别理解运行内存和长期存储，不再把“12+512”只当两个容量数字。',
      ],
    },
    {
      title: '第三层：知识库与学习路线分离',
      paragraphs: [
        '知识库负责“系统里有哪些知识，可以随时查”；每日计划负责“今天真正学哪几个”。V0.9 首批知识库覆盖 10 个专题、50+ 个 Concept，但不会一次把所有 Concept 都塞进今日复习。',
        '当产品组合阶段完成后，只引入一小组 CPU / 帧时间 / 内存 / 热管理 / OS 调度基础卡进入训练；后续知识再随课程逐步引入。这样知识库可以持续变大，学习负担仍然受控。',
      ],
    },
    {
      title: '推荐第一轮学习顺序',
      bullets: ['SoC 是什么', 'CPU 核心数与核心类型', 'GHz 与 IPC', 'DVFS 与 Cache', 'FPS 与 Frame Time', 'RAM / LPDDR / UFS', 'Thermal throttling', 'Scheduler 与渲染链路'],
    },
  ],
  checkpoint: '随便看到一个手机参数时，试着回答四句话：它是什么？它通过什么机制影响能力？用户在什么场景能感知？这个数字不能证明什么？如果四句都能说清，才算真正理解。',
};

window.__PHONE_KNOWLEDGE_V09__ = {
  version: '0.9.0',
  topics: phoneKnowledgeTopics.length,
  concepts: phoneKnowledgeTopics.reduce((sum, topic) => sum + topic.concepts.length, 0),
  starterCards: phoneKnowledgeCards.length,
};
