export const ENDINGS = [
  {
    id: 'fired_performance',
    title: '试用期被优化',
    description: '绩效分归零，HR 用“组织需要更高密度的人才”把你送出公司。',
    condition: '绩效分降到 0。'
  },
  {
    id: 'hair_collapse',
    title: '身体垮掉主动离职',
    description: '发量值归零，体检报告比 OKR 更有说服力。',
    condition: '发量值降到 0。'
  },
  {
    id: 'quit_naked',
    title: '心态崩溃裸辞',
    description: '尊严值归零，你终于对着飞书输入“我不伺候了”。',
    condition: '尊严值降到 0。'
  },
  {
    id: 'home_rent',
    title: '交不起房租被迫回老家',
    description: '存款额见底，房东比老板更懂现金流管理。',
    condition: '存款额降到 0 或以下。'
  },
  {
    id: 'year_bonus',
    title: '撑到年底拿年终奖',
    description: '你挺过 90 天裁员潮，年终奖到账那一刻，工位都显得慈祥。',
    condition: '撑到第 90 天，绩效不低且身体还没崩。'
  },
  {
    id: 'reverse_promoted',
    title: '反向晋升为管理层',
    description: '你不但没被裁，还被提拔去裁别人。职场闭环完成。',
    condition: '第 90 天绩效 >= 90、尊严 >= 40、存款 >= 20000。'
  },
  {
    id: 'side_hustle_escape',
    title: '副业上岸体面离场',
    description: '副业收入超过工资后，你把离职申请写成了产品发布会。',
    condition: '第 90 天存款 >= 50000。'
  },
  {
    id: 'internal_transfer',
    title: '转岗成功继续拧螺丝',
    description: '你从一个坑跳到另一个坑，至少坑边配了新工牌。',
    condition: '保持中高尊严并触发转岗/内推路线。'
  },
  {
    id: 'n_plus_one',
    title: 'N+1 体面毕业',
    description: '你被优化，但赔偿到账，朋友圈文案写得像融资成功。',
    condition: 'HR 约谈中争取赔偿并安全离场。'
  },
  {
    id: 'ppt_partner',
    title: '上市敲钟合伙人',
    description: '你靠 PPT 把空气包装成战略，最后站到了敲钟照片第二排。',
    condition: 'PPT/汇报路线高频成功，且绩效维持高位。'
  },
  {
    id: 'silent_survivor',
    title: '沉默幸存者',
    description: '你没赢，也没输，只是在茶水间学会了更小声地呼吸。',
    condition: '撑到第 90 天但未达成特殊结局。'
  },
  {
    id: 'backpack_freelancer',
    title: '背包自由职业者',
    description: '你离开大厂，电脑还在，但会议提醒终于安静了。',
    condition: '副业和尊严都较高，选择自由职业路线。'
  }
];
