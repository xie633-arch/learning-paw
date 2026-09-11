import { cards as baseCards, domains as baseDomains } from './cards.js';
import { curricula, domainOverrides, extraCards, tests, visualSources } from './platform-data.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const FSRS_CDN = 'https://cdn.jsdelivr.net/npm/ts-fsrs@5.4.2/+esm';

const cards = [...baseCards, ...extraCards];
const domains = baseDomains.map(domain => ({
  ...domain,
  ...(domainOverrides[domain.id] || {}),
}));
const domainById = new Map(domains.map(domain => [domain.id, domain]));
const cardById = new Map(cards.map(card => [card.id, card]));

let fsrsLib = null;
let scheduler = null;
let engineName = '简化排程';
let state = loadState();
let selectedDomainId = resolveInitialDomain();
let session = null;
let testSession = null;
let ratingLocked = false;
let currentTodayStepId = null;
let currentWeakCategory = null;

const el = {
  homeView: document.querySelector('#homeView'),
  reviewView: document.querySelector('#reviewView'),
  testView: document.querySelector('#testView'),
  testResultView: document.querySelector('#testResultView'),
  summaryView: document.querySelector('#summaryView'),
  engineBadge: document.querySelector('#engineBadge'),
  homeLead: document.querySelector('#homeLead'),
  dueCount: document.querySelector('#dueCount'),
  reviewedToday: document.querySelector('#reviewedToday'),
  knownToday: document.querySelector('#knownToday'),
  domainGrid: document.querySelector('#domainGrid'),
  domainIcon: document.querySelector('#domainIcon'),
  domainName: document.querySelector('#domainName'),
  domainStatusBadge: document.querySelector('#domainStatusBadge'),
  domainDescription: document.querySelector('#domainDescription'),
  domainModes: document.querySelector('#domainModes'),
  koreanNotice: document.querySelector('#koreanNotice'),
  todayLearningCard: document.querySelector('#todayLearningCard'),
  todayProgressText: document.querySelector('#todayProgressText'),
  todayLessonTitle: document.querySelector('#todayLessonTitle'),
  todayLessonSummary: document.querySelector('#todayLessonSummary'),
  todayLessonChips: document.querySelector('#todayLessonChips'),
  todayLessonDetails: document.querySelector('#todayLessonDetails'),
  toggleLessonBtn: document.querySelector('#toggleLessonBtn'),
  completeLessonBtn: document.querySelector('#completeLessonBtn'),
  sessionSize: document.querySelector('#sessionSize'),
  startBtn: document.querySelector('#startBtn'),
  emptyHint: document.querySelector('#emptyHint'),
  startTestBtn: document.querySelector('#startTestBtn'),
  testHint: document.querySelector('#testHint'),
  weakCard: document.querySelector('#weakCard'),
  weakList: document.querySelector('#weakList'),
  weakDrillBtn: document.querySelector('#weakDrillBtn'),
  routeCard: document.querySelector('#routeCard'),
  routeTitle: document.querySelector('#routeTitle'),
  routeSource: document.querySelector('#routeSource'),
  routeProgressText: document.querySelector('#routeProgressText'),
  routeList: document.querySelector('#routeList'),
  visualCard: document.querySelector('#visualCard'),
  visualSourceList: document.querySelector('#visualSourceList'),
  exportBtn: document.querySelector('#exportBtn'),
  importBtn: document.querySelector('#importBtn'),
  importInput: document.querySelector('#importInput'),
  lastTestResult: document.querySelector('#lastTestResult'),
  exitBtn: document.querySelector('#exitBtn'),
  progressText: document.querySelector('#progressText'),
  progressBar: document.querySelector('#progressBar'),
  deckLabel: document.querySelector('#deckLabel'),
  categoryLabel: document.querySelector('#categoryLabel'),
  questionImage: document.querySelector('#questionImage'),
  questionText: document.querySelector('#questionText'),
  audioPromptBtn: document.querySelector('#audioPromptBtn'),
  answerLabel: document.querySelector('#answerLabel'),
  selfAnswer: document.querySelector('#selfAnswer'),
  revealBtn: document.querySelector('#revealBtn'),
  referenceBlock: document.querySelector('#referenceBlock'),
  referenceAnswer: document.querySelector('#referenceAnswer'),
  speakAnswerBtn: document.querySelector('#speakAnswerBtn'),
  summaryGood: document.querySelector('#summaryGood'),
  summaryHard: document.querySelector('#summaryHard'),
  summaryAgain: document.querySelector('#summaryAgain'),
  summaryMessage: document.querySelector('#summaryMessage'),
  backHomeBtn: document.querySelector('#backHomeBtn'),
  exitTestBtn: document.querySelector('#exitTestBtn'),
  testProgressText: document.querySelector('#testProgressText'),
  testProgressBar: document.querySelector('#testProgressBar'),
  testTitle: document.querySelector('#testTitle'),
  testQuestion: document.querySelector('#testQuestion'),
  testOptions: document.querySelector('#testOptions'),
  testFeedback: document.querySelector('#testFeedback'),
  nextTestBtn: document.querySelector('#nextTestBtn'),
  testScore: document.querySelector('#testScore'),
  testResultMessage: document.querySelector('#testResultMessage'),
  testResultBreakdown: document.querySelector('#testResultBreakdown'),
  testBackHomeBtn: document.querySelector('#testBackHomeBtn'),
  networkState: document.querySelector('#networkState'),
};

