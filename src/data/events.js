const BASE_EVENTS = [
  {
    id: 'daily_sync_001',
    type: 'daily',
    title: '晨会对齐',
    body: '老板说今天只同步 10 分钟，结果大家用一小时证明自己没有闲着。',
    weight: 10,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'align_harder', label: '主动补充三点风险', effects: { performance: 4, dignity: -3 }, feedback: '你把空气说成了风险闭环，老板点了点头。' },
      { id: 'camera_off', label: '关麦点头装在线', effects: { hair: 3, performance: -3 }, feedback: '你活下来了，但会议纪要没有你的名字。' }
    ]
  },
  {
    id: 'daily_weekly_002',
    type: 'daily',
    title: '周报美化',
    body: '本周没有产出，但周报模板还有很多形容词。',
    weight: 10,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'inflate', label: '把延期写成长期主义', effects: { performance: 3, landmine: 5 }, feedback: '老板转发了，但埋雷指数也懂了。' },
      { id: 'honest', label: '如实写卡点', effects: { dignity: 4, performance: -2 }, feedback: '你保住了灵魂，失去了一点存在感。' }
    ]
  },
  {
    id: 'daily_toilet_003',
    type: 'daily',
    title: '带薪拉屎',
    body: '洗手间隔间里，所有工位压力都变成了短视频推荐。',
    weight: 9,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'scroll', label: '刷到腿麻再回去', effects: { dignity: 5, performance: -3 }, feedback: '你获得了短暂自由，也获得了未读红点。' },
      { id: 'quick', label: '三分钟极限返岗', effects: { performance: 2, hair: -2 }, feedback: '效率很高，人不像人。' }
    ]
  },
  {
    id: 'daily_tea_004',
    type: 'daily',
    title: '下午茶拼单',
    body: '奶茶群里没人说话，但每个人都在等第一个人发起拼单。',
    weight: 8,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'join', label: '点大杯续命', effects: { hair: 2, savings: -28 }, feedback: '糖分救了你一小时，钱包骂了你一句。' },
      { id: 'skip', label: '喝公司免费热水', effects: { savings: 20, dignity: -2 }, feedback: '你赢了现金流，输了人生质感。' }
    ]
  },
  {
    id: 'daily_change_005',
    type: 'daily',
    title: '需求第七版',
    body: '产品说这次改动很小，只是把南改成北，把生改成死。',
    weight: 9,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'accept', label: '含泪接住', effects: { performance: 4, hair: -5 }, feedback: '你证明了交付能力，也证明了头皮脆弱。' },
      { id: 'pushback', label: '要求排期重评', effects: { dignity: 4, landmine: 4 }, feedback: '你说了人话，对方记了仇。' }
    ]
  },
  {
    id: 'daily_okrs_006',
    type: 'daily',
    title: 'OKR 自评',
    body: '你需要在“有挑战”与“没完成”之间找到一种体面的表达。',
    weight: 8,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'stretch', label: '写成战略探索', effects: { performance: 3, dignity: -3 }, feedback: '这不是没做完，这是组织资产沉淀中。' },
      { id: 'lowkey', label: '承认目标过大', effects: { dignity: 3, performance: -4 }, feedback: '诚实是一种美德，也是一种绩效风险。' }
    ]
  },
  {
    id: 'daily_ppt_007',
    type: 'daily',
    title: 'PPT 字体战争',
    body: '领导觉得方案不错，但标题不够有冲击力。',
    weight: 6,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'polish', label: '熬夜调字距', effects: { performance: 4, hair: -4 }, feedback: '字体终于会呼吸了，你快不会了。' },
      { id: 'template', label: '套去年模板', effects: { hair: 2, landmine: 3 }, feedback: '历史经验复用成功，历史问题也复用了。' }
    ]
  },
  {
    id: 'daily_boss_laugh_008',
    type: 'daily',
    title: '老板讲冷笑话',
    body: '会议室温度下降 3 度，所有人开始竞争谁笑得更像预算充足。',
    weight: 8,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'laugh', label: '抢先大笑', effects: { performance: 2, dignity: -4 }, feedback: '你笑出了晋升通道的回声。' },
      { id: 'mute', label: '假装网络卡顿', effects: { dignity: 3, performance: -2 }, feedback: '你保住了表情管理，丢了一点向上可见度。' }
    ]
  },
  {
    id: 'daily_late_009',
    type: 'daily',
    title: '迟到 4 分钟',
    body: '打卡机比业务指标更准时。',
    weight: 7,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'explain', label: '解释地铁故障', effects: { dignity: -2, performance: -2 }, feedback: '没人听，但制度听见了。' },
      { id: 'work_late', label: '晚上补回来', effects: { performance: 3, hair: -3 }, feedback: '你用夜晚偿还了早晨。' }
    ]
  },
  {
    id: 'daily_code_review_010',
    type: 'daily',
    title: '代码评审',
    body: '同事留了 37 条评论，其中 20 条关于命名，17 条关于人生。',
    weight: 8,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'fix_all', label: '全部改完', effects: { performance: 4, hair: -4 }, feedback: '代码变优雅了，你变安静了。' },
      { id: 'argue', label: '逐条反驳', effects: { dignity: 4, landmine: 6 }, feedback: '你赢了讨论，输了关系缓存。' }
    ]
  },
  {
    id: 'daily_aircon_011',
    type: 'daily',
    title: '空调温度大战',
    body: '有人调到 18 度，有人披上公司文化衫。',
    weight: 6,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'endure', label: '忍着继续干', effects: { performance: 2, hair: -2 }, feedback: '你像服务器一样稳定，也像服务器一样发热。' },
      { id: 'negotiate', label: '发起温度投票', effects: { dignity: 3, landmine: 2 }, feedback: '民主来了，群聊也炸了。' }
    ]
  },
  {
    id: 'daily_allhands_012',
    type: 'daily',
    title: '全员会',
    body: 'CEO 说寒气传递给每个人，但背景板写着长期主义。',
    weight: 7,
    minDay: 5,
    maxDay: 90,
    choices: [
      { id: 'believe', label: '选择相信', effects: { dignity: -3, performance: 3 }, feedback: '信念增长了，理性休假了。' },
      { id: 'resume', label: '偷偷更新简历', effects: { dignity: 3, performance: -2 }, feedback: '你的简历比战略更先动起来。' }
    ]
  },
  {
    id: 'daily_mentor_013',
    type: 'daily',
    title: '导师关怀',
    body: '导师说年轻人要主动承担，然后把他的活转给了你。',
    weight: 7,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'take', label: '接住导师的锅', effects: { performance: 3, hair: -4 }, feedback: '你成长了，导师轻松了。' },
      { id: 'decline', label: '说自己排期满了', effects: { dignity: 4, landmine: 5 }, feedback: '你保护了边界，也留下了案底。' }
    ]
  },
  {
    id: 'daily_hr_survey_014',
    type: 'daily',
    title: '敬业度调研',
    body: '匿名问卷要求你登录工号填写。',
    weight: 7,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'perfect', label: '全选非常满意', effects: { performance: 2, dignity: -4 }, feedback: '系统显示你非常幸福。你本人没有。' },
      { id: 'truth', label: '认真反馈问题', effects: { dignity: 4, landmine: 5 }, feedback: '匿名系统露出了实名的微笑。' }
    ]
  },
  {
    id: 'daily_expense_015',
    type: 'daily',
    title: '报销被打回',
    body: '财务说发票抬头少了一个括号，资本市场不能承受这种风险。',
    weight: 6,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'refile', label: '重新提交', effects: { savings: 300, hair: -2 }, feedback: '钱回来了，头发走了。' },
      { id: 'giveup', label: '算了当买教训', effects: { dignity: -2, savings: -120 }, feedback: '公司又完成了一次成本优化。' }
    ]
  },
  {
    id: 'daily_im_016',
    type: 'daily',
    title: '午夜消息',
    body: '老板凌晨 1 点发来“醒了回一下”，像一种企业级梦游。',
    weight: 8,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'reply', label: '秒回收到', effects: { performance: 4, hair: -5 }, feedback: '你不是睡眠浅，你是组织响应快。' },
      { id: 'ignore', label: '装睡到早上', effects: { hair: 4, performance: -3 }, feedback: '你保住了睡眠，消息保住了截图。' }
    ]
  },
  {
    id: 'daily_refactor_017',
    type: 'daily',
    title: '祖传系统重构',
    body: '没人知道这段代码为什么能跑，大家只知道它不能停。',
    weight: 6,
    minDay: 10,
    maxDay: 90,
    choices: [
      { id: 'touch', label: '勇敢重构', effects: { performance: 5, landmine: 7 }, feedback: '你动了系统，也动了祖宗。' },
      { id: 'wrap', label: '外面再套一层', effects: { performance: 2, hair: -2 }, feedback: '技术债没有消失，只是穿上了新外套。' }
    ]
  },
  {
    id: 'daily_one_on_one_018',
    type: 'daily',
    title: '1v1 谈心',
    body: '老板问你最近有什么困难，表情像在收集证据。',
    weight: 7,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'positive', label: '表达积极拥抱变化', effects: { performance: 3, dignity: -3 }, feedback: '你拥抱了变化，变化拍了拍你的背。' },
      { id: 'real', label: '说人手不够', effects: { dignity: 4, landmine: 5 }, feedback: '老板记下了问题，也记下了你。' }
    ]
  },
  {
    id: 'daily_hotfix_019',
    type: 'daily',
    title: '周五小修',
    body: '“就改一行”通常是周末事故的开场白。',
    weight: 7,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'merge', label: '直接合并', effects: { performance: 3, landmine: 6 }, feedback: '速度很快，命运更快。' },
      { id: 'delay', label: '坚持下周发', effects: { dignity: 3, performance: -2 }, feedback: '你挡住了风险，也挡住了老板的笑容。' }
    ]
  },
  {
    id: 'daily_lunch_020',
    type: 'daily',
    title: '午饭站队',
    body: '去哪个桌吃饭，决定了你今天会听到哪种版本的组织真相。',
    weight: 6,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'boss_table', label: '坐领导旁边', effects: { performance: 3, dignity: -3 }, feedback: '你吃的是饭，也是职场烟雾弹。' },
      { id: 'peer_table', label: '坐同事旁边', effects: { dignity: 3, landmine: -3 }, feedback: '你听到了八卦，也获得了避险地图。' }
    ]
  },
  {
    id: 'daily_training_021',
    type: 'daily',
    title: '企业文化培训',
    body: '讲师说公司是家，你想起家里不会要求日报。',
    weight: 6,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'clap', label: '积极鼓掌', effects: { performance: 2, dignity: -3 }, feedback: '掌声很响，内心静音。' },
      { id: 'notes', label: '记下黑话素材', effects: { dignity: 3, savings: 100 }, feedback: '你把痛苦沉淀成了副业选题。' }
    ]
  },
  {
    id: 'crisis_outage_001',
    type: 'crisis',
    title: '线上故障背锅',
    body: '报警响了，群里安静了，所有人的头像都在等一个替罪羊。',
    weight: 4,
    minDay: 5,
    maxDay: 90,
    choices: [
      { id: 'own', label: '主动背锅救团队', effects: { performance: -12, dignity: -8, landmine: -12 }, feedback: '你保住了团队，团队未必保住你。' },
      { id: 'trace', label: '甩出日志链路', effects: { performance: 5, landmine: 12 }, feedback: '证据很硬，关系很脆。' },
      { id: 'silent', label: '假装还在排查', effects: { performance: -6, hair: -8 }, feedback: '沉默没有解决问题，只延长了折磨。' }
    ]
  },
  {
    id: 'crisis_hr_002',
    type: 'crisis',
    title: 'HR 约谈优化',
    body: 'HR 说只是聊聊，你发现会议室已经放好了纸巾。',
    weight: 4,
    minDay: 20,
    maxDay: 90,
    choices: [
      { id: 'argue_law', label: '搬出劳动法', effects: { savings: 3000, dignity: 5, performance: -10 }, feedback: '你争取到了钱，也被标记为不好谈。' },
      { id: 'soft', label: '保持体面', effects: { dignity: -8, savings: 1200, landmine: -8 }, feedback: '体面像公司福利，听起来有，拿到少。' },
      { id: 'record', label: '偷偷录音', effects: { dignity: 4, landmine: 10 }, feedback: '安全感上升，风险也上升。' }
    ]
  },
  {
    id: 'crisis_reorg_003',
    type: 'crisis',
    title: '组织架构调整',
    body: '群名改了，老板换了，只有需求没有少。',
    weight: 4,
    minDay: 15,
    maxDay: 90,
    choices: [
      { id: 'new_boss', label: '立刻拜码头', effects: { performance: 6, dignity: -8, landmine: -5 }, feedback: '你适应得很快，自己也有点陌生。' },
      { id: 'observe', label: '先观望风向', effects: { hair: 4, performance: -5 }, feedback: '你没有站错队，因为你还没站上去。' },
      { id: 'old_friend', label: '找老领导打听', effects: { landmine: -10, dignity: -2 }, feedback: '情报到账，人情欠款。' }
    ]
  },
  {
    id: 'crisis_budget_004',
    type: 'crisis',
    title: '项目预算被砍',
    body: '财务说降本增效，翻译过来就是你们自己想办法。',
    weight: 4,
    minDay: 10,
    maxDay: 90,
    choices: [
      { id: 'free_labor', label: '自己加班补缺口', effects: { performance: 5, hair: -12 }, feedback: '预算省下来了，省的是你。' },
      { id: 'cut_scope', label: '砍需求保命', effects: { dignity: 4, performance: -8 }, feedback: '你保护了团队，也减少了汇报亮点。' },
      { id: 'vendor', label: '甩给供应商', effects: { performance: 3, landmine: 14 }, feedback: '锅暂时飞出去了，回旋镖正在路上。' }
    ]
  },
  {
    id: 'crisis_check_005',
    type: 'crisis',
    title: '老板突击查岗',
    body: '你正在摸鱼，老板突然出现在工位后方，像一个低配版命运。',
    weight: 4,
    minDay: 1,
    maxDay: 90,
    choices: [
      { id: 'switch', label: '秒切工作页面', effects: { hair: -4, landmine: 6 }, feedback: '手速救了你，心率没有。' },
      { id: 'explain_research', label: '说在做竞品调研', effects: { performance: 2, dignity: -6 }, feedback: '短视频也可以是行业洞察，只要你敢说。' },
      { id: 'admit', label: '承认休息 5 分钟', effects: { dignity: 5, performance: -8 }, feedback: '诚实令人尊敬，也令人危险。' }
    ]
  },
  {
    id: 'crisis_blame_006',
    type: 'crisis',
    title: '跨部门甩锅',
    body: '对方部门在群里 @ 你，说“这个之前不是你们确认的吗”。',
    weight: 4,
    minDay: 8,
    maxDay: 90,
    choices: [
      { id: 'screenshot', label: '甩出聊天截图', effects: { performance: 4, landmine: 10 }, feedback: '真相大白，仇恨也大白。' },
      { id: 'take_offline', label: '拉小群私聊', effects: { dignity: -3, landmine: -8 }, feedback: '你把战争搬进了会议室。' },
      { id: 'eat_it', label: '先认再说', effects: { performance: -10, hair: -5 }, feedback: '锅很重，你背得很专业。' }
    ]
  },
  {
    id: 'opportunity_referral_001',
    type: 'opportunity',
    title: '拿到内推 Offer',
    body: '前同事在新公司活得像个人，还问你要不要过去看看。',
    weight: 2,
    minDay: 12,
    maxDay: 90,
    choices: [
      { id: 'interview', label: '请假去面试', effects: { dignity: 8, performance: -6, savings: 2000 }, feedback: '外面的世界递来一根网线。' },
      { id: 'wait', label: '先苟住年终奖', effects: { performance: 3, dignity: -3 }, feedback: '你选择相信奖金池，勇气很大。' }
    ]
  },
  {
    id: 'opportunity_side_002',
    type: 'opportunity',
    title: '副业爆单',
    body: '你随手发的职场吐槽模板突然有人下单，互联网终于反向打钱。',
    weight: 2,
    minDay: 10,
    maxDay: 90,
    choices: [
      { id: 'take_orders', label: '通宵接单', effects: { savings: 6000, hair: -10, performance: -3 }, feedback: '现金流起飞，发际线迫降。' },
      { id: 'limit', label: '控制接单量', effects: { savings: 2500, dignity: 4 }, feedback: '你第一次像老板一样管理自己。' }
    ]
  },
  {
    id: 'opportunity_boss_003',
    type: 'opportunity',
    title: '抱上领导大腿',
    body: '大老板突然夸你“有主人翁意识”，空气里飘来晋升和风险的混合气味。',
    weight: 2,
    minDay: 25,
    maxDay: 90,
    choices: [
      { id: 'commit', label: '主动认领重点项目', effects: { performance: 12, hair: -8, dignity: -5 }, feedback: '你离聚光灯更近，也离锅更近。' },
      { id: 'humble', label: '低调感谢不接活', effects: { dignity: 5, landmine: -5 }, feedback: '你闪开了机会，也闪开了危险。' },
      { id: 'ppt', label: '连夜做战略 PPT', effects: { performance: 8, savings: -300, hair: -4 }, feedback: 'PPT 很丝滑，人生很卡顿。' }
    ]
  }
];

