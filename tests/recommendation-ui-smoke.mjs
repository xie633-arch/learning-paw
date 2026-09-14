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
  page.setDefaultTimeout(12000);
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'throw new Error("CI simulated FSRS offline");',
  }));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__RECOMMENDATION_UI_V13__?.render));
  await page.waitForFunction(() => Boolean(window.__LEARNING_PAW_UX_V08__?.activateTab));

  async function selectDomain(domainId) {
    await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
    await page.waitForFunction(() => !document.querySelector('#domainHub')?.classList.contains('ux-tab-inactive'));
    await page.locator(`[data-domain="${domainId}"]`).click();
    await page.locator('#mobileBottomNav button[data-target="todayLearningCard"]').click();
    await page.locator('#recommendationFocusV13').waitFor({ state: 'visible' });
    await page.waitForFunction(id => window.__RECOMMENDATION_UI_V13__?.current?.domainId === id, domainId);
  }

  await selectDomain('retail');
  let text = (await page.locator('#recommendationFocusV13').textContent()) || '';
  assert(text.includes('无需插队'), `fresh learner should not receive fabricated weakness recommendation: ${text}`);

  await page.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state.learnerSignals = state.learnerSignals || {};
    state.errorRecords = Array.isArray(state.errorRecords) ? state.errorRecords : [];
    state.learnerSignals['retail.need-state::need-state'] = {
      concept_id: 'retail.need-state',
      content_id: 'retail-foundation-01',
      domain: 'retail',
      skill: 'need-state',
      attempts: 4,
      ratings: { good: 0, hard: 0, again: 0 },
      assessment: { correct: 1, incorrect: 3 },
      revalidations: { passed: 0, failed: 0 },
      last_seen_at: new Date().toISOString(),
    };
    state.errorRecords = state.errorRecords.filter(record => record.error_id !== 'err-rec-ui-retail');
    state.errorRecords.push({
      error_id: 'err-rec-ui-retail',
      concept_id: 'retail.need-state',
      content_id: 'retail-foundation-01',
      domain: 'retail',
      skill: 'need-state',
      error_type: 'assessment_error',
      severity: 'high',
      occurrences: 3,
      status: 'active',
      last_seen_at: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(new Event('learning-data-updated'));
  }, STORAGE_KEY);

  await page.waitForFunction(() => window.__RECOMMENDATION_UI_V13__?.current?.top?.concept_id === 'retail.need-state');
  text = (await page.locator('#recommendationFocusV13').textContent()) || '';
  assert(text.includes('高优先级'), `strong learner evidence should surface high priority: ${text}`);
  assert(text.includes('针对性复习后重验证'), `recommendation action missing: ${text}`);
  assert(text.includes('客观验收错误'), `recommendation explanation missing: ${text}`);

  // Recommendation is domain-scoped; the retail weakness must not leak into industry.
  await selectDomain('industry');
  text = (await page.locator('#recommendationFocusV13').textContent()) || '';
  assert(text.includes('无需插队'), `retail recommendation leaked into industry: ${text}`);

  // Once the same Concept × Skill is resolved through successful revalidation, the focus disappears.
  await selectDomain('retail');
  await page.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    const signal = state.learnerSignals?.['retail.need-state::need-state'];
    if (signal) signal.revalidations = { passed: 1, failed: 0 };
    const record = (state.errorRecords || []).find(item => item.error_id === 'err-rec-ui-retail');
    if (record) record.status = 'resolved';
    localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(new Event('learning-data-updated'));
  }, STORAGE_KEY);

  await page.waitForFunction(() => !window.__RECOMMENDATION_UI_V13__?.current?.top);
  text = (await page.locator('#recommendationFocusV13').textContent()) || '';
  assert(text.includes('无需插队'), `resolved recommendation stayed visible: ${text}`);

  await context.close();
  console.log('Recommendation UI smoke OK: Today Plan shows explainable Concept×Skill focus, stays domain-scoped, and removes resolved weaknesses.');
} finally {
  await browser.close();
}
