import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(isoWeek)

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 格式化日期为中文显示
 */
export function formatDateCN(date) {
  return dayjs(date).format('M月D日')
}

/**
 * 格式化日期为 周几
 */
export function formatWeekday(date) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[dayjs(date).day()]
}

/**
 * 获取当前是周几（英文小写）
 */
export function getTodayWeekday() {
  return dayjs().format('dddd').toLowerCase()
}

/**
 * 计算两个日期之间的天数差
 */
export function daysBetween(date1, date2) {
  return dayjs(date2).diff(dayjs(date1), 'day')
}

/**
 * 计算目标日期的倒计时天数
 */
export function countdownDays(targetDate) {
  if (!targetDate) return null
  const days = daysBetween(dayjs(), targetDate)
  return Math.max(0, days)
}

/**
 * 获取本周的起止日期（周一到周日）
 */
export function getCurrentWeekRange() {
  const start = dayjs().startOf('isoWeek')
  const end = dayjs().endOf('isoWeek')
  return { start: formatDate(start), end: formatDate(end) }
}

/**
 * 获取最近 N 天的日期范围
 */
export function getRecentDaysRange(n = 7) {
  const end = dayjs()
  const start = end.subtract(n - 1, 'day')
  return { start: formatDate(start), end: formatDate(end) }
}

/**
 * 获取月的第一天和最后一天
 */
export function getMonthRange(year, month) {
  const date = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  return {
    start: formatDate(date.startOf('month')),
    end: formatDate(date.endOf('month'))
  }
}

/**
 * 生成月历网格数据（含前后填充日期）
 */
export function getCalendarGrid(year, month) {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const startOfGrid = firstDay.startOf('isoWeek')
  const endOfGrid = firstDay.endOf('month').endOf('isoWeek')

  const grid = []
  let current = startOfGrid
  while (current.isBefore(endOfGrid) || current.isSame(endOfGrid, 'day')) {
    grid.push({
      date: formatDate(current),
      day: current.date(),
      month: current.month() + 1,
      isCurrentMonth: current.month() + 1 === month,
      isToday: current.isSame(dayjs(), 'day'),
      weekday: current.day()
    })
    current = current.add(1, 'day')
  }
  return grid
}

/**
 * 格式化秒数为 mm:ss
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 格式化秒数为 h:mm:ss
 */
export function formatDurationLong(seconds) {
  if (!seconds || seconds <= 0) return '--:--:--'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 格式化日期为相对时间描述（如"3天后"）
 */
export function relativeDateCN(date) {
  const days = daysBetween(dayjs(), date)
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  if (days === -1) return '昨天'
  if (days > 0) return `${days}天后`
  return `${Math.abs(days)}天前`
}

/**
 * 获取某周的训练日期范围字符串
 */
export function getWeekLabel(startDate, weekNumber) {
  const start = dayjs(startDate).add((weekNumber - 1) * 7, 'day')
  const end = start.add(6, 'day')
  return `${start.format('M/D')} - ${end.format('M/D')}`
}