await init();

async function init() {
  renderDomainGrid();
  bindEvents();
  updateNetworkState();
  renderAllHome();
  registerServiceWorker();
  await initScheduler();
  renderAllHome();
}

async function initScheduler() {
  try {
    fsrsLib = await import(FSRS_CDN);
    scheduler = fsrsLib.fsrs({
      request_retention: 0.9,
      maximum_interval: 36500,
      enable_fuzz: true,
      enable_short_term: true,
      learning_steps: ['1m', '10m'],
      relearning_steps: ['10m'],
    });
    engineName = 'FSRS';
    el.engineBadge.textContent = 'FSRS';
  } catch (error) {
    console.warn('FSRS 加载失败，使用本地简化排程。', error);
    engineName = '离线排程';
    el.engineBadge.textContent = '离线模式';
  }
}

function defaultState() {
  return {
    version: 3,
    schedules: {},
    history: [],
    lessonProgress: {},
    testResults: [],
    preferences: { lastDomain: 'phone' },
  };
}

function normalizeState(value = {}) {
  return {
    ...defaultState(),
    ...value,
    schedules: value.schedules && typeof value.schedules === 'object' ? value.schedules : {},
    history: Array.isArray(value.history) ? value.history : [],
    lessonProgress: value.lessonProgress && typeof value.lessonProgress === 'object' ? value.lessonProgress : {},
    testResults: Array.isArray(value.testResults) ? value.testResults : [],
    preferences: {
      ...defaultState().preferences,
      ...(value.preferences || {}),
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.warn('读取本地学习记录失败，已使用空记录。', error);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resolveInitialDomain() {
  const saved = state.preferences?.lastDomain;
  if (saved && domainById.has(saved)) return saved;
  return domains.find(domain => domain.status === 'active')?.id || domains[0]?.id || 'phone';
}

function bindEvents() {
  el.startBtn.addEventListener('click', () => startSession());
  el.exitBtn.addEventListener('click', exitSession);
  el.revealBtn.addEventListener('click', revealAnswer);
  el.backHomeBtn.addEventListener('click', () => showView('home'));
  el.audioPromptBtn.addEventListener('click', () => {
    const card = currentCard();
    if (card?.audioText) speakKorean(card.audioText);
  });
  el.speakAnswerBtn.addEventListener('click', () => {
    const card = currentCard();
    if (card?.tts) speakKorean(card.tts);
  });
  document.querySelectorAll('[data-rating]').forEach(button => {
    button.addEventListener('click', () => rateCurrentCard(button.dataset.rating));
  });

  el.toggleLessonBtn.addEventListener('click', toggleTodayLessonDetails);
  el.completeLessonBtn.addEventListener('click', completeTodayLesson);
  el.weakDrillBtn.addEventListener('click', startWeakDrill);
  el.startTestBtn.addEventListener('click', startFormalTest);
  el.exitTestBtn.addEventListener('click', exitFormalTest);
  el.nextTestBtn.addEventListener('click', nextTestQuestion);
  el.testBackHomeBtn.addEventListener('click', () => showView('home'));
  el.exportBtn.addEventListener('click', exportLearningData);
  el.importBtn.addEventListener('click', () => el.importInput.click());
  el.importInput.addEventListener('change', importLearningData);

  window.addEventListener('online', updateNetworkState);
  window.addEventListener('offline', updateNetworkState);
}

function renderAllHome() {
  renderDomainDetail();
  renderHomeStats();
  renderTodayLearning();
  renderWeakSpots();
  renderRoute();
  renderVisualSources();
  renderTestState();
  renderLastTestResult();
}

function renderDomainGrid() {
  el.domainGrid.innerHTML = '';
  domains.forEach(domain => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `domain-choice${domain.id === selectedDomainId ? ' selected' : ''}`;
    button.dataset.domain = domain.id;
    const count = cards.filter(card => card.domain === domain.id).length;
    button.innerHTML = `
      <span class="domain-choice-icon">${domain.icon}</span>
      <span class="domain-choice-copy">
        <strong>${domain.name}</strong>
        <small>${domain.status === 'active' ? `${count} 张训练卡` : domain.statusLabel}</small>
      </span>
      <span class="domain-choice-state">${domain.status === 'active' ? '进入' : '规划'}</span>
    `;
    button.addEventListener('click', () => selectDomain(domain.id));
    el.domainGrid.append(button);
  });
}

function selectDomain(domainId) {
  if (!domainById.has(domainId)) return;
  selectedDomainId = domainId;
  state.preferences.lastDomain = domainId;
  saveState();
  el.domainGrid.querySelectorAll('[data-domain]').forEach(button => {
    button.classList.toggle('selected', button.dataset.domain === domainId);
  });
  renderAllHome();
}

function renderDomainDetail() {
  const domain = domainById.get(selectedDomainId) || domains[0];
  if (!domain) return;

  el.domainIcon.textContent = domain.icon;
  el.domainName.textContent = domain.name;
  el.domainStatusBadge.textContent = domain.statusLabel;
  el.domainStatusBadge.classList.toggle('planned', domain.status !== 'active');
  el.domainDescription.textContent = domain.description;
  el.koreanNotice.classList.toggle('hidden', domain.id !== 'korean');

  el.domainModes.innerHTML = '';
  (domain.modes || []).forEach(mode => {
    const item = document.createElement('div');
    const future = mode.status !== '可用';
    item.className = `mode-item${future ? ' future' : ''}`;
    item.innerHTML = `<strong>${mode.label}</strong><span>${mode.status}</span>`;
    el.domainModes.append(item);
  });

  if (domain.id === 'korean') {
    el.homeLead.textContent = '韩语模块本轮保持现状，在独立迭代中继续完善。';
  } else {
    el.homeLead.textContent = '学习新内容 → 主动回忆 → 薄弱专项 → 正式测试 → 再学习，形成完整闭环。';
  }
}

function renderHomeStats() {
  const domain = domainById.get(selectedDomainId);
  const due = getDueCards(selectedDomainId);
  const today = localDayKey(new Date());
  const todayHistory = state.history.filter(item => item.day === today && historyDomain(item) === selectedDomainId);

  el.dueCount.textContent = due.length;
  el.reviewedToday.textContent = todayHistory.length;
  el.knownToday.textContent = todayHistory.filter(item => item.rating === 'good').length;

  const active = domain?.status === 'active';
  el.startBtn.disabled = !active || due.length === 0;
  el.startBtn.textContent = active ? `开始 ${domain.name} 复习` : `${domain?.name || '该领域'}｜规划中`;

  if (!active) {
    el.emptyHint.textContent = '这个领域仍在规划中。';
    el.emptyHint.classList.remove('hidden');
  } else if (!due.length) {
    el.emptyHint.textContent = '当前没有到期卡片，可以做专项训练或正式测试。';
    el.emptyHint.classList.remove('hidden');
  } else {
    el.emptyHint.classList.add('hidden');
  }
}

function renderTodayLearning() {
  const curriculum = curricula[selectedDomainId];
  if (!curriculum) {
    el.todayLearningCard.classList.add('hidden');
    currentTodayStepId = null;
    return;
  }
  el.todayLearningCard.classList.remove('hidden');
  const steps = curriculum.steps || [];
  const completed = steps.filter(step => state.lessonProgress[step.id]).length;
  const current = steps.find(step => !state.lessonProgress[step.id]);
  el.todayProgressText.textContent = `${completed} / ${steps.length}`;
  el.todayLessonDetails.classList.add('hidden');
  el.toggleLessonBtn.textContent = '查看学习任务';

  if (!current) {
    currentTodayStepId = null;
    el.todayLessonTitle.textContent = '这条学习路线已全部完成';
    el.todayLessonSummary.textContent = '可以继续做正式测试、薄弱专项，或进入下一轮深化学习。';
    el.todayLessonChips.innerHTML = '<span class="chip">✅ 路线完成</span>';
    el.todayLessonDetails.innerHTML = '';
    el.completeLessonBtn.disabled = true;
    el.completeLessonBtn.textContent = '已全部完成';
    el.toggleLessonBtn.disabled = true;
    return;
  }

  currentTodayStepId = current.id;
  el.todayLessonTitle.textContent = current.title;
  el.todayLessonSummary.textContent = current.summary;
  el.todayLessonChips.innerHTML = (current.keyPoints || []).map(point => `<span class="chip">${point}</span>`).join('');
  el.todayLessonDetails.innerHTML = `
    <strong>今天要做什么</strong>
    <p>${current.task}</p>
    <strong>建议输出</strong>
    <p>${current.output}</p>
  `;
  el.completeLessonBtn.disabled = false;
  el.completeLessonBtn.textContent = '标记完成';
  el.toggleLessonBtn.disabled = false;
}

function toggleTodayLessonDetails() {
  if (!currentTodayStepId) return;
  const hidden = el.todayLessonDetails.classList.toggle('hidden');
  el.toggleLessonBtn.textContent = hidden ? '查看学习任务' : '收起学习任务';
}

function completeTodayLesson() {
  if (!currentTodayStepId) return;
  state.lessonProgress[currentTodayStepId] = new Date().toISOString();
  saveState();
  renderTodayLearning();
  renderRoute();
}

function renderRoute() {
  const curriculum = curricula[selectedDomainId];
  if (!curriculum) {
    el.routeCard.classList.add('hidden');
    return;
  }
  el.routeCard.classList.remove('hidden');
  el.routeTitle.textContent = curriculum.title;
  el.routeSource.textContent = curriculum.source || '';
  const steps = curriculum.steps || [];
  const completed = steps.filter(step => state.lessonProgress[step.id]).length;
  const firstIncomplete = steps.findIndex(step => !state.lessonProgress[step.id]);
  el.routeProgressText.textContent = `完成 ${completed} / ${steps.length}`;
  el.routeList.innerHTML = '';

  steps.forEach((step, index) => {
    const done = Boolean(state.lessonProgress[step.id]);
    const current = !done && index === firstIncomplete;
    const item = document.createElement('div');
    item.className = `route-item${done ? ' done' : ''}${current ? ' current' : ''}`;
    item.innerHTML = `
      <span class="route-index">${done ? '✓' : index + 1}</span>
      <div class="route-copy"><strong>${step.title}</strong><span>${step.summary}</span></div>
      <button class="ghost small-button route-toggle" data-step-id="${step.id}">${done ? '取消完成' : '标记完成'}</button>
    `;
    el.routeList.append(item);
  });

  el.routeList.querySelectorAll('[data-step-id]').forEach(button => {
    button.addEventListener('click', () => toggleRouteStep(button.dataset.stepId));
  });
}

function toggleRouteStep(stepId) {
  if (state.lessonProgress[stepId]) delete state.lessonProgress[stepId];
  else state.lessonProgress[stepId] = new Date().toISOString();
  saveState();
  renderTodayLearning();
  renderRoute();
}

function renderWeakSpots() {
  const recent = state.history
    .filter(item => historyDomain(item) === selectedDomainId)
    .slice(-100);
  const stats = new Map();

  recent.forEach(item => {
    const category = item.category || '未分类';
    const current = stats.get(category) || { category, attempts: 0, score: 0, again: 0, hard: 0 };
    current.attempts += 1;
    if (item.rating === 'again') {
      current.score += 2;
      current.again += 1;
    } else if (item.rating === 'hard') {
      current.score += 1;
      current.hard += 1;
    }
    stats.set(category, current);
  });

  const weak = [...stats.values()]
    .map(item => ({ ...item, weakness: item.attempts ? Math.round((item.score / (item.attempts * 2)) * 100) : 0 }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.weakness - a.weakness || b.attempts - a.attempts)
    .slice(0, 3);

  el.weakList.innerHTML = '';
  if (!recent.length) {
    currentWeakCategory = null;
    el.weakDrillBtn.disabled = true;
    el.weakList.innerHTML = '<div class="weak-empty">还没有足够的复习记录。完成几轮“认识 / 模糊 / 不认识”后，这里会自动生成薄弱知识。</div>';
    return;
  }
  if (!weak.length) {
    currentWeakCategory = null;
    el.weakDrillBtn.disabled = true;
    el.weakList.innerHTML = '<div class="weak-empty">最近记录里暂时没有“模糊 / 不认识”的知识点，继续保持。</div>';
    return;
  }

  currentWeakCategory = weak[0].category;
  el.weakDrillBtn.disabled = false;
  weak.forEach(item => {
    const row = document.createElement('div');
    row.className = 'weak-item';
    row.innerHTML = `
      <div><strong>${item.category}</strong><span class="muted small">最近 ${item.attempts} 次：🟡 ${item.hard} / ❌ ${item.again}</span></div>
      <div><div class="weak-meter"><span style="width:${Math.max(8, item.weakness)}%"></span></div><div class="weak-score">薄弱度 ${item.weakness}%</div></div>
    `;
    el.weakList.append(row);
  });
}

function startWeakDrill() {
  if (!currentWeakCategory) return;
  const queue = cards
    .filter(card => card.domain === selectedDomainId && (card.category || '未分类') === currentWeakCategory)
    .slice(0, 10);
  if (!queue.length) return;
  beginSession(queue, 'weak');
}

function renderVisualSources() {
  const sources = visualSources[selectedDomainId] || [];
  if (!sources.length) {
    el.visualCard.classList.add('hidden');
    return;
  }
  el.visualCard.classList.remove('hidden');
  el.visualSourceList.innerHTML = '';
  sources.forEach(source => {
    const row = document.createElement('div');
    row.className = 'visual-source';
    row.innerHTML = `
      <div><strong>${source.name}</strong><span>${source.focus}</span></div>
      <a class="visual-link" href="${source.url}" target="_blank" rel="noopener noreferrer">打开官方页</a>
    `;
    el.visualSourceList.append(row);
  });
}

function renderTestState() {
  const test = tests[selectedDomainId];
  if (!test) {
    el.startTestBtn.disabled = true;
    el.startTestBtn.textContent = '该模块测试独立迭代';
    el.testHint.textContent = selectedDomainId === 'korean' ? '韩语测试将在韩语专项迭代中设计。' : '当前暂无正式测试。';
    return;
  }
  el.startTestBtn.disabled = false;
  el.startTestBtn.textContent = '开始 100 分验收';
  el.testHint.textContent = test.description;
}

function startFormalTest() {
  const test = tests[selectedDomainId];
  if (!test) return;
  testSession = {
    domainId: selectedDomainId,
    title: test.title,
    questions: shuffle([...test.questions]),
    index: 0,
    score: 0,
    answers: [],
    locked: false,
  };
  showView('test');
  renderTestQuestion();
}

function renderTestQuestion() {
  if (!testSession) return;
  if (testSession.index >= testSession.questions.length) {
    finishFormalTest();
    return;
  }
  const q = testSession.questions[testSession.index];
  const current = testSession.index + 1;
  const total = testSession.questions.length;
  testSession.locked = false;
  el.testProgressText.textContent = `${current} / ${total}`;
  el.testProgressBar.style.width = `${((current - 1) / total) * 100}%`;
  el.testTitle.textContent = testSession.title;
  el.testQuestion.textContent = q.q;
  el.testFeedback.classList.add('hidden');
  el.nextTestBtn.classList.add('hidden');
  el.testOptions.innerHTML = '';

  q.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'test-option';
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener('click', () => answerTestQuestion(index));
    el.testOptions.append(button);
  });
}

function answerTestQuestion(selectedIndex) {
  if (!testSession || testSession.locked) return;
  testSession.locked = true;
  const q = testSession.questions[testSession.index];
  const correct = selectedIndex === q.answer;
  if (correct) testSession.score += 10;
  testSession.answers.push({
    question: q.q,
    selectedIndex,
    correctIndex: q.answer,
    correct,
    explanation: q.explanation,
  });

  [...el.testOptions.children].forEach((button, index) => {
    button.disabled = true;
    if (index === q.answer) button.classList.add('correct');
    if (index === selectedIndex && !correct) button.classList.add('wrong');
  });

  el.testFeedback.textContent = `${correct ? '✅ 正确' : '❌ 这题答错了'}｜${q.explanation}`;
  el.testFeedback.classList.remove('hidden');
  el.nextTestBtn.textContent = testSession.index === testSession.questions.length - 1 ? '查看成绩' : '下一题';
  el.nextTestBtn.classList.remove('hidden');
}

function nextTestQuestion() {
  if (!testSession?.locked) return;
  testSession.index += 1;
  renderTestQuestion();
}

function finishFormalTest() {
  if (!testSession) return;
  const result = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    domainId: testSession.domainId,
    title: testSession.title,
    score: testSession.score,
    completedAt: new Date().toISOString(),
    answers: testSession.answers,
  };
  state.testResults.push(result);
  if (state.testResults.length > 100) state.testResults = state.testResults.slice(-100);
  saveState();

  el.testScore.textContent = result.score;
  el.testResultMessage.textContent = scoreMessage(result.score);
  el.testResultBreakdown.innerHTML = '';
  const wrong = result.answers.filter(answer => !answer.correct);
  if (!wrong.length) {
    el.testResultBreakdown.innerHTML = '<div class="result-row">全部答对。下一步可以把测试升级到开放题和场景题。</div>';
  } else {
    wrong.forEach(answer => {
      const row = document.createElement('div');
      row.className = 'result-row';
      row.textContent = `需复习：${answer.question}｜${answer.explanation}`;
      el.testResultBreakdown.append(row);
    });
  }
  el.testProgressBar.style.width = '100%';
  testSession = null;
  showView('testResult');
}

