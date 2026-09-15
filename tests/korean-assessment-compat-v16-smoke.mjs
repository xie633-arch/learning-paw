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
  await page.waitForFunction(() => window.__KOREAN_TUTOR_UI_V16__?.version === '0.16.0');
  await page.waitForFunction(() => window.__KOREAN_STAGE_ADAPTIVE_V112__?.version === '0.11.2');
  await page.waitForFunction(() => window.__STATE_WRITE_GUARD_V113__?.version === '0.11.3');

  const fixture = await page.evaluate(async () => {
    const { koreanAssessments } = await import('./korean-assessment-data-v05.js');
    const assessment = koreanAssessments.week1;
    const item = assessment?.items?.find(candidate => candidate.type === 'mcq');
    if (!assessment || !item) return null;
    return {
      assessmentId: assessment.assessment_id,
      maxScore: assessment.max_score,
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

  assert(fixture?.item?.prompt, 'Korean stage-assessment fixture unavailable');
  const wrongIndex = fixture.item.correctAnswer === 0 ? 1 : 0;

  await page.evaluate(({ key, fixture, wrongIndex }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    const now = new Date().toISOString();
    state.assessmentAttempts = [
      ...(state.assessmentAttempts || []),
      {
        schema_version: '1.0',
        attempt_id: 'compat-korean-week1-1',
        assessment_id: fixture.assessmentId,
        domain: 'korean',
        started_at: now,
        completed_at: now,
        score: 0,
        max_score: fixture.maxScore,
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
        source: 'korean_v16_compat_smoke',
      },
    ];
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, fixture, wrongIndex });

  const conceptId = fixture.item.conceptIds[0];
  await page.waitForFunction(({ key, conceptId }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return (state.errorRecords || []).some(record =>
      record.domain === 'korean'
      && record.concept_id === conceptId
      && record.status === 'active'
      && record.error_type === 'assessment_error'
    );
  }, { key: STORAGE_KEY, conceptId });

  // The old stage-assessment evidence remains ingestible, but the Korean homepage
  // is intentionally tutor-first rather than turning that evidence into a legacy
  // vocabulary/weak-item primary flow.
  await page.locator('#mobileBottomNav button[data-target="domainHub"]').click();
  await page.locator('[data-domain="korean"]').click();
  await page.waitForFunction(() => document.querySelector('#domainName')?.textContent?.trim() === '韩语');
  await page.locator('#mobileBottomNav button[data-target="trainingHub"]').click();
  await page.locator('#koreanTutorPanel').waitFor({ state: 'visible' });

  const tutorText = (await page.locator('#koreanTutorPanel').textContent()) || '';
  assert(tutorText.includes('今日私教 Prompt'), 'Korean tutor-first UI is not active');
  assert(tutorText.includes('墨墨'), 'Korean tutor UI should delegate vocabulary memory to MoMo');
  assert(await page.locator('#trainingHub .training-actions').evaluate(node => node.classList.contains('hidden')), 'legacy generic review controls should stay hidden for Korean');

  const trackedItems = await page.evaluate(() => window.__KOREAN_STAGE_ADAPTIVE_V112__?.trackedItems || 0);
  assert(trackedItems > 0, 'stage-assessment compatibility metadata was lost');

  await context.close();
  console.log('Korean assessment compatibility smoke OK: legacy stage evidence is still ingested, while Yonsei + 30-minute AI tutor remains the primary Korean UI.');
} finally {
  await browser.close();
}
