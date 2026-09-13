import { curricula } from './platform-data.js';
import { koreanAssessments, koreanAssessmentStages } from './korean-assessment-data-v05.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
let activeSession = null;

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function safeId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function currentDomainIsKorean() {
  const state = readState();
  if (state?.preferences?.lastDomain === 'korean') return true;
  return document.querySelector('#domainName')?.textContent?.trim() === '韩语';
}

function lessonDone(id, state = readState()) {
  return Boolean(state.lessonProgress?.[id]);
}

function latestAttempt(assessmentId, state = readState()) {
  return [...(state.assessmentAttempts || [])].reverse().find(item => item.assessment_id === assessmentId) || null;
}

function baselineDone(state = readState()) {
  return Boolean(state.koreanBaseline?.completed_at) || lessonDone('ko-day-000', state);
}

function stageStatus(state = readState()) {
  if (!baselineDone(state)) {
    return { stage: koreanAssessmentStages[0], mode: 'ready', completed: 0, total: 0 };
  }

  const week1 = koreanAssessmentStages[1];
  const completed = week1.prerequisite_lessons.filter(id => lessonDone(id, state)).length;
  const attempt = latestAttempt(koreanAssessments.week1.assessment_id, state);
  const passed = Boolean(attempt?.passed);

  if (!passed) {
    return {
      stage: week1,
      mode: completed === week1.prerequisite_lessons.length ? 'ready' : 'locked',
      completed,
      total: week1.prerequisite_lessons.length,
      attempt,
    };
  }

  const later = koreanAssessmentStages.slice(2).find(stage => !lessonDone(stage.lesson_id, state));
  if (!later) return { stage: null, mode: 'done' };
  const laterCompleted = later.prerequisite_lessons.filter(id => lessonDone(id, state)).length;
  return {
    stage: later,
    mode: later.implemented && laterCompleted === later.prerequisite_lessons.length ? 'ready' : 'planned',
    completed: laterCompleted,
    total: later.prerequisite_lessons.length,
  };
}

function ensureStyles() {
  if (document.querySelector('#koreanAssessmentStyles')) return;
  const style = document.createElement('style');
  style.id = 'koreanAssessmentStyles';
  style.textContent = `
    .ko-assess-overlay{position:fixed;inset:0;z-index:1600;background:rgba(15,23,42,.48);display:grid;place-items:center;padding:18px}
    .ko-assess-panel{width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:26px;padding:24px;box-shadow:0 28px 90px rgba(15,23,42,.26);color:#111827}
    .ko-assess-top{display:flex;justify-content:space-between;align-items:center;gap:12px;position:sticky;top:-24px;padding:16px 0 10px;background:#fff;z-index:2}
    .ko-assess-progress{height:8px;border-radius:999px;background:#edf0f4;overflow:hidden;margin:12px 0 22px}.ko-assess-progress span{display:block;height:100%;background:#111827;transition:width .2s ease}
    .ko-assess-kicker{font-size:12px;font-weight:800;letter-spacing:.16em;color:#667085}.ko-assess-title{font-size:28px;line-height:1.2;margin:4px 0 8px}.ko-assess-copy{color:#667085;line-height:1.7}
    .ko-assess-item{padding:18px;border-radius:18px;background:#f6f7f9;margin:16px 0}.ko-assess-item h3{margin:0 0 8px}.ko-assess-item p{line-height:1.7;color:#475467}
    .ko-assess-options{display:grid;gap:10px;margin-top:14px}.ko-assess-option{width:100%;text-align:left;padding:14px 16px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827}.ko-assess-option.selected{border-color:#111827;background:#eef1f5;font-weight:700}
    .ko-assess-input{width:100%;box-sizing:border-box;padding:14px 16px;border:1px solid #d9dee7;border-radius:14px;font:inherit;background:#fff;color:#111827}
    .ko-assess-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}.ko-assess-audio{margin-top:12px}
    .ko-assess-section-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0}.ko-assess-score{padding:14px;border-radius:16px;background:#f6f7f9}.ko-assess-score strong{display:block;font-size:20px}.ko-assess-score span{color:#667085;font-size:13px}
    .ko-assess-result{padding:18px;border-radius:18px;background:#eef7f0;color:#28543a;line-height:1.7}.ko-assess-result.needs-work{background:#fff5e8;color:#7a4b12}
    .ko-assess-review{margin-top:16px;display:grid;gap:10px}.ko-assess-review-item{padding:14px;border-radius:14px;background:#f6f7f9;line-height:1.65}.ko-assess-review-item.wrong{background:#fff0f0}
    .ko-assess-note{padding:14px 16px;border-radius:16px;background:#f6f7f9;color:#475467;line-height:1.7;margin-top:14px}
    @media(max-width:720px){.ko-assess-overlay{padding:0;background:#fff}.ko-assess-panel{width:100%;height:100%;max-height:none;border-radius:0;padding:20px 18px calc(28px + env(safe-area-inset-bottom))}.ko-assess-top{top:-20px;padding-top:max(18px,env(safe-area-inset-top))}.ko-assess-actions{grid-template-columns:1fr}.ko-assess-section-grid{grid-template-columns:1fr 1fr}}
    @media(prefers-color-scheme:dark){.ko-assess-panel,.ko-assess-top{background:#181c22;color:#f3f4f6}.ko-assess-item,.ko-assess-score,.ko-assess-review-item,.ko-assess-note{background:#242932;color:#e5e7eb}.ko-assess-copy,.ko-assess-item p,.ko-assess-score span{color:#aab2bf}.ko-assess-option,.ko-assess-input{background:#1f242c;color:#f3f4f6;border-color:#3a414c}.ko-assess-option.selected{background:#2d3440;border-color:#e5e7eb}.ko-assess-progress{background:#303640}.ko-assess-progress span{background:#f3f4f6}.ko-assess-result{background:#203329;color:#a9dbb7}.ko-assess-result.needs-work{background:#382d1f;color:#f2c98d}.ko-assess-review-item.wrong{background:#3a2424}}
  `;
  document.head.append(style);
}

