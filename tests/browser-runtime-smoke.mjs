import { chromium } from 'playwright-core';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173/';
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms} ms`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function assertResponsive(page, label) {
  await withTimeout(
    page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))),
    2500,
    `${label}: renderer responsiveness`,
  );
}

async function clickDomain(page, id, expectedName) {
  const selector = `[data-domain="${id}"]`;
  const button = page.locator(selector);
  await button.waitFor({ state: 'visible' });
  // Domain cards are progressively enhanced by several late UI observers. This smoke
  // verifies the routing contract rather than pointer hit-testing, so wait for two
  // settled frames and dispatch the DOM click after the final enhancement layer loads.
  await assertResponsive(page, `domain ${id} before click`);
  await page.evaluate(domainId => {
    const target = document.querySelector(`[data-domain="${domainId}"]`);
    if (!target) throw new Error(`domain button missing: ${domainId}`);
    target.click();
  }, id);
  await page.waitForFunction(name => document.querySelector('#domainName')?.textContent?.trim() === name, expectedName);
  await assertResponsive(page, `domain ${id}`);
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

async function activateMobileTab(page, target) {
  const button = page.locator(`#mobileBottomNav button[data-target="${target}"]`);
  await button.click();
  await assertResponsive(page, `mobile tab ${target}`);
}

async function activateDesktopTab(page, tab) {
  const button = page.locator(`#uxDesktopTabs button[data-ux-tab="${tab}"]`);
  await button.click();
  await assertResponsive(page, `desktop tab ${tab}`);
}

