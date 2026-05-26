<template>
  <view class="empty-state">
    <text class="empty-icon">{{ icon }}</text>
    <text class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-desc">{{ description }}</text>
    <view v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </view>
  </view>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' }
})
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xxl $spacing-lg;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-md;
}

.empty-title {
  font-size: $font-size-md;
  color: $color-text-secondary;
  font-weight: 500;
}

.empty-desc {
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin-top: $spacing-sm;
  text-align: center;
}

.empty-action {
  margin-top: $spacing-lg;
}
</style>
