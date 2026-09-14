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
  page.setDefaultTimeout(10000);
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: 'throw new Error("CI simulated FSRS offline");' }));
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__ADAPTIVE_METADATA_V11__?.version === '0.11.0');
  await page.waitForFunction(() => window.__ADAPTIVE_LEARNING_V11__?.version === '0.11.0');

  // 1) Ordinary recall: an "again" rating becomes a recall-gap ErrorRecord.
  await page.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state.history = [
      ...(state.history || []),
      {
        id: 'adaptive-general-recall-1',
        cardId: 'hardware-soc-001',
        domain: 'phone',
        deck: '手机产品专家',
        category: 'SoC / 性能',
        modality: 'recall',
        sessionMode: 'due',
        rating: 'again',
        answer: '',
        reviewedAt: '2026-09-14T12:00:00+08:00',
        day: '2026-09-14',
        engine: 'FSRS',
      },
    ];
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);
  await page.waitForFunction(() => window.__LEARNER_DATA_V1__?.state_version === 5);

  await page.locator('#mobileBottomNav button[data-target="weakCard"]').click();
  await page.locator('#adaptiveLearningV11').waitFor({ state: 'visible' });
  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record => record.content_id === 'hardware-soc-001' && record.status === 'active' && record.error_type === 'recall_gap');
  }, STORAGE_KEY);
  const recallRow = page.locator('.al-error').filter({ hasText: 'SoC 是什么？' });
  assert(await recallRow.count() === 1, 'recall-gap item did not appear in generic Error Bank');
  await recallRow.locator('[data-adaptive-revalidate]').click();
  await page.locator('#adaptiveLearningOverlay').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: '查看参考答案' }).click();
  await page.locator('#adaptiveLearningOverlay .al-rating button').nth(0).click();
  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record => record.content_id === 'hardware-soc-001' && record.status === 'resolved');
  }, STORAGE_KEY);
  await page.getByRole('button', { name: '返回薄弱页' }).click();

  // 2) Formal test: stable metadata turns a wrong answer into a concept/skill error.
  await page.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state.testResults = [
      ...(state.testResults || []),
      {
        id: 'adaptive-formal-1',
        domainId: 'phone',
        title: '手机产品专家｜100 分基础验收',
        score: 0,
        completedAt: '2026-09-14T12:05:00+08:00',
        answers: [{
          question: 'SoC 最准确的描述是？',
          selectedIndex: 0,
          correctIndex: 1,
          correct: false,
          explanation: 'SoC 通常集成 CPU、GPU、NPU、ISP、Modem 等多类模块。',
        }],
      },
    ];
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);

  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record => record.concept_id === 'phone-soc-system' && record.skill === 'technical_architecture' && record.status === 'active');
  }, STORAGE_KEY);
  const formalRow = page.locator('.al-error').filter({ hasText: 'SoC 最准确的描述是？' });
  assert(await formalRow.count() === 1, 'formal-test concept error did not appear in generic Error Bank');
  await formalRow.locator('[data-adaptive-revalidate]').click();
  const formalOptions = page.locator('#adaptiveLearningOverlay .al-option');
  await formalOptions.nth(1).click();
  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record => record.concept_id === 'phone-soc-system' && record.status === 'resolved');
  }, STORAGE_KEY);
  await page.locator('#adaptiveLearningOverlay .al-row button').filter({ hasText: '关闭' }).click();

  // 3) Korean Exit Check: stored item results are mirrored into standard StudyEvents.
  await page.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state.koreanExitChecks ||= {};
    state.koreanExitChecks['ko-day-008'] = {
      completed_at: '2026-09-14T12:10:00+08:00',
      score: 0,
      max_score: 2,
      passed: false,
      results: [{ index: 0, prompt: '下面哪个词有 받침？', correct: false, selected: 0 }],
    };
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);

  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record => record.concept_id === 'korean-ko-day-008-01' && record.status === 'active');
  }, STORAGE_KEY);
  await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
  await page.locator('[data-domain="korean"]').click();
  await page.locator('#mobileBottomNav button[data-target="weakCard"]').click();
  const koreanRow = page.locator('.al-error').filter({ hasText: '下面哪个词有 받침？' });
  assert(await koreanRow.count() === 1, 'Korean Exit Check error did not appear in generic Error Bank');
  await koreanRow.locator('[data-adaptive-revalidate]').click();
  const koreanOptions = page.locator('#adaptiveLearningOverlay .al-option');
  await koreanOptions.nth(2).click();
  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record => record.concept_id === 'korean-ko-day-008-01' && record.status === 'resolved');
  }, STORAGE_KEY);

  const dailyCount = Number((await page.locator('#dueCount').textContent()) || 0);
  assert(Number.isFinite(dailyCount) && dailyCount <= 10, `generic adaptive loop inflated daily plan beyond 10: ${dailyCount}`);

  await context.close();
  console.log('Adaptive general smoke OK: recall + formal test + Korean Exit Check -> Error Bank -> targeted revalidation -> resolved.');
} finally {
  await browser.close();
}
