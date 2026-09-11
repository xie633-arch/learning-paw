import { cards, domains } from './cards.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const FSRS_CDN = 'https://cdn.jsdelivr.net/npm/ts-fsrs@5.4.2/+esm';

const domainById = new Map(domains.map(domain => [domain.id, domain]));
const cardById = new Map(cards.map(card => [card.id, card]));

let fsrsLib = null;
let scheduler = null;
let engineName = '简化排程';
let state = loadState();
let selectedDomainId = resolveInitialDomain();
let session = null;
let ratingLocked = false;

const el = {
  homeView: document.querySelector('#homeView'),
  reviewView: document.querySelector('#reviewView'),
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
  sessionSize: document.querySelector('#sessionSize'),
  startBtn: document.querySelector('#startBtn'),
  emptyHint: document.querySelector('#emptyHint'),
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
  networkState: document.querySelector('#networkState'),
};

await init();

async function init() {
  renderDomainGrid();
  renderDomainDetail();
  bindEvents();
  updateNetworkState();
  renderHomeStats();
  registerServiceWorker();
  await initScheduler();
  renderHomeStats();
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
    version: 2,
    schedules: {},
    history: [],
    preferences: { lastDomain: 'phone' },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      schedules: parsed.schedules || {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
      preferences: {
        ...defaultState().preferences,
        ...(parsed.preferences || {}),
      },
    };
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

  renderDomainDetail();
  renderHomeStats();
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

  el.homeLead.textContent = domain.id === 'korean'
    ? '韩语先自己想、自己写、自己听，再看答案；语音对话会沿着同一条学习记录继续。'
    : '今天的目标不是刷分，而是把“好像知道”变成“真的能说出来”。';
}

function bindEvents() {
  el.startBtn.addEventListener('click', startSession);
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

  window.addEventListener('online', updateNetworkState);
  window.addEventListener('offline', updateNetworkState);
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
    el.emptyHint.textContent = '这个领域的训练结构已经预留，题库会在后续阶段接入。';
    el.emptyHint.classList.remove('hidden');
  } else if (!due.length) {
    el.emptyHint.textContent = '当前没有到期卡片，稍后再来即可。';
    el.emptyHint.classList.remove('hidden');
  } else {
    el.emptyHint.classList.add('hidden');
  }
}

function historyDomain(item) {
  if (item.domain) return item.domain;
  const card = cardById.get(item.cardId);
  if (card?.domain) return card.domain;
  if (item.deck === '手机产品专家') return 'phone';
  if (item.deck === '韩语') return 'korean';
  return 'unknown';
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
  const queue = available.slice(0, Math.max(1, limit));

  session = {
    domainId: selectedDomainId,
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
    rating,
    answer,
    reviewedAt: now.toISOString(),
    day: localDayKey(now),
    engine: engineName,
  });

  if (state.history.length > 5000) {
    state.history = state.history.slice(-5000);
  }

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

      if (previous?.engine === 'fsrs' && previous.card) {
        fsrsCard = deserializeFsrsCard(previous.card);
      } else {
        fsrsCard = fsrsLib.createEmptyCard(now);
      }

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

  if (rating === 'again') {
    intervalDays = 10 / (24 * 60);
  } else if (rating === 'hard') {
    intervalDays = Math.max(1, Math.round((previous.intervalDays || 1) * 1.6));
  } else {
    intervalDays = Math.max(3, Math.round((previous.intervalDays || 2) * 2.4));
  }

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
    ? `本轮独立掌握率 ${knownRate}%。模糊和不认识会更早回来，认识的内容会逐步拉长复习间隔。`
    : '本轮没有记录。';

  el.progressBar.style.width = '100%';
  session = null;
  renderHomeStats();
  showView('summary');
}

function exitSession() {
  if (!session) {
    showView('home');
    return;
  }
  const hasProgress = session.index > 0;
  const message = hasProgress
    ? '退出本轮复习？已经完成的题目会保留记录。'
    : '退出本轮复习？';
  if (window.confirm(message)) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    session = null;
    renderHomeStats();
    showView('home');
  }
}

function showView(name) {
  el.homeView.classList.toggle('hidden', name !== 'home');
  el.reviewView.classList.toggle('hidden', name !== 'review');
  el.summaryView.classList.toggle('hidden', name !== 'summary');
  if (name === 'home') {
    renderDomainDetail();
    renderHomeStats();
  }
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
