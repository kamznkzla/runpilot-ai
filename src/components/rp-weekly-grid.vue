<template>
  <view class="weekly-grid">
    <view class="week-days">
      <view
        v-for="(day, i) in weekDays"
        :key="i"
        class="day-cell"
        :class="{
          'day-cell--today': day.isToday,
          'day-cell--done': day.status === 'done',
          'day-cell--partial': day.status === 'partial',
          'day-cell--skipped': day.status === 'skipped',
          'day-cell--rest': day.type === 'rest'
        }"
        @tap="$emit('dayTap', { index: i, day })"
      >
        <text class="day-name">{{ day.label }}</text>
        <view class="day-dot">
          <rp-workout-type-icon
            v-if="day.type && day.type !== 'rest'"
            :type="day.type"
            :size="40"
          />
          <text v-else class="day-rest-text">{{ day.type === 'rest' ? '休' : '' }}</text>
        </view>
        <text v-if="day.km" class="day-km">{{ day.km }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  weekData: {
    type: Array,
    default: () => []
  }
})

defineEmits(['dayTap'])

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

const weekDays = computed(() => {
  const today = new Date().getDay()
  const todayIdx = today === 0 ? 6 : today - 1

  return weekdayLabels.map((label, i) => {
    const dayData = props.weekData[i] || {}
    return {
      label,
      isToday: i === todayIdx,
      status: dayData.status || '',
      type: dayData.type || '',
      km: dayData.km || ''
    }
  })
})
</script>

<style lang="scss" scoped>
.weekly-grid {
  padding: $spacing-sm 0;
}

.week-days {
  display: flex;
  justify-content: space-around;
}

.day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: $spacing-sm;
  border-radius: $radius-md;
  min-width: 80rpx;
}

.day-cell--today {
  background: rgba(255, 107, 53, 0.15);
}

.day-name {
  font-size: $font-size-xs;
  color: $color-text-muted;
}

.day-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
}

.day-rest-text {
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.day-km {
  font-size: 18rpx;
  color: $color-text-secondary;
  font-family: $font-family-number;
}

.day-cell--done .day-name { color: $color-success; }
.day-cell--partial .day-name { color: $color-warning; }
.day-cell--skipped .day-name { color: $color-error; }
</style>
