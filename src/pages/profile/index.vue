<template>
  <view class="profile-page">
    <rp-navbar title="我的" />

    <scroll-view scroll-y class="profile-content">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-avatar" @tap="goEdit">
          <text class="avatar-text">{{ userStore.nickname[0] }}</text>
        </view>
        <text class="user-name">{{ userStore.nickname }}</text>
        <text class="user-goal" v-if="userStore.goalDistance">
          {{ userStore.goalDistanceLabel }} {{ goalTimeShort }}
        </text>
        <view class="user-stats">
          <view class="user-stat">
            <text class="stat-num">{{ trainingStore.totalKm.toFixed(0) }}</text>
            <text class="stat-label">累计跑量</text>
          </view>
          <view class="stat-divider" />
          <view class="user-stat">
            <text class="stat-num">{{ trainingStore.totalRuns }}</text>
            <text class="stat-label">训练次数</text>
          </view>
          <view class="stat-divider" />
          <view class="user-stat">
            <text class="stat-num">{{ pbCount }}</text>
            <text class="stat-label">个人最佳</text>
          </view>
        </view>
      </view>

      <!-- PB 卡片 -->
      <view v-if="pbs.length > 0" class="section">
        <text class="section-title">个人最佳</text>
        <rp-card>
          <view class="pb-list">
            <view v-for="pb in pbs" :key="pb.distance" class="pb-item">
              <text class="pb-dist">{{ pbLabel(pb.distance) }}</text>
              <text class="pb-time">{{ pb.time }}</text>
            </view>
          </view>
        </rp-card>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-section">
        <view class="menu-item" @tap="goEdit">
          <text class="menu-icon">👤</text>
          <text class="menu-label">编辑资料</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goPlan">
          <text class="menu-icon">📋</text>
          <text class="menu-label">我的计划</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goLogs">
          <text class="menu-icon">📊</text>
          <text class="menu-label">训练日志</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goAnalysis">
          <text class="menu-icon">📈</text>
          <text class="menu-label">趋势分析</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goAchievements">
          <text class="menu-icon">🏅</text>
          <text class="menu-label">成就墙</text>
          <view class="menu-badge" v-if="unseenBadges > 0">
            <text>{{ unseenBadges }}</text>
          </view>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goShareCard">
          <text class="menu-icon">📤</text>
          <text class="menu-label">训练卡片</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goWeeklyRecap">
          <text class="menu-icon">📰</text>
          <text class="menu-label">周报 / 月报</text>
          <text class="menu-arrow">→</text>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-item" @tap="goSettings">
          <text class="menu-icon">⚙️</text>
          <text class="menu-label">设置</text>
          <text class="menu-arrow">→</text>
        </view>
      </view>

      <view class="version-footer">
        <text>RunPilot AI v1.0.0</text>
      </view>
    </scroll-view>

    <!-- PB 庆祝 -->
    <rp-confetti
      :visible="showPBConfetti"
      text="新 PB！"
      :subText="newPBDistance"
      :duration="4000"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { useTrainingStore } from '@/stores/modules/training'
import { formatRaceTime } from '@/common/utils/validator'

const userStore = useUserStore()
const trainingStore = useTrainingStore()
const showPBConfetti = ref(false)
const newPBDistance = ref('')

const pbs = ref([
  { distance: '5k', time: '22:30' },
  { distance: '10k', time: '48:15' },
  { distance: 'half_marathon', time: '1:52:00' }
])

const goalTimeShort = computed(() => {
  if (!userStore.goalTimeSec) return ''
  return formatRaceTime(userStore.goalTimeSec)
})

const pbCount = computed(() => pbs.value.length)

const unseenBadges = computed(() =>
  trainingStore.badges.filter(b => !b.seen).length
)

function pbLabel(dist) {
  const map = { '1k': '1KM', '5k': '5KM', '10k': '10KM', half_marathon: '半马', marathon: '全马' }
  return map[dist] || dist
}

