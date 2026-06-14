<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { workdayDiff } from '@/utils/time'
import { useCalcRecordStore } from '@/stores/calcRecord'

const calcStore = useCalcRecordStore()

const startDate = ref('')
const endDate = ref('')
const result = ref('')

function calculate() {
  if (!startDate.value || !endDate.value) return
  const start = dayjs(startDate.value).format('YYYY-MM-DD')
  const end = dayjs(endDate.value).format('YYYY-MM-DD')
  const workdays = workdayDiff(start, end)
  const totalDays = dayjs(end).diff(dayjs(start), 'day') + 1
  const weekends = totalDays - workdays

  result.value = `${workdays} 个工作日（总${totalDays}天，周末${weekends}天）`

  calcStore.addRecord({
    type: 'workday',
    input: { start, end },
    result: { workdays, totalDays, weekends, text: result.value },
  })
}

function reset() {
  startDate.value = ''
  endDate.value = ''
  result.value = ''
}
</script>

<template>
  <div class="calc-card">
    <h3 class="calc-card__title">工作日计算</h3>
    <p class="calc-card__desc">计算两个日期之间的工作日天数（排除周末）</p>
    <el-form label-width="80px" class="calc-card__form">
      <el-form-item label="开始日期">
        <el-date-picker v-model="startDate" type="date" placeholder="选择开始日期" style="width:100%" />
      </el-form-item>
      <el-form-item label="结束日期">
        <el-date-picker v-model="endDate" type="date" placeholder="选择结束日期" style="width:100%" />
      </el-form-item>
    </el-form>
    <div class="calc-card__actions">
      <el-button type="primary" @click="calculate" :disabled="!startDate || !endDate">计算</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div v-if="result" class="calc-card__result">
      <span class="calc-card__result-label">工作日：</span>
      <span class="calc-card__result-value tabular-nums">{{ result }}</span>
    </div>
  </div>
</template>

<style scoped>
.calc-card__title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}
.calc-card__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}
.calc-card__form {
  margin-bottom: 12px;
}
.calc-card__actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.calc-card__result {
  padding: 12px 16px;
  background: #F0FFF4;
  border-radius: 8px;
  border: 1px solid #C6F6D5;
}
.calc-card__result-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}
.calc-card__result-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-success);
}
</style>
