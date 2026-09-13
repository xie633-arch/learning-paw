import { koreanAssessments, koreanAssessmentStages } from './korean-assessment-data-v05.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
let session = null;

const readState = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
};
const writeState = state => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const done = (id, state = readState()) => Boolean(state.lessonProgress?.[id]);
const id = prefix => globalThis.crypto?.randomUUID ? `${prefix}-${crypto.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const normalize = value => String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ');
const latestAttempt = (assessmentId, state = readState()) => [...(state.assessmentAttempts || [])].reverse().find(a => a.assessment_id === assessmentId) || null;
const isKorean = () => readState().preferences?.lastDomain === 'korean' || document.querySelector('#domainName')?.textContent?.trim() === '韩语';
const baselineDone = (state = readState()) => Boolean(state.koreanBaseline?.completed_at);

function getStage(state = readState()) {
  if (!baselineDone(state)) return { stage: koreanAssessmentStages[0], mode: 'ready', completed: 0, total: 0 };

  const week1 = koreanAssessmentStages[1];
  const completed = week1.prerequisite_lessons.filter(x => done(x, state)).length;
  const attempt = latestAttempt(koreanAssessments.week1.assessment_id, state);
  if (!attempt?.passed) {
    return { stage: week1, mode: completed === week1.prerequisite_lessons.length ? 'ready' : 'locked', completed, total: week1.prerequisite_lessons.length, attempt };
  }

  const later = koreanAssessmentStages.slice(2).find(stage => !done(stage.lesson_id, state));
  if (!later) return { stage: null, mode: 'done' };
  const laterCompleted = later.prerequisite_lessons.filter(x => done(x, state)).length;
  return { stage: later, mode: 'planned', completed: laterCompleted, total: later.prerequisite_lessons.length };
}

function make(tag, text = '', cls = '') {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (cls) node.className = cls;
  return node;
}

function ensureUi() {
  if (!document.querySelector('#koAssessStyle')) {
    const style = document.createElement('style');
    style.id = 'koAssessStyle';
    style.textContent = `
      .ko-a-overlay{position:fixed;inset:0;z-index:1700;background:rgba(15,23,42,.5);display:grid;place-items:center;padding:18px}.ko-a-panel{width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;color:#111827;border-radius:26px;padding:24px;box-shadow:0 28px 90px rgba(15,23,42,.26)}.ko-a-top{display:flex;justify-content:space-between;align-items:center;position:sticky;top:-24px;background:#fff;padding:16px 0 10px;z-index:2}.ko-a-kicker{font-size:12px;font-weight:800;letter-spacing:.15em;color:#667085}.ko-a-title{font-size:28px;line-height:1.25;margin:8px 0}.ko-a-copy{color:#667085;line-height:1.7}.ko-a-box{padding:18px;border-radius:18px;background:#f6f7f9;margin:16px 0}.ko-a-options{display:grid;gap:10px}.ko-a-option{width:100%;text-align:left;padding:14px 16px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827}.ko-a-option.selected{border-color:#111827;background:#eef1f5;font-weight:700}.ko-a-input{width:100%;box-sizing:border-box;padding:14px 16px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827;font:inherit}.ko-a-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.ko-a-track{height:8px;background:#edf0f4;border-radius:999px;overflow:hidden;margin:12px 0 22px}.ko-a-track span{display:block;height:100%;background:#111827}.ko-a-note{padding:14px 16px;border-radius:16px;background:#f6f7f9;color:#475467;line-height:1.7;margin:14px 0}.ko-a-result{padding:18px;border-radius:18px;background:#eef7f0;color:#28543a;line-height:1.7}.ko-a-result.warn{background:#fff5e8;color:#7a4b12}.ko-a-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0}.ko-a-score{padding:14px;border-radius:16px;background:#f6f7f9}.ko-a-score strong{display:block;font-size:20px}.ko-a-score span{font-size:13px;color:#667085}.ko-a-review{padding:14px;border-radius:14px;background:#fff0f0;line-height:1.65;margin-top:10px}
      @media(max-width:720px){.ko-a-overlay{padding:0;background:#fff}.ko-a-panel{width:100%;height:100%;max-height:none;border-radius:0;padding:20px 18px calc(28px + env(safe-area-inset-bottom))}.ko-a-top{top:-20px;padding-top:max(18px,env(safe-area-inset-top))}.ko-a-actions{grid-template-columns:1fr}}
      @media(prefers-color-scheme:dark){.ko-a-panel,.ko-a-top{background:#181c22;color:#f3f4f6}.ko-a-box,.ko-a-note,.ko-a-score{background:#242932;color:#e5e7eb}.ko-a-copy,.ko-a-score span{color:#aab2bf}.ko-a-option,.ko-a-input{background:#1f242c;color:#f3f4f6;border-color:#3a414c}.ko-a-option.selected{background:#2d3440;border-color:#f3f4f6}.ko-a-track{background:#303640}.ko-a-track span{background:#f3f4f6}.ko-a-result{background:#203329;color:#a9dbb7}.ko-a-result.warn{background:#382d1f;color:#f2c98d}.ko-a-review{background:#3a2424}}
    `;
    document.head.append(style);
  }
  let overlay = document.querySelector('#koAssessOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'koAssessOverlay';
    overlay.className = 'ko-a-overlay hidden';
    overlay.innerHTML = `<div class="ko-a-panel" role="dialog" aria-modal="true"><div class="ko-a-top"><span class="ko-a-kicker">KOREAN ASSESSMENT</span><button class="ghost" id="koAssessClose">关闭</button></div><div id="koAssessBody"></div></div>`;
    document.body.append(overlay);
    overlay.querySelector('#koAssessClose').addEventListener('click', close);
  }
  return overlay;
}

function open() {
  const overlay = ensureUi();
  overlay.classList.remove('hidden');
  overlay.querySelector('.ko-a-panel').scrollTop = 0;
  document.body.style.overflow = 'hidden';
}
function close() {
  document.querySelector('#koAssessOverlay')?.classList.add('hidden');
  document.body.style.overflow = '';
  session = null;
}
function body(...nodes) {
  const root = ensureUi().querySelector('#koAssessBody');
  root.innerHTML = '';
  nodes.filter(Boolean).forEach(node => root.append(node));
}
function progress(current, total) {
  const track = make('div', '', 'ko-a-track');
  const bar = make('span');
  bar.style.width = `${Math.max(0, Math.min(100, current / total * 100))}%`;
  track.append(bar);
  return track;
}
function actions(leftText, leftFn, rightText, rightFn) {
  const wrap = make('div', '', 'ko-a-actions');
  const left = make('button', leftText, 'ghost'); left.type = 'button'; left.addEventListener('click', leftFn);
  const right = make('button', rightText, 'primary'); right.type = 'button'; right.addEventListener('click', rightFn);
  wrap.append(left, right);
  return wrap;
}
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = .85;
  u.voice = speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith('ko')) || null;
  speechSynthesis.speak(u);
}

function baselineIntro() {
  const a = koreanAssessments.baseline;
  body(
    make('h1', a.name, 'ko-a-title'),
    make('p', a.description, 'ko-a-copy'),
    make('div', '这里没有“及格/不及格”。按真实情况回答，不提前查资料；语音基线继续使用今天的 ChatGPT Voice Task。', 'ko-a-note'),
    actions('稍后再做', close, '开始建立基线', startBaseline),
  );
  open();
}
function startBaseline() {
  session = { kind: 'baseline', started_at: new Date().toISOString(), index: 0, responses: {} };
  baselineItem();
}
function baselineItem() {
  const a = koreanAssessments.baseline;
  const item = a.items[session.index];
  const box = make('div', '', 'ko-a-box');
  let value = session.responses[item.id] ?? (item.type === 'multi' ? [] : null);

  if (item.type === 'choice') {
    const options = make('div', '', 'ko-a-options');
    item.options.forEach(option => {
      const button = make('button', option, 'ko-a-option'); button.type = 'button';
      if (value === option) button.classList.add('selected');
      button.addEventListener('click', () => { value = option; session.responses[item.id] = value; options.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b === button)); });
      options.append(button);
    });
    box.append(options);
  } else if (item.type === 'multi') {
    const selected = new Set(Array.isArray(value) ? value : []);
    const options = make('div', '', 'ko-a-options');
    item.options.forEach(option => {
      const button = make('button', option, 'ko-a-option'); button.type = 'button'; button.classList.toggle('selected', selected.has(option));
      button.addEventListener('click', () => { selected.has(option) ? selected.delete(option) : selected.add(option); value = [...selected]; session.responses[item.id] = value; button.classList.toggle('selected', selected.has(option)); });
      options.append(button);
    });
    box.append(options);
  } else {
    const input = document.createElement('input'); input.className = 'ko-a-input'; input.placeholder = item.placeholder || ''; input.value = value || '';
    input.addEventListener('input', () => { value = input.value; session.responses[item.id] = value; }); box.append(input);
  }

  const isLast = session.index === a.items.length - 1;
  body(
    progress(session.index, a.items.length),
    make('div', `第 ${session.index + 1} / ${a.items.length} 项｜${item.title}`, 'ko-a-kicker'),
    make('h2', item.prompt, 'ko-a-title'), box,
    actions(session.index ? '上一项' : '退出', () => { if (!session.index) close(); else { session.index -= 1; baselineItem(); } }, isLast ? '完成 Day 0 基线' : '下一项', () => { session.responses[item.id] = value; if (isLast) finishBaseline(); else { session.index += 1; baselineItem(); } }),
  );
}
function finishBaseline() {
  const now = new Date().toISOString();
  const state = readState();
  state.koreanBaseline = { schema_version: '1.0', assessment_id: koreanAssessments.baseline.assessment_id, started_at: session.started_at, completed_at: now, responses: session.responses };
  state.lessonProgress ||= {}; state.lessonProgress['ko-day-000'] = now;
  state.preferences ||= {};
  const load = session.responses['study-load'];
  if (String(load).startsWith('20')) state.preferences.koreanStudyLoad = 'minimum';
  else if (String(load).startsWith('75')) state.preferences.koreanStudyLoad = 'intensive';
  else if (load) state.preferences.koreanStudyLoad = 'standard';
  state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
  state.studyEvents.push({ schema_version:'1.0', event_id:id('evt-ko-baseline'), occurred_at:now, domain:'korean', event_type:'baseline_completed', content_id:koreanAssessments.baseline.assessment_id, concept_id:null, skill:'baseline', result:{completed:true}, duration_ms:null, session_id:null, source:'learning_paw', device_id:null, algorithm:null });
  writeState(state);
  body(
    make('h1', 'Day 0 基线已建立', 'ko-a-title'),
    make('div', '没有分数，也没有好坏。Day 28 会拿这份起点做真实对比。课程现在可以进入 Day 1。', 'ko-a-result'),
    make('div', '今天仍建议完成 Day 0 ChatGPT Voice Task，留下第一份固定语音样本。', 'ko-a-note'),
    actions('留在这里', close, '进入 Day 1', () => location.reload()),
  );
}

function week1Intro() {
  const a = koreanAssessments.week1;
  body(
    make('h1', a.name, 'ko-a-title'), make('p', a.description, 'ko-a-copy'),
    make('div', '100 分由字母识读、音节组合、基础听辨、韩语键盘和真实词共同组成。答题时不显示答案，结束后统一反馈。', 'ko-a-note'),
    actions('稍后再做', close, '开始 Week 1 验收', startWeek1),
  ); open();
}
function startWeek1() {
  session = { kind:'week1', started_at:new Date().toISOString(), index:0, answers:[] };
  week1Item();
}
function week1Item() {
  const a = koreanAssessments.week1;
  const item = a.items[session.index];
  const section = a.sections.find(s => s.id === item.section_id);
  const box = make('div', '', 'ko-a-box');
  let selected = null;
  const warning = make('p', '', 'ko-a-copy');

  if (item.type === 'mcq' || item.type === 'audio_mcq') {
    if (item.type === 'audio_mcq') { const audio = make('button', '🔊 播放韩语', 'ghost'); audio.type='button'; audio.addEventListener('click', () => speak(item.audio_text)); box.append(audio); }
    const options = make('div', '', 'ko-a-options');
    item.options.forEach((option, index) => {
      const button = make('button', `${String.fromCharCode(65 + index)}. ${option}`, 'ko-a-option'); button.type='button';
      button.addEventListener('click', () => { selected = index; options.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b === button)); warning.textContent=''; });
      options.append(button);
    }); box.append(options);
  } else {
    const input = document.createElement('input'); input.className='ko-a-input'; input.placeholder='请直接用韩语键盘输入'; input.addEventListener('input', () => { selected = input.value; warning.textContent=''; }); box.append(input);
  }

  const isLast = session.index === a.items.length - 1;
  body(
    progress(session.index, a.items.length),
    make('div', `第 ${session.index + 1} / ${a.items.length} 题｜${section?.label || item.section_id}｜${item.max_score} 分`, 'ko-a-kicker'),
    make('h2', item.prompt, 'ko-a-title'), box, warning,
    actions('退出验收', close, isLast ? '提交并查看结果' : '确认并下一题', () => {
      const unanswered = selected === null || (item.type === 'typing' && normalize(selected) === '');
      if (unanswered) { warning.textContent = '请先完成这一题。'; return; }
      const correct = item.type === 'typing' ? normalize(selected) === normalize(item.target) : Number(selected) === Number(item.correct_answer);
      session.answers.push({ item, selected, correct });
      if (isLast) finishWeek1(); else { session.index += 1; week1Item(); }
    }),
  );
}
function finishWeek1() {
  const a = koreanAssessments.week1;
  const now = new Date().toISOString();
  const section_scores = Object.fromEntries(a.sections.map(s => [s.id, { score:0, max_score:s.max_score, label:s.label }]));
  let score = 0;
  const item_results = session.answers.map(({item, selected, correct}) => {
    const itemScore = correct ? item.max_score : 0; score += itemScore; section_scores[item.section_id].score += itemScore;
    return { item_id:item.item_id, section_id:item.section_id, skill:item.skill, concept_ids:item.concept_ids || [], prompt:item.prompt, selected_answer:selected, correct_answer:item.type === 'typing' ? item.target : item.correct_answer, correct, score:itemScore, max_score:item.max_score, explanation:item.explanation };
  });
  const totalPass = score >= a.pass_rule.total_min;
  const sectionPass = Object.entries(a.pass_rule.section_min_ratio).every(([key, ratio]) => section_scores[key].score / section_scores[key].max_score >= ratio);
  const passed = totalPass && sectionPass;
  const attempt = { schema_version:'1.0', attempt_id:id('attempt-ko-week1'), assessment_id:a.assessment_id, domain:'korean', started_at:session.started_at, completed_at:now, score, max_score:a.max_score, section_scores, item_results, source:'learning_paw', passed };
  const state = readState(); state.assessmentAttempts = Array.isArray(state.assessmentAttempts) ? state.assessmentAttempts : []; state.assessmentAttempts.push(attempt); state.lessonProgress ||= {}; if (passed) state.lessonProgress['ko-day-007'] = now; writeState(state);
  week1Result(attempt);
}
function week1Result(attempt) {
  const a = koreanAssessments.week1;
  const grid = make('div', '', 'ko-a-grid');
  a.sections.forEach(s => { const cell = make('div', '', 'ko-a-score'); cell.append(make('strong', `${attempt.section_scores[s.id].score} / ${s.max_score}`), make('span', s.label)); grid.append(cell); });
  const reviews = attempt.item_results.filter(x => !x.correct).map(x => make('div', `需要补强：${x.prompt}｜${x.explanation}`, 'ko-a-review'));
  body(
    make('h1', attempt.passed ? 'Week 1 阶段验收通过' : 'Week 1 还需要补强', 'ko-a-title'),
    make('div', `网站客观部分：${attempt.score} / ${attempt.max_score}。${attempt.passed ? '达到进入 Week 2 的客观门槛。' : '先补最薄弱部分，再重新验收。'}`, `ko-a-result${attempt.passed ? '' : ' warn'}`),
    grid, ...reviews,
    make('div', '朗读/发音不硬塞进这个 100 分。请继续完成 Day 7 ChatGPT Voice 验收，用它检查“能不能真正读出来”；网站客观分和 Voice 表现分开记录。', 'ko-a-note'),
    actions(attempt.passed ? '关闭' : '返回学习', attempt.passed ? close : () => location.reload(), attempt.passed ? '进入 Week 2' : '重新验收', attempt.passed ? () => location.reload() : week1Intro),
  );
}

function syncCard() {
  if (!isKorean()) return;
  const button = document.querySelector('#startTestBtn'); const hint = document.querySelector('#testHint'); const panel = button?.closest('.training-panel');
  if (!button || !hint || !panel) return;
  panel.querySelector('strong').textContent = '阶段验收';
  const subtitle = panel.querySelector('span.muted.small');
  const status = getStage();

  if (status.mode === 'done') { subtitle.textContent='当前阶段验收已完成'; button.disabled=true; button.textContent='当前阶段已通过'; hint.textContent='继续推进课程，下一阶段验收会自动出现。'; return; }
  if (status.stage?.id === 'baseline') { subtitle.textContent='Day 0｜不计分，只建立真实起点'; button.disabled=false; button.textContent='开始 Day 0 入学基线'; hint.textContent='完成后自动进入 Day 1；零基础不会被扣分。'; return; }
  if (status.stage?.id === 'week1') {
    subtitle.textContent='Week 1｜字母 · 拼读 · 听辨 · 输入';
    if (status.mode === 'ready') { button.disabled=false; button.textContent=status.attempt ? '重新进行 Week 1 验收' : '开始 Week 1 阶段验收'; hint.textContent=status.attempt && !status.attempt.passed ? `上次 ${status.attempt.score} / 100，补强后可重测。` : 'Day 1–6 已完成；结束后统一反馈。'; }
    else { button.disabled=true; button.textContent=`🔒 Week 1 阶段验收｜${status.completed} / ${status.total}`; hint.textContent='完成 Day 1–6 后解锁；日常 FSRS 自评不等于正式验收。'; }
    return;
  }
  subtitle.textContent=status.stage?.title || '后续阶段验收'; button.disabled=true; button.textContent=`🔒 ${status.stage?.title || '下一阶段验收'}`; hint.textContent=`当前前置课程完成 ${status.completed || 0} / ${status.total || 0}；题型将在对应阶段接入。`;
}
function syncLastResult() {
  if (!isKorean()) return;
  const target = document.querySelector('#lastTestResult'); if (!target) return;
  const state = readState(); const attempt = latestAttempt(koreanAssessments.week1.assessment_id, state);
  if (!attempt) { target.textContent=baselineDone(state) ? 'Day 0 基线已建立；Week 1 验收将在 Day 1–6 完成后解锁。' : '尚未完成 Day 0 入学基线。'; return; }
  target.textContent=`最近一次 Week 1 验收：${attempt.score} / 100｜${attempt.passed ? '通过' : '需补强'}｜${new Date(attempt.completed_at).toLocaleString()}`;
}
function launch() {
  const status = getStage();
  if (status.stage?.id === 'baseline' && status.mode === 'ready') baselineIntro();
  else if (status.stage?.id === 'week1' && status.mode === 'ready') week1Intro();
}

ensureUi();
document.querySelector('#startTestBtn')?.addEventListener('click', event => { if (!isKorean()) return; event.preventDefault(); event.stopImmediatePropagation(); launch(); }, true);
const sync = () => { if (isKorean()) { syncCard(); syncLastResult(); } };
sync();
['#domainName','#todayLessonTitle'].forEach(selector => { const node=document.querySelector(selector); if (node) new MutationObserver(() => queueMicrotask(sync)).observe(node,{childList:true,subtree:true,characterData:true}); });
window.__KOREAN_ASSESSMENT_V05__ = { getStage, version:'0.5.1' };
