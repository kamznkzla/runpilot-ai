<template>
  <view class="onboarding-page">
    <rp-navbar :showBack="true" title="设备绑定" />
    <view class="step-indicator">
      <view v-for="i in 5" :key="i" class="step-dot" :class="{ active: i <= currentStep }" />
    </view>

    <view class="form-container">
      <text class="section-desc">授权同步你的运动数据，让训练计划更精准</text>

      <view class="platform-list">
        <view
          v-for="p in platforms"
          :key="p.value"
          class="platform-item"
          :class="{ connected: form.devices.includes(p.value) }"
        >
          <view class="platform-info">
            <text class="platform-emoji">{{ p.emoji }}</text>
            <view class="platform-meta">
              <text class="platform-name">{{ p.label }}</text>
              <text class="platform-desc">{{ p.desc }}</text>
            </view>
          </view>
          <switch
            :checked="form.devices.includes(p.value)"
            :color="'#FF6B35'"
            @change="(e) => toggleDevice(p.value, e.detail.value)"
          />
        </view>
      </view>

      <view class="skip-hint">
        <text class="hint-text">可稍后在"个人中心 → 设置"中配置</text>
      </view>
    </view>

    <view class="bottom-action">
      <view class="btn-row">
        <button class="btn-secondary" @tap="goBack">上一步</button>
        <button class="btn-accent" :loading="submitting" @tap="handleComplete">
          {{ submitting ? '正在设置...' : '完成设置' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const currentStep = 5
const submitting = ref(false)

const platforms = [
  { value: 'garmin', label: 'Garmin Connect', desc: 'Garmin 手表数据同步', emoji: '⌚' },
  { value: 'apple_health', label: 'Apple Health', desc: 'iPhone/Apple Watch 健康数据', emoji: '🍎' },
  { value: 'strava', label: 'Strava', desc: '全球跑者社区平台', emoji: '🏃' },
  { value: 'coros', label: 'Coros', desc: '高驰运动手表', emoji: '⛰' },
  { value: 'keep', label: 'Keep', desc: '国内健身运动平台', emoji: '💪' }
]

const form = reactive({
  devices: userStore.onboardingData.connected_devices || []
})

function toggleDevice(platform, checked) {
  if (checked) {
    if (!form.devices.includes(platform)) form.devices.push(platform)
  } else {
    const idx = form.devices.indexOf(platform)
    if (idx > -1) form.devices.splice(idx, 1)
  }
}

function goBack() { uni.navigateBack() }

async function handleComplete() {
  submitting.value = true
  try {
    userStore.updateOnboardingData({ connected_devices: form.devices })
    await userStore.completeOnboarding()
    uni.showToast({ title: '设置完成！', icon: 'success', duration: 1500 })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/dashboard/index' })
    }, 1500)
  } catch (err) {
    uni.showToast({ title: '保存失败，请重试', icon: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.onboarding-page { min-height: 100vh; background-color: $color-bg-primary; }
.step-indicator { display: flex; justify-content: center; gap: $spacing-sm; padding: $spacing-lg 0; }
.step-dot { width: 60rpx; height: 6rpx; border-radius: 3rpx; background: rgba(255,255,255,0.1); &.active { background: $color-accent; } }
.form-container { padding: 0 $spacing-xl; }
.section-desc { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-lg; text-align: center; }
.platform-list { display: flex; flex-direction: column; gap: $spacing-sm; }
.platform-item {
  background-color: $color-bg-card; border-radius: $radius-md; padding: $spacing-md;
  display: flex; align-items: center; justify-content: space-between;
  border: 2rpx solid transparent;
  &.connected { border-color: rgba(255,107,53,0.3); }
}
.platform-info { display: flex; align-items: center; gap: $spacing-md; }
.platform-emoji { font-size: 40rpx; }
.platform-meta { display: flex; flex-direction: column; }
.platform-name { font-size: $font-size-md; color: $color-text-primary; font-weight: 500; }
.platform-desc { font-size: $font-size-xs; color: $color-text-muted; margin-top: 2rpx; }
.skip-hint { text-align: center; margin-top: $spacing-xl; }
.hint-text { font-size: $font-size-xs; color: $color-text-muted; }
.bottom-action { position: fixed; bottom: 0; left: 0; right: 0; padding: $spacing-lg $spacing-xl; }
.btn-row { display: flex; gap: $spacing-md; }
.btn-accent {
  flex: 2; background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  color: #fff; font-size: $font-size-md; font-weight: 600; border-radius: $radius-round;
  padding: $spacing-md 0; text-align: center; border: none;
}
.btn-secondary { flex: 1; background-color: $color-bg-input; color: $color-text-secondary; font-size: $font-size-md; border-radius: $radius-round; padding: $spacing-md 0; text-align: center; border: none; }
</style>
