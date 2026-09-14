const VERSION = '0.13.0';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function signalKey({ concept_id: conceptId, content_id: contentId, skill }) {
  const concept = conceptId || `content:${contentId || 'unknown'}`;
  return `${concept}::${skill || 'general'}`;
}

function ageDays(value, now) {
  const time = new Date(value || 0).getTime();
  if (!Number.isFinite(time) || time <= 0) return Infinity;
  return Math.max(0, (now.getTime() - time) / 86400000);
}

function severityWeight(severity) {
  if (severity === 'high') return 52;
  if (severity === 'medium') return 38;
  return 24;
}

function recallWeakness(signal) {
  const ratings = signal?.ratings || {};
  const good = Number(ratings.good || 0);
  const hard = Number(ratings.hard || 0);
  const again = Number(ratings.again || 0);
  const total = good + hard + again;
  if (!total) return { ratio: 0, weightedMisses: 0, total: 0 };
  const weightedMisses = again + hard * 0.5;
  return { ratio: weightedMisses / total, weightedMisses, total };
}

function assessmentWeakness(signal) {
  const assessment = signal?.assessment || {};
  const correct = Number(assessment.correct || 0);
  const incorrect = Number(assessment.incorrect || 0);
  const total = correct + incorrect;
  if (!total) return { ratio: 0, incorrect: 0, total: 0 };
  return { ratio: incorrect / total, incorrect, total };
}

function activeErrorsBySignal(state, domainId) {
  const grouped = new Map();
  asArray(state?.errorRecords)
    .filter(record => record.domain === domainId && record.status === 'active')
    .forEach(record => {
      const key = signalKey(record);
      const bucket = grouped.get(key) || [];
      bucket.push(record);
      grouped.set(key, bucket);
    });
  return grouped;
}

function choosePrimaryError(errors) {
  return [...errors].sort((a, b) => {
    const rank = value => value === 'high' ? 2 : value === 'medium' ? 1 : 0;
    return rank(b.severity) - rank(a.severity)
      || Number(b.occurrences || 0) - Number(a.occurrences || 0)
      || new Date(b.last_seen_at || 0).getTime() - new Date(a.last_seen_at || 0).getTime();
  })[0] || null;
}

function scoreCandidate(signal, errors, now) {
  const primaryError = choosePrimaryError(errors);
  const recall = recallWeakness(signal);
  const assessment = assessmentWeakness(signal);
  const revalidations = signal?.revalidations || {};
  const failedRevalidations = Number(revalidations.failed || 0);
  const passedRevalidations = Number(revalidations.passed || 0);
  const attempts = Number(signal?.attempts || 0);
  const occurrences = Math.max(0, ...errors.map(record => Number(record.occurrences || 0)));
  const lastSeen = primaryError?.last_seen_at || signal?.last_seen_at || null;
  const recency = ageDays(lastSeen, now);

  let score = primaryError ? severityWeight(primaryError.severity) : 0;
  const reasons = [];

  if (primaryError) {
    reasons.push({
      code: `active_${primaryError.error_type || 'error'}`,
      weight: severityWeight(primaryError.severity),
      text: primaryError.error_type === 'assessment_error'
        ? '存在尚未解决的客观验收错误'
        : '存在尚未解决的主动回忆缺口',
    });
  }

  if (occurrences >= 2) {
    const weight = Math.min(16, 6 + (occurrences - 2) * 4);
    score += weight;
    reasons.push({ code: 'repeated_error', weight, text: `同类错误已重复出现 ${occurrences} 次` });
  }

  if (assessment.total > 0 && assessment.incorrect > 0) {
    const weight = Math.round(assessment.ratio * 24);
    score += weight;
    reasons.push({
      code: 'assessment_weakness',
      weight,
      text: `客观验收错误 ${assessment.incorrect}/${assessment.total}`,
    });
  }

  if (recall.total > 0 && recall.weightedMisses > 0) {
    const weight = Math.round(recall.ratio * 18);
    score += weight;
    reasons.push({
      code: 'recall_weakness',
      weight,
      text: `主动回忆中仍有模糊或不认识记录`,
    });
  }

  if (failedRevalidations > 0) {
    const weight = Math.min(18, 9 + (failedRevalidations - 1) * 4);
    score += weight;
    reasons.push({
      code: 'failed_revalidation',
      weight,
      text: `针对性重验证失败 ${failedRevalidations} 次`,
    });
  }

  if (passedRevalidations > 0 && !primaryError) {
    const weight = -Math.min(18, passedRevalidations * 9);
    score += weight;
    reasons.push({
      code: 'successful_revalidation',
      weight,
      text: `已有 ${passedRevalidations} 次成功重验证，优先级下降`,
    });
  }

  if (recency <= 1) {
    score += 8;
    reasons.push({ code: 'recent_evidence', weight: 8, text: '最近 24 小时仍出现相关证据' });
  } else if (recency <= 7) {
    score += 4;
    reasons.push({ code: 'recent_evidence', weight: 4, text: '最近 7 天仍出现相关证据' });
  }

  // A single weak self-rating with no persistent error is a hint, not a crisis.
  if (!primaryError && attempts <= 1) score -= 5;

  return {
    score: clamp(Math.round(score)),
    reasons: reasons.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
    primaryError,
    evidence: {
      attempts,
      occurrences,
      assessmentIncorrect: assessment.incorrect,
      assessmentTotal: assessment.total,
      recallWeaknessRatio: Number(recall.ratio.toFixed(3)),
      failedRevalidations,
      passedRevalidations,
      lastSeenAt: lastSeen,
    },
  };
}

