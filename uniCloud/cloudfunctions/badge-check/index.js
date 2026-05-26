'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * 成就徽章检查云函数
 * 检查用户是否满足成就条件并颁发徽章
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const allLogs = await db.collection('training_logs')
      .where({ _openid: openid, completion_status: 'done' })
      .orderBy('workout_date', 'asc')
      .get()

    const allAchievements = await db.collection('achievements').get()
    const userAchievements = await db.collection('user_achievements')
      .where({ _openid: openid }).get()

    const earnedIds = new Set(userAchievements.data.map(a => a.achievement_id))
    const newBadges = []

    for (const ach of allAchievements.data) {
      if (earnedIds.has(ach._id)) continue

      const earned = checkCondition(ach, allLogs.data)
      if (earned) {
        await db.collection('user_achievements').add({
          data: {
            _openid: openid,
            achievement_id: ach._id,
            unlocked_at: new Date().toISOString(),
            seen: false
          }
        })
        newBadges.push({ _id: ach._id, name: ach.name, rarity: ach.rarity, icon_url: ach.icon_url })
      }
    }

    return { success: true, earnedBadges: newBadges }
  } catch (err) {
    console.error('badge-check error:', err)
    return { success: false, errMsg: err.message }
  }
}

function checkCondition(achievement, logs) {
  const cond = achievement.condition
  if (!cond) return false

  switch (cond.field) {
    case 'actual_distance_km':
      const maxDist = Math.max(...logs.map(l => l.actual_distance_km || 0))
      return cond.operator === 'gte' ? maxDist >= cond.value : maxDist < cond.value

    case 'total_distance':
      const totalDist = logs.reduce((s, l) => s + (l.actual_distance_km || 0), 0)
      return cond.operator === 'gte' ? totalDist >= cond.value : totalDist < cond.value

    case 'consecutive_days':
      const days = getConsecutiveDays(logs)
      return days >= cond.value

    case 'total_runs':
      return logs.length >= cond.value

    default:
      return false
  }
}

function getConsecutiveDays(logs) {
  const dates = [...new Set(logs.map(l => l.workout_date))]
    .sort((a, b) => b.localeCompare(a))
  let count = 1
  for (let i = 0; i < dates.length - 1; i++) {
    const diff = (new Date(dates[i]) - new Date(dates[i + 1])) / (1000 * 60 * 60 * 24)
    if (diff === 1) count++
    else break
  }
  return count
}
