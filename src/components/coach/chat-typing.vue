<template>
  <view class="chat-typing">
    <view class="typing-avatar">
      <text class="avatar-text">AI</text>
    </view>
    <view class="typing-bubble">
      <view class="typing-dots">
        <view class="typing-dot" :style="{ animationDelay: '0s' }" />
        <view class="typing-dot" :style="{ animationDelay: '0.15s' }" />
        <view class="typing-dot" :style="{ animationDelay: '0.3s' }" />
      </view>
    </view>
  </view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.chat-typing {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
}

.typing-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-circle;
  background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .avatar-text {
    font-size: $font-size-xs;
    font-weight: 700;
    color: #fff;
  }
}

.typing-bubble {
  background-color: $color-bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
}

.typing-dots {
  display: flex;
  gap: 8rpx;
}

.typing-dot {
  width: 12rpx;
  height: 12rpx;
  background-color: $color-accent;
  border-radius: 50%;
  animation: typing-bounce 0.6s infinite;
}

@keyframes typing-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-8rpx); opacity: 1; }
}
</style>
