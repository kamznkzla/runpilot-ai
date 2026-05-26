<template>
  <view
    class="rp-card"
    :class="[
      `rp-card--${variant}`,
      { 'rp-card--tappable': tappable, 'rp-card--accent': accent }
    ]"
    @tap="handleTap"
  >
    <view v-if="title || $slots.header" class="rp-card-header">
      <text v-if="title" class="rp-card-title">{{ title }}</text>
      <slot name="header" />
    </view>

    <view class="rp-card-body">
      <slot />
    </view>

    <view v-if="$slots.footer" class="rp-card-footer">
      <slot name="footer" />
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  variant: { type: String, default: 'default' },
  tappable: { type: Boolean, default: false },
  accent: { type: Boolean, default: false }
})

const emit = defineEmits(['tap'])

function handleTap() {
  if (props.tappable) emit('tap')
}
</script>

<style lang="scss" scoped>
.rp-card {
  background-color: $color-bg-card;
  border-radius: $radius-lg;
  padding: $card-padding;
  margin-bottom: $spacing-md;
  position: relative;
  overflow: hidden;
}

.rp-card--accent {
  border-left: 4rpx solid $color-accent;
}

.rp-card--tappable {
  &:active {
    background-color: $color-bg-card-hover;
    transform: scale(0.98);
  }
}

.rp-card--elevated {
  box-shadow: $shadow-card;
}

.rp-card--glow {
  box-shadow: $shadow-glow;
}

.rp-card-header {
  margin-bottom: $spacing-sm;
}

.rp-card-title {
  font-size: $font-size-md;
  font-weight: 600;
  color: $color-text-primary;
}

.rp-card-body {
  color: $color-text-secondary;
}

.rp-card-footer {
  margin-top: $spacing-md;
  padding-top: $spacing-sm;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
}
</style>
