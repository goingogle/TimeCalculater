import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag } from '@/types'
import { generateId } from '@/utils/time'

export const useTagStore = defineStore('tag', () => {
  const tags = ref<Tag[]>([])

  /** 添加标签 */
  function addTag(data: Omit<Tag, 'id'>) {
    // 检查重名
    if (tags.value.some(t => t.name === data.name)) return null
    const tag: Tag = { ...data, id: generateId() }
    tags.value.push(tag)
    return tag
  }

  /** 更新标签 */
  function updateTag(id: string, data: Partial<Tag>) {
    const tag = tags.value.find(t => t.id === id)
    if (!tag) return
    Object.assign(tag, data)
  }

  /** 删除标签 */
  function deleteTag(id: string) {
    tags.value = tags.value.filter(t => t.id !== id)
  }

  /** 根据ID获取标签 */
  function getTag(id: string) {
    return tags.value.find(t => t.id === id)
  }

  /** 导出 */
  function exportAll() {
    return JSON.stringify(tags.value, null, 2)
  }

  /** 导入 */
  function importData(json: string) {
    try {
      const data = JSON.parse(json) as Tag[]
      if (Array.isArray(data)) {
        tags.value = data
        return true
      }
      return false
    } catch {
      return false
    }
  }

  /** 清除 */
  function clearAll() {
    tags.value = []
  }

  return {
    tags,
    addTag,
    updateTag,
    deleteTag,
    getTag,
    exportAll,
    importData,
    clearAll,
  }
}, {
  persist: {
    key: 'time-computer:tag',
  },
})
