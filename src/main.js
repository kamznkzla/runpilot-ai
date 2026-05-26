import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import App from './App.vue'

const pinia = Pinia.createPinia()

// Pinia 持久化插件 - 适配 uni-app Storage API
pinia.use(createPersistedState({
  storage: {
    getItem: (key) => {
      const value = uni.getStorageSync(key)
      return value !== '' ? JSON.parse(value) : null
    },
    setItem: (key, value) => {
      uni.setStorageSync(key, JSON.stringify(value))
    }
  }
}))

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  return { app, pinia }
}
