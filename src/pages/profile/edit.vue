<template>
  <view class="edit-page">
    <rp-navbar :showBack="true" title="编辑资料" />

    <scroll-view scroll-y class="edit-content">
      <view class="form-group">
        <text class="form-label">昵称</text>
        <input class="form-input" v-model="form.nickname" placeholder="输入昵称" placeholder-style="color: #6B6E7D" />
      </view>

      <view class="form-group">
        <text class="form-label">性别</text>
        <view class="gender-toggle">
          <view class="gender-btn" :class="{ active: form.gender === 'male' }" @tap="form.gender = 'male'">
            <text>👨 男</text>
          </view>
          <view class="gender-btn" :class="{ active: form.gender === 'female' }" @tap="form.gender = 'female'">
            <text>👩 女</text>
          </view>
        </view>
      </view>

      <view class="form-row">
        <view class="form-group half">
          <text class="form-label">年龄</text>
          <input class="form-input" type="number" v-model="form.age" placeholder="年龄" placeholder-style="color: #6B6E7D" />
        </view>
        <view class="form-group half">
          <text class="form-label">身高 (cm)</text>
          <input class="form-input" type="digit" v-model="form.height" placeholder="身高" placeholder-style="color: #6B6E7D" />
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">体重 (kg)</text>
        <input class="form-input" type="digit" v-model="form.weight" placeholder="体重" placeholder-style="color: #6B6E7D" />
      </view>

      <view class="form-group">
        <text class="form-label">目标距离</text>
        <picker :range="goalDistLabels" :value="goalDistIndex" @change="onGoalDistChange">
          <view class="picker-value">{{ goalDistLabels[goalDistIndex] || '选择目标' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">目标完赛时间</text>
        <input class="form-input" v-model="form.goalTimeDisplay" placeholder="如 3:30:00" placeholder-style="color: #6B6E7D" />
      </view>

      <view class="form-group">
        <text class="form-label">目标比赛日期</text>
        <picker mode="date" :value="form.raceDate" :start="minDate" @change="onDateChange">
          <view class="picker-value">{{ form.raceDate || '选择日期' }}</view>
        </picker>
      </view>

      <button class="save-btn" :loading="saving" @tap="handleSave">保存修改</button>
    </scroll-view>
  </view>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { parseRaceTime } from '@/common/utils/validator'

const userStore = useUserStore()
const saving = ref(false)
const minDate = new Date().toISOString().split('T')[0]

const goalDistances = [
  { value: '5k', label: '5 公里' },
  { value: '10k', label: '10 公里' },
  { value: 'half_marathon', label: '半马' },
  { value: 'marathon', label: '全马' }
]
const goalDistLabels = goalDistances.map(d => d.label)
const goalDistIndex = ref(goalDistances.findIndex(d => d.value === userStore.profile?.goal_distance))

const form = reactive({
  nickname: userStore.profile?.nickname || '',
  gender: userStore.profile?.gender || 'male',
  age: userStore.profile?.age || '',
  height: userStore.profile?.height_cm || '',
  weight: userStore.profile?.weight_kg || '',
  goalTimeDisplay: userStore.profile?.goal_time_display || '',
  raceDate: userStore.profile?.goal_race_date || ''
})

function onGoalDistChange(e) {
  goalDistIndex.value = e.detail.value
}
function onDateChange(e) {
  form.raceDate = e.detail.value
}

async function handleSave() {
  saving.value = true
  try {
    const goalTimeSec = form.goalTimeDisplay ? parseRaceTime(form.goalTimeDisplay) : 0
    const goalDist = goalDistances[goalDistIndex.value]
    await userStore.updateProfile({
      nickname: form.nickname,
      gender: form.gender,
      age: Number(form.age),
      height_cm: Number(form.height),
      weight_kg: Number(form.weight),
      goal_distance: goalDist?.value,
      goal_time_sec: goalTimeSec,
      goal_time_display: form.goalTimeDisplay,
      goal_race_date: form.raceDate,
      updated_at: new Date().toISOString()
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (err) {
    uni.showToast({ title: '保存失败', icon: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit-page { min-height: 100vh; background-color: $color-bg-primary; }
.edit-content { padding: $spacing-lg; }
.form-group { margin-bottom: $spacing-lg; }
.form-row { display: flex; gap: $spacing-md; }
.form-group.half { flex: 1; }
.form-label { font-size: $font-size-sm; color: $color-text-muted; display: block; margin-bottom: $spacing-sm; }
.form-input {
  background-color: $color-bg-input; border-radius: $radius-md;
  padding: $spacing-md; font-size: $font-size-md; color: $color-text-primary;
  &:focus { border: 1rpx solid $color-accent; }
}
.picker-value {
  background-color: $color-bg-input; border-radius: $radius-md;
  padding: $spacing-md; font-size: $font-size-md; color: $color-text-primary;
}
.gender-toggle { display: flex; gap: $spacing-md; }
.gender-btn {
  flex: 1; background-color: $color-bg-input; border-radius: $radius-md;
  padding: $spacing-md; text-align: center; border: 2rpx solid transparent;
  color: $color-text-secondary; font-size: $font-size-md;
  &.active { border-color: $color-accent; color: $color-text-primary; background: rgba(255,107,53,0.1); }
}
.save-btn {
  width: 100%; background: linear-gradient(135deg, $color-accent, $color-accent-dark);
  color: #fff; font-size: $font-size-md; font-weight: 600;
  border-radius: $radius-round; padding: $spacing-md 0; margin-top: $spacing-xl; border: none;
}
</style>
