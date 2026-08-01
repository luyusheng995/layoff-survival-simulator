# M8 Rewarded Ad Loop Design

## Goal

Turn rewarded-video buttons into a complete monetization loop that is clear to players, measurable in simulation/reporting, and easy to replace with a real ad SDK later.

## Design

- Add a centralized rewarded placement catalog for the five monetization triggers:
  - `revive`
  - `dailyBuff`
  - `talentUnlock`
  - `endingPreview`
  - `skipCrisis`
- Add placement availability checks so UI buttons can explain why a reward is available or locked.
- Track placement-level ad counts in state metrics, not only total ads watched.
- Make `watchRewardedAd` return placement metadata. It remains a fast mock implementation, but models a 30-second rewarded video.
- Upgrade the ad panel into a placement list with reward descriptions, availability status, and per-placement usage count.
- Show an ad overlay while a video is being simulated.

## Acceptance Criteria

- Tests prove all five placement definitions exist.
- Tests prove placement-level ad counts are recorded.
- Tests prove crisis skip availability depends on active crisis context and one-use limit.
- Tests prove mocked rewarded ads return placement metadata.
- UI renders placement descriptions, lock reasons, usage counts, and a playing overlay.
