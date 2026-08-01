import { AD_PLACEMENTS, canUseRewardedAd } from './ads.js';

const SIDE_INVENTORY_IDS = ['dailyBuff', 'talentUnlock', 'endingPreview'];

export function createAdInventoryItems(state, context = {}, options = {}) {
  const featuredAdId = options.featuredAdId || null;
  return AD_PLACEMENTS
    .filter((placement) => SIDE_INVENTORY_IDS.includes(placement.id))
    .map((placement) => {
      const availability = canUseRewardedAd(state, placement.id, context);
      const featured = placement.id === featuredAdId;
      const available = availability.ok;
      const watched = state.metrics?.adPlacements?.[placement.id] || 0;

      return {
        id: placement.id,
        title: placement.title,
        buttonText: placement.buttonText,
        reward: placement.reward,
        watched,
        featured,
        available,
        actionable: available && !featured,
        statusText: getStatusText(placement, availability, featured)
      };
    });
}

function getStatusText(placement, availability, featured) {
  if (featured) {
    return '左侧推荐中，先看那一张就够了';
  }
  if (!availability.ok) {
    return availability.reason;
  }
  return placement.reward;
}
