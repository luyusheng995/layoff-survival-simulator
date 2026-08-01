export function createReleaseChecklist(config, options = {}) {
  const requiredFiles = options.requiredFiles || [];
  const checks = [
    check('event_count', '事件库规模', config.eventStats.total >= 200, `${config.eventStats.total} / 200`),
    check('event_mix', '事件分类结构', config.eventStats.daily >= 140 && config.eventStats.crisis >= 40 && config.eventStats.opportunity >= 20, `日常 ${config.eventStats.daily}，危机 ${config.eventStats.crisis}，机遇 ${config.eventStats.opportunity}`),
    check('ending_count', '结局体系', config.endings.length >= 12, `${config.endings.length} / 12`),
    check('ad_placements', '广告点位', config.adPlacements.length === 5, `${config.adPlacements.length} / 5`),
    check('actions', '每日行动', config.actions.length === 5 && config.gameplay.dailyEnergy === 3, `${config.actions.length} 个行动，每日 ${config.gameplay.dailyEnergy} 点精力`),
    check('difficulties', '难度配置', config.difficulties.length === 3, `${config.difficulties.length} / 3`),
    check('balance_targets', '平衡目标', Boolean(config.balanceTargets.averageDays && config.balanceTargets.reviveRate), '已配置平均天数和复活率目标'),
    ...requiredFiles.map((file) => check(`file_${file}`, `必要文件：${file}`, true, '由 smoke 脚本验证存在'))
  ];

  return {
    passed: checks.every((item) => item.passed),
    generatedAt: new Date(0).toISOString(),
    checks
  };
}

export function createReleaseChecklistMarkdown(result) {
  return [
    '# 发行前 QA Smoke 清单',
    '',
    `整体状态：${result.passed ? 'PASS' : 'FAIL'}`,
    '',
    '| 检查项 | 状态 | 说明 |',
    '| --- | --- | --- |',
    ...result.checks.map((item) => `| ${item.title} | ${item.passed ? 'PASS' : 'FAIL'} | ${item.detail} |`),
    ''
  ].join('\n');
}

function check(id, title, passed, detail) {
  return { id, title, passed, detail };
}
