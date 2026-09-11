import { cards } from './cards.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const FSRS_CDN = 'https://cdn.jsdelivr.net/npm/ts-fsrs@5.4.2/+esm';

let fsrsLib = null;
let scheduler = null;
let engineName = '简化排程';
let state = loadState();
let session = null;
let ratingLocked = false;

const el = {
  homeView: document.querySelector('#homeView'),
  reviewView: document.querySelector('#reviewView'),
  summaryView: document.querySelector('#summaryView'),
  engineBadge: document.querySelector('#engineBadge'),
  dueCount: document.querySelector('#dueCount'),
  reviewedToday: document.querySelector('#reviewedToday'),
  knownToday: document.querySelector('#knownToday'),
  deckSelect: document.querySelector('#deckSelect'),
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
  selfAnswer: document.querySelector('#selfAnswer'),
  revealBtn: document.querySelector('#revealBtn'),
  referenceBlock: document.querySelector('#referenceBlock'),
  referenceAnswer: document.querySelector('#referenceAnswer'),
  summaryGood: document.querySelector('#summaryGood'),
  summaryHard: document.querySelector('#summaryHard'),
  summaryAgain: document.querySelector('#summaryAgain'),
  summaryMessage: document.querySelector('#summaryMessage'),
  backHomeBtn: document.querySelector('#backHomeBtn'),
  networkState: document.querySelector('#networkState'),
};

await init();

async function init() {
  populateDecks();
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
    version: 1,
    schedules: {},
    history: [],
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
    };
  } catch (error) {
    console.warn('读取本地学习记录失败，已使用空记录。', error);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function populateDecks() {
  const decks = [...new Set(cards.map(card => card.deck))].sort();
  el.deckSelect.innerHTML = '';
  el.deckSelect.append(new Option('全部领域', 'all'));
  decks.forEach(deck => el.deckSelect.append(new Option(deck, deck)));
}

function bindEvents() {
  el.deckSelect.addEventListener('change', renderHomeStats);
  el.startBtn.addEventListener('click', startSession);
  el.exitBtn.addEventListener('click', exitSession);
  el.revealBtn.addEventListener('click', revealAnswer);
  el.backHomeBtn.addEventListener('click', () => showView('home'));

  document.querySelectorAll('[data-rating]').forEach(button => {
    button.addEventListener('click', () => rateCurrentCard(button.dataset.rating));
  });

  window.addEventListener('online', updateNetworkState);
  window.addEventListener('offline', updateNetworkState);
}

function renderHomeStats() {
  const selectedDeck = el.deckSelect.value || 'all';
  const due = getDueCards(selectedDeck);
  const today = localDayKey(new Date());
  const todayHistory = state.history.filter(item => item.day === today);

  el.dueCount.textContent = due.length;
  el.reviewedToday.textContent = todayHistory.length;
  el.knownToday.textContent = todayHistory.filter(item => item.rating === 'good').length;
  el.startBtn.disabled = due.length === 0;
  el.emptyHint.classList.toggle('hidden', due.length !== 0);
}

function getDueCards(deck = 'all') {
  const now = Date.now();
  return cards
    .filter(card => deck === 'all' || card.deck === deck)
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
  const deck = el.deckSelect.value || 'all';
  const available = getDueCards(deck);
  if (!available.length) return;

  const sizeValue = el.sessionSize.value;
  const limit = sizeValue === 'all' ? available.length : Number(sizeValue);
  const queue = available.slice(0, Math.max(1, limit));

  session = {
    queue,
    index: 0,
    counts: { good: 0, hard: 0, again: 0 },
  };

  showView('review');
  renderCurrentCard();
}

function renderCurrentCard() {
  if (!session || session.index >= session.queue.length) {
    finishSession();
    return;
  }

  ratingLocked = false;
  const card = session.queue[session.index];
  const current = session.index + 1;
  const total = session.queue.length;

  el.progressText.textContent = `${current} / ${total}`;
  el.progressBar.style.width = `${((current - 1) / total) * 100}%`;
  el.deckLabel.textContent = card.deck;
  el.categoryLabel.textContent = card.category || '未分类';
  el.questionText.textContent = card.question;
  el.selfAnswer.value = '';
  el.referenceAnswer.textContent = card.answer;
  el.referenceBlock.classList.add('hidden');
  el.revealBtn.classList.remove('hidden');

  if (card.image) {
    el.questionImage.src = card.image;
    el.questionImage.classList.remove('hidden');
  } else {
    el.questionImage.removeAttribute('src');
    el.questionImage.classList.add('hidden');
  }

  setTimeout(() => el.selfAnswer.focus(), 80);
}

function revealAnswer() {
  el.referenceBlock.classList.remove('hidden');
  el.revealBtn.classList.add('hidden');
  requestAnimationFrame(() => {
    el.referenceBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function rateCurrentCard(rating) {
  if (!session || ratingLocked) return;
  ratingLocked = true;

  const card = session.queue[session.index];
  const now = new Date();
  const answer = el.selfAnswer.value.trim();

  scheduleCard(card.id, rating, now);

  state.history.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    cardId: card.id,
    deck: card.deck,
    category: card.category || '',
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
  const { good, hard, again } = session.counts;
  const total = good + hard + again;
  const knownRate = total ? Math.round((good / total) * 100) : 0;

  el.summaryGood.textContent = good;
  el.summaryHard.textContent = hard;
  el.summaryAgain.textContent = again;
  el.summaryMessage.textContent = total
    ? `本轮独立掌握率 ${knownRate}%。模糊和不认识都不是失败，它们只是告诉系统哪些内容需要更早回来。`
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
    session = null;
    renderHomeStats();
    showView('home');
  }
}

function showView(name) {
  el.homeView.classList.toggle('hidden', name !== 'home');
  el.reviewView.classList.toggle('hidden', name !== 'review');
  el.summaryView.classList.toggle('hidden', name !== 'summary');
  if (name === 'home') renderHomeStats();
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
