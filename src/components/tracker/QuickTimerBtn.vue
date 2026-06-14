<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTimeEntryStore } from '@/stores/timeEntry'
import { useCategoryStore } from '@/stores/category'
import { usePreciseTimer } from '@/composables/usePreciseTimer'
import { formatDurationShort } from '@/utils/time'

const timeEntryStore = useTimeEntryStore()
const categoryStore = useCategoryStore()

const timer = usePreciseTimer()
const isTimerRunning = ref(false)
const timerTitle = ref('')
const timerCategoryId = ref('')

/** 开始计时 */
function startTimer() {
  if (!timerCategoryId.value) {
    // 默认选择第一个分类
    if (categoryStore.categories.length > 0) {
      timerCategoryId.value = categoryStore.categories[0].id
    } else return
  }
  isTimerRunning.value = true
  timer.start()
  timeEntryStore.startTimer(timerTitle.value || '未命名任务', timerCategoryId.value)
}

/** 停止计时 */
function stopTimer() {
  timer.stop()
  isTimerRunning.value = false
  timeEntryStore.stopTimer()
  timerTitle.value = ''
}

/** 显示已过时间 */
const displayElapsed = computed(() => {
  if (!isTimerRunning.value) return '00:00:00'
  return formatDurationShort(timer.elapsed.value)
})

const currentCategory = computed(() => {
  if (!timerCategoryId.value) return null
  return categoryStore.getCategory(timerCategoryId.value)
})
</script>

<template>
  <div class="quick-timer">
    <!-- 计时中状态 -->
    <div v-if="isTimerRunning" class="quick-timer__running">
      <div class="quick-timer__display tabular-nums">{{ displayElapsed }}</div>
      <div class="quick-timer__info">
        <el-tag v-if="currentCategory" :color="currentCategory.color" effect="dark" size="small" style="border:none;">
          {{ currentCategory.name }}
        </el-tag>
        <span v-if="timeEntryStore.activeEntry?.title" class="quick-timer__task-name">
          {{ timeEntryStore.activeEntry.title }}
        </span>
      </div>
      <el-button type="danger" @click="stopTimer" size="large" round>
        <el-icon><VideoPause /></el-icon> 停止计时
      </el-button>
    </div>

    <!-- 未计时状态 -->
    <div v-else class="quick-timer__idle">
      <el-form :inline="true" class="quick-timer__form">
        <el-form-item label="任务名称">
          <el-input v-model="timerTitle" placeholder="可选，如：编写文档" style="width:200px" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="timerCategoryId" placeholder="选择分类" style="width:140px">
            <el-option
              v-for="cat in categoryStore.categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            >
              <span style="display:flex;align-items:center;gap:6px;">
                <span :style="{background:cat.color,width:'12px',height:'12px',borderRadius:'2px',display:'inline-block'}"></span>
                {{ cat.name }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="startTimer" size="large" round>
            <el-icon><VideoPlay /></el-icon> 开始计时
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.quick-timer {
  padding: 20px;
  background: var(--color-bg-card);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  margin-bottom: 20px;
}
.quick-timer__running {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.quick-timer__display {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 2px;
}
.quick-timer__info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.quick-timer__task-name {
  font-size: 14px;
  color: var(--color-text-secondary);
}
.quick-timer__idle {
  display: flex;
  justify-content: center;
}
.quick-timer__form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
}
</style>
