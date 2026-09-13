import { chromium } from 'playwright-core';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173/';
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';

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
  page.setDefaultTimeout(7000);
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'throw new Error("CI simulated FSRS offline");',
  }));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__PHONE_PRODUCT_LAB_V091__));
  const meta = await page.evaluate(() => window.__PHONE_PRODUCT_LAB_V091__ || null);
  assert(meta?.version === '0.9.1', `Product Lab metadata missing: ${JSON.stringify(meta)}`);
  assert(meta?.cases === 5, `expected 5 Product Lab cases, got ${meta?.cases}`);
  assert(meta?.verifiedAt === '2026-09-13', `unexpected verified date: ${meta?.verifiedAt}`);

  await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
  await page.locator('[data-domain="phone"]').click();
  await page.locator('#mobileBottomNav button[data-target="routeCard"]').click();
  await page.locator('#phoneProductLab').waitFor({ state: 'visible' });

  assert(await page.locator('#phoneProductLabTabs .pl-tab').count() === 5, 'Product Lab tabs missing');
  assert((await page.locator('#phoneProductLabBody').textContent())?.includes('同样 120 Hz'), 'first Product Lab case missing');

  const options = page.locator('#phoneProductLabBody .pl-option');
  assert(await options.count() === 3, 'Product Lab answer options missing');
  await options.nth(1).click();
  await page.locator('#phoneProductLabBody .pl-feedback.show').waitFor({ state: 'visible' });
  assert((await page.locator('#phoneProductLabBody .pl-result').textContent())?.includes('判断正确'), 'correct Product Lab answer did not produce positive feedback');
  assert((await page.locator('#phoneProductLabBody .pl-feedback').textContent())?.includes('不能推出'), 'Product Lab boundary explanation missing');

  await page.locator('#phoneProductLabNext').click();
  assert((await page.locator('#phoneProductLabBody').textContent())?.includes('几核 / GHz'), 'Product Lab next-case navigation failed');

  await context.close();
  console.log('Product Lab smoke OK: 5 real-product cases, official-source facts, answer feedback and case navigation.');
} finally {
  await browser.close();
}
