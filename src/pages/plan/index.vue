<template>
  <view class="plan-page">
    <rp-navbar title="训练计划" subtitle="RunPilot AI" />

    <scroll-view scroll-y class="plan-content">
      <!-- 无计划状态 -->
      <view v-if="!planStore.hasActivePlan && !planStore.isGenerating" class="no-plan-section">
        <text class="no-plan-icon">🏃‍♂️</text>
        <text class="no-plan-title">还没有训练计划</text>
        <text class="no-plan-desc">让 AI 为你生成专属的科学训练计划</text>

        <view class="plan-config">
          <view class="config-group">
            <text class="config-label">计划时长</text>
            <view class="config-options">
              <view
                v-for="opt in planDurations"
                :key="opt.value"
                class="config-chip"
                :class="{ active: selectedDuration === opt.value }"
                @tap="selectedDuration = opt.value"
              >
                <text>{{ opt.label }}</text>
                <text class="chip-desc">{{ opt.desc }}</text>
              </view>
            </view>
          </view>
        </view>

        <button
          class="generate-btn"
          :loading="planStore.isGenerating"
          :disabled="!userStore.goalDistance"
          @tap="handleGeneratePlan"
        >
          {{ planStore.isGenerating ? 'AI 正在生成计划...' : '生成训练计划' }}
        </button>
        <text v-if="planStore.isGenerating" class="generate-hint">
          AI 正在根据你的个人数据生成个性化训练计划，请稍候...
        </text>
      </view>

      <!-- 有计划的详情 -->
      <view v-else-if="planStore.hasActivePlan" class="plan-detail">
        <!-- 计划概况 -->
        <view class="plan-header-card">
          <view class="plan-header-top">
            <text class="plan-name">{{ planStore.activePlan.plan_name }}</text>
            <view class="plan-badge" :style="{ backgroundColor: phaseColor }">
              <text>{{ phaseLabel }}</text>
            </view>
          </view>
          <view class="plan-meta">
            <text>第 {{ planStore.currentWeekIndex + 1 }} / {{ planStore.totalWeeks }} 周</text>
            <text>{{ planStore.weeklyProgress.completed }} / {{ planStore.weeklyProgress.total }} 次完成</text>
          </view>
        </view>

        <!-- 阶段时间线 -->
        <view class="phase-timeline">
          <view
            v-for="phase in planStore.activePlan.phases"
            :key="phase.name"
            class="phase-bar"
            :style="{
              flex: phase.end_week - phase.start_week + 1,
              backgroundColor: getPhaseColor(phase.name),
              opacity: isPhaseActive(phase) ? 1 : 0.3
            }"
          >
            <text class="phase-bar-label">{{ getPhaseLabel(phase.name) }}</text>
          </view>
        </view>

        <!-- 本周训练 -->
        <view class="section">
          <view class="section-header">
            <text class="section-title">本周训练</text>
            <text class="section-link" @tap="goCalendar">日历视图 →</text>
          </view>

          <view v-if="planStore.currentWeek" class="week-training">
            <view
              v-for="day in planStore.currentWeek.days"
              :key="day.day"
              class="training-day-card"
              :class="{ rest: day.type === 'rest' }"
              @tap="day.type !== 'rest' && goWorkoutDetail(day)"
            >
              <view class="day-left">
                <text class="day-label">{{ dayLabel(day.day) }}</text>
                <rp-workout-type-icon :type="day.type" :size="48" />
              </view>
              <view class="day-right">
                <text class="day-type">{{ workoutLabel(day.type) }}</text>
                <text class="day-brief">{{ day.description || day.coach_note || '' }}</text>
                <view class="day-data">
                  <text v-if="day.distance_km" class="day-data-item">{{ day.distance_km }}km</text>
                  <text v-if="day.target_pace_sec_per_km" class="day-data-item">
                    <rp-pace-display :paceSec="day.target_pace_sec_per_km" size="sm" inline />
                  </text>
                </view>
              </view>
              <view class="day-status">
                <text v-if="day.type === 'rest'" class="status-rest">休</text>
                <text v-else class="status-arrow">→</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 操作 -->
        <view class="action-row">
          <view class="action-btn" @tap="handleAdjustPlan">
            <text>🔧 调整计划</text>
          </view>
          <view class="action-btn" @tap="goCalendar">
            <text>📅 日历视图</text>
          </view>
        </view>
      </view>

      <!-- 加载中 -->
      <rp-loading-skeleton v-if="planStore.isGenerating" :count="3" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { usePlanStore } from '@/stores/modules/plan'
