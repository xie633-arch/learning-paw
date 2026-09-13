const VERIFIED_DATE = '2026-09-13';

const cases = [
  {
    id: 'refresh-120hz',
    title: '同样 120 Hz，屏幕体验就一样吗？',
    concepts: ['刷新率', 'LTPO', 'Frame Time', 'FPS'],
    prompt: '下面 4 台手机都涉及 120 Hz。作为产品专家，哪一个判断最准确？',
    products: [
      {
        name: 'HUAWEI Mate 80',
        facts: ['OLED', '1–120 Hz LTPO 自适应刷新率', '1440 Hz 高频 PWM 调光', '300 Hz 触控采样率'],
        source: 'https://consumer.huawei.com/cn/phones/mate80/specs/',
      },
      {
        name: 'HUAWEI Pura 90',
        facts: ['OLED', '1–120 Hz LTPO 自适应刷新率', '300 Hz 触控采样率'],
        source: 'https://consumer.huawei.com/cn/phones/pura90/specs/',
      },
      {
        name: 'HUAWEI nova 16',
        facts: ['OLED', '支持 120 Hz 刷新率', '2160 Hz 高频 PWM 调光', '300 Hz 触控采样率'],
        source: 'https://consumer.huawei.com/cn/phones/nova16/specs/',
      },
      {
        name: 'iPhone 18 Pro',
        facts: ['OLED', 'ProMotion 自适应刷新率', '最高 120 Hz'],
        source: 'https://www.apple.com.cn/iphone-18-pro/specs/',
      },
    ],
    options: [
      '都写 120 Hz，所以流畅度、功耗和游戏体验基本一样。',
      '120 Hz 只说明最高刷新能力之一；还要看自适应策略、App 实际 FPS、帧时间稳定性、亮度/调光、触控与系统调度。',
      '只要是 LTPO，就一定比所有非 LTPO 屏幕更流畅。',
    ],
    correct: 1,
    explanation: '正确。刷新率是显示链路的一部分。120 Hz 屏幕并不保证 App 一定产生 120 fps；即使平均 fps 相近，帧时间波动也可能导致完全不同的顺滑感。LTPO 的关键价值之一是更灵活地在刷新率与功耗之间平衡，而不是“自动等于更快”。',
    fact: '官方可确认：Mate 80 与 Pura 90 规格页明确写 1–120 Hz LTPO；nova 16 写支持 120 Hz；iPhone 18 Pro 写 ProMotion 最高 120 Hz。',
    cannot: '不能仅凭“120 Hz”推出四台手机的真实游戏帧率、功耗、触控延迟或整体屏幕体验排名。',
    gtm: '门店表达不要停在“120 Hz 很流畅”，而要结合滚动、视频、游戏和户外显示 Demo，让用户看到具体场景差异。',
  },
  {
    id: 'cpu-cores-ghz',
    title: '“几核 / GHz”为什么不能直接排性能？',
    concepts: ['CPU 核心数', '大核 / 小核', 'GHz', 'IPC', 'DVFS'],
    prompt: 'Mate 80 官网只公开“麒麟 9020”；iPhone 18 Pro 官网公开 A20 Pro 为 6 核 CPU（2 个超级核心 + 4 个能效核心），但没有公开 GHz。此时最专业的做法是什么？',
    products: [
      {
        name: 'HUAWEI Mate 80',
        facts: ['处理器：麒麟 9020', '官方规格页未列 CPU 核心数与 GHz'],
        source: 'https://consumer.huawei.com/cn/phones/mate80/specs/',
      },
      {
        name: 'iPhone 18 Pro',
        facts: ['A20 Pro', '6 核 CPU', '2 个超级核心 + 4 个能效核心', '官方规格页未列 GHz'],
        source: 'https://www.apple.com.cn/iphone-18-pro/specs/',
      },
    ],
    options: [
      'iPhone 只有 6 核，所以一定比任何 8 核手机慢。',
      '去第三方论坛找一个 GHz 数字，填进官网没公开的空白，再直接比较。',
      '把“官方公开事实”和“未公开信息”分开；性能判断继续看架构、IPC、频率行为、缓存、内存、功耗、散热、系统与真实负载。',
    ],
    correct: 2,
    explanation: '正确。核心数只是并行资源数量之一，GHz 只是时钟节奏之一。不同架构每周期完成的工作不同，移动 CPU 还会根据负载、温度和功耗动态改变频率与核心调度。最重要的是：官方没公开的数据，不要为了填表而猜。',
    fact: '官方可确认：iPhone 18 Pro 的 A20 Pro 是 6 核 CPU；Mate 80 规格页公开麒麟 9020，但未给出核心数/频率。',
    cannot: '不能从“6 核 vs 未公开”得出性能胜负，也不能把网络传闻自动升级为官方规格。',
    gtm: '面对消费者不要用“几核 × GHz”制造伪精确。更应该回到 App 响应、多任务、游戏稳帧、影像处理和长时间性能。',
  },
  {
    id: 'battery-capacity',
    title: '电池越大，续航就一定越长吗？',
    concepts: ['mAh', '功耗', '快充', '充电曲线', 'Performance per Watt'],
    prompt: '已知 nova 16 为 7000 mAh / 100 W，Pura 90 为 6500 mAh / 100 W，Mate 80 为 5750 mAh。哪个结论最合理？',
    products: [
      {
        name: 'HUAWEI nova 16',
        facts: ['7000 mAh 典型容量', '最大 100 W 有线超级快充'],
        source: 'https://consumer.huawei.com/cn/phones/nova16/specs/',
      },
      {
        name: 'HUAWEI Pura 90',
        facts: ['6500 mAh 典型容量', '最大 100 W 有线超级快充', '最大 50 W 无线超级快充'],
        source: 'https://consumer.huawei.com/cn/phones/pura90/specs/',
      },
      {
        name: 'HUAWEI Mate 80',
        facts: ['5750 mAh 典型容量'],
        source: 'https://consumer.huawei.com/cn/phones/mate80/specs/',
      },
    ],
    options: [
      'nova 16 电池最大，所以任何使用场景续航一定第一。',
      'mAh 是重要基础，但真实续航还取决于 SoC 能效、屏幕、网络、系统调度、使用负载等；100 W 也只是最大功率，不代表整段充电曲线相同。',
      '三台手机只要都是鸿蒙系统，续航差异主要就只剩电池容量。',
    ],
    correct: 1,
    explanation: '正确。容量决定“能装多少电”的基础，但真实续航是整机功耗系统的结果。快充也要区分峰值功率、维持时间、温度控制和完整充电曲线。',
    fact: '官方规格页可确认 nova 16 7000 mAh / 100 W、Pura 90 6500 mAh / 100 W、Mate 80 5750 mAh。',
    cannot: '不能仅凭 mAh 排真实续航，也不能仅凭“100 W”判断谁从 0 到 100% 更快。',
    gtm: '零售中先问用户一天的真实场景，再把容量、补电速度和整机能效组合起来表达。',
  },
  {
    id: 'camera-pixels',
    title: '长焦 5000 万像素，就一定比 1200 万更强吗？',
    concepts: ['像素', '焦距', '光圈', 'OIS', '计算摄影'],
    prompt: 'Mate 80 长焦为 1200 万像素、约 125 mm、OIS；Pura 90 长焦为 5000 万像素、约 88 mm、OIS。最合理的判断是什么？',
    products: [
      {
        name: 'HUAWEI Mate 80',
        facts: ['1200 万像素潜望式长焦', 'F3.4', 'OIS', '约 125 mm', '约 5.5 倍光学变焦'],
        source: 'https://consumer.huawei.com/cn/phones/mate80/specs/',
      },
      {
        name: 'HUAWEI Pura 90',
        facts: ['5000 万像素潜望长焦', 'F2.2', 'OIS', '约 88 mm', '约 3.7 倍光学变焦'],
        source: 'https://consumer.huawei.com/cn/phones/pura90/specs/',
      },
    ],
    options: [
      '5000 万一定胜过 1200 万，所以 Pura 90 所有长焦场景都更好。',
      '只能说明两套长焦路线不同；还要看传感器、单像素/裁切、镜头、焦距、光圈、OIS、算法、对焦和实际场景。',
      '焦距越长就一定画质越好。',
    ],
    correct: 1,
    explanation: '正确。像素数不是画质结论。125 mm 与 88 mm 首先就对应不同构图与拍摄距离；光圈、传感器、稳定、算法与实际光线还会继续影响最终结果。',
    fact: '官方规格页可确认两台手机的像素、光圈、OIS 与近似焦段。',
    cannot: '不能从“5000 万 vs 1200 万”直接推出长焦画质排名，也不能从“125 mm 更长”推出全场景更优。',
    gtm: '真实 Demo 应按舞台、人像、建筑、远景、长焦微距等场景验证，而不是只给用户看像素数字。',
  },
  {
    id: 'thermal-sustained',
    title: '为什么 VC 均热板属于“性能课”？',
    concepts: ['VC 均热板', 'Thermal Throttling', '持续性能', 'Frame Pacing'],
    prompt: 'nova 16 官方强调 VC 中框与“游戏长效稳帧”；iPhone 18 Pro 官方强调新一代 VC 均热板与持续性能。它们共同说明什么？',
    products: [
      {
        name: 'HUAWEI nova 16',
        facts: ['超薄一体化 VC 中框', '麒麟 9010S + 方舟引擎', '官方表达：游戏长效稳帧'],
        source: 'https://consumer.huawei.com/cn/phones/nova16/',
      },
      {
        name: 'iPhone 18 Pro',
        facts: ['A20 Pro', '新一代 VC 均热板', 'Apple 宣称相较上一代持续性能最高提升 40%（其自有测试口径）'],
        source: 'https://www.apple.com.cn/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/',
      },
    ],
    options: [
      '散热只影响手机摸起来热不热，与性能无关。',
      '散热决定芯片能否更长时间维持功率与频率，是持续性能的一部分；但不同品牌的提升百分比不能直接横比。',
      '有 VC 均热板就不会降频。',
    ],
    correct: 1,
    explanation: '正确。手机受体积、表面温度和电池约束，高负载下如果热量无法及时导出，系统通常需要限制功率/频率。VC 是热管理的一部分，不是“永不降频”的保证。厂商百分比还必须看各自基线和测试条件。',
    fact: '两家官方资料都把 VC 与高负载/持续性能放在同一条产品叙事中。',
    cannot: '不能把 Apple 的“最高 40%”和华为某个百分比直接做跨品牌排名，除非测试负载、环境、基线和方法一致。',
    gtm: '对重度游戏/长时间拍摄用户，应该讲“长时间还能不能稳”，而不是只讲一次峰值跑分。',
  },
];