const dailyTopics = [
  ['daily_alpha_001', '飞书红点通胀', '未读消息像股票泡沫，没人知道哪一条真正重要。', '逐条清零', '假装没看见'],
  ['daily_alpha_002', '需求评审补位', '产品临时拉你进会，说“你听一下就行”。', '当场给方案', '只负责微笑'],
  ['daily_alpha_003', '工位植物枯了', '绿萝比你更早意识到这层楼缺氧。', '浇水续命', '拍照发朋友圈'],
  ['daily_alpha_004', '绩效校准传闻', '茶水间说本季度强制分布，空气瞬间开始裁员。', '找老板探口风', '继续装不知道'],
  ['daily_alpha_005', '会议室抢不到', '重要会议只能挤在开放区，商业机密和咖啡机共享声场。', '站着开完', '改成异步文档'],
  ['daily_alpha_006', '日报格式升级', '原本三行的日报，现在要写背景、动作、风险、复盘。', '认真补齐', '复制昨天微调'],
  ['daily_alpha_007', '老板朋友圈点赞', '老板凌晨发长期主义小作文，你看见同事已经点了一排赞。', '立刻点赞', '保持沉默'],
  ['daily_alpha_008', '内网卡顿', '系统加载转圈，像公司战略一样有耐心。', '截图报 IT', '趁机摸鱼'],
  ['daily_alpha_009', '新人请教', '新人问这个流程为什么这样，你突然发现没人知道。', '耐心解释', '发他旧文档'],
  ['daily_alpha_010', '团建报名', '周末团建打着自愿旗号，表格已经默认全选。', '积极报名', '找理由缺席'],
  ['daily_alpha_011', '老板要金句', '方案没问题，但老板觉得缺一句能上墙的话。', '连夜包装', '坚持说人话'],
  ['daily_alpha_012', '群接龙午餐', '一个午餐接龙，让团队协作能力原形毕露。', '主动统计', '只填自己'],
  ['daily_alpha_013', '文档权限地狱', '你点开链接，看见“申请访问权限”六个大字。', '挨个申请', '让对方截图'],
  ['daily_alpha_014', '临时改会', '会议从 3 点改到 4 点，再改到现在。', '马上上线', '说在冲刺'],
  ['daily_alpha_015', 'OKR 中期复盘', '目标没变，解释目标的方式变了三轮。', '重写口径', '承认偏差'],
  ['daily_alpha_016', '代码冻结前夜', '越接近冻结，越有人想塞最后一个小需求。', '帮忙合入', '挡回需求'],
  ['daily_alpha_017', '茶水间情报', '咖啡机旁边的信息密度高过公司公告。', '驻场吃瓜', '快速撤离'],
  ['daily_alpha_018', '设备申请被拒', '你申请显示器，行政回复“请提高现有资源使用效率”。', '继续申请', '用小屏硬扛'],
  ['daily_alpha_019', '知识库考古', '唯一能解释系统的文档停留在三年前。', '补一版新文档', '祈祷它能跑'],
  ['daily_alpha_020', '老板临时 Demo', '老板说客户想看看，客户其实还没约。', '做个假门面', '要求明确范围'],
  ['daily_alpha_021', '同事离职请客', '对方说去追求生活，你听见了自由的回声。', '真诚祝福', '暗中问坑位'],
  ['daily_alpha_022', '竞品分析', '领导让你拆竞品，最好拆出自家没做错。', '写成优势', '写出真问题'],
  ['daily_alpha_023', '报表口径争议', '同一个数字，三个部门算出四种人生。', '统一口径', '选择沉默'],
  ['daily_alpha_024', '绩效自夸训练', '你需要把普通完成写成关键突破。', '大胆包装', '朴素表达'],
  ['daily_alpha_025', '会议纪要背刺', '纪要里多了一项你的待办，你确信会上没人提过。', '认领推进', '当场澄清'],
  ['daily_alpha_026', '企业微信头像', '老板建议大家换统一头像，像一种轻量级宣誓。', '马上更换', '继续原图'],
  ['daily_alpha_027', '周末值班排班', '排班表像命运转盘，指针停在你的名字上。', '接受安排', '交换班次'],
  ['daily_alpha_028', '客户突然拉群', '客户把老板、老板的老板和你拉进一个群。', '快速响应', '私聊求救'],
  ['daily_alpha_029', '午休被打断', '你刚闭眼，群里有人 @ 全员。', '立刻回复', '醒了再说'],
  ['daily_alpha_030', '工牌消磁', '门禁不认你，比组织架构更诚实。', '找行政处理', '蹭别人进门'],
  ['daily_alpha_031', '复盘大会', '事故不大，复盘文档很大。', '主动总结', '降低存在感'],
  ['daily_alpha_032', '老板借人', '隔壁项目缺人，你被短期支援，短期通常没有期限。', '去支援', '强调本职排期'],
  ['daily_alpha_033', '降本小妙招', '行政取消纸巾，号召大家培养主人翁意识。', '自带纸巾', '公开吐槽'],
  ['daily_alpha_034', '跨时区会议', '海外同事方便了，你的睡眠不方便了。', '准时参加', '申请录屏'],
  ['daily_alpha_035', '战略改名', '项目名字换了，代码目录没换，锅的路径也没换。', '更新全套材料', '只改标题']
];

