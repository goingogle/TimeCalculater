<script setup lang="ts">
import { ref } from 'vue'
import { useTimeEntryStore } from '@/stores/timeEntry'
import { useCategoryStore } from '@/stores/category'
import { useTagStore } from '@/stores/tag'

const timeEntryStore = useTimeEntryStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

const emit = defineEmits<{
  saved: []
}>()

const dialogVisible = ref(false)
const form = ref({
  title: '',
  description: '',
  startTime: '' as string | number,
  endTime: '' as string | number,
  categoryId: '',
  tagIds: [] as string[],
})

function openDialog() {
  form.value = {
    title: '',
    description: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
    categoryId: categoryStore.categories[0]?.id || '',
    tagIds: [],
  }
  dialogVisible.value = true
}

function submitForm() {
  if (!form.value.title || !form.value.startTime) return
  timeEntryStore.addEntry({
    title: form.value.title,
    description: form.value.description,
    startTime: new Date(form.value.startTime).getTime(),
    endTime: form.value.endTime ? new Date(form.value.endTime).getTime() : null,
    categoryId: form.value.categoryId,
    tagIds: form.value.tagIds,
    source: 'manual',
  })
  dialogVisible.value = false
  emit('saved')
}

defineExpose({ openDialog })
</script>

<template>
  <el-dialog v-model="dialogVisible" title="手动添加记录" width="500px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="任务名称" required>
        <el-input v-model="form.title" placeholder="输入任务名称" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="可选" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="form.categoryId" style="width:100%">
          <el-option v-for="cat in categoryStore.categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="标签">
        <el-select v-model="form.tagIds" multiple style="width:100%" placeholder="可选">
          <el-option v-for="tag in tagStore.tags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" required>
        <el-date-picker v-model="form.startTime" type="datetime" style="width:100%" />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-date-picker v-model="form.endTime" type="datetime" style="width:100%" placeholder="留空表示进行中" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :disabled="!form.title">保存</el-button>
    </template>
  </el-dialog>
</template>
