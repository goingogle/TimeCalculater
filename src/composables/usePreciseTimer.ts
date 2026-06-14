import { ref, onUnmounted } from 'vue'

/**
 * 精确计时Hook，使用 performance.now() + requestAnimationFrame
 * 避免 setInterval 时间漂移问题
 */
export function usePreciseTimer() {
  const elapsed = ref(0)         // 已过毫秒数
  const running = ref(false)
  const startTime = ref(0)
  const accumulated = ref(0)     // 暂停前累计的毫秒数
  let rafId: number | null = null

  const tick = () => {
    if (!running.value) return
    elapsed.value = accumulated.value + (performance.now() - startTime.value)
    rafId = requestAnimationFrame(tick)
  }

  const start = () => {
    startTime.value = performance.now()
    running.value = true
    tick()
  }

  const pause = () => {
    if (!running.value) return
    running.value = false
    accumulated.value = elapsed.value
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const stop = () => {
    running.value = false
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    const finalElapsed = elapsed.value
    elapsed.value = 0
    accumulated.value = 0
    return finalElapsed
  }

  const reset = () => {
    running.value = false
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    elapsed.value = 0
    accumulated.value = 0
  }

  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
  })

  return {
    elapsed,
    running,
    start,
    pause,
    stop,
    reset,
  }
}
