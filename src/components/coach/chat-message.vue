<template>
  <view class="chat-message" :class="[`chat-message--${role}`]">
    <view class="chat-avatar">
      <view v-if="role === 'assistant'" class="avatar-ai">
        <text class="avatar-text">AI</text>
      </view>
      <view v-else class="avatar-user">
        <text class="avatar-text">我</text>
      </view>
    </view>
    <view class="chat-body">
      <view class="chat-bubble">
        <text class="chat-content" :selectable="true">{{ content }}</text>
        <view v-if="isStreaming" class="typing-cursor" />
      </view>
      <text v-if="timestamp" class="chat-time">{{ formatTime(timestamp) }}</text>
      <view v-if="chips && chips.length > 0" class="chat-chips">
        <view
          v-for="(chip, i) in chips"
          :key="i"
          class="chat-chip"
          @tap="$emit('chipTap', chip)"
        >
          <text class="chip-text">{{ chip.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  role: { type: String, default: 'user' },
  content: { type: String, default: '' },
  timestamp: { type: String, default: '' },
  isStreaming: { type: Boolean, default: false },
  chips: { type: Array, default: () => [] }
})

defineEmits(['chipTap'])

function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.chat-message {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
}

.chat-message--user {
  flex-direction: row-reverse;
}

.chat-avatar {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
}

.avatar-ai, .avatar-user {
  width: 100%;
  height: 100%;
  border-radius: $radius-circle;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-ai {
  background: linear-gradient(135deg, $color-accent, $color-accent-dark);
}

.avatar-user {
  background: linear-gradient(135deg, #42A5F5, #1976D2);
}

.avatar-text {
  font-size: $font-size-xs;
  font-weight: 700;
  color: #fff;
}

.chat-body {
  max-width: 75%;
  display: flex;
  flex-direction: column;
}

.chat-message--user .chat-body {
  align-items: flex-end;
}

.chat-bubble {
  background-color: $color-bg-card;
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;
  position: relative;
}

.chat-message--user .chat-bubble {
  background-color: $color-accent;
}

.chat-content {
  font-size: $font-size-base;
  line-height: 1.6;
  color: $color-text-primary;
  white-space: pre-wrap;
  word-break: break-word;
}

.typing-cursor {
  display: inline-block;
  width: 4rpx;
  height: 32rpx;
  background-color: $color-accent;
  margin-left: 4rpx;
  animation: blink 0.8s infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.chat-time {
  font-size: 18rpx;
  color: $color-text-muted;
  margin-top: 4rpx;
}

.chat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-top: $spacing-sm;
}

.chat-chip {
  background: rgba(255, 107, 53, 0.15);
  border: 1rpx solid rgba(255, 107, 53, 0.3);
  border-radius: $radius-round;
  padding: 8rpx 20rpx;

  &:active {
    background: rgba(255, 107, 53, 0.3);
  }
}

.chip-text {
  font-size: $font-size-sm;
  color: $color-accent-light;
}
</style>
