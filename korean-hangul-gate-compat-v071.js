const STORAGE_KEY = 'personal-learning-os:v0.1';
const GATE_ASSESSMENT_ID = 'ko-hangul-gate-v1';
const VERSION = '0.7.1';

function readState() {
  if (typeof localStorage === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

export function hangulGatePassed(state = readState()) {
  return (Array.isArray(state.assessmentAttempts) ? state.assessmentAttempts : [])
    .some(attempt => attempt.assessment_id === GATE_ASSESSMENT_ID && attempt.passed === true);
}

export function syncHangulGateCompatibility() {
  if (typeof localStorage === 'undefined') return false;
  const state = readState();
  const attempts = (Array.isArray(state.assessmentAttempts) ? state.assessmentAttempts : [])
    .filter(attempt => attempt.assessment_id === GATE_ASSESSMENT_ID && attempt.passed === true)
    .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
  const latest = attempts[0];
  if (!latest) return false;

  // The current staged assessment UI historically used koreanBaseline as its
  // "prerequisite phase complete" marker. The Hangul gate replaces Day 0/Week 1,
  // so bridge a successful gate into that old marker until the assessment UI is
  // fully migrated to a generic prerequisite API.
  if (!state.koreanBaseline?.completed_at) {
    state.koreanBaseline = {
      schema_version: '1.0',
      assessment_id: GATE_ASSESSMENT_ID,
      started_at: latest.started_at || null,
      completed_at: latest.completed_at || new Date().toISOString(),
      responses: {},
      source: 'hangul_gate_compat',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  }
  return false;
}

if (typeof window !== 'undefined') {
  syncHangulGateCompatibility();
  window.__KOREAN_HANGUL_GATE_COMPAT_V071__ = {
    version: VERSION,
    assessmentId: GATE_ASSESSMENT_ID,
    passed: () => hangulGatePassed(),
  };
}
