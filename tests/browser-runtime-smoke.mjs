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
  await page.waitForFunction(() => window.__KOREAN_TUTOR_UI_V16__?.version === '0.16.0');
  await assertResponsive(page, 'final UI readiness');
}

async function clickDomain(page, id, expectedName) {
  const button = page.locator(`[data-domain="${id}"]`);
  await button.waitFor({ state: 'visible' });
  await button.click();
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

  assert(await page.locator('#domainGrid .domain-choice').count() === 4, 'expected 4 learning domains');
  const duplicateIds = await page.evaluate(() => {
    const counts = new Map();
    document.querySelectorAll('[id]').forEach(node => counts.set(node.id, (counts.get(node.id) || 0) + 1));
    return [...counts.entries()].filter(([, count]) => count > 1);
  });
  assert(duplicateIds.length === 0, `duplicate DOM ids: ${JSON.stringify(duplicateIds)}`);

  // Korean V0.16: Yonsei textbook progress + 30-minute ChatGPT private tutor.
  await activateMobileTab(page, 'domainHub');
  await clickDomain(page, 'korean', '韩语');
  const koreanCardCopy = (await page.locator('#domainGrid [data-domain="korean"] .domain-choice-copy small').textContent())?.trim();
  assert(koreanCardCopy === '30 分钟 AI 私教', `unexpected Korean domain copy: ${koreanCardCopy}`);

  await activateMobileTab(page, 'todayLearningCard');
  const todayTitle = (await page.locator('#todayLessonTitle').textContent()) || '';
  assert(todayTitle.includes('《延世韩国语》'), `Yonsei today title missing: ${todayTitle}`);
  const todayAction = (await page.locator('#completeLessonBtn').textContent()) || '';
  assert(todayAction.includes('30 分钟私教'), `unexpected Korean today action: ${todayAction}`);
  assert(await page.locator('#openKoreanLessonReaderBtn').count() === 0, 'legacy Korean lesson-reader button should be removed');
  const genericStatsHidden = await page.locator('#dueCount').evaluate(node => node.closest('.stats-grid')?.classList.contains('hidden'));
  assert(genericStatsHidden === true, 'Korean should hide the generic FSRS stats');

  await page.locator('#completeLessonBtn').click();
  await page.locator('#koreanTutorPanel').waitFor({ state: 'visible' });
  assert((await page.locator('#trainingHub h2').textContent())?.includes('AI 韩语私教'), 'Korean training tab was not repurposed as private tutor');
  assert(await page.locator('#trainingHub .training-actions').evaluate(node => node.classList.contains('hidden')), 'generic Korean FSRS training controls should be hidden');
  assert((await page.locator('#koreanTutorVolume').inputValue()) === '1', 'default Yonsei volume should be 1');
  assert((await page.locator('#koreanTutorLesson').inputValue()) === '1', 'default Yonsei lesson should be 1');
  const initialPrompt = (await page.locator('#koreanTutorPrompt').textContent()) || '';
  assert(initialPrompt.includes('墨墨记忆卡'), 'tutor prompt should delegate vocabulary to MoMo');
  assert(initialPrompt.includes('一次只给我一个问题'), 'tutor prompt should enforce interactive teaching');

  await page.locator('#koreanTutorVolume').fill('2');
  await page.locator('#koreanTutorVolume').blur();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('learning-paw:korean-tutor:v1') || '{}').volume === '2');
  await page.locator('#koreanTutorLesson').fill('4');
  await page.locator('#koreanTutorLesson').blur();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('learning-paw:korean-tutor:v1') || '{}').lesson === '4');
  await page.locator('#koreanTutorFocus').fill('第 4 课课文与语法 1');
  await page.locator('#koreanTutorFocus').blur();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('learning-paw:korean-tutor:v1') || '{}').focus === '第 4 课课文与语法 1');
  await page.waitForFunction(() => document.querySelector('#koreanTutorPrompt')?.textContent?.includes('第 4 课课文与语法 1'));
  const prompt = (await page.locator('#koreanTutorPrompt').textContent()) || '';
  assert(prompt.includes('- 册 / 级：2'), 'updated textbook volume missing from prompt');
  assert(prompt.includes('- 课：4'), 'updated textbook lesson missing from prompt');

  await page.locator('#koreanTutorCompleteBtn').click();
  await page.waitForFunction(() => {
    try {
      const state = JSON.parse(localStorage.getItem('personal-learning-os:v0.1') || '{}');
      return (state.studyEvents || []).some(event => event.event_type === 'conversation_session' && event.domain === 'korean' && event.textbook?.volume === '2' && event.textbook?.lesson === '4');
    } catch { return false; }
  });

  await activateMobileTab(page, 'weakCard');
  const historyText = (await page.locator('#weakCard').textContent()) || '';
  assert(historyText.includes('私教记录'), 'Korean weak tab should become tutor history');
  assert(historyText.includes('第 4 课'), 'new tutor session was not rendered in tutor history');

  // Other domains keep their existing shared review flow.
  await activateMobileTab(page, 'domainHub');
  await clickDomain(page, 'phone', '手机产品专家');
  await activateMobileTab(page, 'trainingHub');
  assert(!(await page.locator('#trainingHub .training-actions').evaluate(node => node.classList.contains('hidden'))), 'phone training controls should remain visible');
  assert(!(await page.locator('#startBtn').isDisabled()), 'phone review start unexpectedly disabled');
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
  await clickDomain(page, 'korean', '韩语');
  const trainingTab = page.locator('#uxDesktopTabs [data-ux-tab="training"]');
  assert((await trainingTab.textContent())?.trim() === '私教', 'desktop Korean training tab should be labeled 私教');
  await activateDesktopTab(page, 'training');
  await page.locator('#koreanTutorPanel').waitFor({ state: 'visible' });
  assert((await page.locator('#koreanTutorPrompt').textContent())?.includes('《延世韩国语》'), 'desktop tutor prompt missing Yonsei spine');
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
console.log('Browser runtime smoke OK: shared four-domain UI is stable and Korean uses Yonsei + 30-minute ChatGPT private tutor without in-site vocab review.');
