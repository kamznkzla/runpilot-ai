<template>
  <view class="rp-chart">
    <view v-if="title" class="chart-header">
      <text class="chart-title">{{ title }}</text>
      <text v-if="summary" class="chart-summary">{{ summary }}</text>
    </view>
    <canvas
      :canvas-id="canvasId"
      :id="canvasId"
      :style="{ width: width + 'rpx', height: height + 'rpx' }"
      class="chart-canvas"
    />
    <view v-if="labels.length > 0" class="chart-labels">
      <text v-for="(label, i) in labels" :key="i" class="chart-label">{{ label }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  summary: { type: String, default: '' },
  data: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] },
  width: { type: Number, default: 670 },
  height: { type: Number, default: 320 },
  color: { type: String, default: '#FF6B35' },
  fillColor: { type: String, default: 'rgba(255, 107, 53, 0.15)' },
  showDot: { type: Boolean, default: true },
  showFill: { type: Boolean, default: true },
  lineWidth: { type: Number, default: 3 }
})

const canvasId = `chart_${Math.random().toString(36).slice(2, 8)}`

function drawChart() {
  const query = uni.createSelectorQuery()
  query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res) => {
    if (!res[0] || !props.data.length) return
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    const dpr = uni.getSystemInfoSync().pixelRatio
    const w = props.width * dpr
    const h = props.height * dpr
    canvas.width = w
    canvas.height = h
    ctx.scale(dpr, dpr)

    const margin = { top: 20, right: 20, bottom: 20, left: 10 }
    const plotW = props.width - margin.left - margin.right
    const plotH = props.height - margin.top - margin.bottom

    const maxVal = Math.max(...props.data, 1)
    const minVal = Math.min(...props.data, 0)
    const range = maxVal - minVal || 1

    const points = props.data.map((val, i) => ({
      x: margin.left + (i / Math.max(props.data.length - 1, 1)) * plotW,
      y: margin.top + (1 - (val - minVal) / range) * plotH,
      val
    }))

    // 填充区域
    if (props.showFill && points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, margin.top + plotH)
      points.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.lineTo(points[points.length - 1].x, margin.top + plotH)
      ctx.closePath()
      ctx.fillStyle = props.fillColor
      ctx.fill()
    }

    // 折线
    if (points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3
        const cp2x = points[i].x - (points[i].x - points[i - 1].x) / 3
        ctx.bezierCurveTo(cp1x, points[i - 1].y, cp2x, points[i].y, points[i].x, points[i].y)
      }
      ctx.strokeStyle = props.color
      ctx.lineWidth = props.lineWidth * dpr
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // 数据点
    if (props.showDot) {
      points.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = props.color
        ctx.fill()
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fill()
      })
    }
  })
}

onMounted(() => drawChart())
watch(() => props.data, () => drawChart(), { deep: true })
</script>

<style lang="scss" scoped>
.rp-chart {
  padding: $spacing-sm 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: $spacing-sm;
  padding: 0 $spacing-xs;
}

.chart-title {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  font-weight: 500;
}

.chart-summary {
  font-size: $font-size-xs;
  color: $color-text-muted;
}

.chart-canvas {
  display: block;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 4rpx $spacing-xs 0;
}

.chart-label {
  font-size: 18rpx;
  color: $color-text-muted;
}
</style>