let activeIndex = 0;
let answered = new Map();

function ensureStyles() {
  if (document.querySelector('#phoneProductLabV091Styles')) return;
  const style = document.createElement('style');
  style.id = 'phoneProductLabV091Styles';
  style.textContent = `
    .pl-shell { margin-top:18px; padding-top:18px; border-top:1px solid rgba(23,32,51,.08); }
    .pl-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
    .pl-head h3 { margin:3px 0 5px; font-size:21px; }
    .pl-count { flex:0 0 auto; padding:7px 10px; border-radius:999px; background:var(--lp-accent-soft,#edf3f8); color:var(--lp-accent-strong,#27445f); font-size:11px; font-weight:800; }
    .pl-tabs { display:flex; gap:7px; overflow-x:auto; padding:3px 1px 8px; scrollbar-width:none; }
    .pl-tabs::-webkit-scrollbar { display:none; }
    .pl-tab { flex:0 0 auto; min-height:34px; padding:7px 10px; border-radius:11px; background:#f4f6f8; color:#657080; font-size:11px; box-shadow:none; }
    .pl-tab.active { background:var(--lp-accent,#4f6f8f); color:#fff; }
    .pl-case { border:1px solid rgba(23,32,51,.07); border-radius:18px; padding:16px; background:#fff; }
    .pl-case h4 { margin:0 0 7px; font-size:19px; }
    .pl-concepts { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
    .pl-concept { padding:5px 8px; border-radius:999px; background:var(--lp-accent-soft,#edf3f8); color:var(--lp-accent-strong,#27445f); font-size:10px; font-weight:750; }
    .pl-prompt { margin:8px 0 14px; line-height:1.7; color:#344054; font-weight:700; }
    .pl-products { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; margin:0 0 14px; }
    .pl-product { border:1px solid #edf0f3; border-radius:14px; padding:11px; background:#fafbfc; }
    .pl-product strong { display:block; font-size:12px; margin-bottom:5px; }
    .pl-product ul { margin:0; padding-left:16px; }
    .pl-product li { margin:4px 0; color:#667085; font-size:11px; line-height:1.5; }
    .pl-product a { display:inline-block; margin-top:6px; color:var(--lp-accent-strong,#27445f); font-size:10px; font-weight:750; text-decoration:none; }
    .pl-options { display:grid; gap:8px; }
    .pl-option { width:100%; text-align:left; padding:11px 12px; min-height:44px; border-radius:13px; background:#f5f7f9; color:#344054; box-shadow:none; font-size:12px; line-height:1.55; }
    .pl-option.correct { background:#eef8f1; color:#28543a; outline:1px solid #b8dec4; }
    .pl-option.wrong { background:#fff0f0; color:#9b3434; outline:1px solid #efc3c3; }
    .pl-option:disabled { opacity:1; cursor:default; }
    .pl-feedback { display:none; margin-top:13px; padding:13px; border-radius:14px; background:#f7f8fa; }
    .pl-feedback.show { display:grid; gap:9px; }
    .pl-feedback p { margin:0; color:#5d6675; font-size:12px; line-height:1.65; }
    .pl-feedback strong { color:#344054; }
    .pl-feedback .pl-result { font-size:13px; font-weight:850; color:var(--lp-accent-strong,#27445f); }
    .pl-next { margin-top:12px; width:100%; }
    .pl-foot { margin-top:10px; color:#87909e; font-size:10px; line-height:1.6; }
    @media (max-width:720px) { .pl-products { grid-template-columns:1fr; } .pl-case { padding:14px; } }
    @media (prefers-color-scheme:dark) {
      .pl-shell { border-color:#303640; }
      .pl-tab { background:#242a32; color:#aeb7c5; }
      .pl-case { background:#181d24; border-color:#303640; }
      .pl-prompt,.pl-feedback strong { color:#e8ebef; }
      .pl-product { background:#20262e; border-color:#303640; }
      .pl-product li,.pl-feedback p { color:#aeb7c5; }
      .pl-option { background:#242a32; color:#d7dce3; }
      .pl-feedback { background:#20262e; }
      .pl-option.correct { background:#183124; color:#a9dfb9; outline-color:#35664a; }
      .pl-option.wrong { background:#351f20; color:#f0aaaa; outline-color:#684044; }
    }
  `;
  document.head.append(style);
}

