import { chromium } from 'playwright-core';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173/';
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertResponsive(page, label) {
  await Promise.race([
    page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label}: renderer responsiveness timeout`)), 2500)),
  ]);
}

async function waitForFinalUi(page) {
  await page.waitForFunction(() => window.__LEARNING_PAW_UX_V08__?.version === '0.8.0');
  await page.waitForFunction(() => typeof window.__KOREAN_VOCAB_UI_V15__?.render === 'function');
  await assertResponsive(page, 'final UI readiness');
}

async function clickDomain(page, id, expectedName) {
  const selector = `[data-domain="${id}"]`;
  await page.locator(selector).waitFor({ state: 'visible' });
  await assertResponsive(page, `domain ${id} before click`);
  await page.evaluate(domainId => {
    const target = document.querySelector(`[data-domain="${domainId}"]`);
    if (!target) throw new Error(`domain button missing: ${domainId}`);
    target.click();
  }, id);
  await page.waitForFunction(name => document.querySelector('#domainName')?.textContent?.trim() === name, expectedName);
  await assertResponsive(page, `domain ${id}`);
}

async function activateMobileTab(page, target) {
  const button = page.locator(`#mobileBottomNav button[data-target="${target}"]`);
  await button.waitFor({ state: 'visible' });
  await button.click();
  await assertResponsive(page, `mobile tab ${target}`);
}

async function activateDesktopTab(page, tab) {
  const button = page.locator(`#uxDesktopTabs button[data-ux-tab="${tab}"]`);
  await button.waitFor({ state: 'visible' });
  await button.click();
  await assertResponsive(page, `desktop tab ${tab}`);
}

async function openGenericLesson(page, label) {
  const button = page.locator('#openLessonReaderBtn');
  await button.waitFor({ state: 'visible' });
  await button.click();
  await page.locator('#lessonReaderOverlay:not(.hidden)').waitFor({ state: 'visible' });
  await assertResponsive(page, `${label} lesson open`);
}

async function closeGenericLesson(page) {
  await page.locator('#closeLessonReaderBtn').click();
  await page.locator('#lessonReaderOverlay').waitFor({ state: 'hidden' });
}

async function mockFsrsOffline(page) {
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'throw new Error("CI simulated FSRS offline");',
  }));
}

