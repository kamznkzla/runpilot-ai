<template>
  <view class="onboarding-page">
    <rp-navbar :showBack="true" title="目标设定" />
    <view class="step-indicator">
      <view v-for="i in 5" :key="i" class="step-dot" :class="{ active: i <= currentStep }" />
    </view>

    <view class="form-container">
      <view class="form-group">
        <text class="form-label">目标距离</text>
        <view class="options-grid two-col">
          <view
            v-for="dist in goalDistances"
            :key="dist.value"
            class="option-card"
            :class="{ active: form.goalDistance === dist.value }"
            @tap="selectGoalDistance(dist)"
          >
            <text class="option-label">{{ dist.label }}</text>
            <text class="option-desc">{{ dist.desc }}</text>
          </view>
        </view>
      </view>

      <view v-if="form.goalDistance" class="form-group">
        <text class="form-label">目标完赛时间</text>
        <view class="goal-time-row">
          <picker mode="multiSelector" :range="timePickers" :value="timePickerValue" @change="onTimeChange">
            <view class="picker-value">
              {{ timeDisplay || '点击选择目标时间' }}
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="time-presets">
          <view
            v-for="preset in timePresets"
            :key="preset.label"
            class="preset-chip"
            :class="{ active: preset.isSelected }"
            @tap="selectTimePreset(preset)"
          >
            <text>{{ preset.label }}</text>
          </view>
        </view>
        <text v-if="estimatedPace" class="pace-hint">目标配速约 {{ estimatedPace }}</text>
      </view>

      <view v-if="form.goalDistance" class="form-group">
        <text class="form-label">目标比赛日期（可选）</text>
        <picker mode="date" :value="form.raceDate" :start="minDate" @change="onDateChange">
          <view class="picker-value">
            {{ form.raceDate || '选择比赛日期' }}
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <view class="bottom-action">
      <view class="btn-row">
        <button class="btn-secondary" @tap="goBack">上一步</button>
        <button class="btn-accent" :disabled="!isValid" @tap="handleNext">下一步</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { parseRaceTime, formatPace, calcPaceFromResult } from '@/common/utils/pace'

const userStore = useUserStore()
const currentStep = 4

const goalDistances = [
  { value: '5k', label: '5 公里', desc: '入门首选', meters: 5000 },
  { value: '10k', label: '10 公里', desc: '进阶挑战', meters: 10000 },
  { value: 'half_marathon', label: '半程马拉松', desc: '21.0975km', meters: 21097.5 },
  { value: 'marathon', label: '全程马拉松', desc: '42.195km', meters: 42195 }
]

const timePresets = computed(() => {
  const presetsMap = {
    '5k': [
      { hours: 0, mins: 20, secs: 0, label: '20:00 (轻松完赛)' },
      { hours: 0, mins: 25, secs: 0, label: '25:00 (标准成绩)' },
      { hours: 0, mins: 30, secs: 0, label: '30:00 (完赛即可)' },
      { hours: 0, mins: 15, secs: 0, label: '15:00 (挑战自我)' }
    ],
    '10k': [
      { hours: 0, mins: 40, secs: 0, label: '40:00 (进阶水平)' },
      { hours: 0, mins: 50, secs: 0, label: '50:00 (标准成绩)' },
      { hours: 1, mins: 0, secs: 0, label: '1:00:00 (完赛即可)' },
      { hours: 0, mins: 35, secs: 0, label: '35:00 (挑战自我)' }
    ],
    'half_marathon': [
      { hours: 1, mins: 30, secs: 0, label: '1:30:00 (优秀)' },
      { hours: 1, mins: 45, secs: 0, label: '1:45:00 (良好)' },
      { hours: 2, mins: 0, secs: 0, label: '2:00:00 (完赛即可)' },
      { hours: 2, mins: 30, secs: 0, label: '2:30:00 (轻松完赛)' }
    ],
    'marathon': [
      { hours: 3, mins: 30, secs: 0, label: '3:30:00 (优秀)' },
      { hours: 4, mins: 0, secs: 0, label: '4:00:00 (良好)' },
      { hours: 4, mins: 30, secs: 0, label: '4:30:00 (完赛即可)' },
      { hours: 5, mins: 0, secs: 0, label: '5:00:00 (轻松完赛)' }
    ]
  }
  const presets = presetsMap[form.goalDistance] || []
  return presets.map(p => {
    const timeStr = `${String(p.hours).padStart(2,'0')}:${String(p.mins).padStart(2,'0')}:${String(p.secs).padStart(2,'0')}`
    return { ...p, timeStr, isSelected: form.goalTime === timeStr }
  })
})

const timePickers = [
  Array.from({ length: 7 }, (_, i) => String(i)),
  Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')),
  Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
]
const timePickerValue = ref([0, 0, 0])

