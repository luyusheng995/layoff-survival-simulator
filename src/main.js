import { ACTION_DEFS } from './game/constants.js';
import { applyAction } from './game/actions.js';
import { createInitialState, advanceDay, appendLog } from './game/state.js';
import { pickEvent, applyEventChoice } from './game/events.js';
import { getFailure, getFinalEnding } from './game/endings.js';
import { TALENTS } from './game/talents.js';
import { getEndingGallery } from './game/gallery.js';
import { createShareReport } from './game/report.js';
import { DIFFICULTIES, getDifficulty } from './game/difficulty.js';
import { createStatDeltas, getNextCheckpoint } from './game/feedback.js';
import { createOnboardingBrief } from './game/onboarding.js';
import { createFirstMinuteFunnel } from './game/funnel.js';
import { createAdInventoryItems } from './game/ad-inventory.js';
import { PUBLIC_PLAY_URL, createLaunchShareText, getLaunchNotes } from './game/launch.js';
import {
  AD_PLACEMENTS,
  activateDailyBuff,
  canUseRewardedAd,
  reviveFromAd,
  skipCrisisFromAd,
  unlockEndingPreview,
  unlockTalentPreview,
  watchRewardedAd
} from './game/ads.js';

const app = document.querySelector('#app');

let state = createInitialState();
let activeEvent = null;
let modal = null;
let busyAd = null;
let selectedTalentId = null;
let talentsUnlocked = false;
let endingPreviewUnlocked = false;
let selectedDifficultyId = 'normal';
let unlockedEndingIds = loadUnlockedEndings();
let lastFeedback = null;
let snapshotMode = false;
let onboardingDismissed = loadOnboardingDismissed();
let activeTab = 'home';

const statLabels = {
  performance: '绩效分',
  hair: '发量值',
  dignity: '尊严值',
  savings: '存款额',
  landmine: '埋雷指数'
};

