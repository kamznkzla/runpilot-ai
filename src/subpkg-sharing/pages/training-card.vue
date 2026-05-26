<template>
  <view class="card-page">
    <rp-navbar :showBack="true" title="训练卡片" />

    <view class="card-content">
      <!-- Canvas 预览区域 -->
      <view class="canvas-preview">
        <canvas
          type="2d"
          id="cardCanvas"
          canvas-id="cardCanvas"
          :style="{ width: canvasWidth + 'rpx', height: canvasHeight + 'rpx' }"
        />
      </view>

      <!-- 模板选择 -->
      <view class="template-section">
        <text class="section-title">选择模板</text>
        <scroll-view scroll-x class="template-scroll">
          <view
            v-for="(tpl, i) in templates"
            :key="i"
            class="template-item"
            :class="{ active: selectedTemplate === i }"
            @tap="selectTemplate(i)"
          >
            <text class="tpl-name">{{ tpl.name }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 数据选项 -->
      <rp-card title="显示内容">
        <view class="data-toggles">
          <view v-for="opt in dataOptions" :key="opt.key" class="toggle-item">
            <text class="toggle-label">{{ opt.label }}</text>
            <switch :checked="opt.show" color="#FF6B35" @change="(e) => toggleData(opt.key, e.detail.value)" />
          </view>
        </view>
      </rp-card>

      <!-- 操作按钮 -->
      <view class="action-row">
        <button class="action-btn save-btn" @tap="saveToAlbum">保存到相册</button>
        <button class="action-btn share-btn" open-type="share">分享给朋友</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const canvasWidth = 630
const canvasHeight = 900
const selectedTemplate = ref(0)

const templates = [
  { name: '极简数据' },
  { name: '路线+数据' },
  { name: '周报样式' }
]

const dataOptions = reactive([
  { key: 'distance', label: '距离', show: true },
  { key: 'pace', label: '配速', show: true },
  { key: 'duration', label: '时长', show: true },
  { key: 'heartRate', label: '心率', show: false },
  { key: 'route', label: '路线图', show: false },
  { key: 'aiComment', label: 'AI 评语', show: true }
])

function selectTemplate(i) { selectedTemplate.value = i; drawCard() }
function toggleData(key, show) {
  const opt = dataOptions.find(o => o.key === key)
  if (opt) opt.show = show
  drawCard()
}

function drawCard() {
  const query = uni.createSelectorQuery()
  query.select('#cardCanvas').fields({ node: true, size: true }).exec((res) => {
    if (!res[0]) return
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    const dpr = uni.getSystemInfoSync().pixelRatio
    canvas.width = canvasWidth * dpr
    canvas.height = canvasHeight * dpr
    ctx.scale(dpr, dpr)

    // 背景
    ctx.fillStyle = '#1A1A2E'
    ctx.roundRect(0, 0, canvasWidth, canvasHeight, 32)
    ctx.fill()

    // Logo 区域
    ctx.fillStyle = '#FF6B35'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('RunPilot AI', 40, 70)

    // 标题
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText('今日训练完成！', 40, 140)

    let y = 220

    if (dataOptions[0].show) {
      ctx.fillStyle = '#B0B3C0'
      ctx.font = '24px sans-serif'
      ctx.fillText('跑步距离', 40, y)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 72px JetBrains Mono'
      ctx.fillText('8.5 km', 40, y + 70)
      y += 130
    }

    if (dataOptions[1].show) {
      ctx.fillStyle = '#B0B3C0'
      ctx.font = '24px sans-serif'
      ctx.fillText('平均配速', 40, y)
      ctx.fillStyle = '#FF6B35'
      ctx.font = 'bold 72px JetBrains Mono'
      ctx.fillText("5'42\"", 40, y + 70)
      y += 130
    }

    if (dataOptions[2].show) {
      ctx.fillStyle = '#B0B3C0'
      ctx.font = '24px sans-serif'
      ctx.fillText('运动时长', 40, y)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 56px JetBrains Mono'
      ctx.fillText('48:30', 40, y + 60)
      y += 120
    }

    if (dataOptions[5].show) {
      ctx.fillStyle = 'rgba(255, 107, 53, 0.15)'
      ctx.fillRect(40, y - 10, canvasWidth - 80, 90)
      ctx.fillStyle = '#FF8C5A'
      ctx.font = '22px sans-serif'
      ctx.fillText('💡 教练点评：今天配速很稳，继续保持！', 60, y + 30)
    }

    // 底部
    ctx.fillStyle = '#6B6E7D'
    ctx.font = '20px sans-serif'
    ctx.fillText('扫描二维码，开始你的跑步之旅', 40, canvasHeight - 40)
  })
}

async function saveToAlbum() {
  try {
    const query = uni.createSelectorQuery()
    query.select('#cardCanvas').fields({ node: true }).exec((res) => {
      if (!res[0]) return
      const canvas = res[0].node
      canvas.toTempFilePath({
        success: (tempRes) => {
          uni.saveImageToPhotosAlbum({
            filePath: tempRes.tempFilePath,
            success: () => { uni.showToast({ title: '已保存到相册', icon: 'success' }) },
            fail: () => { uni.showToast({ title: '保存失败', icon: 'error' }) }
          })
        }
      })
    })
  } catch (err) {
    uni.showToast({ title: '生成图片失败', icon: 'error' })
  }
}

onMounted(() => { drawCard() })
</script>

<style lang="scss" scoped>
.card-page { min-height: 100vh; background-color: $color-bg-primary; }
.card-content { padding: $spacing-md; }
.canvas-preview { display: flex; justify-content: center; margin-bottom: $spacing-lg; border-radius: $radius-lg; overflow: hidden; }

.template-section { margin-bottom: $spacing-lg; }
.section-title { font-size: $font-size-md; font-weight: 600; color: $color-text-primary; display: block; margin-bottom: $spacing-sm; }
.template-scroll { white-space: nowrap; }
.template-item {
  display: inline-block; background: $color-bg-card; border-radius: $radius-md;
  padding: $spacing-sm $spacing-lg; margin-right: $spacing-sm; border: 2rpx solid transparent;
  &.active { border-color: $color-accent; }
}
.tpl-name { font-size: $font-size-sm; color: $color-text-secondary; }

.data-toggles { display: flex; flex-direction: column; gap: $spacing-sm; }
.toggle-item { display: flex; justify-content: space-between; align-items: center; }
.toggle-label { font-size: $font-size-base; color: $color-text-secondary; }

.action-row { display: flex; gap: $spacing-md; margin-top: $spacing-xl; }
.action-btn {
  flex: 1; border-radius: $radius-round; padding: $spacing-md 0; font-size: $font-size-md; font-weight: 600; text-align: center; border: none;
}
.save-btn { background: $color-bg-card; color: $color-text-primary; border: 1rpx solid rgba(255,255,255,0.1); }
.share-btn { background: $color-accent; color: #fff; }
</style>
