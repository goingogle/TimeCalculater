<script setup lang="ts">
import { ref, computed } from 'vue'
import TimeDiffCalc from '@/components/calculator/TimeDiffCalc.vue'
import DateDiffCalc from '@/components/calculator/DateDiffCalc.vue'
import WorkdayCalc from '@/components/calculator/WorkdayCalc.vue'
import TimeOffsetCalc from '@/components/calculator/TimeOffsetCalc.vue'
import UnitConvertCalc from '@/components/calculator/UnitConvertCalc.vue'
import DurationCalc from '@/components/calculator/DurationCalc.vue'
import { useCalcRecordStore } from '@/stores/calcRecord'
import { buildCalcResultLabel, formatDateTime } from '@/utils/time'

const calcStore = useCalcRecordStore()

const activeTab = ref('duration_calc')

const tabs = [
  { key: 'duration_calc', label: '工时计算', icon: 'Clock' },
  { key: 'time_diff', label: '时间差', icon: 'Stopwatch' },
  { key: 'date_diff', label: '日期差', icon: 'Calendar' },
  { key: 'workday', label: '工作日', icon: 'Briefcase' },
  { key: 'time_offset', label: '时间推算', icon: 'Right' },
  { key: 'unit_convert', label: '单位换算', icon: 'Switch' },
]

const currentComponent = computed(() => {
  switch (activeTab.value) {
    case 'duration_calc': return DurationCalc
    case 'time_diff': return TimeDiffCalc
    case 'date_diff': return DateDiffCalc
    case 'workday': return WorkdayCalc
    case 'time_offset': return TimeOffsetCalc
    case 'unit_convert': return UnitConvertCalc
    default: return TimeDiffCalc
  }
})

function getCalcTypeLabel(type: string) {
  const map: Record<string, string> = {
    duration_calc: '工时计算',
    time_diff: '时间差',
    date_diff: '日期差',
    workday: '工作日',
    time_offset: '时间推算',
    unit_convert: '单位换算',
  }
  return map[type] || type
}
</script>

<template>
  <div class="calculator-page">
    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="calculator-tabs">
      <el-tab-pane v-for="tab in tabs" :key="tab.key" :label="tab.label" :name="tab.key" />
    </el-tabs>

    <!-- 当前计算组件 -->
    <div class="calculator-content">
      <component :is="currentComponent" :key="activeTab" />
    </div>

    <!-- 计算历史 -->
    <div class="calc-history" v-if="calcStore.records.length > 0">
      <div class="calc-history__header">
        <h3>计算历史</h3>
        <el-button type="danger" link size="small" @click="calcStore.clearAll()">清空</el-button>
      </div>
      <el-table :data="calcStore.records.slice(0, 20)" size="small" stripe>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ getCalcTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="计算结果">
          <template #default="{ row }">
            <span class="tabular-nums">{{ buildCalcResultLabel(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="170">
          <template #default="{ row }">
            <span style="color:var(--color-text-secondary);font-size:12px;">{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.calculator-page {
  max-width: 720px;
}
.calculator-tabs {
  margin-bottom: 20px;
}
.calculator-content {
  margin-bottom: 24px;
}
.calc-history__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.calc-history__header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
</style>
