<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { formatDuration } from '@/utils/time'
import { useCalcRecordStore } from '@/stores/calcRecord'

const calcStore = useCalcRecordStore()

const startTime = ref('')
const endTime = ref('')
const result = ref('')

function calculate() {
  if (!startTime.value || !endTime.value) return
  const start = dayjs(startTime.value)
  const end = dayjs(endTime.value)
  const diff = end.diff(start)
  const absDiff = Math.abs(diff)
  const prefix = diff < 0 ? '-' : ''

  result.value = prefix + formatDuration(absDiff)

  calcStore.addRecord({
    type: 'time_diff',
    input: { start: startTime.value, end: endTime.value },
    result: { diff: absDiff, text: result.value },
  })
}

function reset() {
  startTime.value = ''
  endTime.value = ''
  result.value = ''
}
</script>

<template>
  <div class="calc-card">
    <h3 class="calc-card__title">时间差计算</h3>
    <p class="calc-card__desc">计算两个时间点之间的时长</p>
    <el-form label-width="80px" class="calc-card__form">
      <el-form-item label="开始时间">
        <el-date-picker v-model="startTime" type="datetime" placeholder="选择开始时间" style="width:100%" />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-date-picker v-model="endTime" type="datetime" placeholder="选择结束时间" style="width:100%" />
      </el-form-item>
    </el-form>
    <div class="calc-card__actions">
      <el-button type="primary" @click="calculate" :disabled="!startTime || !endTime">计算</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div v-if="result" class="calc-card__result">
      <span class="calc-card__result-label">时长：</span>
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
