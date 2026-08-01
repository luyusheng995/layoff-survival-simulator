import { ENDINGS } from '../data/endings.js';

export function getEndingGallery(unlockedIds = [], previewUnlocked = false) {
  const unlockedSet = new Set(unlockedIds);
  return ENDINGS.map((ending) => {
    const unlocked = unlockedSet.has(ending.id);
    return {
      id: ending.id,
      title: unlocked ? ending.title : '未解锁结局',
      realTitle: ending.title,
      description: unlocked ? ending.description : '这条职业路径还藏在工牌背面。',
      condition: unlocked || previewUnlocked ? ending.condition : '看广告预览解锁条件',
      unlocked
    };
  });
}
