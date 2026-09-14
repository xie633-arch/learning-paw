import { KOREAN_VOCAB_ITEMS_V15 } from './korean-vocab-v15.js';
import { hangulGatePassed } from './korean-hangul-gate-compat-v071.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.15.0';
const itemById = new Map(KOREAN_VOCAB_ITEMS_V15.map(item => [item.id, item]));
let renderQueued = false;

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function reviewCount(cardId) {
  return (readState().history || []).filter(item => (item.cardId || item.card_id) === cardId).length;
}

function modeForCount(count) {
  if (count <= 0) return 'recognition';
  if (count === 1) return 'recall';
  if (count === 2) return 'recognition';
  if (count === 3) return 'listening';
  if (count === 4) return 'recall';
  return count % 3 === 0 ? 'listening' : count % 3 === 1 ? 'recall' : 'context';
}

function speak(text, rate = .84) {
  if (!text || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return false;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = rate;
  const voice = speechSynthesis.getVoices().find(v => (v.lang || '').toLowerCase().startsWith('ko'));
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
  return true;
}

function ensureStyles() {
  if (document.querySelector('#koreanVocabV15Styles')) return;
  const style = document.createElement('style');
  style.id = 'koreanVocabV15Styles';
  style.textContent = `
    .review-card.kv15-card{max-width:680px;margin-inline:auto;text-align:center;padding:28px 24px}.review-card.kv15-card .question-meta{justify-content:center}.review-card.kv15-card .question{font-size:clamp(34px,8vw,58px);line-height:1.25;margin:28px 0 18px;letter-spacing:-.02em}.review-card.kv15-card.kv15-recall .question,.review-card.kv15-card.kv15-context .question{font-size:clamp(26px,6vw,42px)}.review-card.kv15-card.kv15-listening .question{font-size:22px;color:#667085}.review-card.kv15-card .audio-action{margin:0 auto 18px;min-width:150px;min-height:46px;border-radius:999px}.review-card.kv15-card #selfAnswer{max-width:460px;margin-inline:auto;min-height:74px;text-align:center;font-size:20px}.review-card.kv15-card .answer-label{display:block;text-align:center}.review-card.kv15-card.kv15-recognition #answerLabel,.review-card.kv15-card.kv15-recognition #selfAnswer,.review-card.kv15-card.kv15-recognition #selfAnswer + .muted{display:none}.kv15-answer{display:grid;gap:10px;text-align:center}.kv15-word{font-size:34px;font-weight:850;letter-spacing:-.02em}.kv15-meaning{font-size:20px;font-weight:750}.kv15-meta{display:flex;justify-content:center;gap:7px;flex-wrap:wrap}.kv15-meta span{padding:4px 8px;border-radius:999px;background:#eef2f6;color:#667085;font-size:11px;font-weight:750}.kv15-example{margin-top:6px;padding:14px;border-radius:16px;background:#f6f7f9}.kv15-example strong{display:block;font-size:19px;margin-bottom:5px}.kv15-example span{display:block;color:#667085;font-size:13px}.review-card.kv15-card .reference-title{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#98a2b3}.review-card.kv15-card .self-rate-title{text-align:center}.review-card.kv15-card .rating-grid{max-width:520px;margin-inline:auto}.kv15-mode-note{font-size:11px;color:#98a2b3;margin:-4px 0 18px}.kv15-gate-note{margin-top:10px;padding:10px 12px;border-radius:12px;background:#fff8e8;color:#7a5716;font-size:12px;line-height:1.55}
    @media(prefers-color-scheme:dark){.kv15-example{background:#242932}.kv15-example span{color:#aeb7c5}.kv15-meta span{background:#2a3039;color:#bbc3cf}.review-card.kv15-card.kv15-listening .question{color:#aeb7c5}.kv15-gate-note{background:#352d20;color:#e6c985}}
  `;
  document.head.append(style);
}

function modeLabel(mode) {
  return ({ recognition:'韩 → 中', recall:'中 → 韩', listening:'听音 → 韩文', context:'场景 → 核心词' })[mode] || '词汇训练';
}

function promptFor(item, mode) {
  if (mode === 'recall') return `“${item.meaning}”用韩语怎么说？`;
  if (mode === 'listening') return '只听声音，写出你听到的韩语';
  if (mode === 'context') return `场景：${item.example_meaning}\n你会用哪个核心词？`;
  return item.word;
}

function decorateAnswer(item) {
  const answer = document.querySelector('#referenceAnswer');
  if (!answer) return;
  answer.innerHTML = `
    <div class="kv15-answer">
      <div class="kv15-word">${item.word}</div>
      <div class="kv15-meaning">${item.meaning}</div>
      <div class="kv15-meta"><span>${item.pos}</span><span>${item.level}</span></div>
      <div class="kv15-example"><strong>${item.example}</strong><span>${item.example_meaning}</span></div>
    </div>`;
}

function resetGenericReview(card) {
  if (!card) return;
  card.classList.remove('kv15-card','kv15-recognition','kv15-recall','kv15-listening','kv15-context');
  delete card.dataset.kv15Id;
  const answerLabel = document.querySelector('#answerLabel');
  const selfAnswer = document.querySelector('#selfAnswer');
  const reveal = document.querySelector('#revealBtn');
  if (answerLabel) answerLabel.textContent = '先写下你的理解';
  if (selfAnswer) { selfAnswer.placeholder = '不用追求完整，先把你真正能回忆出来的内容写下来……'; selfAnswer.rows = 6; }
  if (reveal) reveal.textContent = '查看参考答案';
}

function renderReview() {
  const card = document.querySelector('#reviewView .review-card');
  const question = document.querySelector('#questionText');
  if (!card || !question) return;

  const raw = question.textContent?.trim() || '';
  let id = raw.startsWith('KV15:') ? raw.slice(5) : card.dataset.kv15Id || '';
  const item = itemById.get(id);
  if (!item) {
    if (card.dataset.kv15Id) resetGenericReview(card);
    return;
  }

  card.dataset.kv15Id = id;
  const count = reviewCount(id);
  const mode = modeForCount(count);
  card.classList.remove('kv15-recognition','kv15-recall','kv15-listening','kv15-context');
  card.classList.add('kv15-card', `kv15-${mode}`);

  const desiredPrompt = promptFor(item, mode);
  if (question.textContent !== desiredPrompt) question.textContent = desiredPrompt;
  question.style.whiteSpace = mode === 'context' ? 'pre-line' : '';

  const category = document.querySelector('#categoryLabel');
  if (category) category.textContent = `核心词汇 · ${modeLabel(mode)}`;
  const deck = document.querySelector('#deckLabel');
  if (deck) deck.textContent = `韩语 · ${item.level}`;

  const audio = document.querySelector('#audioPromptBtn');
  if (audio) {
    audio.classList.remove('hidden');
    audio.textContent = mode === 'listening' ? '🔊 播放声音' : '🔊 听单词发音';
  }
  const answerLabel = document.querySelector('#answerLabel');
  if (answerLabel) answerLabel.textContent = mode === 'listening' ? '听到什么就写什么' : '先主动回忆，再看答案';
  const selfAnswer = document.querySelector('#selfAnswer');
  if (selfAnswer) {
    selfAnswer.rows = 2;
    selfAnswer.placeholder = mode === 'listening' ? '用韩语键盘输入你听到的词…' : mode === 'recall' ? '可选：先输入你想到的韩语…' : '可选：先写下你的答案…';
  }
  const reveal = document.querySelector('#revealBtn');
  if (reveal) reveal.textContent = '显示答案';
  const speakAnswer = document.querySelector('#speakAnswerBtn');
  if (speakAnswer) {
    speakAnswer.classList.remove('hidden');
    speakAnswer.textContent = '🔊 听例句';
    if (speakAnswer.dataset.kv15Bound !== id) {
      speakAnswer.dataset.kv15Bound = id;
      speakAnswer.addEventListener('click', event => {
        if (document.querySelector('#reviewView .review-card')?.dataset.kv15Id !== id) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        speak(item.example, .82);
      }, true);
    }
  }

  decorateAnswer(item);

  const ratingGood = document.querySelector('[data-rating="good"]');
  const ratingHard = document.querySelector('[data-rating="hard"]');
  const ratingAgain = document.querySelector('[data-rating="again"]');
  if (ratingGood) ratingGood.innerHTML = '✅<strong>记得</strong><span>可以独立回忆</span>';
  if (ratingHard) ratingHard.innerHTML = '🟡<strong>模糊</strong><span>想到了但不稳定</span>';
  if (ratingAgain) ratingAgain.innerHTML = '❌<strong>忘记</strong><span>需要尽快再见</span>';

  if (mode === 'listening' && card.dataset.kv15AutoPlayed !== `${id}:${count}`) {
    card.dataset.kv15AutoPlayed = `${id}:${count}`;
    window.setTimeout(() => speak(item.word), 180);
  }
}

function syncHome() {
  const korean = document.querySelector('#domainName')?.textContent?.trim() === '韩语';
  if (!korean) return;
  const firstPanel = document.querySelector('#trainingHub .training-panel');
  const start = document.querySelector('#startBtn');
  if (!firstPanel || !start) return;
  const title = firstPanel.querySelector('strong');
  const subtitle = firstPanel.querySelector('span.muted.small');
  const passed = hangulGatePassed(readState());
  if (title) title.textContent = '词汇记忆';
  if (subtitle) subtitle.textContent = passed ? 'FSRS 排程 · 韩→中 / 中→韩 / 听音训练 · 单词与例句双发音' : '韩文字母通关后解锁；先用网课完成字母学习';
  if (passed) start.textContent = '开始韩语词汇训练';

  let note = firstPanel.querySelector('.kv15-gate-note');
  if (!passed) {
    if (!note) {
      note = document.createElement('div');
      note.className = 'kv15-gate-note';
      firstPanel.append(note);
    }
    note.textContent = '当前阶段：站外自学韩文字母 → 回 Learning Paw 参加通关考核。通过后词汇训练与后续课程自动解锁。';
  } else note?.remove();
}

function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  queueMicrotask(() => {
    renderQueued = false;
    renderReview();
    syncHome();
  });
}

ensureStyles();
scheduleRender();
['#questionText','#referenceBlock','#domainName','#todayLessonTitle','#trainingHub'].forEach(selector => {
  const node = document.querySelector(selector);
  if (node) new MutationObserver(scheduleRender).observe(node, { childList:true, subtree:true, characterData:true, attributes:selector === '#referenceBlock', attributeFilter:selector === '#referenceBlock' ? ['class'] : undefined });
});

document.querySelector('#audioPromptBtn')?.addEventListener('click', event => {
  const id = document.querySelector('#reviewView .review-card')?.dataset.kv15Id;
  const item = itemById.get(id);
  if (!item) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  speak(item.word);
}, true);

document.querySelector('#revealBtn')?.addEventListener('click', () => window.setTimeout(scheduleRender, 0));

window.__KOREAN_VOCAB_UI_V15__ = {
  version: VERSION,
  speak,
  render: scheduleRender,
  itemCount: KOREAN_VOCAB_ITEMS_V15.length,
};
