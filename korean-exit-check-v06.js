const STORAGE_KEY = 'personal-learning-os:v0.1';

const q = (type, prompt, config = {}) => ({ type, prompt, ...config });

export const koreanExitChecks = {
  'ko-day-008': { title:'Day 8 Exit Check｜받침 入门', items:[
    q('mcq','下面哪个词有 받침？',{ options:['나','우유','밥','오'], answer:2 }),
    q('typing','请用韩语键盘输入“韩国”。',{ accepted:['한국'] }),
  ]},
  'ko-day-009': { title:'Day 9 Exit Check｜받침 基础读法', items:[
    q('mcq','문 的 받침 是什么？',{ options:['ㅁ','ㅜ','ㄴ','ㅇ'], answer:2 }),
    q('audio_mcq','点击播放，选择你听到的词。',{ audio:'집', options:['집','책','문','공'], answer:0 }),
  ]},
  'ko-day-010': { title:'Day 10 Exit Check｜连音', items:[
    q('mcq','关于 책이 的学习重点，哪一个说法更正确？',{ options:['必须把 책 和 이 完全停开','真实语流中会发生连音','책 的 받침 会消失且没有任何声音','只要记罗马音即可'], answer:1 }),
    q('audio_mcq','点击播放，选择你听到的词。',{ audio:'한국어', options:['한국','한국어','한글','우유'], answer:1 }),
  ]},
  'ko-day-011': { title:'Day 11 Exit Check｜鼻音化意识', items:[
    q('mcq','国물的标准拼写是哪一个？（不要按听感改写）',{ options:['궁물','국물','국문','공물'], answer:1 }),
    q('mcq','学习鼻音化的第一阶段目标是什么？',{ options:['背完所有音变术语','听到变化时仍能联系到正确单词','所有词都按字面逐辅音读','只看拼写不听声音'], answer:1 }),
  ]},
  'ko-day-012': { title:'Day 12 Exit Check｜问候与礼貌表达', items:[
    q('mcq','第一次见面最适合先说哪一句？',{ options:['안녕하세요','죄송합니다','아니요','괜찮아요'], answer:0 }),
    q('audio_mcq','点击播放，选择你听到的表达。',{ audio:'감사합니다', options:['죄송합니다','감사합니다','안녕하세요','괜찮아요'], answer:1 }),
  ]},
  'ko-day-013': { title:'Day 13 Exit Check｜自我介绍', items:[
    q('mcq','哪一句表示“我是学生”？',{ options:['저는 학생이에요.','저는 학생을 좋아해요.','학생이 없어요.','학생에 가요.'], answer:0 }),
    q('typing','请用韩语输入“我是中国人。”',{ accepted:['저는 중국 사람이에요','저는 중국 사람이에요.'] }),
  ]},

  'ko-day-015': { title:'Day 15 Exit Check｜基础句序', items:[
    q('mcq','韩语基础陈述句最常见的核心顺序是？',{ options:['SVO','VSO','SOV','OVS'], answer:2 }),
    q('mcq','下面哪一句把动词放在句尾？',{ options:['배워요 저는 한국어를','저는 배워요 한국어를','저는 한국어를 배워요','한국어를 배워요 저는를'], answer:2 }),
  ]},
  'ko-day-016': { title:'Day 16 Exit Check｜은/는', items:[
    q('mcq','저__ 학생이에요。应填什么？',{ options:['는','은','를','이'], answer:0 }),
    q('typing','请输入“我是学生。”',{ accepted:['저는 학생이에요','저는 학생이에요.'] }),
  ]},
  'ko-day-017': { title:'Day 17 Exit Check｜이/가', items:[
    q('mcq','책__ 있어요。应填什么？',{ options:['가','이','를','는'], answer:1 }),
    q('audio_mcq','点击播放，选择你听到的句子。',{ audio:'책이 있어요', options:['책이 있어요','책이 없어요','책을 좋아해요','책에 가요'], answer:0 }),
  ]},
  'ko-day-018': { title:'Day 18 Exit Check｜을/를 + 动词', items:[
    q('mcq','커피__ 좋아해요。按本课基础句型应填什么？',{ options:['가','를','에','는'], answer:1 }),
    q('mcq','배우다 的核心意思是？',{ options:['吃','看','学习','见面'], answer:2 }),
  ]},
  'ko-day-019': { title:'Day 19 Exit Check｜아요/어요', items:[
    q('mcq','먹다 的礼貌现在时是？',{ options:['먹다','먹어요','먹고 싶어요','먹었어요'], answer:1 }),
    q('typing','请用韩语输入 하다 的礼貌现在时。',{ accepted:['해요'] }),
  ]},
  'ko-day-020': { title:'Day 20 Exit Check｜있어요 / 없어요', items:[
    q('mcq','책이 없어요 的意思是？',{ options:['有书','没有书','喜欢书','看书'], answer:1 }),
    q('typing','请用韩语输入“有书。”',{ accepted:['책이 있어요','책이 있어요.'] }),
  ]},

  'ko-day-022': { title:'Day 22 Exit Check｜에 / 에서', items:[
    q('mcq','“去学校”最适合哪一句？',{ options:['학교에서 가요','학교에 가요','학교를 가요','학교가 가요'], answer:1 }),
    q('mcq','“在咖啡店学习”最适合哪一句？',{ options:['카페에 공부해요','카페에서 공부해요','카페를 공부해요','카페가 공부해요'], answer:1 }),
  ]},
  'ko-day-023': { title:'Day 23 Exit Check｜日常行动', items:[
    q('mcq','공부해요 的意思是？',{ options:['工作','学习','见面','喜欢'], answer:1 }),
    q('audio_mcq','点击播放，选择最符合的中文意思。',{ audio:'오늘 카페에 가요', options:['今天去咖啡店','明天去学校','今天在家学习','昨天喝咖啡'], answer:0 }),
  ]},
  'ko-day-024': { title:'Day 24 Exit Check｜喜欢与兴趣', items:[
    q('mcq','“我喜欢音乐”是哪一句？',{ options:['저는 음악을 좋아해요.','저는 음악에 가요.','음악이 없어요.','저는 음악을 안 해요.'], answer:0 }),
    q('audio_mcq','点击播放，选择你听到的核心意思。',{ audio:'저는 커피를 좋아해요', options:['我喜欢咖啡','我不喜欢咖啡','我想喝咖啡','我没有咖啡'], answer:0 }),
  ]},
  'ko-day-025': { title:'Day 25 Exit Check｜-고 싶어요', items:[
    q('mcq','먹다 → “想吃”应该怎么说？',{ options:['먹어요','먹고 싶어요','안 먹어요','먹다요'], answer:1 }),
    q('typing','请用韩语输入“想去。”',{ accepted:['가고 싶어요','가고 싶어요.'] }),
  ]},
  'ko-day-026': { title:'Day 26 Exit Check｜안 否定', items:[
    q('mcq','“不去”最基础的表达是？',{ options:['가요 안','안 가요','가고 싶어요','없어요 가요'], answer:1 }),
    q('audio_mcq','点击播放，选择正确中文意思。',{ audio:'저는 커피를 안 좋아해요', options:['我喜欢咖啡','我不喜欢咖啡','我想喝咖啡','我没有咖啡'], answer:1 }),
  ]},
  'ko-day-027': { title:'Day 27 Exit Check｜时间与日常', items:[
    q('mcq','오늘 / 내일 / 어제 / 지금 中，哪个表示“现在”？',{ options:['오늘','내일','어제','지금'], answer:3 }),
    q('typing','请用韩语输入“今天”。',{ accepted:['오늘'] }),
  ]},
};

