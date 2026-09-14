const STORAGE_KEY = 'personal-learning-os:v0.1';
const VERSION = '0.11.3';

// learner-data-v1 patches Storage#setItem before this module loads. Keep that
// enriched writer as the delegate, and only intervene when a caller is about to
// write an older in-memory snapshot over newer learner-fact data.
const enrichedSetItem = Storage.prototype.setItem;
const nativeGetItem = Storage.prototype.getItem;

const APP_OWNED_KEYS = new Set([
  'version',
  'schedules',
  'history',
  'lessonProgress',
  'testResults',
  'preferences',
]);

let explicitReplacementPending = false;
let explicitReplacementTimer = null;

function clearExplicitReplacement() {
  explicitReplacementPending = false;
  if (explicitReplacementTimer) clearTimeout(explicitReplacementTimer);
  explicitReplacementTimer = null;
}

function armExplicitReplacement() {
  explicitReplacementPending = true;
  if (explicitReplacementTimer) clearTimeout(explicitReplacementTimer);
  explicitReplacementTimer = setTimeout(clearExplicitReplacement, 15000);
}

function consumeExplicitReplacement() {
  if (!explicitReplacementPending) return false;
  clearExplicitReplacement();
  return true;
}

// The legacy import flow intentionally replaces the device state. Arm a single
// bypass before app.js handles the selected backup file, so the stale-write guard
// does not turn an explicit restore into an accidental merge.
const importInput = document.querySelector('#importInput');
importInput?.addEventListener('change', armExplicitReplacement, true);

// If the user cancels the import confirmation, clear the one-shot bypass
// immediately instead of leaving the next unrelated write unguarded.
const nativeConfirm = window.confirm.bind(window);
window.confirm = function guardedConfirm(message) {
  const accepted = nativeConfirm(message);
  if (explicitReplacementPending && !accepted) clearExplicitReplacement();
  return accepted;
};

function parseState(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return null;
  }
}

function migrationTime(state) {
  const raw = state?.migrations?.learner_data_compat_v1;
  if (!raw) return 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
}

function isStaleSnapshot(incoming, current) {
  const currentTime = migrationTime(current);
  if (!currentTime) return false;
  const incomingTime = migrationTime(incoming);
  if (!incomingTime) return true;
  return incomingTime < currentTime;
}

function mergeStaleSnapshot(incoming, current) {
  // Current storage is the freshest source for learner-owned / extension fields.
  // The base app is still allowed to update the fields it owns.
  const merged = { ...current };

  Object.entries(incoming).forEach(([key, value]) => {
    if (APP_OWNED_KEYS.has(key) || !(key in current)) merged[key] = value;
  });

  if (incoming.preferences && typeof incoming.preferences === 'object' && !Array.isArray(incoming.preferences)) {
    merged.preferences = {
      ...(current.preferences && typeof current.preferences === 'object' ? current.preferences : {}),
      ...incoming.preferences,
    };
  }

  return merged;
}

Storage.prototype.setItem = function guardedLearningStateWrite(key, value) {
  if (this !== window.localStorage || key !== STORAGE_KEY) {
    return enrichedSetItem.call(this, key, value);
  }

  if (consumeExplicitReplacement()) {
    return enrichedSetItem.call(this, key, value);
  }

  const incoming = parseState(value);
  if (!incoming) return enrichedSetItem.call(this, key, value);

  const current = parseState(nativeGetItem.call(this, key));
  if (!current || !isStaleSnapshot(incoming, current)) {
    return enrichedSetItem.call(this, key, value);
  }

  const merged = mergeStaleSnapshot(incoming, current);
  return enrichedSetItem.call(this, key, JSON.stringify(merged));
};

window.__STATE_WRITE_GUARD_V113__ = {
  version: VERSION,
  strategy: 'preserve-newer-learner-facts-on-stale-app-write',
  appOwnedKeys: [...APP_OWNED_KEYS],
};
