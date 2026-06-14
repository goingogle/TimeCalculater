<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { useCalcRecordStore } from '@/stores/calcRecord'

const calcStore = useCalcRecordStore()

const startDate = ref('')
const endDate = ref('')
const result = ref('')

function calculate() {
  if (!startDate.value || !endDate.value) return
  const start = dayjs(startDate.value)
  const end = dayjs(endDate.value)
  const diff = end.diff(start)
  const absDiff = Math.abs(diff)
  const prefix = diff < 0 ? '-' : ''

  const d = dayjs.duration(absDiff)
  const years = Math.floor(d.asYears())
  const months = Math.floor(d.asMonths())
  const weeks = Math.floor(d.asWeeks())
  const days = Math.floor(d.asDays())

  const parts: string[] = []
  if (years > 0) parts.push(`${years}年`)
  if (d.months() > 0) parts.push(`${d.months()}个月`)
  if (d.days() > 0) parts.push(`${d.days()}天`)
  if (parts.length === 0) parts.push('0天')

  result.value = prefix + parts.join('') + `（共${days}天 / ${weeks}周）`

  calcStore.addRecord({
    type: 'date_diff',
    input: { start: startDate.value, end: endDate.value },
    result: { days, weeks, months, years, text: result.value },
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
    <h3 class="calc-card__title">日期差计算</h3>
    <p class="calc-card__desc">计算两个日期之间的天数、周数、月数、年数</p>
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
      <span class="calc-card__result-label">差值：</span>
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
  background: #EBF8FF;
  border-radius: 8px;
  border: 1px solid #BEE3F8;
}
.calc-card__result-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}
.calc-card__result-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
