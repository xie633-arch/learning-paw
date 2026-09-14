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
  await page.waitForFunction(() => window.__TODAY_PLAN_V12__?.version === '0.12.0');

  async function selectDomain(domainId) {
    await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
    await page.locator(`[data-domain="${domainId}"]`).click();
    await page.waitForFunction(id => window.__TODAY_PLAN_V12__?.current?.domainId === id, domainId);
    await page.locator('#mobileBottomNav button[data-target="todayLearningCard"]').click();
    await page.locator('#todayPlanOverview').waitFor({ state: 'visible' });
    return page.evaluate(() => window.__TODAY_PLAN_V12__.current);
  }

  for (const domainId of ['phone', 'korean', 'retail', 'industry']) {
    const plan = await selectDomain(domainId);
    assert(plan.domainId === domainId, `${domainId}: Today Plan did not switch domain`);
    assert(plan.lesson.total > 0, `${domainId}: Today Plan lost curriculum`);
    assert(plan.lesson.current?.id, `${domainId}: fresh learner should have a current lesson`);
    assert(plan.review.count <= 10, `${domainId}: Today Plan review exceeds daily limit: ${plan.review.count}`);
    assert(plan.review.newPlanned <= 5, `${domainId}: Today Plan new-card count exceeds limit: ${plan.review.newPlanned}`);
    assert(plan.revalidation.planned <= 3, `${domainId}: Today Plan revalidation exceeds priority limit: ${plan.revalidation.planned}`);
    assert(plan.workload.actionGroups >= 1, `${domainId}: Today Plan has no actionable group`);

    const text = (await page.locator('#todayPlanOverview').textContent()) || '';
    assert(text.includes('课程') && text.includes('复习') && text.includes('薄弱重验证') && text.includes('验收'), `${domainId}: Today Plan UI is incomplete`);
  }

  // Fresh Korean Day 0 should surface the baseline as the assessment tied to the current curriculum node.
  const koreanPlan = await selectDomain('korean');
  assert(koreanPlan.lesson.current.id === 'ko-day-000', `korean: expected Day 0 current lesson, got ${koreanPlan.lesson.current.id}`);
  assert(koreanPlan.assessment.kind === 'staged', 'korean: staged assessment policy missing');
  assert(koreanPlan.assessment.recommended === true, 'korean: Day 0 baseline should be recommended for a fresh learner');

  // Create one real StudyEvent error for retail. Learner Data must derive an ErrorRecord,
  // while the FSRS review quota remains a separate count.
  const retailBefore = await selectDomain('retail');
  const reviewBefore = retailBefore.review.count;

  await page.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
    state.studyEvents.push({
      schema_version: '1.0',
      event_id: 'evt-today-plan-retail-error-1',
      occurred_at: new Date().toISOString(),
      domain: 'retail',
      event_type: 'assessment_attempt',
      content_id: 'retail-foundation-01',
      concept_id: 'retail-need-state',
      skill: 'need-state',
      result: { rating: null, correct: false, score: 0, max_score: 10, confidence: null },
      duration_ms: null,
      session_id: 'today-plan-smoke',
      source: 'today_plan_smoke',
      device_id: null,
      algorithm: 'objective_scoring',
      assessment_id: 'retail-foundation-100-v1',
    });
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);

  await page.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record => record.domain === 'retail' && record.concept_id === 'retail-need-state' && record.status === 'active');
  }, STORAGE_KEY);
  await page.waitForFunction(() => window.__TODAY_PLAN_V12__?.current?.domainId === 'retail' && window.__TODAY_PLAN_V12__.current.revalidation.planned > 0);

  const retailAfter = await page.evaluate(() => window.__TODAY_PLAN_V12__.current);
  assert(retailAfter.revalidation.planned === 1, `retail: expected one priority revalidation, got ${retailAfter.revalidation.planned}`);
  assert(retailAfter.review.count === reviewBefore, `retail: remediation changed FSRS review quota (${reviewBefore} -> ${retailAfter.review.count})`);

  const retailText = (await page.locator('#todayPlanOverview').textContent()) || '';
  assert(retailText.includes('1 项优先重验证'), `retail: Today Plan did not surface weak revalidation: ${retailText}`);

  await context.close();
  console.log('Today Plan smoke OK: four domains share lesson/review/revalidation/assessment planning; review 10/5 limits remain independent from remediation.');
} finally {
  await browser.close();
}
