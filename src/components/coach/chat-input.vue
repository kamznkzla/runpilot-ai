<template>
  <view class="chat-input-bar safe-area-bottom">
    <view class="input-row">
      <view class="input-field-wrapper">
        <input
          class="chat-input-field"
          v-model="inputText"
          :placeholder="placeholder"
          :disabled="disabled"
          confirm-type="send"
          @confirm="handleSend"
          @focus="$emit('focus')"
          @blur="$emit('blur')"
        />
      </view>
      <view class="send-btn" :class="{ disabled }" @tap="handleSend">
        <text class="send-text">发送</text>
      </view>
    </view>
    <view v-if="quickActions.length > 0" class="quick-actions">
      <view
        v-for="(action, i) in quickActions"
        :key="i"
        class="quick-action-chip"
        @tap="$emit('quickAction', action)"
      >
        <text class="quick-action-text">{{ action }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '输入你的问题...' },
  quickActions: { type: Array, default: () => [] }
})

const emit = defineEmits(['send', 'focus', 'blur', 'quickAction'])
const inputText = ref('')

function handleSend() {
  const text = inputText.value.trim()
  if (!text || props.disabled) return
  emit('send', text)
  inputText.value = ''
}
</script>

<style lang="scss" scoped>
.chat-input-bar {
  background-color: $color-bg-secondary;
  padding: $spacing-sm $spacing-md;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
}

.input-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.input-field-wrapper {
  flex: 1;
  background-color: $color-bg-input;
  border-radius: $radius-round;
  padding: 0 $spacing-md;
  height: 72rpx;
  display: flex;
  align-items: center;
}

.chat-input-field {
  flex: 1;
  height: 100%;
  font-size: $font-size-base;
  color: $color-text-primary;
}

.send-btn {
  width: 100rpx;
  height: 72rpx;
  background-color: $color-accent;
  border-radius: $radius-round;
  display: flex;
  align-items: center;
  justify-content: center;

  &.disabled { opacity: 0.4; }

  &:active {
    background-color: $color-accent-dark;
    transform: scale(0.95);
  }
}

.send-text {
  font-size: $font-size-sm;
  color: #fff;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
  overflow-x: auto;
  padding-bottom: 4rpx;
}

.quick-action-chip {
  background: rgba(255, 255, 255, 0.06);
  border-radius: $radius-round;
  padding: 10rpx 24rpx;
  flex-shrink: 0;
  white-space: nowrap;

  &:active {
    background: rgba(255, 255, 255, 0.12);
  }
}

.quick-action-text {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}
</style>
