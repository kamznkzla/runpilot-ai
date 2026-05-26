<template>
  <view class="analysis-page">
    <rp-navbar :showBack="true" title="趋势分析" />

    <scroll-view scroll-y class="analysis-content">
      <!-- 周跑量趋势 -->
      <rp-card title="周跑量趋势">
        <rp-chart
          :data="weeklyVolumeData"
          :labels="weeklyLabels"
          :color="'#FF6B35'"
          :fillColor="'rgba(255, 107, 53, 0.15)'"
          :width="630"
          :height="280"
        />
        <view class="chart-summary-row">
          <text>本周：{{ currentWeekVol }} km</text>
          <text>上周：{{ lastWeekVol }} km</text>
          <text :style="{ color: volChange >= 0 ? '#4CAF50' : '#EF5350' }">
            {{ volChange >= 0 ? '↑' : '↓' }} {{ Math.abs(volChange).toFixed(1) }} km
          </text>
        </view>
      </rp-card>

      <!-- 配速趋势 -->
      <rp-card title="平均配速趋势">
        <rp-chart
          :data="paceTrendData"
          :labels="paceLabels"
          :color="'#42A5F5'"
          :fillColor="'rgba(66, 165, 245, 0.15)'"
          :width="630"
          :height="280"
        />
      </rp-card>

      <!-- 训练负荷 -->
      <rp-card title="训练负荷 (ACWR)">
        <view class="load-gauge">
          <view class="gauge-bar">
            <view class="gauge-fill" :style="{ width: loadPercent + '%', backgroundColor: loadColor }" />
          </view>
          <view class="gauge-labels">
            <text>训练不足</text>
            <text>最佳区间</text>
            <text>过度训练</text>
          </view>
          <text class="load-value" :style="{ color: loadColor }">
            {{ acwr.toFixed(2) }} ({{ loadStatus }})
          </text>
        </view>
      </rp-card>

      <!-- PB 列表 -->
      <rp-card title="个人最佳记录">
        <view v-if="pbs.length > 0" class="pb-list">
          <view v-for="pb in pbs" :key="pb.distance" class="pb-row">
            <text class="pb-dist">{{ pbLabel(pb.distance) }}</text>
            <text class="pb-time" :class="{'family-mono': true}">{{ pb.time }}</text>
            <text class="pb-date">{{ pb.date }}</text>
          </view>
        </view>
        <rp-empty-state v-else icon="🏆" title="还没有 PB" description="继续训练，刷新你的个人最佳" />
      </rp-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 模拟数据
const weeklyVolumeData = [32, 38, 42, 35, 45, 40, 48, 44]
const weeklyLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
const currentWeekVol = 44
const lastWeekVol = 48
const volChange = currentWeekVol - lastWeekVol

const paceTrendData = [370, 360, 355, 345, 350, 340, 335, 330]
const paceLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']

const acwr = 1.15
const loadStatus = '最佳'
const loadPercent = ref(55)
const loadColor = '#4CAF50'

const pbs = [
  { distance: '5k', time: '22:30', date: '2026-03-15' },
  { distance: '10k', time: '48:15', date: '2026-02-20' },
  { distance: 'half_marathon', time: '1:52:00', date: '2025-11-10' }
]

function pbLabel(dist) {
  const map = { '1k': '1KM', '5k': '5KM', '10k': '10KM', half_marathon: '半马', marathon: '全马' }
  return map[dist] || dist
}
</script>

<style lang="scss" scoped>
.analysis-page { min-height: 100vh; background-color: $color-bg-primary; }
.analysis-content { padding: $spacing-md; }

.chart-summary-row { display: flex; justify-content: space-around; margin-top: $spacing-sm; padding-top: $spacing-sm; border-top: 1rpx solid rgba(255,255,255,0.06);
  text { font-size: $font-size-sm; color: $color-text-muted; }
}

.load-gauge { padding: $spacing-sm 0; }
.gauge-bar { height: 16rpx; background: rgba(255,255,255,0.08); border-radius: 8rpx; margin-bottom: $spacing-sm; overflow: hidden; }
.gauge-fill { height: 100%; border-radius: 8rpx; transition: width 0.5s ease; }
.gauge-labels { display: flex; justify-content: space-between; text { font-size: $font-size-xs; color: $color-text-muted; } }
.load-value { font-size: $font-size-lg; font-weight: 700; display: block; text-align: center; margin-top: $spacing-sm; }

.pb-list { display: flex; flex-direction: column; gap: $spacing-sm; }
.pb-row { display: flex; align-items: center; gap: $spacing-md; padding: $spacing-sm 0; border-bottom: 1rpx solid rgba(255,255,255,0.04);
  &:last-child { border-bottom: none; }
}
.pb-dist { font-size: $font-size-sm; color: $color-text-muted; min-width: 80rpx; }
.pb-time { font-size: $font-size-lg; color: $color-accent; font-weight: 600; flex: 1; font-family: $font-family-number; }
.pb-date { font-size: $font-size-xs; color: $color-text-muted; }
</style>
