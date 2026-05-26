<template>
  <view class="rp-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="rp-navbar-inner">
      <view class="rp-navbar-left" @tap="handleBack">
        <view v-if="showBack" class="rp-navbar-back">
          <text class="back-icon">&lt;</text>
        </view>
        <slot name="left" />
      </view>

      <view class="rp-navbar-center">
        <text class="rp-navbar-title">{{ title }}</text>
        <text v-if="subtitle" class="rp-navbar-subtitle">{{ subtitle }}</text>
      </view>

      <view class="rp-navbar-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: { type: String, default: 'RunPilot' },
  subtitle: { type: String, default: '' },
  showBack: { type: Boolean, default: false }
})

const emit = defineEmits(['back'])

const statusBarHeight = ref(20)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
})

function handleBack() {
  if (props.showBack) {
    emit('back')
    uni.navigateBack({ delta: 1 })
  }
}
</script>

<style lang="scss" scoped>
.rp-navbar {
  background-color: $color-bg-secondary;
  width: 100%;
  z-index: 100;
}

.rp-navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 $spacing-md;
}

.rp-navbar-left, .rp-navbar-right {
  min-width: 100rpx;
  display: flex;
  align-items: center;
}

.rp-navbar-right {
  justify-content: flex-end;
}

.rp-navbar-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.rp-navbar-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-primary;
}

.rp-navbar-subtitle {
  font-size: $font-size-xs;
  color: $color-text-muted;
  margin-top: 2rpx;
}

.rp-navbar-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .back-icon {
    font-size: $font-size-lg;
    color: $color-text-primary;
    font-weight: 300;
  }
}
</style>