function exitFormalTest() {
  if (!testSession) {
    showView('home');
    return;
  }
  if (window.confirm('退出本次正式测试？未完成的测试不会计分。')) {
    testSession = null;
    showView('home');
  }
}

function scoreMessage(score) {
  if (score >= 90) return '基础框架掌握稳定。下一步重点做场景题、系统串联题和开放题。';
  if (score >= 70) return '基本掌握，但仍有明确薄弱点。先复习错题，再做一轮主动回忆。';
  return '基础知识还有明显缺口。建议回到学习路线和薄弱知识，完成一轮复习后再测。';
}

function renderLastTestResult() {
  const last = [...state.testResults].reverse().find(result => result.domainId === selectedDomainId);
  if (!last) {
    el.lastTestResult.textContent = '当前领域还没有正式测试记录。';
    return;
  }
  const date = new Date(last.completedAt);
  el.lastTestResult.textContent = `最近一次正式测试：${last.score} / 100｜${date.toLocaleString()}`;
}

function getDueCards(domainId) {
  const now = Date.now();
  return cards
    .filter(card => card.domain === domainId)
    .filter(card => {
      const record = state.schedules[card.id];
      if (!record) return true;
      const due = getDueTimestamp(record);
      return !Number.isFinite(due) || due <= now;
    })
    .sort((a, b) => getDueTimestamp(state.schedules[a.id]) - getDueTimestamp(state.schedules[b.id]));
}

