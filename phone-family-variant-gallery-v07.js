const STORAGE_KEY = 'personal-learning-os:v0.1';

const productFamilies = [
  {
    id: 'mate80',
    name: 'Mate 80',
    label: 'Mate 80 系列',
    description: '高端直板旗舰：从标准版、Pro 到 Pro Max、RS 与风驰版，重点理解不同旗舰层级的任务分工。',
    models: [
      {
        id: 'mate80', name: 'Mate 80', source: 'https://consumer.huawei.com/cn/phones/mate80/',
        positioning: '标准旗舰｜高端商务与全能旗舰入口',
        colors: [
          ['云杉绿','#91a8a0','./assets/official/mate80/green.png'],
          ['晨曦金','#d5bd94','./assets/official/mate80/gold.png'],
          ['雪域白','#f1f1ef','./assets/official/mate80/white.png'],
          ['曜石黑','#262626','./assets/official/mate80/black.png'],
        ],
      },
      {
        id: 'mate80-pro', name: 'Mate 80 Pro', source: 'https://consumer.huawei.com/cn/phones/mate80-pro/',
        positioning: 'Pro 旗舰｜更完整的旗舰影像、通信与高端体验',
        colors: [
          ['晨曦金','#d5bd94','./assets/official/mate80-pro/gold.png'],
          ['云杉绿','#91a8a0','./assets/official/mate80-pro/green.png'],
          ['雪域白','#f1f1ef','./assets/official/mate80-pro/white.png'],
          ['曜石黑','#262626','./assets/official/mate80-pro/black.png'],
        ],
      },
      {
        id: 'mate80-pro-max', name: 'Mate 80 Pro Max', source: 'https://consumer.huawei.com/cn/phones/mate80-pro-max/',
        positioning: 'Pro Max｜更大屏、双层 OLED 与旗舰影像上限',
        colors: [
          ['极昼金','#d9c495','./assets/official/mate80-pro-max/gold.png'],
          ['极光青','#6f9ea0','./assets/official/mate80-pro-max/green.png'],
          ['极地银','#c8cbd0','./assets/official/mate80-pro-max/silver.png'],
          ['极夜黑','#202124','./assets/official/mate80-pro-max/black.png'],
        ],
      },
      {
        id: 'mate80-rs', name: 'Mate 80 RS 非凡大师', source: 'https://consumer.huawei.com/cn/phones/mate80-rs-ultimate-design/',
        positioning: 'RS 非凡大师｜顶级设计、材质与旗舰身份表达',
        colors: [
          ['槿紫','#665074','./assets/official/mate80-rs/purple-full.png','https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/mate80-rs-ultimate-design/list/purple.png'],
          ['皓白','#f4f2ed','./assets/official/mate80-rs/white-full.png','https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/mate80-rs-ultimate-design/list/white.png'],
          ['玄黑','#1f1f1f','./assets/official/mate80-rs/black-full.png','https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/mate80-rs-ultimate-design/list/black.png'],
        ],
      },
      {
        id: 'mate80-fengchi', name: 'Mate 80 Pro Max 风驰版', source: 'https://consumer.huawei.com/cn/phones/mate80-pro-max-fengchiban/',
        positioning: '风驰版｜在 Pro Max 基础上强调散热与高负载性能场景',
        colors: [
          ['极昼金','#d9c495','./assets/official/mate80-fengchi/gold.png'],
          ['极夜黑','#202124','./assets/official/mate80-fengchi/black.png'],
        ],
      },
    ],
  },
  {
    id: 'pura90',
    name: 'Pura 90',
    label: 'Pura 90 系列',
    description: '影像与设计旗舰：用标准 / Pro / Pro Max 的层级理解设计、影像和旗舰体验如何逐级上探。',
    models: [
      {
        id:'pura90', name:'Pura 90', source:'https://consumer.huawei.com/cn/phones/pura90/', positioning:'标准旗舰｜轻薄、影像与长续航',
        colors:[
          ['罗兰紫','#777aa0','./assets/official/pura90/pura90_roland-purple.png'],
          ['雪域白','#f4f3ef','./assets/official/pura90/pura90_snow-white.png'],
          ['丝绒黑','#262626','./assets/official/pura90/pura90_velvet-black.png'],
        ],
      },
      {
        id:'pura90-pro', name:'Pura 90 Pro', source:'https://consumer.huawei.com/cn/phones/pura90-pro/', positioning:'Pro 旗舰｜更强影像与微距长焦',
        colors:[
          ['粉红芭乐','#e99a9e','./assets/official/pura90/pura90pro_pink-guava.png'],
          ['橘子汽水','#efa46e','./assets/official/pura90/pura90pro_orange-soda.png'],
          ['椰青白','#f2f0e6','./assets/official/pura90/pura90pro_coconut-white.png'],
          ['桑果黑','#4d4b4b','./assets/official/pura90/pura90pro_mulberry-black.png'],
        ],
      },
      {
        id:'pura90-pro-max', name:'Pura 90 Pro Max', source:'https://consumer.huawei.com/cn/phones/pura90-pro-max/', positioning:'顶配旗舰｜更强长焦与大屏旗舰体验',
        colors:[
          ['橘子海','#f27d4b','./assets/official/pura90/pura90promax_orange-sea.png'],
          ['霞光紫','#8373d1','./assets/official/pura90/pura90promax_glow-purple.png'],
          ['翡翠湖','#768668','./assets/official/pura90/pura90promax_jade-lake.png'],
          ['晨曦金','#dfc9a2','./assets/official/pura90/pura90promax_dawn-gold.png'],
          ['曜石黑','#232323','./assets/official/pura90/pura90promax_obsidian-black.png'],
        ],
      },
    ],
  },
  {
    id: 'nova16',
    name: 'nova 16',
    label: 'nova 16 系列',
    description: '年轻旗舰与大众年轻线：同一代里同时存在 Ultra / Pro / 标准 / SE / z，适合训练价格带与用户分层。',
    models: [
      {
        id:'nova16-ultra', name:'nova 16 Ultra', source:'https://consumer.huawei.com/cn/phones/nova16-ultra/', positioning:'Ultra｜nova 影像、设计和可靠性的最高层级',
        colors:[
          ['晴空蓝','#8ed6e7','./assets/official/nova16-ultra/blue.png'],
          ['天际白','#f1f1ed','./assets/official/nova16-ultra/white.png'],
          ['星空黑','#222426','./assets/official/nova16-ultra/black.png'],
        ],
      },
      {
        id:'nova16-pro', name:'nova 16 Pro', source:'https://consumer.huawei.com/cn/phones/nova16-pro/', positioning:'Pro｜金属中框、影像与年轻旗舰体验',
        colors:[
          ['晴空蓝','#8ed6e7','./assets/official/nova16-pro/blue.png'],
          ['幻彩贝母','#c9c4dc','./assets/official/nova16-pro/iridescent.jpg','https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/nova16-pro/imgs/huawei-nova-16-pro-cmf-iridescent-blur.jpg'],
          ['天际白','#f1f1ed','./assets/official/nova16-pro/white.png'],
          ['星空黑','#222426','./assets/official/nova16-pro/black.png'],
        ],
      },
      {
        id:'nova16', name:'nova 16', source:'https://consumer.huawei.com/cn/phones/nova16/', positioning:'标准版｜年轻人像、长焦与潮流设计主力',
        colors:[
          ['晴空蓝','#8ed6e7','./assets/official/nova16/blue.png'],
          ['幻彩贝母','#c9c4dc','./assets/official/nova16/iridescent.png','https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/nova16/assets/huawei-nova-16-cmf-iridescent-back-blur.png'],
          ['天际白','#f1f1ed','./assets/official/nova16/white.png'],
          ['星空黑','#222426','./assets/official/nova16/black.png'],
        ],
      },
      {
        id:'nova16-se', name:'nova 16 SE', source:'https://consumer.huawei.com/cn/phones/nova16-se/', positioning:'SE｜更亲民的年轻设计、续航与影像组合',
        colors:[
          ['樱雪晴空','#dca7b7','./assets/official/nova16-se/pink.png'],
          ['破晓橙','#e99062','./assets/official/nova16-se/orange.png'],
          ['天际白','#f1f1ed','./assets/official/nova16-se/white.png'],
          ['星空黑','#222426','./assets/official/nova16-se/black.png'],
        ],
      },
      {
        id:'nova16-z', name:'nova 16z', source:'https://consumer.huawei.com/cn/phones/nova16-z/', positioning:'z｜直屏、性能与快充导向的年轻实用型',
        colors:[
          ['幻彩贝母','#c9c4dc','./assets/official/nova16-z/iridescent.jpg','https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/nova16-z/imgs/huawei-nova-16-z-cmf-iridescent-blur.jpg'],
          ['天际白','#f1f1ed','./assets/official/nova16-z/white.png'],
          ['星空黑','#222426','./assets/official/nova16-z/black.png'],
        ],
      },
    ],
  },
  {
    id: 'changxiang90',
    name: '畅享 90',
    label: '畅享 90 系列',
    description: '大众与务实型产品线：通过标准 / Plus / Pro Max / m Plus 理解续航、屏幕、性能、安全和价格带的组合。',
    models: [
      {
        id:'changxiang90', name:'畅享 90', source:'https://consumer.huawei.com/cn/phones/changxiang-90/', positioning:'标准版｜大众价位的续航、安全与基础体验',
        colors:[
          ['星海蓝','#7faac5','./assets/official/changxiang90/blue.png'],
          ['羽沙白','#eeede7','./assets/official/changxiang90/white.png'],
          ['星空黑','#232426','./assets/official/changxiang90/black.png'],
        ],
      },
      {
        id:'changxiang90-plus', name:'畅享 90 Plus', source:'https://consumer.huawei.com/cn/phones/changxiang-90-plus/', positioning:'Plus｜更大屏、更完整性能与大众旗舰感',
        colors:[
          ['星海蓝','#7faac5','./assets/official/changxiang90-plus/blue.png'],
          ['羽沙白','#eeede7','./assets/official/changxiang90-plus/white.png'],
          ['星空黑','#232426','./assets/official/changxiang90-plus/black.png'],
        ],
      },
      {
        id:'changxiang90-pro-max', name:'畅享 90 Pro Max', source:'https://consumer.huawei.com/cn/phones/changxiang-90-pro-max/', positioning:'Pro Max｜畅享线的大屏、续航与配置上探',
        colors:[
          ['飞天青','#7fa6ae','./assets/official/changxiang90-pro-max/blue.png'],
          ['晨曦金','#d2bd94','./assets/official/changxiang90-pro-max/gold.png'],
          ['雪域白','#f1f1ef','./assets/official/changxiang90-pro-max/white.png'],
          ['曜金黑','#252525','./assets/official/changxiang90-pro-max/black.png'],
        ],
      },
      {
        id:'changxiang90m-plus', name:'畅享 90m Plus', source:'https://consumer.huawei.com/cn/phones/changxiang-90m-plus/', positioning:'m Plus｜大众通信、续航与差异化版本',
        colors:[
          ['星空黑','#232426','./assets/official/changxiang90m-plus/black.png'],
          ['珊瑚橙','#dc8563','./assets/official/changxiang90m-plus/orange.png'],
          ['羽沙白','#eeede7','./assets/official/changxiang90m-plus/white.png'],
        ],
      },
    ],
  },
  {
    id: 'foldable',
    name: '折叠 / 新形态',
    label: '折叠与新形态',
    description: '不是单一“折叠系列”，而是不同形态：大折叠 Mate X7 与三折叠 Mate XT 2 非凡大师承担不同创新角色。',
    models: [
      {
        id:'mate-x7', name:'Mate X7', source:'https://consumer.huawei.com/cn/phones/mate-x7/', positioning:'大折叠旗舰｜外屏日常 + 内屏效率与沉浸',
        colors:[
          ['云锦白','#eee9df','./assets/official/matex7/white.png'],
          ['云锦蓝','#718ba2','./assets/official/matex7/blue.png'],
          ['幻影紫','#756887','./assets/official/matex7/purple.png'],
          ['寰宇红','#8d3f3a','./assets/official/matex7/red.png'],
          ['曜石黑','#222222','./assets/official/matex7/black.png'],
        ],
      },
      {
        id:'mate-xt2', name:'Mate XT 2 非凡大师', source:'https://consumer.huawei.com/cn/phones/mate-xt-2-ultimate-design/', positioning:'三折叠旗舰｜超大屏形态与顶级创新展示',
        colors:[
          ['锦紫','#67516d','./assets/official/matext2/purple.png'],
          ['玄黑','#202020','./assets/official/matext2/black.png'],
          ['皓白','#f3f0e9','./assets/official/matext2/white.png'],
        ],
      },
    ],
  },
];

