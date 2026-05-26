<template>
  <view class="rp-countdown" @tap="$emit('tap')">
    <view class="countdown-card">
      <text class="countdown-label">{{ label }}</text>
      <view class="countdown-row">
        <view class="countdown-item">
          <text class="countdown-number">{{ days }}</text>
          <text class="countdown-unit">天</text>
        </view>
        <view class="countdown-divider" />
        <view class="countdown-item">
          <text class="countdown-number">{{ hours }}</text>
          <text class="countdown-unit">时</text>
        </view>
        <view class="countdown-divider" />
        <view class="countdown-item">
          <text class="countdown-number">{{ minutes }}</text>
          <text class="countdown-unit">分</text>
        </view>
      </view>
      <text v-if="goalText" class="countdown-goal">{{ goalText }}</text>
      <text class="countdown-motivation">{{ motivationText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  raceDate: { type: String, default: '' },
  goalDistance: { type: String, default: '' },
  goalTime: { type: String, default: '' },
  label: { type: String, default: '距离比赛日还有' }
})

defineEmits(['tap'])

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
let timer = null

const goalDistLabel = computed(() => {
  const map = { '5k': '5K', '10k': '10K', half_marathon: '半马', marathon: '全马' }
  return map[props.goalDistance] || props.goalDistance
})

const goalText = computed(() => {
  if (!props.goalDistance) return ''
  let text = `目标：${goalDistLabel.value}`
  if (props.goalTime) text += ` · ${props.goalTime}`
  return text
})

const motivationText = computed(() => {
  const d = days.value
  if (d <= 0) return '比赛日就是今天，加油！'
  if (d <= 7) return '最后冲刺，相信自己！'
  if (d <= 14) return '赛前调整，保持状态'
  if (d <= 30) return '关键备战期，坚持就是胜利'
  if (d <= 60) return '每一练都算数，稳步前进'
  return '持续积累，量变引起质变'
})

function tick() {
  if (!props.raceDate) return
  const now = new Date()
  const race = new Date(props.raceDate)
  const diff = race - now

  if (diff <= 0) {
    days.value = 0
    hours.value = 0
    minutes.value = 0
    return
  }

  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.rp-countdown {
  padding: $spacing-md;
}

.countdown-card {
  background: linear-gradient(135deg, $color-accent-dark, $color-accent);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  text-align: center;
}

.countdown-label {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.8);
}

.countdown-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: $spacing-md 0;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120rpx;
}

.countdown-number {
  font-family: $font-family-number;
  font-size: $font-size-hero;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.countdown-unit {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4rpx;
}

.countdown-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 $spacing-sm;
}

.countdown-goal {
  display: block;
  font-size: $font-size-md;
  color: #fff;
  font-weight: 500;
  margin-top: $spacing-sm;
}

.countdown-motivation {
  display: block;
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.7);
  margin-top: $spacing-sm;
}
</style>
