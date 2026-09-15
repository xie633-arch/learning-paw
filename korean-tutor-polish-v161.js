const ROOT_STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.16.1';

function readState() {
  try { return JSON.parse(localStorage.getItem(ROOT_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function isKoreanSelected() {
  return document.querySelector('#domainName')?.textContent?.trim() === '韩语';
}

function recentTutorEvents() {
  const events = Array.isArray(readState().studyEvents) ? readState().studyEvents : [];
  return events
    .filter(event => event?.domain === 'korean' && event?.event_type === 'conversation_session' && event?.source === 'chatgpt')
    .sort((a, b) => String(b.occurred_at || '').localeCompare(String(a.occurred_at || '')));
}

function renderTutorHistory() {
  if (!isKoreanSelected()) return;
  const card = document.querySelector('#weakCard');
  const list = document.querySelector('#weakList');
  if (!card || !list) return;

  const eyebrow = card.querySelector('.section-heading .eyebrow');
  const heading = card.querySelector('.section-heading h2');
  const drill = document.querySelector('#weakDrillBtn');
  if (eyebrow) eyebrow.textContent = 'TUTOR HISTORY';
  if (heading) heading.textContent = '私教记录';
  if (drill) drill.hidden = true;

  const events = recentTutorEvents().slice(0, 5);
  if (!events.length) {
    list.innerHTML = '<div class="weak-empty">还没有私教记录。完成第一节 30 分钟私教后，这里会留下教材位置和学习时间。</div>';
    return;
  }

  list.innerHTML = events.map(event => {
    const textbook = event.textbook || {};
    const when = event.occurred_at
      ? new Date(event.occurred_at).toLocaleString('zh-CN', { hour12: false })
      : '';
    const volume = textbook.volume || '?';
    const lesson = textbook.lesson || '?';
    const focus = textbook.focus || '30 分钟 AI 私教';
    return `<div class="weak-item"><div><strong>《延世韩国语》${volume} · 第 ${lesson} 课</strong><span class="muted small">${focus}</span></div><div class="muted small">${when}</div></div>`;
  }).join('');
}

function syncSurface() {
  const korean = isKoreanSelected();
  const sharedTodayPlan = document.querySelector('#todayPlanOverview');
  sharedTodayPlan?.classList.toggle('hidden', korean);

  if (!korean) return;
  const complete = document.querySelector('#completeLessonBtn');
  if (complete) complete.style.display = '';
  document.querySelector('#openKoreanLessonReaderBtn')?.remove();
}

function refreshAfterNavigation() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      syncSurface();
      renderTutorHistory();
    });
  });
}

// The mobile tab controller stops propagation on its own nav element. Capture at
// document level first so the Korean recap can refresh after the tab has switched.
document.addEventListener('click', event => {
  if (!isKoreanSelected()) return;
  const mobileRecap = event.target.closest('#mobileBottomNav button[data-target="weakCard"]');
  const desktopRecap = event.target.closest('#uxDesktopTabs [data-ux-tab="weak"]');
  if (mobileRecap || desktopRecap) refreshAfterNavigation();
}, true);

window.addEventListener('learning-paw:korean-tutor-updated', refreshAfterNavigation);
window.addEventListener('storage', refreshAfterNavigation);

const domainName = document.querySelector('#domainName');
if (domainName) {
  new MutationObserver(refreshAfterNavigation).observe(domainName, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

syncSurface();
if (isKoreanSelected()) renderTutorHistory();

window.__KOREAN_TUTOR_POLISH_V161__ = {
  version: VERSION,
  renderTutorHistory,
  syncSurface,
};
