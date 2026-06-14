<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCategoryStore } from '@/stores/category'
import { useTagStore } from '@/stores/tag'
import { useTimeEntryStore } from '@/stores/timeEntry'
import { useCalcRecordStore } from '@/stores/calcRecord'
import { useSettingsStore } from '@/stores/settings'
import type { Category, Tag } from '@/types'

const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const timeEntryStore = useTimeEntryStore()
const calcRecordStore = useCalcRecordStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  categoryStore.initDefaults()
})

// ========== 分类管理 ==========
const categoryDialogVisible = ref(false)
const isEditCategory = ref(false)
const categoryForm = ref({ id: '', name: '', color: '#409EFF', icon: '', sort: 0 })

const presetColors = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
  '#2B6CB0', '#38A169', '#DD6B20', '#E53E3E', '#805AD5',
  '#3182CE', '#48BB78', '#ED8936', '#FC8181', '#9F7AEA',
]

function openAddCategory() {
  isEditCategory.value = false
  categoryForm.value = {
    id: '',
    name: '',
    color: '#409EFF',
    icon: '',
    sort: categoryStore.categories.length,
  }
  categoryDialogVisible.value = true
}

function openEditCategory(cat: Category) {
  isEditCategory.value = true
  categoryForm.value = { id: cat.id, name: cat.name, color: cat.color, icon: cat.icon || '', sort: cat.sort }
  categoryDialogVisible.value = true
}

function saveCategory() {
  if (!categoryForm.value.name) return
  if (isEditCategory.value) {
    categoryStore.updateCategory(categoryForm.value.id, {
      name: categoryForm.value.name,
      color: categoryForm.value.color,
      icon: categoryForm.value.icon || undefined,
      sort: categoryForm.value.sort,
    })
  } else {
    categoryStore.addCategory({
      name: categoryForm.value.name,
      color: categoryForm.value.color,
      icon: categoryForm.value.icon || undefined,
      sort: categoryForm.value.sort,
    })
  }
  categoryDialogVisible.value = false
  ElMessage.success('保存成功')
}

