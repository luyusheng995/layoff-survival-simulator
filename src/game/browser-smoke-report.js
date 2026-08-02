export const GAMEPLAY_EVENT_TYPE_TEXTS = ['日常事件', '危机事件', '机遇事件'];

export function createGameplayEventTypeCheckExpression() {
  return `document.body && ${JSON.stringify(GAMEPLAY_EVENT_TYPE_TEXTS)}.some((text) => document.body.innerText.includes(text))`;
}

export function shouldStartLocalSmokeServer(url) {
  const hostname = new URL(url).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

export function createBrowserSmokeReport(results, options = {}) {
  const normalized = results.map((result) => {
    const checks = result.checks || [];
    const consoleErrors = result.consoleErrors || [];
    return {
      id: result.id,
      viewport: result.viewport,
      passed: Boolean(result.passed) && checks.every((check) => check.passed) && consoleErrors.length === 0,
      checks,
      consoleErrors,
      screenshot: result.screenshot
    };
  });
  const totalChecks = normalized.reduce((sum, result) => sum + result.checks.length, 0);
  const failedChecks = normalized.reduce(
    (sum, result) => sum + result.checks.filter((check) => !check.passed).length,
    0
  );
  const consoleErrorCount = normalized.reduce((sum, result) => sum + result.consoleErrors.length, 0);

  return {
    generatedAt: options.generatedAt || new Date(0).toISOString(),
    url: options.url || 'http://127.0.0.1:4173/',
    passed: normalized.every((result) => result.passed),
    totalChecks,
    failedChecks,
    consoleErrorCount,
    results: normalized
  };
}

export function createBrowserSmokeMarkdown(report) {
  return [
    '# M17 浏览器级 Smoke 报告',
    '',
    `整体状态：${report.passed ? 'PASS' : 'FAIL'}`,
    `测试地址：${report.url}`,
    `生成时间：${report.generatedAt}`,
    `检查项：${report.totalChecks - report.failedChecks}/${report.totalChecks} 通过`,
    `控制台错误：${report.consoleErrorCount}`,
    '',
    '## 视口结果',
    '',
    '| 场景 | 视口 | 状态 | 截图 | 控制台错误 |',
    '| --- | --- | --- | --- | ---: |',
    ...report.results.map((result) => (
      `| ${result.id} | ${result.viewport.width}x${result.viewport.height} | ${result.passed ? 'PASS' : 'FAIL'} | ${result.screenshot} | ${result.consoleErrors.length} |`
    )),
    '',
    '## 检查明细',
    '',
    ...report.results.flatMap((result) => [
      `### ${result.id}`,
      '',
      '| 检查 | 状态 | 说明 |',
      '| --- | --- | --- |',
      ...result.checks.map((check) => `| ${check.label} | ${check.passed ? 'PASS' : 'FAIL'} | ${check.detail || ''} |`),
      '',
      result.consoleErrors.length > 0 ? '**控制台错误：**' : '**控制台错误：** 无',
      '',
      ...result.consoleErrors.map((error) => `- ${error}`),
      ''
    ]),
    '## 结论',
    '',
    report.passed
      ? '桌面和移动端首屏 smoke 通过，可以继续进入下一轮产品优化。'
      : '存在浏览器级 smoke 失败项，需要先修复页面渲染、点击或控制台错误。',
    ''
  ].join('\n');
}
