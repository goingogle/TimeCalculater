<script setup lang="ts">
import { ref } from 'vue'
import { convertTimeUnit } from '@/utils/time'
import { useCalcRecordStore } from '@/stores/calcRecord'

const calcStore = useCalcRecordStore()

const units = [
  { label: '毫秒(ms)', value: 'ms' },
  { label: '秒(s)', value: 's' },
  { label: '分钟(min)', value: 'min' },
  { label: '小时(h)', value: 'h' },
  { label: '天(d)', value: 'd' },
  { label: '周(w)', value: 'w' },
]

const inputValue = ref(1)
const fromUnit = ref('h')
const toUnit = ref('min')
const result = ref('')

function calculate() {
  if (!inputValue.value) return
  const converted = convertTimeUnit(inputValue.value, fromUnit.value, toUnit.value)
  const fromLabel = units.find(u => u.value === fromUnit.value)?.label
  const toLabel = units.find(u => u.value === toUnit.value)?.label
  result.value = `${inputValue.value} ${fromLabel} = ${Number(converted.toFixed(6))} ${toLabel}`

  calcStore.addRecord({
    type: 'unit_convert',
    input: { value: inputValue.value, from: fromUnit.value, to: toUnit.value },
    result: { converted, text: result.value },
  })
}

function reset() {
  inputValue.value = 1
  fromUnit.value = 'h'
  toUnit.value = 'min'
  result.value = ''
}
</script>

<template>
  <div class="calc-card">
    <h3 class="calc-card__title">时间单位换算</h3>
    <p class="calc-card__desc">毫秒/秒/分钟/小时/天/周 互转</p>
    <el-form label-width="80px" class="calc-card__form">
      <el-form-item label="数值">
        <el-input-number v-model="inputValue" :min="0" :precision="6" controls-position="right" style="width:100%" />
      </el-form-item>
      <el-form-item label="从">
        <el-select v-model="fromUnit" style="width:100%">
          <el-option v-for="u in units" :key="u.value" :label="u.label" :value="u.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="转换为">
        <el-select v-model="toUnit" style="width:100%">
          <el-option v-for="u in units" :key="u.value" :label="u.label" :value="u.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="calc-card__actions">
      <el-button type="primary" @click="calculate">换算</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div v-if="result" class="calc-card__result">
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
  background: #FAF5FF;
  border-radius: 8px;
  border: 1px solid #E9D8FD;
}
.calc-card__result-value {
  font-size: 18px;
  font-weight: 700;
  color: #805AD5;
}
</style>
