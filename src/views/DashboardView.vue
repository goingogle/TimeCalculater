<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTimeEntryStore } from '@/stores/timeEntry'
import { useCategoryStore } from '@/stores/category'
import { formatDuration, formatDateTime, formatDurationShort } from '@/utils/time'
import dayjs from 'dayjs'

const router = useRouter()
const timeEntryStore = useTimeEntryStore()
const categoryStore = useCategoryStore()

onMounted(() => {
  categoryStore.initDefaults()
})

// 今日统计
const todayEntries = computed(() => timeEntryStore.getTodayEntries())
const todayCompletedEntries = computed(() => todayEntries.value.filter(e => e.endTime !== null))
const todayTotalMs = computed(() => {
  return todayCompletedEntries.value.reduce((sum, e) => sum + (e.endTime! - e.startTime), 0)
})
const todayTotalText = computed(() => formatDuration(todayTotalMs.value))

// 本周统计
const weekEntries = computed(() => {
  const startOfWeek = dayjs().startOf('week').add(1, 'day') // 周一
  const endOfWeek = startOfWeek.add(6, 'day').endOf('day')
  return timeEntryStore.getEntriesByDateRange(startOfWeek.valueOf(), endOfWeek.valueOf())
    .filter(e => e.endTime !== null)
})
const weekTotalMs = computed(() => {
  return weekEntries.value.reduce((sum, e) => sum + (e.endTime! - e.startTime), 0)
})
const weekTotalText = computed(() => formatDuration(weekTotalMs.value))

// 最近记录
const recentEntries = computed(() => {
  return timeEntryStore.entries
    .filter(e => e.endTime !== null)
    .slice(0, 5)
})

// 获取分类名和颜色
function getCategoryInfo(categoryId: string) {
  const cat = categoryStore.getCategory(categoryId)
  return { name: cat?.name || '未分类', color: cat?.color || '#909399' }
}

// 快速入口
function goTo(page: string) {
  router.push(page)
}
</script>

<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-card__icon" style="background:#EBF8FF;color:#2B6CB0;">
          <el-icon :size="24"><Timer /></el-icon>
        </div>
        <div class="stat-card__info">
          <div class="stat-card__label">今日工时</div>
          <div class="stat-card__value tabular-nums">{{ todayTotalText }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:#F0FFF4;color:#38A169;">
          <el-icon :size="24"><Calendar /></el-icon>
        </div>
        <div class="stat-card__info">
          <div class="stat-card__label">本周工时</div>
          <div class="stat-card__value tabular-nums">{{ weekTotalText }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:#FFFAF0;color:#DD6B20;">
          <el-icon :size="24"><List /></el-icon>
        </div>
        <div class="stat-card__info">
          <div class="stat-card__label">今日记录</div>
          <div class="stat-card__value tabular-nums">{{ todayCompletedEntries.length }} 条</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:#FAF5FF;color:#805AD5;">
          <el-icon :size="24"><Clock /></el-icon>
        </div>
        <div class="stat-card__info">
          <div class="stat-card__label">总记录数</div>
          <div class="stat-card__value tabular-nums">{{ timeEntryStore.entries.length }} 条</div>
        </div>
      </div>
    </div>

    <!-- 快速入口 -->
    <div class="dashboard-quick">
      <h3 class="section-title">快速入口</h3>
      <div class="quick-actions">
        <el-button size="large" @click="goTo('/calculator')" class="quick-action-btn">
          <el-icon :size="20"><Clock /></el-icon>
          <span>时间计算</span>
        </el-button>
        <el-button size="large" @click="goTo('/tracker')" class="quick-action-btn" type="primary">
          <el-icon :size="20"><Timer /></el-icon>
          <span>工时追踪</span>
        </el-button>
        <el-button size="large" @click="goTo('/settings')" class="quick-action-btn">
          <el-icon :size="20"><Setting /></el-icon>
          <span>设置</span>
        </el-button>
      </div>
    </div>

    <!-- 正在计时 -->
    <el-card v-if="timeEntryStore.activeEntry" class="dashboard-active-timer">
      <div style="display:flex;align-items:center;gap:12px;">
        <el-icon :size="20" color="#E6A23C"><Timer /></el-icon>
        <span style="font-weight:500;">正在计时：{{ timeEntryStore.activeEntry.title }}</span>
        <el-button type="danger" size="small" @click="goTo('/tracker')">前往停止</el-button>
      </div>
    </el-card>

    <!-- 最近记录 -->
    <div class="dashboard-recent">
      <h3 class="section-title">最近记录</h3>
      <div v-if="recentEntries.length === 0" class="empty-hint">
        还没有记录，去<span class="link" @click="goTo('/tracker')">工时追踪</span>开始吧
      </div>
      <div v-else class="recent-list">
        <div v-for="entry in recentEntries" :key="entry.id" class="recent-item">
          <span class="recent-item__color" :style="{ background: getCategoryInfo(entry.categoryId).color }"></span>
          <div class="recent-item__info">
            <div class="recent-item__title">{{ entry.title }}</div>
            <div class="recent-item__meta">
              <span>{{ getCategoryInfo(entry.categoryId).name }}</span>
              <span>{{ formatDateTime(entry.startTime) }}</span>
            </div>
          </div>
          <div class="recent-item__duration tabular-nums">
            {{ formatDurationShort(entry.endTime! - entry.startTime) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  max-width: 800px;
}
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-card);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-card__label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}
.stat-card__value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text);
}
.dashboard-quick {
  margin-bottom: 24px;
}
.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: auto;
  padding: 16px 24px;
}
.dashboard-active-timer {
  margin-bottom: 24px;
}
.dashboard-recent {
  margin-bottom: 24px;
}
.empty-hint {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}
.link {
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
}
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-bg-card);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
.recent-item__color {
  width: 4px;
  height: 36px;
  border-radius: 2px;
  flex-shrink: 0;
}
.recent-item__info {
  flex: 1;
}
.recent-item__title {
  font-weight: 500;
  font-size: 14px;
}
.recent-item__meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  gap: 12px;
  margin-top: 2px;
}
.recent-item__duration {
  font-weight: 600;
  font-size: 15px;
  color: var(--color-primary);
}
</style>
