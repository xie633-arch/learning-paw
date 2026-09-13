const STORAGE_KEY = 'personal-learning-os:v0.1';
let syncQueued = false;

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function buildNote(caseId, progress) {
  const note = document.createElement('div');
  if (progress.last_correct === false) {
    note.className = 'pl-adaptive-note wrong';
    note.innerHTML = '这次错误已经进入 <strong>Error Bank</strong>，系统已按 Concept 记录薄弱点。<br><button type="button" class="ghost" data-pa-go-weak="1">去薄弱页补救</button>';
  } else if (progress.last_attempt_type === 'revalidation') {
    note.className = 'pl-adaptive-note resolved';
    note.textContent = '✓ 重新验证通过：对应 Product Lab ErrorRecord 已自动标记为 resolved。';
  } else {
    note.className = 'pl-adaptive-note';
    note.textContent = '✓ 本次判断已记录到 Learner Signal。正确首次作答不会制造 Error Bank 任务。';
  }
  note.dataset.adaptiveCase = caseId;
  return note;
}

function syncCurrentFeedback() {
  const caseNode = document.querySelector('#phoneProductLabBody .pl-case[data-case-id]');
  if (!caseNode) return;
  const feedback = caseNode.querySelector('.pl-feedback.show');
  if (!feedback || feedback.querySelector('.pl-adaptive-note')) return;

  const caseId = caseNode.dataset.caseId;
  const progress = readState().productLabProgress?.[caseId];
  if (!progress?.last_attempt_at) return;
  feedback.append(buildNote(caseId, progress));
}

function scheduleSync() {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    syncCurrentFeedback();
  });
}

function bind() {
  const body = document.querySelector('#phoneProductLabBody');
  if (body) {
    new MutationObserver(scheduleSync).observe(body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }
  window.addEventListener('learning-data-updated', scheduleSync);
  scheduleSync();
}

bind();
window.__PHONE_ADAPTIVE_NOTE_SYNC_V101__ = { version: '0.10.1', sync: scheduleSync };
