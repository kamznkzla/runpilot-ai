<template>
  <view class="share-settings-page">
    <rp-navbar :showBack="true" title="分享设置" />

    <view class="settings-content">
      <view class="settings-group">
        <text class="group-title">分享内容</text>
        <view class="setting-item">
          <text class="setting-label">包含路线图</text>
          <switch :checked="showRoute" color="#FF6B35" @change="showRoute = $event.detail.value" />
        </view>
        <view class="setting-item">
          <text class="setting-label">包含心率数据</text>
          <switch :checked="showHeartRate" color="#FF6B35" @change="showHeartRate = $event.detail.value" />
        </view>
        <view class="setting-item">
          <text class="setting-label">包含配速数据</text>
          <switch :checked="showPace" color="#FF6B35" @change="showPace = $event.detail.value" />
        </view>
        <view class="setting-item">
          <text class="setting-label">包含AI评语</text>
          <switch :checked="showAIComment" color="#FF6B35" @change="showAIComment = $event.detail.value" />
        </view>
      </view>

      <view class="settings-group">
        <text class="group-title">水印设置</text>
        <view class="setting-item">
          <text class="setting-label">显示 RunPilot Logo</text>
          <switch :checked="showLogo" color="#FF6B35" @change="showLogo = $event.detail.value" />
        </view>
        <view class="setting-item">
          <text class="setting-label">显示二维码</text>
          <switch :checked="showQRCode" color="#FF6B35" @change="showQRCode = $event.detail.value" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const showRoute = ref(false)
const showHeartRate = ref(false)
const showPace = ref(true)
const showAIComment = ref(true)
const showLogo = ref(true)
const showQRCode = ref(true)
</script>

<style lang="scss" scoped>
.share-settings-page { min-height: 100vh; background-color: $color-bg-primary; }
.settings-content { padding: $spacing-md; }
.settings-group { margin-bottom: $spacing-lg; }
.group-title { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-sm; padding: 0 $spacing-xs; }
.setting-item {
  background: $color-bg-card; padding: $spacing-md $spacing-lg;
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rpx;
  &:first-of-type { border-radius: $radius-md $radius-md 0 0; }
  &:last-of-type { border-radius: 0 0 $radius-md $radius-md; margin-bottom: 0; }
}
.setting-label { font-size: $font-size-md; color: $color-text-primary; }
</style>
