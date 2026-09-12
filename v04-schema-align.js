import { cards as baseCards } from './cards.js';
import { curricula, extraCards, tests } from './platform-data.js';

const VERSION = '1.0';

const practiceMap = {
  active_recall: 'active_recall',
  scenario_recall: 'case_analysis',
  visual_recall: 'visual_identification',
  visual_reasoning: 'case_analysis',
  listening: 'listening_dictation',
  evidence_reasoning: 'case_analysis',
};

const sourceIdFrom = (card) => {
  if (card.source_id) return card.source_id;
  if (card.source?.kind === 'public-research') {
    return `public-${String(card.source.name || 'research').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  }
  return 'source-self-authored-learning-os';
};

[...baseCards, ...extraCards].forEach(card => {
  card.schema_version = VERSION;
  card.card_id ||= card.id;
  card.concept_id ||= `legacy-${card.domain || 'general'}-${card.id}`;
  card.practice_type ||= practiceMap[card.type] || (card.image ? 'visual_identification' : card.audioText ? 'listening_dictation' : 'active_recall');
  card.skill ||= card.category || 'general';
  card.prompt ||= card.question;
  card.difficulty ||= Number.isFinite(card.level) ? card.level : 1;
  card.source_id ||= sourceIdFrom(card);
  card.status ||= 'active';
});

Object.entries(curricula).forEach(([domain, curriculum]) => {
  curriculum.schema_version = VERSION;
  curriculum.program_id ||= `${domain}-learning-program-v1`;
  curriculum.name ||= curriculum.title;
  curriculum.domain ||= domain;
  curriculum.status ||= 'active';
  curriculum.goal ||= { primary: curriculum.title };

  (curriculum.steps || []).forEach((step, index) => {
    step.schema_version = VERSION;
    step.lesson_id ||= step.id;
    step.phase_id ||= `${domain}-phase-${String(index + 1).padStart(2, '0')}`;
    step.day_index ||= index + 1;
    step.objectives ||= [step.summary];
    step.prerequisites ||= index === 0 ? { concepts: [] } : { lessons: [curriculum.steps[index - 1].id] };
    step.estimated_minutes ||= { minimum: 20, standard: 50, intensive: 80 };
    step.review_policy ||= 'fsrs_due';
    step.activities ||= [
      { id: 'review', type: 'fsrs_review', minutes: 10 },
      { id: 'lesson', type: 'concept_learning', minutes: 20 },
      { id: 'practice', type: 'active_recall', minutes: 15 },
      { id: 'exit_check', type: 'micro_assessment', minutes: 5 },
    ];
  });
});

Object.entries(tests).forEach(([domain, assessment]) => {
  assessment.schema_version = VERSION;
  assessment.assessment_id ||= `${domain}-diagnostic-v1`;
  assessment.name ||= assessment.title;
  assessment.domain ||= domain;
  assessment.purpose ||= 'diagnostic';
  assessment.mode ||= 'controlled';
  assessment.scoring ||= 'objective';
  assessment.max_score ||= 100;

  (assessment.questions || []).forEach((item, index) => {
    item.schema_version = VERSION;
    item.item_id ||= `${assessment.assessment_id}-item-${String(index + 1).padStart(2, '0')}`;
    item.assessment_id ||= assessment.assessment_id;
    item.section_id ||= item.skill || 'general';
    item.concept_ids ||= [];
    item.item_type ||= 'multiple_choice';
    item.prompt ||= item.q;
    item.correct_answer ??= item.answer;
    item.max_score ||= Math.round(assessment.max_score / assessment.questions.length);
    item.source_id ||= 'source-self-authored-learning-os';
  });
});

window.__LEARNING_OS_SCHEMA__ = {
  version: VERSION,
  sourceOfTruth: 'Obsidian 10_Data_Schema',
  contentModel: 'Concept + Card',
  curriculumModel: 'Program → Phase → Week → Lesson → Activity',
  studyEventModel: 'event facts first',
  assessmentModel: 'Assessment → Section → Item → Attempt → Result/ErrorRecord',
  release: '0.4.0',
};
