/**
 * 配速计算工具模块
 */

/**
 * 秒/公里 配速格式化显示 (如 5'30"/km)
 */
export function formatPace(paceSecPerKm) {
  if (!paceSecPerKm || paceSecPerKm <= 0) return "--'--\""
  const mins = Math.floor(paceSecPerKm / 60)
  const secs = paceSecPerKm % 60
  return `${mins}'${String(secs).padStart(2, '0')}"`
}

/**
 * 从完赛时间推算配速
 * @param {number} distanceM 距离(米)
 * @param {number} totalTimeSec 总时间(秒)
 * @returns {number} 配速(秒/公里)
 */
export function calcPaceFromResult(distanceM, totalTimeSec) {
  if (!distanceM || !totalTimeSec) return 0
  return Math.round(totalTimeSec / (distanceM / 1000))
}

/**
 * 从配速推算完赛时间
 * @param {number} distanceM 距离(米)
 * @param {number} paceSecPerKm 配速(秒/公里)
 * @returns {number} 总时间(秒)
 */
export function calcResultFromPace(distanceM, paceSecPerKm) {
  return Math.round(paceSecPerKm * (distanceM / 1000))
}

/**
 * 根据VDOT跑力值推算各距离完赛时间
 * 使用简化的VDOT公式
 */
export function estimateVDOT(distanceM, totalTimeSec) {
  // VDOT = (VO2max估算)
  const distanceKm = distanceM / 1000
  const velocity = distanceKm / (totalTimeSec / 3600) // km/h
  const vo2 = -4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity
  const vdot = vo2 / (0.8 + 0.1894393 * Math.exp(-0.012778 * totalTimeSec / 60) + 0.2989558 * Math.exp(-0.1932605 * totalTimeSec / 60))
  return Math.round(vdot * 100) / 100
}

/**
 * 根据已知成绩推算目标距离的预估成绩
 * 基于Riegel公式: T2 = T1 * (D2/D1)^1.06
 */
export function predictRaceTime(knownDistanceM, knownTimeSec, targetDistanceM) {
  if (!knownDistanceM || !knownTimeSec || !targetDistanceM) return 0
  const ratio = targetDistanceM / knownDistanceM
  return Math.round(knownTimeSec * Math.pow(ratio, 1.06))
}

/**
 * 计算训练配速区间（基于目标比赛配速）
 * 返回不同训练类型的建议配速范围
 */
export function calcTrainingPaces(goalPaceSecPerKm) {
  const p = goalPaceSecPerKm
  return {
    easy: { min: Math.round(p * 1.25), max: Math.round(p * 1.40) },
    recovery: { min: Math.round(p * 1.35), max: Math.round(p * 1.50) },
    long: { min: Math.round(p * 1.10), max: Math.round(p * 1.25) },
    tempo: { min: Math.round(p * 0.95), max: Math.round(p * 1.05) },
    threshold: { min: Math.round(p * 0.92), max: Math.round(p * 0.98) },
    interval5k: { min: Math.round(p * 0.85), max: Math.round(p * 0.90) },
    intervalMile: { min: Math.round(p * 0.80), max: Math.round(p * 0.85) },
    repetition: { min: Math.round(p * 0.75), max: Math.round(p * 0.80) }
  }
}

/**
 * 格式化距离显示
 */
export function formatDistance(km) {
  if (!km || km <= 0) return '--'
  if (km >= 1) return `${km.toFixed(1)} km`
  return `${Math.round(km * 1000)} m`
}

/**
 * 格式化距离为米（用于间歇训练）
 */
export function formatDistanceM(m) {
  if (!m || m <= 0) return '--'
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`
  return `${m} m`
}