const form = reactive({
  goalDistance: userStore.onboardingData.goal_distance || '',
  goalTime: userStore.onboardingData.goal_time_display || '',
  goalTimeSec: userStore.onboardingData.goal_time_sec || 0,
  raceDate: userStore.onboardingData.goal_race_date || ''
})

const minDate = new Date().toISOString().split('T')[0]

const timeDisplay = computed(() => {
  if (!form.goalTime) return ''
  return form.goalTime
})

const estimatedPace = computed(() => {
  if (!form.goalTimeSec || !form.goalDistance) return ''
  const dist = goalDistances.find(d => d.value === form.goalDistance)
  if (!dist) return ''
  const pace = calcPaceFromResult(dist.meters, form.goalTimeSec)
  return formatPace(pace)
})

const isValid = computed(() => form.goalDistance)

function selectGoalDistance(dist) {
  form.goalDistance = dist.value
  form.goalTime = ''
  form.goalTimeSec = 0
}

function selectTimePreset(preset) {
  form.goalTime = preset.timeStr
  form.goalTimeSec = preset.hours * 3600 + preset.mins * 60 + preset.secs
}

function onTimeChange(e) {
  const [h, m, s] = e.detail.value
  timePickerValue.value = [h, m, s]
  const hh = String(h).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  form.goalTime = `${hh}:${mm}:${ss}`
  form.goalTimeSec = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s)
}

function onDateChange(e) {
  form.raceDate = e.detail.value
}

function goBack() { uni.navigateBack() }

function handleNext() {
  userStore.updateOnboardingData({
    goal_distance: form.goalDistance,
    goal_time_sec: form.goalTimeSec,
    goal_time_display: form.goalTime,
    goal_race_date: form.raceDate
  })
  userStore.setOnboardingStep(5)
  uni.navigateTo({ url: '/subpkg-onboarding/pages/step5-device' })
}
</script>

<style lang="scss" scoped>
.onboarding-page { min-height: 100vh; background-color: $color-bg-primary; }
.step-indicator { display: flex; justify-content: center; gap: $spacing-sm; padding: $spacing-lg 0; }
.step-dot { width: 60rpx; height: 6rpx; border-radius: 3rpx; background: rgba(255,255,255,0.1); &.active { background: $color-accent; } }
.form-container { padding: 0 $spacing-xl; }
.form-group { margin-bottom: $spacing-lg; }
.form-label { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-sm; }
.options-grid { display: flex; flex-direction: column; gap: $spacing-sm; }
.options-grid.two-col { flex-direction: row; flex-wrap: wrap; }
.options-grid.two-col .option-card { flex: 1; min-width: 45%; }
.option-card {
  background-color: $color-bg-input; border-radius: $radius-md; padding: $spacing-md;
  border: 2rpx solid transparent; text-align: center;
  &.active { border-color: $color-accent; background-color: rgba(255,107,53,0.1); }
}
.option-label { font-size: $font-size-md; color: $color-text-primary; font-weight: 500; display: block; }
.option-desc { font-size: $font-size-xs; color: $color-text-muted; margin-top: 4rpx; }
.picker-value {
  background-color: $color-bg-input; border-radius: $radius-md;
  padding: $spacing-md; font-size: $font-size-md; color: $color-text-primary;
  display: flex; justify-content: space-between; align-items: center;
}
.picker-arrow { font-size: $font-size-xs; color: $color-text-muted; }
.time-presets { display: flex; flex-wrap: wrap; gap: $spacing-sm; margin-top: $spacing-sm; }
.preset-chip {
  background: rgba(255,255,255,0.06); border-radius: $radius-round; padding: 10rpx 24rpx;
  font-size: $font-size-sm; color: $color-text-secondary;
  &.active { background: rgba(255,107,53,0.2); color: $color-accent-light; border: 1rpx solid rgba(255,107,53,0.3); }
}
.pace-hint { font-size: $font-size-sm; color: $color-accent-light; display: block; margin-top: $spacing-sm; }
.bottom-action { position: fixed; bottom: 0; left: 0; right: 0; padding: $spacing-lg $spacing-xl; }
.btn-row { display: flex; gap: $spacing-md; }
.btn-accent {
  flex: 2; background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  color: #fff; font-size: $font-size-md; font-weight: 600; border-radius: $radius-round;
  padding: $spacing-md 0; text-align: center; border: none; &[disabled] { opacity: 0.4; }
}
.btn-secondary { flex: 1; background-color: $color-bg-input; color: $color-text-secondary; font-size: $font-size-md; border-radius: $radius-round; padding: $spacing-md 0; text-align: center; border: none; }
</style>