import { WORKOUT_TYPE_LABELS, PHASE_LABELS, PLAN_DURATIONS } from '@/common/utils/constants'
import { theme } from '@/common/config/theme'

const userStore = useUserStore()
const planStore = usePlanStore()

const selectedDuration = ref(12)
const planDurations = PLAN_DURATIONS

const phaseLabel = computed(() => PHASE_LABELS[planStore.currentPhase] || '')
const phaseColor = computed(() => theme.phaseColors[planStore.currentPhase] || '#FF6B35')

const weekdayMap = { monday: '一', tuesday: '二', wednesday: '三', thursday: '四', friday: '五', saturday: '六', sunday: '日' }

function dayLabel(day) { return '周' + (weekdayMap[day] || day) }
function workoutLabel(type) { return WORKOUT_TYPE_LABELS[type] || '' }
function getPhaseColor(name) { return theme.phaseColors[name] || '#4CAF50' }
function getPhaseLabel(name) { return PHASE_LABELS[name] || name }
function isPhaseActive(phase) {
  const currentWeek = planStore.currentWeekIndex + 1
  return currentWeek >= phase.start_week && currentWeek <= phase.end_week
}

function goCalendar() { uni.navigateTo({ url: '/pages/plan/calendar' }) }
function goWorkoutDetail(day) { uni.navigateTo({ url: '/subpkg-training/pages/workout-detail' }) }

async function handleGeneratePlan() {
  try {
    await planStore.generatePlan({
      goalDistance: userStore.goalDistance,
      goalTimeSec: userStore.goalTimeSec,
      goalRaceDate: userStore.raceDate,
      weeksCount: selectedDuration.value,
      experienceLevel: userStore.profile?.running_experience || 'beginner',
      weeklyDays: userStore.profile?.weeklyDays || '4-5',
      userProfile: {
        age: userStore.profile?.age,
        gender: userStore.profile?.gender,
        height_cm: userStore.profile?.height_cm,
        weight_kg: userStore.profile?.weight_kg,
        running_experience: userStore.profile?.running_experience,
        recent_races: userStore.profile?.recent_races
      }
    })
    uni.showToast({ title: '计划生成成功！', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '生成失败，请重试', icon: 'error' })
  }
}

async function handleAdjustPlan() {
  uni.showModal({
    title: '调整计划',
    content: '请描述需要调整的原因（如太累、受伤、时间不足等）',
    editable: true,
    placeholderText: '输入调整原因...',
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          await planStore.adjustPlan(res.content)
          uni.showToast({ title: '计划已调整', icon: 'success' })
        } catch {
          uni.showToast({ title: '调整失败', icon: 'error' })
        }
      }
    }
  })
}

onMounted(async () => {
  if (userStore.isOnboardingComplete) {
    await planStore.fetchActivePlan()
  }
})
</script>

<style lang="scss" scoped>
.plan-page { min-height: 100vh; background-color: $color-bg-primary; }
.plan-content { padding: $spacing-md; height: calc(100vh - 88rpx); }

.no-plan-section {
  display: flex; flex-direction: column; align-items: center;
  padding: $spacing-xxl $spacing-lg; text-align: center;
}
.no-plan-icon { font-size: 100rpx; margin-bottom: $spacing-md; }
.no-plan-title { font-size: $font-size-xl; font-weight: 700; color: $color-text-primary; }
.no-plan-desc { font-size: $font-size-sm; color: $color-text-muted; margin-top: $spacing-sm; }

