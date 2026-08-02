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

export function getBossGaze(state) {
  const value = Math.max(0, Math.min(100, Math.round(
    12
    + state.hidden.landmine * 0.58
    + Math.max(0, 65 - state.stats.performance) * 0.22
    + (state.day % 5) * 3
  )));

  if (value >= 75) {
    return { value, label: '盯上了', tone: 'danger', line: '老板看了你 3.2 秒。' };
  }
  if (value >= 45) {
    return { value, label: '扫到你', tone: 'warning', line: '老板看了你 0.8 秒。' };
  }
  return { value, label: '未对焦', tone: 'safe', line: '老板今天还没想起你。' };
}

export function getWeChatNudge(state, eventType = 'daily') {
  if (eventType === 'crisis') return 'HRBP：方便 15 分钟后同步一下吗？';
  if (eventType === 'opportunity') return '直属领导：这个机会你先接一下，后面好说。';
  if (state.hidden.landmine >= 60) return '直属领导：你这个 OKR 怎么理解？';
  return '企业微信：你有一条未读的组织气氛。';
}

export function getMomentsCopy(state, endingTitle) {
  const title = getWorkTitle(state);
  const days = Math.min(state.day, 90);
  const gaze = getBossGaze(state).label;
  return `我在大厂裁员生存模拟器里活了 ${days} 天，工位称号「${title}」，老板凝视状态「${gaze}」，最后走向「${endingTitle}」。`;
}
