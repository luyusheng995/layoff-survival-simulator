export const TALENTS = [
  {
    id: 'rich_family',
    label: '家里有矿',
    description: '开局存款变为 ¥15,000。房租焦虑不消失，只是晚点来。'
  },
  {
    id: 'blame_master',
    label: '甩锅宗师',
    description: '正向埋雷效果减半。锅不会没有，只是更像别人的锅。'
  },
  {
    id: 'ppt_god',
    label: 'PPT 之神',
    description: '向上管理和汇报类选择额外获得绩效 +3。'
  }
];

export function getTalent(talentId) {
  return TALENTS.find((talent) => talent.id === talentId) || null;
}

export function applyTalentToInitialStats(talentId, stats) {
  if (talentId === 'rich_family') {
    return {
      ...stats,
      savings: 15000
    };
  }
  return stats;
}

export function applyTalentToEffects(state, effects, context = {}) {
  const talentId = state.selectedTalentId;
  const next = { ...effects };

  if (talentId === 'blame_master' && next.landmine > 0) {
    next.landmine = Math.floor(next.landmine * 0.5);
  }

  const tags = context.tags || [];
  const isPptContext = context.actionId === 'manage_up' || tags.includes('ppt') || tags.includes('reporting');
  if (talentId === 'ppt_god' && isPptContext) {
    next.performance = (next.performance || 0) + 3;
  }

  return next;
}
