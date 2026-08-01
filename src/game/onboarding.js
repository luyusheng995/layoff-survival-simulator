const TASKS = [
  {
    id: 'first_action',
    label: '打出第一张工牌',
    detail: '花掉 1 点精力，先让日报有字可写。',
    completed: (state) => (state.metrics?.actionsTaken || 0) > 0
  },
  {
    id: 'first_event',
    label: '接住第一次公司播报',
    detail: '事件结算后，才知道今天的锅落谁头上。',
    completed: (state) => (state.metrics?.eventsResolved || 0) > 0
  },
  {
    id: 'first_ad',
    label: '体验一次激励视频',
    detail: '广告位会换 Buff、提示或复活机会。',
    completed: (state) => (state.metrics?.adsWatched || 0) > 0
  },
  {
    id: 'first_ending',
    label: '点亮第一个结局',
    detail: '图鉴亮起时，说明这段职场样本已归档。',
    completed: (_state, options) => (options.unlockedEndingCount || 0) > 0
  }
];

export function createOnboardingBrief(state, options = {}) {
  const tasks = TASKS.map((task) => ({
    id: task.id,
    label: task.label,
    detail: task.detail,
    completed: task.completed(state, options)
  }));
  const completed = tasks.filter((task) => task.completed).length;
  const visible = !options.dismissed && completed < tasks.length;

  return {
    visible,
    title: completed === 0 ? '新人入职待办' : '首局进度小票',
    summary: `${completed}/${tasks.length} 个首局节点已归档`,
    progress: {
      completed,
      total: tasks.length
    },
    tasks
  };
}
