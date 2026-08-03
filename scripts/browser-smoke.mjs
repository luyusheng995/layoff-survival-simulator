import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import {
  createBrowserSmokeMarkdown,
  createBrowserSmokeReport,
  createGameplayEventTypeCheckExpression,
  shouldStartLocalSmokeServer
} from '../src/game/browser-smoke-report.js';

const root = new URL('../', import.meta.url);
const appUrl = process.env.SMOKE_URL || 'http://127.0.0.1:4173/';
const screenshotDir = new URL('../docs/qa/screenshots/', import.meta.url);
const reportPath = new URL('../docs/qa/m17-browser-smoke-report.md', import.meta.url);
const viewports = [
  { id: 'desktop', width: 1366, height: 900 },
  { id: 'mobile', width: 390, height: 844, mobile: true }
];

async function main() {
  const browserPath = findBrowserPath();
  if (!browserPath) {
    console.error('No Chromium browser found. Install Microsoft Edge or set BROWSER_PATH.');
    process.exit(1);
  }

  await mkdir(screenshotDir, { recursive: true });

  let serverProcess = null;
  if (shouldStartLocalSmokeServer(appUrl) && !(await isReachable(appUrl))) {
    serverProcess = spawn(process.execPath, ['scripts/server.mjs'], {
      cwd: new URL('../', import.meta.url),
      stdio: 'ignore',
      windowsHide: true
    });
    await waitForUrl(appUrl, 10000);
  }

  const debugPort = await getFreePort();
  const profileDir = await mkdtemp(join(tmpdir(), 'layoff-browser-smoke-'));
  const browserProcess = spawn(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], {
    stdio: 'ignore',
    windowsHide: true
  });

  try {
    await waitForUrl(`http://127.0.0.1:${debugPort}/json/version`, 10000);
    const results = [];
    for (const viewport of viewports) {
      results.push(await runViewportSmoke(debugPort, viewport));
    }
    const report = createBrowserSmokeReport(results, { url: appUrl, generatedAt: new Date().toISOString() });
    await writeFile(reportPath, createBrowserSmokeMarkdown(report), 'utf8');

    if (!report.passed) {
      console.error('Browser smoke failed.');
      console.error(createBrowserSmokeMarkdown(report));
      process.exit(1);
    }

    console.log(`Browser smoke passed: ${report.results.length} viewports, ${report.totalChecks} checks.`);
  } finally {
    await terminateProcess(browserProcess);
    if (serverProcess) await terminateProcess(serverProcess);
    await cleanupProfile(profileDir);
  }
}

