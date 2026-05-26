import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dbFindOne } from '@/common/api/cloud'

export const useCoachStore = defineStore('coach', () => {
  // --- State ---
  const sessions = ref([])
  const currentSessionId = ref(null)
  const messages = ref([])
  const isStreaming = ref(false)
  const streamingText = ref('')

  // --- Getters ---
  const sortedSessions = computed(() =>
    [...sessions.value].sort((a, b) =>
      new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
    )
  )

  const hasActiveSession = computed(() =>
    messages.value.length > 0
  )

  // --- Actions ---
  function newSession() {
    currentSessionId.value = `sess_${Date.now()}`
    messages.value = []
    streamingText.value = ''
  }

  async function loadSession(sessionId) {
    currentSessionId.value = sessionId
    try {
      const data = await dbFindOne('chat_history', { session_id: sessionId })
      messages.value = data?.messages || []
    } catch (err) {
      console.error('loadSession error:', err)
    }
  }

  async function fetchSessions() {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('chat_history')
        .where({ _openid: '{openid}' })
        .orderBy('updated_at', 'desc')
        .limit(20)
        .get()
      sessions.value = (res.data || []).map(s => ({
        sessionId: s.session_id,
        title: s.context_summary || '新对话',
        lastMessage: s.messages?.slice(-1)[0]?.content?.slice(0, 30) || '',
        updatedAt: s.updated_at
      }))
    } catch (err) {
      console.error('fetchSessions error:', err)
    }
  }

  function addMessage(role, content) {
    messages.value.push({
      role,
      content,
      timestamp: new Date().toISOString()
    })
  }

  function startStreaming() {
    isStreaming.value = true
    streamingText.value = ''
    // 在消息列表中添加一个占位消息用于流式追加
    messages.value.push({
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      _streaming: true
    })
  }

  function appendStreamChunk(text) {
    streamingText.value += text
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg._streaming) {
      lastMsg.content = streamingText.value
    }
  }

  function finishStreaming() {
    isStreaming.value = false
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg._streaming) {
      delete lastMsg._streaming
    }
    streamingText.value = ''
  }

  function clearMessages() {
    messages.value = []
    streamingText.value = ''
  }

  return {
    sessions, currentSessionId, messages, isStreaming, streamingText,
    sortedSessions, hasActiveSession,
    newSession, loadSession, fetchSessions, addMessage,
    startStreaming, appendStreamChunk, finishStreaming, clearMessages
  }
})
