/**
 * 表单验证工具
 */

// 验证必填
export function required(value, msg = '此项为必填') {
  if (value === undefined || value === null || value === '') return msg
  return null
}

// 验证数字范围
export function numberRange(value, min, max, msg) {
  const num = Number(value)
  if (isNaN(num)) return '请输入有效数字'
  if (num < min || num > max) return msg || `请输入${min}-${max}之间的数字`
  return null
}

// 验证正数
export function positiveNumber(value, msg = '请输入正数') {
  const num = Number(value)
  if (isNaN(num) || num <= 0) return msg
  return null
}

// 验证完赛时间格式 (HH:MM:SS 或 MM:SS)
export function raceTimeFormat(value) {
  if (!value) return '请输入完赛时间'
  const patterns = [
    /^(\d{1,2}):(\d{2}):(\d{2})$/,  // HH:MM:SS
    /^(\d{1,2}):(\d{2})$/            // MM:SS
  ]
  for (const p of patterns) {
    if (p.test(value)) return null
  }
  return '格式错误，请输入 HH:MM:SS 或 MM:SS'
}

// 解析完赛时间字符串为秒数
export function parseRaceTime(value) {
  if (!value) return 0
  const hhmmss = value.match(/^(\d{1,2}):(\d{2}):(\d{2})$/)
  if (hhmmss) return parseInt(hhmmss[1]) * 3600 + parseInt(hhmmss[2]) * 60 + parseInt(hhmmss[3])

  const mmss = value.match(/^(\d{1,2}):(\d{2})$/)
  if (mmss) return parseInt(mmss[1]) * 60 + parseInt(mmss[2])

  return 0
}

// 格式化秒数为完赛时间字符串
export function formatRaceTime(seconds) {
  if (!seconds || seconds <= 0) return ''
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${mins}:${String(secs).padStart(2, '0')}`
}

// 验证身高 (100-250 cm)
export function validateHeight(value) {
  return numberRange(value, 100, 250, '请输入有效身高 (100-250cm)')
}

// 验证体重 (30-200 kg)
export function validateWeight(value) {
  return numberRange(value, 30, 200, '请输入有效体重 (30-200kg)')
}

// 验证年龄 (10-100)
export function validateAge(value) {
  return numberRange(value, 10, 100, '请输入有效年龄 (10-100岁)')
}
