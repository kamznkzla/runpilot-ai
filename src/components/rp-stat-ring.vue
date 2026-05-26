<template>
  <view class="rp-stat-ring" :style="{ width: size + 'rpx', height: size + 'rpx' }">
    <canvas
      class="ring-canvas"
      :canvas-id="canvasId"
      :id="canvasId"
      :style="{ width: size + 'rpx', height: size + 'rpx' }"
    />
    <view class="ring-content">
      <text class="ring-value" :style="{ color, fontSize: valueSize + 'rpx' }">
        {{ percentage }}%
      </text>
      <text v-if="label" class="ring-label">{{ label }}</text>
      <text v-if="subLabel" class="ring-sublabel">{{ subLabel }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps({
  percentage: { type: Number, default: 0 },
  label: { type: String, default: '' },
  subLabel: { type: String, default: '' },
  color: { type: String, default: '#FF6B35' },
  size: { type: Number, default: 200 },
  lineWidth: { type: Number, default: 10 }
})

const canvasId = `statRing_${Math.random().toString(36).slice(2, 8)}`
const valueSize = computed(() => Math.round(props.size * 0.22))

function drawRing() {
  const query = uni.createSelectorQuery()
  query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res) => {
    if (!res[0]) return
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    const dpr = uni.getSystemInfoSync().pixelRatio
    const cSize = props.size * dpr
    canvas.width = cSize
    canvas.height = cSize
    ctx.scale(dpr, dpr)

    const centerX = props.size / 2
    const centerY = props.size / 2
    const radius = (props.size - props.lineWidth) / 2

    // 背景圆环
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = props.lineWidth
    ctx.lineCap = 'round'
    ctx.stroke()

    // 进度圆环
    const pct = Math.min(100, Math.max(0, props.percentage))
    const endAngle = (pct / 100) * Math.PI * 2 - Math.PI / 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle)
    ctx.strokeStyle = props.color
    ctx.lineWidth = props.lineWidth
    ctx.lineCap = 'round'
    ctx.stroke()
  })
}

onMounted(() => {
  drawRing()
})

watch(() => props.percentage, () => {
  drawRing()
})
</script>

<style lang="scss" scoped>
.rp-stat-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.ring-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.ring-value {
  font-family: $font-family-number;
  font-weight: 700;
}

.ring-label {
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin-top: 4rpx;
}

.ring-sublabel {
  font-size: $font-size-xs;
  color: $color-text-muted;
  margin-top: 2rpx;
}
</style>
