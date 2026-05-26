<template>
  <view class="workout-page">
    <rp-navbar :showBack="true" title="训练详情" />

    <scroll-view scroll-y class="workout-content">
      <!-- 训练头部 -->
      <view class="workout-header">
        <view class="header-top">
          <rp-workout-type-icon :type="workout.type || 'rest'" :size="80" />
          <view class="header-info">
            <text class="header-type">{{ workoutTypeLabel }}</text>
            <text class="header-date">{{ workoutDate }}</text>
            <view class="header-phase" v-if="phaseLabel">
              <text>{{ phaseLabel }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 训练目标 -->
      <rp-card title="训练目标">
        <view class="target-grid">
          <view v-if="workout.distance_km" class="target-item">
            <text class="target-val">{{ workout.distance_km }} km</text>
            <text class="target-label">距离</text>
          </view>
          <view v-if="workout.target_pace_sec_per_km" class="target-item">
            <rp-pace-display :paceSec="workout.target_pace_sec_per_km" label="目标配速" size="md" />
          </view>
          <view v-if="workout.duration_min" class="target-item">
            <text class="target-val">{{ workout.duration_min }} min</text>
            <text class="target-label">时长</text>
          </view>
          <view v-if="workout.rpe_target" class="target-item">
            <text class="target-val">RPE {{ workout.rpe_target }}</text>
            <text class="target-label">感知强度</text>
          </view>
        </view>
      </rp-card>

      <!-- 间歇训练拆解 -->
      <rp-card v-if="workout.intervals && workout.intervals.length > 0" title="间歇训练">
        <view class="intervals-table">
          <view class="interval-row header">
            <text class="int-col">组数</text>
            <text class="int-col">距离</text>
            <text class="int-col">配速</text>
            <text class="int-col">休息</text>
          </view>
          <view v-for="(inv, i) in workout.intervals" :key="i" class="interval-row">
            <text class="int-col">{{ inv.reps }} 组</text>
            <text class="int-col">{{ inv.distance_m || '--' }}m</text>
            <text class="int-col">{{ formatPace(inv.pace_sec_per_km) }}</text>
            <text class="int-col">{{ inv.rest_sec || '--' }}s</text>
          </view>
        </view>
      </rp-card>

      <!-- 教练笔记 -->
      <rp-card v-if="workout.coach_note" accent>
        <view class="coach-note">
          <text class="note-label">💡 教练提示</text>
          <text class="note-text">{{ workout.coach_note }}</text>
        </view>
      </rp-card>

      <!-- 训练描述 -->
      <rp-card v-if="workout.description" title="训练说明">
        <text class="desc-text">{{ workout.description }}</text>
      </rp-card>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="btn-done" @tap="goFeedback('done')">标记完成</button>
        <button class="btn-partial" @tap="goFeedback('partial')">部分完成</button>
        <button class="btn-skip" @tap="goFeedback('skipped')">跳过</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePlanStore } from '@/stores/modules/plan'
import { WORKOUT_TYPE_LABELS, PHASE_LABELS } from '@/common/utils/constants'
import { formatPace } from '@/common/utils/pace'
import { formatDateCN, formatWeekday } from '@/common/utils/date'

const planStore = usePlanStore()

const workout = ref({
  type: 'easy',
  distance_km: 8,
  target_pace_sec_per_km: 345,
  duration_min: 50,
  rpe_target: 4,
  description: '轻松有氧跑，保持对话配速，心率控制在 Zone 2',
  coach_note: '关注跑姿的流畅性，保持步频在 170-180。今天的重点是恢复和积累跑量，不要跑太快。',
  intervals: []
})

const workoutTypeLabel = computed(() => WORKOUT_TYPE_LABELS[workout.value.type] || '')
const workoutDate = computed(() => formatDateCN(new Date()) + ' ' + formatWeekday(new Date()))
const phaseLabel = computed(() => PHASE_LABELS[planStore.currentPhase] || '')

function goFeedback(status) {
  uni.navigateTo({ url: `/subpkg-training/pages/workout-feedback?status=${status}` })
}

onMounted(() => {
  // 从 plan store 加载今日训练数据
  if (planStore.todayWorkout) {
    workout.value = { ...workout.value, ...planStore.todayWorkout }
  }
})
</script>

<style lang="scss" scoped>
.workout-page { min-height: 100vh; background-color: $color-bg-primary; }
.workout-content { padding: $spacing-md; padding-bottom: 200rpx; }

.workout-header { padding: $spacing-lg 0; }
.header-top { display: flex; gap: $spacing-md; align-items: center; }
.header-info { flex: 1; }
.header-type { font-size: $font-size-xxl; font-weight: 700; color: $color-text-primary; display: block; }
.header-date { font-size: $font-size-sm; color: $color-text-muted; margin-top: 4rpx; display: block; }
.header-phase { margin-top: $spacing-sm;
  text { font-size: $font-size-xs; color: $color-accent; background: rgba(255,107,53,0.15); padding: 4rpx 16rpx; border-radius: $radius-round; }
}

.target-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: $spacing-md; }
.target-item { display: flex; flex-direction: column; align-items: center; }
.target-val { font-size: $font-size-xl; font-family: $font-family-number; font-weight: 700; color: $color-text-primary; }
.target-label { font-size: $font-size-xs; color: $color-text-muted; margin-top: 4rpx; }

.intervals-table { background: $color-bg-input; border-radius: $radius-md; overflow: hidden; }
.interval-row { display: flex; padding: $spacing-sm $spacing-md; }
.interval-row.header { background: rgba(255,107,53,0.15); .int-col { color: $color-accent-light; font-weight: 600; } }
.interval-row:not(.header) { border-top: 1rpx solid rgba(255,255,255,0.04); }
.int-col { flex: 1; font-size: $font-size-sm; color: $color-text-secondary; text-align: center; }

.coach-note { display: flex; flex-direction: column; }
.note-label { font-size: $font-size-sm; color: $color-accent-light; margin-bottom: $spacing-sm; }
.note-text { font-size: $font-size-base; color: $color-text-secondary; line-height: 1.6; }
.desc-text { font-size: $font-size-base; color: $color-text-secondary; line-height: 1.6; }

.action-buttons { position: fixed; bottom: 0; left: 0; right: 0; padding: $spacing-md $spacing-lg; background: $color-bg-primary; border-top: 1rpx solid rgba(255,255,255,0.06); display: flex; gap: $spacing-sm; padding-bottom: calc($spacing-md + env(safe-area-inset-bottom)); }
.btn-done { flex: 2; background: $color-success; color: #fff; font-weight: 600; border-radius: $radius-round; padding: $spacing-md 0; border: none; font-size: $font-size-md; }
.btn-partial { flex: 1; background: $color-warning; color: $color-text-inverse; font-weight: 600; border-radius: $radius-round; padding: $spacing-md 0; border: none; font-size: $font-size-sm; }
.btn-skip { flex: 1; background: transparent; color: $color-text-muted; border: 1rpx solid $color-text-muted; border-radius: $radius-round; padding: $spacing-md 0; font-size: $font-size-sm; }
</style>
