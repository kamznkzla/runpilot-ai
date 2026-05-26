'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * 用户数据同步云函数
 * 创建或更新用户资料
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { data } = event

  try {
    const existing = await db.collection('users').where({ _openid: openid }).limit(1).get()

    if (existing.data.length > 0) {
      await db.collection('users').doc(existing.data[0]._id).update({
        data: { ...data, updated_at: new Date().toISOString() }
      })
      return { success: true, action: 'updated', _id: existing.data[0]._id }
    } else {
      const result = await db.collection('users').add({
        data: {
          _openid: openid,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
      return { success: true, action: 'created', _id: result._id }
    }
  } catch (err) {
    console.error('user-sync error:', err)
    return { success: false, errMsg: err.message }
  }
}