function getDueTimestamp(record) {
  if (!record) return 0;
  if (record.engine === 'fsrs' && record.card) {
    const value = record.card.due;
    const time = typeof value === 'number' ? value : new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
  }
  const time = Number(record.due);
  return Number.isFinite(time) ? time : 0;
}

function startSession() {
  const domain = domainById.get(selectedDomainId);
  if (!domain || domain.status !== 'active') return;
  const available = getDueCards(selectedDomainId);
  if (!available.length) return;
  const sizeValue = el.sessionSize.value;
  const limit = sizeValue === 'all' ? available.length : Number(sizeValue);
  beginSession(available.slice(0, Math.max(1, limit)), 'due');
}

function beginSession(queue, mode) {
  session = {
    domainId: selectedDomainId,
    mode,
    queue,
    index: 0,
    counts: { good: 0, hard: 0, again: 0 },
  };
  showView('review');
  renderCurrentCard();
}

function currentCard() {
  if (!session) return null;
  return session.queue[session.index] || null;
}

function renderCurrentCard() {
  if (!session || session.index >= session.queue.length) {
    finishSession();
    return;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  ratingLocked = false;
  const card = currentCard();
  const current = session.index + 1;
  const total = session.queue.length;
  const domain = domainById.get(card.domain);

  el.progressText.textContent = `${current} / ${total}`;
  el.progressBar.style.width = `${((current - 1) / total) * 100}%`;
  el.deckLabel.textContent = domain ? `${domain.icon} ${domain.name}` : card.deck;
  el.categoryLabel.textContent = card.category || '未分类';
  el.questionText.textContent = card.question;
  el.answerLabel.textContent = card.promptLabel || '先写下你的理解';
  el.selfAnswer.placeholder = card.placeholder || '不用追求完整，先把你真正能回忆出来的内容写下来……';
  el.selfAnswer.value = '';
  el.referenceAnswer.textContent = card.answer;
  el.referenceBlock.classList.add('hidden');
  el.revealBtn.classList.remove('hidden');
  el.speakAnswerBtn.classList.add('hidden');

  if (card.image) {
    el.questionImage.src = card.image;
    el.questionImage.classList.remove('hidden');
  } else {
    el.questionImage.removeAttribute('src');
    el.questionImage.classList.add('hidden');
  }

  el.audioPromptBtn.classList.toggle('hidden', !card.audioText);
  el.audioPromptBtn.textContent = card.audioText ? '🔊 播放韩语' : '';
  setTimeout(() => el.selfAnswer.focus(), 80);
}

function revealAnswer() {
  const card = currentCard();
  if (!card) return;
  el.referenceBlock.classList.remove('hidden');
  el.revealBtn.classList.add('hidden');
  el.speakAnswerBtn.classList.toggle('hidden', !card.tts);
  requestAnimationFrame(() => {
    el.referenceBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function speakKorean(text) {
  if (!text) return;
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    window.alert('当前浏览器不支持系统语音朗读。');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const koreanVoice = voices.find(voice => (voice.lang || '').toLowerCase().startsWith('ko'));
  if (koreanVoice) utterance.voice = koreanVoice;
  window.speechSynthesis.speak(utterance);
}

function rateCurrentCard(rating) {
  if (!session || ratingLocked) return;
  ratingLocked = true;
  const card = currentCard();
  const now = new Date();
  const answer = el.selfAnswer.value.trim();
  scheduleCard(card.id, rating, now);

  state.history.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    cardId: card.id,
    domain: card.domain,
    deck: card.deck,
    category: card.category || '',
    modality: card.audioText ? 'listening' : 'recall',
    sessionMode: session.mode,
    rating,
    answer,
    reviewedAt: now.toISOString(),
    day: localDayKey(now),
    engine: engineName,
  });

  if (state.history.length > 5000) state.history = state.history.slice(-5000);
  session.counts[rating] += 1;
  saveState();
  session.index += 1;
  renderCurrentCard();
}

function scheduleCard(cardId, rating, now) {
  if (scheduler && fsrsLib) {
    try {
      const previous = state.schedules[cardId];
      let fsrsCard;
      if (previous?.engine === 'fsrs' && previous.card) fsrsCard = deserializeFsrsCard(previous.card);
      else fsrsCard = fsrsLib.createEmptyCard(now);

      const grade = rating === 'again'
        ? fsrsLib.Rating.Again
        : rating === 'hard'
          ? fsrsLib.Rating.Hard
          : fsrsLib.Rating.Good;
      const result = scheduler.next(fsrsCard, now, grade);
      state.schedules[cardId] = {
        engine: 'fsrs',
        card: serializeFsrsCard(result.card),
        lastRating: rating,
        updatedAt: now.toISOString(),
      };
      return;
    } catch (error) {
      console.warn('FSRS 排程失败，本题改用离线排程。', error);
    }
  }
  scheduleFallback(cardId, rating, now);
}

function serializeFsrsCard(card) {
  return {
    ...card,
    due: new Date(card.due).getTime(),
    last_review: card.last_review ? new Date(card.last_review).getTime() : null,
  };
}

function deserializeFsrsCard(card) {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  };
}

function scheduleFallback(cardId, rating, now) {
  const previous = state.schedules[cardId] || {};
  const reps = (previous.reps || 0) + 1;
  let intervalDays;
  if (rating === 'again') intervalDays = 10 / (24 * 60);
  else if (rating === 'hard') intervalDays = Math.max(1, Math.round((previous.intervalDays || 1) * 1.6));
  else intervalDays = Math.max(3, Math.round((previous.intervalDays || 2) * 2.4));

  state.schedules[cardId] = {
    engine: 'fallback',
    due: now.getTime() + intervalDays * 24 * 60 * 60 * 1000,
    intervalDays,
    reps,
    lapses: (previous.lapses || 0) + (rating === 'again' ? 1 : 0),
    lastRating: rating,
    updatedAt: now.toISOString(),
  };
}

function finishSession() {
  if (!session) return;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  const { good, hard, again } = session.counts;
  const total = good + hard + again;
  const knownRate = total ? Math.round((good / total) * 100) : 0;
  el.summaryGood.textContent = good;
  el.summaryHard.textContent = hard;
  el.summaryAgain.textContent = again;
  el.summaryMessage.textContent = total
    ? `本轮独立掌握率 ${knownRate}%。模糊和不认识会进入薄弱知识统计，并更早回来。`
    : '本轮没有记录。';
  el.progressBar.style.width = '100%';
  session = null;
  renderAllHome();
  showView('summary');
}

function exitSession() {
  if (!session) {
    showView('home');
    return;
  }
  const hasProgress = session.index > 0;
  const message = hasProgress ? '退出本轮复习？已经完成的题目会保留记录。' : '退出本轮复习？';
  if (window.confirm(message)) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    session = null;
    renderAllHome();
    showView('home');
  }
}

