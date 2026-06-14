<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useTimeEntryStore } from '@/stores/timeEntry'
import { formatDurationShort } from '@/utils/time'
import { usePreciseTimer } from '@/composables/usePreciseTimer'

const route = useRoute()
const timeEntryStore = useTimeEntryStore()

const pageTitle = computed(() => {
  return (route.meta.title as string) || '时间计算机'
})

// 全局计时器显示
const timer = usePreciseTimer()
const hasActiveEntry = computed(() => !!timeEntryStore.activeEntry)

// 当有活跃记录时，更新显示的已过时间
const activeTimerDisplay = computed(() => {
  if (!hasActiveEntry.value) return ''
  return formatDurationShort(timer.elapsed.value)
})

// 监听活跃记录变化
import { watch } from 'vue'
watch(hasActiveEntry, (active) => {
  if (active) {
    timer.start()
  } else {
    timer.stop()
  }
}, { immediate: true })
</script>

<template>
  <header class="app-header">
    <h2 class="app-header__title">{{ pageTitle }}</h2>
    <div class="app-header__right">
      <div v-if="hasActiveEntry" class="app-header__timer tabular-nums">
        <el-icon color="#E6A23C" :size="16"><Timer /></el-icon>
        <span>计时中 {{ activeTimerDisplay }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
}
.app-header__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
.app-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.app-header__timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #E6A23C;
  font-weight: 500;
}
</style>
