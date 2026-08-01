export function createShareReport(state, ending) {
  const maxPerformance = state.metrics?.maxPerformance ?? state.stats.performance;
  const minHair = state.metrics?.minHair ?? state.stats.hair;
  const hairLost = Math.max(0, 80 - minHair);
  const daysSurvived = Math.min(state.day, 90);
  const diagnosis = diagnose(state, ending, hairLost);
  const finalSavings = Math.round(state.stats.savings);
  const survivalTier = tierForDays(daysSurvived);
  const shareHeadline = `撑过 ${daysSurvived} 天，${ending.title}`;
  const posterCode = createPosterCode(ending.id, daysSurvived);
  const shareBadges = createShareBadges(state, ending, survivalTier, hairLost);

  const shareText = [
    '《大厂裁员生存模拟器》打工人报告',
    shareHeadline,
    `结局：${ending.title}`,
    `生存评级：${survivalTier}`,
    `报告编号：${posterCode}`,
    `标签：${shareBadges.join(' / ')}`,
    `存活：${daysSurvived} 天`,
    `最高绩效：${maxPerformance}`,
    `掉发总量：${hairLost}`,
    `最终存款：¥${finalSavings.toLocaleString('zh-CN')}`,
    `诊断：${diagnosis}`
  ].join('\n');

  return {
    endingId: ending.id,
    endingTitle: ending.title,
    endingDescription: ending.description,
    shareHeadline,
    survivalTier,
    posterCode,
    shareBadges,
    daysSurvived,
    maxPerformance,
    hairLost,
    finalSavings,
    revivesUsed: state.revivesUsed,
    adsWatched: state.metrics?.adsWatched || 0,
    diagnosis,
    shareText
  };
}

function createPosterCode(endingId, daysSurvived) {
  const slug = endingId.toUpperCase().replaceAll('_', '-');
  return `LAYOFF-${slug}-${String(daysSurvived).padStart(3, '0')}`;
}

function createShareBadges(state, ending, survivalTier, hairLost) {
  const badges = [survivalTier];
  if (state.revivesUsed > 0) badges.push(`广告续命 x${state.revivesUsed}`);
  if (ending.id === 'side_hustle_escape' || ending.id === 'backpack_freelancer') badges.push('副业上岸');
  if (ending.id === 'reverse_promoted' || ending.id === 'ppt_partner') badges.push('向上管理大师');
  if (hairLost >= 35) badges.push(`掉发 ${hairLost} 根`);
  if (state.stats.savings >= 50000) badges.push('现金流自由');
  if (state.stats.performance >= 90) badges.push('绩效爆表');
  return badges.slice(0, 4);
}

function tierForDays(daysSurvived) {
  if (daysSurvived >= 90) return '年底幸存';
  if (daysSurvived >= 75) return '名单边缘';
  if (daysSurvived >= 30) return '中场苟住';
  return '试用期震荡';
}

function diagnose(state, ending, hairLost) {
  if (ending.id === 'reverse_promoted') return '你已经学会把锅做成组织能力。';
  if (ending.id === 'side_hustle_escape') return '主业负责消耗你，副业负责救你。';
  if (state.revivesUsed > 0) return '你靠广告续过命，也靠自己撑过场。';
  if (hairLost >= 35) return '你的发际线替公司完成了降本增效。';
  if (state.stats.dignity < 35) return '你还在工位上，但灵魂已经申请调休。';
  return '你是低调幸存者，茶水间会记得你。';
}
