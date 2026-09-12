import { curricula } from './platform-data.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';

const getState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const currentKoreanStep = () => {
  const curriculum = curricula.korean;
  if (!curriculum) return null;
  const progress = getState().lessonProgress || {};
  return (curriculum.steps || []).find(step => !progress[step.id]) || null;
};

const copyText = async (text, button) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  const old = button.textContent;
  button.textContent = '已复制 ✓';
  setTimeout(() => { button.textContent = old; }, 1400);
};

const ensureStyles = () => {
  if (document.querySelector('#koreanVoiceTaskStyles')) return;
  const style = document.createElement('style');
  style.id = 'koreanVoiceTaskStyles';
  style.textContent = `
    .chatgpt-voice-task { margin-top: 18px; padding: 16px; border: 1px solid rgba(127,127,127,.25); border-radius: 16px; background: rgba(127,127,127,.06); }
    .chatgpt-voice-task h3 { margin: 0 0 6px; font-size: 1rem; }
    .voice-task-meta { display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 10px; }
    .voice-task-meta span { font-size:.78rem; padding:4px 8px; border-radius:999px; background:rgba(127,127,127,.12); }
    .voice-task-targets { margin: 8px 0 12px; padding-left: 20px; }
    .voice-task-targets li { margin: 4px 0; }
    .voice-prompt-box { white-space: pre-wrap; word-break: break-word; max-height: 340px; overflow:auto; padding:12px; border-radius:12px; background:rgba(127,127,127,.09); font-size:.86rem; line-height:1.55; }
    .voice-task-actions { display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
    .voice-task-actions button { cursor:pointer; }
    .voice-task-note { margin:8px 0 0; font-size:.82rem; opacity:.72; }
  `;
  document.head.append(style);
};

const renderVoiceTask = () => {
  ensureStyles();
  const domainName = document.querySelector('#domainName')?.textContent?.trim();
  const container = document.querySelector('#todayLessonDetails');
  if (!container) return;

  container.querySelector('.chatgpt-voice-task')?.remove();
  if (domainName !== '韩语') return;

  const step = currentKoreanStep();
  const task = step?.voice_task;
  if (!task) return;

  const section = document.createElement('section');
  section.className = 'chatgpt-voice-task';

  const heading = document.createElement('h3');
  heading.textContent = '🎙️ 今日 ChatGPT Voice';
  section.append(heading);

  const subtitle = document.createElement('div');
  subtitle.textContent = task.title;
  section.append(subtitle);

  const meta = document.createElement('div');
  meta.className = 'voice-task-meta';
  const duration = document.createElement('span');
  duration.textContent = `约 ${task.duration_minutes} 分钟`;
  const mode = document.createElement('span');
  mode.textContent = task.mode;
  meta.append(duration, mode);
  section.append(meta);

  const targetTitle = document.createElement('strong');
  targetTitle.textContent = '今天尽量覆盖';
  section.append(targetTitle);

  const targets = document.createElement('ul');
  targets.className = 'voice-task-targets';
  (task.targets || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    targets.append(li);
  });
  section.append(targets);

  const promptTitle = document.createElement('strong');
  promptTitle.textContent = '完整 Prompt';
  section.append(promptTitle);

  const promptBox = document.createElement('div');
  promptBox.className = 'voice-prompt-box';
  promptBox.textContent = task.prompt;
  section.append(promptBox);

  const actions = document.createElement('div');
  actions.className = 'voice-task-actions';
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'primary';
  copyBtn.textContent = '复制完整 Prompt';
  copyBtn.addEventListener('click', () => copyText(task.prompt, copyBtn));
  actions.append(copyBtn);
  section.append(actions);

  const note = document.createElement('p');
  note.className = 'voice-task-note';
  note.textContent = '复制后打开 ChatGPT Voice 直接开始。结束时把最后一行“Voice复盘”保留下来即可。';
  section.append(note);

  container.append(section);
};

renderVoiceTask();

const title = document.querySelector('#todayLessonTitle');
const domain = document.querySelector('#domainName');
if (title) new MutationObserver(() => queueMicrotask(renderVoiceTask)).observe(title, { childList: true, subtree: true, characterData: true });
if (domain) new MutationObserver(() => queueMicrotask(renderVoiceTask)).observe(domain, { childList: true, subtree: true, characterData: true });

window.addEventListener('storage', renderVoiceTask);
