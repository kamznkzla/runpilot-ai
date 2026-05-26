<template>
  <view class="workout-icon" :style="{ width: size + 'rpx', height: size + 'rpx', backgroundColor: bgColor }">
    <text class="workout-emoji">{{ iconEmoji }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'rest' },
  size: { type: Number, default: 64 }
})

const workoutConfig = {
  rest:     { color: '#6B6E7D', emoji: '🌙' },
  easy:     { color: '#4CAF50', emoji: '🏃' },
  tempo:    { color: '#FFB74D', emoji: '⚡' },
  interval: { color: '#EF5350', emoji: '⏱' },
  long:     { color: '#AB47BC', emoji: '🛣' },
  recovery: { color: '#42A5F5', emoji: '💚' }
}

const config = computed(() => workoutConfig[props.type] || workoutConfig.rest)
const bgColor = computed(() => config.value.color)
const iconEmoji = computed(() => config.value.emoji)
</script>

<style lang="scss" scoped>
.workout-icon {
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.workout-emoji {
  font-size: 28rpx;
}
</style>
