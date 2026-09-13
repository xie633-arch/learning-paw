import { cards as baseCards } from './cards.js';
import { extraCards } from './platform-data.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const DAILY_TARGET = 10;
const DAILY_NEW_LIMIT = 5;
const allCards = [...baseCards, ...extraCards];
const cardById = new Map(allCards.map(card => [card.id, card]));

const DOMAIN_LABELS = {
  phone: '手机产品专家',
  retail: '商圈与零售',
  industry: '行业与商业',
  korean: '韩语',
};

let activeTab = 'today';
let lastDomainId = null;
let syncQueued = false;

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function localDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function selectedDomainId() {
  const state = readState();
  const saved = state?.preferences?.lastDomain;
  if (saved && DOMAIN_LABELS[saved]) return saved;
  const name = document.querySelector('#domainName')?.textContent?.trim();
  return Object.entries(DOMAIN_LABELS).find(([, label]) => label === name)?.[0] || 'phone';
}

function historyDomain(item) {
  if (item?.domain) return item.domain;
  const card = cardById.get(item?.cardId);
  if (card?.domain) return card.domain;
  if (item?.deck === '手机产品专家') return 'phone';
  if (item?.deck === '韩语') return 'korean';
  if (item?.deck === '商圈与零售') return 'retail';
  if (item?.deck === '行业与商业') return 'industry';
  return 'unknown';
}

function dueTimestamp(record) {
  if (!record) return Infinity;
  if (record.engine === 'fsrs' && record.card) {
    const value = record.card.due;
    const time = typeof value === 'number' ? value : new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
  }
  const time = Number(record.due);
  return Number.isFinite(time) ? time : 0;
}

function reviewPlan(domainId) {
  const state = readState();
  const schedules = state.schedules && typeof state.schedules === 'object' ? state.schedules : {};
  const history = Array.isArray(state.history) ? state.history : [];
  const now = Date.now();
  const today = localDayKey(new Date());
  const domainCards = allCards.filter(card => card.domain === domainId);

  const scheduledDue = domainCards
    .filter(card => schedules[card.id] && dueTimestamp(schedules[card.id]) <= now)
    .sort((a, b) => dueTimestamp(schedules[a.id]) - dueTimestamp(schedules[b.id]));
  const unseen = domainCards.filter(card => !schedules[card.id]);

  const todayHistory = history.filter(item => item.day === today && historyDomain(item) === domainId);
  const beforeTodayIds = new Set(
    history
      .filter(item => item.day !== today && historyDomain(item) === domainId)
      .map(item => item.cardId)
      .filter(Boolean),
  );
  const newTodayIds = new Set(
    todayHistory
      .filter(item => item.cardId && !beforeTodayIds.has(item.cardId))
      .map(item => item.cardId),
  );

  const remainingTotal = Math.max(0, DAILY_TARGET - todayHistory.length);
  const remainingNew = Math.max(0, DAILY_NEW_LIMIT - newTodayIds.size);
  const duePlan = Math.min(scheduledDue.length, remainingTotal);
  const newPlan = Math.min(unseen.length, remainingNew, Math.max(0, remainingTotal - duePlan));

  return {
    scheduledDue: scheduledDue.length,
    unseen: unseen.length,
    available: scheduledDue.length + unseen.length,
    reviewedToday: todayHistory.length,
    planCount: duePlan + newPlan,
  };
}

function ensureStyles() {
  if (document.querySelector('#uxV08Styles')) return;
  const style = document.createElement('style');
  style.id = 'uxV08Styles';
  style.textContent = `
    .ux-tab-inactive { display:none !important; }
    .ux-desktop-tabs {
      display:flex; gap:8px; margin:0 0 16px; padding:7px;
      background:rgba(255,255,255,.82); border:1px solid rgba(17,24,39,.07);
      border-radius:18px; position:sticky; top:10px; z-index:40;
      backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
    }
    .ux-desktop-tabs button {
      flex:1; min-height:42px; background:transparent; color:#667085; padding:9px 12px;
    }
    .ux-desktop-tabs button.active { background:#111827; color:#fff; }
    .ux-daily-plan-note, .ux-sync-note {
      margin:10px 0 0; padding:11px 13px; border-radius:14px;
      background:#f4f6f8; color:#667085; font-size:12px; line-height:1.55;
    }
    .ux-sync-note strong { color:#344054; }
    @media (max-width:720px) {
      .ux-desktop-tabs { display:none; }
      .ux-tab-panel { animation:uxTabIn .16s ease-out; }
    }
    @media (min-width:721px) {
      .mobile-bottom-nav { display:none !important; }
      .ux-tab-panel { animation:uxTabIn .16s ease-out; }
    }
    @keyframes uxTabIn { from { opacity:.55; transform:translateY(4px); } to { opacity:1; transform:none; } }
    @media (prefers-color-scheme: dark) {
      .ux-desktop-tabs { background:rgba(24,28,34,.9); border-color:#303640; }
      .ux-desktop-tabs button { color:#aab2bf; }
      .ux-desktop-tabs button.active { background:#f3f4f6; color:#111827; }
      .ux-daily-plan-note, .ux-sync-note { background:#242932; color:#aab2bf; }
      .ux-sync-note strong { color:#f3f4f6; }
    }
  `;
  document.head.append(style);
}