function ensureLab() {
  const host = document.querySelector('#phoneKnowledgeCard');
  if (!host || document.querySelector('#phoneProductLab')) return;
  const section = document.createElement('div');
  section.id = 'phoneProductLab';
  section.className = 'pl-shell';
  section.innerHTML = `
    <div class="pl-head">
      <div><p class="eyebrow">PRODUCT LAB · V1</p><h3>真实产品判断实验室</h3></div>
      <span class="pl-count">5 Cases</span>
    </div>
    <p class="muted small">把 Concept 接到真实产品。先做判断，再看“官方事实 / 不能推出什么 / GTM 怎么讲”。</p>
    <div id="phoneProductLabTabs" class="pl-tabs"></div>
    <div id="phoneProductLabBody"></div>
    <div class="pl-foot">规格核验日期：${VERIFIED_DATE}。动态产品事实以后应重新核验官网；厂商实验室百分比不跨品牌直接比较。</div>
  `;
  host.append(section);
}

function renderTabs() {
  const node = document.querySelector('#phoneProductLabTabs');
  if (!node) return;
  node.innerHTML = '';
  cases.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pl-tab${index === activeIndex ? ' active' : ''}`;
    button.textContent = `${index + 1} · ${item.concepts[0]}`;
    button.addEventListener('click', () => { activeIndex = index; render(); });
    node.append(button);
  });
}

function productHtml(product) {
  return `<div class="pl-product"><strong>${product.name}</strong><ul>${product.facts.map(f => `<li>${f}</li>`).join('')}</ul><a href="${product.source}" target="_blank" rel="noopener noreferrer">官方来源 ↗</a></div>`;
}

function renderBody() {
  const node = document.querySelector('#phoneProductLabBody');
  if (!node) return;
  const item = cases[activeIndex];
  const selected = answered.get(item.id);
  const hasAnswer = Number.isInteger(selected);
  node.innerHTML = `
    <div class="pl-case" data-case-id="${item.id}">
      <h4>${item.title}</h4>
      <div class="pl-concepts">${item.concepts.map(c => `<span class="pl-concept">${c}</span>`).join('')}</div>
      <div class="pl-products">${item.products.map(productHtml).join('')}</div>
      <p class="pl-prompt">${item.prompt}</p>
      <div class="pl-options">${item.options.map((option, index) => {
        let cls = 'pl-option';
        if (hasAnswer && index === item.correct) cls += ' correct';
        else if (hasAnswer && index === selected && selected !== item.correct) cls += ' wrong';
        return `<button type="button" class="${cls}" data-option="${index}" ${hasAnswer ? 'disabled' : ''}>${String.fromCharCode(65 + index)}. ${option}</button>`;
      }).join('')}</div>
      <div class="pl-feedback${hasAnswer ? ' show' : ''}">
        <div class="pl-result">${hasAnswer ? (selected === item.correct ? '✓ 判断正确' : '这次判断还不够严谨') : ''}</div>
        <p><strong>解析：</strong>${item.explanation}</p>
        <p><strong>官方事实：</strong>${item.fact}</p>
        <p><strong>不能推出：</strong>${item.cannot}</p>
        <p><strong>Retail GTM：</strong>${item.gtm}</p>
      </div>
      ${hasAnswer ? `<button type="button" class="primary pl-next" id="phoneProductLabNext">${activeIndex === cases.length - 1 ? '回到第 1 个案例' : '下一个案例'}</button>` : ''}
    </div>
  `;
  node.querySelectorAll('.pl-option').forEach(button => {
    button.addEventListener('click', () => {
      answered.set(item.id, Number(button.dataset.option));
      renderBody();
    });
  });
  node.querySelector('#phoneProductLabNext')?.addEventListener('click', () => {
    activeIndex = (activeIndex + 1) % cases.length;
    render();
  });
}

function render() {
  renderTabs();
  renderBody();
}

ensureStyles();
ensureLab();
render();

window.__PHONE_PRODUCT_LAB_V091__ = {
  version: '0.9.1',
  verifiedAt: VERIFIED_DATE,
  cases: cases.length,
  ids: cases.map(item => item.id),
};
