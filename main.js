await import('./korean-v04.js');

const { curricula, domainOverrides, visualSources } = await import('./platform-data.js');

// Legacy Korean modules still provide assessment/content compatibility, but V0.16
// replaces their visible course/review flow with Yonsei textbook + AI private tutor.
const koreanSteps = curricula.korean?.steps || [];
koreanSteps.forEach(step => {
  (step.activities || []).forEach(activity => {
    if (activity.type === 'ai_conversation') activity.type = 'chatgpt_voice_task';
  });
});

// Keep the generic fallback aligned with the current phone generation too.
// The richer official gallery replaces this UI later, but a failed enhancement must never fall back to Pura 80.
const legacyPuraSource = visualSources.phone?.find(item => item.name === 'HUAWEI Pura 80');
if (legacyPuraSource) {
  legacyPuraSource.name = 'HUAWEI Pura 90';
  legacyPuraSource.url = 'https://consumer.huawei.com/cn/phones/pura90/';
  legacyPuraSource.focus = 'Pura 90 系列影像、设计语言与当前产品视觉辨识';
}

// V0.14.1 deepens the Retail domain with one continuous 16-lesson route.
await import('./retail-business-district-v141.js');

// Keep the previous Korean prerequisite/assessment implementation available for
// compatibility with existing learning records and stage checks.
await import('./korean-hangul-gate-v07.js');
await import('./korean-hangul-gate-compat-v071.js');
await import('./korean-voice-v04.js');
await import('./korean-content-v04.js');
await import('./korean-practice-month1-v06.js');
await import('./korean-lesson-content-v05.js');

// V0.16 is the Korean runtime contract: Yonsei Korean is the only course spine,
// MoMo handles vocabulary memory, and Learning Paw schedules/records ~30-minute
// ChatGPT private-tutor sessions. It also removes legacy Korean cards from the
// shared FSRS card pool without changing the other domains.
await import('./korean-tutor-v16.js');

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
await import('./state-write-guard-v113.js');
await import('./formal-test-adapter-v111.js');
await import('./app.js');

// Existing Korean stage assessments remain available as a separate capability.
await import('./korean-assessment-ui-v05.js');

// V0.5 mobile information architecture + built-in lesson reading content.
await import('./learning-ui-v05.js');
await import('./mobile-domain-grid-v051.js');
await import('./official-visual-gallery-v051.js');
await import('./lesson-official-visuals-v052.js');

// V0.7 product-learning interaction: one ecommerce-style Variant catalog for all current phone families.
await import('./phone-family-variant-gallery-v07.js');
await import('./phone-family-pricing-v071.js');

// V0.9 searchable phone-tech library. Keep it inside the Route card so the V0.8
// tab controller treats it as part of the Route view rather than a floating page.
await import('./phone-knowledge-ui-v09.js');
const phoneKnowledgeCard = document.querySelector('#phoneKnowledgeCard');
const routeCard = document.querySelector('#routeCard');
if (phoneKnowledgeCard && routeCard && !routeCard.contains(phoneKnowledgeCard)) routeCard.append(phoneKnowledgeCard);

// V0.9.1 connects technical concepts to current real products and official specs.
await import('./phone-product-lab-v091.js');

// V0.10 closes the adaptive loop for Product Lab.
await import('./phone-adaptive-v10.js');
await import('./phone-adaptive-note-sync-v101.js');

const syncKoreanRuntimeCopy = () => {
  const domainName = document.querySelector('#domainName');
  if (domainName?.textContent?.trim() !== '韩语') return;

  const lead = document.querySelector('#homeLead');
  if (lead) {
    lead.textContent = '《延世韩国语》决定学什么；Learning Paw 负责教材进度与私教任务；ChatGPT 负责 30 分钟互动教学；墨墨负责词汇记忆。';
  }

  const notice = document.querySelector('#koreanNotice');
  if (notice) {
    const heading = notice.querySelector('h2');
    const body = notice.querySelector('p.muted');
    if (heading) heading.textContent = '《延世韩国语》 × AI 韩语私教';
    if (body) body.textContent = '韩语模块不再提供站内单词卡或 FSRS 词汇复习。每天从 Learning Paw 生成约 30 分钟私教任务，在 ChatGPT 完成教材讲解、互动练习、主动输出、纠错和复盘；词汇记忆交给墨墨记忆卡。';
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

// V0.8 turns the long dashboard into real tab views and a bounded daily plan.
await import('./ux-v08.js');
await import('./visual-ui-v081.js');

// Shared adaptive learning remains active for the other domains and for retained
// Korean assessment errors; Korean vocabulary review itself is no longer scheduled.
await import('./adaptive-learning-v11.js');
await import('./korean-stage-adaptive-v112.js');
await import('./today-plan-v12.js');
await import('./study-event-ui-v122.js');
await import('./learner-recommendation-v13.js');
await import('./recommendation-ui-v13.js');

// V0.16 presentation layer: textbook progress, private-tutor prompt, completion
// recording and tutor-history views. Continuous conversation happens in ChatGPT.
await import('./korean-tutor-ui-v16.js');