function recommendAction(scored) {
  const error = scored.primaryError;
  if (scored.evidence.failedRevalidations > 0) return 'remediate_then_revalidate';
  if (error?.error_type === 'assessment_error') return 'targeted_review_then_revalidate';
  if (error?.error_type === 'recall_gap') return 'spaced_recall';
  if (scored.evidence.assessmentIncorrect > 0) return 'targeted_review';
  if (scored.evidence.recallWeaknessRatio > 0) return 'spaced_recall';
  return 'continue_curriculum';
}

function actionLabel(action) {
  const labels = {
    remediate_then_revalidate: '先补救，再做单点重验证',
    targeted_review_then_revalidate: '针对性复习后重验证',
    spaced_recall: '安排一次主动回忆 / 间隔复习',
    targeted_review: '补充针对性理解与练习',
    continue_curriculum: '继续当前课程路线',
  };
  return labels[action] || action;
}

export function rankLearningRecommendations(state, domainId, {
  now = new Date(),
  limit = 5,
  minimumScore = 12,
} = {}) {
  if (!domainId) throw new Error('domainId is required');
  const signals = asObject(state?.learnerSignals);
  const errorsBySignal = activeErrorsBySignal(state, domainId);
  const candidateKeys = new Set([
    ...Object.entries(signals)
      .filter(([, signal]) => signal?.domain === domainId)
      .map(([key]) => key),
    ...errorsBySignal.keys(),
  ]);

  const recommendations = [];
  candidateKeys.forEach(key => {
    const signal = signals[key] || {};
    const errors = errorsBySignal.get(key) || [];
    const primaryError = choosePrimaryError(errors);
    const conceptId = signal.concept_id || primaryError?.concept_id || null;
    const contentId = signal.content_id || primaryError?.content_id || null;
    const skill = signal.skill || primaryError?.skill || 'general';
    const scored = scoreCandidate(signal, errors, now instanceof Date ? now : new Date(now));
    if (scored.score < minimumScore) return;
    const action = recommendAction(scored);

    recommendations.push({
      recommendation_id: `rec:${domainId}:${conceptId || `content:${contentId || 'unknown'}`}:${skill}`,
      domain: domainId,
      concept_id: conceptId,
      content_id: contentId,
      skill,
      priority_score: scored.score,
      action,
      action_label: actionLabel(action),
      reason_codes: scored.reasons.map(reason => reason.code),
      reasons: scored.reasons,
      evidence: scored.evidence,
      error_id: scored.primaryError?.error_id || null,
      error_type: scored.primaryError?.error_type || null,
      severity: scored.primaryError?.severity || null,
      source: 'LearnerSignal + ErrorRecord',
    });
  });

  return recommendations
    .sort((a, b) => b.priority_score - a.priority_score
      || new Date(b.evidence.lastSeenAt || 0).getTime() - new Date(a.evidence.lastSeenAt || 0).getTime())
    .slice(0, Math.max(0, limit));
}

export function recommendationSummary(state, domainId, options = {}) {
  const ranked = rankLearningRecommendations(state, domainId, options);
  return {
    version: VERSION,
    domainId,
    count: ranked.length,
    top: ranked[0] || null,
    recommendations: ranked,
  };
}

if (typeof window !== 'undefined') {
  window.__LEARNER_RECOMMENDATION_V13__ = {
    version: VERSION,
    rankLearningRecommendations,
    recommendationSummary,
  };
}
