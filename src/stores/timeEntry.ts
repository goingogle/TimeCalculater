import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TimeEntry } from '@/types'
import { generateId } from '@/utils/time'

export const useTimeEntryStore = defineStore('timeEntry', () => {
  const entries = ref<TimeEntry[]>([])

  /** 正在计时的记录（endTime为null） */
  const activeEntry = computed(() => entries.value.find(e => e.endTime === null))

  /** 添加记录 */
  function addEntry(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Date.now()
    entries.value.unshift({
      ...entry,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    })
  }

  /** 开始计时 */
  function startTimer(title: string, categoryId: string, tagIds: string[] = []) {
    if (activeEntry.value) return // 已有计时中的记录
    addEntry({
      title,
      description: '',
      startTime: Date.now(),
      endTime: null,
      categoryId,
      tagIds,
      source: 'timer',
    })
  }

  /** 停止当前计时 */
  function stopTimer() {
    const entry = activeEntry.value
    if (!entry) return
    entry.endTime = Date.now()
    entry.updatedAt = Date.now()
  }

  /** 更新记录 */
  function updateEntry(id: string, data: Partial<TimeEntry>) {
    const entry = entries.value.find(e => e.id === id)
    if (!entry) return
    Object.assign(entry, data, { updatedAt: Date.now() })
  }

  /** 删除记录 */
  function deleteEntry(id: string) {
    entries.value = entries.value.filter(e => e.id !== id)
  }

  /** 批量删除 */
  function deleteEntries(ids: string[]) {
    const idSet = new Set(ids)
    entries.value = entries.value.filter(e => !idSet.has(e.id))
  }

  /** 按日期范围筛选 */
  function getEntriesByDateRange(start: number, end: number) {
    return entries.value.filter(e => {
      const entryStart = e.startTime
      return entryStart >= start && entryStart <= end
    })
  }

  /** 获取今日记录 */
  function getTodayEntries() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return getEntriesByDateRange(today.getTime(), tomorrow.getTime() - 1)
  }

  /** 导出所有数据 */
  function exportAll() {
    return JSON.stringify(entries.value, null, 2)
  }

  /** 导入数据 */
  function importData(json: string) {
    try {
      const data = JSON.parse(json) as TimeEntry[]
      if (Array.isArray(data)) {
        entries.value = data
        return true
      }
      return false
    } catch {
      return false
    }
  }

  /** 清除所有数据 */
  function clearAll() {
    entries.value = []
  }

  return {
    entries,
    activeEntry,
    addEntry,
    startTimer,
    stopTimer,
    updateEntry,
    deleteEntry,
    deleteEntries,
    getEntriesByDateRange,
    getTodayEntries,
    exportAll,
    importData,
    clearAll,
  }
}, {
  persist: {
    key: 'time-computer:timeEntry',
  },
})
