<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/modules/user'

// #ifdef MP-WEIXIN
import { initCloud } from '@/common/api/cloud'
// #endif

onLaunch(async () => {
  // #ifdef MP-WEIXIN
  // 初始化云开发 (仅微信小程序)
  initCloud()
  // 加载运动字体
  wx.loadFontFace({
    family: 'SportMono',
    source: 'url("https://your-cdn.com/JetBrainsMono.ttf")',
    global: true,
    fail: () => {}
  })
  // #endif

  // 检查用户登录状态和引导流程
  const userStore = useUserStore()
  await userStore.fetchProfile()

  // 如果未完成引导，跳转到引导页
  if (!userStore.isOnboardingComplete) {
    uni.reLaunch({ url: '/subpkg-onboarding/pages/step1-profile' })
  }
})
</script>

<style lang="scss">
// #ifdef MP-WEIXIN
@import './uni.scss';
// #endif

// #ifdef H5
// H5 端颜色变量
$color-bg-primary: #0F0F1A;
$color-bg-secondary: #1A1A2E;
$color-bg-card: #1E1E35;
$color-text-primary: #FFFFFF;
$color-text-secondary: #B0B3C0;
$color-text-muted: #6B6E7D;
$color-accent: #FF6B35;
$color-accent-dark: #E55A2B;
$color-accent-light: #FF8C5A;
$color-bg-input: #2A2A40;
$color-success: #4CAF50;
$color-warning: #FFB74D;
$color-error: #EF5350;
$font-family-base: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
$font-family-number: 'Courier New', monospace;
$font-size-xs: 11px;
$font-size-sm: 13px;
$font-size-base: 15px;
$font-size-md: 17px;
$font-size-lg: 19px;
$font-size-xl: 24px;
$font-size-xxl: 30px;
$font-size-hero: 38px;
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 14px;
$spacing-lg: 18px;
$spacing-xl: 26px;
$spacing-xxl: 36px;
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 14px;
$radius-xl: 16px;
$radius-round: 50px;
$radius-circle: 50%;
$card-padding: 14px;
$transition-normal: 0.25s ease;
$spacing-content: 14px;
// #endif

page {
  background-color: $color-bg-primary;
  color: $color-text-primary;
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: 1.6;
}

/* 全局数字显示使用等宽运动字体 */
.stat-number, .pace-display, .distance-display, .time-display {
  font-family: $font-family-number;
  font-variant-numeric: tabular-nums;
}

/* 滚动条隐藏（适用于scroll-view） */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* 全局过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity $transition-normal;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform $transition-normal, opacity $transition-normal;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(20rpx);
  opacity: 0;
}

/* 安全区域适配 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