function ensureOverlay() {
  let overlay = document.querySelector('#koreanAssessmentOverlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'koreanAssessmentOverlay';
  overlay.className = 'ko-assess-overlay hidden';
  overlay.innerHTML = `<div class="ko-assess-panel" role="dialog" aria-modal="true"><div class="ko-assess-top"><span class="ko-assess-kicker">KOREAN ASSESSMENT</span><button class="ghost" id="closeKoreanAssessment">关闭</button></div><div id="koreanAssessmentBody"></div></div>`;
  document.body.append(overlay);
  overlay.querySelector('#closeKoreanAssessment').addEventListener('click', closeOverlay);
  return overlay;
}

function openOverlay() {
  ensureStyles();
  const overlay = ensureOverlay();
  overlay.classList.remove('hidden');
  overlay.querySelector('.ko-assess-panel').scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  document.querySelector('#koreanAssessmentOverlay')?.classList.add('hidden');
  document.body.style.overflow = '';
  activeSession = null;
}

function setBody(nodes) {
  const body = ensureOverlay().querySelector('#koreanAssessmentBody');
  body.innerHTML = '';
  nodes.forEach(node => body.append(node));
}

function el(tag, text = '', className = '') {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function normalizeText(value) {
  return String(value || '').normalize('NFC').trim().replace(/\s+/g, ' ');
}

function speakKorean(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.85;
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices.find(v => v.lang?.toLowerCase().startsWith('ko')) || null;
  speechSynthesis.speak(utterance);
}

function renderBaselineIntro() {
  const assessment = koreanAssessments.baseline;
  const title = el('h1', assessment.name, 'ko-assess-title');
  const copy = el('p', assessment.description, 'ko-assess-copy');
  const note = el('div', '这里不会出现“及格/不及格”。请按真实情况回答，不要为了更高表现提前查资料。Day 0 的语音样本仍在今天的 ChatGPT Voice Task 中完成。', 'ko-assess-note');
  const actions = el('div', '', 'ko-assess-actions');
  const cancel = el('button', '稍后再做', 'ghost');
  cancel.type = 'button'; cancel.addEventListener('click', closeOverlay);
  const start = el('button', '开始建立基线', 'primary');
  start.type = 'button'; start.addEventListener('click', () => startBaseline());
  actions.append(cancel, start);
  setBody([title, copy, note, actions]);
  openOverlay();
}

function startBaseline() {
  const assessment = koreanAssessments.baseline;
  activeSession = { type: 'baseline', started_at: new Date().toISOString(), index: 0, responses: {} };
  renderBaselineItem(assessment.items[0]);
}

function renderBaselineItem(item) {
  const assessment = koreanAssessments.baseline;
  const index = activeSession.index;
  const progress = el('div', '', 'ko-assess-progress');
  const bar = el('span'); bar.style.width = `${(index / assessment.items.length) * 100}%`; progress.append(bar);
  const kicker = el('div', `第 ${index + 1} / ${assessment.items.length} 项｜${item.title}`, 'ko-assess-kicker');
  const prompt = el('h2', item.prompt, 'ko-assess-title');
  const box = el('div', '', 'ko-assess-item');
  let getValue = () => null;

  if (item.type === 'choice') {
    const options = el('div', '', 'ko-assess-options');
    let selected = activeSession.responses[item.id] ?? null;
    item.options.forEach(option => {
      const button = el('button', option, 'ko-assess-option');
      button.type = 'button';
      if (selected === option) button.classList.add('selected');
      button.addEventListener('click', () => {
        selected = option;
        activeSession.responses[item.id] = option;
        options.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b === button));
      });
      options.append(button);
    });
    box.append(options);
    getValue = () => selected;
  } else if (item.type === 'multi') {
    const options = el('div', '', 'ko-assess-options');
    const selected = new Set(activeSession.responses[item.id] || []);
    item.options.forEach(option => {
      const button = el('button', option, 'ko-assess-option');
      button.type = 'button';
      if (selected.has(option)) button.classList.add('selected');
      button.addEventListener('click', () => {
        if (selected.has(option)) selected.delete(option); else selected.add(option);
        button.classList.toggle('selected', selected.has(option));
        activeSession.responses[item.id] = [...selected];
      });
      options.append(button);
    });
    box.append(options);
    getValue = () => [...selected];
  } else if (item.type === 'typing') {
    const input = document.createElement('input');
    input.className = 'ko-assess-input'; input.placeholder = item.placeholder || ''; input.value = activeSession.responses[item.id] || '';
    input.addEventListener('input', () => { activeSession.responses[item.id] = input.value; });
    box.append(input);
    getValue = () => input.value;
  }

  const actions = el('div', '', 'ko-assess-actions');
  const back = el('button', index === 0 ? '退出' : '上一项', 'ghost');
  back.type = 'button';
  back.addEventListener('click', () => {
    if (index === 0) return closeOverlay();
    activeSession.index -= 1; renderBaselineItem(assessment.items[activeSession.index]);
  });
  const next = el('button', index === assessment.items.length - 1 ? '完成 Day 0 基线' : '下一项', 'primary');
  next.type = 'button';
  next.addEventListener('click', () => {
    activeSession.responses[item.id] = getValue();
    if (index < assessment.items.length - 1) {
      activeSession.index += 1; renderBaselineItem(assessment.items[activeSession.index]);
    } else finishBaseline();
  });
  actions.append(back, next);
  setBody([progress, kicker, prompt, box, actions]);
}

