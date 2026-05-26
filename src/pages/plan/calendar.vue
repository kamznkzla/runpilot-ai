<template>
  <view class="calendar-page">
    <rp-navbar :showBack="true" title="训练日历" />

    <view class="calendar-header">
      <view class="month-switcher">
        <text class="month-arrow" @tap="prevMonth">&lt;</text>
        <text class="month-title">{{ currentYear }}年{{ currentMonth }}月</text>
        <text class="month-arrow" @tap="nextMonth">&gt;</text>
      </view>
      <view class="weekday-row">
        <text v-for="d in weekDays" :key="d" class="weekday-cell">{{ d }}</text>
      </view>
    </view>

    <view class="calendar-grid">
      <view
        v-for="(cell, i) in calendarGrid"
        :key="i"
        class="calendar-cell"
        :class="{
          'cell--other-month': !cell.isCurrentMonth,
          'cell--today': cell.isToday,
          'cell--has-workout': getWorkoutForDate(cell.date)
        }"
        @tap="onCellTap(cell)"
      >
        <text class="cell-day">{{ cell.day }}</text>
        <view v-if="getWorkoutForDate(cell.date)" class="cell-dot" :style="{ backgroundColor: getWorkoutColor(cell.date) }" />
      </view>
    </view>

    <!-- 选中日期的训练详情 -->
    <view v-if="selectedWorkout" class="day-detail-popup" @tap="selectedWorkout = null">
      <view class="popup-content" @tap.stop>
        <text class="popup-date">{{ selectedDateLabel }}</text>
        <view class="popup-workout">
          <rp-workout-type-icon :type="selectedWorkout.type" :size="64" />
          <view class="popup-info">
            <text class="popup-type">{{ workoutLabel(selectedWorkout.type) }}</text>
            <text class="popup-desc">{{ selectedWorkout.description || selectedWorkout.coach_note }}</text>
            <view class="popup-stats">
              <text v-if="selectedWorkout.distance_km">{{ selectedWorkout.distance_km }} km</text>
              <text v-if="selectedWorkout.target_pace_sec_per_km">
                <rp-pace-display :paceSec="selectedWorkout.target_pace_sec_per_km" size="sm" inline />
              </text>
              <text v-if="selectedWorkout.rpe_target">RPE {{ selectedWorkout.rpe_target }}</text>
            </view>
          </view>
        </view>
        <button class="popup-btn" @tap="goDetail">查看详情</button>
      </view>
    </view>

    <view class="calendar-legend">
      <view v-for="item in legendItems" :key="item.color" class="legend-item">
        <view class="legend-dot" :style="{ backgroundColor: item.color }" />
        <text class="legend-label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePlanStore } from '@/stores/modules/plan'
import { WORKOUT_TYPE_LABELS } from '@/common/utils/constants'
import { getCalendarGrid } from '@/common/utils/date'
import { theme } from '@/common/config/theme'

const planStore = usePlanStore()
const weekDays = ['一', '二', '三', '四', '五', '六', '日']

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedWorkout = ref(null)
const selectedDateLabel = ref('')

const calendarGrid = computed(() => getCalendarGrid(currentYear.value, currentMonth.value))

const legendItems = [
  { color: theme.workoutColors.easy, label: '轻松跑' },
  { color: theme.workoutColors.tempo, label: '节奏跑' },
  { color: theme.workoutColors.interval, label: '间歇跑' },
  { color: theme.workoutColors.long, label: 'LSD' },
  { color: theme.workoutColors.recovery, label: '恢复跑' },
  { color: theme.workoutColors.rest, label: '休息' }
]

function getWorkoutForDate(dateStr) {
  if (!planStore.allWorkoutsFlat) return null
  return planStore.allWorkoutsFlat.find(w => {
    // 根据 weekNumber 和 day 计算实际日期
    if (!planStore.activePlan?.start_date) return false
    const planStart = new Date(planStore.activePlan.start_date)
    const weekOffset = (w.weekNumber - 1) * 7
    const dayMap = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 }
    const dayOffset = dayMap[w.day] || 0
    const workoutDate = new Date(planStart)
    workoutDate.setDate(workoutDate.getDate() + weekOffset + dayOffset)
    return workoutDate.toISOString().split('T')[0] === dateStr
  })
}

function getWorkoutColor(dateStr) {
  const w = getWorkoutForDate(dateStr)
  return w ? theme.workoutColors[w.type] || '#6B6E7D' : null
}

function workoutLabel(type) { return WORKOUT_TYPE_LABELS[type] || '' }

function onCellTap(cell) {
  const w = getWorkoutForDate(cell.date)
  if (w) {
    selectedWorkout.value = w
    selectedDateLabel.value = cell.date
  }
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function goDetail() {
  uni.navigateTo({ url: '/subpkg-training/pages/workout-detail' })
}

onMounted(async () => {
  await planStore.fetchActivePlan()
})
</script>

<style lang="scss" scoped>
.calendar-page { min-height: 100vh; background-color: $color-bg-primary; padding: 0 $spacing-md; }

.calendar-header { margin-bottom: $spacing-md; }
.month-switcher { display: flex; justify-content: space-between; align-items: center; padding: $spacing-md 0; }
.month-arrow { font-size: $font-size-lg; color: $color-accent; padding: $spacing-sm $spacing-md; }
.month-title { font-size: $font-size-lg; font-weight: 700; color: $color-text-primary; }

.weekday-row { display: flex; }
.weekday-cell { flex: 1; text-align: center; font-size: $font-size-xs; color: $color-text-muted; padding: $spacing-sm 0; }

.calendar-grid { display: flex; flex-wrap: wrap; }
.calendar-cell {
  width: calc(100% / 7); aspect-ratio: 1;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; position: relative; border-radius: $radius-sm;
}
.cell--other-month .cell-day { color: $color-text-muted; opacity: 0.3; }
.cell--today { background: rgba(255,107,53,0.15); }
.cell--today .cell-day { color: $color-accent; font-weight: 700; }
.cell-day { font-size: $font-size-md; color: $color-text-primary; }
.cell-dot {
  width: 8rpx; height: 8rpx; border-radius: 50%;
  position: absolute; bottom: 8rpx;
}

.day-detail-popup {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
}
.popup-content {
  background: $color-bg-card; border-radius: $radius-lg $radius-lg 0 0;
  padding: $spacing-lg; width: 100%;
}
.popup-date { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-md; }
.popup-workout { display: flex; gap: $spacing-md; align-items: center; }
.popup-info { flex: 1; }
.popup-type { font-size: $font-size-lg; font-weight: 600; color: $color-text-primary; }
.popup-desc { font-size: $font-size-sm; color: $color-text-muted; margin-top: 4rpx; display: block; }
.popup-stats { display: flex; gap: $spacing-md; margin-top: $spacing-sm;
  text { font-size: $font-size-sm; color: $color-accent-light; }
}
.popup-btn {
  width: 100%; background: $color-accent; color: #fff; font-weight: 600;
  border-radius: $radius-round; padding: $spacing-sm 0; margin-top: $spacing-md; border: none;
}

.calendar-legend { display: flex; flex-wrap: wrap; gap: $spacing-md; padding: $spacing-lg 0; justify-content: center; }
.legend-item { display: flex; align-items: center; gap: 6rpx; }
.legend-dot { width: 16rpx; height: 16rpx; border-radius: 50%; }
.legend-label { font-size: $font-size-xs; color: $color-text-muted; }
</style>
