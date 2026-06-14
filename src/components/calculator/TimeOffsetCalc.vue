<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useCalcRecordStore } from '@/stores/calcRecord'

const calcStore = useCalcRecordStore()

const baseTime = ref('')
const direction = ref<'add' | 'sub'>('add')
const offsetHours = ref(0)
const offsetMinutes = ref(0)
const offsetSeconds = ref(0)
const result = ref('')

const offsetMs = computed(() => {
  return (offsetHours.value * 3600 + offsetMinutes.value * 60 + offsetSeconds.value) * 1000
})

function calculate() {
  if (!baseTime.value) return
  const base = dayjs(baseTime.value)
  const ms = direction.value === 'add' ? offsetMs.value : -offsetMs.value
  const target = base.add(ms, 'millisecond')
  result.value = target.format('YYYY-MM-DD HH:mm:ss')

  calcStore.addRecord({
    type: 'time_offset',
    input: {
      base: base.format('YYYY-MM-DD HH:mm:ss'),
      offsetMs: ms,
    },
    result: { result: result.value },
  })
}

function reset() {
  baseTime.value = ''
  direction.value = 'add'
  offsetHours.value = 0
  offsetMinutes.value = 0
  offsetSeconds.value = 0
  result.value = ''
}
</script>

<template>
  <div class="calc-card">
    <h3 class="calc-card__title">时间推算</h3>
    <p class="calc-card__desc">从指定时间加减时长，推算目标时间</p>
    <el-form label-width="80px" class="calc-card__form">
      <el-form-item label="基准时间">
        <el-date-picker v-model="baseTime" type="datetime" placeholder="选择基准时间" style="width:100%" />
      </el-form-item>
      <el-form-item label="方向">
        <el-radio-group v-model="direction">
          <el-radio value="add">往后推</el-radio>
          <el-radio value="sub">往前推</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="偏移时长">
        <div style="display:flex;gap:8px;align-items:center;">
          <el-input-number v-model="offsetHours" :min="0" :max="9999" controls-position="right" style="width:120px" />
          <span>时</span>
          <el-input-number v-model="offsetMinutes" :min="0" :max="59" controls-position="right" style="width:100px" />
          <span>分</span>
          <el-input-number v-model="offsetSeconds" :min="0" :max="59" controls-position="right" style="width:100px" />
          <span>秒</span>
        </div>
      </el-form-item>
    </el-form>
    <div class="calc-card__actions">
      <el-button type="primary" @click="calculate" :disabled="!baseTime">计算</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div v-if="result" class="calc-card__result">
      <span class="calc-card__result-label">目标时间：</span>
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
  background: #FFFAF0;
  border-radius: 8px;
  border: 1px solid #FEEBC8;
}
.calc-card__result-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}
.calc-card__result-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-warning);
}
</style>