const crisisTopics = [
  ['crisis_alpha_001', '大老板空降评审', '本来是小会，大老板突然进来，所有人的背都直了。'],
  ['crisis_alpha_002', '裁员名单乌龙', '共享表格短暂暴露了一个神秘名单，你的名字像加载过。'],
  ['crisis_alpha_003', '客户投诉升级', '客户把“不满意”抄送到了你没见过的领导层级。'],
  ['crisis_alpha_004', '数据口径翻车', '昨天汇报的增长，今天被证明是埋点重复。'],
  ['crisis_alpha_005', '安全审计点名', '审计发现权限过大，系统发现你名字很大。'],
  ['crisis_alpha_006', '老板情绪暴跌', '老板开会全程没笑，比事故报警更吓人。'],
  ['crisis_alpha_007', '版本回滚', '上线 20 分钟后回滚，群里每个句号都很重。'],
  ['crisis_alpha_008', '预算冻结', '采购、招聘、团建一起进入冬眠，只有需求还醒着。'],
  ['crisis_alpha_009', '竞业警告', '副业账号被同事刷到，评论区比 HR 先到。'],
  ['crisis_alpha_010', '核心同事跑路', '最懂系统的人离职了，留下你和一堆没有注释的遗产。']
];

const opportunityTopics = [
  ['opportunity_alpha_001', '行业大会露脸', '你被安排上台分享，台下坐着猎头和前同事。'],
  ['opportunity_alpha_002', '老同学创业招人', '老同学说不画饼，只给期权和自由。听起来像另一种饼。'],
  ['opportunity_alpha_003', '股票突然解套', '账户终于不是绿色，资本主义短暂亲了你一口。'],
  ['opportunity_alpha_004', '老板缺汇报材料', '老板急需一份能救场的 PPT，而你刚好会糊墙。'],
  ['opportunity_alpha_005', '副业客户续约', '客户说下月继续合作，你第一次觉得甲方像亲人。']
];

