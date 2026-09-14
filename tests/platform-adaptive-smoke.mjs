import { chromium } from 'playwright-core';
import { tests } from '../platform-data.js';
import { koreanAssessments } from '../korean-assessment-data-v05.js';

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
  await page.waitForFunction(() => window.__ADAPTIVE_LEARNING_V11__?.version === '0.11.0');
  await page.waitForFunction(() => window.__KOREAN_STAGE_ADAPTIVE_V112__?.version === '0.11.2');
  await page.waitForFunction(() => window.__STATE_WRITE_GUARD_V113__?.version === '0.11.3');

  async function chooseDomain(domainId) {
    await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
    await page.locator(`[data-domain="${domainId}"]`).click();
    await page.waitForFunction(id => document.querySelector('#domainGrid [data-domain].selected')?.dataset.domain === id, domainId);
    await page.locator('#mobileBottomNav button[data-target="weakCard"]').click();
  }

  async function injectFormalError(domainId) {
    const assessment = tests[domainId];
    const question = assessment.questions[0];
    const wrongIndex = question.answer === 0 ? 1 : 0;
    const resultId = `platform-${domainId}-formal-1`;

    await page.evaluate(({ key, domainId, assessment, question, wrongIndex, resultId }) => {
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      state.testResults = [
        ...(state.testResults || []),
        {
          id: resultId,
          domainId,
          title: assessment.title,
          score: 0,
          completedAt: new Date().toISOString(),
          answers: [{
            question: question.q,
            selectedIndex: wrongIndex,
            correctIndex: question.answer,
            correct: false,
            explanation: question.explanation,
          }],
        },
      ];
      localStorage.setItem(key, JSON.stringify(state));
    }, { key: STORAGE_KEY, domainId, assessment, question, wrongIndex, resultId });

    await page.waitForFunction(({ key, domainId }) => {
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      return (state.errorRecords || []).some(record =>
        record.domain === domainId && record.status === 'active' && record.error_type === 'assessment_error'
      );
    }, { key: STORAGE_KEY, domainId });

    await chooseDomain(domainId);
    await page.evaluate(() => window.__ADAPTIVE_LEARNING_V11__.render());

    const row = page.locator('.al-error').filter({ hasText: question.q });
    await row.waitFor({ state: 'visible' });
    assert(await row.locator('[data-adaptive-revalidate]').count() === 1, `${domainId}: formal error is not actionable`);

    await row.locator('[data-adaptive-revalidate]').click();
    const overlay = page.locator('#adaptiveLearningOverlay');
    await overlay.waitFor({ state: 'visible' });
    await overlay.locator('.al-option').nth(question.answer).click();

    await page.waitForFunction(({ key, domainId }) => {
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      return (state.errorRecords || []).some(record =>
        record.domain === domainId && record.status === 'resolved' && record.error_type === 'assessment_error'
      );
    }, { key: STORAGE_KEY, domainId });

    await overlay.locator('.al-row button').filter({ hasText: '关闭' }).click();
  }

  for (const domainId of ['phone', 'retail', 'industry']) {
    await injectFormalError(domainId);
  }

  const koreanAssessment = koreanAssessments.week1;
  const koreanItem = koreanAssessment.items.find(item => item.type === 'mcq');
  assert(koreanItem, 'korean: no objective Week 1 item available for platform smoke');
  const koreanWrongIndex = koreanItem.correct_answer === 0 ? 1 : 0;

  await page.evaluate(({ key, assessment, item, wrongIndex }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state.assessmentAttempts = [
      ...(state.assessmentAttempts || []),
      {
        schema_version: '1.0',
        attempt_id: 'platform-korean-week1-1',
        assessment_id: assessment.assessment_id,
        domain: 'korean',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        score: 0,
        max_score: assessment.max_score,
        section_scores: {},
        item_results: [{
          item_id: item.item_id,
          section_id: item.section_id,
          skill: item.skill,
          concept_ids: item.concept_ids,
          prompt: item.prompt,
          selected_answer: wrongIndex,
          correct_answer: item.correct_answer,
          correct: false,
          score: 0,
          max_score: item.max_score,
          explanation: item.explanation,
          duration_ms: null,
        }],
        source: 'platform_smoke',
      },
    ];
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, assessment: koreanAssessment, item: koreanItem, wrongIndex: koreanWrongIndex });

  await page.waitForFunction(({ key, conceptId }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record =>
      record.domain === 'korean' && record.concept_id === conceptId && record.status === 'active'
    );
  }, { key: STORAGE_KEY, conceptId: koreanItem.concept_ids[0] });

  await chooseDomain('korean');
  await page.evaluate(() => {
    window.__ADAPTIVE_LEARNING_V11__.render();
    window.__KOREAN_STAGE_ADAPTIVE_V112__.render();
  });

  const koreanRow = page.locator('.ksa-item').filter({ hasText: koreanItem.prompt });
  await koreanRow.waitFor({ state: 'visible' });
  assert(await koreanRow.locator('[data-ksa-revalidate]').count() === 1, 'korean: staged error is not actionable');
  await koreanRow.locator('[data-ksa-revalidate]').click();

  const koreanOverlay = page.locator('#koreanStageAdaptiveOverlay');
  await koreanOverlay.waitFor({ state: 'visible' });
  await koreanOverlay.locator('.ksa-option').nth(koreanItem.correct_answer).click();

  await page.waitForFunction(({ key, conceptId }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record =>
      record.domain === 'korean' && record.concept_id === conceptId && record.status === 'resolved'
    );
  }, { key: STORAGE_KEY, conceptId: koreanItem.concept_ids[0] });

  const finalState = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), STORAGE_KEY);
  for (const domainId of ['phone', 'retail', 'industry', 'korean']) {
    assert(
      (finalState.errorRecords || []).some(record => record.domain === domainId && record.status === 'resolved'),
      `${domainId}: no resolved adaptive evidence after cross-domain smoke`,
    );
  }

  await context.close();
  console.log('Platform adaptive smoke OK: phone + retail + industry + Korean all generate actionable errors and resolve through targeted revalidation.');
} finally {
  await browser.close();
}
