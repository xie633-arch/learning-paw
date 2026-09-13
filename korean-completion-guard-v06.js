import { curricula } from './platform-data.js';
import { hasKoreanExitCheck, openKoreanExitCheck } from './korean-exit-check-v06.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const assessmentLessons = new Set(['ko-day-000','ko-day-007','ko-day-014','ko-day-021','ko-day-028']);

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function writeState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function isKorean() { return document.querySelector('#domainName')?.textContent?.trim() === '韩语'; }
function currentLesson() {
  const state = readState();
  return (curricula.korean?.steps || []).find(step => !state.lessonProgress?.[step.id]) || null;
}
function closeReader() {
  document.querySelector('#koreanLessonReaderOverlay')?.classList.add('hidden');
  document.body.classList.remove('korean-reader-open');
}
function completeLesson(lessonId) {
  const state = readState();
  state.lessonProgress ||= {};
  state.lessonProgress[lessonId] = new Date().toISOString();
  writeState(state);
  window.location.reload();
}
function launchAssessment() {
  closeReader();
  document.querySelector('#startTestBtn')?.click();
}

function syncGuards() {
  const korean = isKorean();
  const genericComplete = document.querySelector('#completeLessonBtn');
  const completeDisplay = korean ? 'none' : '';
  if (genericComplete && genericComplete.style.display !== completeDisplay) {
    genericComplete.style.display = completeDisplay;
  }

  const routeDisplay = korean ? 'none' : '';
  document.querySelectorAll('#routeList .route-toggle').forEach(button => {
    if (button.style.display !== routeDisplay) button.style.display = routeDisplay;
  });

  const readerPrimary = document.querySelector('#koreanLessonReaderOverlay .korean-reader-actions .primary');
  if (readerPrimary && korean) {
    const lesson = currentLesson();
    if (lesson) {
      const nextLabel = assessmentLessons.has(lesson.id)
        ? (lesson.id === 'ko-day-000' ? '开始 Day 0 入学基线' : '进行阶段验收')
        : (hasKoreanExitCheck(lesson.id) ? '完成 Exit Check 后进入下一课' : '我已完成本课');
      if (readerPrimary.textContent !== nextLabel) readerPrimary.textContent = nextLabel;
    }
  }
}

const reader = document.querySelector('#koreanLessonReaderOverlay');
reader?.addEventListener('click', event => {
  if (!isKorean()) return;
  const button = event.target.closest('.korean-reader-actions .primary');
  if (!button) return;
  const lesson = currentLesson();
  if (!lesson) return;

  if (assessmentLessons.has(lesson.id)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    launchAssessment();
    return;
  }

  if (hasKoreanExitCheck(lesson.id)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openKoreanExitCheck(lesson.id, completeLesson);
  }
}, true);

let syncQueued = false;
function scheduleSync() {
  if (syncQueued) return;
  syncQueued = true;
  queueMicrotask(() => {
    syncQueued = false;
    syncGuards();
  });
}

syncGuards();
['#domainName','#todayLessonTitle','#routeList','#koreanReaderBody'].forEach(selector => {
  const node = document.querySelector(selector);
  if (node) new MutationObserver(scheduleSync).observe(node,{childList:true,subtree:true,characterData:true});
});

window.__KOREAN_COMPLETION_GUARD_V06__ = { version:'0.6.2' };
