<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ccrToDuty,
  dutyToCcr,
  formatDuration,
  formatError,
  formatFreq,
  solveSystick,
  solveTimer,
  solveUart,
  transferSeconds,
} from '@/lib/timerCalc'

const inputClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

// ---------- 时钟（各 Tab 共用） ----------

const presets = [
  { label: 'STM32F103 — 定时器时钟 72 MHz', hz: 72e6 },
  { label: 'STM32F407 — APB2 定时器 168 MHz', hz: 168e6 },
  { label: 'STM32F407 — APB1 定时器 84 MHz', hz: 84e6 },
  { label: 'STM32F411 — 定时器时钟 100 MHz', hz: 100e6 },
  { label: 'STM32F051 — 定时器时钟 48 MHz', hz: 48e6 },
]
const clockMhz = ref(72)
const clockHz = computed(() => clockMhz.value * 1e6)
const presetValue = computed({
  get: () => {
    const idx = presets.findIndex((p) => p.hz === clockHz.value)
    return idx >= 0 ? String(idx) : 'custom'
  },
  set: (v: string) => {
    if (v !== 'custom') clockMhz.value = presets[Number(v)].hz / 1e6
  },
})

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} 已复制：${text}`)
  } catch {
    toast.error('复制失败')
  }
}

// ---------- Tab 1：定时中断 ----------

const periodMode = ref<'period' | 'freq'>('period')
const periodValue = ref(1)
const periodUnit = ref<'us' | 'ms' | 's'>('ms')
const freqValue = ref(1)
const freqUnit = ref<'Hz' | 'kHz' | 'MHz'>('kHz')

const unitFactor: Record<string, number> = { us: 1e-6, ms: 1e-3, s: 1 }
const targetSec = computed(() => {
  if (periodMode.value === 'period') {
    return periodValue.value * (unitFactor[periodUnit.value] ?? 1)
  }
  const f = freqValue.value * ({ Hz: 1, kHz: 1e3, MHz: 1e6 }[freqUnit.value] ?? 1)
  return f > 0 ? 1 / f : 0
})

const solutions = computed(() => solveTimer(clockHz.value, targetSec.value))
const best = computed(() => solutions.value[0])
const maxRes = computed(() =>
  solutions.value.reduce<(typeof solutions.value)[number] | null>(
    (m, s) => (!m || s.arr > m.arr ? s : m),
    null,
  ),
)

function copySolution(s: { psc: number; arr: number }) {
  copy(`PSC=${s.psc}, ARR=${s.arr}`, 'PSC/ARR')
}

// ---------- Tab 2：PWM ----------

const pwmPsc = ref(71)
const pwmArr = ref(999)
const pwmDuty = ref(50)
const pwmCcr = computed(() => dutyToCcr(pwmArr.value, pwmDuty.value))
const pwmFreq = computed(() => {
  const p = pwmPsc.value
  const a = pwmArr.value
  if (!Number.isFinite(p) || !Number.isFinite(a) || p < 0 || a < 0) return 0
  return clockHz.value / ((p + 1) * (a + 1))
})
const pwmActualDuty = computed(() => ccrToDuty(pwmArr.value, pwmCcr.value))

const ccrInput = ref(500)
const ccrDuty = computed(() => ccrToDuty(pwmArr.value, ccrInput.value))

// ---------- Tab 3：SysTick ----------

const systickValue = ref(1)
const systickUnit = ref<'us' | 'ms'>('ms')
const systickTarget = computed(
  () => systickValue.value * (unitFactor[systickUnit.value] ?? 1),
)
const systick = computed(() => solveSystick(clockHz.value, systickTarget.value))

// ---------- Tab 4：串口辅助 ----------

const uartBaud = ref(115200)
const uartClockMhz = ref(72)
const uartClockHz = computed(() => uartClockMhz.value * 1e6)
const uart = computed(() => solveUart(uartClockHz.value, uartBaud.value))

const uartBytes = ref(1024)
const uartDuration = computed(() =>
  formatDuration(transferSeconds(uartBaud.value, uartBytes.value)),
)
</script>

<template>
  <div class="min-h-0 flex-1 overflow-y-auto">
    <Tabs default-value="timer" class="gap-4">
      <div class="flex items-center gap-3">
        <TabsList>
          <TabsTrigger value="timer">定时中断</TabsTrigger>
          <TabsTrigger value="pwm">PWM</TabsTrigger>
          <TabsTrigger value="systick">SysTick</TabsTrigger>
          <TabsTrigger value="uart">串口辅助</TabsTrigger>
        </TabsList>
      </div>

      <!-- ============ 定时中断 ============ -->
      <TabsContent value="timer" class="mt-0 space-y-4">
        <div class="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4">
          <div class="w-52 space-y-1.5">
            <label class="text-sm font-medium">定时器时钟</label>
            <div class="flex gap-2">
              <input v-model.number="clockMhz" type="number" min="0" step="0.001" :class="inputClass" />
              <span class="flex h-9 items-center text-sm text-muted-foreground">MHz</span>
            </div>
          </div>
          <div class="w-64 space-y-1.5">
            <label class="text-sm font-medium">芯片预设</label>
            <select v-model="presetValue" :class="[inputClass, 'cursor-pointer']">
              <option v-for="(p, i) in presets" :key="i" :value="String(i)">{{ p.label }}</option>
              <option value="custom">自定义（已手动修改）</option>
            </select>
          </div>
        </div>

        <div class="flex flex-wrap items-end gap-3 rounded-lg border p-4">
          <div class="flex overflow-hidden rounded-md border">
            <button
              class="px-3 py-1.5 text-sm transition-colors"
              :class="periodMode === 'period' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
              @click="periodMode = 'period'"
            >
              按目标周期
            </button>
            <button
              class="px-3 py-1.5 text-sm transition-colors"
              :class="periodMode === 'freq' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
              @click="periodMode = 'freq'"
            >
              按目标频率
            </button>
          </div>

          <template v-if="periodMode === 'period'">
            <div class="w-40 space-y-1.5">
              <label class="text-sm font-medium">目标周期</label>
              <input v-model.number="periodValue" type="number" min="0" step="any" :class="inputClass" />
            </div>
            <div class="w-28 space-y-1.5">
              <label class="text-sm font-medium">单位</label>
              <select v-model="periodUnit" :class="[inputClass, 'cursor-pointer']">
                <option value="us">µs</option>
                <option value="ms">ms</option>
                <option value="s">s</option>
              </select>
            </div>
          </template>
          <template v-else>
            <div class="w-40 space-y-1.5">
              <label class="text-sm font-medium">目标频率</label>
              <input v-model.number="freqValue" type="number" min="0" step="any" :class="inputClass" />
            </div>
            <div class="w-28 space-y-1.5">
              <label class="text-sm font-medium">单位</label>
              <select v-model="freqUnit" :class="[inputClass, 'cursor-pointer']">
                <option value="Hz">Hz</option>
                <option value="kHz">kHz</option>
                <option value="MHz">MHz</option>
              </select>
            </div>
          </template>
        </div>

        <div v-if="best" class="space-y-4">
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">PSC（预分频）</div>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="font-mono text-2xl font-semibold">{{ best.psc }}</span>
                <Button variant="ghost" size="sm" class="h-6 px-1.5 text-xs" @click="copy(String(best.psc), 'PSC')">复制</Button>
              </div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">ARR（自动重装载）</div>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="font-mono text-2xl font-semibold">{{ best.arr }}</span>
                <Button variant="ghost" size="sm" class="h-6 px-1.5 text-xs" @click="copy(String(best.arr), 'ARR')">复制</Button>
              </div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">实际频率</div>
              <div class="mt-1 font-mono text-2xl font-semibold">{{ formatFreq(best.actualFreq) }}</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">误差</div>
              <div class="mt-1 font-mono text-2xl font-semibold">
                {{ formatError(best.errorPpm) }}
                <Badge v-if="best.errorPpm === 0" class="ml-1 align-middle" variant="secondary">精确</Badge>
              </div>
            </div>
          </div>

          <div class="rounded-lg border">
            <div class="border-b bg-muted/50 px-4 py-2 text-sm font-medium">备选方案</div>
            <Table>
              <TableHeader>
                <TableRow class="hover:bg-transparent">
                  <TableHead class="bg-muted/50">PSC</TableHead>
                  <TableHead class="bg-muted/50">ARR</TableHead>
                  <TableHead class="bg-muted/50">实际周期</TableHead>
                  <TableHead class="bg-muted/50">实际频率</TableHead>
                  <TableHead class="bg-muted/50">误差</TableHead>
                  <TableHead class="bg-muted/50">分辨率 (1/ARR)</TableHead>
                  <TableHead class="bg-muted/50">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="s in solutions" :key="s.psc">
                  <TableCell class="font-mono">{{ s.psc }}</TableCell>
                  <TableCell class="font-mono">{{ s.arr }}</TableCell>
                  <TableCell>{{ formatDuration(s.actualPeriod) }}</TableCell>
                  <TableCell>{{ formatFreq(s.actualFreq) }}</TableCell>
                  <TableCell>{{ formatError(s.errorPpm) }}</TableCell>
                  <TableCell class="font-mono text-xs text-muted-foreground">1/{{ s.arr + 1 }}</TableCell>
                  <TableCell>
                    <div class="flex gap-1">
                      <Button variant="outline" size="sm" class="h-7 px-2 text-xs" @click="copySolution(s)">复制</Button>
                      <Badge v-if="maxRes && s === maxRes" variant="secondary" class="text-xs">分辨率最高</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p class="text-xs text-muted-foreground">
            按 16 位定时器计算（PSC / ARR 取值 0–65535）。备选方案按误差排序，且彼此分辨率差异明显；PWM 场景可选 ARR 更大的方案获得更细的占空比步进。
          </p>
        </div>
        <div v-else class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          请输入有效的定时器时钟和目标周期 / 频率
        </div>
      </TabsContent>

      <!-- ============ PWM ============ -->
      <TabsContent value="pwm" class="mt-0 space-y-4">
        <div class="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4">
          <div class="w-44 space-y-1.5">
            <label class="text-sm font-medium">定时器时钟 (MHz)</label>
            <input v-model.number="clockMhz" type="number" min="0" step="0.001" :class="inputClass" />
          </div>
          <div class="w-36 space-y-1.5">
            <label class="text-sm font-medium">PSC</label>
            <input v-model.number="pwmPsc" type="number" min="0" max="65535" :class="inputClass" />
          </div>
          <div class="w-36 space-y-1.5">
            <label class="text-sm font-medium">ARR</label>
            <input v-model.number="pwmArr" type="number" min="0" max="65535" :class="inputClass" />
          </div>
          <div class="text-sm text-muted-foreground">
            PWM 频率：<span class="font-mono font-medium text-foreground">{{ formatFreq(pwmFreq) }}</span>
            （占空比步进 1/{{ pwmArr + 1 }}）
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-3 rounded-lg border p-4">
            <div class="text-sm font-medium">占空比 → CCR</div>
            <div class="flex items-end gap-3">
              <div class="w-36 space-y-1.5">
                <label class="text-xs text-muted-foreground">目标占空比 (%)</label>
                <input v-model.number="pwmDuty" type="number" min="0" max="100" step="any" :class="inputClass" />
              </div>
              <div class="flex-1 space-y-1.5">
                <label class="text-xs text-muted-foreground">CCR 值</label>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xl font-semibold">{{ pwmCcr }}</span>
                  <Button variant="outline" size="sm" class="h-7 px-2 text-xs" @click="copy(String(pwmCcr), 'CCR')">复制</Button>
                </div>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              写入 CCR 后实际占空比：{{ pwmActualDuty.toFixed(4) }}%（duty = CCR / (ARR+1)）
            </p>
          </div>

          <div class="space-y-3 rounded-lg border p-4">
            <div class="text-sm font-medium">CCR → 占空比</div>
            <div class="flex items-end gap-3">
              <div class="w-36 space-y-1.5">
                <label class="text-xs text-muted-foreground">CCR 值</label>
                <input v-model.number="ccrInput" type="number" min="0" :class="inputClass" />
              </div>
              <div class="flex-1">
                <label class="text-xs text-muted-foreground">对应占空比</label>
                <div class="font-mono text-xl font-semibold">{{ ccrDuty.toFixed(4) }} %</div>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">读代码反推占空比时使用</p>
          </div>
        </div>
      </TabsContent>

      <!-- ============ SysTick ============ -->
      <TabsContent value="systick" class="mt-0 space-y-4">
        <div class="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4">
          <div class="w-52 space-y-1.5">
            <label class="text-sm font-medium">HCLK 时钟</label>
            <div class="flex gap-2">
              <input v-model.number="clockMhz" type="number" min="0" step="0.001" :class="inputClass" />
              <span class="flex h-9 items-center text-sm text-muted-foreground">MHz</span>
            </div>
          </div>
          <div class="w-40 space-y-1.5">
            <label class="text-sm font-medium">目标节拍周期</label>
            <input v-model.number="systickValue" type="number" min="0" step="any" :class="inputClass" />
          </div>
          <div class="w-28 space-y-1.5">
            <label class="text-sm font-medium">单位</label>
            <select v-model="systickUnit" :class="[inputClass, 'cursor-pointer']">
              <option value="us">µs</option>
              <option value="ms">ms</option>
            </select>
          </div>
        </div>

        <div v-if="systick && systickTarget > 0" class="space-y-4">
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">LOAD（十进制）</div>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="font-mono text-2xl font-semibold">{{ systick.load }}</span>
                <Button variant="ghost" size="sm" class="h-6 px-1.5 text-xs" @click="copy(String(systick.load), 'LOAD')">复制</Button>
              </div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">LOAD（十六进制）</div>
              <div class="mt-1 font-mono text-2xl font-semibold">0x{{ systick.load.toString(16).toUpperCase() }}</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">实际节拍</div>
              <div class="mt-1 font-mono text-2xl font-semibold">{{ formatDuration(systick.actualSec) }}</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">误差</div>
              <div class="mt-1 font-mono text-2xl font-semibold">{{ formatError(systick.errorPpm) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <Badge v-if="systick.ok" variant="secondary">在 24 位范围内</Badge>
            <Badge v-else variant="destructive">超出 24 位计数器范围</Badge>
            <span class="text-muted-foreground">
              当前时钟下 SysTick 最长可表达 {{ formatDuration(systick.maxSec) }}（LOAD 上限 0xFFFFFF）
            </span>
          </div>
          <p class="text-xs text-muted-foreground">
            HAL 时基常用 1ms 节拍：HCLK 72MHz 时 LOAD = 71999。计算公式：LOAD = HCLK × T − 1。
          </p>
        </div>
      </TabsContent>

      <!-- ============ 串口辅助 ============ -->
      <TabsContent value="uart" class="mt-0 space-y-4">
        <div class="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4">
          <div class="w-52 space-y-1.5">
            <label class="text-sm font-medium">串口时钟（PCLK）</label>
            <div class="flex gap-2">
              <input v-model.number="uartClockMhz" type="number" min="0" step="0.001" :class="inputClass" />
              <span class="flex h-9 items-center text-sm text-muted-foreground">MHz</span>
            </div>
          </div>
          <div class="w-44 space-y-1.5">
            <label class="text-sm font-medium">目标波特率</label>
            <input v-model.number="uartBaud" type="number" min="1" :class="inputClass" />
          </div>
          <p class="pb-2 text-xs text-muted-foreground">串口时钟来自所在总线的 PCLK（非定时器时钟），请单独填写</p>
        </div>

        <div v-if="uart" class="space-y-4">
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">BRR 寄存器值</div>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="font-mono text-2xl font-semibold">{{ uart.brrHex }}</span>
                <Button variant="ghost" size="sm" class="h-6 px-1.5 text-xs" @click="copy(uart.brrHex, 'BRR')">复制</Button>
              </div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">USARTDIV</div>
              <div class="mt-1 font-mono text-2xl font-semibold">{{ uart.usartDiv.toFixed(4) }}</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">实际波特率</div>
              <div class="mt-1 font-mono text-2xl font-semibold">{{ Math.round(uart.actualBaud).toLocaleString() }}</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xs text-muted-foreground">误差</div>
              <div class="mt-1 font-mono text-2xl font-semibold">{{ formatError(uart.errorPpm) }}</div>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            mantissa = {{ uart.mantissa }}，fraction = {{ uart.fraction }}（16 倍过采样，适用于 F1 系列等标准 USART）。
            误差超过 2% 时通信可能不稳定，建议换用更接近的时钟或波特率。
          </p>

          <div class="flex flex-wrap items-end gap-3 rounded-lg border p-4">
            <div class="w-40 space-y-1.5">
              <label class="text-sm font-medium">传输字节数</label>
              <input v-model.number="uartBytes" type="number" min="1" :class="inputClass" />
            </div>
            <div>
              <label class="text-xs text-muted-foreground">传输耗时（8N1，每字节 10 bit）</label>
              <div class="font-mono text-xl font-semibold">{{ uartDuration }}</div>
            </div>
            <div class="pb-1 text-xs text-muted-foreground">
              {{ uartBytes.toLocaleString() }} 字节 @ {{ uartBaud.toLocaleString() }} baud
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