function finishBaseline() {
  const now = new Date().toISOString();
  const state = readState();
  state.koreanBaseline = {
    schema_version: '1.0', assessment_id: koreanAssessments.baseline.assessment_id,
    started_at: activeSession.started_at, completed_at: now, responses: activeSession.responses,
  };
  state.lessonProgress = state.lessonProgress || {};
  state.lessonProgress['ko-day-000'] = now;
  const load = activeSession.responses['study-load'];
  state.preferences = state.preferences || {};
  if (load?.startsWith('20')) state.preferences.koreanStudyLoad = 'minimum';
  else if (load?.startsWith('75')) state.preferences.koreanStudyLoad = 'intensive';
  else if (load) state.preferences.koreanStudyLoad = 'standard';
  state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
  state.studyEvents.push({
    schema_version: '1.0', event_id: safeId('evt-ko-baseline'), occurred_at: now, domain: 'korean',
    event_type: 'baseline_completed', content_id: koreanAssessments.baseline.assessment_id, concept_id: null,
    skill: 'baseline', result: { completed: true }, duration_ms: null, session_id: null,
    source: 'learning_paw', device_id: null, algorithm: null,
  });
  writeState(state);

  const title = el('h1', 'Day 0 基线已建立', 'ko-assess-title');
  const result = el('div', '没有分数，也没有“好坏”。从现在开始，Day 28 会拿今天的起点做真实对比。下一步进入 Day 1｜韩文是怎么组成的。', 'ko-assess-result');
  const note = el('div', '今天还建议完成 Day 0 ChatGPT Voice Task，留下第一份固定语音样本；它不需要上传到 Learning Paw。', 'ko-assess-note');
  const actions = el('div', '', 'ko-assess-actions');
  const button = el('button', '进入 Day 1', 'primary');
  button.type = 'button'; button.addEventListener('click', () => location.reload());
  actions.append(button);
  setBody([title, result, note, actions]);
}

