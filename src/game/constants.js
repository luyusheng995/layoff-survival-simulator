export const MAX_DAY = 90;
export const DAILY_ENERGY = 3;

export const STAT_LIMITS = {
  performance: { initial: 60, min: 0, max: 100 },
  hair: { initial: 80, min: 0, max: 100 },
  dignity: { initial: 70, min: 0, max: 100 },
  savings: { initial: 5000, min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY }
};

export const ACTION_DEFS = [
  {
    id: 'overtime',
    label: '加班干活',
    cost: 1,
    effects: { performance: 8, hair: -6, landmine: -2 },
    hint: '绩效上去，头顶下去'
  },
  {
    id: 'slack_off',
    label: '摸鱼划水',
    cost: 1,
    effects: { performance: -5, hair: 5, dignity: 6 },
    hint: '人活过来，KPI 暗下去'
  },
  {
    id: 'manage_up',
    label: '向上管理',
    cost: 1,
    effects: { performance: 6, dignity: -6, landmine: 4 },
    hint: '汇报漂亮，灵魂打折'
  },
  {
    id: 'alliance',
    label: '抱团站队',
    cost: 1,
    effects: { dignity: -3, landmine: -8, performance: 2 },
    hint: '少背锅，多吃瓜'
  },
  {
    id: 'side_hustle',
    label: '副业赚钱',
    cost: 1,
    effects: { savings: 800, hair: -5, performance: -2 },
    hint: '钱包喘气，身体报警'
  }
];

export const CORE_STAT_KEYS = ['performance', 'hair', 'dignity', 'savings'];
