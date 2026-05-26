import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { callCloudFunction, dbFind } from '@/common/api/cloud'

export const useTrainingStore = defineStore('training', () => {
  // --- State ---
  const logs = ref([])
  const stats = ref(null)
  const pbs = ref([])
  const badges = ref([])
  const recentBadges = ref([])

  // --- Getters ---
  const totalKm = computed(() =>
    logs.value.reduce((sum, l) => sum + (l.actual_distance_km || 0), 0)
  )

  const totalRuns = computed(() =>
    logs.value.filter(l => l.completion_status === 'done').length
  )

  const recentLogs = computed(() =>
    logs.value.slice(0, 7)
  )

  const last7DaysKm = computed(() => {
    const since = new Date()
    since.setDate(since.getDate() - 7)
    return logs.value
      .filter(l => new Date(l.workout_date) >= since && l.completion_status === 'done')
      .reduce((sum, l) => sum + (l.actual_distance_km || 0), 0)
  })

  const averagePace = computed(() => {
    const done = logs.value.filter(l => l.completion_status === 'done' && l.actual_pace_sec_per_km)
    if (done.length === 0) return null
    const avg = done.reduce((sum, l) => sum + l.actual_pace_sec_per_km, 0) / done.length
    return Math.round(avg)
  })

  const pbMap = computed(() => {
    const map = {}
    pbs.value.forEach(pb => { map[pb.distance] = pb })
    return map
  })

  // --- Actions ---
  async function fetchLogs(limit = 30) {
    try {
      const data = await dbFind('training_logs', {}, {
        orderBy: 'workout_date',
        order: 'desc',
        limit
      })
      logs.value = data
    } catch (err) {
      console.error('fetchLogs error:', err)
    }
  }

  async function fetchStats(period = 'monthly') {
    try {
      const res = await callCloudFunction('stats-analysis', { period })
      stats.value = res.stats || null
      if (res.pbs) pbs.value = res.pbs
    } catch (err) {
      console.error('fetchStats error:', err)
    }
  }

  async function fetchBadges() {
    try {
      const data = await dbFind('user_achievements', {}, {
        orderBy: 'unlocked_at',
        order: 'desc',
        limit: 50
      })
      badges.value = data
    } catch (err) {
      console.error('fetchBadges error:', err)
    }
  }

  async function submitFeedback(feedbackData) {
    try {
      const res = await callCloudFunction('training-feedback', feedbackData)
      if (res.earnedBadges?.length > 0) {
        recentBadges.value = res.earnedBadges
        badges.value.unshift(...res.earnedBadges.map(b => ({
          achievement_id: b._id,
          unlocked_at: new Date().toISOString(),
          achievement: b
        })))
      }
      await fetchLogs()
      return res
    } catch (err) {
      console.error('submitFeedback error:', err)
      throw err
    }
  }

  function clearRecentBadges() {
    recentBadges.value = []
  }

  return {
    logs, stats, pbs, badges, recentBadges,
    totalKm, totalRuns, recentLogs, last7DaysKm, averagePace, pbMap,
    fetchLogs, fetchStats, fetchBadges, submitFeedback, clearRecentBadges
  }
}, {
  persist: {
    paths: ['badges']
  }
})