function currentPhoneLessonId() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (state?.preferences?.lastDomain !== 'phone') return null;
    const order = ['phone-portfolio','phone-tech','phone-os','phone-user','phone-competition','phone-retail','phone-launch','phone-review'];
    return order.find(id => !state?.lessonProgress?.[id]) || null;
  } catch {
    return null;
  }
}

function makeImage(color, alt) {
  const img = document.createElement('img');
  img.src = color[2];
  img.alt = alt;
  img.loading = 'lazy';
  const fallback = color[3];
  if (fallback) {
    img.addEventListener('error', () => {
      if (img.dataset.fallback === '1') return;
      img.dataset.fallback = '1';
      img.src = fallback;
    });
  }
  return img;
}

function installStyles() {
  if (document.querySelector('#phoneFamilyGalleryV07Styles')) return;
  const style = document.createElement('style');
  style.id = 'phoneFamilyGalleryV07Styles';
  style.textContent = `
    .phone-catalog { padding:20px 0; border-top:1px solid #e8ebef; }
    .phone-catalog__head { display:grid; gap:6px; margin-bottom:14px; }
    .phone-catalog__head h3 { margin:0; font-size:21px; }
    .phone-catalog__head p { margin:0; color:#667085; font-size:12px; line-height:1.65; }
    .phone-catalog__family-tabs, .phone-catalog__model-tabs { display:flex; gap:8px; overflow-x:auto; padding:2px 1px 9px; scrollbar-width:none; }
    .phone-catalog__family-tabs::-webkit-scrollbar, .phone-catalog__model-tabs::-webkit-scrollbar { display:none; }
    .phone-catalog__family, .phone-catalog__model { flex:0 0 auto; min-height:40px; padding:8px 12px; border:1px solid #d9dee7; border-radius:999px; background:#fff; color:#344054; font-size:11px; font-weight:800; }
    .phone-catalog__family[aria-pressed='true'] { background:#111827; color:#fff; border-color:#111827; }
    .phone-catalog__model[aria-pressed='true'] { background:#e9edf2; color:#111827; border-color:#9ea7b5; }
    .phone-catalog__family-copy { margin:2px 0 13px; padding:11px 13px; border-radius:13px; background:#f6f7f9; color:#5b6472; font-size:11px; line-height:1.55; }
    .phone-catalog__stage { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(230px,.8fr); gap:15px; align-items:stretch; }
    .phone-catalog__hero { min-height:380px; border:1px solid #e4e7ec; border-radius:20px; background:#fff; display:grid; place-items:center; overflow:hidden; }
    .phone-catalog__hero img { width:100%; height:100%; max-height:470px; object-fit:contain; padding:10px; }
    .phone-catalog__side { border:1px solid #e4e7ec; border-radius:20px; padding:16px; background:#f8f9fb; display:flex; flex-direction:column; gap:13px; }
    .phone-catalog__side h4 { margin:0; font-size:21px; line-height:1.25; }
    .phone-catalog__positioning, .phone-catalog__note { margin:-5px 0 0; color:#667085; font-size:11px; line-height:1.55; }
    .phone-catalog__note { padding:9px 10px; margin:0; background:#fff7e8; border-radius:10px; color:#7b6334; }
    .phone-catalog__color-title { display:flex; align-items:center; justify-content:space-between; gap:10px; color:#667085; font-size:11px; }
    .phone-catalog__color-title strong { color:#111827; }
    .phone-catalog__colors { display:flex; flex-wrap:wrap; gap:8px; }
    .phone-catalog__color { display:flex; align-items:center; gap:7px; min-height:38px; padding:7px 9px; border:1px solid #d7dce5; border-radius:11px; background:#fff; color:#344054; font-size:10px; font-weight:750; }
    .phone-catalog__color[aria-pressed='true'] { border-color:#111827; box-shadow:inset 0 0 0 1px #111827; }
    .phone-catalog__swatch { width:17px; height:17px; border-radius:50%; border:1px solid rgba(17,24,39,.14); box-shadow:0 0 0 2px #fff inset; }
    .phone-catalog__thumbs { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:6px; margin-top:auto; }
    .phone-catalog__thumb { padding:3px; aspect-ratio:1/1; border:1px solid #dde1e8; border-radius:9px; background:#fff; overflow:hidden; }
    .phone-catalog__thumb img { width:100%; height:100%; object-fit:contain; }
    .phone-catalog__thumb[aria-pressed='true'] { border-color:#111827; box-shadow:inset 0 0 0 1px #111827; }
    .phone-catalog__source { text-decoration:none; text-align:center; min-height:39px; display:grid; place-items:center; border-radius:11px; background:#e9edf2; color:#344054; font-size:10px; font-weight:800; }
    @media (max-width:720px) {
      .phone-catalog__head h3 { font-size:19px; }
      .phone-catalog__stage { grid-template-columns:1fr; }
      .phone-catalog__hero { min-height:335px; }
      .phone-catalog__hero img { max-height:410px; padding:7px; }
      .phone-catalog__side { padding:14px; }
      .phone-catalog__family { min-height:39px; }
      .phone-catalog__model-tabs { margin-right:-10px; padding-right:10px; }
    }
    @media (prefers-color-scheme:dark) {
      .phone-catalog { border-color:#303640; }
      .phone-catalog__head p, .phone-catalog__positioning { color:#aab2bf; }
      .phone-catalog__family-copy { background:#242932; color:#aab2bf; }
      .phone-catalog__hero { background:#fff; border-color:#303640; }
      .phone-catalog__side { background:#242932; border-color:#303640; }
      .phone-catalog__side h4, .phone-catalog__color-title strong { color:#f3f4f6; }
      .phone-catalog__family, .phone-catalog__model, .phone-catalog__color, .phone-catalog__thumb { background:#181c22; color:#d7dce5; border-color:#3a4049; }
      .phone-catalog__family[aria-pressed='true'] { background:#f3f4f6; color:#111827; border-color:#f3f4f6; }
      .phone-catalog__model[aria-pressed='true'] { background:#343b46; color:#fff; border-color:#727c8a; }
      .phone-catalog__color[aria-pressed='true'], .phone-catalog__thumb[aria-pressed='true'] { border-color:#f3f4f6; box-shadow:inset 0 0 0 1px #f3f4f6; }
      .phone-catalog__source { background:#303640; color:#e6e9ee; }
      .phone-catalog__note { background:#3c3425; color:#e8cf9d; }
    }
  `;
  document.head.append(style);
}