const productionDailyScenes = [
  ['灰度发布', '按钮只对 5% 用户开放，但 100% 的锅都朝你开放。'],
  ['大促复盘', '增长曲线像过山车，老板只看见最高点。'],
  ['需求池清理', '需求没有死亡，只是换了个优先级继续活着。'],
  ['数据看板巡检', '每个指标都在讲故事，有的故事涉嫌诈骗。'],
  ['新人转正答辩', '新人讲成长，你想起自己也曾经相信成长。'],
  ['供应商对齐', '对方说“明天一定给”，像极了你说“马上好”。'],
  ['老板公开课', '主题是组织韧性，听众是快断的人。'],
  ['工单堆积', '用户的问题排成队，像下班前的电梯。'],
  ['竞品截图流转', '群里突然出现竞品新功能，所有人开始假装早就知道。'],
  ['流程审批绕路', '一个小权限走了七个节点，比你的职业路径还清晰。'],
  ['会议录屏补课', '你错过了会，却没有错过会后新增的待办。'],
  ['职级校准预热', '职级表像星座运势，每个人都能从里面读到焦虑。']
];

const productionDailyBeats = [
  ['补充口径', '顺手补一版老板爱看的解释。', '主动出方案', '先保护边界'],
  ['临时加塞', '有人说只占你十分钟，命运开始冷笑。', '接下加塞', '排到下周'],
  ['群里点名', '一个 @ 让你从摸鱼模式切回人类模式。', '秒回收到', '装作在路上'],
  ['文档补洞', '知识库缺的不是内容，是有人愿意背债。', '补齐文档', '只贴旧链接'],
  ['口径统一', '大家终于同意先统一“统一”的定义。', '拉会对齐', '发异步评论'],
  ['领导路过', '屏幕上的内容突然决定你的职场命运。', '展示进展', '切到日报'],
  ['午后低电量', '咖啡因和责任感都接近红线。', '硬撑推进', '战术摸鱼']
];