function historyDomain(item) {
  if (item.domain) return item.domain;
  const card = cardById.get(item.cardId);
  if (card?.domain) return card.domain;
  if (item.deck === '手机产品专家') return 'phone';
  if (item.deck === '韩语') return 'korean';
  if (item.deck === '商圈与零售') return 'retail';
  if (item.deck === '行业与商业') return 'industry';
  return 'unknown';
}

function exportLearningData() {
  const payload = {
    app: 'Personal Learning OS',
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `learning-os-backup-${localDayKey(new Date())}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importLearningData(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const imported = parsed.state || parsed;
    if (!imported || typeof imported !== 'object') throw new Error('invalid');
    if (!window.confirm('导入会覆盖当前设备上的学习进度。继续吗？')) return;
    state = normalizeState(imported);
    saveState();
    selectedDomainId = resolveInitialDomain();
    renderDomainGrid();
    renderAllHome();
    window.alert('学习数据已导入。');
  } catch (error) {
    console.warn('导入失败', error);
    window.alert('无法读取这个备份文件，请确认它来自 Learning OS。');
  }
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function showView(name) {
  el.homeView.classList.toggle('hidden', name !== 'home');
  el.reviewView.classList.toggle('hidden', name !== 'review');
  el.testView.classList.toggle('hidden', name !== 'test');
  el.testResultView.classList.toggle('hidden', name !== 'testResult');
  el.summaryView.classList.toggle('hidden', name !== 'summary');
  if (name === 'home') renderAllHome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function localDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function updateNetworkState() {
  el.networkState.textContent = navigator.onLine ? '在线' : '离线';
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('./sw.js', { scope: './' });
  } catch (error) {
    console.warn('Service Worker 注册失败。', error);
  }
}
