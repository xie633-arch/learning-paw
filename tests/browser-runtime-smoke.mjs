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
  await page.locator(`[data-domain="${id}"]`).click();
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

  // Force the application to exercise its offline scheduler fallback instead of depending on a CDN in CI.
  await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('#domainGrid .domain-choice').first().waitFor({ state: 'visible' });
  await assertResponsive(page, 'initial load');

  const domainCount = await page.locator('#domainGrid .domain-choice').count();
  assert(domainCount === 4, `expected 4 learning domains, got ${domainCount}`);

  const duplicateIds = await page.evaluate(() => {
    const counts = new Map();
    document.querySelectorAll('[id]').forEach(node => counts.set(node.id, (counts.get(node.id) || 0) + 1));
    return [...counts.entries()].filter(([, count]) => count > 1);
  });
  assert(duplicateIds.length === 0, `duplicate DOM ids: ${JSON.stringify(duplicateIds)}`);

  // Phone: open the heaviest lesson, then exercise model/color/price updates.
  await clickDomain(page, 'phone', '手机产品专家');
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

  // Retail and industry: verify both lesson readers open and close without runtime errors.
  await clickDomain(page, 'retail', '商圈与零售');
  await openGenericLesson(page, 'retail');
  await closeGenericLesson(page);

  await clickDomain(page, 'industry', '行业与商业');
  await openGenericLesson(page, 'industry');
  await closeGenericLesson(page);

  // Korean: verify Day 0 reader and staged assessment integration.
  await clickDomain(page, 'korean', '韩语');
  const koreanButton = page.locator('#openKoreanLessonReaderBtn');
  await koreanButton.waitFor({ state: 'visible' });
  await koreanButton.click();
  await page.locator('#koreanLessonReaderOverlay:not(.hidden)').waitFor({ state: 'visible' });
  await assertResponsive(page, 'Korean Day 0 reader');

  const koreanTitle = (await page.locator('#koreanReaderTitle').textContent())?.trim() || '';
  assert(koreanTitle.includes('Day 0'), `expected Day 0 Korean lesson, got ${koreanTitle}`);
  const primary = page.locator('#koreanLessonReaderOverlay .korean-reader-actions .primary');
  await primary.waitFor({ state: 'visible' });
  assert((await primary.textContent())?.includes('Day 0'), 'Korean completion guard label did not sync');
  await primary.click();
  await page.locator('#koAssessOverlay:not(.hidden)').waitFor({ state: 'visible' });
  await assertResponsive(page, 'Korean baseline assessment');
  await page.locator('#koAssessClose').click();

  // Review flow: verify a real training session can start and exit.
  await clickDomain(page, 'phone', '手机产品专家');
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

  await sleep(250);
  await assertResponsive(page, 'final mobile state');
  await context.close();
}

async function runDesktopSmoke(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  page.on('pageerror', error => failures.push(`desktop pageerror: ${error.message}`));
  await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('#domainGrid .domain-choice').first().waitFor({ state: 'visible' });
  await assertResponsive(page, 'desktop load');
  await clickDomain(page, 'phone', '手机产品专家');
  await openGenericLesson(page, 'desktop phone');
  await page.locator('.phone-catalog').waitFor({ state: 'visible' });
  await assertResponsive(page, 'desktop phone catalog');
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

console.log('Browser runtime smoke OK: mobile + desktop, 4 domains, lessons, Korean baseline, review, test, phone variants/pricing.');
