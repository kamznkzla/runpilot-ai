import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // --- State ---
  const notificationsEnabled = ref(true)
  const trainingReminder = ref(true)
  const raceCountdownReminder = ref(true)
  const weeklyReportReminder = ref(true)
  const privacyShareData = ref(false)
  const preferredUnit = ref('metric')
  const theme = ref('dark')

  // --- Actions ---
  function toggleNotifications() { notificationsEnabled.value = !notificationsEnabled.value }
  function toggleTrainingReminder() { trainingReminder.value = !trainingReminder.value }
  function toggleRaceCountdown() { raceCountdownReminder.value = !raceCountdownReminder.value }
  function toggleWeeklyReport() { weeklyReportReminder.value = !weeklyReportReminder.value }
  function togglePrivacy() { privacyShareData.value = !privacyShareData.value }
  function setUnit(unit) { preferredUnit.value = unit }

  return {
    notificationsEnabled, trainingReminder, raceCountdownReminder,
    weeklyReportReminder, privacyShareData, preferredUnit, theme,
    toggleNotifications, toggleTrainingReminder, toggleRaceCountdown,
    toggleWeeklyReport, togglePrivacy, setUnit
  }
}, {
  persist: {
    paths: [
      'notificationsEnabled', 'trainingReminder', 'raceCountdownReminder',
      'weeklyReportReminder', 'privacyShareData', 'preferredUnit', 'theme'
    ]
  }
})
