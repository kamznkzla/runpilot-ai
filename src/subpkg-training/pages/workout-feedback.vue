<template>
  <view class="feedback-page">
    <rp-navbar :showBack="true" :title="statusLabel" />

    <scroll-view scroll-y class="feedback-content">
      <!-- 完成状态确认 -->
      <rp-card title="完成状态">
        <view class="status-confirm">
          <text class="status-emoji">{{ statusEmoji }}</text>
          <text class="status-text">你将此训练标记为"{{ statusLabel }}"</text>
        </view>
      </rp-card>

      <!-- 实际数据（完成/部分完成时显示） -->
      <rp-card v-if="status !== 'skipped'" title="实际数据">
        <view class="form-group">
          <text class="form-label">实际距离 (km)</text>
          <input class="form-input" type="digit" v-model="form.distance" placeholder="如 8.5" placeholder-style="color: #6B6E7D" />
        </view>
        <view class="form-group">
          <text class="form-label">实际时长 (分钟)</text>
          <input class="form-input" type="digit" v-model="form.duration" placeholder="如 48" placeholder-style="color: #6B6E7D" />
        </view>
        <view class="form-group">
          <text class="form-label">平均心率 (可选)</text>
          <input class="form-input" type="number" v-model="form.avgHR" placeholder="如 145" placeholder-style="color: #6B6E7D" />
        </view>
        <view v-if="estimatedPace" class="pace-estimate">
          <text>估算配速：{{ estimatedPace }}</text>
        </view>
      </rp-card>

      <!-- 跳过原因（跳过时显示） -->
      <rp-card v-if="status === 'skipped'" title="跳过原因">
        <view class="skip-reasons">
          <view
            v-for="r in skipReasons"
            :key="r.value"
            class="reason-chip"
            :class="{ active: form.skipReason === r.value }"
            @tap="form.skipReason = r.value"
          >
            <text>{{ r.label }}</text>
          </view>
        </view>
      </rp-card>

      <!-- 体感评估 -->
      <rp-card title="体感评估">
        <rp-rpe-selector v-model="form.rpe" label="RPE 感知强度" />
        <view class="form-group" style="margin-top: 24rpx">
          <text class="form-label">难度评估</text>
          <view class="difficulty-row">
            <view
              v-for="d in difficultyLevels"
              :key="d.value"
              class="diff-chip"
              :class="{ active: form.difficulty === d.value }"
              @tap="form.difficulty = d.value"
            >
              <text>{{ d.label }}</text>
            </view>
          </view>
        </view>
      </rp-card>

      <!-- 自我评价 -->
      <rp-card title="训练感受">
        <textarea
          class="feeling-input"
          v-model="form.note"
          placeholder="记录今天的训练感受...（选填）"
          placeholder-style="color: #6B6E7D"
          :maxlength="500"
        />
      </rp-card>

      <view style="height: 160rpx" />
    </scroll-view>

    <view class="submit-bar">
      <button class="submit-btn" :loading="submitting" @tap="handleSubmit">提交反馈</button>
    </view>

    <rp-confetti
      :visible="showConfetti"
      text="训练完成！"
      subText="继续加油"
      :duration="3000"
    />
  </view>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useTrainingStore } from '@/stores/modules/training'
import { usePlanStore } from '@/stores/modules/plan'
import { COMPLETION_STATUS_LABELS, SKIP_REASONS } from '@/common/utils/constants'
import { formatPace } from '@/common/utils/pace'

const trainingStore = useTrainingStore()
const planStore = usePlanStore()
const submitting = ref(false)
const showConfetti = ref(false)

const query = uni.createSelectorQuery()
const status = ref('done')

const difficultyLevels = [
  { value: 1, label: '太轻松' },
  { value: 2, label: '刚好' },
  { value: 3, label: '太累' }
]

const skipReasons = SKIP_REASONS

