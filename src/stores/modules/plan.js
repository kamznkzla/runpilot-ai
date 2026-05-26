import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { callCloudFunction, dbFindOne } from '@/common/api/cloud'
import { formatDate } from '@/common/utils/date'

export const usePlanStore = defineStore('plan', () => {
  // --- State ---
  const activePlan = ref(null)
  const currentWeekIndex = ref(0)
  const weekCompletion = ref({})
  const isGenerating = ref(false)

  // --- Getters ---
  const hasActivePlan = computed(() =>
    !!activePlan.value && activePlan.value.status === 'active'
  )

  const currentWeek = computed(() =>
    activePlan.value?.weeks?.[currentWeekIndex.value] || null
  )

  const currentPhase = computed(() =>
    activePlan.value?.current_phase || null
  )

  const totalWeeks = computed(() =>
    activePlan.value?.total_weeks || 0
  )

  const todayWorkout = computed(() => {
    if (!currentWeek.value) return null
    const today = formatDate(new Date())
    const dayMap = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday'
    }
    const dayKey = dayMap[new Date().getDay()]
    return currentWeek.value.days.find(d => d.day === dayKey) || null
  })

  const weeklyProgress = computed(() => {
    if (!currentWeek.value) return { completed: 0, total: 0, percentage: 0 }
    const sessions = currentWeek.value.days.filter(d => d.type !== 'rest')
    const total = sessions.length
    const completed = sessions.filter(s => {
      const key = getDayCompletionKey(currentWeekIndex.value, s.day)
      return weekCompletion.value[key] === 'done'
    }).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percentage }
  })

  const phaseProgress = computed(() => {
    if (!activePlan.value) return 0
    const week = currentWeekIndex.value + 1
    return Math.min(100, Math.round((week / activePlan.value.total_weeks) * 100))
  })

  const raceCountdown = computed(() => {
    if (!activePlan.value?.race_date) return null
    const now = new Date()
    const race = new Date(activePlan.value.race_date)
    const days = Math.ceil((race - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  })

  const allWorkoutsFlat = computed(() => {
    if (!activePlan.value?.weeks) return []
    return activePlan.value.weeks.flatMap((w, wi) =>
      w.days.map(d => ({ ...d, weekNumber: wi + 1 }))
    )
  })

  // --- Actions ---
  async function fetchActivePlan() {
    try {
      const plan = await dbFindOne('training_plans', { status: 'active' })
      if (plan) {
        activePlan.value = plan
        const startDate = new Date(plan.start_date)
        const now = new Date()
        const diffWeeks = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000))
        currentWeekIndex.value = Math.max(0, Math.min(diffWeeks, plan.total_weeks - 1))
      }
    } catch (err) {
      console.error('fetchActivePlan error:', err)
    }
  }

  async function generatePlan(params) {
    isGenerating.value = true
    try {
      const res = await callCloudFunction('ai-generate-plan', {
        goalDistance: params.goalDistance,
        goalTimeSec: params.goalTimeSec,
        goalRaceDate: params.goalRaceDate,
        weeksCount: params.weeksCount,
        experienceLevel: params.experienceLevel,
        weeklyDays: params.weeklyDays,
        userProfile: params.userProfile
      })
      activePlan.value = res.plan
      currentWeekIndex.value = 0
      weekCompletion.value = {}
      return res.plan
    } finally {
      isGenerating.value = false
    }
  }

  async function adjustPlan(reason) {
    try {
      const res = await callCloudFunction('ai-plan-adjust', {
        planId: activePlan.value?._id,
        adjustmentReason: reason
      })
      if (res.adjustedPlan) {
        activePlan.value = res.adjustedPlan
      }
      return res.adjustedPlan
    } catch (err) {
      console.error('adjustPlan error:', err)
      throw err
    }
  }

  function markWorkoutComplete(day, status) {
    const key = getDayCompletionKey(currentWeekIndex.value, day)
    weekCompletion.value[key] = status
  }

  function setWeek(index) {
    if (activePlan.value && index >= 0 && index < activePlan.value.total_weeks) {
      currentWeekIndex.value = index
    }
  }

  function getDayCompletionKey(weekIndex, day) {
    return `w${weekIndex}_${day}`
  }

  return {
    activePlan, currentWeekIndex, weekCompletion, isGenerating,
    hasActivePlan, currentWeek, currentPhase, totalWeeks,
    todayWorkout, weeklyProgress, phaseProgress, raceCountdown, allWorkoutsFlat,
    fetchActivePlan, generatePlan, adjustPlan, markWorkoutComplete, setWeek
  }
}, {
  persist: {
    paths: ['activePlan', 'currentWeekIndex', 'weekCompletion']
  }
})
