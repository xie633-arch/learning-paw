import {
  KOREAN_YONSEI_GUIDE_VERSION,
  buildYonseiTutorGuide,
} from './korean-yonsei-guide-v17.js';

const TUTOR_STORAGE_KEY = 'learning-paw:korean-tutor:v1';
const GUIDE_STORAGE_KEY = 'learning-paw:korean-yonsei-guide:v1';
const VERSION = '0.17.2';
let queued = false;
let applying = false;

function readJson(key, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key) || '') || fallback; }
  catch { return fallback; }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isKoreanSelected() {
  return document.querySelector('#domainName')?.textContent?.trim() === '韩语';
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function ensureStyles() {
  if (document.querySelector('#koreanYonseiGuideV17Styles')) return;
  const style = document.createElement('style');
  style.id = 'koreanYonseiGuideV17Styles';
  style.textContent = `
    .yonsei-guide{border:1px solid #e5e7eb;border-radius:18px;padding:16px;background:linear-gradient(180deg,#fff,#fafbfc);display:grid;gap:13px}
    .yonsei-guide-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .yonsei-guide-eyebrow{font-size:10px;font-weight:800;letter-spacing:.14em;color:#667085}
    .yonsei-guide h3{margin:4px 0 0;font-size:20px;line-height:1.35}
    .yonsei-guide-book{white-space:nowrap;padding:5px 9px;border-radius:999px;background:#eef2f6;color:#344054;font-size:11px;font-weight:750}
    .yonsei-guide-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .yonsei-guide-block{padding:12px;border-radius:14px;background:#f4f6f8}
    .yonsei-guide-block strong{display:block;font-size:12px;margin-bottom:5px}
    .yonsei-guide-block p{margin:0;color:#475467;font-size:12px;line-height:1.6}
    .yonsei-guide-expressions{display:flex;gap:6px;flex-wrap:wrap}
    .yonsei-guide-expressions span{padding:5px 8px;border-radius:999px;background:#fff;border:1px solid #e4e7ec;font-size:12px}
    .yonsei-guide-source{font-size:11px;color:#667085;line-height:1.55}
    .yonsei-guide-links{display:flex;gap:8px;flex-wrap:wrap}
    .yonsei-guide-links a{font-size:11px;font-weight:700;color:inherit;text-decoration:underline;text-underline-offset:3px}
    .yonsei-guide-unmatched{padding:12px;border-radius:14px;background:#fff7e8;color:#7a5716;font-size:12px;line-height:1.6}
    @media(max-width:720px){.yonsei-guide-grid{grid-template-columns:1fr}.yonsei-guide-head{display:grid}.yonsei-guide-book{justify-self:start}}
    @media(prefers-color-scheme:dark){
      .yonsei-guide{background:linear-gradient(180deg,#1c2027,#181c22);border-color:#303640}
      .yonsei-guide-book,.yonsei-guide-block{background:#242932;color:#e5e7eb}
      .yonsei-guide-block p,.yonsei-guide-source{color:#aeb7c5}
      .yonsei-guide-expressions span{background:#1a1f26;border-color:#343b46}
      .yonsei-guide-unmatched{background:#352d20;color:#e6c985}
    }
  `;
  document.head.append(style);
}

function currentDomSettings(panel) {
  const stored = readJson(TUTOR_STORAGE_KEY, {});
  return {
    volume: panel.querySelector('#koreanTutorVolume')?.value || stored.volume || '1',
    lesson: panel.querySelector('#koreanTutorLesson')?.value || stored.lesson || '1',
    focus: panel.querySelector('#koreanTutorFocus')?.value ?? stored.focus ?? '',
    previousFocus: panel.querySelector('#koreanTutorPrevious')?.value ?? stored.previousFocus ?? '',
  };
}

function persistAutoFocus(settings, guide, focusNode) {
  const state = readJson(GUIDE_STORAGE_KEY, {});
  const currentFocus = String(settings.focus || '').trim();
  const previousAuto = String(state.lastAutoFocus || '').trim();
  const canReplace = !currentFocus || currentFocus === previousAuto;

  if (canReplace && currentFocus !== guide.autoFocus) {
    const next = { ...readJson(TUTOR_STORAGE_KEY, {}), ...settings, focus: guide.autoFocus };
    writeJson(TUTOR_STORAGE_KEY, next);
    if (focusNode && focusNode.value !== guide.autoFocus) {
      focusNode.value = guide.autoFocus;
      // V0.16 listens to input only to refresh the prompt. Do not dispatch change,
      // because change intentionally rebuilds the tutor surface.
      focusNode.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  const lessonKey = `1-${guide.lesson}`;
  if (state.lastAutoFocus !== guide.autoFocus || state.lessonKey !== lessonKey) {
    writeJson(GUIDE_STORAGE_KEY, {
      lastAutoFocus: guide.autoFocus,
      lessonKey,
      updatedAt: new Date().toISOString(),
    });
  }
}

function guideMarkup(guide) {
  const sources = guide.sources
    .map(source => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label}</a>`)
    .join('');
  const expressions = guide.expressions.map(item => `<span>${item}</span>`).join('');
  return `
    <div class="yonsei-guide-head">
      <div><div class="yonsei-guide-eyebrow">OFFICIAL COURSE MAP · LEARNING PAW GUIDE</div><h3>第 ${guide.lesson} 课｜${guide.titleKo} · ${guide.titleZh}</h3></div>
      <div class="yonsei-guide-book">新延世韩国语 ${guide.book}</div>
    </div>
    <div class="yonsei-guide-grid">
      <div class="yonsei-guide-block"><strong>今天要学会什么</strong><p>${guide.objective}</p></div>
      <div class="yonsei-guide-block"><strong>30 分钟重点</strong><p>${guide.focus}</p></div>
      <div class="yonsei-guide-block"><strong>今天的主动输出</strong><p>${guide.task}</p></div>
      <div class="yonsei-guide-block"><strong>完成标准</strong><p>${guide.exitCheck}</p></div>
    </div>
    <div><strong style="display:block;font-size:12px;margin-bottom:7px">本课可调用的基础表达</strong><div class="yonsei-guide-expressions">${expressions}</div></div>
    <div class="yonsei-guide-source">${guide.sourceNote}</div>
    <div class="yonsei-guide-links">${sources}</div>
  `;
}

function guideSignature(guide) {
  if (!guide) return 'unmatched';
  return [
    VERSION,
    guide.book,
    guide.lesson,
    guide.titleKo,
    guide.objective,
    guide.focus,
    guide.task,
    guide.exitCheck,
  ].join('|');
}

function renderGuide(panel, guide) {
  let node = panel.querySelector('#koreanYonseiGuide');
  if (!node) {
    node = document.createElement('section');
    node.id = 'koreanYonseiGuide';
    node.className = 'yonsei-guide';
    const grid = panel.querySelector('.korean-tutor-grid');
    if (grid) grid.insertAdjacentElement('afterend', node);
    else panel.prepend(node);
  }

  const signature = guideSignature(guide);
  if (node.dataset.guideSignature === signature) return;
  node.dataset.guideSignature = signature;
  node.innerHTML = guide
    ? guideMarkup(guide)
    : '<div class="yonsei-guide-unmatched">当前册 / 课还没有匹配到内置官方课程地图。你仍然可以补充页码或上传教材页面；平台不会凭空编造教材目录。</div>';
}

function syncTodaySurface(guide, settings) {
  if (!guide || !isKoreanSelected()) return;
  const title = document.querySelector('#todayLessonTitle');
  const summary = document.querySelector('#todayLessonSummary');
  const details = document.querySelector('#todayLessonDetails');
  setText(title, `《延世韩国语》${settings.volume} · 第 ${guide.lesson} 课｜${guide.titleKo}`);
  setText(summary, `${guide.titleZh}｜${guide.objective}`);

  if (details) {
    const signature = [VERSION, guide.lesson, guide.focus, guide.task].join('|');
    if (details.dataset.yonseiGuideSignature !== signature) {
      details.dataset.yonseiGuideSignature = signature;
      details.innerHTML = `<strong>平台已生成今日教材重点</strong><p>${guide.focus}</p><p class="muted small">主动输出：${guide.task}</p>`;
    }
  }
}

function enhanceTutorPanel() {
  if (applying || !isKoreanSelected()) return;
  const panel = document.querySelector('#koreanTutorPanel');
  if (!panel || panel.classList.contains('hidden')) return;
  const volume = panel.querySelector('#koreanTutorVolume');
  const lesson = panel.querySelector('#koreanTutorLesson');
  const focus = panel.querySelector('#koreanTutorFocus');
  if (!volume || !lesson || !focus) return;

  applying = true;
  try {
    const settings = currentDomSettings(panel);
    const guide = buildYonseiTutorGuide(settings);
    const label = panel.querySelector('label[for="koreanTutorFocus"]');
    setText(label, '今天教材范围 / 重点（平台自动生成，可补充具体页码）');
    const placeholder = '平台会按官方单元自动生成；只有想精确到页码时才需要补充。';
    if (focus.placeholder !== placeholder) focus.placeholder = placeholder;

    if (guide) {
      persistAutoFocus(settings, guide, focus);
      renderGuide(panel, guide);
      syncTodaySurface(guide, { ...settings, focus: guide.autoFocus });
    } else {
      renderGuide(panel, null);
    }
  } finally {
    applying = false;
  }
}

function scheduleEnhance() {
  if (queued) return;
  queued = true;
  // V0.16 owns the tutor DOM. Wait until its domain-switch render has settled,
  // then apply V0.17 exactly once. This deliberately avoids observing trainingHub.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      queued = false;
      enhanceTutorPanel();
    });
  });
}

ensureStyles();
scheduleEnhance();

// Explicit signals only: domain switch, learner editing the textbook position,
// tutor completion/storage updates. Observing the whole tutor subtree caused V0.16
// and V0.17 to repeatedly rebuild one another.
const domainName = document.querySelector('#domainName');
if (domainName) {
  new MutationObserver(scheduleEnhance).observe(domainName, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

document.addEventListener('change', event => {
  if (event.target?.matches?.('#koreanTutorVolume,#koreanTutorLesson,#koreanTutorFocus')) {
    window.setTimeout(scheduleEnhance, 0);
  }
}, true);

window.addEventListener('learning-paw:korean-tutor-updated', scheduleEnhance);
window.addEventListener('storage', scheduleEnhance);

window.__KOREAN_YONSEI_GUIDE_UI_V17__ = {
  version: VERSION,
  dataVersion: KOREAN_YONSEI_GUIDE_VERSION,
  render: scheduleEnhance,
};