const statusLabel = computed(() => COMPLETION_STATUS_LABELS[status.value] || '完成')
const statusEmoji = computed(() => {
  const map = { done: '✅', partial: '⚠️', skipped: '⏭️' }
  return map[status.value] || '✅'
})

const form = reactive({
  distance: '',
  duration: '',
  avgHR: '',
  rpe: 5,
  difficulty: 2,
  note: '',
  skipReason: ''
})

const estimatedPace = computed(() => {
  if (!form.distance || !form.duration) return ''
  const km = parseFloat(form.distance)
  const min = parseFloat(form.duration)
  if (km <= 0 || min <= 0) return ''
  const pace = (min * 60) / km
  return formatPace(Math.round(pace))
})

async function handleSubmit() {
  submitting.value = true
  try {
    await trainingStore.submitFeedback({
      completion_status: status.value,
      actual_distance_km: form.distance ? parseFloat(form.distance) : undefined,
      actual_duration_min: form.duration ? parseFloat(form.duration) : undefined,
      actual_avg_hr: form.avgHR ? parseInt(form.avgHR) : undefined,
      rpe_actual: form.rpe,
      difficulty_rating: form.difficulty,
      feeling_note: form.note,
      skip_reason: status.value === 'skipped' ? form.skipReason : undefined,
      workout_date: new Date().toISOString().split('T')[0]
    })

    if (status.value === 'done') {
      showConfetti.value = true
      planStore.markWorkoutComplete('today', 'done')
      setTimeout(() => { showConfetti.value = false }, 3000)
    }

    uni.showToast({ title: '反馈已提交', icon: 'success' })
    setTimeout(() => { uni.navigateBack() }, 1200)
  } catch (err) {
    uni.showToast({ title: '提交失败', icon: 'error' })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 从页面参数读取状态
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  if (page?.options?.status) {
    status.value = page.options.status
  }
})
</script>

<style lang="scss" scoped>
.feedback-page { min-height: 100vh; background-color: $color-bg-primary; }
.feedback-content { padding: $spacing-md; }

.status-confirm { display: flex; flex-direction: column; align-items: center; padding: $spacing-md 0; }
.status-emoji { font-size: 56rpx; margin-bottom: $spacing-sm; }
.status-text { font-size: $font-size-base; color: $color-text-secondary; }

.form-group { margin-bottom: $spacing-lg; }
.form-label { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-sm; }
.form-input {
  background-color: $color-bg-input; border-radius: $radius-md;
  padding: $spacing-md; font-size: $font-size-md; color: $color-text-primary;
}
.pace-estimate { text-align: center; margin-top: $spacing-sm; text { font-size: $font-size-sm; color: $color-accent-light; } }

.skip-reasons { display: flex; flex-wrap: wrap; gap: $spacing-sm; }
.reason-chip {
  background: rgba(255,255,255,0.06); border-radius: $radius-round; padding: 12rpx 24rpx;
  &.active { background: rgba(255,107,53,0.2); text { color: $color-accent-light; } }
  text { font-size: $font-size-sm; color: $color-text-secondary; }
}

.difficulty-row { display: flex; gap: $spacing-sm; }
.diff-chip {
  flex: 1; background: $color-bg-input; border-radius: $radius-md;
  padding: $spacing-md; text-align: center; border: 2rpx solid transparent;
  &.active { border-color: $color-accent; }
  text { font-size: $font-size-md; color: $color-text-primary; }
}

.feeling-input {
  width: 100%; min-height: 160rpx; background: $color-bg-input; border-radius: $radius-md;
  padding: $spacing-md; font-size: $font-size-base; color: $color-text-primary; box-sizing: border-box;
}

.submit-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: $spacing-md $spacing-lg; padding-bottom: calc($spacing-md + env(safe-area-inset-bottom)); background: $color-bg-primary; }
.submit-btn {
  width: 100%; background: $color-accent; color: #fff; font-weight: 600;
  border-radius: $radius-round; padding: $spacing-md 0; border: none; font-size: $font-size-md;
}
</style>
