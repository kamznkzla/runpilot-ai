<template>
  <view class="dashboard-page">
    <!-- 自定义导航栏 -->
    <view class="dash-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="dash-navbar-inner">
        <view class="dash-greeting">
          <text class="greeting-text">{{ greetingText }}</text>
          <text class="greeting-name">{{ userStore.nickname }}</text>
        </view>
        <view class="dash-avatar" @tap="goProfile">
          <text class="avatar-letter">{{ userStore.nickname[0] }}</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="dash-content" :style="{ paddingTop: headerHeight + 'px' }" @scrolltolower="onLoadMore">
      <!-- 倒计时卡片（有比赛日期时显示） -->
      <rp-countdown
        v-if="userStore.raceDate"
        :raceDate="userStore.raceDate"
        :goalDistance="userStore.goalDistance"
        :goalTime="goalTimeDisplay"
      />

      <!-- 今日训练卡片 -->
      <view class="section">
        <text class="section-title">今日训练</text>
        <rp-card v-if="planStore.todayWorkout" accent tappable @tap="goWorkoutDetail">
          <view class="today-workout">
            <view class="today-left">
              <rp-workout-type-icon :type="planStore.todayWorkout.type" :size="72" />
            </view>
            <view class="today-right">
              <text class="today-type">{{ workoutTypeLabel }}</text>
              <text class="today-desc">{{ planStore.todayWorkout.description || planStore.todayWorkout.coach_note }}</text>
              <view class="today-stats">
                <text v-if="planStore.todayWorkout.distance_km" class="today-stat">
                  {{ planStore.todayWorkout.distance_km }} km
                </text>
                <text v-if="planStore.todayWorkout.target_pace_sec_per_km" class="today-stat">
                  <rp-pace-display :paceSec="planStore.todayWorkout.target_pace_sec_per_km" size="sm" inline />
                </text>
              </view>
            </view>
          </view>
        </rp-card>

        <rp-card v-else-if="planStore.hasActivePlan">
          <view class="rest-day">
            <text class="rest-emoji">🌙</text>
            <text class="rest-title">今天是休息日</text>
            <text class="rest-desc">好好休息，为明天的训练储备能量</text>
          </view>
        </rp-card>

        <rp-card v-else>
          <view class="no-plan" @tap="goPlan">
            <text class="no-plan-emoji">🎯</text>
            <text class="no-plan-title">还没有训练计划</text>
            <text class="no-plan-desc">点击开始生成你的专属训练计划</text>
            <view class="no-plan-btn">生成计划</view>
          </view>
        </rp-card>
      </view>

      <!-- 本周进度 -->
      <view v-if="planStore.hasActivePlan" class="section">
        <text class="section-title">本周进度</text>
        <rp-card>
          <view class="weekly-progress">
            <rp-stat-ring
              :percentage="planStore.weeklyProgress.percentage"
              :label="`${planStore.weeklyProgress.completed}/${planStore.weeklyProgress.total} 次完成`"
              :subLabel="`第 ${planStore.currentWeekIndex + 1}/${planStore.totalWeeks} 周`"
              :color="'#FF6B35'"
              :size="200"
            />
            <view class="weekly-detail">
              <view class="weekly-stat" v-if="weekTotalKm">
                <text class="weekly-stat-val">{{ weekTotalKm }}</text>
                <text class="weekly-stat-label">本周计划 (km)</text>
              </view>
              <view class="weekly-stat">
                <text class="weekly-stat-val">{{ planStore.currentPhase ? phaseLabel : '--' }}</text>
                <text class="weekly-stat-label">当前阶段</text>
              </view>
            </view>
          </view>
        </rp-card>
      </view>

      <!-- 近期摘要 -->
      <view class="section">
        <text class="section-title">训练摘要</text>
        <rp-card>
          <view class="summary-grid">
            <view class="summary-item">
              <text class="summary-value">{{ trainingStore.last7DaysKm.toFixed(1) }}</text>
              <text class="summary-label">近7天跑量 (km)</text>
            </view>
            <view class="summary-item">
              <text class="summary-value">{{ trainingStore.totalRuns }}</text>
              <text class="summary-label">总训练次数</text>
            </view>
            <view class="summary-item">
              <text class="summary-value">{{ avgPaceDisplay }}</text>
              <text class="summary-label">平均配速</text>
            </view>
            <view class="summary-item">
              <text class="summary-value">{{ trainingStore.totalKm.toFixed(0) }}</text>
              <text class="summary-label">累计跑量 (km)</text>
            </view>
          </view>
        </rp-card>
      </view>

      <!-- AI 每日提示 -->
      <view v-if="dailyTip" class="section">
        <text class="section-title">AI 教练说</text>
        <rp-card accent>
          <view class="daily-tip">
            <text class="tip-quote">"</text>
            <text class="tip-text">{{ dailyTip }}</text>
            <text class="tip-quote right">"</text>
          </view>
        </rp-card>
      </view>

      <!-- 快捷入口 -->
      <view class="section">
        <rp-card>
          <view class="quick-links">
            <view class="quick-link" @tap="goPlan">
              <text class="quick-icon">📋</text>
              <text class="quick-label">训练计划</text>
            </view>
            <view class="quick-link" @tap="goCoach">
              <text class="quick-icon">💬</text>
              <text class="quick-label">AI 教练</text>
            </view>
            <view class="quick-link" @tap="goLogs">
              <text class="quick-icon">📊</text>
              <text class="quick-label">训练日志</text>
            </view>
            <view class="quick-link" @tap="goShare">
              <text class="quick-icon">📤</text>
              <text class="quick-label">分享打卡</text>
            </view>
          </view>
        </rp-card>
      </view>

      <view style="height: 40rpx;" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { usePlanStore } from '@/stores/modules/plan'
