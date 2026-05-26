'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * 统计分析云函数
 * 聚合训练数据，计算趋势、PB、训练负荷等
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { period = 'monthly' } = event

  try {
    const allLogs = await db.collection('training_logs')
      .where({ _openid: openid, completion_status: 'done' })
      .orderBy('workout_date', 'asc')
      .get()

    const logs = allLogs.data

    // 周跑量趋势
    const weeklyVolume = calcWeeklyVolume(logs)

    // 配速趋势
    const paceTrend = calcPaceTrend(logs)

    // PB 列表
    const pbs = getPBs(logs)

    // 训练负荷 (ACWR)
    const load = calcTrainingLoad(weeklyVolume)

    return {
      success: true,
      stats: {
        weeklyVolume: weeklyVolume.slice(-8),
        paceTrend: paceTrend.slice(-8),
        pbs,
        load,
        totalKm: logs.reduce((s, l) => s + (l.actual_distance_km || 0), 0),
        totalRuns: logs.length,
        avgPace: paceTrend.length > 0
          ? Math.round(paceTrend.reduce((s, p) => s + p, 0) / paceTrend.length)
          : null
      }
    }
  } catch (err) {
    console.error('stats-analysis error:', err)
    return { success: false, errMsg: err.message }
  }
}

function calcWeeklyVolume(logs) {
  const weeks = {}
  logs.forEach(log => {
    const date = new Date(log.workout_date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay() + 1)
    const key = weekStart.toISOString().split('T')[0]
    weeks[key] = (weeks[key] || 0) + (log.actual_distance_km || 0)
  })
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, km]) => parseFloat(km.toFixed(1)))
}

function calcPaceTrend(logs) {
  return logs
    .filter(l => l.actual_pace_sec_per_km)
    .map(l => l.actual_pace_sec_per_km)
}

function getPBs(logs) {
  const distances = [
    { name: '1k', target: 1 },
    { name: '5k', target: 5 },
    { name: '10k', target: 10 },
    { name: 'half_marathon', target: 21.0975 },
    { name: 'marathon', target: 42.195 }
  ]

  return distances
    .map(dist => {
      const match = logs
        .filter(l => Math.abs((l.actual_distance_km || 0) - dist.target) < 0.1)
        .sort((a, b) => (a.actual_duration_sec || Infinity) - (b.actual_duration_sec || Infinity))
      if (match.length === 0) return null
      const best = match[0]
      return {
        distance: dist.name,
        time_sec: best.actual_duration_sec,
        date: best.workout_date
      }
    })
    .filter(Boolean)
}

function calcTrainingLoad(weeklyVolume) {
  if (weeklyVolume.length < 2) return { acwr: null, status: '数据不足' }
  const currentWeek = weeklyVolume[weeklyVolume.length - 1]
  const recent4Weeks = weeklyVolume.slice(-5, -1)
  const avg4Week = recent4Weeks.reduce((s, v) => s + v, 0) / recent4Weeks.length
  const acwr = avg4Week > 0 ? currentWeek / avg4Week : 1

  let status = '最佳'
  if (acwr < 0.8) status = '训练不足'
  else if (acwr > 1.5) status = '过度训练'
  else if (acwr > 1.3) status = '偏高'

  return { acwr: parseFloat(acwr.toFixed(2)), status, currentWeek, avg4Week: parseFloat(avg4Week.toFixed(1)) }
}
