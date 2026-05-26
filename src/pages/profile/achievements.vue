<template>
  <view class="achievements-page">
    <rp-navbar :showBack="true" title="成就墙" />

    <scroll-view scroll-y class="ach-content">
      <view v-for="cat in categories" :key="cat.key" class="ach-section">
        <text class="ach-category">{{ cat.label }}</text>
        <view class="ach-grid">
          <rp-badge
            v-for="badge in getBadgesByCategory(cat.key)"
            :key="badge._id"
            :name="badge.achievement?.name || badge.name"
            :icon="badge.achievement?.icon_url || ''"
            :rarity="badge.achievement?.rarity || 'common'"
            :locked="!!badge.locked"
            :unlockedAt="badge.unlocked_at ? formatDate(badge.unlocked_at) : ''"
          />
          <rp-badge
            v-for="locked in getLockedBadges(cat.key)"
            :key="'locked-' + locked._id"
            :name="locked.name"
            :rarity="locked.rarity"
            :locked="true"
          />
        </view>
      </view>

      <rp-empty-state
        v-if="!hasBadges"
        icon="🏅"
        title="还没有获得成就"
        description="完成训练，解锁你的第一个成就吧！"
      />
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTrainingStore } from '@/stores/modules/training'

const trainingStore = useTrainingStore()

const categories = [
  { key: 'milestone', label: '里程里程碑' },
  { key: 'streak', label: '连续打卡' },
  { key: 'pb', label: '个人最佳' },
  { key: 'volume', label: '跑量挑战' },
  { key: 'special', label: '特殊成就' }
]

const allAchievements = [
  { _id: 'ach_001', name: '初次10公里', rarity: 'common', category: 'milestone' },
  { _id: 'ach_002', name: '半马达成', rarity: 'rare', category: 'milestone' },
  { _id: 'ach_003', name: '全马达成', rarity: 'epic', category: 'milestone' },
  { _id: 'ach_004', name: '连续7天', rarity: 'common', category: 'streak' },
  { _id: 'ach_005', name: '连续30天', rarity: 'rare', category: 'streak' },
  { _id: 'ach_006', name: '5K PB', rarity: 'common', category: 'pb' },
  { _id: 'ach_007', name: '10K PB', rarity: 'common', category: 'pb' },
  { _id: 'ach_008', name: '月跑量100K', rarity: 'rare', category: 'volume' },
  { _id: 'ach_009', name: '月跑量200K', rarity: 'epic', category: 'volume' },
  { _id: 'ach_010', name: '早起跑者', rarity: 'rare', category: 'special' },
  { _id: 'ach_011', name: '雨战勇士', rarity: 'rare', category: 'special' }
]

const hasBadges = computed(() => trainingStore.badges.length > 0)

function getBadgesByCategory(cat) {
  return trainingStore.badges.filter(b => {
    const ach = b.achievement || {}
    return (ach.category || b.category) === cat
  })
}

function getLockedBadges(cat) {
  const earned = new Set(getBadgesByCategory(cat).map(b => b.achievement_id))
  return allAchievements.filter(a => a.category === cat && !earned.has(a._id)).map(a => ({
    ...a, locked: true
  }))
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

onMounted(() => { trainingStore.fetchBadges() })
</script>

<style lang="scss" scoped>
.achievements-page { min-height: 100vh; background-color: $color-bg-primary; }
.ach-content { padding: $spacing-md; }
.ach-section { margin-bottom: $spacing-xl; }
.ach-category {
  font-size: $font-size-md; font-weight: 600; color: $color-text-primary;
  display: block; margin-bottom: $spacing-md;
}
.ach-grid { display: flex; flex-wrap: wrap; gap: $spacing-sm; }
</style>
