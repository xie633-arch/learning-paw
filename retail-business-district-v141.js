import './retail-business-district-v14.js';
import { curricula, extraCards } from './platform-data.js';
import { lessonContentById } from './lesson-content-v05.js';

const VERSION = '0.14.1';
const retail = curricula.retail;

const renumber = {
  'retail-store': '12｜门店与陈列：把区域策略落到现场',
  'retail-demo': '13｜体验与 Demo：把价值变成可感知证据',
  'retail-channel': '14｜渠道 / O2O / 履约：让供给与服务接上',
  'retail-ops': '15｜活动与用户经营：从一次成交到长期关系',
  'retail-review': '16｜经营数据与复盘：从结果回到下一轮作战',
};

if (retail) {
  (retail.steps || []).forEach(step => {
    if (renumber[step.id]) step.title = renumber[step.id];
  });
}

export function businessDistrictCourseSnapshot() {
  const lessonIds = [
    'retail-space',
    'retail-district-map',
    'retail-district-userflow',
    'retail-district-position',
    'retail-district-competition',
    'retail-district-partner',
    'retail-district-plan',
    'retail-district-storeplan',
    'retail-district-warroom',
  ];
  const cards = extraCards.filter(card => card.category && [
    '商圈作战', '商圈地图', '用户时空', '阵地分层', '竞争战场', '伙伴经营', '作战设计', '一店一策', '经营复盘', '经营指标', '完整链路',
  ].includes(card.category));

  return {
    version: VERSION,
    routeTotal: retail?.steps?.length || 0,
    lessonIds,
    lessonContentReady: lessonIds.every(id => {
      const content = lessonContentById[id];
      return Boolean(content?.intro && content?.sections?.length && content?.checkpoint);
    }),
    cardCount: cards.length,
    titles: (retail?.steps || []).map(step => step.title),
  };
}

if (typeof window !== 'undefined') {
  window.__RETAIL_BUSINESS_DISTRICT_V141__ = {
    version: VERSION,
    snapshot: businessDistrictCourseSnapshot,
  };
}