function captureRuntimeFailures(page, prefix = '') {
  page.on('pageerror', error => failures.push(`${prefix}pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') failures.push(`${prefix}console.error: ${message.text()}`);
  });
  page.on('response', response => {
    try {
      const url = new URL(response.url());
      const base = new URL(BASE_URL);
      if (url.origin === base.origin && response.status() >= 400) failures.push(`${prefix}HTTP ${response.status()}: ${url.pathname}`);
    } catch {}
  });
}

async function runMobileSmoke(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(9000);
  page.on('dialog', dialog => dialog.accept());
  captureRuntimeFailures(page);
  await mockFsrsOffline(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('#todayLearningCard').waitFor({ state: 'visible' });
  await page.locator('#mobileBottomNav').waitFor({ state: 'visible' });
  await waitForFinalUi(page);

  const knowledge = await page.evaluate(() => window.__PHONE_KNOWLEDGE_V09__ || null);
  assert(knowledge?.topics === 10, `expected 10 phone knowledge topics, got ${JSON.stringify(knowledge)}`);
  assert(knowledge?.concepts >= 50, `expected >=50 phone concepts, got ${knowledge?.concepts}`);
  assert(knowledge?.starterCards === 15, `expected 15 phone starter cards, got ${knowledge?.starterCards}`);
  const gate = await page.evaluate(() => window.__PHONE_KNOWLEDGE_GATE_V091__ || null);
  assert(gate?.unlocked === false, 'fresh learner should not receive Phone Knowledge starter cards');

  assert(await page.locator('#domainGrid .domain-choice').count() === 4, 'expected 4 learning domains');
  const dueLabel = (await page.locator('#dueCount').locator('xpath=following-sibling::span').textContent())?.trim();
  const dailyCount = Number((await page.locator('#dueCount').textContent()) || 0);
  assert(dueLabel === '今日建议', `expected 今日建议, got ${dueLabel}`);
  assert(Number.isFinite(dailyCount) && dailyCount <= 10, `daily plan should be <=10, got ${dailyCount}`);

  const duplicateIds = await page.evaluate(() => {
    const counts = new Map();
    document.querySelectorAll('[id]').forEach(node => counts.set(node.id, (counts.get(node.id) || 0) + 1));
    return [...counts.entries()].filter(([, count]) => count > 1);
  });
  assert(duplicateIds.length === 0, `duplicate DOM ids: ${JSON.stringify(duplicateIds)}`);

  await activateMobileTab(page, 'domainHub');
  await clickDomain(page, 'phone', '手机产品专家');
  await activateMobileTab(page, 'todayLearningCard');
  await openGenericLesson(page, 'phone portfolio');
  await page.locator('.phone-catalog').waitFor({ state: 'visible' });
  await page.locator('.phone-catalog__price').waitFor({ state: 'visible' });
  const models = page.locator('.phone-catalog__model');
  assert(await models.count() >= 2, 'phone catalog did not render multiple models');
  await models.nth(1).click();
  const colors = page.locator('.phone-catalog__color');
  if (await colors.count() >= 2) {
    const before = await page.locator('.phone-catalog__hero img').getAttribute('src');
    await colors.nth(1).click();
    await assertResponsive(page, 'phone color switch');
    const after = await page.locator('.phone-catalog__hero img').getAttribute('src');
    assert(before !== after, 'phone color switch did not update hero image');
  }
  await closeGenericLesson(page);

  await activateMobileTab(page, 'routeCard');
  await page.locator('#phoneKnowledgeCard').waitFor({ state: 'visible' });
  assert(await page.locator('#phoneKnowledgeTopics .pk-topic-button').count() === 10, 'phone knowledge topics missing');
  const status = (await page.locator('#phoneKnowledgeStatus').textContent()) || '';
  assert(status.includes('训练卡暂不一次性放出'), `unexpected knowledge gate copy: ${status}`);
  await page.locator('#phoneKnowledgeSearch').fill('GHz');
  await page.waitForFunction(() => document.querySelector('#phoneKnowledgeBody')?.textContent?.includes('CPU 频率 / GHz'));
  assert((await page.locator('#phoneKnowledgeBody').textContent())?.includes('3.8 GHz'), 'GHz search result missing');

  for (const [id, name] of [['retail','商圈与零售'], ['industry','行业与商业']]) {
    await activateMobileTab(page, 'domainHub');
    await clickDomain(page, id, name);
    await activateMobileTab(page, 'todayLearningCard');
    await openGenericLesson(page, id);
    await closeGenericLesson(page);
  }

  // Korean now starts with an external-study prerequisite assessment, not an in-app alphabet course.
  await activateMobileTab(page, 'domainHub');
  await clickDomain(page, 'korean', '韩语');
  await activateMobileTab(page, 'todayLearningCard');
  const koreanButton = page.locator('#openKoreanLessonReaderBtn');
  await koreanButton.waitFor({ state: 'visible' });
  await koreanButton.click();
  await page.locator('#koreanLessonReaderOverlay:not(.hidden)').waitFor({ state: 'visible' });
  const koreanTitle = (await page.locator('#koreanReaderTitle').textContent())?.trim() || '';
  assert(koreanTitle.includes('韩文字母通关考核'), `expected Hangul gate, got ${koreanTitle}`);
  const primary = page.locator('#koreanLessonReaderOverlay .korean-reader-actions .primary');
  await primary.waitFor({ state: 'visible' });
  assert((await primary.textContent())?.includes('韩文字母通关考核'), 'Hangul gate primary action did not route to assessment');
  await primary.click();
  await page.locator('#koAssessOverlay:not(.hidden)').waitFor({ state: 'visible' });
  const assessmentText = (await page.locator('#koAssessBody').textContent()) || '';
  assert(assessmentText.includes('韩文字母通关考核'), `wrong Korean assessment opened: ${assessmentText}`);
  await page.locator('#koAssessClose').click();

  await activateMobileTab(page, 'domainHub');
  await clickDomain(page, 'phone', '手机产品专家');
  await activateMobileTab(page, 'trainingHub');
  const startReview = page.locator('#startBtn');
  assert(!(await startReview.isDisabled()), 'phone review start unexpectedly disabled');
  await startReview.click();
  await page.locator('#reviewView:not(.hidden)').waitFor({ state: 'visible' });
  await page.locator('#exitBtn').click();
  await page.locator('#homeView:not(.hidden)').waitFor({ state: 'visible' });

  const formalTest = page.locator('#startTestBtn');
  assert(!(await formalTest.isDisabled()), 'phone formal test unexpectedly disabled');
  await formalTest.click();
  await page.locator('#testView:not(.hidden)').waitFor({ state: 'visible' });
  await page.locator('#exitTestBtn').click();
  await page.locator('#homeView:not(.hidden)').waitFor({ state: 'visible' });

  await activateMobileTab(page, 'domainHub');
  await page.locator('#deviceSyncStatus').waitFor({ state: 'visible' });
  assert((await page.locator('#deviceSyncStatus').textContent())?.includes('未开启'), 'device sync status is unclear');
  await assertResponsive(page, 'final mobile state');
  await context.close();
}

async function runDesktopSmoke(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(9000);
  captureRuntimeFailures(page, 'desktop ');
  await mockFsrsOffline(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('#uxDesktopTabs').waitFor({ state: 'visible' });
  await waitForFinalUi(page);
  await activateDesktopTab(page, 'domains');
  await clickDomain(page, 'phone', '手机产品专家');
  await activateDesktopTab(page, 'today');
  await openGenericLesson(page, 'desktop phone');
  await page.locator('.phone-catalog').waitFor({ state: 'visible' });
  await closeGenericLesson(page);
  await activateDesktopTab(page, 'route');
  await page.locator('#phoneKnowledgeCard').waitFor({ state: 'visible' });
  assert(await page.locator('#phoneKnowledgeTopics .pk-topic-button').count() === 10, 'desktop phone knowledge topics missing');
  await context.close();
}

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME_PATH,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  await runMobileSmoke(browser);
  await runDesktopSmoke(browser);
} finally {
  await browser.close();
}

if (failures.length) throw new Error(`Browser smoke found runtime errors:\n${failures.join('\n')}`);
console.log('Browser runtime smoke OK: shared UI, four domains, phone knowledge/catalog, Hangul prerequisite gate, review/test and mobile/desktop routing are stable.');