function panelGroups() {
  const dataCard = document.querySelector('#exportBtn')?.closest('section.card');
  if (dataCard && !dataCard.id) dataCard.id = 'dataCard';
  return {
    today: [
      document.querySelector('.hero.card'),
      document.querySelector('#todayLearningCard'),
    ],
    training: [document.querySelector('#trainingHub')],
    route: [document.querySelector('#routeCard'), document.querySelector('#visualCard')],
    weak: [document.querySelector('#weakCard')],
    domains: [
      document.querySelector('#domainHub') || document.querySelector('.domain-card-shell'),
      document.querySelector('.current-domain-card'),
      document.querySelector('#koreanNotice'),
      dataCard,
    ],
  };
}

function activateTab(tab, { scroll = true } = {}) {
  const groups = panelGroups();
  if (!groups[tab]) return;
  activeTab = tab;
  const managed = new Set(Object.values(groups).flat().filter(Boolean));
  managed.forEach(node => {
    node.classList.add('ux-tab-panel');
    const belongs = groups[tab].includes(node);
    node.classList.toggle('ux-tab-inactive', !belongs);
  });

  document.querySelectorAll('#mobileBottomNav button').forEach(button => {
    const key = tabForTarget(button.dataset.target);
    button.classList.toggle('active', key === tab);
  });
  document.querySelectorAll('.ux-desktop-tabs button').forEach(button => {
    button.classList.toggle('active', button.dataset.uxTab === tab);
  });

  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function tabForTarget(target) {
  if (target === 'todayLearningCard') return 'today';
  if (target === 'trainingHub') return 'training';
  if (target === 'routeCard') return 'route';
  if (target === 'weakCard') return 'weak';
  if (target === 'domainHub') return 'domains';
  return 'today';
}

function ensureDesktopTabs() {
  if (document.querySelector('#uxDesktopTabs')) return;
  const home = document.querySelector('#homeView');
  if (!home) return;
  const nav = document.createElement('nav');
  nav.id = 'uxDesktopTabs';
  nav.className = 'ux-desktop-tabs';
  nav.setAttribute('aria-label', '学习区导航');
  const items = [
    ['today', '今日'],
    ['training', '训练'],
    ['route', '路线'],
    ['weak', '薄弱'],
    ['domains', '领域 / 我的'],
  ];
  items.forEach(([key, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.uxTab = key;
    button.textContent = label;
    button.addEventListener('click', () => activateTab(key));
    nav.append(button);
  });
  home.before(nav);

  const syncVisibility = () => nav.classList.toggle('hidden', home.classList.contains('hidden'));
  syncVisibility();
  new MutationObserver(syncVisibility).observe(home, { attributes: true, attributeFilter: ['class'] });
}

function upgradeBottomNav() {
  const nav = document.querySelector('#mobileBottomNav');
  if (!nav || nav.dataset.uxV08 === '1') return;
  nav.dataset.uxV08 = '1';
  nav.addEventListener('click', event => {
    const button = event.target.closest('button[data-target]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    activateTab(tabForTarget(button.dataset.target));
  }, true);
}

function ensureSyncNotice() {
  const dataCard = document.querySelector('#exportBtn')?.closest('section.card');
  if (!dataCard) return;
  if (!dataCard.id) dataCard.id = 'dataCard';
  const paragraph = dataCard.querySelector('p.muted.small');
  if (paragraph && paragraph.dataset.uxV08 !== '1') {
    paragraph.dataset.uxV08 = '1';
    paragraph.textContent = '学习进度当前保存在这台设备的浏览器中。Mac 与 iPhone 暂不自动同步；换设备时请先导出 JSON，再在另一台设备导入。';
  }
  if (!dataCard.querySelector('#deviceSyncStatus')) {
    const note = document.createElement('div');
    note.id = 'deviceSyncStatus';
    note.className = 'ux-sync-note';
    note.innerHTML = '<strong>跨设备同步：未开启</strong><br>当前采用本地优先，避免把个人学习记录写入公开 GitHub 仓库。';
    paragraph?.after(note);
  }
}

function ensureDailyPlanHint() {
  const panel = document.querySelector('#trainingHub .training-panel');
  if (!panel) return null;
  let note = panel.querySelector('#dailyPlanHint');
  if (!note) {
    note = document.createElement('div');
    note.id = 'dailyPlanHint';
    note.className = 'ux-daily-plan-note';
    const select = document.querySelector('#sessionSize');
    select?.after(note);
  }
  return note;
}

function syncDailyPlan() {
  const dueCount = document.querySelector('#dueCount');
  const domainName = document.querySelector('#domainName');
  const sessionSize = document.querySelector('#sessionSize');
  const startBtn = document.querySelector('#startBtn');
  if (!dueCount || !domainName || !sessionSize || !startBtn) return;

  const domainId = selectedDomainId();
  if (lastDomainId !== domainId) {
    sessionSize.dataset.userSelected = '';
    lastDomainId = domainId;
  }
  const plan = reviewPlan(domainId);

  const label = dueCount.closest('div')?.querySelector('span');
  if (label && label.textContent !== '今日建议') label.textContent = '今日建议';
  const nextCount = String(plan.planCount);
  if (dueCount.textContent !== nextCount) dueCount.textContent = nextCount;

  document.querySelectorAll('#domainGrid .domain-choice-copy small').forEach(node => {
    const match = node.textContent.match(/^(\d+) 张训练卡$/);
    if (match) node.textContent = `${match[1]} 张卡片库`;
  });

  const trainingLead = document.querySelector('#trainingHub .training-panel .muted.small');
  if (trainingLead && trainingLead.textContent !== '优先真正到期卡，再引入少量新卡；不用清空全部卡库。') {
    trainingLead.textContent = '优先真正到期卡，再引入少量新卡；不用清空全部卡库。';
  }
  const allOption = [...sessionSize.options].find(option => option.value === 'all');
  if (allOption && allOption.textContent !== '全部可复习｜自选加练') allOption.textContent = '全部可复习｜自选加练';

  const note = ensureDailyPlanHint();
  if (note) {
    const message = plan.planCount > 0
      ? `真正到期 ${plan.scheduledDue} 张 · 未学新卡 ${plan.unseen} 张 · 今日建议 ${plan.planCount} 张。每日建议最多 ${DAILY_TARGET} 张，其中新卡最多 ${DAILY_NEW_LIMIT} 张。`
      : plan.available > 0
        ? `今天的建议量已经完成。当前仍有 ${plan.scheduledDue} 张到期 / ${plan.unseen} 张未学，可留到后续，也可以自选加练。`
        : '当前没有需要复习或引入的新卡。';
    if (note.textContent !== message) note.textContent = message;
  }

  if (!sessionSize.dataset.userSelected) {
    sessionSize.querySelectorAll('option[data-daily-plan-option]').forEach(option => option.remove());
    if (plan.planCount > 0) {
      let option = [...sessionSize.options].find(item => item.value === String(plan.planCount));
      if (!option) {
        option = document.createElement('option');
        option.value = String(plan.planCount);
        option.dataset.dailyPlanOption = '1';
        option.textContent = `${plan.planCount} 题｜今日剩余计划`;
        sessionSize.prepend(option);
      }
      sessionSize.value = String(plan.planCount);
    }
  }

  const originalDisabled = startBtn.disabled;
  if (!originalDisabled) {
    const text = plan.planCount > 0
      ? `开始今日计划（${plan.planCount} 张）`
      : plan.available > 0
        ? '今日计划已完成｜继续加练'
        : startBtn.textContent;
    if (startBtn.textContent !== text) startBtn.textContent = text;
  }
}

function scheduleSync() {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    syncDailyPlan();
    ensureSyncNotice();
  });
}

function bindObservers() {
  const domainName = document.querySelector('#domainName');
  const dueCount = document.querySelector('#dueCount');
  const reviewedToday = document.querySelector('#reviewedToday');
  [domainName, dueCount, reviewedToday].filter(Boolean).forEach(node => {
    new MutationObserver(scheduleSync).observe(node, { childList: true, subtree: true, characterData: true });
  });
  const sessionSize = document.querySelector('#sessionSize');
  sessionSize?.addEventListener('change', () => { sessionSize.dataset.userSelected = '1'; });
  window.addEventListener('storage', scheduleSync);
}

function bindLessonTrainingShortcut() {
  document.addEventListener('click', event => {
    const button = event.target.closest('.lesson-reader-actions button');
    if (!button) return;
    if (button.textContent.includes('去训练')) activateTab('training', { scroll: false });
  }, true);
}

ensureStyles();
ensureDesktopTabs();
upgradeBottomNav();
ensureSyncNotice();
bindObservers();
bindLessonTrainingShortcut();
activateTab('today', { scroll: false });
syncDailyPlan();

window.__LEARNING_PAW_UX_V08__ = {
  version: '0.8.0',
  dailyTarget: DAILY_TARGET,
  dailyNewLimit: DAILY_NEW_LIMIT,
  activateTab,
};
