<template>
  <view class="skeleton-wrapper">
    <view v-for="i in count" :key="i" class="skeleton-card">
      <view class="skeleton-line skeleton-line--short" />
      <view class="skeleton-line skeleton-line--long" />
      <view class="skeleton-line skeleton-line--medium" />
    </view>
  </view>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 3 }
})
</script>

<style lang="scss" scoped>
.skeleton-wrapper {
  padding: $spacing-md;
}

.skeleton-card {
  background-color: $color-bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.skeleton-line {
  height: 24rpx;
  background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4rpx;
  margin-bottom: 16rpx;

  &:last-child { margin-bottom: 0; }
}

.skeleton-line--short { width: 35%; }
.skeleton-line--medium { width: 65%; }
.skeleton-line--long { width: 90%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
