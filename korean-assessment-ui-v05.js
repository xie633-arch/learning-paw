import { koreanAssessments, koreanAssessmentStages } from './korean-assessment-data-v05.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';
let session = null;

const readState = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
};
const writeState = state => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const done = (lessonId, state = readState()) => Boolean(state.lessonProgress?.[lessonId]);
const safeId = prefix => globalThis.crypto?.randomUUID ? `${prefix}-${crypto.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const normalize = value => String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ');
const comparable = value => normalize(value).replace(/[.!?。！？]+$/g, '');
const hangulCount = value => (String(value || '').match(/[가-힣]/g) || []).length;
const latestAttempt = (assessmentId, state = readState()) => [...(state.assessmentAttempts || [])].reverse().find(a => a.assessment_id === assessmentId) || null;
const isKorean = () => readState().preferences?.lastDomain === 'korean' || document.querySelector('#domainName')?.textContent?.trim() === '韩语';
const baselineDone = (state = readState()) => Boolean(state.koreanBaseline?.completed_at);
const stageAssessment = stage => koreanAssessments[stage?.assessment_key || stage?.id] || null;

function getStage(state = readState()) {
  if (!baselineDone(state)) return { stage: koreanAssessmentStages[0], mode: 'ready', completed: 0, total: 0 };

  for (const stage of koreanAssessmentStages.slice(1)) {
    const assessment = stageAssessment(stage);
    const attempt = assessment ? latestAttempt(assessment.assessment_id, state) : null;
    if (attempt?.passed) continue;
    const completed = stage.prerequisite_lessons.filter(x => done(x, state)).length;
    const total = stage.prerequisite_lessons.length;
    const mode = !stage.implemented ? 'planned' : completed === total ? 'ready' : 'locked';
    return { stage, assessment, mode, completed, total, attempt };
  }
  return { stage: null, assessment: null, mode: 'done', completed: 0, total: 0 };
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
      .ko-a-overlay{position:fixed;inset:0;z-index:1700;background:rgba(15,23,42,.5);display:grid;place-items:center;padding:18px}.ko-a-panel{width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;color:#111827;border-radius:26px;padding:24px;box-shadow:0 28px 90px rgba(15,23,42,.26)}.ko-a-top{display:flex;justify-content:space-between;align-items:center;position:sticky;top:-24px;background:#fff;padding:16px 0 10px;z-index:2}.ko-a-kicker{font-size:12px;font-weight:800;letter-spacing:.15em;color:#667085}.ko-a-title{font-size:28px;line-height:1.25;margin:8px 0}.ko-a-copy{color:#667085;line-height:1.7}.ko-a-box{padding:18px;border-radius:18px;background:#f6f7f9;margin:16px 0}.ko-a-options{display:grid;gap:10px}.ko-a-option{width:100%;text-align:left;padding:14px 16px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827}.ko-a-option.selected{border-color:#111827;background:#eef1f5;font-weight:700}.ko-a-input{width:100%;box-sizing:border-box;padding:14px 16px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827;font:inherit}.ko-a-textarea{min-height:180px;resize:vertical;line-height:1.7}.ko-a-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.ko-a-track{height:8px;background:#edf0f4;border-radius:999px;overflow:hidden;margin:12px 0 22px}.ko-a-track span{display:block;height:100%;background:#111827}.ko-a-note{padding:14px 16px;border-radius:16px;background:#f6f7f9;color:#475467;line-height:1.7;margin:14px 0}.ko-a-context{padding:16px;border-radius:16px;background:#eef1f5;font-size:18px;line-height:1.8;margin-bottom:14px}.ko-a-result{padding:18px;border-radius:18px;background:#eef7f0;color:#28543a;line-height:1.7}.ko-a-result.warn{background:#fff5e8;color:#7a4b12}.ko-a-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0}.ko-a-score{padding:14px;border-radius:16px;background:#f6f7f9}.ko-a-score strong{display:block;font-size:20px}.ko-a-score span{font-size:13px;color:#667085}.ko-a-review{padding:14px;border-radius:14px;background:#fff0f0;line-height:1.65;margin-top:10px}
      @media(max-width:720px){.ko-a-overlay{padding:0;background:#fff}.ko-a-panel{width:100%;height:100%;max-height:none;border-radius:0;padding:20px 18px calc(28px + env(safe-area-inset-bottom))}.ko-a-top{top:-20px;padding-top:max(18px,env(safe-area-inset-top))}.ko-a-actions{grid-template-columns:1fr}.ko-a-grid{grid-template-columns:1fr 1fr}}
      @media(prefers-color-scheme:dark){.ko-a-panel,.ko-a-top{background:#181c22;color:#f3f4f6}.ko-a-box,.ko-a-note,.ko-a-score{background:#242932;color:#e5e7eb}.ko-a-context{background:#252b34;color:#f3f4f6}.ko-a-copy,.ko-a-score span{color:#aab2bf}.ko-a-option,.ko-a-input{background:#1f242c;color:#f3f4f6;border-color:#3a414c}.ko-a-option.selected{background:#2d3440;border-color:#f3f4f6}.ko-a-track{background:#303640}.ko-a-track span{background:#f3f4f6}.ko-a-result{background:#203329;color:#a9dbb7}.ko-a-result.warn{background:#382d1f;color:#f2c98d}.ko-a-review{background:#3a2424}}
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
  state.koreanBaseline = { schema_version:'1.0', assessment_id:koreanAssessments.baseline.assessment_id, started_at:session.started_at, completed_at:now, responses:session.responses };
  state.lessonProgress ||= {}; state.lessonProgress['ko-day-000'] = now;
  state.preferences ||= {};
  const load = session.responses['study-load'];
  if (String(load).startsWith('20')) state.preferences.koreanStudyLoad = 'minimum';
  else if (String(load).startsWith('75')) state.preferences.koreanStudyLoad = 'intensive';
  else if (load) state.preferences.koreanStudyLoad = 'standard';
  state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
  state.studyEvents.push({ schema_version:'1.0', event_id:safeId('evt-ko-baseline'), occurred_at:now, domain:'korean', event_type:'baseline_completed', content_id:koreanAssessments.baseline.assessment_id, concept_id:null, skill:'baseline', result:{completed:true}, duration_ms:null, session_id:null, source:'learning_paw', device_id:null, algorithm:null });
  writeState(state);
  body(
    make('h1', 'Day 0 基线已建立', 'ko-a-title'),
    make('div', '没有分数，也没有好坏。Day 28 会拿这份起点做真实对比。课程现在可以进入 Day 1。', 'ko-a-result'),
    make('div', '今天仍建议完成 Day 0 ChatGPT Voice Task，留下第一份固定语音样本。', 'ko-a-note'),
    actions('留在这里', close, '进入 Day 1', () => location.reload()),
  );
}

function assessmentIntro(stageId) {
  const stage = koreanAssessmentStages.find(x => x.id === stageId);
  const a = stageAssessment(stage);
  if (!stage || !a) return;
  const scoredSections = a.sections.filter(s => s.max_score > 0).map(s => `${s.label} ${s.max_score}`).join(' · ');
  const hasEvidence = a.sections.some(s => s.max_score === 0);
  body(
    make('h1', a.name, 'ko-a-title'),
    make('p', a.description, 'ko-a-copy'),
    make('div', `网站计分：${scoredSections}。答题过程中不显示答案，结束后统一反馈。${hasEvidence ? '另有不计分但必须提交的学习证据。' : ''}`, 'ko-a-note'),
    actions('稍后再做', close, `开始 ${stage.title.replace(/^Day \d+｜/, '')}`, () => startAssessment(stageId)),
  );
  open();
}

function startAssessment(stageId) {
  const stage = koreanAssessmentStages.find(x => x.id === stageId);
  const a = stageAssessment(stage);
  if (!stage || !a) return;
  session = { kind:'assessment', stageId, assessmentKey:stage.assessment_key || stage.id, started_at:new Date().toISOString(), index:0, answers:[] };
  assessmentItem();
}

function isAnswered(item, selected) {
  if (item.type === 'mcq' || item.type === 'audio_mcq') return selected !== null && selected !== undefined;
  if (item.type === 'typing') return normalize(selected) !== '';
  if (item.type === 'open_text') return hangulCount(selected) >= Number(item.min_hangul || 1);
  return selected !== null && selected !== undefined && normalize(selected) !== '';
}

function evaluate(item, selected) {
  if (item.type === 'mcq' || item.type === 'audio_mcq') return Number(selected) === Number(item.correct_answer);
  if (item.type === 'typing') {
    const accepted = Array.isArray(item.accepted_answers) && item.accepted_answers.length ? item.accepted_answers : [item.target];
    return accepted.some(answer => comparable(answer) === comparable(selected));
  }
  if (item.type === 'open_text') return hangulCount(selected) >= Number(item.min_hangul || 1);
  return false;
}

function assessmentItem() {
  const stage = koreanAssessmentStages.find(x => x.id === session.stageId);
  const a = stageAssessment(stage);
  const item = a.items[session.index];
  const section = a.sections.find(s => s.id === item.section_id);
  const box = make('div', '', 'ko-a-box');
  let selected = null;
  const warning = make('p', '', 'ko-a-copy');

  if (item.context) box.append(make('div', item.context, 'ko-a-context'));

  if (item.type === 'mcq' || item.type === 'audio_mcq') {
    if (item.type === 'audio_mcq') {
      const audio = make('button', '🔊 播放韩语', 'ghost'); audio.type='button'; audio.addEventListener('click', () => speak(item.audio_text)); box.append(audio);
    }
    const options = make('div', '', 'ko-a-options');
    item.options.forEach((option, index) => {
      const button = make('button', `${String.fromCharCode(65 + index)}. ${option}`, 'ko-a-option'); button.type='button';
      button.addEventListener('click', () => { selected = index; options.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b === button)); warning.textContent=''; });
      options.append(button);
    });
    box.append(options);
  } else if (item.type === 'open_text') {
    const input = document.createElement('textarea'); input.className='ko-a-input ko-a-textarea'; input.rows=8; input.placeholder=item.placeholder || '请用韩语完成';
    input.addEventListener('input', () => { selected = input.value; warning.textContent=''; }); box.append(input);
    box.append(make('p', `这部分不自动评分。至少输入 ${item.min_hangul || 1} 个韩文字，作为真实写作证据保存。`, 'ko-a-copy'));
  } else {
    const input = document.createElement('input'); input.className='ko-a-input'; input.placeholder=item.placeholder || '请直接用韩语键盘输入';
    input.addEventListener('input', () => { selected = input.value; warning.textContent=''; }); box.append(input);
  }

  const isLast = session.index === a.items.length - 1;
  const points = item.max_score > 0 ? `${item.max_score} 分` : '学习证据';
  body(
    progress(session.index, a.items.length),
    make('div', `第 ${session.index + 1} / ${a.items.length} 题｜${section?.label || item.section_id}｜${points}`, 'ko-a-kicker'),
    make('h2', item.prompt, 'ko-a-title'), box, warning,
    actions('退出验收', close, isLast ? '提交并查看结果' : '确认并下一题', () => {
      if (!isAnswered(item, selected)) {
        warning.textContent = item.type === 'open_text' ? `请先完成这段写作，至少包含 ${item.min_hangul || 1} 个韩文字。` : '请先完成这一题。';
        return;
      }
      const correct = evaluate(item, selected);
      session.answers.push({ item, selected, correct });
      if (isLast) finishAssessment(); else { session.index += 1; assessmentItem(); }
    }),
  );
}

function finishAssessment() {
  const stage = koreanAssessmentStages.find(x => x.id === session.stageId);
  const a = stageAssessment(stage);
  const now = new Date().toISOString();
  const section_scores = Object.fromEntries(a.sections.map(s => [s.id, { score:0, max_score:s.max_score, label:s.label }]));
  let score = 0;
  const item_results = session.answers.map(({item, selected, correct}) => {
    const itemScore = correct ? Number(item.max_score || 0) : 0;
    score += itemScore;
    if (section_scores[item.section_id]) section_scores[item.section_id].score += itemScore;
    return {
      item_id:item.item_id, section_id:item.section_id, skill:item.skill, concept_ids:item.concept_ids || [], prompt:item.prompt,
      selected_answer:selected,
      correct_answer:item.type === 'typing' ? (item.accepted_answers || [item.target]) : item.type === 'open_text' ? 'required_evidence_submitted' : item.correct_answer,
      correct, score:itemScore, max_score:Number(item.max_score || 0), explanation:item.explanation,
    };
  });

  const totalPass = score >= Number(a.pass_rule?.total_min || 0);
  const sectionPass = Object.entries(a.pass_rule?.section_min_ratio || {}).every(([key, ratio]) => {
    const section = section_scores[key];
    return section && section.max_score > 0 && section.score / section.max_score >= ratio;
  });
  const evidencePass = (a.pass_rule?.required_sections_complete || []).every(sectionId => {
    const items = item_results.filter(item => item.section_id === sectionId);
    return items.length > 0 && items.every(item => item.correct);
  });
  const passed = totalPass && sectionPass && evidencePass;
  const attempt = {
    schema_version:'1.0', attempt_id:safeId(`attempt-ko-${stage.id}`), assessment_id:a.assessment_id, domain:'korean', stage_id:stage.id,
    started_at:session.started_at, completed_at:now, score, max_score:a.max_score, section_scores, item_results, source:'learning_paw', passed,
  };
  const state = readState();
  state.assessmentAttempts = Array.isArray(state.assessmentAttempts) ? state.assessmentAttempts : [];
  state.assessmentAttempts.push(attempt);
  state.lessonProgress ||= {};
  if (passed) state.lessonProgress[stage.lesson_id] = now;
  writeState(state);
  assessmentResult(stage, a, attempt);
}

function assessmentResult(stage, a, attempt) {
  const grid = make('div', '', 'ko-a-grid');
  a.sections.forEach(s => {
    const cell = make('div', '', 'ko-a-score');
    const section = attempt.section_scores[s.id];
    cell.append(make('strong', s.max_score > 0 ? `${section.score} / ${s.max_score}` : '已提交'), make('span', s.label));
    grid.append(cell);
  });
  const reviews = attempt.item_results.filter(x => x.max_score > 0 && !x.correct).map(x => make('div', `需要补强：${x.prompt}｜${x.explanation}`, 'ko-a-review'));
  body(
    make('h1', attempt.passed ? `${stage.title}通过` : `${stage.title}还需要补强`, 'ko-a-title'),
    make('div', `网站客观部分：${attempt.score} / ${attempt.max_score}。${attempt.passed ? '达到本阶段客观门槛。' : '先补最薄弱部分，再重新验收。'}`, `ko-a-result${attempt.passed ? '' : ' warn'}`),
    grid, ...reviews,
    make('div', a.result_note || '阶段验收只记录可可靠核验的证据；语音与开放表达继续使用对应 ChatGPT Voice Task。', 'ko-a-note'),
    actions(attempt.passed ? '关闭' : '返回学习', attempt.passed ? close : () => location.reload(), attempt.passed ? '进入下一阶段' : '重新验收', attempt.passed ? () => location.reload() : () => assessmentIntro(stage.id)),
  );
}

function stageLabel(stage) {
  if (!stage) return '阶段验收';
  const map = {
    week1:'Week 1｜字母 · 拼读 · 听辨 · 输入',
    week2:'Week 2｜받침 · 听辨 · 生存表达 · 自我介绍',
    week3:'Week 3｜助词 · 现在时 · 听力 · 主动造句',
    month1:'Month 1｜听 · 读 · 语法 · 输入 · 写作证据',
  };
  return map[stage.id] || stage.title;
}

function syncCard() {
  if (!isKorean()) return;
  const button = document.querySelector('#startTestBtn');
  const hint = document.querySelector('#testHint');
  const panel = button?.closest('.training-panel');
  if (!button || !hint || !panel) return;
  panel.querySelector('strong').textContent = '阶段验收';
  const subtitle = panel.querySelector('span.muted.small');
  const status = getStage();

  if (status.mode === 'done') {
    subtitle.textContent='Month 1 阶段验收已完成'; button.disabled=true; button.textContent='第一个月阶段已通过'; hint.textContent='继续进入下一阶段课程；TOPIK 专项会在基础稳定后逐步加入。'; return;
  }
  if (status.stage?.id === 'baseline') {
    subtitle.textContent='Day 0｜不计分，只建立真实起点'; button.disabled=false; button.textContent='开始 Day 0 入学基线'; hint.textContent='完成后自动进入 Day 1；零基础不会被扣分。'; return;
  }

  subtitle.textContent = stageLabel(status.stage);
  if (status.mode === 'ready') {
    button.disabled=false;
    button.textContent=status.attempt ? `重新进行 ${status.stage.title}` : `开始 ${status.stage.title}`;
    hint.textContent=status.attempt && !status.attempt.passed ? `上次 ${status.attempt.score} / 100，补强后可重测。` : `前置课程已完成；答题结束后统一反馈。`;
  } else if (status.mode === 'locked') {
    button.disabled=true;
    button.textContent=`🔒 ${status.stage.title}｜${status.completed} / ${status.total}`;
    hint.textContent='完成本阶段前置课程后解锁；手动勾选阶段日不能替代真正通过 Assessment。';
  } else {
    button.disabled=true; button.textContent=`🔒 ${status.stage?.title || '下一阶段验收'}`; hint.textContent='该阶段题型仍在准备中。';
  }
}

function syncLastResult() {
  if (!isKorean()) return;
  const target = document.querySelector('#lastTestResult');
  if (!target) return;
  const state = readState();
  const ids = koreanAssessmentStages.slice(1).map(stage => stageAssessment(stage)?.assessment_id).filter(Boolean);
  const attempts = (state.assessmentAttempts || []).filter(a => ids.includes(a.assessment_id)).sort((a,b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
  const attempt = attempts[0];
  if (!attempt) {
    target.textContent=baselineDone(state) ? 'Day 0 基线已建立；第一个阶段验收会随课程进度自动解锁。' : '尚未完成 Day 0 入学基线。';
    return;
  }
  const stage = koreanAssessmentStages.find(s => stageAssessment(s)?.assessment_id === attempt.assessment_id);
  target.textContent=`最近一次 ${stage?.title || '阶段验收'}：${attempt.score} / 100｜${attempt.passed ? '通过' : '需补强'}｜${new Date(attempt.completed_at).toLocaleString()}`;
}

function launch() {
  const status = getStage();
  if (status.mode !== 'ready') return;
  if (status.stage?.id === 'baseline') baselineIntro();
  else if (status.stage) assessmentIntro(status.stage.id);
}

ensureUi();
document.querySelector('#startTestBtn')?.addEventListener('click', event => {
  if (!isKorean()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  launch();
}, true);
const sync = () => { if (isKorean()) { syncCard(); syncLastResult(); } };
sync();
['#domainName','#todayLessonTitle'].forEach(selector => {
  const node=document.querySelector(selector);
  if (node) new MutationObserver(() => queueMicrotask(sync)).observe(node,{childList:true,subtree:true,characterData:true});
});
window.__KOREAN_ASSESSMENT_V05__ = { getStage, version:'0.6.0' };
