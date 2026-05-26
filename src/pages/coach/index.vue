<template>
  <view class="coach-page">
    <rp-navbar title="AI 教练" subtitle="RunPilot Coach">
      <template #right>
        <view class="nav-right" @tap="toggleSessions">
          <text class="nav-icon">{{ showSessions ? '✕' : '☰' }}</text>
        </view>
      </template>
    </rp-navbar>

    <!-- 会话列表侧栏 -->
    <view v-if="showSessions" class="sessions-overlay" @tap="showSessions = false">
      <view class="sessions-panel" @tap.stop>
        <view class="sessions-header">
          <text class="sessions-title">历史对话</text>
          <text class="sessions-new" @tap="startNewChat">+ 新对话</text>
        </view>
        <scroll-view scroll-y class="sessions-list">
          <view
            v-for="s in coachStore.sortedSessions"
            :key="s.sessionId"
            class="session-item"
            :class="{ active: s.sessionId === coachStore.currentSessionId }"
            @tap="switchSession(s.sessionId)"
          >
            <text class="session-title">{{ s.title }}</text>
            <text class="session-preview">{{ s.lastMessage }}</text>
            <text class="session-time">{{ s.updatedAt }}</text>
          </view>
          <rp-empty-state
            v-if="coachStore.sortedSessions.length === 0"
            icon="💬"
            title="暂无对话"
            description="开始和 AI 教练交流吧"
          />
        </scroll-view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view
      scroll-y
      class="chat-messages"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      @scrolltolower="onScrollToLower"
    >
      <rp-empty-state
        v-if="!coachStore.hasActiveSession"
        icon="🏃"
        title="RunPilot AI 教练"
        description="你可以问我关于训练计划、跑步技巧、营养建议、伤病预防等各种问题"
      >
        <template #action>
          <view class="quick-start-actions">
            <view
              v-for="q in quickQuestions"
              :key="q"
              class="quick-question"
              @tap="sendMessage(q)"
            >
              <text>{{ q }}</text>
            </view>
          </view>
        </template>
      </rp-empty-state>

      <chat-message
        v-for="(msg, i) in coachStore.messages"
        :key="i"
        :role="msg.role"
        :content="msg.content"
        :timestamp="msg.timestamp"
        :isStreaming="msg._streaming"
        :chips="msg.chips"
        @chipTap="(chip) => sendMessage(chip.label)"
      />

      <chat-typing v-if="coachStore.isStreaming && !hasStreamingMessage" />
    </scroll-view>

    <!-- 输入栏 -->
    <chat-input
      :disabled="coachStore.isStreaming"
      :quickActions="quickActions"
      placeholder="输入你的问题..."
      @send="sendMessage"
      @quickAction="(action) => sendMessage(action)"
    />
  </view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useCoachStore } from '@/stores/modules/coach'
import { useUserStore } from '@/stores/modules/user'
import { usePlanStore } from '@/stores/modules/plan'

const coachStore = useCoachStore()
const userStore = useUserStore()
const planStore = usePlanStore()

const showSessions = ref(false)
const scrollTop = ref(0)

const quickQuestions = [
  '我的训练计划合理吗？',
  '节奏跑和间歇跑有什么区别？',
  '跑完膝盖疼怎么办？',
  '比赛前一周应该怎么准备？',
  '如何提高步频？'
]

const quickActions = ['今天状态不好', '帮我调整课表', '最近跑得怎么样']

const hasStreamingMessage = computed(() =>
  coachStore.messages.some(m => m._streaming)
)

function toggleSessions() {
  showSessions.value = !showSessions.value
  if (showSessions.value) coachStore.fetchSessions()
}

function startNewChat() {
  coachStore.newSession()
  showSessions.value = false
}

function switchSession(sessionId) {
  coachStore.loadSession(sessionId)
  showSessions.value = false
}

async function sendMessage(text) {
  if (!text || coachStore.isStreaming) return

  // 确保有活跃会话
  if (!coachStore.currentSessionId) {
    coachStore.newSession()
  }

  // 添加用户消息
  coachStore.addMessage('user', text)

  // 滚动到底部
  scrollToBottom()

  // 开始流式响应
  coachStore.startStreaming()
  scrollToBottom()

  try {
    // 构建上下文
    const context = {
      userProfile: {
        nickname: userStore.nickname,
        age: userStore.profile?.age,
        running_experience: userStore.profile?.running_experience,
        goal_distance: userStore.goalDistance,
        goal_time_sec: userStore.goalTimeSec,
        goal_race_date: userStore.raceDate
      },
      planContext: planStore.hasActivePlan ? {
        plan_name: planStore.activePlan.plan_name,
        currentWeek: planStore.currentWeekIndex + 1,
        totalWeeks: planStore.totalWeeks,
        currentPhase: planStore.currentPhase,
        todayWorkout: planStore.todayWorkout,
        weeklyProgress: planStore.weeklyProgress
      } : null
    }

    const res = await wx.cloud.callFunction({
      name: 'ai-coach-chat',
      data: {
        sessionId: coachStore.currentSessionId,
        message: text,
        context
      }
    })

    // 模拟流式追加（实际中 SSE 需要 wx.request enableChunked）
    const reply = res.result?.reply || '抱歉，我暂时无法回复。请稍后再试。'
    // 逐字追加模拟流式效果
    coachStore.finishStreaming()
    // 清除流式消息，添加完整回复
    coachStore.messages.pop()
    coachStore.addMessage('assistant', reply)

  } catch (err) {
    console.error('sendMessage error:', err)
    coachStore.finishStreaming()
    coachStore.messages.pop()
    coachStore.addMessage('assistant', '抱歉，连接出现了一些问题。请稍后再试。')
  }

  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    scrollTop.value = scrollTop.value + 1
  })
}

function onScrollToLower() {}

onMounted(() => {
  coachStore.newSession()
})
</script>

<style lang="scss" scoped>
.coach-page {
  min-height: 100vh;
  background-color: $color-bg-primary;
  display: flex;
  flex-direction: column;
}

.nav-right { padding: $spacing-sm; }
.nav-icon { font-size: $font-size-lg; color: $color-text-secondary; }

.chat-messages {
  flex: 1;
  padding-bottom: $spacing-sm;
}

.sessions-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 150;
  display: flex; justify-content: flex-end;
}
.sessions-panel {
  width: 560rpx; background: $color-bg-secondary; height: 100%;
  display: flex; flex-direction: column;
}
.sessions-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: $spacing-lg; border-bottom: 1rpx solid rgba(255,255,255,0.06);
}
.sessions-title { font-size: $font-size-lg; font-weight: 600; color: $color-text-primary; }
.sessions-new { font-size: $font-size-sm; color: $color-accent; }
.sessions-list { flex: 1; }
.session-item {
  padding: $spacing-md $spacing-lg; border-bottom: 1rpx solid rgba(255,255,255,0.04);
  &.active { background: rgba(255,107,53,0.1); }
}
.session-title { font-size: $font-size-base; color: $color-text-primary; font-weight: 500; display: block; }
.session-preview { font-size: $font-size-xs; color: $color-text-muted; display: block; margin-top: 4rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.session-time { font-size: 18rpx; color: $color-text-muted; }

.quick-start-actions { display: flex; flex-wrap: wrap; gap: $spacing-sm; justify-content: center; }
.quick-question {
  background: rgba(255,255,255,0.06); border-radius: $radius-round;
  padding: 12rpx 24rpx;
  text { font-size: $font-size-sm; color: $color-text-secondary; }
  &:active { background: rgba(255,107,53,0.15); }
}
</style>
