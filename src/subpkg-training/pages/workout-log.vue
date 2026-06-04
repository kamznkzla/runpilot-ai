<template>
  <view class="log-page">
    <rp-navbar :showBack="true" title="训练日志" />

    <scroll-view scroll-y class="log-content">
      <view class="log-actions">
        <text class="log-actions-title">训练记录</text>
        <button class="add-log-btn" @tap="addManualLog">+</button>
      </view>

      <view v-if="trainingStore.logs.length === 0">
        <rp-empty-state icon="📋" title="暂无训练记录" description="完成训练后这里会显示记录" />
      </view>

      <view v-for="log in trainingStore.logs" :key="log._id" class="log-card">
        <view class="log-header">
          <text class="log-date">{{ log.workout_date }}</text>
          <view class="log-status" :class="`status-${log.completion_status}`">
            <text>{{ statusLabel(log.completion_status) }}</text>
          </view>
        </view>

        <view class="log-body">
          <view class="log-type-row">
            <rp-workout-type-icon :type="log.planned_type || 'easy'" :size="48" />
            <text class="log-type">{{ workoutLabel(log.planned_type) }}</text>
          </view>

          <view class="log-stats" v-if="log.completion_status !== 'skipped'">
            <view class="log-stat">
              <text class="log-stat-val">{{ log.actual_distance_km || '--' }}</text>
              <text class="log-stat-label">距离 (km)</text>
            </view>
            <view class="log-stat">
              <text class="log-stat-val">{{ log.actual_pace_sec_per_km ? formatPace(log.actual_pace_sec_per_km) : '--' }}</text>
              <text class="log-stat-label">配速</text>
            </view>
            <view class="log-stat">
              <text class="log-stat-val">{{ log.self_rating || '--' }}/5</text>
              <text class="log-stat-label">体感</text>
            </view>
          </view>

          <text v-if="log.feeling_note" class="log-note">{{ log.feeling_note }}</text>
          <text v-if="log.is_pb" class="log-pb-tag">🏆 新 PB！</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTrainingStore } from '@/stores/modules/training'
import { WORKOUT_TYPE_LABELS, COMPLETION_STATUS_LABELS } from '@/common/utils/constants'
import { formatPace } from '@/common/utils/pace'

const trainingStore = useTrainingStore()

function workoutLabel(type) { return WORKOUT_TYPE_LABELS[type] || '' }
function statusLabel(s) { return COMPLETION_STATUS_LABELS[s] || '' }
function addManualLog() {
  uni.navigateTo({ url: '/subpkg-training/pages/workout-feedback?status=done&manual=1' })
}

onMounted(() => { trainingStore.fetchLogs(50) })
</script>

<style lang="scss" scoped>
.log-page { min-height: 100vh; background-color: $color-bg-primary; }
.log-content { padding: $spacing-md; }
.log-actions { display: flex; align-items: center; justify-content: space-between; margin-bottom: $spacing-md; }
.log-actions-title { font-size: $font-size-md; font-weight: 600; color: $color-text-primary; }
.add-log-btn {
  width: 72rpx; height: 72rpx; border-radius: 50%; padding: 0; line-height: 72rpx;
  background: $color-accent; color: #fff; font-size: 44rpx; font-weight: 600; border: none;
}

.log-card { background: $color-bg-card; border-radius: $radius-md; padding: $spacing-md; margin-bottom: $spacing-md; }
.log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: $spacing-sm; }
.log-date { font-size: $font-size-sm; color: $color-text-secondary; font-weight: 500; }
.log-status { padding: 4rpx 16rpx; border-radius: $radius-round;
  text { font-size: $font-size-xs; }
}
.status-done { background: rgba(76,175,80,0.2); text { color: $color-success; } }
.status-partial { background: rgba(255,183,77,0.2); text { color: $color-warning; } }
.status-skipped { background: rgba(239,83,80,0.2); text { color: $color-error; } }

.log-body { display: flex; flex-direction: column; gap: $spacing-sm; }
.log-type-row { display: flex; align-items: center; gap: $spacing-sm; }
.log-type { font-size: $font-size-md; font-weight: 600; color: $color-text-primary; }
.log-stats { display: flex; gap: $spacing-lg; }
.log-stat { display: flex; flex-direction: column; }
.log-stat-val { font-size: $font-size-lg; font-family: $font-family-number; font-weight: 600; color: $color-text-primary; }
.log-stat-label { font-size: $font-size-xs; color: $color-text-muted; }
.log-note { font-size: $font-size-sm; color: $color-text-muted; }
.log-pb-tag { font-size: $font-size-sm; color: $color-accent; font-weight: 600; }
</style>
