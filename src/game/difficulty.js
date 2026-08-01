export const DIFFICULTIES = [
  {
    id: 'normal',
    label: '普通牛马',
    description: '看起来还能苟，其实每 30 天都要被校准。',
    evaluationMultiplier: 1,
    crisisMultiplier: 1
  },
  {
    id: 'hard',
    label: '绩效背锅人',
    description: '你不是在工作，你是在替组织承担不确定性。',
    evaluationMultiplier: 1.35,
    crisisMultiplier: 1.35
  },
  {
    id: 'nightmare',
    label: '裁员重灾区',
    description: '每个会议邀请都像 HR 的预告片。',
    evaluationMultiplier: 1.75,
    crisisMultiplier: 1.7
  }
];

export function getDifficulty(id = 'normal') {
  return DIFFICULTIES.find((difficulty) => difficulty.id === id) || DIFFICULTIES[0];
}
