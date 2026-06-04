import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { callCloudFunction, dbAdd, dbFind } from '@/common/api/cloud'

export const useTrainingStore = defineStore('training', () => {
  // --- State ---
  const logs = ref([])
  const stats = ref(null)
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

  const pbs = computed(() => {
    const best = {}
    const targets = [
      { distance: '1k', km: 1 },
      { distance: '5k', km: 5 },
      { distance: '10k', km: 10 },
      { distance: 'half_marathon', km: 21.0975 },
      { distance: 'marathon', km: 42.195 }
    ]
    logs.value.forEach(log => {
      if (log.completion_status !== 'done') return
      const km = Number(log.actual_distance_km) || 0
      const duration = Number(log.actual_duration_min) || 0
      if (!km || !duration) return
      targets.forEach(target => {
        if (Math.abs(km - target.km) > target.km * 0.03) return
        const seconds = Math.round(duration * 60)
        if (!best[target.distance] || seconds < best[target.distance].seconds) {
          best[target.distance] = {
            distance: target.distance,
            time: formatDuration(seconds),
            workout_date: log.workout_date,
            seconds
          }
        }
      })
    })
    return Object.values(best)
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
      if (res.__mock) {
        const distance = Number(feedbackData.actual_distance_km) || 0
        const duration = Number(feedbackData.actual_duration_min) || 0
        await dbAdd('training_logs', {
          ...feedbackData,
          actual_distance_km: distance || undefined,
          actual_duration_min: duration || undefined,
          actual_pace_sec_per_km: distance && duration ? Math.round(duration * 60 / distance) : undefined,
          completion_status: feedbackData.completion_status || 'done',
          workout_date: feedbackData.workout_date || new Date().toISOString().split('T')[0],
          source: feedbackData.manual ? 'manual' : 'local'
        })
      }
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

  function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
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