const productionCrisisScenes = [
  ['权限误删', '你点错了一个配置，半个部门开始体验数字游牧。'],
  ['核心指标暴跌', '看板从绿色变红，老板从人类变成日程邀请。'],
  ['客户群爆炸', '客户一句“你们是不是没人管”，群里立刻出现了所有领导。'],
  ['审计邮件点名', '邮件标题带着【紧急】，正文带着你的名字。'],
  ['大促压测失败', '压测没压住系统，倒是压住了你的心率。'],
  ['离职交接断档', '前同事留下的文档只有一句“后续优化”。'],
  ['舆情截图扩散', '用户吐槽被转进公司大群，像一场公开处刑。'],
  ['老板越级追问', '你还没同步直属领导，大老板已经在问为什么。']
];

const productionCrisisBeats = [
  ['紧急止血', '所有人都说先恢复，没人说恢复谁的人生。'],
  ['责任复盘', '会议室里没有凶手，只有等待被命名的负责人。'],
  ['口径封口', '对外说体验波动，对内说今晚别睡。']
];

const productionOpportunityScenes = [
  ['猎头突然问候', '对方说不是群发，还准确叫出了你的技术栈。'],
  ['副业文章出圈', '你吐槽管理学的文章，被管理层转发学习。'],
  ['老项目意外翻红', '一个快被砍的功能突然带来新增，像职场诈尸。'],
  ['大老板要样板', '你的项目被拿去当标杆，虽然昨天还没人关心。'],
  ['期权窗口打开', '财务发来行权提醒，你第一次认真看税。'],
  ['内推名额释放', '朋友说他们组缺人，要求是会干活且还像个人。']
];