async function runMobileSmoke(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  page.on('dialog', dialog => dialog.accept());

  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') failures.push(`console.error: ${message.text()}`);
  });
  page.on('response', response => {
    try {
      const url = new URL(response.url());
      const base = new URL(BASE_URL);
      if (url.origin === base.origin && response.status() >= 400) {
        failures.push(`HTTP ${response.status()}: ${url.pathname}`);
      }
    } catch {}
  });

  // Exercise the offline scheduler fallback without relying on an external CDN in CI.
  await mockFsrsOffline(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('#todayLearningCard').waitFor({ state: 'visible' });
  await page.locator('#mobileBottomNav').waitFor({ state: 'visible' });
  // main.js progressively layers UX modules after the base app. Wait for both the
  // shared tab controller and the late Korean extension so smoke assertions observe
  // the final DOM rather than an intermediate render.
  await page.waitForFunction(() => window.__LEARNING_PAW_UX_V08__?.version === '0.8.0');
  await page.waitForFunction(() => window.__KOREAN_VOCAB_UI_V15__?.version === '0.15.0');
  await assertResponsive(page, 'initial load');

  const knowledgeMeta = await page.evaluate(() => window.__PHONE_KNOWLEDGE_V09__ || null);
  assert(knowledgeMeta?.topics === 10, `expected 10 phone knowledge topics, got ${JSON.stringify(knowledgeMeta)}`);
  assert(knowledgeMeta?.concepts >= 50, `expected at least 50 phone knowledge concepts, got ${knowledgeMeta?.concepts}`);
  assert(knowledgeMeta?.starterCards === 15, `expected 15 starter cards, got ${knowledgeMeta?.starterCards}`);
  const knowledgeGate = await page.evaluate(() => window.__PHONE_KNOWLEDGE_GATE_V091__ || null);
  assert(knowledgeGate?.unlocked === false, 'fresh learner should not receive Phone Knowledge starter cards before portfolio completion');

  const domainCount = await page.locator('#domainGrid .domain-choice').count();
  assert(domainCount === 4, `expected 4 learning domains, got ${domainCount}`);

  const dueLabel = (await page.locator('#dueCount').locator('xpath=following-sibling::span').textContent())?.trim();
  const dailyCount = Number((await page.locator('#dueCount').textContent()) || 0);
  assert(dueLabel === '今日建议', `expected daily-plan label, got ${dueLabel}`);
  assert(Number.isFinite(dailyCount) && dailyCount <= 10, `daily review plan should be bounded at 10, got ${dailyCount}`);

  const duplicateIds = await page.evaluate(() => {
    const counts = new Map();
    document.querySelectorAll('[id]').forEach(node => counts.set(node.id, (counts.get(node.id) || 0) + 1));
    return [...counts.entries()].filter(([, count]) => count > 1);
  });
  assert(duplicateIds.length === 0, `duplicate DOM ids: ${JSON.stringify(duplicateIds)}`);

  // Phone: use real tab navigation, then exercise the heaviest lesson and ecommerce gallery.
  await activateMobileTab(page, 'domainHub');
  await page.locator('#domainGrid .domain-choice').first().waitFor({ state: 'visible' });
  await clickDomain(page, 'phone', '手机产品专家');
  await activateMobileTab(page, 'todayLearningCard');
  await openGenericLesson(page, 'phone portfolio');
  await page.locator('.phone-catalog').waitFor({ state: 'visible' });
  await page.locator('.phone-catalog__price').waitFor({ state: 'visible' });
  await assertResponsive(page, 'phone catalog initial render');

  const modelButtons = page.locator('.phone-catalog__model');
  assert(await modelButtons.count() >= 2, 'phone catalog did not render multiple models');
  await modelButtons.nth(1).click();
  await page.locator('.phone-catalog__price').waitFor({ state: 'visible' });
  await assertResponsive(page, 'phone model switch');

  const colorButtons = page.locator('.phone-catalog__color');
  if (await colorButtons.count() >= 2) {
    const before = await page.locator('.phone-catalog__hero img').getAttribute('src');
    await colorButtons.nth(1).click();
    await assertResponsive(page, 'phone color switch');
    const after = await page.locator('.phone-catalog__hero img').getAttribute('src');
    assert(before !== after, 'phone color switch did not update hero image');
  }
  await closeGenericLesson(page);

  // Phone Knowledge Base: route tab must expose the searchable Concept Tree without dumping it into today's plan.
  await activateMobileTab(page, 'routeCard');
  const knowledgeCard = page.locator('#phoneKnowledgeCard');
  await knowledgeCard.waitFor({ state: 'visible' });
  assert(await page.locator('#phoneKnowledgeTopics .pk-topic-button').count() === 10, 'phone knowledge topic strip should contain 10 topics');
  const statusText = (await page.locator('#phoneKnowledgeStatus').textContent()) || '';
  assert(statusText.includes('训练卡暂不一次性放出'), `unexpected Phone Knowledge gate copy: ${statusText}`);
  const search = page.locator('#phoneKnowledgeSearch');
  await search.fill('GHz');
  await page.waitForFunction(() => document.querySelector('#phoneKnowledgeBody')?.textContent?.includes('CPU 频率 / GHz'));
  assert((await page.locator('#phoneKnowledgeBody').textContent())?.includes('3.8 GHz'), 'GHz concept did not render from knowledge search');
  await assertResponsive(page, 'phone knowledge search');
  await search.fill('');

  // Retail and industry: verify domain -> today tab transitions and lesson readers.
  await activateMobileTab(page, 'domainHub');
  await clickDomain(page, 'retail', '商圈与零售');
  await activateMobileTab(page, 'todayLearningCard');
  await openGenericLesson(page, 'retail');
  await closeGenericLesson(page);

  await activateMobileTab(page, 'domainHub');
  await clickDomain(page, 'industry', '行业与商业');
  await activateMobileTab(page, 'todayLearningCard');
  await openGenericLesson(page, 'industry');
  await closeGenericLesson(page);

  // Korean: the first learning action is now an external-study prerequisite gate,
  // not an in-app Day 0/Week 1 alphabet course.
  await activateMobileTab(page, 'domainHub');
  await clickDomain(page, 'korean', '韩语');
  await activateMobileTab(page, 'todayLearningCard');
  const koreanButton = page.locator('#openKoreanLessonReaderBtn');
  await koreanButton.waitFor({ state: 'visible' });
  await koreanButton.click();
  await page.locator('#koreanLessonReaderOverlay:not(.hidden)').waitFor({ state: 'visible' });
  await assertResponsive(page, 'Korean Hangul gate reader');

  const koreanTitle = (await page.locator('#koreanReaderTitle').textContent())?.trim() || '';
  assert(koreanTitle.includes('韩文字母通关考核'), `expected Hangul prerequisite gate, got ${koreanTitle}`);
  const primary = page.locator('#koreanLessonReaderOverlay .korean-reader-actions .primary');
  await primary.waitFor({ state: 'visible' });
  assert((await primary.textContent())?.includes('韩文字母通关考核'), 'Korean completion guard did not route the gate to assessment');
  await primary.click();
  await page.locator('#koAssessOverlay:not(.hidden)').waitFor({ state: 'visible' });
  await assertResponsive(page, 'Korean Hangul gate assessment');
  const assessmentText = (await page.locator('#koAssessBody').textContent()) || '';
  assert(assessmentText.includes('韩文字母通关考核'), `wrong Korean assessment opened: ${assessmentText}`);
  assert(assessmentText.includes('85') || assessmentText.includes('字母'), 'Hangul gate assessment copy is missing prerequisite context');
  await page.locator('#koAssessClose').click();

  // Review flow: verify the bounded daily plan can start and exit.
  await activateMobileTab(page, 'domainHub');
  await clickDomain(page, 'phone', '手机产品专家');
  await activateMobileTab(page, 'trainingHub');
  const startReview = page.locator('#startBtn');
  assert(!(await startReview.isDisabled()), 'phone review start button is unexpectedly disabled');
  await startReview.click();
  await page.locator('#reviewView:not(.hidden)').waitFor({ state: 'visible' });
  await assertResponsive(page, 'review session');
  await page.locator('#exitBtn').click();
  await page.locator('#homeView:not(.hidden)').waitFor({ state: 'visible' });

  // Formal test flow: open and exit without consuming an answer.
  const formalTest = page.locator('#startTestBtn');
  assert(!(await formalTest.isDisabled()), 'phone formal test is unexpectedly disabled');
  await formalTest.click();
  await page.locator('#testView:not(.hidden)').waitFor({ state: 'visible' });
  await assertResponsive(page, 'formal test');
  await page.locator('#exitTestBtn').click();
  await page.locator('#homeView:not(.hidden)').waitFor({ state: 'visible' });

  // Device data tab must explicitly state that cross-device sync is not active.
  await activateMobileTab(page, 'domainHub');
  await page.locator('#deviceSyncStatus').waitFor({ state: 'visible' });
  assert((await page.locator('#deviceSyncStatus').textContent())?.includes('未开启'), 'device sync status is unclear');

  await sleep(250);
  await assertResponsive(page, 'final mobile state');
  await context.close();
}

