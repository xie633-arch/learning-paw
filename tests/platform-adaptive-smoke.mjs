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
  await page.waitForFunction(() => window.__ADAPTIVE_METADATA_V11__?.version === '0.11.2');
  await page.waitForFunction(() => window.__ADAPTIVE_LEARNING_V11__?.version === '0.11.0');
  await page.waitForFunction(() => window.__KOREAN_STAGE_ADAPTIVE_V112__?.version === '0.11.2');
  await page.waitForFunction(() => window.__STATE_WRITE_GUARD_V113__?.version === '0.11.3');

  async function chooseDomain(domainId) {
    await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
    await page.locator(`[data-domain="${domainId}"]`).click();
    await page.waitForFunction(id => document.querySelector('#domainGrid [data-domain].selected')?.dataset.domain === id, domainId);
    await page.locator('#mobileBottomNav button[data-target="weakCard"]').click();
  }

  async function runtimeFormalFixture(domainId) {
    return page.evaluate(async id => {
      const { tests } = await import('./platform-data.js');
      const assessment = tests[id];
      const question = assessment?.questions?.[0];
      if (!assessment || !question) return null;
      return {
        assessmentId: assessment.assessment_id,
        title: assessment.title,
        question: {
          itemId: question.item_id,
          prompt: question.q,
          answer: question.answer,
          explanation: question.explanation,
          conceptId: question.concept_ids?.[0] || null,
          skill: question.skill || null,
        },
      };
    }, domainId);
  }

  async function injectFormalError(domainId) {
    const fixture = await runtimeFormalFixture(domainId);
    assert(fixture?.question?.prompt, `${domainId}: runtime formal assessment fixture unavailable`);
    assert(Number.isInteger(fixture.question.answer), `${domainId}: runtime formal answer metadata missing`);
    assert(fixture.question.conceptId, `${domainId}: runtime formal concept metadata missing`);

    const wrongIndex = fixture.question.answer === 0 ? 1 : 0;
    const resultId = `platform-${domainId}-formal-1`;

    await page.evaluate(({ key, domainId, fixture, wrongIndex, resultId }) => {
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      state.testResults = [
        ...(state.testResults || []),
        {
          id: resultId,
          domainId,
          title: fixture.title,
          score: 0,
          completedAt: new Date().toISOString(),
          answers: [{
            question: fixture.question.prompt,
            selectedIndex: wrongIndex,
            correctIndex: fixture.question.answer,
            correct: false,
            explanation: fixture.question.explanation,
          }],
        },
      ];
      localStorage.setItem(key, JSON.stringify(state));
    }, { key: STORAGE_KEY, domainId, fixture, wrongIndex, resultId });

    await page.waitForFunction(({ key, domainId, conceptId }) => {
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      return (state.errorRecords || []).some(record =>
        record.domain === domainId
        && record.concept_id === conceptId
        && record.status === 'active'
        && record.error_type === 'assessment_error'
      );
    }, { key: STORAGE_KEY, domainId, conceptId: fixture.question.conceptId });

    await chooseDomain(domainId);
    await page.evaluate(() => window.__ADAPTIVE_LEARNING_V11__.render());

    const row = page.locator('.al-error').filter({ hasText: fixture.question.prompt });
    await row.waitFor({ state: 'visible' });
    assert(await row.locator('[data-adaptive-revalidate]').count() === 1, `${domainId}: formal error is not actionable`);

    await row.locator('[data-adaptive-revalidate]').click();
    const overlay = page.locator('#adaptiveLearningOverlay');
    await overlay.waitFor({ state: 'visible' });
    await overlay.locator('.al-option').nth(fixture.question.answer).click();

    await page.waitForFunction(({ key, domainId, conceptId }) => {
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      return (state.errorRecords || []).some(record =>
        record.domain === domainId
        && record.concept_id === conceptId
        && record.status === 'resolved'
        && record.error_type === 'assessment_error'
      );
    }, { key: STORAGE_KEY, domainId, conceptId: fixture.question.conceptId });

    await overlay.locator('.al-row button').filter({ hasText: '关闭' }).click();
  }

  for (const domainId of ['phone', 'retail', 'industry']) {
    await injectFormalError(domainId);
  }

  // Week 1 alphabet learning moved outside Learning Paw. Keep the cross-domain
  // adaptive contract on the first still-active in-platform Korean stage: Week 2.
  const koreanFixture = await page.evaluate(async () => {
    const { koreanAssessments } = await import('./korean-assessment-data-v05.js');
    const assessment = koreanAssessments.week2;
    const item = assessment?.items?.find(candidate => candidate.type === 'mcq');
    if (!assessment || !item) return null;
    return {
      assessment: {
        assessmentId: assessment.assessment_id,
        name: assessment.name,
        maxScore: assessment.max_score,
      },
      item: {
        itemId: item.item_id,
        sectionId: item.section_id,
        skill: item.skill,
        conceptIds: item.concept_ids,
        prompt: item.prompt,
        correctAnswer: item.correct_answer,
        maxScore: item.max_score,
        explanation: item.explanation,
      },
    };
  });

  assert(koreanFixture?.item?.prompt, 'korean: no objective Week 2 runtime item available for platform smoke');
  const koreanWrongIndex = koreanFixture.item.correctAnswer === 0 ? 1 : 0;

  await page.evaluate(({ key, fixture, wrongIndex }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    const now = new Date().toISOString();
    state.assessmentAttempts = [
      ...(state.assessmentAttempts || []),
      {
        schema_version: '1.0',
        attempt_id: 'platform-korean-week2-1',
        assessment_id: fixture.assessment.assessmentId,
        domain: 'korean',
        started_at: now,
        completed_at: now,
        score: 0,
        max_score: fixture.assessment.maxScore,
        section_scores: {},
        item_results: [{
          item_id: fixture.item.itemId,
          section_id: fixture.item.sectionId,
          skill: fixture.item.skill,
          concept_ids: fixture.item.conceptIds,
          prompt: fixture.item.prompt,
          selected_answer: wrongIndex,
          correct_answer: fixture.item.correctAnswer,
          correct: false,
          score: 0,
          max_score: fixture.item.maxScore,
          explanation: fixture.item.explanation,
          duration_ms: null,
        }],
        source: 'platform_smoke',
      },
    ];
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, fixture: koreanFixture, wrongIndex: koreanWrongIndex });

  const koreanConceptId = koreanFixture.item.conceptIds[0];
  await page.waitForFunction(({ key, conceptId }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record =>
      record.domain === 'korean' && record.concept_id === conceptId && record.status === 'active'
    );
  }, { key: STORAGE_KEY, conceptId: koreanConceptId });

  await chooseDomain('korean');
  await page.evaluate(() => {
    window.__ADAPTIVE_LEARNING_V11__.render();
    window.__KOREAN_STAGE_ADAPTIVE_V112__.render();
  });

  const koreanRow = page.locator('.ksa-item').filter({ hasText: koreanFixture.item.prompt });
  await koreanRow.waitFor({ state: 'visible' });
  assert(await koreanRow.locator('[data-ksa-revalidate]').count() === 1, 'korean: staged error is not actionable');
  await koreanRow.locator('[data-ksa-revalidate]').click();

  const koreanOverlay = page.locator('#koreanStageAdaptiveOverlay');
  await koreanOverlay.waitFor({ state: 'visible' });
  await koreanOverlay.locator('.ksa-option').nth(koreanFixture.item.correctAnswer).click();

  await page.waitForFunction(({ key, conceptId }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record =>
      record.domain === 'korean' && record.concept_id === conceptId && record.status === 'resolved'
    );
  }, { key: STORAGE_KEY, conceptId: koreanConceptId });

  const finalState = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), STORAGE_KEY);
  for (const domainId of ['phone', 'retail', 'industry', 'korean']) {
    assert(
      (finalState.errorRecords || []).some(record => record.domain === domainId && record.status === 'resolved'),
      `${domainId}: no resolved adaptive evidence after cross-domain smoke`,
    );
  }

  await context.close();
  console.log('Platform adaptive smoke OK: phone + retail + industry + Korean Week 2 all generate actionable errors and resolve through targeted revalidation.');
} finally {
  await browser.close();
}
