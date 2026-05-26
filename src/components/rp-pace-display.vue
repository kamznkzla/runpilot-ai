<template>
  <view class="pace-display" :class="{ 'pace-display--inline': inline }">
    <text v-if="label" class="pace-label" :style="{ fontSize: labelFontSize }">{{ label }}</text>
    <view class="pace-value-row">
      <text class="pace-number">{{ paceMin }}</text>
      <text class="pace-sep">'</text>
      <text class="pace-number">{{ paceSec }}</text>
      <text class="pace-sep">"</text>
      <text v-if="showUnit" class="pace-unit">/km</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  paceSec: { type: Number, default: 0 },
  label: { type: String, default: '目标配速' },
  size: { type: String, default: 'md' },
  inline: { type: Boolean, default: false },
  showUnit: { type: Boolean, default: true }
})

const sizeMap = { sm: '28rpx', md: '36rpx', lg: '56rpx', xl: '72rpx' }

const labelFontSize = computed(() => {
  const map = { sm: '20rpx', md: '24rpx', lg: '28rpx', xl: '32rpx' }
  return map[props.size] || '24rpx'
})

const paceMin = computed(() => {
  if (!props.paceSec || props.paceSec <= 0) return '--'
  return String(Math.floor(props.paceSec / 60)).padStart(2, '0')
})

const paceSec = computed(() => {
  if (!props.paceSec || props.paceSec <= 0) return '--'
  return String(Math.round(props.paceSec % 60)).padStart(2, '0')
})
</script>

<style lang="scss" scoped>
.pace-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pace-display--inline {
  flex-direction: row;
  gap: $spacing-xs;
}

.pace-label {
  color: $color-text-muted;
  margin-bottom: 4rpx;
}

.pace-value-row {
  display: flex;
  align-items: baseline;
}

.pace-number {
  font-family: $font-family-number;
  font-size: v-bind('sizeMap[size]');
  font-weight: 700;
  color: $color-text-primary;
}

.pace-sep {
  font-family: $font-family-number;
  font-size: v-bind('sizeMap[size]');
  color: $color-accent;
  font-weight: 700;
  margin: 0 2rpx;
}

.pace-unit {
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin-left: 4rpx;
}
</style>