function renderWeek1Intro() {
  const assessment = koreanAssessments.week1;
  const title = el('h1', assessment.name, 'ko-assess-title');
  const copy = el('p', assessment.description, 'ko-assess-copy');
  const note = el('div', '本次共 100 分，但不是“10 道选择题 × 10 分”。它包含字母识读、音节组合、听辨、真实词和韩语键盘。答题过程中不公布正确答案。', 'ko-assess-note');
  const actions = el('div', '', 'ko-assess-actions');
  const cancel = el('button', '稍后再做', 'ghost'); cancel.type='button'; cancel.addEventListener('click', closeOverlay);
  const start = el('button', '开始 Week 1 验收', 'primary'); start.type='button'; start.addEventListener('click', startWeek1);
  actions.append(cancel, start);
  setBody([title, copy, note, actions]);
  openOverlay();
}

function startWeek1() {
  activeSession = { type: 'week1', started_at: new Date().toISOString(), index: 0, answers: [] };
  renderWeek1Item(koreanAssessments.week1.items[0]);
}

function renderWeek1Item(item) {
  const assessment = koreanAssessments.week1;
  const index = activeSession.index;
  const progress = el('div', '', 'ko-assess-progress');
  const bar = el('span'); bar.style.width = `${(index / assessment.items.length) * 100}%`; progress.append(bar);
  const section = assessment.sections.find(s => s.id === item.section_id);
  const kicker = el('div', `第 ${index + 1} / ${assessment.items.length} 题｜${section?.label || item.section_id}｜${item.max_score} 分`, 'ko-assess-kicker');
  const prompt = el('h2', item.prompt, 'ko-assess-title');
  const box = el('div', '', 'ko-assess-item');
  let selected = null;

  if (item.type === 'mcq' || item.type === 'audio_mcq') {
    if (item.type === 'audio_mcq') {
      const audio = el('button', '🔊 播放韩语', 'ghost ko-assess-audio'); audio.type='button'; audio.addEventListener('click', () => speakKorean(item.audio_text)); box.append(audio);
    }
    const options = el('div', '', 'ko-assess-options');
    item.options.forEach((option, optionIndex) => {
      const button = el('button', `${String.fromCharCode(65 + optionIndex)}. ${option}`, 'ko-assess-option');
      button.type='button';
      button.addEventListener('click', () => {
        selected = optionIndex;
        options.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b === button));
      });
      options.append(button);
    });
    box.append(options);
  } else if (item.type === 'typing') {
    const input = document.createElement('input');
    input.className='ko-assess-input'; input.placeholder='请直接用韩语键盘输入';
    input.addEventListener('input', () => { selected = input.value; });
    box.append(input);
  }

  const warning = el('p', '', 'ko-assess-copy');
  const actions = el('div', '', 'ko-assess-actions');
  const quit = el('button', '退出验收', 'ghost'); quit.type='button'; quit.addEventListener('click', closeOverlay);
  const next = el('button', index === assessment.items.length - 1 ? '提交并查看结果' : '确认并下一题', 'primary'); next.type='button';
  next.addEventListener('click', () => {
    if (selected === null || normalizeText(selected) === '') {
      warning.textContent = '请先完成这一题。'; return;
    }
    const correct = item.type === 'typing'
      ? normalizeText(selected) === normalizeText(item.target)
      : Number(selected) === Number(item.correct_answer);
    activeSession.answers.push({ item, selected, correct });
    if (index < assessment.items.length - 1) {
      activeSession.index += 1; renderWeek1Item(assessment.items[activeSession.index]);
    } else finishWeek1();
  });
  actions.append(quit, next);
  setBody([progress, kicker, prompt, box, warning, actions]);
}

