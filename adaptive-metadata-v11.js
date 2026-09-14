import { tests } from './platform-data.js';
import { koreanExitChecks } from './korean-exit-check-v06.js';

const VERSION = '0.11.2';

// These mappings follow the CURRENT V0.4 advanced assessment bank installed by
// v04-boot.js. Keep the question's authored skill when present; this layer adds
// a stable Concept identity so errors can be remediated and revalidated.
const formalMetadata = {
  phone: [
    ['system-linking', 'phone-system-sustained-experience', '整机持续流畅'],
    ['display', 'phone-ltpo-adaptive', 'LTPO 与自适应刷新'],
    ['scenario', 'phone-business-travel-reliability', '商务出行：通信 / 续航 / 补电'],
    ['camera', 'phone-telephoto-scenario-value', '长焦的场景价值'],
    ['competitive-intelligence', 'phone-real-transaction-competition', '真实交易条件与竞品判断'],
    ['retail-demo', 'phone-demo-task-design', '任务导向的零售 Demo'],
    ['gtm', 'phone-gtm-measure', 'GTM：Measure'],
    ['diagnosis', 'phone-sales-diagnosis', '销量问题系统诊断'],
    ['ecosystem', 'phone-ecosystem-retention', '生态协同与迁移成本'],
    ['product-strategy', 'phone-portfolio-roles', '产品组合与业务角色'],
  ],
  retail: [
    ['need-state', 'retail-need-state', 'Need State'],
    ['spatial-analysis', 'retail-competitive-anchor', '竞品锚点与真实动线'],
    ['traffic-quality', 'retail-traffic-conversion', '客流质量与转化诊断'],
    ['display', 'retail-merchandising-value', '陈列与价值理解'],
    ['demo', 'retail-demo-cognitive-load', 'Demo 与认知负担'],
    ['o2o', 'retail-o2o-service', 'O2O 服务承接'],
    ['campaign', 'retail-campaign-goal', '活动经营目标'],
    ['inventory', 'retail-sellable-inventory', '可售库存与结构'],
    ['user-ops', 'retail-ltv', '成交后的用户经营'],
    ['review', 'retail-fact-hypothesis', '事实 / 判断 / 待验证假设'],
  ],
  industry: [
    ['market-evidence', 'industry-share-quality', '份额与业务质量'],
    ['source-evaluation', 'industry-source-methodology', '来源口径与方法差异'],
    ['sell-in-out', 'industry-sell-in-out', 'Sell-in / Sell-out 与渠道库存'],
    ['value-vs-volume', 'industry-value-volume', '量与价值分离'],
    ['concentration', 'industry-market-concentration', '市场集中度'],
    ['pricing', 'industry-real-price', '真实交易价格'],
    ['portfolio', 'industry-cannibalization', '产品自我蚕食'],
    ['channel', 'industry-channel-tradeoff', '渠道控制与覆盖取舍'],
    ['evidence', 'industry-evidence-boundary', '证据边界与替代解释'],
    ['scenario', 'industry-scenario-analysis', '情景分析'],
  ],
};

Object.entries(formalMetadata).forEach(([domain, rows]) => {
  const assessment = tests[domain];
  if (!assessment) return;
  assessment.assessment_id ||= `${domain}-foundation-100-v1`;
  assessment.max_score ||= 100;
  (assessment.questions || []).forEach((question, index) => {
    const [skill, conceptId, conceptLabel] = rows[index] || ['general', `${domain}-item-${index + 1}`, question.q || `题目 ${index + 1}`];
    question.item_id ||= `${domain}-foundation-${String(index + 1).padStart(2, '0')}`;
    question.section_id ||= question.skill || skill;
    question.skill ||= skill;
    if (!Array.isArray(question.concept_ids) || question.concept_ids.length === 0) {
      question.concept_ids = [conceptId];
    }
    question.concept_label ||= conceptLabel;
    question.max_score ||= 10;
  });
});

function inferKoreanSkill(item) {
  if (item.type === 'audio_mcq') return 'listening';
  if (item.type === 'typing') return 'writing';
  return 'recognition';
}

Object.entries(koreanExitChecks).forEach(([lessonId, check]) => {
  check.assessment_id ||= `korean-exit-${lessonId}`;
  (check.items || []).forEach((item, index) => {
    const skill = item.skill || inferKoreanSkill(item);
    item.item_id ||= `korean-exit-${lessonId}-${String(index + 1).padStart(2, '0')}`;
    item.skill ||= skill;
    item.concept_id ||= `korean-${lessonId}-${String(index + 1).padStart(2, '0')}`;
    item.concept_label ||= item.prompt;
  });
});

window.__ADAPTIVE_METADATA_V11__ = {
  version: VERSION,
  formalAssessments: Object.keys(formalMetadata).length,
  koreanExitChecks: Object.keys(koreanExitChecks).length,
};