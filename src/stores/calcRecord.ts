import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CalcRecord } from '@/types'
import { generateId } from '@/utils/time'

export const useCalcRecordStore = defineStore('calcRecord', () => {
  const records = ref<CalcRecord[]>([])

  /** 添加计算记录 */
  function addRecord(data: Omit<CalcRecord, 'id' | 'createdAt'>) {
    records.value.unshift({
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    })
    // 只保留最近100条
    if (records.value.length > 100) {
      records.value = records.value.slice(0, 100)
    }
  }

  /** 清除所有记录 */
  function clearAll() {
    records.value = []
  }

  /** 导出 */
  function exportAll() {
    return JSON.stringify(records.value, null, 2)
  }

  /** 导入 */
  function importData(json: string) {
    try {
      const data = JSON.parse(json) as CalcRecord[]
      if (Array.isArray(data)) {
        records.value = data
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return {
    records,
    addRecord,
    clearAll,
    exportAll,
    importData,
  }
}, {
  persist: {
    key: 'time-computer:calcRecord',
  },
})