import { useTrainingStore } from '@/stores/modules/training'
import { WORKOUT_TYPE_LABELS, PHASE_LABELS } from '@/common/utils/constants'
import { formatPace } from '@/common/utils/pace'
import { formatRaceTime } from '@/common/utils/validator'

const userStore = useUserStore()
const planStore = usePlanStore()
const trainingStore = useTrainingStore()

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20
const headerHeight = 120

const dailyTip = ref('')

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const workoutTypeLabel = computed(() =>
  WORKOUT_TYPE_LABELS[planStore.todayWorkout?.type] || ''
)

const phaseLabel = computed(() =>
  PHASE_LABELS[planStore.currentPhase] || ''
)

const weekTotalKm = computed(() =>
  planStore.currentWeek?.total_km || null
)

const goalTimeDisplay = computed(() =>
  userStore.goalTimeSec ? formatRaceTime(userStore.goalTimeSec) : ''
)

const avgPaceDisplay = computed(() =>
  trainingStore.averagePace ? formatPace(trainingStore.averagePace) : '--\'--"'
)

function goProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}
function goPlan() {
  uni.switchTab({ url: '/pages/plan/index' })
}
function goCoach() {
  uni.switchTab({ url: '/pages/coach/index' })
}
function goWorkoutDetail() {
  uni.navigateTo({ url: '/subpkg-training/pages/workout-detail' })
}
function goLogs() {
  uni.navigateTo({ url: '/subpkg-training/pages/workout-log' })
}
function goShare() {
  uni.navigateTo({ url: '/subpkg-sharing/pages/training-card' })
}
function onLoadMore() {}

onMounted(async () => {
  await Promise.all([
    planStore.fetchActivePlan(),
    trainingStore.fetchLogs(7),
    trainingStore.fetchStats('weekly')
  ])
  // 尝试加载每日 AI 提示
  try {
    const db = wx.cloud.database()
    const res = await db.collection('daily_tips')
      .where({ _openid: '{openid}' })
      .orderBy('date', 'desc')
      .limit(1)
      .get()
    dailyTip.value = res.data[0]?.tip || '每一次跑步，都是和自己的对话。坚持下去，你会发现更好的自己。'
  } catch { /* ignore */ }
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: $color-bg-primary;
}

.dash-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: $color-bg-primary;
}

.dash-navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 $spacing-lg;
}

.dash-greeting {
  display: flex;
  flex-direction: column;
}

.greeting-text {
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.greeting-name {
  font-size: $font-size-xl;
  font-weight: 700;
  color: $color-text-primary;
}

.dash-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-circle;
  background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-letter {
  font-size: $font-size-lg;
  font-weight: 700;
  color: #fff;
}

.dash-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-size-md;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;
  display: block;
}

.today-workout {
  display: flex;
  gap: $spacing-md;
  align-items: center;
}

.today-left {
  flex-shrink: 0;
}

.today-right {
  flex: 1;
}

.today-type {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-primary;
}

.today-desc {
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin-top: 4rpx;
  line-height: 1.4;
}

.today-stats {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-sm;
}

.today-stat {
  font-size: $font-size-md;
  font-family: $font-family-number;
  color: $color-accent-light;
  font-weight: 500;
}

.rest-day, .no-plan {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md 0;
}

.rest-emoji, .no-plan-emoji { font-size: 56rpx; margin-bottom: $spacing-sm; }
.rest-title, .no-plan-title { font-size: $font-size-md; color: $color-text-primary; font-weight: 500; }
.rest-desc, .no-plan-desc { font-size: $font-size-sm; color: $color-text-muted; margin-top: 4rpx; }
.no-plan-btn {
  margin-top: $spacing-md;
  background: $color-accent;
  color: #fff;
  font-size: $font-size-sm;
  border-radius: $radius-round;
  padding: 12rpx 36rpx;
}

.weekly-progress {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.weekly-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.weekly-stat {
  display: flex;
  flex-direction: column;
}

.weekly-stat-val {
  font-size: $font-size-xl;
  font-family: $font-family-number;
  font-weight: 700;
  color: $color-text-primary;
}

.weekly-stat-label {
  font-size: $font-size-xs;
  color: $color-text-muted;
  margin-top: 2rpx;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.summary-value {
  font-size: $font-size-xl;
  font-family: $font-family-number;
  font-weight: 700;
  color: $color-text-primary;
}

.summary-label {
  font-size: $font-size-xs;
  color: $color-text-muted;
  margin-top: 4rpx;
}

.daily-tip {
  padding: $spacing-sm 0;
}

.tip-quote {
  font-size: $font-size-xl;
  color: $color-accent;
  font-family: serif;
  line-height: 1;

  &.right {
    text-align: right;
    display: block;
  }
}

.tip-text {
  font-size: $font-size-md;
  color: $color-text-secondary;
  line-height: 1.6;
}

.quick-links {
  display: flex;
  justify-content: space-around;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.quick-icon {
  font-size: 44rpx;
}

.quick-label {
  font-size: $font-size-xs;
  color: $color-text-secondary;
}
</style>
