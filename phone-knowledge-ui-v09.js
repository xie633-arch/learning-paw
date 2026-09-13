import { phoneKnowledgeSources, phoneKnowledgeTopics } from './phone-knowledge-v09.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
let activeTopicId = phoneKnowledgeTopics[0]?.id || null;
let query = '';

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function selectedDomain() {
  const name = document.querySelector('#domainName')?.textContent?.trim();
  return name === '手机产品专家' ? 'phone' : 'other';
}

function ensureStyles() {
  if (document.querySelector('#phoneKnowledgeV09Styles')) return;
  const style = document.createElement('style');
  style.id = 'phoneKnowledgeV09Styles';
  style.textContent = `
    #phoneKnowledgeCard { overflow:hidden; }
    .pk-head { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }
    .pk-head h2 { margin:3px 0 5px; }
    .pk-count { flex:0 0 auto; padding:8px 11px; border-radius:999px; background:var(--lp-accent-soft,#edf3f8); color:var(--lp-accent-strong,#27445f); font-size:12px; font-weight:800; }
    .pk-intro { margin:8px 0 14px; line-height:1.7; }
    .pk-status { padding:12px 14px; border-radius:16px; background:#f6f8fa; color:#667085; font-size:12px; line-height:1.6; margin-bottom:14px; }
    .pk-status strong { color:#344054; }
    .pk-tools { display:grid; gap:10px; margin:12px 0 15px; }
    .pk-search { width:100%; min-height:44px; border:1px solid rgba(23,32,51,.11); border-radius:14px; padding:0 14px; background:#fff; color:#172033; font:inherit; }
    .pk-topic-strip { display:flex; gap:8px; overflow-x:auto; padding:1px 1px 7px; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
    .pk-topic-strip::-webkit-scrollbar { display:none; }
    .pk-topic-button { flex:0 0 auto; min-height:38px; padding:8px 11px; border-radius:12px; background:#f5f7f9; color:#5f6878; box-shadow:none; font-size:12px; }
    .pk-topic-button.active { background:var(--lp-accent,#4f6f8f); color:#fff; }
    .pk-topic-hero { padding:16px; border-radius:18px; background:linear-gradient(145deg,#f8fafc,var(--lp-accent-soft,#edf3f8)); border:1px solid rgba(23,32,51,.06); margin-bottom:12px; }
    .pk-topic-title { display:flex; gap:10px; align-items:center; }
    .pk-topic-title span { font-size:24px; }
    .pk-topic-title h3 { margin:0; font-size:20px; }
    .pk-topic-hero p { margin:8px 0 0; color:#667085; line-height:1.65; }
    .pk-concepts { display:grid; gap:9px; }
    .pk-concept { border:1px solid rgba(23,32,51,.07); border-radius:16px; background:#fff; overflow:hidden; }
    .pk-concept summary { cursor:pointer; list-style:none; padding:14px 15px; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:10px; align-items:start; }
    .pk-concept summary::-webkit-details-marker { display:none; }
    .pk-concept-name { display:block; font-weight:850; color:#1f2937; margin-bottom:4px; }
    .pk-concept-one { display:block; font-size:12px; color:#6b7280; line-height:1.55; }
    .pk-chevron { color:#98a2b3; font-size:15px; transition:transform .15s ease; }
    .pk-concept[open] .pk-chevron { transform:rotate(90deg); }
    .pk-concept-body { border-top:1px solid #eef0f3; padding:13px 15px 15px; display:grid; gap:10px; }
    .pk-explain { display:grid; gap:3px; }
    .pk-explain strong { font-size:12px; color:#344054; }
    .pk-explain span { font-size:13px; color:#5d6675; line-height:1.65; }
    .pk-trap { padding:10px 12px; border-radius:12px; background:#fff7ed; color:#9a4d13; font-size:12px; line-height:1.6; }
    .pk-sources { display:flex; flex-wrap:wrap; gap:7px; }
    .pk-source { display:inline-flex; align-items:center; min-height:30px; padding:5px 9px; border-radius:999px; background:#f4f6f8; color:#536071; text-decoration:none; font-size:11px; font-weight:750; }
    .pk-source:hover { background:var(--lp-accent-soft,#edf3f8); color:var(--lp-accent-strong,#27445f); }
    .pk-search-empty { padding:24px 10px; text-align:center; color:#7b8494; }
    .pk-source-note { margin-top:14px; padding-top:13px; border-top:1px solid #eceff2; color:#7b8494; font-size:11px; line-height:1.6; }
    @media (max-width:720px) {
      .pk-head { display:block; }
      .pk-count { display:inline-flex; margin-top:7px; }
      .pk-concept summary { padding:13px; }
      .pk-concept-body { padding:12px 13px 14px; }
    }
    @media (prefers-color-scheme:dark) {
      .pk-status,.pk-topic-button,.pk-source { background:#242a32; color:#aeb7c5; }
      .pk-search,.pk-concept { background:#181d24; color:#f3f4f6; border-color:#303640; }
      .pk-concept-name { color:#f3f4f6; }
      .pk-concept-one,.pk-explain span,.pk-topic-hero p { color:#aeb7c5; }
      .pk-concept-body { border-color:#2b313a; }
      .pk-topic-hero { background:linear-gradient(145deg,#1b2027,color-mix(in srgb,var(--lp-accent,#4f6f8f) 14%,#1b2027)); border-color:#303640; }
      .pk-trap { background:#31251a; color:#f1b779; }
      .pk-source-note { border-color:#303640; }
    }
  `;
  document.head.append(style);
}

