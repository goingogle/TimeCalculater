<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QuickTimerBtn from '@/components/tracker/QuickTimerBtn.vue'
import EntryTable from '@/components/tracker/EntryTable.vue'
import EntryForm from '@/components/tracker/EntryForm.vue'
import { useCategoryStore } from '@/stores/category'

const categoryStore = useCategoryStore()
const entryFormRef = ref<InstanceType<typeof EntryForm> | null>(null)

onMounted(() => {
  categoryStore.initDefaults()
})
</script>

<template>
  <div class="tracker-page">
    <!-- 快速计时 -->
    <QuickTimerBtn />

    <!-- 操作栏 -->
    <div class="tracker-page__actions">
      <el-button type="primary" @click="entryFormRef?.openDialog()">
        <el-icon><Plus /></el-icon> 手动添加记录
      </el-button>
    </div>

    <!-- 记录列表 -->
    <EntryTable />

    <!-- 手动添加对话框 -->
    <EntryForm ref="entryFormRef" />
  </div>
</template>

<style scoped>
.tracker-page__actions {
  margin-bottom: 16px;
}
</style>
