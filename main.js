await import('./korean-v04.js');

// Keep the running Korean module aligned with the current Obsidian V1.2 decision:
// Learning Paw schedules/records speaking tasks; continuous voice practice happens in ChatGPT Voice.
const { curricula, domainOverrides } = await import('./platform-data.js');
if (domainOverrides.korean) {
  domainOverrides.korean.modes = [
    { label: 'Day 0–28 课程路线', status: '可用' },
    { label: '主动表达 / 听写 / TTS', status: '可用' },
    { label: 'ChatGPT Voice Task', status: '规划中' },
    { label: '发音跟读 / 参考音', status: '规划中' },
  ];
}

const koreanSteps = curricula.korean?.steps || [];
koreanSteps.forEach(step => {
  (step.activities || []).forEach(activity => {
    if (activity.type === 'ai_conversation') activity.type = 'chatgpt_voice_task';
  });
});
const week3 = koreanSteps.find(step => step.id === 'ko-day-021');
if (week3) {
  week3.task = '完成综合练习，并直接在 ChatGPT App Voice 中做约 3 分钟受控韩语交流；结束后只记录 1–3 个最值得回炉的问题。';
}
const month1 = koreanSteps.find(step => step.id === 'ko-day-028');
if (month1) {
  month1.task = '完成 Month 1 Assessment，并在 ChatGPT App Voice 中做 3–5 分钟受控交流；根据结果决定正常进入第二月还是安排针对性补强。';
}

await import('./korean-content-v04.js');
await import('./v04-boot.js');
await import('./v04-schema-align.js');
await import('./app.js');

const syncKoreanRuntimeCopy = () => {
  const domainName = document.querySelector('#domainName');
  if (domainName?.textContent?.trim() !== '韩语') return;

  const lead = document.querySelector('#homeLead');
  if (lead) {
    lead.textContent = 'Day 0–28 课程已接入：Curriculum 推进新课，FSRS 管理复习；连续口语直接使用 ChatGPT Voice，网站负责任务编排与学习记录。';
  }

  const notice = document.querySelector('#koreanNotice');
  if (notice) {
    const heading = notice.querySelector('h2');
    const body = notice.querySelector('p.muted');
    if (heading) heading.textContent = 'ChatGPT Voice 作为外部口语陪练';
    if (body) body.textContent = 'Learning Paw 不重复开发实时语音系统。网站负责课程、复习、今日语音任务与错误记录；连续韩语对话、追问和情景陪练直接在 ChatGPT App Voice 中完成。';
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
