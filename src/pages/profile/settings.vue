<template>
  <view class="settings-page">
    <rp-navbar :showBack="true" title="设置" />

    <view class="settings-content">
      <view class="settings-group">
        <text class="group-title">通知设置</text>
        <view class="setting-item">
          <text class="setting-label">训练提醒</text>
          <switch :checked="settingsStore.trainingReminder" color="#FF6B35" @change="settingsStore.toggleTrainingReminder()" />
        </view>
        <view class="setting-item">
          <text class="setting-label">比赛倒计时提醒</text>
          <switch :checked="settingsStore.raceCountdownReminder" color="#FF6B35" @change="settingsStore.toggleRaceCountdown()" />
        </view>
        <view class="setting-item">
          <text class="setting-label">周报推送</text>
          <switch :checked="settingsStore.weeklyReportReminder" color="#FF6B35" @change="settingsStore.toggleWeeklyReport()" />
        </view>
      </view>

      <view class="settings-group">
        <text class="group-title">隐私</text>
        <view class="setting-item">
          <text class="setting-label">数据共享</text>
          <switch :checked="settingsStore.privacyShareData" color="#FF6B35" @change="settingsStore.togglePrivacy()" />
        </view>
        <view class="setting-item" @tap="handleExport">
          <text class="setting-label">导出数据</text>
          <text class="setting-arrow">→</text>
        </view>
      </view>

      <view class="settings-group">
        <text class="group-title">关于</text>
        <view class="setting-item">
          <text class="setting-label">版本</text>
          <text class="setting-value">1.0.1</text>
        </view>
        <view class="setting-item">
          <text class="setting-label">用户协议</text>
          <text class="setting-arrow">→</text>
        </view>
        <view class="setting-item">
          <text class="setting-label">隐私政策</text>
          <text class="setting-arrow">→</text>
        </view>
      </view>

      <button class="logout-btn" @tap="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { useSettingsStore } from '@/stores/modules/settings'
import { useUserStore } from '@/stores/modules/user'

const settingsStore = useSettingsStore()
const userStore = useUserStore()

function handleExport() {
  uni.showToast({ title: '数据导出中...', icon: 'loading' })
  // 导出训练数据为 JSON
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '退出后需要重新完成引导设置',
    success: async (res) => {
      if (res.confirm) {
        await userStore.logout()
        uni.reLaunch({ url: '/subpkg-onboarding/pages/step1-profile' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.settings-page { min-height: 100vh; background-color: $color-bg-primary; }
.settings-content { padding: $spacing-md; }
.settings-group { margin-bottom: $spacing-lg; }
.group-title { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-sm; padding: 0 $spacing-xs; }
.setting-item {
  background: $color-bg-card; padding: $spacing-md $spacing-lg;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rpx;
  &:first-of-type { border-radius: $radius-md $radius-md 0 0; }
  &:last-of-type { border-radius: 0 0 $radius-md $radius-md; margin-bottom: 0; }
  &:only-of-type { border-radius: $radius-md; }
}
.setting-label { font-size: $font-size-md; color: $color-text-primary; }
.setting-value { font-size: $font-size-sm; color: $color-text-muted; }
.setting-arrow { font-size: $font-size-sm; color: $color-text-muted; }
.logout-btn {
  width: 100%; background: transparent; border: 2rpx solid $color-error;
  color: $color-error; font-size: $font-size-md; border-radius: $radius-round;
  padding: $spacing-md 0; margin-top: $spacing-xxl;
}
</style>
