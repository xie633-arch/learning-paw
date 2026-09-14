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
  await page.waitForFunction(() => window.__STUDY_EVENT_UI_V122__?.version === '0.12.2');
  await page.waitForFunction(() => typeof window.__LEARNER_RECOMMENDATION_V13__?.rankActiveErrorRecommendations === 'function');

  await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
  await page.locator('[data-domain="retail"]').click();
  await page.waitForFunction(() => window.__STUDY_EVENT_UI_V122__?.current?.domainId === 'retail');
  await page.locator('#mobileBottomNav button[data-target="routeCard"]').click();

  const firstLessonId = await page.locator('#routeList [data-step-id]').first().getAttribute('data-step-id');
  assert(firstLessonId, 'retail route has no lesson id');
  const routeTotal = await page.locator('#routeList [data-step-id]').count();
  assert(routeTotal > 0, 'retail route has no steps');

  await page.evaluate(({ key, lessonId }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state.history = [];
    state.testResults = [];
    state.lessonProgress = {};
    state.assessmentAttempts = [];
    state.studyEvents = [
      {
        schema_version: '1.0',
        event_id: 'evt-ui-route-done',
        occurred_at: '2026-09-14T13:00:00+08:00',
        domain: 'retail',
        event_type: 'lesson_completed',
        content_id: lessonId,
        concept_id: null,
        skill: 'curriculum_progress',
        result: { completed: true },
        source: 'ui_smoke',
      },
      {
        schema_version: '1.0',
        event_id: 'evt-ui-weak',
        occurred_at: '2026-09-14T13:05:00+08:00',
        domain: 'retail',
        event_type: 'assessment_attempt',
        content_id: 'retail-foundation-01',
        concept_id: 'retail.need-state',
        skill: 'need-state',
        result: { rating: null, correct: false, score: 0, max_score: 10, confidence: null },
        assessment_id: 'retail-foundation-100-v1',
        source: 'ui_smoke',
      },
      {
        schema_version: '1.0',
        event_id: 'evt-ui-assessment-completed',
        occurred_at: '2026-09-14T13:10:00+08:00',
        domain: 'retail',
        event_type: 'assessment_completed',
        content_id: 'retail-foundation-100-v1',
        assessment_id: 'retail-foundation-100-v1',
        session_id: 'ui-smoke-assessment',
        result: { score: 80, max_score: 100 },
        source: 'ui_smoke',
      },
    ];
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, lessonId: firstLessonId });

  await page.waitForFunction(total => {
    const current = window.__STUDY_EVENT_UI_V122__?.current;
    return current?.domainId === 'retail'
      && current.route?.completed === 1
      && current.route?.total === total
      && current.weakCount === 1
      && current.weakOrder?.[0]?.conceptId === 'retail.need-state'
      && current.weakOrder?.[0]?.priorityScore > 0
      && current.weakOrder?.[0]?.action === 'targeted_review_then_revalidate'
      && current.latestAssessment?.score === 80;
  }, routeTotal);

  const routeText = await page.locator('#routeProgressText').textContent();
  assert(routeText?.includes(`1 / ${routeTotal}`), `route UI did not use StudyEvent progress: ${routeText}`);

  await page.locator('#mobileBottomNav button[data-target="weakCard"]').click();
  const weakText = (await page.locator('#weakList').textContent()) || '';
  assert(weakText.includes('retail.need-state'), `weak UI did not use ErrorRecord/LearnerSignal: ${weakText}`);
  assert(weakText.includes('建议：针对性复习后重验证'), `weak UI did not expose recommendation action: ${weakText}`);
  assert(weakText.includes('推荐 '), `weak UI did not expose recommendation priority: ${weakText}`);
  const recommendationScore = Number(await page.locator('#weakList .weak-item').first().getAttribute('data-recommendation-score'));
  assert(Number.isFinite(recommendationScore) && recommendationScore > 0, `weak UI recommendation score missing: ${recommendationScore}`);

  await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
  const assessmentText = (await page.locator('#lastTestResult').textContent()) || '';
  assert(assessmentText.includes('80 / 100'), `latest assessment UI did not use assessment_completed event: ${assessmentText}`);
  assert(assessmentText.includes('retail-foundation-100-v1'), `latest assessment id missing: ${assessmentText}`);

  // A later reset fact must undo the earlier completed lesson even with no legacy lessonProgress mutation.
  await page.evaluate(({ key, lessonId }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state.studyEvents.push({
      schema_version: '1.0',
      event_id: 'evt-ui-route-reset',
      occurred_at: '2026-09-14T13:20:00+08:00',
      domain: 'retail',
      event_type: 'curriculum_status_changed',
      content_id: lessonId,
      concept_id: null,
      skill: 'curriculum_progress',
      result: { completed: false },
      source: 'ui_smoke',
    });
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, lessonId: firstLessonId });

  await page.waitForFunction(() => window.__STUDY_EVENT_UI_V122__?.current?.route?.completed === 0);
  const resetRouteText = await page.locator('#routeProgressText').textContent();
  assert(resetRouteText?.includes(`0 / ${routeTotal}`), `route reset fact did not update UI: ${resetRouteText}`);

  await context.close();
  console.log('StudyEvent UI smoke OK: route, recommendation-backed Weak Spots and latest assessment render from learner facts without legacy history/testResults.');
} finally {
  await browser.close();
}
