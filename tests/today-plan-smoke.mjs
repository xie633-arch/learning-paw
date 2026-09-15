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
  await page.waitForFunction(() => typeof window.__TODAY_PLAN_V12__?.build === 'function');
  await page.waitForFunction(() => typeof window.__STUDY_EVENT_READ_MODEL_V12__?.deriveTodayPracticeStats === 'function');
  await page.waitForFunction(() => typeof window.__LEARNER_RECOMMENDATION_V13__?.rankActiveErrorRecommendations === 'function');
  await page.waitForFunction(() => Boolean(window.__LEARNING_PAW_UX_V08__?.activateTab));
  await page.waitForFunction(() => window.__KOREAN_TUTOR_UI_V16__?.version === '0.16.0');

  async function selectDomain(domainId) {
    await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
    await page.waitForFunction(() => !document.querySelector('#domainHub')?.classList.contains('ux-tab-inactive'));
    await page.locator(`[data-domain="${domainId}"]`).click();
    await page.waitForFunction(id => window.__TODAY_PLAN_V12__?.current?.domainId === id, domainId);
    await page.locator('#mobileBottomNav button[data-target="todayLearningCard"]').click();
    if (domainId === 'korean') {
      await page.waitForFunction(() => document.querySelector('#todayPlanOverview')?.classList.contains('hidden'));
      await page.locator('#todayLessonTitle').waitFor({ state: 'visible' });
    } else {
      await page.locator('#todayPlanOverview').waitFor({ state: 'visible' });
    }
    return page.evaluate(() => window.__TODAY_PLAN_V12__.current);
  }

  // Phone / retail / industry continue to use the shared bounded Today Plan.
  for (const domainId of ['phone', 'retail', 'industry']) {
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

  // Korean V0.16 intentionally replaces the generic FSRS/course-plan surface with
  // one focused daily task: Yonsei Korean + ~30-minute ChatGPT private tutoring.
  const koreanPlan = await selectDomain('korean');
  assert(koreanPlan.domainId === 'korean', 'korean: Today Plan domain state did not switch');
  assert(await page.locator('#todayPlanOverview').evaluate(node => node.classList.contains('hidden')), 'korean: generic Today Plan should stay hidden');
  const koreanTitle = (await page.locator('#todayLessonTitle').textContent()) || '';
  const koreanSummary = (await page.locator('#todayLessonSummary').textContent()) || '';
  const koreanAction = (await page.locator('#completeLessonBtn').textContent()) || '';
  assert(koreanTitle.includes('《延世韩国语》'), `korean: Yonsei title missing: ${koreanTitle}`);
  assert(koreanSummary.length > 0, 'korean: textbook focus summary missing');
  assert(koreanAction.includes('30 分钟私教') || koreanAction.includes('再上一节私教'), `korean: private-tutor action missing: ${koreanAction}`);

  // P2 read-model proof: add a practice fact directly to StudyEvent without adding legacy history.
  // Today Plan and hero statistics must consume the fact from the canonical event layer.
  await selectDomain('phone');
  await page.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state.history = [];
    state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
    state.studyEvents.push({
      schema_version: '1.0',
      event_id: 'evt-today-plan-phone-study-event-1',
      occurred_at: new Date().toISOString(),
      domain: 'phone',
      event_type: 'practice_attempt',
      content_id: 'hardware-soc-001',
      concept_id: null,
      skill: 'SoC / 性能',
      result: { rating: 'good', correct: null, confidence: null },
      duration_ms: null,
      session_id: 'today-plan-study-event-smoke',
      source: 'today_plan_smoke',
      device_id: null,
      algorithm: 'FSRS',
      session_mode: 'due',
    });
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);

  await page.waitForFunction(() => {
    const plan = window.__TODAY_PLAN_V12__?.current;
    return plan?.domainId === 'phone'
      && plan.review.source === 'studyEvents'
      && plan.review.reviewedToday === 1
      && plan.review.knownToday === 1
      && plan.review.newToday === 1;
  });
  assert((await page.locator('#reviewedToday').textContent()) === '1', 'phone: hero reviewedToday did not consume StudyEvent read model');
  assert((await page.locator('#knownToday').textContent()) === '1', 'phone: hero knownToday did not consume StudyEvent read model');

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
  await page.waitForFunction(() => window.__STUDY_EVENT_UI_V122__?.current?.domainId === 'retail' && window.__STUDY_EVENT_UI_V122__.current.weakOrder?.length > 0);

  const convergence = await page.evaluate(() => ({
    plan: window.__TODAY_PLAN_V12__.current,
    weak: window.__STUDY_EVENT_UI_V122__.current.weakOrder[0],
  }));
  const retailAfter = convergence.plan;
  const weakTop = convergence.weak;

  assert(retailAfter.revalidation.planned === 1, `retail: expected one priority revalidation, got ${retailAfter.revalidation.planned}`);
  assert(retailAfter.revalidation.source === 'LearnerRecommendation + ErrorRecord', `retail: Today Plan still uses legacy revalidation ordering: ${retailAfter.revalidation.source}`);
  assert(retailAfter.review.count === reviewBefore, `retail: remediation changed FSRS review quota (${reviewBefore} -> ${retailAfter.review.count})`);
  assert(retailAfter.revalidation.errorIds[0] === weakTop.errorId, `retail: Today Plan and Weak Spots disagree on top error (${retailAfter.revalidation.errorIds[0]} vs ${weakTop.errorId})`);
  assert(retailAfter.revalidation.recommendationScores[0] === weakTop.priorityScore, `retail: Today Plan and Weak Spots disagree on recommendation score (${retailAfter.revalidation.recommendationScores[0]} vs ${weakTop.priorityScore})`);
  assert(retailAfter.revalidation.actions[0] === weakTop.action, `retail: Today Plan and Weak Spots disagree on recommended action (${retailAfter.revalidation.actions[0]} vs ${weakTop.action})`);

  const retailText = (await page.locator('#todayPlanOverview').textContent()) || '';
  assert(retailText.includes('1 项优先重验证'), `retail: Today Plan did not surface weak revalidation: ${retailText}`);

  await context.close();
  console.log('Today Plan smoke OK: phone/retail/industry keep the shared bounded plan; Korean uses Yonsei + 30-minute tutor; StudyEvent and recommendation queues remain stable.');
} finally {
  await browser.close();
}
