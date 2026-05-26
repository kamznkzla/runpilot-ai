'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * 生成每日 AI 跑步提示
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const today = new Date().toISOString().split('T')[0]

  // 检查今日是否已生成
  const cached = await db.collection('daily_tips')
    .where({ _openid: openid, date: today }).limit(1).get()

  if (cached.data.length > 0) {
    return { success: true, tip: cached.data[0].tip, cached: true }
  }

  // 获取用户上下文
  const user = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const plan = await db.collection('training_plans')
    .where({ _openid: openid, status: 'active' }).limit(1).get()

  const tips = generateTips(user.data[0], plan.data[0])
  const tip = tips[Math.floor(Math.random() * tips.length)]

  // 缓存
  await db.collection('daily_tips').add({
    data: { _openid: openid, date: today, tip, created_at: new Date().toISOString() }
  })

  return { success: true, tip }
}

function generateTips(user, plan) {
  const tips = [
    '每一次跑步，都是和自己的对话。坚持，你会发现更好的自己。',
    '跑步不只是锻炼身体，更是一次精神上的修行。',
    '慢一点没关系，重要的是你一直在路上。',
    '今天的汗水，是明天PB的基石。',
    '真正的对手只有一个人——昨天的自己。',
    '配速不重要，重要的是你迈出了第一步。',
    '跑步教会我们：痛苦是暂时的，成就是永恒的。',
    '休息也是训练的一部分，别忽视恢复日的重要性。',
    '记得补充水分，跑前跑后都要拉伸。',
    '倾听身体的声音，它比你更了解自己的极限。'
  ]

  if (plan) {
    const phaseTips = {
      base: ['基础期重点：建立有氧基础，不要急于提速。'],
      build: ['强化期来啦！每次强度训练都是一次突破的机会。'],
      race: ['竞赛期：专注于比赛配速的训练，模拟比赛节奏。'],
      taper: ['比赛周！减少训练量，保持状态，相信自己！']
    }
    const phase = plan.current_phase
    if (phaseTips[phase]) tips.push(...phaseTips[phase])
  }

  return tips
}