function buildCatalog() {
  const section = document.createElement('section');
  section.className = 'phone-catalog';
  section.innerHTML = `
    <div class="phone-catalog__head">
      <h3>当前产品家族｜系列 × 型号 × 配色</h3>
      <p>交互参考成熟电商 PDP：先切产品家族，再切具体型号，再切配色；主图跟随 Variant 联动。只使用华为官网已经核验的当前机型和官方图片。</p>
    </div>
    <div class="phone-catalog__family-tabs" aria-label="产品家族"></div>
    <div class="phone-catalog__family-copy"></div>
    <div class="phone-catalog__model-tabs" aria-label="具体型号"></div>
    <div class="phone-catalog__stage">
      <div class="phone-catalog__hero"></div>
      <div class="phone-catalog__side"></div>
    </div>`;

  let familyIndex = 0;
  let modelIndex = 0;
  let colorIndex = 0;
  const familyTabs = section.querySelector('.phone-catalog__family-tabs');
  const familyCopy = section.querySelector('.phone-catalog__family-copy');
  const modelTabs = section.querySelector('.phone-catalog__model-tabs');
  const hero = section.querySelector('.phone-catalog__hero');
  const side = section.querySelector('.phone-catalog__side');

  function draw() {
    const family = productFamilies[familyIndex];
    const model = family.models[modelIndex] || family.models[0];
    const color = model.colors[colorIndex] || model.colors[0];

    familyTabs.innerHTML = '';
    productFamilies.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'phone-catalog__family';
      btn.textContent = item.label;
      btn.setAttribute('aria-pressed', String(index === familyIndex));
      btn.addEventListener('click', () => { familyIndex = index; modelIndex = 0; colorIndex = 0; draw(); });
      familyTabs.append(btn);
    });

    familyCopy.textContent = family.description;
    modelTabs.innerHTML = '';
    family.models.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'phone-catalog__model';
      btn.textContent = item.name;
      btn.setAttribute('aria-pressed', String(index === modelIndex));
      btn.addEventListener('click', () => { modelIndex = index; colorIndex = 0; draw(); });
      modelTabs.append(btn);
    });

    hero.innerHTML = '';
    hero.append(makeImage(color, `${model.name} ${color[0]} 华为官方产品图`));

    side.innerHTML = '';
    const title = document.createElement('h4');
    title.textContent = model.name;
    const positioning = document.createElement('p');
    positioning.className = 'phone-catalog__positioning';
    positioning.textContent = model.positioning;
    side.append(title, positioning);

    if (model.note) {
      const note = document.createElement('p');
      note.className = 'phone-catalog__note';
      note.textContent = model.note;
      side.append(note);
    }

    const colorTitle = document.createElement('div');
    colorTitle.className = 'phone-catalog__color-title';
    colorTitle.innerHTML = `<span>选择配色</span><strong>${color[0]}</strong>`;
    side.append(colorTitle);

    const colors = document.createElement('div');
    colors.className = 'phone-catalog__colors';
    model.colors.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'phone-catalog__color';
      btn.setAttribute('aria-pressed', String(index === colorIndex));
      const swatch = document.createElement('span');
      swatch.className = 'phone-catalog__swatch';
      swatch.style.background = item[1];
      const text = document.createElement('span');
      text.textContent = item[0];
      btn.append(swatch, text);
      btn.addEventListener('click', () => { colorIndex = index; draw(); });
      colors.append(btn);
    });
    side.append(colors);

    const thumbs = document.createElement('div');
    thumbs.className = 'phone-catalog__thumbs';
    model.colors.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'phone-catalog__thumb';
      btn.setAttribute('aria-label', `${model.name} ${item[0]}`);
      btn.setAttribute('aria-pressed', String(index === colorIndex));
      btn.append(makeImage(item, `${model.name} ${item[0]} 缩略图`));
      btn.addEventListener('click', () => { colorIndex = index; draw(); });
      thumbs.append(btn);
    });
    side.append(thumbs);

    const source = document.createElement('a');
    source.className = 'phone-catalog__source';
    source.href = model.source;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = '查看华为官网当前型号';
    side.append(source);
  }

  draw();
  return section;
}

function inject() {
  if (currentPhoneLessonId() !== 'phone-portfolio') return;
  const body = document.querySelector('#lessonReaderBody');
  if (!body || body.querySelector('.phone-catalog')) return;
  const title = body.querySelector('#lessonReaderTitle');
  if (!title || !title.textContent.includes('产品组合')) return;

  body.querySelector('.variant-gallery-section')?.remove();
  const overview = body.querySelector('.lesson-official-visuals');
  const catalog = buildCatalog();
  if (overview) overview.after(catalog);
  else {
    const intro = body.querySelector('.lesson-reader-intro');
    if (intro) intro.after(catalog);
    else title.after(catalog);
  }
}

installStyles();
const lessonBody = document.querySelector('#lessonReaderBody');
if (lessonBody) new MutationObserver(() => queueMicrotask(inject)).observe(lessonBody, { childList:true, subtree:true });
document.addEventListener('click', event => {
  if (event.target.closest('#openLessonReaderBtn')) window.setTimeout(inject, 0);
});
