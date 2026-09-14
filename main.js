await import('./korean-v04.js');

// Keep the running Korean module aligned with the Obsidian decision:
// Learning Paw schedules/records speaking tasks; continuous voice practice happens in ChatGPT Voice.
const { curricula, domainOverrides, visualSources } = await import('./platform-data.js');
const koreanSteps = curricula.korean?.steps || [];
koreanSteps.forEach(step => {
  (step.activities || []).forEach(activity => {
    if (activity.type === 'ai_conversation') activity.type = 'chatgpt_voice_task';
  });
});

if (domainOverrides.korean) {
  domainOverrides.korean.modes = [
    { label: 'Day 0–28 课程路线', status: '可用' },
    { label: '主动表达 / 听写 / TTS', status: '可用' },
    { label: 'ChatGPT Voice 每日任务', status: '可用' },
    { label: '每日 Exit Check + Day 0 / 7 / 14 / 21 / 28 阶段验收', status: '可用' },
  ];
}

// Keep the generic fallback aligned with the current phone generation too.
// The richer official gallery replaces this UI later, but a failed enhancement must never fall back to Pura 80.
const legacyPuraSource = visualSources.phone?.find(item => item.name === 'HUAWEI Pura 80');
if (legacyPuraSource) {
  legacyPuraSource.name = 'HUAWEI Pura 90';
  legacyPuraSource.url = 'https://consumer.huawei.com/cn/phones/pura90/';
  legacyPuraSource.focus = 'Pura 90 系列影像、设计语言与当前产品视觉辨识';
}

await import('./korean-voice-v04.js');
await import('./korean-content-v04.js');
await import('./korean-practice-month1-v06.js');

// Day 0 baseline now runs through the staged Assessment layer rather than legacy review cards.

// V0.5 Korean lessons: full built-in reading content + official weekly printable resources.
await import('./korean-lesson-content-v05.js');

await import('./v04-boot.js');
await import('./v04-schema-align.js');

// V0.9 Phone Knowledge Base: build a large Concept Tree, while only allowing a
// small starter set into review after the product-portfolio lesson is complete.
await import('./phone-knowledge-v09.js');
await import('./phone-knowledge-gate-v091.js');

// V0.11 attaches stable item / concept / skill metadata to the existing formal
// assessments and Korean Exit Checks before StudyEvent migration runs.
await import('./adaptive-metadata-v11.js');

// Migrate legacy history/test results into StudyEvent v1 + Assessment Attempt
// before app.js reads localStorage, while keeping the current UI backward-compatible.
await import('./learner-data-v1.js');
// V0.11.1 upgrades already-migrated formal-test attempts/events with stable
// concept and skill metadata so existing learner history also becomes actionable.
await import('./formal-test-adapter-v111.js');
await import('./app.js');
await import('./korean-voice-ui-v04.js');

// Korean staged assessment: Day 0 baseline + Day 7 / 14 / 21 / 28 checks.
await import('./korean-assessment-ui-v05.js');

// V0.5 mobile information architecture + built-in lesson reading content.
await import('./learning-ui-v05.js');
await import('./korean-learning-ui-v05.js');
await import('./korean-completion-guard-v06.js');
await import('./mobile-domain-grid-v051.js');
await import('./official-visual-gallery-v051.js');
await import('./lesson-official-visuals-v052.js');

// V0.7 product-learning interaction: one ecommerce-style Variant catalog for all current phone families.
await import('./phone-family-variant-gallery-v07.js');
// Price data changes more frequently than product imagery, so keep it as a small independent verified layer.
await import('./phone-family-pricing-v071.js');

// V0.9 searchable phone-tech library. Keep it inside the Route card so the V0.8
// tab controller treats it as part of the Route view rather than a floating page.
await import('./phone-knowledge-ui-v09.js');
const phoneKnowledgeCard = document.querySelector('#phoneKnowledgeCard');
const routeCard = document.querySelector('#routeCard');
if (phoneKnowledgeCard && routeCard && !routeCard.contains(phoneKnowledgeCard)) routeCard.append(phoneKnowledgeCard);

// V0.9.1 connects technical concepts to current real products and official specs.
// It lives inside the Knowledge Base so browsing facts does not inflate today's FSRS workload.
await import('./phone-product-lab-v091.js');

// V0.10 closes the adaptive loop: Product Lab attempts -> StudyEvent -> Error Bank
// -> Concept remediation -> revalidation -> resolved ErrorRecord.
await import('./phone-adaptive-v10.js');
// Product Lab rerenders its case DOM after each answer; this small observer keeps
// the adaptive feedback note attached to the newly rendered feedback block.
await import('./phone-adaptive-note-sync-v101.js');

const syncKoreanRuntimeCopy = () => {
  const domainName = document.querySelector('#domainName');
  if (domainName?.textContent?.trim() !== '韩语') return;

  const lead = document.querySelector('#homeLead');
  if (lead) {
    lead.textContent = 'Day 0–28 已提供完整学习正文：Curriculum 解锁新课、当日训练卡与 FSRS 负责练习和复习，普通学习日通过 Exit Check 后完成；同时附每日 ChatGPT Voice Prompt、每周官方打印材料与阶段验收。';
  }

  const notice = document.querySelector('#koreanNotice');
  if (notice) {
    const heading = notice.querySelector('h2');
    const body = notice.querySelector('p.muted');
    if (heading) heading.textContent = '韩语：正文 + 训练 + Exit Check + Voice + 阶段验收';
    if (body) body.textContent = '不需要自己找资料。Learning Paw 提供 Day 0–28 正文、课程解锁训练卡、FSRS、普通学习日 Exit Check、每日 ChatGPT Voice Prompt、每周官方打印材料，以及 Day 0 / 7 / 14 / 21 / 28 阶段验收。';
  }
};

syncKoreanRuntimeCopy();
const koreanDomainName = document.querySelector('#domainName');
if (koreanDomainName) {
  new MutationObserver(syncKoreanRuntimeCopy).observe(koreanDomainName, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

// V0.8 turns the long dashboard into real tab views and replaces the misleading
// "all unseen cards are due" presentation with a bounded daily review plan.
await import('./ux-v08.js');

// V0.8.1 applies the visual layer: Today-first hierarchy, compact stats,
// domain accents and stronger App-like navigation / button feedback.
await import('./visual-ui-v081.js');

// V0.11 generalizes the adaptive loop across ordinary recall, phone / retail /
// industry formal tests, and Korean Exit Checks without inflating today's FSRS quota.
await import('./adaptive-learning-v11.js');
// V0.11.2 makes Korean Week 1 / 2 / 3 / Month 1 assessment errors actionable in
// the same weak-knowledge view with single-item revalidation and resolved state.
await import('./korean-stage-adaptive-v112.js');