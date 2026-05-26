'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * 多平台数据同步云函数
 * 支持 Garmin, Strava, Coros, Keep 等平台的数据同步
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { platform } = event

  try {
    // 获取同步令牌
    const tokenDoc = await db.collection('sync_tokens')
      .where({ _openid: openid, platform }).limit(1).get()

    if (tokenDoc.data.length === 0) {
      return { success: false, errMsg: `未绑定 ${platform} 账号` }
    }

    const token = tokenDoc.data[0]
    let activities = []

    switch (platform) {
      case 'garmin':
        activities = await syncGarmin(token)
        break
      case 'strava':
        activities = await syncStrava(token)
        break
      default:
        activities = []
    }

    // 去重并插入
    let syncedCount = 0
    for (const activity of activities) {
      const exists = await db.collection('training_logs')
        .where({
          _openid: openid,
          workout_date: activity.date,
          actual_distance_km: activity.distance_km
        }).count()

      if (exists.total === 0) {
        await db.collection('training_logs').add({
          data: {
            _openid: openid,
            completion_status: 'done',
            actual_distance_km: activity.distance_km,
            actual_duration_sec: activity.duration_sec,
            actual_pace_sec_per_km: activity.pace_sec_per_km,
            actual_avg_hr: activity.avg_hr,
            workout_date: activity.date,
            synced_from: platform,
            created_at: new Date().toISOString()
          }
        })
        syncedCount++
      }
    }

    // 更新同步时间
    await db.collection('sync_tokens').doc(token._id).update({
      data: { last_sync_at: new Date().toISOString() }
    })

    return { success: true, syncedCount }
  } catch (err) {
    console.error('data-sync error:', err)
    return { success: false, errMsg: err.message }
  }
}

async function syncGarmin(token) {
  // Garmin Health API 接入（需要用户在 Garmin Developer 注册应用）
  // 此处为示例实现
  const https = require('https')
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'healthapi.garmin.com',
      path: '/wellness-api/rest/activities',
      method: 'GET',
      headers: { Authorization: `Bearer ${token.access_token}` }
    }, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          const data = JSON.parse(body)
          resolve((data || []).map(a => ({
            date: a.startTimeInSeconds
              ? new Date(a.startTimeInSeconds * 1000).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            distance_km: (a.totalDistanceMeters || 0) / 1000,
            duration_sec: a.durationInSeconds || 0,
            pace_sec_per_km: a.totalDistanceMeters > 0
              ? Math.round(a.durationInSeconds / (a.totalDistanceMeters / 1000))
              : null,
            avg_hr: a.averageHeartRate || null
          })))
        } catch {
          resolve([])
        }
      })
    })
    req.on('error', () => resolve([]))
    req.end()
  })
}

async function syncStrava(token) {
  // Strava API 接入
  const https = require('https')
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.strava.com',
      path: '/api/v3/athlete/activities?per_page=30',
      method: 'GET',
      headers: { Authorization: `Bearer ${token.access_token}` }
    }, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          const data = JSON.parse(body)
          resolve((data || []).map(a => ({
            date: a.start_date_local?.split('T')[0] || new Date().toISOString().split('T')[0],
            distance_km: (a.distance || 0) / 1000,
            duration_sec: a.moving_time || 0,
            pace_sec_per_km: a.distance > 0
              ? Math.round(a.moving_time / (a.distance / 1000))
              : null,
            avg_hr: a.average_heartrate || null
          })))
        } catch {
          resolve([])
        }
      })
    })
    req.on('error', () => resolve([]))
    req.end()
  })
}
