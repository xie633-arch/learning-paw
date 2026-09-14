import { chromium } from 'playwright-core';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173/';
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const STORAGE_KEY = 'personal-learning-os:v0.1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME_PATH,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  await page.addInitScript(({ key }) => {
    const now = new Date().toISOString();
    const state = {
      version: 3,
      schedules: {},
      history: [],
      lessonProgress: { 'ko-hangul-gate': now },
      testResults: [],
      assessmentAttempts: [{
        schema_version: '1.0',
        attempt_id: 'attempt-korean-vocab-ui-gate',
        assessment_id: 'ko-hangul-gate-v1',
        domain: 'korean',
        stage_id: 'hangulGate',
        started_at: now,
        completed_at: now,
        score: 100,
        max_score: 100,
        section_scores: {},
        item_results: [],
        source: 'korean_vocab_ui_smoke',
        passed: true,
      }],
      preferences: { lastDomain: 'korean' },
    };
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY });

  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'throw new Error("CI simulated FSRS offline");',
  }));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__KOREAN_VOCAB_UI_V15__?.version));
  await page.waitForFunction(() => Boolean(window.__KOREAN_VOCAB_V15__?.unlocked?.length));

  const domainName = (await page.locator('#domainName').textContent())?.trim();
  assert(domainName === '韩语', `expected Korean domain, got ${domainName}`);

  const unlockedCount = await page.evaluate(() => window.__KOREAN_VOCAB_V15__.unlocked.length);
  assert(unlockedCount === 4, `Day 8 should unlock four starter vocab cards, got ${unlockedCount}`);

  const panelText = (await page.locator('#trainingHub .training-panel').first().textContent()) || '';
  assert(panelText.includes('词汇记忆'), `Korean training panel not converted to vocab memory: ${panelText}`);
  assert(panelText.includes('单词与例句双发音'), `audio-first copy missing: ${panelText}`);

  await page.locator('#startBtn').click();
  await page.waitForFunction(() => !document.querySelector('#reviewView')?.classList.contains('hidden'));
  await page.waitForFunction(() => Boolean(document.querySelector('#reviewView .review-card')?.dataset.kv15Id));

  const vocabId = await page.locator('#reviewView .review-card').getAttribute('data-kv15-id');
  assert(vocabId === 'ko-vocab-001', `expected first vocabulary card, got ${vocabId}`);

  const prompt = (await page.locator('#questionText').textContent())?.trim();
  assert(prompt === '한국', `new vocabulary should start Korean→meaning, got ${prompt}`);
  await page.locator('#audioPromptBtn').waitFor({ state: 'visible' });
  assert((await page.locator('#audioPromptBtn').textContent())?.includes('听单词发音'), 'word audio button missing');
  assert(await page.locator('#selfAnswer').isHidden(), 'recognition card should not force typing before reveal');

  await page.evaluate(() => {
    window.__kvSpoken = [];
    try {
      window.speechSynthesis.speak = utterance => window.__kvSpoken.push(utterance.text);
      window.speechSynthesis.cancel = () => {};
    } catch {}
  });
  await page.locator('#audioPromptBtn').click();
  await page.waitForTimeout(50);
  const spokenWord = await page.evaluate(() => window.__kvSpoken?.at(-1) || '');
  assert(spokenWord === '한국', `word audio should speak 한국, got ${spokenWord}`);

  await page.locator('#revealBtn').click();
  await page.locator('#referenceBlock').waitFor({ state: 'visible' });
  const answerText = (await page.locator('#referenceAnswer').textContent()) || '';
  assert(answerText.includes('韩国'), `meaning missing from vocab answer: ${answerText}`);
  assert(answerText.includes('한국에 가요.'), `Korean example missing: ${answerText}`);
  assert(answerText.includes('去韩国。'), `Chinese example meaning missing: ${answerText}`);

  const exampleButton = page.locator('#speakAnswerBtn');
  assert((await exampleButton.textContent())?.includes('听例句'), 'example audio button missing');
  await exampleButton.click();
  await page.waitForTimeout(50);
  const spokenExample = await page.evaluate(() => window.__kvSpoken?.at(-1) || '');
  assert(spokenExample === '한국에 가요.', `example audio should speak Korean sentence, got ${spokenExample}`);

  const goodText = (await page.locator('[data-rating="good"]').textContent()) || '';
  const hardText = (await page.locator('[data-rating="hard"]').textContent()) || '';
  const againText = (await page.locator('[data-rating="again"]').textContent()) || '';
  assert(goodText.includes('记得'), `good rating should be language-memory copy: ${goodText}`);
  assert(hardText.includes('模糊'), `hard rating should be language-memory copy: ${hardText}`);
  assert(againText.includes('忘记'), `again rating should be language-memory copy: ${againText}`);

  await page.locator('[data-rating="good"]').click();
  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.history || []).some(item => (item.cardId || item.card_id) === 'ko-vocab-001' && item.rating === 'good');
  }, STORAGE_KEY);

  await context.close();
  console.log('Korean vocab UI smoke OK: Hangul-gated vocabulary uses one-word cards, word/example TTS and existing memory ratings/storage.');
} finally {
  await browser.close();
}
