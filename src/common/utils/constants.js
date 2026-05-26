// 训练类型
export const WORKOUT_TYPES = {
  REST: 'rest',
  EASY: 'easy',
  TEMPO: 'tempo',
  INTERVAL: 'interval',
  LONG: 'long',
  RECOVERY: 'recovery'
}

export const WORKOUT_TYPE_LABELS = {
  rest: '休息',
  easy: '轻松跑',
  tempo: '节奏跑',
  interval: '间歇跑',
  long: 'LSD 长距离',
  recovery: '恢复跑'
}

export const WORKOUT_TYPE_ICONS = {
  rest: 'moon',
  easy: 'walk',
  tempo: 'speed',
  interval: 'timer',
  long: 'road',
  recovery: 'heart'
}

// 训练周期阶段
export const PHASES = {
  BASE: 'base',
  BUILD: 'build',
  RACE: 'race',
  TAPER: 'taper'
}

export const PHASE_LABELS = {
  base: '基础期',
  build: '强化期',
  race: '竞赛期',
  taper: '比赛周'
}

export const PHASE_DESCRIPTIONS = {
  base: '以有氧耐力为主，逐步建立跑量基础',
  build: '加入间歇跑、节奏跑等强度训练',
  race: '专项配速训练与赛前调整',
  taper: '赛前减量、恢复与心理准备'
}

// 目标距离
export const GOAL_DISTANCES = [
  { value: '5k', label: '5 公里', baseDistance: 5 },
  { value: '10k', label: '10 公里', baseDistance: 10 },
  { value: 'half_marathon', label: '半程马拉松', baseDistance: 21.0975 },
  { value: 'marathon', label: '全程马拉松', baseDistance: 42.195 }
]

// 跑步经验水平
export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: '新手', desc: '刚开始跑步或跑龄不足6个月' },
  { value: 'intermediate', label: '进阶', desc: '有规律跑步6个月以上，完成过10K' },
  { value: 'advanced', label: '高阶', desc: '跑龄2年以上，完成过半马或全马' }
]

// 每周训练天数
export const TRAINING_DAYS_OPTIONS = [
  { value: '2-3', label: '2-3 天', desc: '时间有限' },
  { value: '4-5', label: '4-5 天', desc: '适中强度' },
  { value: '6-7', label: '6-7 天', desc: '全力投入' }
]

// 计划时长
export const PLAN_DURATIONS = [
  { value: 4, label: '4 周', desc: '短期突击' },
  { value: 8, label: '8 周', desc: '标准计划' },
  { value: 12, label: '12 周', desc: '完整周期（推荐）' }
]

// RPE 感知强度
export const RPE_SCALE = [
  { value: 1, label: '极轻松', desc: '几乎不费力' },
  { value: 2, label: '很轻松', desc: '可以轻松交谈' },
  { value: 3, label: '轻松', desc: '可以交谈' },
  { value: 4, label: '较轻松', desc: '交谈稍有困难' },
  { value: 5, label: '中等', desc: '呼吸加深，仍可短句' },
  { value: 6, label: '较难', desc: '呼吸急促，简短回答' },
  { value: 7, label: '困难', desc: '只能简短词语' },
  { value: 8, label: '很困难', desc: '只能几个字' },
  { value: 9, label: '极困难', desc: '无法说话' },
  { value: 10, label: '极限', desc: '全力冲刺，无法维持' }
]

// 完成状态
export const COMPLETION_STATUS = {
  DONE: 'done',
  PARTIAL: 'partial',
  SKIPPED: 'skipped'
}

export const COMPLETION_STATUS_LABELS = {
  done: '完成',
  partial: '部分完成',
  skipped: '跳过'
}

// 难度评估
export const DIFFICULTY_LEVELS = [
  { value: 1, label: '太轻松' },
  { value: 2, label: '刚好' },
  { value: 3, label: '太累' }
]

// 跳训原因
export const SKIP_REASONS = [
  { value: 'weather', label: '天气原因' },
  { value: 'injury', label: '伤病' },
  { value: 'time', label: '时间冲突' },
  { value: 'fatigue', label: '过度疲劳' },
  { value: 'other', label: '其他' }
]

// 支持的同步平台
export const SYNC_PLATFORMS = [
  { value: 'garmin', label: 'Garmin Connect' },
  { value: 'apple_health', label: 'Apple Health' },
  { value: 'strava', label: 'Strava' },
  { value: 'coros', label: 'Coros' },
  { value: 'keep', label: 'Keep' }
]

// 成就类别
export const ACHIEVEMENT_CATEGORIES = {
  MILESTONE: 'milestone',
  STREAK: 'streak',
  PB: 'pb',
  VOLUME: 'volume',
  SPECIAL: 'special'
}

// 配速计算常量
export const PACE_DISTANCES = {
  '1k': 1000,
  '3k': 3000,
  '5k': 5000,
  '10k': 10000,
  'half_marathon': 21097.5,
  'marathon': 42195
}