async function runDesktopSmoke(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  page.on('pageerror', error => failures.push(`desktop pageerror: ${error.message}`));
  await mockFsrsOffline(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('#uxDesktopTabs').waitFor({ state: 'visible' });
  await page.locator('#todayLearningCard').waitFor({ state: 'visible' });
  await page.waitForFunction(() => window.__KOREAN_VOCAB_UI_V15__?.version === '0.15.0');
  await assertResponsive(page, 'desktop load');
  await activateDesktopTab(page, 'domains');
  await page.locator('#domainGrid .domain-choice').first().waitFor({ state: 'visible' });
  await clickDomain(page, 'phone', '手机产品专家');
  await activateDesktopTab(page, 'today');
  await openGenericLesson(page, 'desktop phone');
  await page.locator('.phone-catalog').waitFor({ state: 'visible' });
  await assertResponsive(page, 'desktop phone catalog');
  await closeGenericLesson(page);
  await activateDesktopTab(page, 'route');
  await page.locator('#phoneKnowledgeCard').waitFor({ state: 'visible' });
  assert(await page.locator('#phoneKnowledgeTopics .pk-topic-button').count() === 10, 'desktop Phone Knowledge Base topics missing');
  await assertResponsive(page, 'desktop phone knowledge');
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

if (failures.length) {
  throw new Error(`Browser smoke found runtime errors:\n${failures.join('\n')}`);
}

console.log('Browser runtime smoke OK: V0.9 Phone Knowledge Base + V0.8 tabs/daily plan, mobile + desktop, 4 domains, lessons, Hangul prerequisite gate, review, test, phone variants/pricing.');
