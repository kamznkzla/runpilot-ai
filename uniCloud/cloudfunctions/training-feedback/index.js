'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * 训练反馈处理云函数
 * 1. 记录训练日志
 * 2. 检测 PB
 * 3. 触发成就检查
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const feedback = event

  try {
    // 1. 创建训练日志记录
    const logData = {
      _openid: openid,
      completion_status: feedback.completion_status || 'done',
      actual_distance_km: feedback.actual_distance_km,
      actual_duration_sec: feedback.actual_duration_min ? feedback.actual_duration_min * 60 : undefined,
      actual_pace_sec_per_km: calculatePace(feedback.actual_distance_km, feedback.actual_duration_min),
      actual_avg_hr: feedback.actual_avg_hr,
      self_rating: feedback.rpe_actual,
      difficulty_rating: feedback.difficulty_rating,
      feeling_note: feedback.feeling_note,
      skip_reason: feedback.skip_reason,
      workout_date: feedback.workout_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }

    const logResult = await db.collection('training_logs').add({ data: logData })

    // 2. 检测 PB
    let earnedBadges = []
    if (feedback.completion_status === 'done' && feedback.actual_distance_km) {
      const isPB = await checkPB(openid, feedback)
      if (isPB) {
        await db.collection('training_logs').doc(logResult._id).update({
          data: { is_pb: true, pb_detail: isPB }
        })
      }
    }

    // 3. 成就检查
    earnedBadges = await checkAchievements(openid, logResult._id, logData)

    return {
      success: true,
      logId: logResult._id,
      earnedBadges
    }
  } catch (err) {
    console.error('training-feedback error:', err)
    return { success: false, errMsg: err.message }
  }
}

function calculatePace(distanceKm, durationMin) {
  if (!distanceKm || !durationMin || distanceKm <= 0 || durationMin <= 0) return null
  return Math.round((durationMin * 60) / distanceKm)
}

async function checkPB(openid, feedback) {
  // 检测常用距离的PB
  const distances = [
    { name: '1k', value: 1 },
    { name: '5k', value: 5 },
    { name: '10k', value: 10 },
    { name: 'half_marathon', value: 21.0975 },
    { name: 'marathon', value: 42.195 }
  ]

  for (const dist of distances) {
    if (Math.abs(feedback.actual_distance_km - dist.value) < 0.1) {
      const prevBest = await db.collection('training_logs')
        .where({
          _openid: openid,
          completion_status: 'done',
          is_pb: true
        })
        .orderBy('actual_duration_sec', 'asc')
        .limit(1)
        .get()

      if (prevBest.data.length === 0 ||
          (feedback.actual_duration_min * 60) < prevBest.data[0].actual_duration_sec) {
        return { distance: dist.name, time_sec: feedback.actual_duration_min * 60 }
      }
    }
  }
  return null
}

async function checkAchievements(openid, logId, logData) {
  const badges = []
  const allLogs = await db.collection('training_logs')
    .where({ _openid: openid, completion_status: 'done' })
    .get()

  // 里程碑成就
  if (logData.actual_distance_km >= 10) {
    const earned = await awardBadge(openid, 'first_10k', logId)
    if (earned) badges.push(earned)
  }
  if (logData.actual_distance_km >= 21.0975) {
    const earned = await awardBadge(openid, 'first_half_marathon', logId)
    if (earned) badges.push(earned)
  }

  // 连续训练检测
  const consecutiveDays = getConsecutiveDays(allLogs.data)
  if (consecutiveDays >= 7) {
    const earned = await awardBadge(openid, 'streak_7_days', logId)
    if (earned) badges.push(earned)
  }

  return badges
}

async function awardBadge(openid, achievementCode, logId) {
  try {
    await db.collection('user_achievements').add({
      data: {
        _openid: openid,
        achievement_id: achievementCode,
        unlocked_at: new Date().toISOString(),
        context_log_id: logId,
        seen: false
      }
    })
    return { code: achievementCode, name: achievementCode }
  } catch (err) {
    // 可能已存在（重复获得）
    return null
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
