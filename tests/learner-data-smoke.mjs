class FakeStorage {
  constructor() {
    this.map = new Map();
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }
}

globalThis.Storage = FakeStorage;
globalThis.window = globalThis;
globalThis.window.localStorage = new FakeStorage();
globalThis.document = {
  querySelector() { return null; },
  body: { append() {} },
};

const STORAGE_KEY = 'personal-learning-os:v0.1';
const { cards } = await import('../cards.js');
const card = cards.find(item => item.domain === 'phone') || cards[0];
if (!card) throw new Error('No base card available for migration smoke test.');

const firstLegacyState = {
  version: 3,
  schedules: {},
  history: [
    {
      id: 'legacy-h1',
      cardId: card.id,
      domain: card.domain,
      deck: card.deck,
      category: card.category || '',
      modality: 'recall',
      sessionMode: 'due',
      rating: 'again',
      answer: 'test response',
      reviewedAt: '2026-09-12T10:00:00+08:00',
      day: '2026-09-12',
      engine: 'FSRS',
    },
  ],
  lessonProgress: {},
  testResults: [],
  preferences: { lastDomain: card.domain },
};

window.localStorage.setItem(STORAGE_KEY, JSON.stringify(firstLegacyState));
await import('../learner-data-v1.js');

let migrated = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
if (migrated.version < 4) throw new Error('State version was not upgraded.');
if (migrated.studyEvents?.length !== 1) throw new Error('Legacy history was not migrated to one StudyEvent.');
if (migrated.studyEvents[0].result?.rating !== 'again') throw new Error('StudyEvent rating was not preserved.');
if (!migrated.errorRecords?.length) throw new Error('Again rating did not generate an ErrorRecord.');
if (!Object.keys(migrated.learnerSignals || {}).length) throw new Error('Learner Signal was not derived.');
if (!migrated.introducedContent?.[card.id]) throw new Error('introducedContent was not derived.');

const secondState = {
  ...migrated,
  history: [
    ...migrated.history,
    {
      id: 'legacy-h2',
      cardId: card.id,
      domain: card.domain,
      deck: card.deck,
      category: card.category || '',
      modality: 'recall',
      sessionMode: 'due',
      rating: 'good',
      answer: 'second response',
      reviewedAt: '2026-09-12T11:00:00+08:00',
      day: '2026-09-12',
      engine: 'FSRS',
    },
  ],
};

window.localStorage.setItem(STORAGE_KEY, JSON.stringify(secondState));
migrated = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
if (migrated.studyEvents?.length !== 2) throw new Error('Patched localStorage write did not add the second StudyEvent.');

const signal = Object.values(migrated.learnerSignals || {})[0];
if (!signal || signal.attempts !== 2) throw new Error('Learner Signal did not aggregate both attempts.');
if (signal.ratings.again !== 1 || signal.ratings.good !== 1) throw new Error('Learner Signal rating counts are incorrect.');

console.log('learner-data smoke test passed');
