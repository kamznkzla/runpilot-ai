<template>
  <view class="onboarding-page">
    <rp-navbar :showBack="true" title="历史成绩" />
    <view class="step-indicator">
      <view v-for="i in 5" :key="i" class="step-dot" :class="{ active: i <= currentStep }" />
    </view>

    <view class="form-container">
      <text class="section-desc">输入你最近的最好成绩，帮助我们更准确地评估你的跑步能力</text>

      <view v-for="dist in distances" :key="dist.value" class="form-group">
        <text class="form-label">{{ dist.label }}</text>
        <view class="record-row">
          <input
            class="time-input"
            v-model="form[dist.value]"
            placeholder="--:--:-- 或 --:--"
            placeholder-style="color: #6B6E7D"
            @blur="onTimeBlur(dist.value)"
          />
          <button v-if="form[dist.value]" class="btn-clear" @tap="form[dist.value] = ''">清除</button>
        </view>
        <text v-if="pacedPace[dist.value]" class="pace-hint">
          约 {{ pacedPace[dist.value] }} 配速
        </text>
      </view>
    </view>

    <view class="bottom-action">
      <view class="btn-row">
        <button class="btn-secondary" @tap="goBack">上一步</button>
        <button class="btn-accent" @tap="handleNext">下一步</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { parseRaceTime, formatPace, calcPaceFromResult } from '@/common/utils/pace'

const userStore = useUserStore()
const currentStep = 3

const distances = [
  { value: '1k', label: '1 公里', meters: 1000 },
  { value: '3k', label: '3 公里', meters: 3000 },
  { value: '5k', label: '5 公里', meters: 5000 },
  { value: '10k', label: '10 公里', meters: 10000 },
  { value: 'half_marathon', label: '半程马拉松', meters: 21097.5 },
  { value: 'marathon', label: '全程马拉松', meters: 42195 }
]

const form = reactive({
  '1k': userStore.onboardingData.recent_races?.['1k'] || '',
  '3k': userStore.onboardingData.recent_races?.['3k'] || '',
  '5k': userStore.onboardingData.recent_races?.['5k'] || '',
  '10k': userStore.onboardingData.recent_races?.['10k'] || '',
  half_marathon: userStore.onboardingData.recent_races?.half_marathon || '',
  marathon: userStore.onboardingData.recent_races?.marathon || ''
})

const pacedPace = reactive({})

function onTimeBlur(distValue) {
  const timeStr = form[distValue]
  if (!timeStr) { pacedPace[distValue] = ''; return }
  const secs = parseRaceTime(timeStr)
  if (secs > 0) {
    const dist = distances.find(d => d.value === distValue)
    const pace = calcPaceFromResult(dist.meters, secs)
    pacedPace[distValue] = formatPace(pace)
  }
}

function goBack() { uni.navigateBack() }

function handleNext() {
  const recentRaces = {}
  distances.forEach(d => {
    const timeStr = form[d.value]
    if (timeStr && timeStr.trim()) {
      const secs = parseRaceTime(timeStr)
      if (secs > 0) {
        recentRaces[d.value] = { distance: d.value, time_sec: secs, time_display: timeStr }
      }
    }
  })
  userStore.updateOnboardingData({ recent_races: recentRaces })
  userStore.setOnboardingStep(4)
  uni.navigateTo({ url: '/subpkg-onboarding/pages/step4-goal' })
}
</script>

<style lang="scss" scoped>
.onboarding-page { min-height: 100vh; background-color: $color-bg-primary; }
.step-indicator { display: flex; justify-content: center; gap: $spacing-sm; padding: $spacing-lg 0; }
.step-dot { width: 60rpx; height: 6rpx; border-radius: 3rpx; background: rgba(255,255,255,0.1); &.active { background: $color-accent; } }
.form-container { padding: 0 $spacing-xl; }
.section-desc { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-lg; text-align: center; }
.form-group { margin-bottom: $spacing-lg; }
.form-label { font-size: $font-size-sm; color: $color-text-secondary; display: block; margin-bottom: $spacing-xs; }
.record-row { display: flex; gap: $spacing-sm; align-items: center; }
.time-input {
  flex: 1; background-color: $color-bg-input; border-radius: $radius-md;
  padding: $spacing-md; font-size: $font-size-md; color: $color-text-primary;
  font-family: $font-family-number;
  &:focus { border: 1rpx solid $color-accent; }
}
.btn-clear { background: none; color: $color-text-muted; font-size: $font-size-sm; padding: $spacing-xs $spacing-sm; border: none; }
.pace-hint { font-size: $font-size-xs; color: $color-accent-light; display: block; margin-top: 4rpx; padding-left: 8rpx; }
.bottom-action { position: fixed; bottom: 0; left: 0; right: 0; padding: $spacing-lg $spacing-xl; }
.btn-row { display: flex; gap: $spacing-md; }
.btn-accent {
  flex: 2; background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  color: #fff; font-size: $font-size-md; font-weight: 600; border-radius: $radius-round;
  padding: $spacing-md 0; text-align: center; border: none;
}
.btn-secondary {
  flex: 1; background-color: $color-bg-input; color: $color-text-secondary;
  font-size: $font-size-md; border-radius: $radius-round; padding: $spacing-md 0; text-align: center; border: none;
}
</style>