async function runViewportSmoke(debugPort, viewport) {
  const target = await createTarget(debugPort);
  const client = await CdpClient.connect(target.webSocketDebuggerUrl);
  const consoleErrors = [];
  const checks = [];
  const screenshot = `docs/qa/screenshots/m17-${viewport.id}.png`;

  client.on('Runtime.exceptionThrown', (event) => {
    consoleErrors.push(event.exceptionDetails?.text || 'Runtime exception');
  });
  client.on('Log.entryAdded', (event) => {
    if (event.entry?.level === 'error') {
      consoleErrors.push(event.entry.text);
    }
  });

  try {
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Log.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.mobile ? 2 : 1,
      mobile: Boolean(viewport.mobile)
    });
    await client.send('Page.navigate', { url: appUrl });
    await client.waitFor('Page.loadEventFired', 10000);
    await sleep(400);

    checks.push(await textCheck(client, '首屏标题', '大厂裁员生存模拟器'));
    checks.push(await textCheck(client, '工位档案', '工位档案'));
    checks.push(await textCheck(client, '员工编号', 'DS-'));
    checks.push(await textCheck(client, '存款总数', '存款 ¥5,000'));
    checks.push(await textCheck(client, '上线分享', '公开试玩链接'));
    checks.push(await textCheck(client, '行动区', '今日行动'));
    checks.push(await textCheck(client, '行动说明', '点一次扣 1 点'));
    checks.push(await textCheck(client, '茶水间传闻', '茶水间'));
    checks.push(await textCheck(client, '工位称号', '工位称号'));
    checks.push(await textCheck(client, '老板凝视值', '老板凝视'));
    checks.push(await expressionCheck(
      client,
      '无横向溢出',
      'document.documentElement.scrollWidth <= window.innerWidth + 1',
      `${viewport.width}x${viewport.height}`
    ));
    checks.push(await expressionCheck(
      client,
      '移动端无上下滚动',
      'document.documentElement.scrollHeight <= window.innerHeight + 1',
      `${viewport.width}x${viewport.height}`
    ));
    checks.push(await expressionCheck(
      client,
      '底部导航',
      'Boolean(document.querySelector(`[data-tab="home"]`)) && Boolean(document.querySelector(`[data-tab="strategy"]`)) && Boolean(document.querySelector(`[data-tab="resources"]`)) && Boolean(document.querySelector(`[data-tab="records"]`))',
      '主页、策略、补给、记录标签存在'
    ));
    checks.push(await expressionCheck(
      client,
      '主要按钮可点击',
      'document.querySelectorAll("[data-action]").length >= 5 && Boolean(document.querySelector(".inline-energy")) && !document.body.innerText.includes("消耗 1" + " 精力")',
      '5 个行动按钮存在，精力显示在今日行动旁'
    ));
    checks.push(await expressionCheck(
      client,
      '行动属性可见',
      'Array.from(document.querySelectorAll("[data-action]")).every((button) => /[+-]\\d/.test(button.innerText))',
      '每张行动卡展示加减属性'
    ));
    checks.push(await expressionCheck(
      client,
      '头像在左周次在右',
      '(() => { const avatar = document.querySelector(".account-avatar")?.getBoundingClientRect(); const brief = document.querySelector(".work-brief")?.getBoundingClientRect(); const clock = document.querySelector(".week-clock")?.getBoundingClientRect(); return Boolean(avatar && brief && clock && avatar.left < brief.left && brief.left < clock.left); })()',
      '顶部头像位在左，周次时间在右'
    ));
    checks.push(await expressionCheck(
      client,
      '顶部内容分布均衡',
      '(() => { const header = document.querySelector(".mobile-status")?.getBoundingClientRect(); const cluster = document.querySelector(".identity-cluster")?.getBoundingClientRect(); const clock = document.querySelector(".week-clock")?.getBoundingClientRect(); return Boolean(header && cluster && clock && cluster.left - header.left >= 12 && clock.left - cluster.right <= 20 && header.right - clock.right >= 8); })()',
      '头像和标题组成账号区，右侧时间旁没有大段空白'
    ));
    checks.push(await expressionCheck(
      client,
      '档案信息整体居中且更宽',
      '(() => { const header = document.querySelector(".mobile-status")?.getBoundingClientRect(); const avatar = document.querySelector(".account-avatar")?.getBoundingClientRect(); const brief = document.querySelector(".work-brief")?.getBoundingClientRect(); const kicker = document.querySelector(".work-brief .work-kicker"); const title = document.querySelector(".work-brief strong"); const meta = document.querySelector(".work-brief small"); const actions = document.querySelector(".header-actions"); return Boolean(header && avatar && brief && kicker && title && meta && actions && avatar.left - header.left <= 48 && brief.width >= 205 && getComputedStyle(kicker).textAlign === "center" && getComputedStyle(title).textAlign === "center" && getComputedStyle(meta).textAlign === "center" && getComputedStyle(actions).justifyContent === "center"); })()',
      '工位档案、游戏名、员工说明、存款和链接都在档案区域居中'
    ));
    checks.push(await expressionCheck(
      client,
      '首页不抢推广告',
      'document.querySelectorAll("[data-ad=\\"dailyBuff\\"]").length === 0',
      '每日 Buff 已移到补给页'
    ));
    checks.push(await expressionCheck(
      client,
      '复制试玩链接入口',
      'Boolean(document.querySelector("[data-copy-launch]"))',
      '公开试玩链接有复制按钮'
    ));

    await client.evaluate(`
      (async () => {
        for (const id of ['slack_off', 'slack_off', 'slack_off']) {
          document.querySelector('[data-action="' + id + '"]').click();
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
      })()
    `);
    await sleep(300);

    checks.push(await textCheck(client, '摸鱼彩蛋', '厕所隔间战略会议'));
    checks.push(await textCheck(client, '精力用完提示', '精力用完'));
    checks.push(await textCheck(client, '企业通知样式', '企业通知'));
    checks.push(await textCheck(client, '组织风险提示', '组织风险'));
    checks.push(await expressionCheck(
      client,
      '企业微信气泡',
      '(() => { const nudge = document.querySelector(".wechat-nudge"); return Boolean(nudge && /(企业微信|HRBP|直属领导)/.test(nudge.innerText)); })()',
      '事件来源气泡展示企业微信、HRBP 或直属领导提示'
    ));
    checks.push(await expressionCheck(
      client,
      '首个事件出现',
      createGameplayEventTypeCheckExpression(),
      '包含日常、危机或机遇事件类型'
    ));

    const image = await client.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    await writeFile(new URL(`../${screenshot}`, import.meta.url), Buffer.from(image.data, 'base64'));
  } finally {
    client.close();
    await closeTarget(debugPort, target.id);
  }

  return {
    id: viewport.id,
    viewport: { width: viewport.width, height: viewport.height },
    passed: checks.every((check) => check.passed) && consoleErrors.length === 0,
    checks,
    consoleErrors,
    screenshot
  };
}

