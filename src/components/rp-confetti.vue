<template>
  <view v-if="visible" class="confetti-container">
    <view
      v-for="particle in particles"
      :key="particle.id"
      class="confetti-particle"
      :style="{
        left: particle.x + '%',
        backgroundColor: particle.color,
        animationDelay: particle.delay + 's',
        animationDuration: particle.duration + 's',
        width: particle.size + 'rpx',
        height: particle.size + 'rpx',
        borderRadius: particle.round ? '50%' : '2rpx'
      }"
    />
    <view class="confetti-text" v-if="text">
      <text class="confetti-emoji">🎉</text>
      <text class="confetti-title">{{ text }}</text>
      <text v-if="subText" class="confetti-sub">{{ subText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  text: { type: String, default: '' },
  subText: { type: String, default: '' },
  duration: { type: Number, default: 3000 }
})

const particles = ref([])
let timer = null

const colors = ['#FF6B35', '#FFB74D', '#4CAF50', '#42A5F5', '#AB47BC', '#EF5350', '#FF8C5A', '#66BB6A']

watch(() => props.visible, (val) => {
  if (val) {
    generateParticles()
    timer = setTimeout(() => {
      particles.value = []
    }, props.duration)
  }
})

function generateParticles() {
  particles.value = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 2,
    size: 6 + Math.random() * 14,
    round: Math.random() > 0.5
  }))
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style lang="scss" scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
}

.confetti-particle {
  position: absolute;
  top: -20rpx;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-20rpx) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti-text {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
  animation: confetti-text-in 0.5s ease-out;
}

.confetti-emoji {
  font-size: 80rpx;
  display: block;
}

.confetti-title {
  font-size: $font-size-xl;
  font-weight: 700;
  color: #fff;
  display: block;
  margin-top: $spacing-sm;
}

.confetti-sub {
  font-size: $font-size-base;
  color: $color-text-secondary;
  display: block;
  margin-top: $spacing-xs;
}

@keyframes confetti-text-in {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
</style>