function conceptCount() {
  return phoneKnowledgeTopics.reduce((sum, topic) => sum + topic.concepts.length, 0);
}

function ensureCard() {
  if (document.querySelector('#phoneKnowledgeCard')) return;
  const route = document.querySelector('#routeCard');
  if (!route) return;
  const section = document.createElement('section');
  section.id = 'phoneKnowledgeCard';
  section.className = 'card';
  section.innerHTML = `
    <div class="pk-head">
      <div>
        <p class="eyebrow">PHONE KNOWLEDGE BASE · V0.9</p>
        <h2>手机技术知识库</h2>
      </div>
      <span class="pk-count">${phoneKnowledgeTopics.length} 专题 · ${conceptCount()} Concepts</span>
    </div>
    <p class="pk-intro muted">知识库负责“系统里有哪些知识”，今日计划负责“今天真正学哪些”。可以随时查，但不会一次把 ${conceptCount()} 个概念全部塞进复习。</p>
    <div id="phoneKnowledgeStatus" class="pk-status"></div>
    <div class="pk-tools">
      <input id="phoneKnowledgeSearch" class="pk-search" type="search" autocomplete="off" placeholder="搜索：GHz / Cache / LPDDR / 120Hz / OIS / Modem…" />
      <div id="phoneKnowledgeTopics" class="pk-topic-strip"></div>
    </div>
    <div id="phoneKnowledgeBody"></div>
    <div class="pk-source-note">来源策略：个人 Obsidian 技术专题只作为学习骨架；公开网页只放经过清洗的通用知识。底层原理优先参考 Arm / Android / 芯片与存储厂商官方资料，具体产品参数仍以当日厂商官网为准。</div>
  `;
  route.after(section);

  section.querySelector('#phoneKnowledgeSearch')?.addEventListener('input', event => {
    query = event.target.value.trim().toLowerCase();
    render();
  });
}

function trainingStatus() {
  const progress = readState().lessonProgress || {};
  const unlocked = Boolean(progress['phone-portfolio']);
  const node = document.querySelector('#phoneKnowledgeStatus');
  if (!node) return;
  node.innerHTML = unlocked
    ? '<strong>首批训练卡已解锁。</strong> 产品组合阶段已完成，CPU / 帧时间 / 内存 / 热管理 / OS 调度等基础概念会按“今日建议”少量进入 FSRS。'
    : '<strong>知识库可浏览，训练卡暂不一次性放出。</strong> 完成“01｜产品组合”后，首批 15 张技术基础卡才进入训练；后续继续分阶段引入。';
}