const eventTypeLabels = {
  daily: '日常事件',
  crisis: '危机事件',
  opportunity: '机遇事件'
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function signed(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatEffects(effects) {
  return Object.entries(effects)
    .map(([key, value]) => `${statLabels[key] || key} ${signed(value)}`)
    .join(' / ');
}

function riskText() {
  if (state.hidden.landmine >= 80) return '锅快熟了';
  if (state.hidden.landmine >= 45) return '有锅味';
  return '风平浪静';
}

function difficultyLabel() {
  return getDifficulty(state.difficultyId).label;
}

function money(value) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`;
}

function safeStorage() {
  try {
    const key = '__layoff_storage_probe__';
    globalThis.localStorage.setItem(key, '1');
    globalThis.localStorage.removeItem(key);
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function loadUnlockedEndings() {
  const storage = safeStorage();
  if (!storage) return [];
  try {
    return JSON.parse(storage.getItem('layoffUnlockedEndings') || '[]');
  } catch {
    return [];
  }
}

function loadOnboardingDismissed() {
  const storage = safeStorage();
  if (!storage) return false;
  return storage.getItem('layoffOnboardingDismissed') === 'true';
}

function saveOnboardingDismissed() {
  onboardingDismissed = true;
  const storage = safeStorage();
  if (storage) {
    storage.setItem('layoffOnboardingDismissed', 'true');
  }
}

function saveUnlockedEnding(endingId) {
  if (!endingId || unlockedEndingIds.includes(endingId)) return;
  unlockedEndingIds = [...unlockedEndingIds, endingId];
  const storage = safeStorage();
  if (storage) {
    storage.setItem('layoffUnlockedEndings', JSON.stringify(unlockedEndingIds));
  }
}

function setFailureModal(ending) {
  saveUnlockedEnding(ending.id);
  snapshotMode = false;
  modal = {
    kind: 'failure',
    title: ending.title,
    description: ending.description,
    ending
  };
}

function setEndingModal(ending) {
  saveUnlockedEnding(ending.id);
  snapshotMode = false;
  modal = {
    kind: 'ending',
    title: ending.title,
    description: ending.description,
    ending
  };
}

function checkTerminalState() {
  const failure = getFailure(state);
  if (failure) {
    setFailureModal(failure);
    return;
  }

  const ending = getFinalEnding(state);
  if (ending) {
    setEndingModal(ending);
  }
}

function ensureEvent() {
  if (!modal && state.energy === 0 && !activeEvent) {
    activeEvent = pickEvent(state);
    state = {
      ...state,
      currentEventId: activeEvent.id
    };
  }
}

function renderStats() {
  const checkpoint = getNextCheckpoint(state.day);
  const funnel = createFirstMinuteFunnel(state, adContext());
  const stats = [
    ['performance', state.stats.performance],
    ['hair', state.stats.hair],
    ['dignity', state.stats.dignity],
    ['savings', money(state.stats.savings)],
    ['landmine', riskText()]
  ];

  return `
    <section class="topbar">
      <div class="title-row">
        <div class="hero-memo">
          <span class="memo-label">SURVIVAL DESK</span>
          <h1>大厂裁员生存模拟器</h1>
          <p class="subtitle">90 天裁员潮，每天 3 点精力，活到年底或反向晋升。</p>
        </div>
        <div class="day-pill">第 ${state.day} 天 · ${difficultyLabel()} · 精力 ${state.energy}/3</div>
      </div>
      <div class="funnel-brief">
        <span>今日工位简报</span>
        <strong>${escapeHtml(funnel.headline)}</strong>
        <small>${escapeHtml(funnel.summary)}</small>
      </div>
      <div class="stats-grid">
        ${stats.map(([key, value]) => `
          <div class="stat-tile">
            <span class="stat-label">${escapeHtml(statLabels[key])}</span>
            <span class="stat-value">${escapeHtml(value)}</span>
          </div>
        `).join('')}
      </div>
      <div class="status-strip">
        <div class="checkpoint-card ${escapeHtml(checkpoint.tone)}">
          <span>下一次组织校准</span>
          <strong>第 ${checkpoint.day} 天 · ${escapeHtml(checkpoint.label)}</strong>
          <small>${checkpoint.daysLeft === 0 ? '今天就要对齐名单' : `还有 ${checkpoint.daysLeft} 天`}</small>
        </div>
        ${renderFeedback()}
      </div>
    </section>
  `;
}

function renderRecommendedAd() {
  const funnel = createFirstMinuteFunnel(state, adContext());
  if (!funnel.primaryAd) return '';

  return `
    <section class="funnel-card">
      <div>
        <span class="funnel-kicker">今日救命广告</span>
        <h2>${escapeHtml(funnel.primaryAd.title)}</h2>
        <p>${escapeHtml(funnel.primaryAd.reason)}</p>
        <small>${escapeHtml(funnel.primaryAd.reward)}</small>
      </div>
      <button class="funnel-ad-button" data-ad="${escapeHtml(funnel.primaryAd.id)}">
        ${escapeHtml(funnel.primaryAd.buttonText)}
      </button>
    </section>
  `;
}

function renderLaunchStrip() {
  return `
    <section class="launch-strip">
      <div>
        <span class="launch-kicker">公开试玩链接</span>
        <strong>发给同事前，先确认自己能撑几天</strong>
        <small>${escapeHtml(PUBLIC_PLAY_URL)}</small>
      </div>
      <button class="launch-copy-button" data-copy-launch="true">复制试玩链接</button>
    </section>
  `;
}

function renderFeedback() {
  if (!lastFeedback) {
    return `
      <div class="feedback-card idle">
        <span>本轮变动</span>
        <strong>还没提交今日动作</strong>
        <small>每次选择后会显示数值涨跌。</small>
      </div>
    `;
  }

  const chips = lastFeedback.deltas.length > 0
    ? lastFeedback.deltas.map((item) => `<b class="${escapeHtml(item.tone)}">${escapeHtml(item.text)}</b>`).join('')
    : '<b class="neutral">暂无数值变化</b>';

  return `
    <div class="feedback-card">
      <span>本轮变动</span>
      <strong>${escapeHtml(lastFeedback.label)}</strong>
      <div class="feedback-chips">${chips}</div>
    </div>
  `;
}

function renderActions() {
  const disabled = state.energy <= 0 || Boolean(modal);
  const actionHint = disabled ? '处理公司事件后进入下一天' : '点一次扣 1 点，用完触发公司事件';
  return `
    <section class="panel ability-panel" aria-label="今日行动">
      <div class="panel-title-row">
        <h2>今日行动 <span class="inline-energy">${state.energy}/3</span></h2>
        <span>${actionHint}</span>
      </div>
      <div class="actions-grid">
        ${ACTION_DEFS.map((action) => `
          <button class="action-button" data-action="${escapeHtml(action.id)}" ${disabled ? 'disabled' : ''}>
            <span class="action-title">${escapeHtml(action.label)}</span>
            <span class="action-effect">${escapeHtml(formatEffects(action.effects))}</span>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderOnboarding() {
  const brief = createOnboardingBrief(state, {
    dismissed: onboardingDismissed,
    unlockedEndingCount: unlockedEndingIds.length
  });
  if (!brief.visible) return '';

  return `
    <section class="onboarding-panel">
      <div class="onboarding-head">
        <div>
          <span>首局留存样本</span>
          <h2>${escapeHtml(brief.title)}</h2>
          <p>${escapeHtml(brief.summary)}</p>
        </div>
        <button class="icon-button" data-dismiss-onboarding="true" title="收起入职待办">×</button>
      </div>
      <div class="onboarding-tasks">
        ${brief.tasks.map((task) => `
          <article class="onboarding-task ${task.completed ? 'done' : ''}">
            <b>${task.completed ? '已归档' : '待处理'}</b>
            <strong>${escapeHtml(task.label)}</strong>
            <small>${escapeHtml(task.detail)}</small>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderTalentPanel() {
  const canSelect = talentsUnlocked || state.talentsUnlocked;
  return `
    <section class="panel">
      <h2>初始天赋</h2>
      <p class="panel-note">${canSelect ? '选一个开局剧本，立刻重开生效。' : '看广告解锁 3 个初始天赋，本局先当普通打工人。'}</p>
      <div class="talent-grid">
        <button class="talent-card ${selectedTalentId ? '' : 'selected'}" data-talent="none">
          <span class="action-title">无天赋</span>
          <span class="action-effect">标准牛马开局，胜在真实。</span>
        </button>
        ${TALENTS.map((talent) => `
          <button class="talent-card ${selectedTalentId === talent.id ? 'selected' : ''}" data-talent="${escapeHtml(talent.id)}" ${canSelect ? '' : 'disabled'}>
            <span class="action-title">${escapeHtml(talent.label)}</span>
            <span class="action-effect">${escapeHtml(talent.description)}</span>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderDifficultyPanel() {
  return `
    <section class="panel">
      <h2>裁员强度</h2>
      <div class="talent-grid">
        ${DIFFICULTIES.map((difficulty) => `
          <button class="talent-card ${selectedDifficultyId === difficulty.id ? 'selected' : ''}" data-difficulty="${escapeHtml(difficulty.id)}">
            <span class="action-title">${escapeHtml(difficulty.label)}</span>
            <span class="action-effect">${escapeHtml(difficulty.description)}</span>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderEvent() {
  if (!activeEvent) {
    return `
      <section class="event-card">
        <span class="event-type">公司播报</span>
        <h2>今天还没结算</h2>
        <p>先把 3 点精力花完，命运才会开始刷新。你可以加班、摸鱼、向上管理、抱团站队，或者搞点副业回血。</p>
      </section>
    `;
  }

  const skipAvailability = canUseRewardedAd(state, 'skipCrisis', adContext());
  return `
    <section class="event-card">
      <span class="event-type">${escapeHtml(eventTypeLabels[activeEvent.type])}</span>
      <h2>${escapeHtml(activeEvent.title)}</h2>
      <p>${escapeHtml(activeEvent.body)}</p>
      <div class="choices-grid">
        ${activeEvent.choices.map((choice) => `
          <button class="choice-button" data-choice="${escapeHtml(choice.id)}">
            <span class="choice-title">${escapeHtml(choice.label)}</span>
            <span class="choice-effect">${escapeHtml(formatEffects(choice.effects))}</span>
          </button>
        `).join('')}
        ${skipAvailability.ok ? renderInlineAdButton('skipCrisis') : ''}
      </div>
    </section>
  `;
}

function renderAds() {
  const recommendedAd = createFirstMinuteFunnel(state, adContext()).primaryAd?.id;
  const inventoryItems = createAdInventoryItems(state, adContext(), { featuredAdId: recommendedAd });
  return `
    <section class="panel">
      <h2>广告库存</h2>
      <p class="panel-note">左侧只推一个最该看的模拟 30 秒激励视频，这里保留完整库存。</p>
      <div class="ad-placement-list">
        ${inventoryItems.map(renderAdPlacement).join('')}
      </div>
    </section>
  `;
}

function renderLaunchNotes() {
  return `
    <section class="panel launch-notes">
      <h2>上线记录</h2>
      <div class="launch-note-list">
        ${getLaunchNotes().map((note) => `
          <article class="launch-note">
            <span>${escapeHtml(note.version)}</span>
            <strong>${escapeHtml(note.label)}</strong>
            <small>${escapeHtml(note.detail)}</small>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderAdPlacement(item) {
  const dataAttr = item.actionable ? `data-ad="${escapeHtml(item.id)}"` : '';
  const disabled = item.actionable ? '' : 'disabled';
  return `
    <button class="ad-placement ${item.available ? 'available' : 'locked'} ${item.featured ? 'recommended' : ''}" ${dataAttr} ${disabled}>
      <span class="ad-placement-kicker">${escapeHtml(item.title)} · 已看 ${item.watched} 次${item.featured ? ' · 左侧推荐中' : ''}</span>
      <strong>${escapeHtml(item.featured ? '左侧已推荐' : item.buttonText)}</strong>
      <small>${escapeHtml(item.statusText)}</small>
    </button>
  `;
}

function renderInlineAdButton(placementId) {
  const availability = canUseRewardedAd(state, placementId, adContext());
  if (!availability.ok) return '';
  const placement = availability.placement;
  return `
    <button class="ad-button crisis-ad" data-ad="${escapeHtml(placement.id)}">
      <span class="choice-title">${escapeHtml(placement.buttonText)}</span>
      <span class="choice-effect">${escapeHtml(placement.reward)}</span>
    </button>
  `;
}

function renderEndingGallery() {
  const gallery = getEndingGallery(unlockedEndingIds, state.endingPreviewUnlocked || endingPreviewUnlocked);
  return `
    <section class="panel">
      <h2>结局图鉴</h2>
      <div class="ending-gallery">
        ${gallery.map((ending) => `
          <article class="ending-item ${ending.unlocked ? 'unlocked' : 'locked'}">
            <span class="ending-status">${ending.unlocked ? '已解锁' : '未解锁'}</span>
            <strong>${escapeHtml(ending.title)}</strong>
            <p>${escapeHtml(ending.unlocked ? ending.description : ending.condition)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderLogs() {
  return `
    <section class="log-panel">
      <h2>工位小票</h2>
      <ol class="log-list">
        ${state.logs.map((log) => `<li>${escapeHtml(log)}</li>`).join('')}
      </ol>
    </section>
  `;
}

function clampPercent(value, max = 100) {
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function renderMobileStatus() {
  return `
    <header class="mobile-status">
      <div class="account-avatar" aria-label="账号头像">
        <span>企</span>
      </div>
      <div class="work-brief" aria-label="工位档案">
        <span class="work-kicker">工位档案</span>
        <strong>大厂裁员生存模拟器</strong>
        <small>普通员工 · ${difficultyLabel()} · 撑过 90 天</small>
        <div class="header-actions">
          <span class="balance-chip">存款 ${money(state.stats.savings)}</span>
          <button class="status-copy-button" data-copy-launch="true">公开试玩链接</button>
        </div>
      </div>
      <div class="week-clock">
        <strong>第 ${Math.ceil(state.day / 7)} 周</strong>
        <span>${String(9 + ((state.day - 1) % 8)).padStart(2, '0')}:00</span>
      </div>
    </header>
  `;
}

function renderCharacterCard() {
  const selectedTalent = TALENTS.find((talent) => talent.id === selectedTalentId);
  const profileStats = [
    ['绩效', state.stats.performance],
    ['存款', money(state.stats.savings)],
    ['发量', state.stats.hair],
    ['压力', riskText()]
  ];

  return `
    <section class="character-card" aria-label="工位档案">
      <div class="avatar-mark" aria-hidden="true">
        <span>HR</span>
      </div>
      <div class="character-copy">
        <span class="card-kicker">工位档案</span>
        <h1>大厂裁员生存模拟器</h1>
        <p>裁员季生存档 · ${difficultyLabel()}</p>
        <b>${escapeHtml(selectedTalent?.label || '普通员工 Lv1')}</b>
      </div>
      <div class="profile-grid">
        ${profileStats.map(([label, value]) => `
          <span>
            <strong>${escapeHtml(value)}</strong>
            <small>${escapeHtml(label)}</small>
          </span>
        `).join('')}
      </div>
    </section>
  `;
}

function renderMobileMission() {
  const brief = createOnboardingBrief(state, {
    dismissed: onboardingDismissed,
    unlockedEndingCount: unlockedEndingIds.length
  });
  const funnel = createFirstMinuteFunnel(state, adContext());
  const missionTitle = activeEvent ? activeEvent.title : (brief.visible ? brief.title : funnel.headline);
  const missionMeta = activeEvent
    ? `精力用完 · ${eventTypeLabels[activeEvent.type]} · 第 ${state.day} 天`
    : `第 ${state.day} 天 · ${difficultyLabel()} · ${funnel.stage}`;
  const missionBody = activeEvent
    ? activeEvent.body
    : (brief.visible ? brief.summary : funnel.summary);

  return `
    <section class="mission-card" aria-label="当前任务">
      <div class="mission-head">
        <div>
          <span>当前任务</span>
          <h2>${escapeHtml(missionTitle)}</h2>
        </div>
        <b>${state.dailyBuffs?.slackSafe ? '今日 Buff' : (state.energy > 0 ? '稳定' : '结算')}</b>
      </div>
      <p class="mission-meta">${escapeHtml(missionMeta)}</p>
      <p>${escapeHtml(missionBody)}</p>
      ${state.logs[0] ? `<div class="mission-feedback">${escapeHtml(state.logs[0])}</div>` : ''}
      ${activeEvent ? renderMobileChoices() : renderMobileChecklist(brief, funnel)}
    </section>
  `;
}

function renderMobileChoices() {
  const skipAvailability = canUseRewardedAd(state, 'skipCrisis', adContext());
  return `
    <div class="choices-grid">
      ${activeEvent.choices.map((choice) => `
        <button class="choice-button" data-choice="${escapeHtml(choice.id)}">
          <span class="choice-title">${escapeHtml(choice.label)}</span>
          <span class="choice-effect">${escapeHtml(formatEffects(choice.effects))}</span>
        </button>
      `).join('')}
      ${skipAvailability.ok ? renderInlineAdButton('skipCrisis') : ''}
    </div>
  `;
}

function renderMobileChecklist(brief, funnel) {
  const tasks = brief.visible ? brief.tasks : [
    { id: 'daily-brief', label: funnel.primaryAd?.title || '处理 1 个事项', completed: false },
    { id: 'fans', label: funnel.primaryAd?.reward || '攒够下一次组织校准资源', completed: false },
    { id: 'actions', label: '完成 3 次行动', completed: state.energy === 0 },
    { id: 'checkpoint', label: `等到第 ${getNextCheckpoint(state.day).day} 天校准`, completed: false }
  ];

  return `
    <div class="mission-actions">
      ${funnel.primaryAd ? `
        <button class="funnel-ad-button" data-ad="${escapeHtml(funnel.primaryAd.id)}">
          ${escapeHtml(funnel.primaryAd.buttonText)}
        </button>
      ` : ''}
      <div class="task-chip-grid">
        ${tasks.slice(0, 4).map((task) => `
          <span class="${task.completed ? 'done' : ''}">
            <i aria-hidden="true"></i>
            ${escapeHtml(task.label)}
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAbilityBars() {
  const abilities = [
    ['绩效', state.stats.performance, '#b42318'],
    ['发量', state.stats.hair, '#2563eb'],
    ['尊严', state.stats.dignity, '#28c78f'],
    ['存款', Math.min(150, Math.round(state.stats.savings / 200)), '#c88719'],
    ['埋雷', state.hidden.landmine, '#dc2626']
  ];

  return `
    <section class="growth-strip" aria-label="成长状态">
      ${abilities.map(([label, value, color]) => `
        <span>
          <b>${escapeHtml(label)}</b>
          <strong>${escapeHtml(value)}/100</strong>
          <i style="--bar-color: ${escapeHtml(color)}; --bar-width: ${clampPercent(value)}%"></i>
        </span>
      `).join('')}
    </section>
  `;
}

function renderHomeTab() {
  return `
    <main class="dashboard-home ${activeEvent ? 'event-mode' : ''}">
      ${activeEvent ? renderMobileMission() : renderActions()}
      ${renderAbilityBars()}
    </main>
  `;
}

function renderTabHeader(title, detail) {
  return `
    <header class="tab-page-header">
      <span>${escapeHtml(title)}</span>
      <p>${escapeHtml(detail)}</p>
    </header>
  `;
}

function renderSecondaryTabPanel() {
  const panels = {
    strategy: `${renderTabHeader('策略', '调整难度和初始天赋，下一局开局时生效。')}${renderDifficultyPanel()}${renderTalentPanel()}`,
    resources: `${renderTabHeader('补给', '广告奖励是可选续命手段，不影响基础操作。')}${renderAds()}${renderLaunchStrip()}`,
    records: `${renderTabHeader('记录', '查看最近工位小票、已解锁结局和上线记录。')}${renderLogs()}${renderEndingGallery()}${renderLaunchNotes()}${renderFeedback()}`
  };

  return `
    <main class="secondary-tab-panel">
      ${panels[activeTab] || panels.strategy}
    </main>
  `;
}

function renderBottomNav() {
  const tabs = [
    ['home', '主页'],
    ['strategy', '策略'],
    ['resources', '补给'],
    ['records', '记录']
  ];

  return `
    <nav class="bottom-nav" aria-label="底部导航">
      ${tabs.map(([id, label]) => `
        <button data-tab="${id}" class="${activeTab === id ? 'active' : ''}" aria-current="${activeTab === id ? 'page' : 'false'}">
          ${label}
        </button>
      `).join('')}
    </nav>
  `;
}

function renderModal() {
  if (!modal) return '';

  const reviveAvailability = canUseRewardedAd(state, 'revive', adContext());
  const reviveButton = modal.kind === 'failure' && reviveAvailability.ok
    ? `<button class="primary-button" data-ad="revive">${escapeHtml(reviveAvailability.placement.buttonText)}</button>`
    : '';
  const report = modal.ending ? createShareReport(state, modal.ending) : null;

  return `
    <div class="modal-backdrop ${snapshotMode ? 'snapshot-backdrop' : ''}" role="dialog" aria-modal="true">
      <section class="modal ${snapshotMode ? 'snapshot-modal' : ''}">
        <h2>${escapeHtml(modal.title)}</h2>
        ${snapshotMode ? '' : `<p>${escapeHtml(modal.description)}</p>`}
        ${report ? renderShareCard(report) : ''}
        ${state.endingPreviewUnlocked || endingPreviewUnlocked ? '<p class="good-text">隐藏结局提示：高绩效、高存款、尊严不归零，有机会反向晋升。</p>' : ''}
        <div class="modal-actions">
          ${reviveButton}
          ${report ? '<button class="primary-button copy-button" data-copy-report="true">复制报告文案</button>' : ''}
          ${report ? `<button class="primary-button ghost-button" data-snapshot-toggle="true">${snapshotMode ? '退出截图模式' : '截图模式'}</button>` : ''}
          <button class="primary-button" data-restart="true">重新开局</button>
        </div>
      </section>
    </div>
  `;
}

function renderShareCard(report) {
  return `
    <section class="share-card">
      <div class="report-stamp">HR REVIEW</div>
      <span class="event-type">打工人报告</span>
      <h3>${escapeHtml(report.shareHeadline)}</h3>
      <p class="tier-line">${escapeHtml(report.survivalTier)} · ${escapeHtml(report.endingDescription)}</p>
      <div class="share-badges">
        ${report.shareBadges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join('')}
      </div>
      <div class="share-grid">
        <span><strong>${report.daysSurvived}</strong><small>存活天数</small></span>
        <span><strong>${report.maxPerformance}</strong><small>最高绩效</small></span>
        <span><strong>${report.hairLost}</strong><small>掉发总量</small></span>
        <span><strong>¥${escapeHtml(report.finalSavings.toLocaleString('zh-CN'))}</strong><small>最终存款</small></span>
        <span><strong>${report.revivesUsed}</strong><small>复活次数</small></span>
        <span><strong>${report.adsWatched}</strong><small>广告次数</small></span>
      </div>
      <p>${escapeHtml(report.diagnosis)}</p>
      <small class="poster-code">${escapeHtml(report.posterCode)}</small>
    </section>
  `;
}

function render() {
  ensureEvent();
  app.innerHTML = `
    <div class="game-shell">
      ${renderMobileStatus()}
      ${activeTab === 'home' ? renderHomeTab() : renderSecondaryTabPanel()}
      ${renderBottomNav()}
    </div>
    ${renderModal()}
    ${renderAdOverlay()}
  `;
}

function renderAdOverlay() {
  if (!busyAd) return '';
  const placement = AD_PLACEMENTS.find((item) => item.id === busyAd);
  return `
    <div class="ad-overlay" role="status" aria-live="polite">
      <section class="ad-player">
        <span>Rewarded video</span>
        <h2>${escapeHtml(placement?.title || '激励视频')}</h2>
        <p>${escapeHtml(placement?.reward || '奖励结算中')}</p>
        <div class="ad-progress"><i></i></div>
        <small>开发版快速模拟 30 秒广告，马上回到工位。</small>
      </section>
    </div>
  `;
}

function handleAction(actionId) {
  try {
    const before = state;
    state = applyAction(state, actionId);
    setFeedback(before, `已执行：${ACTION_DEFS.find((item) => item.id === actionId)?.label || '今日动作'}`);
    checkTerminalState();
    render();
  } catch (error) {
    state = appendLog(state, error.message);
    render();
  }
}

function handleChoice(choiceId) {
  if (!activeEvent) return;
  const before = state;
  const eventTitle = activeEvent.title;
  state = applyEventChoice(state, activeEvent.id, choiceId);
  setFeedback(before, `事件结算：${eventTitle}`);
  activeEvent = null;
  checkTerminalState();
  render();
}

async function handleAd(placement) {
  if (busyAd) return;
  const availability = canUseRewardedAd(state, placement, adContext());
  if (!availability.ok) {
    state = appendLog(state, availability.reason);
    render();
    return;
  }
  busyAd = placement;
  const before = state;
  render();
  await watchRewardedAd(placement);

  if (placement === 'dailyBuff') {
    state = activateDailyBuff(state);
  }
  if (placement === 'talentUnlock') {
    talentsUnlocked = true;
    state = unlockTalentPreview(state);
  }
  if (placement === 'endingPreview') {
    endingPreviewUnlocked = true;
    state = unlockEndingPreview(state);
  }
  if (placement === 'skipCrisis' && activeEvent?.type === 'crisis') {
    state = advanceDay(skipCrisisFromAd(state));
    activeEvent = null;
    checkTerminalState();
  }
  if (placement === 'revive') {
    state = reviveFromAd(state);
    modal = null;
    activeEvent = null;
  }

  busyAd = null;
  setFeedback(before, adFeedbackLabel(placement));
  render();
}

function adContext() {
  return {
    activeEventType: activeEvent?.type || null,
    modalKind: modal?.kind || null,
    busyAd
  };
}

function setFeedback(beforeState, label) {
  lastFeedback = {
    label,
    deltas: createStatDeltas(beforeState, state)
  };
}

function adFeedbackLabel(placement) {
  const labels = {
    dailyBuff: '广告奖励：今日摸鱼 Buff',
    talentUnlock: '广告奖励：天赋预览',
    endingPreview: '广告奖励：结局提示',
    skipCrisis: '广告奖励：跳过危机',
    revive: '广告奖励：复活续命'
  };
  return labels[placement] || '广告奖励';
}

function restart() {
  state = {
    ...createInitialState({ selectedTalentId, difficultyId: selectedDifficultyId }),
    talentsUnlocked,
    endingPreviewUnlocked
  };
  activeEvent = null;
  modal = null;
  busyAd = null;
  lastFeedback = null;
  snapshotMode = false;
  render();
}

async function copyReport() {
  if (!modal?.ending) return;
  const report = createShareReport(state, modal.ending);
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard unavailable');
    }
    await navigator.clipboard.writeText(report.shareText);
    state = appendLog(state, '打工人报告已复制，适合发给同样还没下班的人。');
  } catch {
    state = appendLog(state, '当前浏览器不支持自动复制，请直接截图这张报告。');
  }
  render();
}

async function copyLaunchLink() {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard unavailable');
    }
    await navigator.clipboard.writeText(createLaunchShareText());
    state = appendLog(state, '公开试玩链接已复制，适合发给还在开会的人。');
  } catch {
    state = appendLog(state, `当前浏览器不支持自动复制，请手动复制：${PUBLIC_PLAY_URL}`);
  }
  render();
}

function selectTalent(talentId) {
  selectedTalentId = talentId === 'none' ? null : talentId;
  restart();
}

function selectDifficulty(difficultyId) {
  selectedDifficultyId = difficultyId;
  restart();
}

function toggleSnapshotMode() {
  snapshotMode = !snapshotMode;
  render();
}

function dismissOnboarding() {
  saveOnboardingDismissed();
  render();
}

app.addEventListener('click', (event) => {
  const tabButton = event.target.closest('[data-tab]');
  const actionButton = event.target.closest('[data-action]');
  const choiceButton = event.target.closest('[data-choice]');
  const adButton = event.target.closest('[data-ad]');
  const talentButton = event.target.closest('[data-talent]');
  const difficultyButton = event.target.closest('[data-difficulty]');
  const restartButton = event.target.closest('[data-restart]');
  const copyButton = event.target.closest('[data-copy-report]');
  const launchCopyButton = event.target.closest('[data-copy-launch]');
  const snapshotButton = event.target.closest('[data-snapshot-toggle]');
  const onboardingButton = event.target.closest('[data-dismiss-onboarding]');

  if (tabButton) {
    activeTab = tabButton.dataset.tab;
    render();
    return;
  }
  if (actionButton) handleAction(actionButton.dataset.action);
  if (choiceButton) handleChoice(choiceButton.dataset.choice);
  if (adButton) handleAd(adButton.dataset.ad);
  if (talentButton) selectTalent(talentButton.dataset.talent);
  if (difficultyButton) selectDifficulty(difficultyButton.dataset.difficulty);
  if (restartButton) restart();
  if (copyButton) copyReport();
  if (launchCopyButton) copyLaunchLink();
  if (snapshotButton) toggleSnapshotMode();
  if (onboardingButton) dismissOnboarding();
});

render();
