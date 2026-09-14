import { tests } from './platform-data.js';
import { koreanExitChecks } from './korean-exit-check-v06.js';

const VERSION = '0.11.0';

const formalMetadata = {
  phone: [
    ['technical_architecture', 'phone-soc-system', 'SoC 系统组成'],
    ['display_system', 'phone-ltpo', 'LTPO 与自适应刷新'],
    ['performance_reasoning', 'phone-sustained-performance', '持续性能与系统协同'],
    ['camera_system', 'phone-ois', 'OIS 光学防抖'],
    ['battery_system', 'phone-energy-efficiency', '电池容量与整机能效'],
    ['gtm_framework', 'phone-gtm-who', 'GTM：Who'],
    ['value_translation', 'phone-parameter-to-value', '参数 → 场景价值'],
    ['gtm_framework', 'phone-gtm-measure', 'GTM：Measure'],
    ['competition', 'phone-competitive-system', '系统化竞品分析'],
    ['diagnosis', 'phone-sales-diagnosis', '销量问题诊断'],
  ],
  retail: [
    ['user_insight', 'retail-need-state', 'Need State'],
    ['user_insight', 'retail-jtbd', 'JTBD'],
    ['store_experience', 'retail-merchandising', '陈列与价值理解'],
    ['store_experience', 'retail-demo', '场景化 Demo'],
    ['operations', 'retail-funnel', '零售漏斗诊断'],
    ['o2o_fulfillment', 'retail-o2o-service', 'O2O 服务承接'],
    ['operations', 'retail-campaign-goal', '活动经营目标'],
    ['user_operations', 'retail-ltv', '成交后的用户经营'],
    ['trade_area', 'retail-trade-area', '商圈与客流结构'],
    ['diagnosis', 'retail-hypothesis', '事实 / 判断 / 假设'],
  ],
  industry: [
    ['market_structure', 'industry-share-quality', '份额与业务质量'],
    ['market_structure', 'industry-sell-in-out', 'Sell-in / Sell-out'],
    ['pricing', 'industry-asp', 'ASP'],
    ['portfolio', 'industry-cannibalization', '产品自我蚕食'],
    ['brand', 'industry-positioning', '品牌定位'],
    ['channel', 'industry-direct-channel', '直营渠道角色'],
    ['business_model', 'industry-ltv', 'LTV'],
    ['ecosystem', 'industry-ecosystem', '生态协同'],
    ['competitive_intelligence', 'industry-fact-vs-inference', '竞情事实与解释'],
    ['strategy', 'industry-scenario-analysis', '情景分析'],
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
    question.section_id ||= skill;
    question.skill ||= skill;
    question.concept_ids ||= [conceptId];
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
