const DOMAIN_THEME = {
  phone: { accent: '#4f6f8f', soft: '#edf3f8', strong: '#27445f' },
  korean: { accent: '#c96570', soft: '#fbf0f1', strong: '#8e3944' },
  retail: { accent: '#5d8a70', soft: '#edf6f0', strong: '#315b42' },
  industry: { accent: '#8a7398', soft: '#f4eff7', strong: '#5c456a' },
};

const DOMAIN_BY_NAME = {
  '手机产品专家': 'phone',
  '韩语': 'korean',
  '商圈与零售': 'retail',
  '行业与商业': 'industry',
};

function selectedDomainId() {
  try {
    const state = JSON.parse(localStorage.getItem('personal-learning-os:v0.1') || '{}');
    if (state?.preferences?.lastDomain && DOMAIN_THEME[state.preferences.lastDomain]) return state.preferences.lastDomain;
  } catch {}
  const name = document.querySelector('#domainName')?.textContent?.trim();
  return DOMAIN_BY_NAME[name] || 'phone';
}

function ensureStyles() {
  if (document.querySelector('#visualUiV081Styles')) return;
  const style = document.createElement('style');
  style.id = 'visualUiV081Styles';
  style.textContent = `
    :root {
      --lp-accent:#4f6f8f;
      --lp-accent-soft:#edf3f8;
      --lp-accent-strong:#27445f;
      --lp-surface:#ffffff;
      --lp-bg:#f5f7fa;
      --lp-line:#e8ebef;
      --lp-text:#172033;
      --lp-muted:#7b8494;
    }
    body {
      background:
        radial-gradient(circle at 12% -8%, rgba(79,111,143,.08), transparent 32%),
        linear-gradient(180deg,#f8f9fb 0%,#f3f5f8 100%);
      color:var(--lp-text);
    }
    .app-shell { width:min(1160px,100%); padding-top:max(14px,env(safe-area-inset-top)); }
    .topbar { margin-bottom:12px; min-height:54px; }
    .topbar h1 { font-size:clamp(27px,4vw,38px); letter-spacing:-.045em; }
    .topbar .eyebrow { color:var(--lp-muted); letter-spacing:.13em; }
    .badge { background:var(--lp-text); box-shadow:0 2px 0 rgba(17,24,39,.12); }

    .card {
      border:1px solid rgba(23,32,51,.065);
      box-shadow:0 8px 28px rgba(31,41,55,.055);
      border-radius:22px;
    }

    #todayLearningCard {
      position:relative;
      overflow:hidden;
      border:1px solid color-mix(in srgb, var(--lp-accent) 28%, white);
      background:linear-gradient(145deg,#fff 0%,var(--lp-accent-soft) 145%);
      box-shadow:0 18px 48px color-mix(in srgb,var(--lp-accent) 12%, transparent);
      padding:26px;
    }
    #todayLearningCard::after {
      content:'';
      position:absolute; width:180px; height:180px; border-radius:50%;
      right:-85px; top:-105px;
      background:color-mix(in srgb,var(--lp-accent) 11%, transparent);
      pointer-events:none;
    }
    #todayLearningCard .eyebrow { color:var(--lp-accent-strong); }
    #todayLearningCard .focus-title { font-size:clamp(25px,4.5vw,34px); letter-spacing:-.035em; }
    #todayLearningCard .status-badge {
      background:var(--lp-accent-soft); color:var(--lp-accent-strong);
      border:1px solid color-mix(in srgb,var(--lp-accent) 18%,transparent);
    }
    #todayLearningCard .chip { background:rgba(255,255,255,.72); border:1px solid rgba(23,32,51,.06); }

    .hero.card {
      padding:12px 14px;
      background:rgba(255,255,255,.68);
      border-color:rgba(23,32,51,.045);
      box-shadow:none;
    }
    .hero > .muted { display:none; }
    .hero .stats-grid { margin:0; gap:7px; }
    .hero .stats-grid div { background:transparent; padding:8px 8px; border-radius:12px; }
    .hero .stats-grid div + div { border-left:1px solid var(--lp-line); border-radius:0; }
    .hero .stats-grid strong { font-size:23px; margin-bottom:4px; color:var(--lp-text); }
    .hero .stats-grid span { color:var(--lp-muted); font-size:11px; }

    .ux-desktop-tabs {
      box-shadow:0 8px 28px rgba(31,41,55,.055);
      border-radius:16px !important;
      padding:5px !important;
    }
    .ux-desktop-tabs button {
      border-radius:12px;
      transition:background .16s ease,color .16s ease,transform .12s ease;
    }
    .ux-desktop-tabs button.active {
      background:var(--lp-accent) !important;
      color:#fff !important;
      box-shadow:0 2px 0 color-mix(in srgb,var(--lp-accent-strong) 35%,transparent);
    }

    button.primary {
      background:var(--lp-accent);
      box-shadow:0 4px 0 color-mix(in srgb,var(--lp-accent-strong) 62%,transparent);
      transform:translateY(0);
      transition:transform .09s ease,box-shadow .09s ease,filter .14s ease;
    }
    button.primary:active:not(:disabled) {
      transform:translateY(3px);
      box-shadow:0 1px 0 color-mix(in srgb,var(--lp-accent-strong) 62%,transparent);
    }
    button.primary:hover:not(:disabled) { filter:brightness(.985); }
    button.ghost { transition:transform .09s ease,background .14s ease; }
    button.ghost:active:not(:disabled) { transform:scale(.985); }

    .training-panel, .weak-item, .route-item, .mode-item {
      border:1px solid rgba(23,32,51,.045);
    }
    .route-item.current {
      border-color:color-mix(in srgb,var(--lp-accent) 38%,transparent);
      background:var(--lp-accent-soft);
    }
    .route-item.current .route-index { background:var(--lp-accent); color:white; }

    .domain-choice.selected {
      border-color:var(--lp-accent) !important;
      background:var(--lp-accent-soft) !important;
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--lp-accent) 35%,transparent) !important;
    }
    .domain-choice.selected .domain-choice-icon { box-shadow:0 0 0 1px color-mix(in srgb,var(--lp-accent) 18%,transparent); }

    .mobile-bottom-nav {
      border-radius:20px !important;
      box-shadow:0 14px 40px rgba(31,41,55,.16) !important;
    }
    .mobile-bottom-nav button.active {
      background:var(--lp-accent) !important;
      color:#fff !important;
      transform:translateY(-1px);
    }

    .lesson-reader-panel { scrollbar-width:thin; }
    .lesson-reader-top::after {
      content:''; position:absolute; left:0; right:0; bottom:0; height:2px;
      background:linear-gradient(90deg,var(--lp-accent) 0 30%,transparent 30% 100%);
      opacity:.5;
    }

    @media (max-width:720px) {
      .app-shell { padding-left:12px; padding-right:12px; }
      .topbar { margin-bottom:8px; }
      .topbar .eyebrow { display:none; }
      .topbar h1 { font-size:27px; }
      .topbar .badge { padding:6px 9px; font-size:11px; }
      #todayLearningCard { padding:21px 18px; border-radius:22px; }
      #todayLearningCard .section-heading { margin-bottom:12px; }
      #todayLearningCard .focus-title { font-size:27px; }
      .hero.card { margin-top:-3px; padding:8px 6px; }
      .hero .stats-grid { gap:0; }
      .hero .stats-grid div { padding:8px 4px; }
      .card { margin-bottom:13px; }
      .mobile-bottom-nav button { min-height:48px; }
    }

    @media (prefers-color-scheme:dark) {
      :root { --lp-surface:#181c22; --lp-bg:#11151a; --lp-line:#2b313a; --lp-text:#f2f4f7; --lp-muted:#9da6b5; }
      body { background:linear-gradient(180deg,#11151a,#151a21); }
      #todayLearningCard { background:linear-gradient(145deg,#1b2027 0%,color-mix(in srgb,var(--lp-accent) 18%,#1b2027) 100%); }
      #todayLearningCard .chip { background:rgba(255,255,255,.055); border-color:#303640; }
      .hero.card { background:rgba(24,28,34,.62); }
      .hero .stats-grid div + div { border-color:#2b313a; }
      .domain-choice.selected { background:color-mix(in srgb,var(--lp-accent) 18%,#181c22) !important; }
    }
  `;
  document.head.append(style);
}