let active = null;

const readState = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
};
const writeState = state => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const normalize = value => String(value ?? '').normalize('NFC').trim().replace(/\s+/g,' ').replace(/[.!?。！？]+$/g,'');
const safeId = prefix => globalThis.crypto?.randomUUID ? `${prefix}-${crypto.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = .85;
  utterance.voice = speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith('ko')) || null;
  speechSynthesis.speak(utterance);
}

function ensureUi() {
  if (!document.querySelector('#koExitStyles')) {
    const style = document.createElement('style');
    style.id = 'koExitStyles';
    style.textContent = `
      .ko-exit-overlay{position:fixed;inset:0;z-index:1650;background:rgba(15,23,42,.48);display:grid;place-items:center;padding:18px}.ko-exit-panel{width:min(680px,100%);max-height:92vh;overflow:auto;background:#fff;color:#111827;border-radius:26px;padding:24px;box-shadow:0 28px 90px rgba(15,23,42,.26)}.ko-exit-title{font-size:28px;line-height:1.25;margin:6px 0 10px}.ko-exit-copy{color:#667085;line-height:1.7}.ko-exit-item{padding:18px;border-radius:18px;background:#f6f7f9;margin:16px 0}.ko-exit-options{display:grid;gap:10px;margin-top:12px}.ko-exit-option{width:100%;text-align:left;padding:14px 16px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827}.ko-exit-option.selected{border-color:#111827;background:#eef1f5;font-weight:700}.ko-exit-input{width:100%;box-sizing:border-box;padding:14px 16px;border:1px solid #d9dee7;border-radius:14px;background:#fff;color:#111827;font:inherit}.ko-exit-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.ko-exit-result{padding:16px;border-radius:16px;background:#eef7f0;color:#28543a;line-height:1.7}.ko-exit-result.warn{background:#fff5e8;color:#7a4b12}.ko-exit-track{height:8px;border-radius:99px;background:#edf0f4;overflow:hidden;margin:12px 0 20px}.ko-exit-track span{display:block;height:100%;background:#111827}
      @media(max-width:720px){.ko-exit-overlay{padding:0;background:#fff}.ko-exit-panel{width:100%;height:100%;max-height:none;border-radius:0;padding:20px 18px calc(28px + env(safe-area-inset-bottom))}.ko-exit-actions{grid-template-columns:1fr}}
      @media(prefers-color-scheme:dark){.ko-exit-panel{background:#181c22;color:#f3f4f6}.ko-exit-item{background:#242932}.ko-exit-copy{color:#aab2bf}.ko-exit-option,.ko-exit-input{background:#1f242c;color:#f3f4f6;border-color:#3a414c}.ko-exit-option.selected{background:#2d3440;border-color:#f3f4f6}.ko-exit-track{background:#303640}.ko-exit-track span{background:#f3f4f6}.ko-exit-result{background:#203329;color:#a9dbb7}.ko-exit-result.warn{background:#382d1f;color:#f2c98d}}
    `;
    document.head.append(style);
  }
  let overlay = document.querySelector('#koExitOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'koExitOverlay';
    overlay.className = 'ko-exit-overlay hidden';
    overlay.innerHTML = '<div class="ko-exit-panel" role="dialog" aria-modal="true"><div id="koExitBody"></div></div>';
    document.body.append(overlay);
  }
  return overlay;
}

function node(tag,text='',cls='') { const n=document.createElement(tag); if(text)n.textContent=text; if(cls)n.className=cls; return n; }
function setBody(...nodes) { const root=ensureUi().querySelector('#koExitBody'); root.innerHTML=''; nodes.filter(Boolean).forEach(n=>root.append(n)); }
function close() { document.querySelector('#koExitOverlay')?.classList.add('hidden'); document.body.style.overflow=''; active=null; }
function open() { ensureUi().classList.remove('hidden'); document.body.style.overflow='hidden'; }
function actionButtons(leftText,leftFn,rightText,rightFn) { const w=node('div','','ko-exit-actions'); const l=node('button',leftText,'ghost'); l.type='button'; l.addEventListener('click',leftFn); const r=node('button',rightText,'primary'); r.type='button'; r.addEventListener('click',rightFn); w.append(l,r); return w; }

function renderItem() {
  const check = active.check;
  const item = check.items[active.index];
  const box = node('div','','ko-exit-item');
  let selected = null;
  const warning = node('p','','ko-exit-copy');

  if (item.type === 'mcq' || item.type === 'audio_mcq') {
    if (item.type === 'audio_mcq') { const audio=node('button','🔊 播放韩语','ghost'); audio.type='button'; audio.addEventListener('click',()=>speak(item.audio)); box.append(audio); }
    const opts=node('div','','ko-exit-options');
    item.options.forEach((option,index)=>{ const b=node('button',`${String.fromCharCode(65+index)}. ${option}`,'ko-exit-option'); b.type='button'; b.addEventListener('click',()=>{ selected=index; opts.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b)); warning.textContent=''; }); opts.append(b); });
    box.append(opts);
  } else {
    const input=document.createElement('input'); input.className='ko-exit-input'; input.placeholder='请直接输入答案'; input.addEventListener('input',()=>{ selected=input.value; warning.textContent=''; }); box.append(input);
  }

  const track=node('div','','ko-exit-track'); const bar=node('span'); bar.style.width=`${active.index/check.items.length*100}%`; track.append(bar);
  const last=active.index===check.items.length-1;
  setBody(
    node('div','EXIT CHECK','eyebrow'),
    node('h1',check.title,'ko-exit-title'),
    node('p',`第 ${active.index+1} / ${check.items.length} 题。只检查今天最核心的两件事，通过后才完成本课。`,'ko-exit-copy'),
    track,
    node('h2',item.prompt,'ko-exit-title'),
    box,warning,
    actionButtons('返回课程',close,last?'提交 Exit Check':'下一题',()=>{
      const unanswered = selected === null || (item.type==='typing' && !normalize(selected));
      if (unanswered) { warning.textContent='请先完成这一题。'; return; }
      const correct = item.type==='typing'
        ? (item.accepted || []).some(answer => normalize(answer)===normalize(selected))
        : Number(selected)===Number(item.answer);
      active.results.push({ index:active.index, prompt:item.prompt, correct, selected });
      if (last) finish(); else { active.index += 1; renderItem(); }
    })
  );
}

function finish() {
  const correct = active.results.filter(r=>r.correct).length;
  const passed = correct === active.check.items.length;
  const now = new Date().toISOString();
  const state = readState();
  state.koreanExitChecks ||= {};
  state.koreanExitChecks[active.lessonId] = { completed_at:now, score:correct, max_score:active.check.items.length, passed, results:active.results };
  state.studyEvents = Array.isArray(state.studyEvents) ? state.studyEvents : [];
  state.studyEvents.push({ schema_version:'1.0', event_id:safeId('evt-ko-exit'), occurred_at:now, domain:'korean', event_type:'micro_assessment_completed', content_id:active.lessonId, concept_id:null, skill:'lesson_exit_check', result:{score:correct,max_score:active.check.items.length,passed}, duration_ms:null, session_id:null, source:'learning_paw', device_id:null, algorithm:null });
  writeState(state);

  if (passed) {
    const lessonId = active.lessonId;
    const callback = active.onPassed;
    setBody(node('h1','Exit Check 通过 ✓','ko-exit-title'), node('div','今天的核心知识已经过了一次主动提取，可以进入下一课。','ko-exit-result'), actionButtons('关闭',close,'完成本课',()=>{ close(); callback?.(lessonId); }));
  } else {
    setBody(node('h1','再补一下就好','ko-exit-title'), node('div',`本次 ${correct} / ${active.check.items.length}。Exit Check 很短，回到正文或训练卡再看一次，然后立即重试。`,'ko-exit-result warn'), actionButtons('返回课程',close,'立即重试',()=>{ active.index=0; active.results=[]; renderItem(); }));
  }
}

export function hasKoreanExitCheck(lessonId) { return Boolean(koreanExitChecks[lessonId]); }
export function openKoreanExitCheck(lessonId,onPassed) {
  const check = koreanExitChecks[lessonId];
  if (!check) { onPassed?.(lessonId); return; }
  active = { lessonId, check, index:0, results:[], onPassed };
  open();
  renderItem();
}

window.__KOREAN_EXIT_CHECK_V06__ = { version:'0.6.0', count:Object.keys(koreanExitChecks).length };
