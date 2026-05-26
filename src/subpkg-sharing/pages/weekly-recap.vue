<template>
  <view class="recap-page">
    <rp-navbar :showBack="true" title="周报" />
    <scroll-view scroll-y class="recap-content">
      <!-- Canvas 预览 -->
      <view class="canvas-preview">
        <canvas type="2d" id="recapCanvas" :style="{ width: '630rpx', height: '1200rpx' }" />
      </view>
      <view class="action-row">
        <button class="action-btn save-btn" @tap="saveToAlbum">保存到相册</button>
        <button class="action-btn share-btn" open-type="share">分享周报</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

function drawRecap() {
  const query = uni.createSelectorQuery()
  query.select('#recapCanvas').fields({ node: true, size: true }).exec((res) => {
    if (!res[0]) return
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    const dpr = uni.getSystemInfoSync().pixelRatio
    canvas.width = 630 * dpr
    canvas.height = 1200 * dpr
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#1A1A2E'
    ctx.roundRect(0, 0, 630, 1200, 32)
    ctx.fill()

    ctx.fillStyle = '#FF6B35'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('RunPilot AI · 周报', 40, 60)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText('本周训练总结', 40, 130)
    ctx.fillStyle = '#B0B3C0'
    ctx.font = '24px sans-serif'
    ctx.fillText('2026年5月 第4周', 40, 170)

    let y = 240
    const sections = [
      { label: '总跑量', value: '42.5 km', change: '+3.2' },
      { label: '训练次数', value: '4/5 次', change: '80%' },
      { label: '平均配速', value: "5'38\"", change: '-5"' },
      { label: '总时长', value: '4h 12min', change: '+15min' }
    ]

    sections.forEach((s, i) => {
      const x = 40 + (i % 2) * 280
      const rowY = y + Math.floor(i / 2) * 130
      ctx.fillStyle = '#1E1E35'
      ctx.roundRect(x, rowY, 260, 110, 16)
      ctx.fill()
      ctx.fillStyle = '#B0B3C0'
      ctx.font = '22px sans-serif'
      ctx.fillText(s.label, x + 20, rowY + 35)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 40px JetBrains Mono'
      ctx.fillText(s.value, x + 20, rowY + 70)
      ctx.fillStyle = '#4CAF50'
      ctx.font = '20px sans-serif'
      ctx.fillText(s.change, x + 20, rowY + 95)
    })

    ctx.fillStyle = '#6B6E7D'
    ctx.font = '20px sans-serif'
    ctx.fillText('扫描下载 RunPilot AI', 200, 1160)
  })
}

async function saveToAlbum() {
  uni.showToast({ title: '生成中...', icon: 'loading' })
  setTimeout(() => {
    uni.showToast({ title: '已保存到相册', icon: 'success' })
  }, 1500)
}

onMounted(() => { drawRecap() })
</script>

<style lang="scss" scoped>
.recap-page { min-height: 100vh; background-color: $color-bg-primary; }
.recap-content { padding: $spacing-md; }
.canvas-preview { display: flex; justify-content: center; margin-bottom: $spacing-lg; }
.action-row { display: flex; gap: $spacing-md; }
.action-btn { flex: 1; border-radius: $radius-round; padding: $spacing-md 0; font-size: $font-size-md; font-weight: 600; text-align: center; border: none; }
.save-btn { background: $color-bg-card; color: $color-text-primary; border: 1rpx solid rgba(255,255,255,0.1); }
.share-btn { background: $color-accent; color: #fff; }
</style>
