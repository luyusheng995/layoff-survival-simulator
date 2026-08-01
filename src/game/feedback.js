const statLabels = {
  performance: '绩效分',
  hair: '发量值',
  dignity: '尊严值',
  savings: '存款额',
  landmine: '埋雷指数'
};

const checkpointLabels = {
  30: '试用期校准',
  45: '影子名单初筛',
  60: '预算冻结校准',
  75: '影子名单复核',
  90: '年终名单校准'
};

const checkpoints = [30, 45, 60, 75, 90];

export function createStatDeltas(beforeState, afterState) {
  const before = flattenStats(beforeState);
  const after = flattenStats(afterState);
  return Object.keys(statLabels)
    .map((key) => {
      const delta = Math.round((after[key] ?? 0) - (before[key] ?? 0));
      return {
        key,
        label: statLabels[key],
        before: before[key],
        after: after[key],
        delta,
        tone: deltaTone(key, delta),
        text: `${statLabels[key]} ${signed(delta)}`
      };
    })
    .filter((item) => item.delta !== 0);
}

export function getNextCheckpoint(day) {
  const nextDay = checkpoints.find((checkpoint) => checkpoint >= day) || 90;
  const label = checkpointLabels[nextDay];
  return {
    day: nextDay,
    label,
    daysLeft: Math.max(0, nextDay - day),
    tone: nextDay === 90 ? 'danger' : 'warning'
  };
}

function flattenStats(state) {
  return {
    ...state.stats,
    landmine: state.hidden?.landmine ?? 0
  };
}

function signed(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function deltaTone(key, delta) {
  if (delta === 0) return 'neutral';
  if (key === 'landmine') return delta < 0 ? 'good' : 'bad';
  return delta > 0 ? 'good' : 'bad';
}
