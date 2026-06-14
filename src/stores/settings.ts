import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({
    defaultCategoryId: undefined,
    lastBackupAt: undefined,
  })

  function updateSettings(data: Partial<AppSettings>) {
    Object.assign(settings.value, data)
  }

  function setLastBackupAt() {
    settings.value.lastBackupAt = Date.now()
  }

  return {
    settings,
    updateSettings,
    setLastBackupAt,
  }
}, {
  persist: {
    key: 'time-computer:settings',
  },
})