function goEdit() { uni.navigateTo({ url: '/pages/profile/edit' }) }
function goPlan() { uni.switchTab({ url: '/pages/plan/index' }) }
function goLogs() { uni.navigateTo({ url: '/subpkg-training/pages/workout-log' }) }
function goAnalysis() { uni.navigateTo({ url: '/subpkg-training/pages/trend-analysis' }) }
function goAchievements() { uni.navigateTo({ url: '/pages/profile/achievements' }) }
function goSettings() { uni.navigateTo({ url: '/pages/profile/settings' }) }
function goShareCard() { uni.navigateTo({ url: '/subpkg-sharing/pages/training-card' }) }
function goWeeklyRecap() { uni.navigateTo({ url: '/subpkg-sharing/pages/weekly-recap' }) }

onMounted(async () => {
  await Promise.all([
    trainingStore.fetchLogs(),
    trainingStore.fetchBadges()
  ])
  if (trainingStore.recentBadges.length > 0) {
    const latest = trainingStore.recentBadges[0]
    showPBConfetti.value = true
    newPBDistance.value = latest.achievement?.name || ''
    setTimeout(() => { trainingStore.clearRecentBadges() }, 4000)
  }
})
</script>

<style lang="scss" scoped>
.profile-page { min-height: 100vh; background-color: $color-bg-primary; }
.profile-content { padding: $spacing-md; }

.user-card {
  background: linear-gradient(135deg, $color-bg-card, $color-bg-card-hover);
  border-radius: $radius-lg; padding: $spacing-xl $spacing-lg;
  display: flex; flex-direction: column; align-items: center; margin-bottom: $spacing-lg;
}
.user-avatar {
  width: 120rpx; height: 120rpx; border-radius: $radius-circle;
  background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  display: flex; align-items: center; justify-content: center; margin-bottom: $spacing-md;
}
.avatar-text { font-size: $font-size-xxl; font-weight: 700; color: #fff; }
.user-name { font-size: $font-size-xl; font-weight: 700; color: $color-text-primary; }
.user-goal { font-size: $font-size-sm; color: $color-accent-light; margin-top: 4rpx; }
.user-stats { display: flex; width: 100%; justify-content: center; margin-top: $spacing-lg; gap: $spacing-xl; }
.user-stat { display: flex; flex-direction: column; align-items: center; }
.stat-num { font-size: $font-size-xl; font-family: $font-family-number; font-weight: 700; color: $color-text-primary; }
.stat-label { font-size: $font-size-xs; color: $color-text-muted; margin-top: 4rpx; }
.stat-divider { width: 2rpx; background: rgba(255,255,255,0.1); }

.section { margin-bottom: $spacing-lg; }
.section-title { font-size: $font-size-md; font-weight: 600; color: $color-text-primary; margin-bottom: $spacing-sm; display: block; }

.pb-list { display: flex; flex-direction: column; gap: $spacing-sm; }
.pb-item { display: flex; justify-content: space-between; align-items: center; }
.pb-dist { font-size: $font-size-sm; color: $color-text-muted; }
.pb-time { font-size: $font-size-lg; font-family: $font-family-number; color: $color-accent; font-weight: 600; }

.menu-section {
  background: $color-bg-card; border-radius: $radius-lg; overflow: hidden;
  margin-bottom: $spacing-lg;
}
.menu-item {
  display: flex; align-items: center; padding: $spacing-md $spacing-lg;
  border-bottom: 1rpx solid rgba(255,255,255,0.04);
  &:last-child { border-bottom: none; }
  &:active { background: $color-bg-card-hover; }
}
.menu-icon { font-size: $font-size-lg; margin-right: $spacing-md; }
.menu-label { flex: 1; font-size: $font-size-md; color: $color-text-primary; }
.menu-badge {
  background: $color-error; border-radius: $radius-round;
  padding: 2rpx 12rpx; margin-right: $spacing-sm;
  text { font-size: $font-size-xs; color: #fff; }
}
.menu-arrow { font-size: $font-size-sm; color: $color-text-muted; }

.version-footer { text-align: center; padding: $spacing-xl 0; }
.version-footer text { font-size: $font-size-xs; color: $color-text-muted; }
</style>
