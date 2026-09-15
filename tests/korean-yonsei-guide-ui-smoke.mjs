import { chromium } from 'playwright-core';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173/';
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const ROOT_STORAGE_KEY = 'personal-learning-os:v0.1';
const TUTOR_STORAGE_KEY = 'learning-paw:korean-tutor:v1';

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

  await page.addInitScript(({ rootKey, tutorKey }) => {
    localStorage.setItem(rootKey, JSON.stringify({ preferences: { lastDomain: 'korean' } }));
    localStorage.setItem(tutorKey, JSON.stringify({ volume: '1', lesson: '1', focus: '', previousFocus: '' }));
  }, { rootKey: ROOT_STORAGE_KEY, tutorKey: TUTOR_STORAGE_KEY });

  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'throw new Error("CI simulated FSRS offline");',
  }));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__KOREAN_YONSEI_GUIDE_UI_V17__?.version === '0.17.0');

  await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
  await page.locator('[data-domain="korean"]').click();
  await page.waitForFunction(() => document.querySelector('#domainName')?.textContent?.trim() === '韩语');
  await page.locator('#mobileBottomNav button[data-target="trainingHub"]').click();
  await page.locator('#koreanTutorPanel').waitFor({ state: 'visible' });
  await page.locator('#koreanYonseiGuide').waitFor({ state: 'visible' });

  await page.waitForFunction(() => document.querySelector('#koreanTutorFocus')?.value?.includes('인사와 소개'));
  const focusLabel = (await page.locator('label[for="koreanTutorFocus"]').textContent()) || '';
  assert(focusLabel.includes('平台自动生成'), `focus should be platform-generated: ${focusLabel}`);

  const guideText = (await page.locator('#koreanYonseiGuide').textContent()) || '';
  assert(guideText.includes('第 1 课'), `lesson number missing from guide: ${guideText}`);
  assert(guideText.includes('인사와 소개'), `official Korean topic missing: ${guideText}`);
  assert(guideText.includes('问候与介绍'), `Chinese topic missing: ${guideText}`);
  assert(guideText.includes('新延世韩国语 1-1'), `book mapping missing: ${guideText}`);
  assert(guideText.includes('今天要学会什么'), 'learner objective block missing');
  assert(guideText.includes('今天的主动输出'), 'active-output task block missing');

  const sourceLinks = page.locator('#koreanYonseiGuide .yonsei-guide-links a');
  assert(await sourceLinks.count() >= 4, 'official Yonsei source links should be visible');
  for (let i = 0; i < await sourceLinks.count(); i += 1) {
    const href = await sourceLinks.nth(i).getAttribute('href');
    assert(/yskli\.com|press\.yonsei\.ac\.kr/.test(href || ''), `unexpected non-Yonsei source link: ${href}`);
  }

  const autoFocus = await page.locator('#koreanTutorFocus').inputValue();
  assert(autoFocus.includes('今日学习目标'), `automatic focus should contain a learning goal: ${autoFocus}`);
  assert(autoFocus.includes('30 分钟重点'), `automatic focus should contain today's focus: ${autoFocus}`);

  const prompt = (await page.locator('#koreanTutorPrompt').textContent()) || '';
  assert(prompt.includes('官方课程主题：1-1 · 第 1 课 인사와 소개'), `prompt did not consume guide data: ${prompt.slice(0, 300)}`);
  assert(prompt.includes('不要反过来要求我先填写“今天学什么”'), 'prompt still pushes curriculum planning back to learner');

  const todaySummary = (await page.locator('#todayLessonSummary').textContent()) || '';
  assert(todaySummary.includes('问候与介绍'), `Today card should receive automatic textbook summary: ${todaySummary}`);

  const lesson = page.locator('#koreanTutorLesson');
  await lesson.fill('2');
  await lesson.dispatchEvent('change');
  await page.waitForFunction(() => document.querySelector('#koreanYonseiGuide')?.textContent?.includes('물건'));
  await page.waitForFunction(() => document.querySelector('#koreanTutorFocus')?.value?.includes('물건'));
  const guide2 = (await page.locator('#koreanYonseiGuide').textContent()) || '';
  assert(guide2.includes('物品'), `lesson 2 did not update automatically: ${guide2}`);

  await context.close();
  console.log('Korean Yonsei guide UI smoke OK: lesson selection auto-fills textbook focus, guide, prompt and official sources.');
} finally {
  await browser.close();
}