const productionOpportunityBeats = [
  ['抓住窗口', '机会来得不响，但足够让工位安静三秒。'],
  ['稳住现金', '你决定先把机会换成能付房租的东西。']
];

const productionDailyTopics = productionDailyScenes.flatMap(([scene, body], sceneIndex) => (
  productionDailyBeats.map(([suffix, detail, firstLabel, secondLabel], beatIndex) => [
    `daily_prod_${String(sceneIndex * productionDailyBeats.length + beatIndex + 1).padStart(3, '0')}`,
    `${scene}：${suffix}`,
    `${body}${detail}`,
    firstLabel,
    secondLabel
  ])
));

const productionCrisisTopics = productionCrisisScenes.flatMap(([scene, body], sceneIndex) => (
  productionCrisisBeats.map(([suffix, detail], beatIndex) => [
    `crisis_prod_${String(sceneIndex * productionCrisisBeats.length + beatIndex + 1).padStart(3, '0')}`,
    `${scene}：${suffix}`,
    `${body}${detail}`
  ])
));

const productionOpportunityTopics = productionOpportunityScenes.flatMap(([scene, body], sceneIndex) => (
  productionOpportunityBeats.map(([suffix, detail], beatIndex) => [
    `opportunity_prod_${String(sceneIndex * productionOpportunityBeats.length + beatIndex + 1).padStart(3, '0')}`,
    `${scene}：${suffix}`,
    `${body}${detail}`
  ])
));