.plan-config { width: 100%; margin-top: $spacing-xl; }
.config-group { margin-bottom: $spacing-lg; }
.config-label { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-sm; text-align: left; }
.config-options { display: flex; gap: $spacing-sm; }
.config-chip {
  flex: 1; background: $color-bg-card; border-radius: $radius-md;
  padding: $spacing-md; text-align: center; border: 2rpx solid transparent;
  &.active { border-color: $color-accent; background: rgba(255,107,53,0.1); }
  text { font-size: $font-size-md; color: $color-text-primary; font-weight: 500; display: block; }
}
.chip-desc { font-size: $font-size-xs !important; color: $color-text-muted !important; font-weight: 400 !important; margin-top: 4rpx; }

.generate-btn {
  width: 100%; background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  color: #fff; font-size: $font-size-lg; font-weight: 600;
  border-radius: $radius-round; padding: $spacing-md 0; margin-top: $spacing-lg; border: none;
  &[disabled] { opacity: 0.4; }
}
.generate-hint { font-size: $font-size-xs; color: $color-text-muted; margin-top: $spacing-md; max-width: 500rpx; }

.plan-header-card {
  background: linear-gradient(135deg, $color-bg-card, $color-bg-card-hover);
  border-radius: $radius-lg; padding: $spacing-lg; margin-bottom: $spacing-md;
}
.plan-header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: $spacing-sm; }
.plan-name { font-size: $font-size-xl; font-weight: 700; color: $color-text-primary; }
.plan-badge { padding: 6rpx 20rpx; border-radius: $radius-round; text { font-size: $font-size-xs; color: #fff; font-weight: 600; } }
.plan-meta { display: flex; gap: $spacing-lg; font-size: $font-size-sm; color: $color-text-muted; }

.phase-timeline { display: flex; border-radius: $radius-md; overflow: hidden; margin-bottom: $spacing-lg; }
.phase-bar { padding: 12rpx 8rpx; text-align: center; transition: opacity $transition-normal; }
.phase-bar-label { font-size: 18rpx; color: #fff; font-weight: 500; }

.section { margin-bottom: $spacing-lg; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: $spacing-sm; }
.section-title { font-size: $font-size-md; font-weight: 600; color: $color-text-primary; }
.section-link { font-size: $font-size-sm; color: $color-accent-light; }

.week-training { display: flex; flex-direction: column; gap: $spacing-sm; }
.training-day-card {
  background: $color-bg-card; border-radius: $radius-md; padding: $spacing-md;
  display: flex; align-items: center; gap: $spacing-md;
  &.rest { opacity: 0.4; }
}
.day-left { display: flex; flex-direction: column; align-items: center; gap: 4rpx; min-width: 80rpx; }
.day-label { font-size: $font-size-xs; color: $color-text-muted; }
.day-right { flex: 1; }
.day-type { font-size: $font-size-md; font-weight: 600; color: $color-text-primary; }
.day-brief { font-size: $font-size-xs; color: $color-text-muted; margin-top: 2rpx; }
.day-data { display: flex; gap: $spacing-md; margin-top: 4rpx; }
.day-data-item { font-size: $font-size-sm; color: $color-accent-light; font-family: $font-family-number; }
.day-status { min-width: 40rpx; text-align: center; }
.status-rest { font-size: $font-size-md; color: $color-text-muted; }
.status-arrow { font-size: $font-size-md; color: $color-text-muted; }

.action-row { display: flex; gap: $spacing-md; margin-top: $spacing-lg; }
.action-btn {
  flex: 1; background: $color-bg-card; border-radius: $radius-md;
  padding: $spacing-md; text-align: center;
  text { font-size: $font-size-sm; color: $color-text-secondary; }
  &:active { background: $color-bg-card-hover; }
}
</style>
