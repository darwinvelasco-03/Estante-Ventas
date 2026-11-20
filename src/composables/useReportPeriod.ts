import { computed, ref } from 'vue'

export type PeriodPreset = 'hoy' | '7d' | '30d' | 'todo' | 'custom'

export interface ReportRange {
  start: Date
  end: Date
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

export function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function useReportPeriod() {
  const preset = ref<PeriodPreset>('30d')
  const from = ref('')
  const to = ref('')

  const range = computed<ReportRange>(() => {
    const now = new Date()
    const today = startOfDay(now)

    if (preset.value === 'hoy') return { start: today, end: endOfDay(now) }

    if (preset.value === '7d' || preset.value === '30d') {
      const start = startOfDay(now)
      start.setDate(start.getDate() - (preset.value === '7d' ? 6 : 29))
      return { start, end: endOfDay(now) }
    }

    if (preset.value === 'custom') {
      let start = from.value ? new Date(`${from.value}T00:00:00`) : today
      let end = to.value ? new Date(`${to.value}T23:59:59`) : endOfDay(now)
      if (!Number.isFinite(start.getTime())) start = today
      if (!Number.isFinite(end.getTime())) end = endOfDay(now)
      if (start.getTime() > end.getTime()) [start, end] = [end, start]
      return { start, end }
    }

    return { start: new Date(0), end: endOfDay(now) }
  })

  const label = computed(() => {
    if (preset.value === 'custom') {
      return `${from.value || 'inicio'} → ${to.value || 'hoy'}`
    }
    const options: Record<Exclude<PeriodPreset, 'custom'>, string> = {
      hoy: 'Hoy',
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      todo: 'Todo el historial',
    }
    return options[preset.value]
  })

  function setPreset(value: PeriodPreset) {
    preset.value = value
    if (value === 'custom' && !from.value && !to.value) {
      const start = startOfDay(new Date())
      start.setDate(start.getDate() - 6)
      from.value = dateInputValue(start)
      to.value = dateInputValue(new Date())
    }
  }

  return { preset, from, to, range, label, setPreset }
}
