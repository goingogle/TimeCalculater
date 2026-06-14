<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useCalcRecordStore } from '@/stores/calcRecord'

const calcStore = useCalcRecordStore()

// ===== 计算器状态 =====
interface ExprItem {
  value: number  // 总秒数
  display: string  // 显示文本
  operator: '+' | '-' | null
}

// ===== 历史记录 =====
interface HistoryEntry {
  expression: string
  resultDisplay: string
  resultReadable: string
  resultSeconds: number
}

const items = ref<ExprItem[]>([])
const rawDigits = ref('')
const result = ref<string>('')
const hasResult = ref(false)
const history = ref<HistoryEntry[]>([])
const historyContainer = ref<HTMLElement | null>(null)
const validationMsg = ref('')  // 验证提示信息
let validationTimer: ReturnType<typeof setTimeout> | null = null

// ===== 时间格式化 =====

function formatSeconds(totalSecs: number): string {
  const negative = totalSecs < 0
  let abs = Math.abs(totalSecs)
  const h = Math.floor(abs / 3600)
  abs %= 3600
  const m = Math.floor(abs / 60)
  const s = abs % 60

  let text = ''
  if (h > 0) text += `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  else if (m > 0) text += `${m}:${String(s).padStart(2, '0')}`
  else text = `${s}`
  return negative ? `-${text}` : text
}

function formatSecondsReadable(totalSecs: number): string {
  const negative = totalSecs < 0
  let abs = Math.abs(totalSecs)
  const h = Math.floor(abs / 3600)
  abs %= 3600
  const m = Math.floor(abs / 60)
  const s = abs % 60

  let text = ''
  if (h > 0) text += `${h}小时`
  if (m > 0) text += `${m}分钟`
  if (s > 0) text += `${s}秒`
  if (!text) text = '0秒'
  return negative ? `-${text}` : text
}

// ===== 自动解析数字为时间 =====

function parseDigitsToSeconds(digits: string): number {
  const d = digits.replace(/^0+/, '') || '0'
  const len = d.length

  if (len <= 2) {
    return parseInt(d) * 3600
  } else if (len <= 4) {
    const mm = d.slice(-2)
    const hh = d.slice(0, -2)
    return parseInt(hh) * 3600 + parseInt(mm) * 60
  } else {
    const ss = d.slice(-2)
    const mm = d.slice(-4, -2)
    const hh = d.slice(0, -4)
    return parseInt(hh) * 3600 + parseInt(mm) * 60 + parseInt(ss)
  }
}

function formatDigitsAsTime(digits: string): string {
  if (!digits) return '0:00'
  const len = digits.length

  if (len <= 2) {
    return digits
  } else if (len <= 4) {
    const mm = digits.slice(-2)
    const hh = digits.slice(0, -2)
    return `${hh}:${mm}`
  } else {
    const ss = digits.slice(-2)
    const mm = digits.slice(-4, -2)
    const hh = digits.slice(0, -4)
    return `${hh}:${mm}:${ss}`
  }
}

// ===== 输入验证 =====

/**
 * 检查在当前 rawDigits 后追加一个数字是否合法
 * 规则：
 *   - 第3位是分钟十位 → 只能 0-5
 *   - 第5位是秒十位   → 只能 0-5
 */
function canAppendDigit(digit: string): boolean {
  const newLen = rawDigits.value.length + 1
  const d = parseInt(digit)
  // 第3位（分钟十位）不能超过5
  if (newLen === 3 && d > 5) return false
  // 第5位（秒十位）不能超过5
  if (newLen === 5 && d > 5) return false
  return true
}

// "00" 十位始终为0，0 ≤ 5，永远合法，无需额外验证函数

function showValidation(msg: string) {
  if (validationTimer) clearTimeout(validationTimer)
  validationMsg.value = msg
  validationTimer = setTimeout(() => {
    validationMsg.value = ''
  }, 2000)
}

// ===== 计算显示值 =====

/** 计算 items 中的累计结果（不含当前 rawDigits 输入） */
function computeRunningTotal(): number {
  if (items.value.length === 0) return 0
  let total = 0
  for (let i = 0; i < items.value.length; i++) {
    const item = items.value[i]
    if (i === 0) {
      total = item.value
    } else {
      const prevOp = items.value[i - 1].operator
      if (prevOp === '+') total += item.value
      else if (prevOp === '-') total -= item.value
    }
  }
  return total
}

const currentDisplay = computed(() => {
  if (rawDigits.value) return formatDigitsAsTime(rawDigits.value)
  // 未在输入中但有已入列的项 → 显示当前累计结果
  if (items.value.length > 0) return formatSeconds(computeRunningTotal())
  return '0:00'
})

/** 当前是否显示中间累计结果（运算符按下后、下一个数字输入前） */
const isShowingRunningTotal = computed(() => {
  return !rawDigits.value && items.value.length > 0 && !hasResult.value
})

const expressionDisplay = computed(() => {
  let expr = ''
  for (const item of items.value) {
    expr += item.display
    if (item.operator) {
      expr += ` ${item.operator === '+' ? '+' : '−'} `
    }
  }
  if (!hasResult.value && rawDigits.value) {
    expr += currentDisplay.value
  } else if (!hasResult.value && !rawDigits.value && items.value.length === 0) {
    expr = '0:00'
  }
  return expr
})

// ===== 小键盘操作 =====

function pressDigit(d: string) {
  if (hasResult.value) {
    clearAll()
  }
  if (rawDigits.value.length >= 6) return

  // 输入验证：第3位和第5位限制
  if (!canAppendDigit(d)) {
    const pos = rawDigits.value.length + 1
    showValidation(pos === 3 ? '分钟十位不能超过5' : '秒十位不能超过5')
    return
  }

  validationMsg.value = ''
  if (rawDigits.value === '' || rawDigits.value === '0') {
    rawDigits.value = d
  } else {
    rawDigits.value += d
  }
}

function pressDoubleZero() {
  if (hasResult.value) {
    clearAll()
  }
  if (rawDigits.value.length >= 5) return

  // "00" 十位始终为0，不会触发非法分钟/秒
  validationMsg.value = ''
  if (rawDigits.value === '' || rawDigits.value === '0') {
    rawDigits.value = '0'
  } else {
    rawDigits.value += '00'
  }
}

function pressBackspace() {
  if (hasResult.value) {
    clearAll()
    return
  }
  validationMsg.value = ''
  if (rawDigits.value.length > 1) {
    rawDigits.value = rawDigits.value.slice(0, -1)
  } else {
    rawDigits.value = ''
  }
}

function pressOperator(op: '+' | '-') {
  validationMsg.value = ''
  if (hasResult.value) {
    const resultSecs = parseResultSeconds()
    items.value = [{
      value: resultSecs,
      display: formatSeconds(resultSecs),
      operator: op,
    }]
    rawDigits.value = ''
    hasResult.value = false
    result.value = ''
    return
  }

  if (!rawDigits.value && items.value.length > 0) {
    items.value[items.value.length - 1].operator = op
    return
  }

  const secs = parseDigitsToSeconds(rawDigits.value || '0')
  const display = rawDigits.value ? formatDigitsAsTime(rawDigits.value) : '0:00'
  items.value.push({
    value: secs,
    display,
    operator: op,
  })
  rawDigits.value = ''
}

function pressEquals() {
  validationMsg.value = ''

  const currentSecs = rawDigits.value ? parseDigitsToSeconds(rawDigits.value) : 0
  const currentDisplayText = rawDigits.value ? formatDigitsAsTime(rawDigits.value) : '0:00'

  const allItems = [...items.value]
  if (rawDigits.value) {
    // 有正在输入的数字，作为最后一项
    allItems.push({
      value: currentSecs,
      display: currentDisplayText,
      operator: null,
    })
  } else if (items.value.length > 0) {
    // 没有新输入但已有项（如连续按运算符后直接按=），取当前累计结果
    // 移除最后一个运算符（= 不需要后续运算符）
    allItems[allItems.length - 1] = {
      ...allItems[allItems.length - 1],
      operator: null,
    }
  }

  if (allItems.length === 0) return

  // 计算
  let total = 0
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i]
    if (i === 0) {
      total = item.value
    } else {
      const prevOp = allItems[i - 1].operator
      if (prevOp === '+') {
        total += item.value
      } else if (prevOp === '-') {
        total -= item.value
      }
    }
  }

  const exprText = expressionDisplay.value
  result.value = formatSeconds(total)
  hasResult.value = true

  // 添加到本地历史
  history.value.push({
    expression: exprText,
    resultDisplay: formatSeconds(total),
    resultReadable: formatSecondsReadable(total),
    resultSeconds: total,
  })

  // 自动滚动到底部
  nextTick(() => {
    if (historyContainer.value) {
      historyContainer.value.scrollTop = historyContainer.value.scrollHeight
    }
  })

  // 保存到全局计算历史
  calcStore.addRecord({
    type: 'duration_calc',
    input: {
      expression: exprText,
      items: allItems.map(it => ({ display: it.display, operator: it.operator })),
    },
    result: {
      totalSeconds: total,
      display: formatSeconds(total),
      readable: formatSecondsReadable(total),
    },
  })
}

function parseResultSeconds(): number {
  if (!result.value) return 0
  const negative = result.value.startsWith('-')
  const str = negative ? result.value.slice(1) : result.value
  const parts = str.split(':')
  let secs = 0
  if (parts.length === 3) {
    secs = (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0)
  } else if (parts.length === 2) {
    secs = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0)
  } else {
    secs = parseInt(parts[0]) || 0
  }
  return negative ? -secs : secs
}

function clearAll() {
  items.value = []
  rawDigits.value = ''
  result.value = ''
  hasResult.value = false
  validationMsg.value = ''
}

function clearEntry() {
  rawDigits.value = ''
  validationMsg.value = ''
}

// ===== 回退到历史某一步 =====

function revertToHistory(index: number) {
  const entry = history.value[index]
  items.value = [{
    value: entry.resultSeconds,
    display: entry.resultDisplay,
    operator: null,
  }]
  rawDigits.value = ''
  result.value = entry.resultDisplay
  hasResult.value = true
  validationMsg.value = ''
}

// ===== 清除历史 =====

function clearHistory() {
  history.value = []
}

// ===== 键盘快捷键 =====

function handleKeydown(e: KeyboardEvent) {
  if (e.key >= '0' && e.key <= '9') {
    e.preventDefault()
    pressDigit(e.key)
  } else if (e.key === 'Backspace') {
    e.preventDefault()
    pressBackspace()
  } else if (e.key === '+') {
    e.preventDefault()
    pressOperator('+')
  } else if (e.key === '-') {
    e.preventDefault()
    pressOperator('-')
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault()
    pressEquals()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    clearAll()
  } else if (e.key === 'Delete') {
    e.preventDefault()
    clearEntry()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (validationTimer) clearTimeout(validationTimer)
})
</script>

<template>
  <div class="duration-calc">
    <!-- 显示区域（历史 + 当前） -->
    <div class="calc-screen">
      <!-- 计算历史（可滚动） -->
      <div class="calc-history" ref="historyContainer" v-if="history.length > 0">
        <div class="history-header">
          <span>计算历史</span>
          <button class="history-clear" @click="clearHistory" title="清除历史">✕</button>
        </div>
        <div
          v-for="(entry, idx) in history"
          :key="idx"
          class="history-item"
          @click="revertToHistory(idx)"
          :title="`点击回退到: ${entry.resultDisplay}`"
        >
          <div class="history-item__expr tabular-nums">{{ entry.expression }}</div>
          <div class="history-item__result">
            <span class="history-item__value tabular-nums">= {{ entry.resultDisplay }}</span>
            <span class="history-item__readable">{{ entry.resultReadable }}</span>
          </div>
        </div>
      </div>

      <!-- 当前显示屏 -->
      <div class="calc-display">
        <div class="calc-expression tabular-nums">{{ expressionDisplay }}</div>
        <div class="calc-result" :class="{ 'has-result': hasResult }">
          <template v-if="hasResult">
            <span class="calc-result__value tabular-nums">{{ result }}</span>
            <span class="calc-result__readable">{{ formatSecondsReadable(parseResultSeconds()) }}</span>
          </template>
          <template v-else>
            <span class="calc-result__current tabular-nums" :class="{ 'calc-result__interim': isShowingRunningTotal }">{{ currentDisplay }}</span>
            <span v-if="isShowingRunningTotal" class="calc-result__readable-interim">{{ formatSecondsReadable(computeRunningTotal()) }}</span>
          </template>
        </div>
        <!-- 验证提示 -->
        <Transition name="validation-fade">
          <div v-if="validationMsg" class="calc-validation">{{ validationMsg }}</div>
        </Transition>
      </div>
    </div>

    <!-- 小键盘 -->
    <div class="calc-keypad">
      <div class="keypad-grid">
        <!-- 第1行：功能键 -->
        <button class="key key--fn" @click="clearAll">AC</button>
        <button class="key key--fn" @click="clearEntry">CE</button>
        <button class="key key--fn" @click="pressBackspace">⌫</button>
        <button class="key key--op key--minus" @click="pressOperator('-')">−</button>

        <!-- 第2行 -->
        <button class="key key--num" @click="pressDigit('7')">7</button>
        <button class="key key--num" @click="pressDigit('8')">8</button>
        <button class="key key--num" @click="pressDigit('9')">9</button>
        <button class="key key--op key--plus" @click="pressOperator('+')">+</button>

        <!-- 第3行 -->
        <button class="key key--num" @click="pressDigit('4')">4</button>
        <button class="key key--num" @click="pressDigit('5')">5</button>
        <button class="key key--num" @click="pressDigit('6')">6</button>
        <button class="key key--eq" @click="pressEquals">=</button>

        <!-- 第4行 -->
        <button class="key key--num" @click="pressDigit('1')">1</button>
        <button class="key key--num" @click="pressDigit('2')">2</button>
        <button class="key key--num" @click="pressDigit('3')">3</button>
        <!-- = 占位（跨行渲染） -->

        <!-- 第5行 -->
        <button class="key key--num key--zero" @click="pressDigit('0')">0</button>
        <button class="key key--num" @click="pressDoubleZero">00</button>
        <button class="key key--colon">:</button>
        <!-- 最后一列空位 -->
      </div>
    </div>

    <!-- 示例 -->
    <div class="calc-tips">
      <p>💡 直接输入时间数字，自动识别格式：</p>
      <p><kbd>8</kbd> → 8:00　<kbd>930</kbd> → 9:30　<kbd>1538</kbd> → 15:38　<kbd>102330</kbd> → 10:23:30</p>
      <p>例：<kbd>1538 − 1023 =</kbd> → 5:15:00（5小时15分钟）</p>
      <p>点击历史记录可回退到该步继续计算</p>
      <p>支持键盘：数字键 + − = Enter Esc Backspace</p>
    </div>
  </div>
</template>

<style scoped>
.duration-calc {
  max-width: 400px;
}

/* ===== 整体显示区域 ===== */
.calc-screen {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: #1A202C;
}

/* ===== 计算历史 ===== */
.calc-history {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px 20px 0;
  scrollbar-width: thin;
  scrollbar-color: #4A5568 transparent;
}
.calc-history::-webkit-scrollbar {
  width: 4px;
}
.calc-history::-webkit-scrollbar-thumb {
  background: #4A5568;
  border-radius: 2px;
}
.calc-history::-webkit-scrollbar-track {
  background: transparent;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #718096;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.history-clear {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}
.history-clear:hover {
  color: #FC8181;
  background: rgba(252, 129, 129, 0.1);
}

.history-item {
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}
.history-item:hover {
  background: rgba(99, 179, 237, 0.08);
  border-color: rgba(99, 179, 237, 0.2);
}
.history-item__expr {
  font-size: 12px;
  color: #718096;
  text-align: right;
  line-height: 1.4;
  word-break: break-all;
}
.history-item__result {
  text-align: right;
}
.history-item__value {
  font-size: 16px;
  font-weight: 600;
  color: #90CDF4;
}
.history-item__readable {
  font-size: 11px;
  color: #63B3ED;
  margin-left: 6px;
  opacity: 0.7;
}

/* ===== 当前显示屏 ===== */
.calc-display {
  padding: 20px 24px;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
}
.calc-expression {
  font-size: 14px;
  color: #A0AEC0;
  text-align: right;
  min-height: 20px;
  word-break: break-all;
  margin-bottom: 8px;
  line-height: 1.4;
}
.calc-result {
  text-align: right;
}
.calc-result__current {
  font-size: 40px;
  font-weight: 700;
  color: #FFFFFF;
}
.calc-result__interim {
  color: #63B3ED;
}
.calc-result__readable-interim {
  font-size: 13px;
  color: #90CDF4;
  display: block;
  margin-top: 2px;
  opacity: 0.7;
}
.calc-result__value {
  font-size: 40px;
  font-weight: 700;
  color: #63B3ED;
  display: block;
}
.calc-result__readable {
  font-size: 14px;
  color: #90CDF4;
  display: block;
  margin-top: 4px;
}
.calc-result.has-result .calc-result__value {
  animation: result-pop 0.2s ease-out;
}
@keyframes result-pop {
  0% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* ===== 验证提示 ===== */
.calc-validation {
  position: absolute;
  bottom: 8px;
  left: 24px;
  right: 24px;
  background: #FC8181;
  color: #742A2A;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  text-align: center;
}
.validation-fade-enter-active {
  transition: all 0.2s ease-out;
}
.validation-fade-leave-active {
  transition: all 0.15s ease-in;
}
.validation-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.validation-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ===== 小键盘 ===== */
.calc-keypad {
  margin-bottom: 16px;
}

.keypad-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 8px;
}

.key {
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  padding: 16px 8px;
  transition: all 0.1s ease;
  font-family: inherit;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.key:active {
  transform: scale(0.95);
}

.key--num {
  background: #EDF2F7;
  color: #1A202C;
}
.key--num:hover {
  background: #E2E8F0;
}
.key--zero {
  /* 正常宽度 */
}

.key--fn {
  background: #E2E8F0;
  color: #4A5568;
  font-size: 15px;
}
.key--fn:hover {
  background: #CBD5E0;
}

.key--op {
  font-size: 22px;
  font-weight: 700;
}
.key--plus {
  background: #C6F6D5;
  color: #276749;
}
.key--plus:hover {
  background: #9AE6B4;
}
.key--minus {
  background: #FED7D7;
  color: #9B2C2C;
}
.key--minus:hover {
  background: #FEB2B2;
}

.key--eq {
  background: #2B6CB0;
  color: #FFFFFF;
  font-size: 24px;
  font-weight: 700;
  grid-column: 4;
  grid-row: 3 / 5;
}
.key--eq:hover {
  background: #2C5282;
}

.key--colon {
  background: #EBF8FF;
  color: #2B6CB0;
  font-size: 16px;
  cursor: default;
  opacity: 0.6;
}

/* ===== 说明 ===== */
.calc-tips {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.8;
}
.calc-tips kbd {
  background: #EDF2F7;
  border: 1px solid #E2E8F0;
  border-radius: 3px;
  padding: 1px 6px;
  font-family: inherit;
  font-size: 11px;
}
</style>
