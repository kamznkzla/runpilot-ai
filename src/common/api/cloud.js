/**
 * uniCloud 云函数调用封装
 * H5 端使用 localStorage 模拟，小程序端使用 wx.cloud
 */

const isH5 = typeof wx === 'undefined' || !wx.cloud

// H5 mock 存储
const mockStorage = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('rp_' + key)) } catch { return null }
  },
  set(key, val) {
    localStorage.setItem('rp_' + key, JSON.stringify(val))
  },
  list(prefix) {
    const items = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k.startsWith('rp_' + prefix)) items.push(k)
    }
    return items
  }
}

export function initCloud() {
  if (!isH5) {
    wx.cloud.init({ env: 'runpilot-cloud-xxxxx', traceUser: true })
  }
}

// 获取 openid（H5 用固定值模拟）
function getOpenId() {
  return isH5 ? 'h5_user_demo' : '{openid}'
}

export async function callCloudFunction(name, data = {}) {
  console.log(`[H5 Mock] callFunction: ${name}`, data)
  // H5 端返回模拟数据
  return { success: true, __mock: true }
}

export async function dbFindOne(collection, where = {}) {
  if (isH5) {
    const data = mockStorage.get(collection + '_single')
    console.log(`[H5 Mock] findOne ${collection}:`, data)
    return data || null
  }
  try {
    const db = wx.cloud.database()
    const res = await db.collection(collection).where({ ...where, _openid: getOpenId() }).limit(1).get()
    return res.data[0] || null
  } catch (err) { console.error(`[DB] findOne:`, err); return null }
}

export async function dbFind(collection, where = {}, options = {}) {
  if (isH5) {
    const data = mockStorage.get(collection) || []
    console.log(`[H5 Mock] find ${collection}:`, data.length, 'items')
    return data
  }
  try {
    const db = wx.cloud.database()
    let query = db.collection(collection).where({ ...where, _openid: getOpenId() })
    if (options.orderBy) query = query.orderBy(options.orderBy, options.order || 'desc')
    if (options.limit) query = query.limit(options.limit)
    if (options.skip) query = query.skip(options.skip)
    const res = await query.get()
    return res.data || []
  } catch (err) { console.error(`[DB] find:`, err); return [] }
}

export async function dbAdd(collection, data) {
  if (isH5) {
    const items = mockStorage.get(collection) || []
    const doc = { ...data, _id: 'mock_' + Date.now(), _openid: getOpenId() }
    items.push(doc)
    mockStorage.set(collection, items)
    return doc._id
  }
  try {
    const db = wx.cloud.database()
    const res = await db.collection(collection).add({ data: { ...data, _openid: getOpenId() } })
    return res._id
  } catch (err) { console.error(`[DB] add:`, err); throw err }
}

export async function dbUpdate(collection, id, data) {
  if (isH5) {
    const items = mockStorage.get(collection) || []
    const idx = items.findIndex(i => i._id === id)
    if (idx > -1) Object.assign(items[idx], data)
    mockStorage.set(collection, items)
    return true
  }
  try {
    const db = wx.cloud.database()
    await db.collection(collection).doc(id).update({ data })
    return true
  } catch (err) { console.error(`[DB] update:`, err); throw err }
}
