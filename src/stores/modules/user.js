import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { callCloudFunction, dbFindOne } from '@/common/api/cloud'

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const profile = ref(null)
  const isOnboardingComplete = ref(false)
  const onboardingStep = ref(0)
  const onboardingData = ref({})

  // --- Getters ---
  const isLoggedIn = computed(() => !!profile.value)
  const nickname = computed(() => profile.value?.nickname || '跑者')
  const goalDistance = computed(() => profile.value?.goal_distance || null)
  const goalDistanceLabel = computed(() => {
    const map = { '5k': '5公里', '10k': '10公里', half_marathon: '半马', marathon: '全马' }
    return map[profile.value?.goal_distance] || ''
  })
  const goalTimeSec = computed(() => profile.value?.goal_time_sec || null)
  const raceDate = computed(() => profile.value?.goal_race_date || null)
  const connectedDevices = computed(() => profile.value?.connected_devices || [])
  const currentPhase = computed(() => profile.value?.current_phase || 'base')
  const bmi = computed(() => {
    if (!profile.value?.height_cm || !profile.value?.weight_kg) return null
    const h = profile.value.height_cm / 100
    return (profile.value.weight_kg / (h * h)).toFixed(1)
  })

  // --- Actions ---
  async function fetchProfile() {
    try {
      const data = await dbFindOne('users')
      if (data) {
        profile.value = data
        isOnboardingComplete.value = data.onboarding_completed === true
        onboardingStep.value = data.onboarding_step || 0
      }
    } catch (err) {
      console.error('fetchProfile error:', err)
    }
  }

  function setOnboardingStep(step) {
    onboardingStep.value = step
  }

  function updateOnboardingData(data) {
    Object.assign(onboardingData.value, data)
  }

  async function completeOnboarding() {
    const merged = {
      ...onboardingData.value,
      onboarding_completed: true,
      onboarding_step: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    try {
      await callCloudFunction('user-sync', { data: merged })
      profile.value = merged
      isOnboardingComplete.value = true
      onboardingData.value = {}
      onboardingStep.value = 0
    } catch (err) {
      console.error('completeOnboarding error:', err)
      throw err
    }
  }

  async function updateProfile(data) {
    try {
      await callCloudFunction('user-sync', { data })
      if (profile.value) Object.assign(profile.value, data)
    } catch (err) {
      console.error('updateProfile error:', err)
      throw err
    }
  }

  async function logout() {
    profile.value = null
    isOnboardingComplete.value = false
    onboardingStep.value = 0
    onboardingData.value = {}
  }

  return {
    profile, isOnboardingComplete, onboardingStep, onboardingData,
    isLoggedIn, nickname, goalDistance, goalDistanceLabel, goalTimeSec,
    raceDate, connectedDevices, currentPhase, bmi,
    fetchProfile, setOnboardingStep, updateOnboardingData, completeOnboarding, updateProfile, logout
  }
}, {
  persist: {
    paths: ['profile', 'isOnboardingComplete', 'onboardingStep', 'onboardingData']
  }
})
