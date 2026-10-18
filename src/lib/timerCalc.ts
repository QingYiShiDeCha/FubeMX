/**
 * 定时器计算核心逻辑
 * 约定：PSC / ARR / LOAD 等寄存器均按 16 位定时器处理（0–65535），
 * 计数公式：更新频率 = f_timer / ((PSC + 1) * (ARR + 1))
 */

export interface TimerSolution {
  psc: number
  arr: number
  /** 实际更新周期（秒） */
  actualPeriod: number
  /** 实际更新频率（Hz） */
  actualFreq: number
  /** 相对误差（百万分之，ppm） */
  errorPpm: number
}

const U16_MAX = 65535

/** 求解定时中断的 PSC/ARR 组合，按误差从小到大返回，并按分辨率去重 */
export function solveTimer(clockHz: number, targetSec: number, limit = 8): TimerSolution[] {
  // 理想值 N = (PSC+1) * (ARR+1) = f * T
  const N = clockHz * targetSec
  if (!Number.isFinite(N) || clockHz <= 0 || N < 1) return []

  const candidates: TimerSolution[] = []
  for (let psc = 0; psc <= U16_MAX; psc++) {
    const div = psc + 1
    const ticks = Math.round(N / div)
    if (ticks < 1) break // 分频过大，单次计数不足
    const arr = ticks - 1
    if (arr > U16_MAX) continue
    const product = div * ticks
    candidates.push({
      psc,
      arr,
      actualPeriod: product / clockHz,
      actualFreq: clockHz / product,
      errorPpm: (Math.abs(product - N) / N) * 1e6,
    })
  }

  candidates.sort((a, b) => a.errorPpm - b.errorPpm || b.arr - a.arr)

  // 去重：ARR+1 与已选方案相差不足 10% 的视为同质解，保证备选间分辨率差异明显
  const picked: TimerSolution[] = []
  for (const c of candidates) {
    const distinct = picked.every(
      (p) => Math.abs(p.arr - c.arr) / (p.arr + 1) > 0.1,
    )
    if (distinct) {
      picked.push(c)
      if (picked.length >= limit) break
    }
  }
  return picked
}

/** 占空比（%）→ CCR 值，duty = CCR / (ARR+1) */
export function dutyToCcr(arr: number, dutyPercent: number): number {
  if (!Number.isFinite(arr) || arr < 0) return 0
  const ccr = Math.round(((arr + 1) * dutyPercent) / 100)
  return Math.min(Math.max(ccr, 0), arr + 1)
}

/** CCR 值 → 占空比（%） */
export function ccrToDuty(arr: number, ccr: number): number {
  if (!Number.isFinite(arr) || arr < 0 || arr + 1 === 0) return 0
  return (ccr / (arr + 1)) * 100
}

export interface SystickResult {
  /** LOAD 是否在 24 位计数器范围内 */
  ok: boolean
  load: number
  actualSec: number
  errorPpm: number
  /** 当前时钟下 LOAD 可表达的最长周期（秒） */
  maxSec: number
}

/** SysTick：LOAD = f * T - 1，24 位计数器（0xFFFFFF 上限） */
export function solveSystick(clockHz: number, targetSec: number): SystickResult {
  const ideal = clockHz * targetSec
  const counts = Math.max(0, Math.round(ideal))
  const load = counts - 1
  return {
    ok: clockHz > 0 && load >= 0 && load <= 0xffffff,
    load,
    actualSec: counts / clockHz,
    errorPpm: ideal > 0 ? (Math.abs(counts - ideal) / ideal) * 1e6 : 0,
    maxSec: clockHz > 0 ? 0x1000000 / clockHz : 0,
  }
}

export interface UartResult {
  ok: boolean
  usartDiv: number
  mantissa: number
  fraction: number
  /** BRR 寄存器值（16 位，mantissa<<4 | fraction）的十六进制表示 */
  brrHex: string
  actualBaud: number
  errorPpm: number
}

/** USART 波特率：USARTDIV = fCK / (过采样 * 波特率)，默认 16 倍过采样（F1 系列等） */
export function solveUart(pclkHz: number, baud: number, oversample = 16): UartResult | null {
  if (pclkHz <= 0 || baud <= 0) return null
  const usartDiv = pclkHz / (oversample * baud)
  let mantissa = Math.floor(usartDiv)
  let fraction = Math.round((usartDiv - mantissa) * oversample)
  if (fraction >= oversample) {
    mantissa += 1
    fraction = 0
  }
  const actual = pclkHz / (oversample * (mantissa + fraction / oversample))
  const brr = (mantissa << 4) | fraction
  return {
    ok: mantissa >= 0 && mantissa <= 0xffff,
    usartDiv,
    mantissa,
    fraction,
    brrHex: `0x${brr.toString(16).toUpperCase().padStart(4, '0')}`,
    actualBaud: actual,
    errorPpm: (Math.abs(actual - baud) / baud) * 1e6,
  }
}

/** 串口传输耗时（秒）：按 8N1 每字节 10 bit 计算 */
export function transferSeconds(baud: number, bytes: number, bitsPerByte = 10): number {
  if (baud <= 0) return 0
  return (bytes * bitsPerByte) / baud
}

// ---------- 数字格式化 ----------

function trimNum(n: number, sig = 6): string {
  if (!Number.isFinite(n)) return '—'
  if (n === 0) return '0'
  const s = n.toPrecision(sig)
  return s.includes('e') ? s : String(parseFloat(s))
}

/** 秒 → 自动选择 ns / µs / ms / s */
export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return '—'
  if (sec >= 1) return `${trimNum(sec)} s`
  const us = sec * 1e6
  if (us >= 1000) return `${trimNum(us / 1000)} ms`
  if (us >= 1) return `${trimNum(us)} µs`
  return `${trimNum(us * 1000)} ns`
}

/** Hz → 自动选择 mHz / Hz / kHz / MHz */
export function formatFreq(hz: number): string {
  if (!Number.isFinite(hz) || hz <= 0) return '—'
  if (hz >= 1e6) return `${trimNum(hz / 1e6)} MHz`
  if (hz >= 1000) return `${trimNum(hz / 1000)} kHz`
  if (hz >= 1) return `${trimNum(hz)} Hz`
  return `${trimNum(hz * 1000)} mHz`
}

/** ppm 误差 → 低于 1% 显示 ppm，否则显示 % */
export function formatError(ppm: number): string {
  if (!Number.isFinite(ppm)) return '—'
  if (ppm < 10000) return `${trimNum(ppm, 4)} ppm`
  return `${(ppm / 10000).toFixed(4)} %`
}
