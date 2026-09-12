await import('./korean-v04.js');

// Keep the running Korean module aligned with the Obsidian decision:
// Learning Paw schedules/records speaking tasks; continuous voice practice happens in ChatGPT Voice.
const { curricula } = await import('./platform-data.js');
const koreanSteps = curricula.korean?.steps || [];
koreanSteps.forEach(step => {
  (step.activities || []).forEach(activity => {
    if (activity.type === 'ai_conversation') activity.type = 'chatgpt_voice_task';
  });
});

await import('./korean-voice-v04.js');
await import('./korean-content-v04.js');
await import('./korean-baseline-v04.js');

// V0.5 Korean lessons: full built-in reading content + official weekly printable resources.
await import('./korean-lesson-content-v05.js');

await import('./v04-boot.js');
await import('./v04-schema-align.js');

// Migrate legacy history/test results into StudyEvent v1 + Assessment Attempt
// before app.js reads localStorage, while keeping the current UI backward-compatible.
await import('./learner-data-v1.js');
await import('./app.js');
await import('./korean-voice-ui-v04.js');

// V0.5 mobile information architecture + built-in lesson reading content.
await import('./learning-ui-v05.js');
await import('./korean-learning-ui-v05.js');
await import('./mobile-domain-grid-v051.js');
await import('./official-visual-gallery-v051.js');
await import('./lesson-official-visuals-v052.js');

const syncKoreanRuntimeCopy = () => {
  const domainName = document.querySelector('#domainName');
  if (domainName?.textContent?.trim() !== '韩语') return;

  const lead = document.querySelector('#homeLead');
  if (lead) {
    lead.textContent = 'Day 0–28 已提供完整学习正文：每天直接在站内学习，Curriculum 解锁新课、FSRS 管理复习，并附当日 ChatGPT Voice Prompt；每周提供官方可打印 PDF 下载入口。';
  }

  const notice = document.querySelector('#koreanNotice');
  if (notice) {
    const heading = notice.querySelector('h2');
    const body = notice.querySelector('p.muted');
    if (heading) heading.textContent = '韩语：课程正文 + ChatGPT Voice + 官方打印材料';
    if (body) body.textContent = '不需要自己找资料。Learning Paw 提供 Day 0–28 课程正文、训练、每日 Voice Prompt，并按周匹配世宗学堂官方教材/练习册 PDF 下载页；连续口语直接在 ChatGPT App Voice 中完成。';
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
