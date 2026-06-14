// 时间记录
export interface TimeEntry {
  id: string
  title: string
  description: string
  startTime: number      // 时间戳(ms)
  endTime: number | null // null=进行中
  categoryId: string
  tagIds: string[]
  source: 'manual' | 'timer'
  createdAt: number
  updatedAt: number
}

// 分类
export interface Category {
  id: string
  name: string
  color: string          // 如 '#409EFF'
  icon?: string
  sort: number
  isDefault: boolean
}

// 标签
export interface Tag {
  id: string
  name: string
  color: string
}

// 计算历史
export interface CalcRecord {
  id: string
  type: 'time_diff' | 'date_diff' | 'workday' | 'time_offset' | 'unit_convert' | 'duration_calc'
  input: Record<string, unknown>
  result: Record<string, unknown>
  createdAt: number
}

// 应用设置
export interface AppSettings {
  defaultCategoryId?: string
  lastBackupAt?: number
}

// 计算类型
export type CalcType = CalcRecord['type']
