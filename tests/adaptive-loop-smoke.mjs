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
  page.setDefaultTimeout(8000);
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'throw new Error("CI simulated FSRS offline");',
  }));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__PHONE_ADAPTIVE_V10__?.version === '0.10.0');
  await page.waitForFunction(() => window.__LEARNER_DATA_V1__?.state_version === 5);

  await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
  await page.locator('[data-domain="phone"]').click();
  await page.locator('#mobileBottomNav button[data-target="routeCard"]').click();
  await page.locator('#phoneProductLab').waitFor({ state: 'visible' });

  // First case: intentionally answer wrong so Product Lab creates concept-level errors.
  const options = page.locator('#phoneProductLabBody .pl-option');
  await options.nth(0).click();
  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).filter(item => item.skill === 'product_judgment' && item.status === 'active').length === 3;
  }, STORAGE_KEY);

  const afterWrong = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), STORAGE_KEY);
  const labEvents = (afterWrong.studyEvents || []).filter(event => event.source === 'phone_product_lab');
  assert(labEvents.length === 3, `expected 3 concept StudyEvents after first wrong answer, got ${labEvents.length}`);
  const activeErrors = (afterWrong.errorRecords || []).filter(item => item.skill === 'product_judgment' && item.status === 'active');
  assert(activeErrors.length === 3, `expected 3 active Product Lab ErrorRecords, got ${activeErrors.length}`);
  assert(afterWrong.learnerSignals?.['refresh-rate::product_judgment']?.assessment?.incorrect === 1, 'refresh-rate learner signal did not record incorrect judgment');
  assert((await page.locator('.pl-adaptive-note.wrong').textContent())?.includes('Error Bank'), 'Product Lab did not show Error Bank handoff');

  // Weak tab should turn those concept errors into one case-level remediation task.
  await page.locator('#mobileBottomNav button[data-target="weakCard"]').click();
  await page.locator('#phoneAdaptiveErrorBank').waitFor({ state: 'visible' });
  assert((await page.locator('#phoneAdaptiveCount').textContent())?.includes('1 active'), 'Error Bank should show one active case group');
  assert((await page.locator('#phoneAdaptiveList').textContent())?.includes('刷新率'), 'Error Bank remediation did not include the refresh-rate concept');
  assert((await page.locator('#phoneAdaptiveList').textContent())?.includes('Frame Time'), 'Error Bank remediation did not include the frame-time concept');

  // Revalidation returns to the exact Product Lab case, then a correct answer resolves the ErrorRecords.
  await page.locator('[data-pa-revalidate="refresh-120hz"]').click();
  await page.locator('.pl-revalidation-banner').waitFor({ state: 'visible' });
  const revalidationOptions = page.locator('#phoneProductLabBody .pl-option');
  assert(!(await revalidationOptions.nth(1).isDisabled()), 'revalidation option should be enabled');
  await revalidationOptions.nth(1).click();

  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    const records = (state.errorRecords || []).filter(item => item.skill === 'product_judgment');
    return records.length === 3 && records.every(item => item.status === 'resolved');
  }, STORAGE_KEY);

  const afterPass = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), STORAGE_KEY);
  const resolved = (afterPass.errorRecords || []).filter(item => item.skill === 'product_judgment' && item.status === 'resolved');
  assert(resolved.length === 3, `expected 3 resolved Product Lab ErrorRecords, got ${resolved.length}`);
  assert(resolved.every(item => item.resolution_event_id), 'resolved ErrorRecords should retain a resolution event id');
  const signal = afterPass.learnerSignals?.['refresh-rate::product_judgment'];
  assert(signal?.assessment?.incorrect === 1 && signal?.assessment?.correct === 1, `unexpected learner signal counts: ${JSON.stringify(signal)}`);
  assert(signal?.revalidations?.passed === 1, 'successful revalidation was not counted');
  assert((await page.locator('.pl-adaptive-note.resolved').textContent())?.includes('resolved'), 'Product Lab did not show resolved feedback');

  // Adaptive remediation must not inflate the bounded daily review workload.
  const dailyCount = Number((await page.locator('#dueCount').textContent()) || 0);
  assert(Number.isFinite(dailyCount) && dailyCount <= 10, `adaptive loop inflated daily plan beyond 10: ${dailyCount}`);

  await context.close();
  console.log('Adaptive loop smoke OK: Product Lab -> StudyEvent -> Error Bank -> remediation -> revalidation -> resolved.');
} finally {
  await browser.close();
}