function makeDailyEvent([id, title, body, firstLabel, secondLabel], index) {
  const reporting = index % 5 === 0;
  return {
    id,
    type: 'daily',
    title,
    body,
    weight: 7,
    minDay: 1 + (index % 10),
    maxDay: 90,
    choices: [
      {
        id: 'push',
        label: firstLabel,
        effects: { performance: 3 + (index % 3), hair: -2 - (index % 2), landmine: reporting ? 2 : 0 },
        feedback: '你把问题推进了一点，也把自己往前推了一点。',
        tags: reporting ? ['reporting'] : []
      },
      {
        id: 'protect',
        label: secondLabel,
        effects: { dignity: 3 + (index % 3), performance: -2 - (index % 2) },
        feedback: '你保住了一点人味，绩效系统表示已记录。'
      }
    ]
  };
}

function makeCrisisEvent([id, title, body], index) {
  return {
    id,
    type: 'crisis',
    title,
    body,
    weight: 4,
    minDay: 8 + (index % 20),
    maxDay: 90,
    choices: [
      {
        id: 'take_hit',
        label: '先扛下来',
        effects: { performance: -8 - (index % 5), hair: -5, landmine: -6 },
        feedback: '你挡住了第一波冲击，身体替组织付了款。'
      },
      {
        id: 'fight_back',
        label: '证据反打',
        effects: { performance: 4, dignity: 4, landmine: 9 + (index % 4) },
        feedback: '你把事实摊开了，也把仇恨摊开了。'
      },
      {
        id: 'manage_story',
        label: '包装成阶段复盘',
        effects: { performance: 5, dignity: -6, landmine: 4 },
        feedback: '危机没有消失，只是换了个更体面的标题。',
        tags: ['ppt', 'reporting']
      }
    ]
  };
}

