<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TimeEntry } from '@/types'
import { useTimeEntryStore } from '@/stores/timeEntry'
import { useCategoryStore } from '@/stores/category'
import { useTagStore } from '@/stores/tag'
import { formatDateTime, formatDurationShort } from '@/utils/time'

const timeEntryStore = useTimeEntryStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

const filterDateRange = ref<[Date, Date] | null>(null)
const filterCategory = ref('')
const searchText = ref('')

/** 筛选后的记录 */
const filteredEntries = computed(() => {
  let list = timeEntryStore.entries

  // 日期范围筛选
  if (filterDateRange.value) {
    const [start, end] = filterDateRange.value
    list = list.filter(e => {
      const entryDate = new Date(e.startTime)
      return entryDate >= start && entryDate <= end
    })
  }

  // 分类筛选
  if (filterCategory.value) {
    list = list.filter(e => e.categoryId === filterCategory.value)
  }

  // 关键词搜索
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    list = list.filter(e =>
      e.title.toLowerCase().includes(kw) ||
      e.description.toLowerCase().includes(kw)
    )
  }

  return list
})

/** 获取分类名 */
function getCategoryName(categoryId: string) {
  return categoryStore.getCategory(categoryId)?.name || '未分类'
}

/** 获取分类颜色 */
function getCategoryColor(categoryId: string) {
  return categoryStore.getCategory(categoryId)?.color || '#909399'
}

/** 获取标签名 */
function getTagNames(tagIds: string[]) {
  return tagIds.map(id => tagStore.getTag(id)?.name || '').filter(Boolean)
}

/** 计算时长 */
function getDuration(entry: TimeEntry) {
  const end = entry.endTime || Date.now()
  return formatDurationShort(end - entry.startTime)
}

/** 删除确认 */
function handleDelete(id: string) {
  timeEntryStore.deleteEntry(id)
}

/** 编辑对话框 */
const editDialogVisible = ref(false)
const editingEntry = ref<TimeEntry | null>(null)

function openEdit(entry: TimeEntry) {
  editingEntry.value = { ...entry }
  editDialogVisible.value = true
}

function saveEdit() {
  if (!editingEntry.value) return
  timeEntryStore.updateEntry(editingEntry.value.id, editingEntry.value)
  editDialogVisible.value = false
}
</script>

<template>
  <div class="entry-table">
    <!-- 筛选栏 -->
    <div class="entry-table__filters">
      <el-input v-model="searchText" placeholder="搜索任务..." clearable style="width:200px" />
      <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width:140px">
        <el-option
          v-for="cat in categoryStore.categories"
          :key="cat.id" :label="cat.name" :value="cat.id"
        />
      </el-select>
      <el-date-picker
        v-model="filterDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width:260px"
      />
    </div>

    <!-- 记录表格 -->
    <el-table :data="filteredEntries" stripe empty-text="暂无记录" style="width:100%">
      <el-table-column label="任务" min-width="160">
        <template #default="{ row }">
          <div>
            <div style="font-weight:500;">{{ row.title }}</div>
            <div v-if="row.description" style="font-size:12px;color:var(--color-text-secondary);margin-top:2px;">
              {{ row.description }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="100">
        <template #default="{ row }">
          <el-tag size="small" :color="getCategoryColor(row.categoryId)" effect="dark" style="border:none;">
            {{ getCategoryName(row.categoryId) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="120">
        <template #default="{ row }">
          <el-tag v-for="name in getTagNames(row.tagIds)" :key="name" size="small" type="info" style="margin:2px;">
            {{ name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="170">
        <template #default="{ row }">
          <span class="tabular-nums" style="font-size:13px;">{{ formatDateTime(row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时长" width="100">
        <template #default="{ row }">
          <span class="tabular-nums" style="font-weight:600;">
            {{ row.endTime ? getDuration(row) : '进行中...' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="来源" width="80">
        <template #default="{ row }">
          <el-tag size="small" :type="row.source === 'timer' ? 'primary' : 'info'">
            {{ row.source === 'timer' ? '计时' : '手动' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除此记录？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑记录" width="500px">
      <el-form v-if="editingEntry" label-width="80px">
        <el-form-item label="任务名称">
          <el-input v-model="editingEntry.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editingEntry.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editingEntry.categoryId" style="width:100%">
            <el-option v-for="cat in categoryStore.categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="editingEntry.startTime" type="datetime" style="width:100%" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="editingEntry.endTime" type="datetime" style="width:100%" placeholder="进行中则留空" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.entry-table__filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
</style>
