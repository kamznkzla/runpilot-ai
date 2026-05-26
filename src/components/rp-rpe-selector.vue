<template>
  <view class="rpe-selector">
    <text v-if="label" class="rpe-label">{{ label }}</text>
    <view class="rpe-slider-track">
      <view
        v-for="i in 10"
        :key="i"
        class="rpe-dot"
        :class="{ active: i <= modelValue, current: i === modelValue }"
        :style="dotStyle(i)"
        @tap="$emit('update:modelValue', i)"
      >
        <text class="rpe-dot-number">{{ i }}</text>
      </view>
    </view>
    <view class="rpe-labels">
      <text class="rpe-min-label">{{ minLabel }}</text>
      <text class="rpe-current-label" :style="{ color: currentColor }">{{ currentLabel }}</text>
      <text class="rpe-max-label">{{ maxLabel }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 5 },
  label: { type: String, default: 'RPE 感知强度' },
  minLabel: { type: String, default: '极轻松' },
  maxLabel: { type: String, default: '极限' }
})

defineEmits(['update:modelValue'])

const rpeLabels = ['', '极轻松', '很轻松', '轻松', '较轻松', '中等', '较难', '困难', '很困难', '极困难', '极限']
const rpeColors = [
  '', '#42A5F5', '#42A5F5', '#4CAF50', '#4CAF50', '#FFB74D',
  '#FFB74D', '#FF6B35', '#EF5350', '#EF5350', '#EF5350'
]

const currentLabel = computed(() => rpeLabels[props.modelValue] || '')
const currentColor = computed(() => rpeColors[props.modelValue] || '#FF6B35')

function dotStyle(i) {
  return {
    background: i <= props.modelValue ? rpeColors[i] : 'rgba(255,255,255,0.1)',
    transform: i === props.modelValue ? 'scale(1.3)' : 'scale(1)'
  }
}
</script>

<style lang="scss" scoped>
.rpe-selector {
  padding: $spacing-sm 0;
}

.rpe-label {
  font-size: $font-size-sm;
  color: $color-text-muted;
  display: block;
  margin-bottom: $spacing-md;
}

.rpe-slider-track {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rpe-dot {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-circle;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;
}

.rpe-dot-number {
  font-size: $font-size-xs;
  color: $color-text-primary;
  font-weight: 600;
}

.rpe-dot.current {
  box-shadow: 0 0 16rpx currentColor;
}

.rpe-labels {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-sm;
}

.rpe-min-label, .rpe-max-label {
  font-size: $font-size-xs;
  color: $color-text-muted;
}

.rpe-current-label {
  font-size: $font-size-md;
  font-weight: 600;
}
</style>
