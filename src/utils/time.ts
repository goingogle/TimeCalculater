import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { type CalcRecord } from '@/types'

dayjs.extend(duration)

/** 生成UUID */
export function generateId(): string {
  return crypto.randomUUID()
}

/** 格式化时间戳为日期时间字符串 */
export function formatDateTime(ts: number): string {
  return dayjs(ts).format('YYYY-MM-DD HH:mm:ss')
}

/** 格式化时间戳为日期字符串 */
export function formatDate(ts: number): string {
  return dayjs(ts).format('YYYY-MM-DD')
}

/** 格式化时间戳为时间字符串 */
export function formatTime(ts: number): string {
  return dayjs(ts).format('HH:mm:ss')
}

/** 将毫秒数格式化为可读时长 */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0
  const d = dayjs.duration(ms)
  const hours = Math.floor(d.asHours())
  const minutes = d.minutes()
  const seconds = d.seconds()

  if (hours > 0) {
    return `${hours}小时${minutes}分${seconds}秒`
  }
  if (minutes > 0) {
    return `${minutes}分${seconds}秒`
  }
  return `${seconds}秒`
}

/** 将毫秒数格式化为简短时长（用于表格等紧凑场景） */
export function formatDurationShort(ms: number): string {
  if (ms < 0) ms = 0
  const d = dayjs.duration(ms)
  const hours = Math.floor(d.asHours())
  const minutes = d.minutes()
  const seconds = d.seconds()
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/** 计算两个时间戳之间的时长(ms) */
export function timeDiff(start: number, end: number): number {
  return end - start
}

/** 计算两个日期之间的天数 */
export function dateDiffDays(start: string, end: string): number {
  return dayjs(end).diff(dayjs(start), 'day')
}

/** 计算两个日期之间的工作日天数（排除周末） */
export function workdayDiff(start: string, end: string): number {
  let count = 0
  let current = dayjs(start)
  const endDay = dayjs(end)

  while (current.isBefore(endDay) || current.isSame(endDay, 'day')) {
    const dow = current.day() // 0=周日, 6=周六
    if (dow !== 0 && dow !== 6) {
      count++
    }
    current = current.add(1, 'day')
  }
  return count
}

/** 时间推算：从指定时间加减时长 */
export function timeOffset(base: number, offsetMs: number): number {
  return base + offsetMs
}

/** 时间单位换算 */
export function convertTimeUnit(value: number, from: string, to: string): number {
  // 先统一转为毫秒
  const toMs: Record<string, number> = {
    ms: 1,
    s: 1000,
    min: 60000,
    h: 3600000,
    d: 86400000,
    w: 604800000,
  }
  const ms = value * (toMs[from] || 1)
  return ms / (toMs[to] || 1)
}

/** 构建计算结果描述 */
export function buildCalcResultLabel(record: CalcRecord): string {
  switch (record.type) {
    case 'time_diff': {
      const { start, end } = record.input as { start: string; end: string }
      return `${start} → ${end} = ${formatDuration(record.result.diff as number)}`
    }
    case 'date_diff': {
      const { start, end } = record.input as { start: string; end: string }
      return `${start} → ${end} = ${record.result.days}天`
    }
    case 'workday': {
      const { start, end } = record.input as { start: string; end: string }
      return `${start} → ${end} = ${record.result.workdays}个工作日`
    }
    case 'time_offset': {
      const { base, offsetMs } = record.input as { base: string; offsetMs: number }
      return `${base} ± ${formatDuration(Math.abs(offsetMs))} = ${record.result.result as string}`
    }
    case 'unit_convert': {
      const { value, from, to } = record.input as { value: number; from: string; to: string }
      return `${value} ${from} = ${record.result.converted} ${to}`
    }
    case 'duration_calc': {
      const { expression } = record.input as { expression: string }
      return `${expression} = ${record.result.readable}`
    }
    default:
      return ''
  }
}
