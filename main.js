await import('./korean-v04.js');

// Keep the running Korean module aligned with the Obsidian decision:
// Learning Paw schedules/records speaking tasks; continuous voice practice happens in ChatGPT Voice.
const { curricula, domainOverrides } = await import('./platform-data.js');
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
    { label: 'Day 0 / 7 / 14 / 21 / 28 阶段验收', status: '可用' },
  ];
}

await import('./korean-voice-v04.js');
await import('./korean-content-v04.js');

// Day 0 baseline now runs through the staged Assessment layer rather than legacy review cards.

// V0.5 Korean lessons: full built-in reading content + official weekly printable resources.
await import('./korean-lesson-content-v05.js');

await import('./v04-boot.js');
await import('./v04-schema-align.js');

// Migrate legacy history/test results into StudyEvent v1 + Assessment Attempt
// before app.js reads localStorage, while keeping the current UI backward-compatible.
await import('./learner-data-v1.js');
await import('./app.js');
await import('./korean-voice-ui-v04.js');

// Korean staged assessment: Day 0 baseline + Day 7 / 14 / 21 / 28 checks.
await import('./korean-assessment-ui-v05.js');

// V0.5 mobile information architecture + built-in lesson reading content.
await import('./learning-ui-v05.js');
await import('./korean-learning-ui-v05.js');
await import('./mobile-domain-grid-v051.js');
await import('./official-visual-gallery-v051.js');
await import('./lesson-official-visuals-v052.js');

// V0.6 product-learning interaction: ecommerce-style model + color variants.
await import('./pura90-variant-gallery-v06.js');

const syncKoreanRuntimeCopy = () => {
  const domainName = document.querySelector('#domainName');
  if (domainName?.textContent?.trim() !== '韩语') return;

  const lead = document.querySelector('#homeLead');
  if (lead) {
    lead.textContent = 'Day 0–28 已提供完整学习正文：每天直接在站内学习，Curriculum 解锁新课、FSRS 管理复习，并附当日 ChatGPT Voice Prompt；阶段验收按 Day 0 / 7 / 14 / 21 / 28 逐步解锁。';
  }

  const notice = document.querySelector('#koreanNotice');
  if (notice) {
    const heading = notice.querySelector('h2');
    const body = notice.querySelector('p.muted');
    if (heading) heading.textContent = '韩语：课程正文 + ChatGPT Voice + 阶段验收';
    if (body) body.textContent = '不需要自己找资料。Learning Paw 提供 Day 0–28 课程正文、训练、每日 Voice Prompt、每周官方打印材料；Day 0、Day 7、Day 14、Day 21 与 Day 28 阶段验收均已接入并随课程进度自动解锁。';
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
