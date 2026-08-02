const TEA_ROOM_RUMORS = [
  '隔壁组下午突然全员开会。',
  '行政在清点空工位，理由是优化空间。',
  '老板今天没戴工牌，茶水间气压偏低。',
  'HRBP 在电梯里说了三次“同步一下”。',
  '有人发现共享盘多了一个“组织校准”文件夹。',
  '前台打印机吐出一页没有标题的名单。',
  '周报模板新增了“不可替代性说明”。',
  '会议室被连续订到晚上十点。'
];

export function getTeaRoomRumor(state) {
  if (state.hidden.landmine >= 75) return '有人在问你的直属汇报关系。';
  if (state.stats.performance <= 25) return '绩效系统今天刷新得格外勤快。';
  if (state.stats.savings < 0) return '财务说报销流程本周可能变慢。';

  const seed = state.day * 13
    + Math.round(state.hidden.landmine)
    + Math.round(state.stats.performance)
    + Math.round(state.stats.dignity);
  return TEA_ROOM_RUMORS[Math.abs(seed) % TEA_ROOM_RUMORS.length];
}

export function getBlameRank(state) {
  const riskScore = state.hidden.landmine
    + Math.max(0, 55 - state.stats.performance) * 0.45
    + Math.max(0, 50 - state.stats.dignity) * 0.25
    - Math.max(0, state.stats.savings - 10000) / 6000;
  const rank = Math.max(1, Math.min(12, 12 - Math.floor(riskScore / 9)));

  if (rank <= 2) return { rank, label: '高危', tone: 'danger' };
  if (rank <= 5) return { rank, label: '靠前', tone: 'warning' };
  return { rank, label: '暂稳', tone: 'safe' };
}

export function getWorkTitle(state) {
  if (state.revivesUsed > 0) return '广告续命型人才';
  if (state.stats.savings >= 50000) return '现金流避险家';
  if (state.stats.performance >= 90 && state.stats.dignity < 45) return 'PPT 预言家';
  if (state.hidden.landmine >= 75) return '主动背锅型人才';
  if (state.stats.hair <= 35) return '发际线贡献者';
  if (state.hidden.landmine <= 12 && state.stats.dignity >= 65) return '低调幸存者';
  if (state.metrics?.actionsTaken >= 18) return '会议隐身术士';
  return '普通牛马观察员';
}