function makeOpportunityEvent([id, title, body], index) {
  return {
    id,
    type: 'opportunity',
    title,
    body,
    weight: 7,
    minDay: 12 + (index % 25),
    maxDay: 90,
    choices: [
      {
        id: 'grab',
        label: '用力抓住',
        effects: { performance: 7 + index, hair: -4, dignity: -2 },
        feedback: '机会确实来了，只是附带了加班条款。'
      },
      {
        id: 'cash_out',
        label: '转化成现金流',
        effects: { savings: 2200 + index * 600, hair: -3 },
        feedback: '这次不是画饼，是账户余额真的动了。'
      }
    ]
  };
}

const ALPHA_DAILY_EVENTS = dailyTopics.map(makeDailyEvent);
const ALPHA_CRISIS_EVENTS = crisisTopics.map(makeCrisisEvent);
const ALPHA_OPPORTUNITY_EVENTS = opportunityTopics.map(makeOpportunityEvent);
const PRODUCTION_DAILY_EVENTS = productionDailyTopics.map((topic, index) => makeDailyEvent(topic, index + dailyTopics.length));
const PRODUCTION_CRISIS_EVENTS = productionCrisisTopics.map((topic, index) => makeCrisisEvent(topic, index + crisisTopics.length));
const PRODUCTION_OPPORTUNITY_EVENTS = productionOpportunityTopics.map((topic, index) => makeOpportunityEvent(topic, index + opportunityTopics.length));

export const EVENTS = [
  ...BASE_EVENTS,
  ...ALPHA_DAILY_EVENTS,
  ...ALPHA_CRISIS_EVENTS,
  ...ALPHA_OPPORTUNITY_EVENTS,
  ...PRODUCTION_DAILY_EVENTS,
  ...PRODUCTION_CRISIS_EVENTS,
  ...PRODUCTION_OPPORTUNITY_EVENTS
];