function finishWeek1() {
  const assessment = koreanAssessments.week1;
  const now = new Date().toISOString();
  const sectionScores = {};
  assessment.sections.forEach(section => { sectionScores[section.id] = { score: 0, max_score: section.max_score, label: section.label }; });
  let score = 0;
  const itemResults = activeSession.answers.map(({ item, selected, correct }) => {
    const itemScore = correct ? item.max_score : 0;
    score += itemScore;
    sectionScores[item.section_id].score += itemScore;
    return {
      item_id: item.item_id, section_id: item.section_id, skill: item.skill, concept_ids: item.concept_ids || [],
      prompt: item.prompt, selected_answer: selected, correct_answer: item.type === 'typing' ? item.target : item.correct_answer,
      correct, score: itemScore, max_score: item.max_score, explanation: item.explanation,
    };
  });

  const totalPassed = score >= assessment.pass_rule.total_min;
  const sectionsPassed = Object.entries(assessment.pass_rule.section_min_ratio).every(([sectionId, ratio]) => {
    const section = sectionScores[sectionId];
    return section && section.score / section.max_score >= ratio;
  });
  const passed = totalPassed && sectionsPassed;
  const attempt = {
    schema_version: '1.0', attempt_id: safeId('attempt-ko-week1'), assessment_id: assessment.assessment_id,
    domain: 'korean', started_at: activeSession.started_at, completed_at: now, score, max_score: assessment.max_score,
    section_scores: sectionScores, item_results: itemResults, source: 'learning_paw', passed,
  };

  const state = readState();
  state.assessmentAttempts = Array.isArray(state.assessmentAttempts) ? state.assessmentAttempts : [];
  state.assessmentAttempts.push(attempt);
  state.lessonProgress = state.lessonProgress || {};
  if (passed) state.lessonProgress['ko-day-007'] = now;
  writeState(state);

  renderWeek1Result(attempt);
}

function renderWeek1Result(attempt) {
  const assessment = koreanAssessments.week1;
  const title = el('h1', attempt.passed ? 'Week 1 阶段验收通过' : 'Week 1 还需要补强', 'ko-assess-title');
  const result = el('div', `网站客观部分：${attempt.score} / ${attempt.max_score}。${attempt.passed ? '已达到进入 Week 2 的客观门槛。' : '先补最薄弱部分，再重新验收。'}`, `ko-assess-result${attempt.passed ? '' : ' needs-work'}`);
  const grid = el('div', '', 'ko-assess-section-grid');
  assessment.sections.forEach(section => {
    const score = attempt.section_scores[section.id];
    const cell = el('div', '', 'ko-assess-score');
    cell.append(el('strong', `${score?.score || 0} / ${section.max_score}`), el('span', section.label));
    grid.append(cell);
  });

  const review = el('div', '', 'ko-assess-review');
  attempt.item_results.filter(item => !item.correct).forEach(item => {
    const row = el('div', '', 'ko-assess-review-item wrong');
    row.textContent = `需要补强：${item.prompt}｜${item.explanation}`;
    review.append(row);
  });
  if (!review.children.length) review.append(el('div', '客观部分全部正确。', 'ko-assess-review-item'));

  const voiceNote = el('div', '口语/朗读不硬塞进这个 100 分：今天仍需完成 Day 7 ChatGPT Voice 验收，用它检查“能不能真正读出来”。网站客观分与 Voice 表现分开记录，避免假装浏览器能精确判断发音。', 'ko-assess-note');
  const actions = el('div', '', 'ko-assess-actions');
  if (!attempt.passed) {
    const retry = el('button', '重新验收', 'primary'); retry.type='button'; retry.addEventListener('click', renderWeek1Intro); actions.append(retry);
  }
  const back = el('button', attempt.passed ? '进入 Week 2' : '返回学习', attempt.passed ? 'primary' : 'ghost');
  back.type='button'; back.addEventListener('click', () => location.reload()); actions.append(back);
  setBody([title, result, grid, review, voiceNote, actions]);
}