function deleteCategory(id: string) {
  ElMessageBox.confirm('删除分类后，已关联的记录不会被删除，但会变为"未分类"。确定删除？', '确认删除', {
    type: 'warning',
  }).then(() => {
    categoryStore.deleteCategory(id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ========== 标签管理 ==========
const tagDialogVisible = ref(false)
const isEditTag = ref(false)
const tagForm = ref({ id: '', name: '', color: '#909399' })

function openAddTag() {
  isEditTag.value = false
  tagForm.value = { id: '', name: '', color: '#909399' }
  tagDialogVisible.value = true
}

function openEditTag(tag: Tag) {
  isEditTag.value = true
  tagForm.value = { id: tag.id, name: tag.name, color: tag.color }
  tagDialogVisible.value = true
}

function saveTag() {
  if (!tagForm.value.name) return
  if (isEditTag.value) {
    tagStore.updateTag(tagForm.value.id, { name: tagForm.value.name, color: tagForm.value.color })
  } else {
    const result = tagStore.addTag({ name: tagForm.value.name, color: tagForm.value.color })
    if (!result) {
      ElMessage.warning('标签名称已存在')
      return
    }
  }
  tagDialogVisible.value = false
  ElMessage.success('保存成功')
}

function deleteTag(id: string) {
  tagStore.deleteTag(id)
  ElMessage.success('已删除')
}

// ========== 数据备份/恢复/清除 ==========
function backupData() {
  const data = {
    timeEntries: timeEntryStore.entries,
    categories: categoryStore.categories,
    tags: tagStore.tags,
    calcRecords: calcRecordStore.records,
    settings: settingsStore.settings,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  }
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `time-computer-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  settingsStore.setLastBackupAt()
  ElMessage.success('备份文件已下载')
}

const restoreFileRef = ref<HTMLInputElement | null>(null)

function triggerRestore() {
  restoreFileRef.value?.click()
}

function handleRestoreFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      if (data.timeEntries) timeEntryStore.importData(JSON.stringify(data.timeEntries))
      if (data.categories) categoryStore.importData(JSON.stringify(data.categories))
      if (data.tags) tagStore.importData(JSON.stringify(data.tags))
      if (data.calcRecords) calcRecordStore.importData(JSON.stringify(data.calcRecords))
      if (data.settings) settingsStore.updateSettings(data.settings)
      ElMessage.success('数据恢复成功')
    } catch {
      ElMessage.error('文件格式错误，恢复失败')
    }
  }
  reader.readAsText(file)
  // 重置input，允许重复选择同一文件
  ;(event.target as HTMLInputElement).value = ''
}

function clearAllData() {
  ElMessageBox.confirm('此操作将清除所有数据（时间记录、分类、标签、计算历史），且不可恢复！确定继续？', '危险操作', {
    type: 'error',
    confirmButtonText: '确认清除',
    cancelButtonText: '取消',
  }).then(() => {
    timeEntryStore.clearAll()
    categoryStore.clearAll()
    tagStore.clearAll()
    calcRecordStore.clearAll()
    ElMessage.success('所有数据已清除')
  }).catch(() => {})
}
</script>

<template>
  <div class="settings-page">
    <!-- 分类管理 -->
    <el-card class="settings-card">
      <template #header>
        <div class="settings-card__header">
          <span>分类管理</span>
          <el-button type="primary" size="small" @click="openAddCategory">
            <el-icon><Plus /></el-icon> 新增分类
          </el-button>
        </div>
      </template>
      <div class="category-list">
        <div v-for="cat in categoryStore.categories" :key="cat.id" class="category-item">
          <span class="category-item__color" :style="{ background: cat.color }"></span>
          <span class="category-item__name">{{ cat.name }}</span>
          <el-tag v-if="cat.isDefault" size="small" type="info">预设</el-tag>
          <div class="category-item__actions">
            <el-button link type="primary" size="small" @click="openEditCategory(cat)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteCategory(cat.id)">删除</el-button>
          </div>
        </div>
        <div v-if="categoryStore.categories.length === 0" style="color:var(--color-text-secondary);font-size:13px;">
          暂无分类，点击上方按钮添加
        </div>
      </div>
    </el-card>

    <!-- 标签管理 -->
    <el-card class="settings-card">
      <template #header>
        <div class="settings-card__header">
          <span>标签管理</span>
          <el-button type="primary" size="small" @click="openAddTag">
            <el-icon><Plus /></el-icon> 新增标签
          </el-button>
        </div>
      </template>
      <div class="tag-list">
        <el-tag
          v-for="tag in tagStore.tags"
          :key="tag.id"
          closable
          :color="tag.color"
          effect="dark"
          style="border:none;margin:4px;"
          @click="openEditTag(tag)"
          @close="deleteTag(tag.id)"
        >
          {{ tag.name }}
        </el-tag>
        <div v-if="tagStore.tags.length === 0" style="color:var(--color-text-secondary);font-size:13px;">
          暂无标签，点击上方按钮添加
        </div>
      </div>
    </el-card>

    <!-- 数据管理 -->
    <el-card class="settings-card">
      <template #header>
        <span>数据管理</span>
      </template>
      <div class="data-actions">
        <div class="data-action-item">
          <div>
            <div style="font-weight:500;">数据备份</div>
            <div style="font-size:12px;color:var(--color-text-secondary);">
              将所有数据导出为JSON文件
              <span v-if="settingsStore.settings.lastBackupAt" style="margin-left:8px;">
                上次备份：{{ new Date(settingsStore.settings.lastBackupAt).toLocaleString() }}
              </span>
            </div>
          </div>
          <el-button @click="backupData">
            <el-icon><Download /></el-icon> 备份
          </el-button>
        </div>
        <div class="data-action-item">
          <div>
            <div style="font-weight:500;">数据恢复</div>
            <div style="font-size:12px;color:var(--color-text-secondary);">从备份JSON文件恢复数据</div>
          </div>
          <el-button @click="triggerRestore">
            <el-icon><Upload /></el-icon> 恢复
          </el-button>
          <input ref="restoreFileRef" type="file" accept=".json" style="display:none;" @change="handleRestoreFile" />
        </div>
        <div class="data-action-item">
          <div>
            <div style="font-weight:500;color:#E53E3E;">清除数据</div>
            <div style="font-size:12px;color:var(--color-text-secondary);">清除所有本地数据，此操作不可恢复</div>
          </div>
          <el-button type="danger" @click="clearAllData">
            <el-icon><Delete /></el-icon> 清除
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 分类编辑对话框 -->
    <el-dialog v-model="categoryDialogVisible" :title="isEditCategory ? '编辑分类' : '新增分类'" width="400px">
      <el-form label-width="60px">
        <el-form-item label="名称" required>
          <el-input v-model="categoryForm.name" placeholder="分类名称" />
        </el-form-item>
        <el-form-item label="颜色">
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            <div
              v-for="color in presetColors" :key="color"
              class="color-dot"
              :class="{ active: categoryForm.color === color }"
              :style="{ background: color }"
              @click="categoryForm.color = color"
            ></div>
          </div>
          <el-input v-model="categoryForm.color" placeholder="#409EFF" style="margin-top:8px;width:160px;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory" :disabled="!categoryForm.name">保存</el-button>
      </template>
    </el-dialog>

    <!-- 标签编辑对话框 -->
    <el-dialog v-model="tagDialogVisible" :title="isEditTag ? '编辑标签' : '新增标签'" width="400px">
      <el-form label-width="60px">
        <el-form-item label="名称" required>
          <el-input v-model="tagForm.name" placeholder="标签名称" />
        </el-form-item>
        <el-form-item label="颜色">
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            <div
              v-for="color in presetColors" :key="color"
              class="color-dot"
              :class="{ active: tagForm.color === color }"
              :style="{ background: color }"
              @click="tagForm.color = color"
            ></div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTag" :disabled="!tagForm.name">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 720px;
}
.settings-card {
  margin-bottom: 20px;
}
.settings-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--color-bg);
}
.category-item__color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}
.category-item__name {
  flex: 1;
  font-weight: 500;
}
.category-item__actions {
  display: flex;
  gap: 4px;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.data-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.data-action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--color-bg);
}
.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.color-dot.active {
  border-color: var(--color-text);
}
</style>
