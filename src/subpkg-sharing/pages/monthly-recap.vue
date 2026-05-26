<template>
  <view class="recap-page">
    <rp-navbar :showBack="true" title="月报" />
    <scroll-view scroll-y class="recap-content">
      <view class="canvas-preview">
        <canvas type="2d" id="monthlyCanvas" :style="{ width: '630rpx', height: '1400rpx' }" />
      </view>
      <view class="action-row">
        <button class="action-btn save-btn" @tap="saveToAlbum">保存到相册</button>
        <button class="action-btn share-btn" open-type="share">分享月报</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

function drawRecap() {
  const query = uni.createSelectorQuery()
  query.select('#monthlyCanvas').fields({ node: true, size: true }).exec((res) => {
    if (!res[0]) return
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    const dpr = uni.getSystemInfoSync().pixelRatio
    canvas.width = 630 * dpr
    canvas.height = 1400 * dpr
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#1A1A2E'
    ctx.roundRect(0, 0, 630, 1400, 32)
    ctx.fill()

    ctx.fillStyle = '#FF6B35'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('RunPilot AI · 月报', 40, 60)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText('5月训练月报', 40, 130)

    let y = 200
    const stats = [
      { label: '月总跑量', value: '168 km', sub: '较上月 +12%' },
      { label: '训练天数', value: '18 天', sub: '完成率 85%' },
      { label: '平均配速', value: "5'42\"", sub: '较上月提升 3"' },
      { label: 'PB 次数', value: '2 次', sub: '5K + 10K' }
    ]
    stats.forEach(s => {
      ctx.fillStyle = '#1E1E35'
      ctx.roundRect(40, y, 550, 100, 16)
      ctx.fill()
      ctx.fillStyle = '#B0B3C0'
      ctx.font = '22px sans-serif'
      ctx.fillText(s.label, 60, y + 38)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 44px JetBrains Mono'
      ctx.fillText(s.value, 380, y + 48)
      ctx.fillStyle = '#4CAF50'
      ctx.font = '20px sans-serif'
      ctx.fillText(s.sub, 60, y + 80)
      y += 120
    })

    // AI 点评
    ctx.fillStyle = 'rgba(255, 107, 53, 0.1)'
    ctx.roundRect(40, y, 550, 80, 16)
    ctx.fill()
    ctx.fillStyle = '#FF8C5A'
    ctx.font = '22px sans-serif'
    ctx.fillText('💡 本月坚持非常棒！配速持续提升，下月可以尝试加入', 60, y + 35)
    ctx.fillText('更多间歇训练来突破瓶颈。', 60, y + 62)

    ctx.fillStyle = '#6B6E7D'
    ctx.font = '20px sans-serif'
    ctx.fillText('扫描下载 RunPilot AI', 200, 1360)
  })
}

async function saveToAlbum() {
  uni.showToast({ title: '生成中...', icon: 'loading' })
  setTimeout(() => { uni.showToast({ title: '已保存到相册', icon: 'success' }) }, 2000)
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