function syncAssessmentCard() {
  if (!currentDomainIsKorean()) return;
  const button = document.querySelector('#startTestBtn');
  const hint = document.querySelector('#testHint');
  const panel = button?.closest('.training-panel');
  if (!button || !hint || !panel) return;
  const title = panel.querySelector('strong');
  const subtitle = panel.querySelector('span.muted.small');
  if (title) title.textContent = '阶段验收';

  const status = stageStatus();
  if (status.mode === 'done') {
    if (subtitle) subtitle.textContent = '当前阶段验收已完成';
    button.disabled = true; button.textContent = '当前阶段已通过';
    hint.textContent = '继续推进课程，下一阶段验收会自动出现。';
    return;
  }

  if (status.stage?.id === 'baseline') {
    if (subtitle) subtitle.textContent = 'Day 0｜不计分，只建立真实起点';
    button.disabled = false; button.textContent = '开始 Day 0 入学基线';
    hint.textContent = '完成后自动进入 Day 1；不会因为“零基础”被扣分。';
    return;
  }

  if (status.stage?.id === 'week1') {
    if (subtitle) subtitle.textContent = 'Week 1｜字母 · 拼读 · 听辨 · 输入';
    if (status.mode === 'ready') {
      button.disabled = false; button.textContent = status.attempt ? '重新进行 Week 1 验收' : '开始 Week 1 阶段验收';
      hint.textContent = status.attempt && !status.attempt.passed
        ? `上次 ${status.attempt.score} / 100，补强后可以重新验收。`
        : 'Day 1–6 已完成。答题过程中不显示答案，结束后统一反馈。';
    } else {
      button.disabled = true; button.textContent = `🔒 Week 1 阶段验收｜${status.completed} / ${status.total}`;
      hint.textContent = '完成 Day 1–6 后解锁；日常 FSRS 复习不等于正式验收。';
    }
    return;
  }

  if (subtitle) subtitle.textContent = status.stage?.title || '后续阶段验收';
  button.disabled = true;
  button.textContent = `🔒 ${status.stage?.title || '下一阶段验收'}`;
  hint.textContent = status.total ? `当前前置课程完成 ${status.completed} / ${status.total}；该阶段题型将在对应课程迭代时接入。` : '继续推进课程后自动更新。';
}

function launchCurrentAssessment() {
  const status = stageStatus();
  if (status.stage?.id === 'baseline' && status.mode === 'ready') return renderBaselineIntro();
  if (status.stage?.id === 'week1' && status.mode === 'ready') return renderWeek1Intro();
}

function syncLastResult() {
  if (!currentDomainIsKorean()) return;
  const target = document.querySelector('#lastTestResult');
  if (!target) return;
  const state = readState();
  const attempt = latestAttempt(koreanAssessments.week1.assessment_id, state);
  if (!attempt) {
    target.textContent = baselineDone(state) ? 'Day 0 基线已建立；Week 1 阶段验收将在 Day 1–6 完成后解锁。' : '尚未完成 Day 0 入学基线。';
    return;
  }
  const date = new Date(attempt.completed_at || attempt.started_at);
  target.textContent = `最近一次 Week 1 验收：${attempt.score} / 100｜${attempt.passed ? '通过' : '需补强'}｜${date.toLocaleString()}`;
}

ensureStyles();
ensureOverlay();

const startButton = document.querySelector('#startTestBtn');
startButton?.addEventListener('click', event => {
  if (!currentDomainIsKorean()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  launchCurrentAssessment();
}, true);

const syncAll = () => { if (currentDomainIsKorean()) { syncAssessmentCard(); syncLastResult(); } };
syncAll();

const domainName = document.querySelector('#domainName');
const todayTitle = document.querySelector('#todayLessonTitle');
if (domainName) new MutationObserver(() => queueMicrotask(syncAll)).observe(domainName, { childList:true, subtree:true, characterData:true });
if (todayTitle) new MutationObserver(() => queueMicrotask(syncAll)).observe(todayTitle, { childList:true, subtree:true, characterData:true });

window.__KOREAN_ASSESSMENT_V05__ = { stageStatus, version: '0.5.0' };
