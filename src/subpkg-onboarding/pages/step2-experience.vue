<template>
  <view class="onboarding-page">
    <rp-navbar :showBack="true" title="跑步经验" />
    <view class="step-indicator">
      <view v-for="i in 5" :key="i" class="step-dot" :class="{ active: i <= currentStep }" />
    </view>

    <view class="form-container">
      <view class="form-group">
        <text class="form-label">跑龄</text>
        <picker :range="runAges" :value="runAgeIndex" @change="onRunAgeChange">
          <view class="picker-value">{{ form.runAge || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">目前每周跑量</text>
        <picker :range="weeklyVolumes" :value="volumeIndex" @change="onVolumeChange">
          <view class="picker-value">{{ form.weeklyVolume || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">每周可训练天数</text>
        <view class="options-grid">
          <view
            v-for="opt in dayOptions"
            :key="opt.value"
            class="option-card"
            :class="{ active: form.weeklyDays === opt.value }"
            @tap="form.weeklyDays = opt.value"
          >
            <text class="option-label">{{ opt.label }}</text>
            <text class="option-desc">{{ opt.desc }}</text>
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">跑步经验水平</text>
        <view class="options-grid">
          <view
            v-for="opt in expOptions"
            :key="opt.value"
            class="option-card"
            :class="{ active: form.experience === opt.value }"
            @tap="form.experience = opt.value"
          >
            <text class="option-label">{{ opt.label }}</text>
            <text class="option-desc">{{ opt.desc }}</text>
          </view>
        </view>
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

const userStore = useUserStore()
const currentStep = 2

const runAges = ['6个月以内', '6个月-1年', '1-2年', '2-3年', '3-5年', '5年以上']
const weeklyVolumes = ['10km以下', '10-20km', '20-40km', '40-60km', '60-80km', '80km以上']
const dayOptions = [
  { value: '2-3', label: '2-3 天', desc: '时间有限' },
  { value: '4-5', label: '4-5 天', desc: '适中强度' },
  { value: '6-7', label: '6-7 天', desc: '全力投入' }
]
const expOptions = [
  { value: 'beginner', label: '新手', desc: '开始跑步不足6个月' },
  { value: 'intermediate', label: '进阶', desc: '有规律跑步，完成过10K' },
  { value: 'advanced', label: '高阶', desc: '跑龄2年以上，完成过半马/全马' }
]

const runAgeIndex = ref(0)
const volumeIndex = ref(0)

const form = reactive({
  runAge: userStore.onboardingData.runAge || '',
  weeklyVolume: userStore.onboardingData.weeklyVolume || '',
  weeklyDays: userStore.onboardingData.weeklyDays || '',
  experience: userStore.onboardingData.experience || ''
})

const isValid = computed(() => form.runAge && form.weeklyDays && form.experience)

function onRunAgeChange(e) {
  runAgeIndex.value = e.detail.value
  form.runAge = runAges[e.detail.value]
}
function onVolumeChange(e) {
  volumeIndex.value = e.detail.value
  form.weeklyVolume = weeklyVolumes[e.detail.value]
}

function goBack() { uni.navigateBack() }

function handleNext() {
  userStore.updateOnboardingData({
    runAge: form.runAge,
    weeklyVolume: form.weeklyVolume,
    weeklyDays: form.weeklyDays,
    running_experience: form.experience
  })
  userStore.setOnboardingStep(3)
  uni.navigateTo({ url: '/subpkg-onboarding/pages/step3-records' })
}
</script>

<style lang="scss" scoped>
.onboarding-page { min-height: 100vh; background-color: $color-bg-primary; }
.step-indicator { display: flex; justify-content: center; gap: $spacing-sm; padding: $spacing-lg 0; }
.step-dot { width: 60rpx; height: 6rpx; border-radius: 3rpx; background: rgba(255,255,255,0.1); &.active { background: $color-accent; } }
.form-container { padding: 0 $spacing-xl; }
.form-group { margin-bottom: $spacing-lg; }
.form-label { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-sm; }
.picker-value {
  background-color: $color-bg-input; border-radius: $radius-md;
  padding: $spacing-md; font-size: $font-size-md; color: $color-text-primary;
}
.options-grid { display: flex; flex-direction: column; gap: $spacing-sm; }
.option-card {
  background-color: $color-bg-input; border-radius: $radius-md; padding: $spacing-md;
  border: 2rpx solid transparent;
  &.active { border-color: $color-accent; background-color: rgba(255, 107, 53, 0.1); }
}
.option-label { font-size: $font-size-md; color: $color-text-primary; font-weight: 500; display: block; margin-bottom: 4rpx; }
.option-desc { font-size: $font-size-xs; color: $color-text-muted; }
.bottom-action { position: fixed; bottom: 0; left: 0; right: 0; padding: $spacing-lg $spacing-xl; }
.btn-row { display: flex; gap: $spacing-md; }
.btn-accent {
  flex: 2; background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  color: #fff; font-size: $font-size-md; font-weight: 600; border-radius: $radius-round;
  padding: $spacing-md 0; text-align: center; border: none;
  &[disabled] { opacity: 0.4; }
}
.btn-secondary {
  flex: 1; background-color: $color-bg-input;
  color: $color-text-secondary; font-size: $font-size-md; border-radius: $radius-round;
  padding: $spacing-md 0; text-align: center; border: none;
}
</style>