function sourceLinks(keys = []) {
  return keys.map(key => phoneKnowledgeSources[key]).filter(Boolean).map(source => `
    <a class="pk-source" href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label} ↗</a>
  `).join('');
}

function conceptHtml(concept, topic) {
  return `
    <details class="pk-concept" data-concept-id="${concept.id}">
      <summary>
        <span><span class="pk-concept-name">${concept.name}</span><span class="pk-concept-one">${concept.one}</span></span>
        <span class="pk-chevron">›</span>
      </summary>
      <div class="pk-concept-body">
        <div class="pk-explain"><strong>为什么重要</strong><span>${concept.why}</span></div>
        <div class="pk-trap"><strong>常见误区：</strong>${concept.trap}</div>
        ${concept.sources?.length ? `<div class="pk-sources">${sourceLinks(concept.sources)}</div>` : '<div class="pk-explain"><strong>来源说明</strong><span>通用工程概念；后续继续补充官方原始资料链接。</span></div>'}
      </div>
    </details>
  `;
}

function filteredMatches() {
  if (!query) return null;
  const matches = [];
  phoneKnowledgeTopics.forEach(topic => {
    topic.concepts.forEach(concept => {
      const haystack = `${topic.title} ${topic.summary} ${concept.name} ${concept.one} ${concept.why} ${concept.trap}`.toLowerCase();
      if (haystack.includes(query)) matches.push({ topic, concept });
    });
  });
  return matches;
}

function renderTopics() {
  const strip = document.querySelector('#phoneKnowledgeTopics');
  if (!strip) return;
  strip.innerHTML = '';
  phoneKnowledgeTopics.forEach(topic => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pk-topic-button${topic.id === activeTopicId && !query ? ' active' : ''}`;
    button.textContent = `${topic.icon} ${topic.title}`;
    button.addEventListener('click', () => {
      query = '';
      const input = document.querySelector('#phoneKnowledgeSearch');
      if (input) input.value = '';
      activeTopicId = topic.id;
      render();
    });
    strip.append(button);
  });
}

function renderBody() {
  const body = document.querySelector('#phoneKnowledgeBody');
  if (!body) return;
  const matches = filteredMatches();
  if (matches) {
    if (!matches.length) {
      body.innerHTML = '<div class="pk-search-empty">没有匹配概念。试试 “GHz”“刷新率”“UFS”“散热”“调度”。</div>';
      return;
    }
    body.innerHTML = `
      <div class="pk-topic-hero"><div class="pk-topic-title"><span>🔎</span><h3>搜索结果 · ${matches.length}</h3></div><p>结果来自整个手机技术知识库。</p></div>
      <div class="pk-concepts">${matches.map(({ topic, concept }) => conceptHtml(concept, topic)).join('')}</div>
    `;
    return;
  }
  const topic = phoneKnowledgeTopics.find(item => item.id === activeTopicId) || phoneKnowledgeTopics[0];
  if (!topic) return;
  body.innerHTML = `
    <div class="pk-topic-hero">
      <div class="pk-topic-title"><span>${topic.icon}</span><h3>${topic.title}</h3></div>
      <p>${topic.summary} · ${topic.level} · ${topic.concepts.length} 个概念</p>
    </div>
    <div class="pk-concepts">${topic.concepts.map(concept => conceptHtml(concept, topic)).join('')}</div>
  `;
}

function syncVisibility() {
  const card = document.querySelector('#phoneKnowledgeCard');
  if (!card) return;
  card.classList.toggle('hidden', selectedDomain() !== 'phone');
  trainingStatus();
}

function render() {
  renderTopics();
  renderBody();
  trainingStatus();
}

function bindDomainObserver() {
  const domainName = document.querySelector('#domainName');
  if (!domainName) return;
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      syncVisibility();
    });
  }).observe(domainName, { childList: true, subtree: true, characterData: true });
}

ensureStyles();
ensureCard();
render();
syncVisibility();
bindDomainObserver();
window.addEventListener('storage', syncVisibility);

window.__PHONE_KNOWLEDGE_UI_V09__ = { version: '0.9.0', render };
