'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * 训练卡片数据生成云函数
 * 准备 Canvas 渲染所需的训练卡片数据
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { templateId = 'default', workoutData } = event

  try {
    // 获取用户信息
    const user = await db.collection('users').where({ _openid: openid }).limit(1).get()
    const userData = user.data[0] || {}

    // 生成 AI 评语（简化版直接使用模板）
    const aiComment = generateComment(workoutData)

    const cardData = {
      template: templateId,
      texts: {
        title: '今日训练完成！',
        distance: `${(workoutData.distance_km || 0).toFixed(1)} km`,
        pace: formatPace(workoutData.pace_sec_per_km),
        duration: formatDuration(workoutData.duration_sec),
        heartRate: workoutData.avg_hr ? `${workoutData.avg_hr} bpm` : '',
        aiComment
      },
      user: {
        nickname: userData.nickname || '跑者',
        avatar: userData.avatarUrl || ''
      },
      colors: {
        primary: '#FF6B35',
        bg: '#1A1A2E',
        text: '#FFFFFF',
        muted: '#B0B3C0'
      }
    }

    return { success: true, cardData }
  } catch (err) {
    console.error('card-generate error:', err)
    return { success: false, errMsg: err.message }
  }
}

function generateComment(data) {
  const pace = data.pace_sec_per_km
  const dist = data.distance_km

  if (!pace || !dist) return '坚持跑步，每一步都算数！'

  if (pace < 300) return '配速很快！保持这种状态，PB 指日可待！'
  if (pace < 360) return '配速稳定，今天完成得非常出色！'
  if (pace < 420) return '节奏不错！有氧基础在稳步提升。'
  return '稳定的完成就是最好的训练，继续保持！'
}

function formatPace(sec) {
  if (!sec) return "--'--\""
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}'${String(s).padStart(2, '0')}"`
}

function formatDuration(sec) {
  if (!sec) return '--:--'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
