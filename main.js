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
await import('./v04-boot.js');
await import('./v04-schema-align.js');

// Migrate legacy history/test results into StudyEvent v1 + Assessment Attempt
// before app.js reads localStorage, while keeping the current UI backward-compatible.
await import('./learner-data-v1.js');
await import('./app.js');
await import('./korean-voice-ui-v04.js');

const syncKoreanRuntimeCopy = () => {
  const domainName = document.querySelector('#domainName');
  if (domainName?.textContent?.trim() !== '韩语') return;

  const lead = document.querySelector('#homeLead');
  if (lead) {
    lead.textContent = 'Day 0–28 课程已接入：Curriculum 推进新课，FSRS 管理复习；每天提供清晰完整的 ChatGPT Voice Prompt，复制后即可直接语音练习。';
  }

  const notice = document.querySelector('#koreanNotice');
  if (notice) {
    const heading = notice.querySelector('h2');
    const body = notice.querySelector('p.muted');
    if (heading) heading.textContent = 'ChatGPT Voice 作为每日口语陪练';
    if (body) body.textContent = 'Learning Paw 负责每天生成语音任务与完整 Prompt；连续韩语对话、追问和情景陪练直接在 ChatGPT App Voice 中完成。结束后只保留 1–3 个高价值问题。';
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
