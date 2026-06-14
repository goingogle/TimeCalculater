import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Category } from '@/types'
import { generateId } from '@/utils/time'

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: '工作', color: '#409EFF', icon: 'Briefcase', sort: 0, isDefault: true },
  { name: '学习', color: '#67C23A', icon: 'Reading', sort: 1, isDefault: true },
  { name: '会议', color: '#E6A23C', icon: 'ChatDotRound', sort: 2, isDefault: true },
  { name: '其他', color: '#909399', icon: 'More', sort: 3, isDefault: true },
]

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])

  /** 初始化默认分类 */
  function initDefaults() {
    if (categories.value.length > 0) return
    categories.value = DEFAULT_CATEGORIES.map(c => ({
      ...c,
      id: generateId(),
    }))
  }

  /** 添加分类 */
  function addCategory(data: Omit<Category, 'id' | 'isDefault'>) {
    categories.value.push({
      ...data,
      id: generateId(),
      isDefault: false,
    })
  }

  /** 更新分类 */
  function updateCategory(id: string, data: Partial<Category>) {
    const cat = categories.value.find(c => c.id === id)
    if (!cat) return
    Object.assign(cat, data)
  }

  /** 删除分类 */
  function deleteCategory(id: string) {
    categories.value = categories.value.filter(c => c.id !== id)
  }

  /** 根据ID获取分类 */
  function getCategory(id: string) {
    return categories.value.find(c => c.id === id)
  }

  /** 导出 */
  function exportAll() {
    return JSON.stringify(categories.value, null, 2)
  }

  /** 导入 */
  function importData(json: string) {
    try {
      const data = JSON.parse(json) as Category[]
      if (Array.isArray(data)) {
        categories.value = data
        return true
      }
      return false
    } catch {
      return false
    }
  }

  /** 清除 */
  function clearAll() {
    categories.value = []
  }

  return {
    categories,
    initDefaults,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    exportAll,
    importData,
    clearAll,
  }
}, {
  persist: {
    key: 'time-computer:category',
  },
})