function applyTheme() {
  const id = selectedDomainId();
  const theme = DOMAIN_THEME[id] || DOMAIN_THEME.phone;
  const root = document.documentElement;
  root.style.setProperty('--lp-accent', theme.accent);
  root.style.setProperty('--lp-accent-soft', theme.soft);
  root.style.setProperty('--lp-accent-strong', theme.strong);
  document.body.dataset.learningDomain = id;
}

function makeTodayFirst() {
  const home = document.querySelector('#homeView');
  const today = document.querySelector('#todayLearningCard');
  const hero = document.querySelector('.hero.card');
  if (!home || !today || !hero) return;
  if (today.nextElementSibling !== hero) home.insertBefore(today, hero);
}

function brandHeader() {
  const heading = document.querySelector('.topbar h1');
  if (heading && heading.textContent.trim() === 'Learning') heading.textContent = 'Learning Paw';
  const eyebrow = document.querySelector('.topbar .eyebrow');
  if (eyebrow) eyebrow.textContent = 'PERSONAL LEARNING OS';
}

function bindThemeSync() {
  const domainName = document.querySelector('#domainName');
  if (domainName) {
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; applyTheme(); });
    }).observe(domainName, { childList:true, subtree:true, characterData:true });
  }
  window.addEventListener('storage', applyTheme);
}

ensureStyles();
brandHeader();
makeTodayFirst();
applyTheme();
bindThemeSync();

window.__LEARNING_PAW_VISUAL_UI_V081__ = { version:'0.8.1', makeTodayFirst, applyTheme };
