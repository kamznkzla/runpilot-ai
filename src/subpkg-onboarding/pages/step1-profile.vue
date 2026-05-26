<template>
  <view class="onboarding-page">
    <rp-navbar :showBack="true" title="基本信息" />
    <view class="step-indicator">
      <view v-for="i in 5" :key="i" class="step-dot" :class="{ active: i <= currentStep }" />
    </view>

    <view class="form-container">
      <view class="form-group">
        <text class="form-label">年龄</text>
        <input class="form-input" type="number" v-model="form.age" placeholder="输入你的年龄" placeholder-style="color: #6B6E7D" />
      </view>

      <view class="form-group">
        <text class="form-label">性别</text>
        <view class="gender-toggle">
          <view class="gender-btn" :class="{ active: form.gender === 'male' }" @tap="form.gender = 'male'">
            <text class="gender-emoji">👨</text>
            <text>男</text>
          </view>
          <view class="gender-btn" :class="{ active: form.gender === 'female' }" @tap="form.gender = 'female'">
            <text class="gender-emoji">👩</text>
            <text>女</text>
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">身高 (cm)</text>
        <input class="form-input" type="digit" v-model="form.height" placeholder="如 175" placeholder-style="color: #6B6E7D" />
      </view>

      <view class="form-group">
        <text class="form-label">体重 (kg)</text>
        <input class="form-input" type="digit" v-model="form.weight" placeholder="如 70" placeholder-style="color: #6B6E7D" />
      </view>
    </view>

    <view class="bottom-action">
      <button class="btn-accent" :disabled="!isValid" @tap="handleNext">下一步</button>
    </view>
  </view>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const currentStep = 1

const form = reactive({
  age: userStore.onboardingData.age || '',
  gender: userStore.onboardingData.gender || 'male',
  height: userStore.onboardingData.height || '',
  weight: userStore.onboardingData.weight || ''
})

const isValid = computed(() => form.age && form.height && form.weight && form.gender)

function handleNext() {
  userStore.updateOnboardingData({
    age: Number(form.age),
    gender: form.gender,
    height_cm: Number(form.height),
    weight_kg: Number(form.weight)
  })
  userStore.setOnboardingStep(2)
  uni.navigateTo({ url: '/subpkg-onboarding/pages/step2-experience' })
}
</script>

<style lang="scss" scoped>
.onboarding-page {
  min-height: 100vh;
  background-color: $color-bg-primary;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-lg 0;
}

.step-dot {
  width: 60rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: rgba(255, 255, 255, 0.1);

  &.active {
    background: $color-accent;
  }
}

.form-container {
  padding: 0 $spacing-xl;
}

.form-group {
  margin-bottom: $spacing-lg;
}

.form-label {
  font-size: $font-size-sm;
  color: $color-text-muted;
  display: block;
  margin-bottom: $spacing-sm;
}

.form-input {
  background-color: $color-bg-input;
  border-radius: $radius-md;
  padding: $spacing-md;
  font-size: $font-size-md;
  color: $color-text-primary;
  border: 1rpx solid transparent;

  &:focus {
    border-color: $color-accent;
  }
}

.gender-toggle {
  display: flex;
  gap: $spacing-md;
}

.gender-btn {
  flex: 1;
  background-color: $color-bg-input;
  border-radius: $radius-md;
  padding: $spacing-md;
  text-align: center;
  font-size: $font-size-md;
  color: $color-text-secondary;
  border: 2rpx solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;

  &.active {
    border-color: $color-accent;
    color: $color-text-primary;
    background-color: rgba(255, 107, 53, 0.1);
  }
}

.gender-emoji {
  font-size: $font-size-lg;
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-lg $spacing-xl;
}

.btn-accent {
  width: 100%;
  background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  color: #fff;
  font-size: $font-size-md;
  font-weight: 600;
  border-radius: $radius-round;
  padding: $spacing-md 0;
  text-align: center;
  border: none;

  &[disabled] {
    opacity: 0.4;
  }
}
</style>
