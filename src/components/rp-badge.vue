<template>
  <view class="rp-badge" :class="[`rp-badge--${rarity}`, { 'rp-badge--locked': locked }]">
    <view class="badge-icon-wrap">
      <text class="badge-icon">{{ locked ? '🔒' : (icon || '🏅') }}</text>
    </view>
    <text class="badge-name">{{ locked ? '???' : name }}</text>
    <text v-if="!locked && unlockedAt" class="badge-date">{{ unlockedAt }}</text>
  </view>
</template>

<script setup>
defineProps({
  name: { type: String, default: '' },
  icon: { type: String, default: '' },
  rarity: { type: String, default: 'common' },
  locked: { type: Boolean, default: false },
  unlockedAt: { type: String, default: '' }
})
</script>

<style lang="scss" scoped>
.rp-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md;
  width: 160rpx;
}

.rp-badge--locked {
  opacity: 0.4;
}

.badge-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-circle;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-sm;
}

.rp-badge--common .badge-icon-wrap { border: 2rpx solid #B0B3C0; }
.rp-badge--rare .badge-icon-wrap { border: 2rpx solid #42A5F5; box-shadow: 0 0 12rpx rgba(66, 165, 245, 0.3); }
.rp-badge--epic .badge-icon-wrap { border: 2rpx solid #AB47BC; box-shadow: 0 0 16rpx rgba(171, 71, 188, 0.3); }
.rp-badge--legendary .badge-icon-wrap { border: 2rpx solid #FFB74D; box-shadow: 0 0 20rpx rgba(255, 183, 77, 0.4); }

.badge-icon { font-size: 36rpx; }

.badge-name {
  font-size: $font-size-xs;
  color: $color-text-secondary;
  text-align: center;
  line-height: 1.3;
}

.badge-date {
  font-size: 18rpx;
  color: $color-text-muted;
  margin-top: 4rpx;
}
</style>
