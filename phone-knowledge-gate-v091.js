import { extraCards } from './platform-data.js';

const STORAGE_KEY = 'personal-learning-os:v0.1';

function readProgress() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return state?.lessonProgress || {};
  } catch {
    return {};
  }
}

const progress = readProgress();
const unlocked = Boolean(progress['phone-portfolio']);

if (!unlocked) {
  for (let index = extraCards.length - 1; index >= 0; index -= 1) {
    if (extraCards[index]?.source === 'phone-knowledge-v09') extraCards.splice(index, 1);
  }
}

window.__PHONE_KNOWLEDGE_GATE_V091__ = {
  version: '0.9.1',
  unlocked,
  rule: 'Complete phone-portfolio before Phone Knowledge Base starter cards enter review.',
};