async function textCheck(client, label, text) {
  return expressionCheck(
    client,
    label,
    `document.body && document.body.innerText.includes(${JSON.stringify(text)})`,
    `包含文本：${text}`
  );
}

async function expressionCheck(client, label, expression, detail) {
  const result = await client.evaluate(expression);
  return { label, passed: Boolean(result), detail };
}

async function createTarget(debugPort) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Failed to create CDP target: ${response.status}`);
  return response.json();
}

async function closeTarget(debugPort, targetId) {
  await fetch(`http://127.0.0.1:${debugPort}/json/close/${targetId}`).catch(() => {});
}

class CdpClient {
  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      const client = new CdpClient(ws);
      ws.addEventListener('open', () => resolve(client), { once: true });
      ws.addEventListener('error', () => reject(new Error('CDP WebSocket failed')), { once: true });
    });
  }

  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', (message) => this.handleMessage(message));
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(payload);
    });
  }

  evaluate(expression) {
    return this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    }).then((result) => result.result?.value);
  }

  waitFor(method, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      const handler = (params) => {
        clearTimeout(timer);
        this.off(method, handler);
        resolve(params);
      };
      this.on(method, handler);
    });
  }

  on(method, handler) {
    const handlers = this.listeners.get(method) || [];
    handlers.push(handler);
    this.listeners.set(method, handlers);
  }

  off(method, handler) {
    const handlers = this.listeners.get(method) || [];
    this.listeners.set(method, handlers.filter((item) => item !== handler));
  }

  close() {
    this.ws.close();
  }

  handleMessage(message) {
    const data = JSON.parse(message.data);
    if (data.id && this.pending.has(data.id)) {
      const pending = this.pending.get(data.id);
      this.pending.delete(data.id);
      if (data.error) {
        pending.reject(new Error(data.error.message));
      } else {
        pending.resolve(data.result || {});
      }
      return;
    }

    for (const handler of this.listeners.get(data.method) || []) {
      handler(data.params || {});
    }
  }
}

function findBrowserPath() {
  const candidates = [
    process.env.BROWSER_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}

async function isReachable(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForUrl(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isReachable(url)) return;
    await sleep(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
    server.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function terminateProcess(processHandle) {
  return new Promise((resolve) => {
    if (!processHandle || processHandle.exitCode !== null) {
      resolve();
      return;
    }

    const forceTimer = setTimeout(() => {
      processHandle.kill('SIGKILL');
    }, 2500);
    const giveUpTimer = setTimeout(resolve, 5000);
    processHandle.once('exit', () => {
      clearTimeout(forceTimer);
      clearTimeout(giveUpTimer);
      resolve();
    });
    processHandle.kill();
  });
}

async function cleanupProfile(profileDir) {
  if (!resolve(profileDir).startsWith(resolve(tmpdir()))) {
    return;
  }

  const cleanupRetryableErrors = new Set(['EBUSY', 'EPERM', 'ENOTEMPTY']);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await rm(profileDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 200 });
      return;
    } catch (error) {
      if (!cleanupRetryableErrors.has(error.code)) {
        throw error;
      }
      if (attempt === 5) {
        console.warn(`Skipped browser profile cleanup after repeated ${error.code}: ${profileDir}`);
        return;
      }
      await sleep(300 * (attempt + 1));
    }
  }
}

await main();
