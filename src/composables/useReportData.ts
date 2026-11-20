import { computed, type ComputedRef, type Ref } from 'vue'

import { platform } from '@/config/platform'
import type { Expense, ExpenseCategory } from '@/types/expense'
import type { SaleRecord } from '@/types/sale'
import type { ReportRange } from './useReportPeriod'

export interface DayPoint {
  key: string
  label: string
  sales: number
  expenses: number
}

export interface ReportSlice {
  label: string
  value: number
  share: number
}

export interface TopProduct {
  name: string
  sku: string
  quantity: number
  revenue: number
}

export interface ReportData {
  sales: SaleRecord[]
  expenses: Expense[]
  salesTotal: number
  expensesTotal: number
  profit: number
  margin: number
  avgTicket: number
  days: DayPoint[]
  categories: ReportSlice[]
  methods: ReportSlice[]
  products: TopProduct[]
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function buildDays(start: Date, end: Date): DayPoint[] {
  const last = startOfDay(end)
  const first = startOfDay(start)
  const limit = new Date(last)
  limit.setDate(limit.getDate() - 30)
  const cursor = first.getTime() < limit.getTime() ? limit : first

  const days: DayPoint[] = []
  while (cursor.getTime() <= last.getTime()) {
    days.push({
      key: dayKey(cursor),
      label: new Intl.DateTimeFormat(platform.locale, { day: '2-digit', month: 'short' })
        .format(cursor)
        .replace('.', ''),
      sales: 0,
      expenses: 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function slices(entries: { label: string; value: number }[], total: number): ReportSlice[] {
  return entries
    .map((entry) => ({ ...entry, share: total > 0 ? (entry.value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value)
}

export function useReportData(
  sales: Ref<SaleRecord[]>,
  expenses: Ref<Expense[]>,
  range: ComputedRef<ReportRange>,
): ComputedRef<ReportData> {
  return computed(() => {
    const start = range.value.start.getTime()
    const end = range.value.end.getTime()
    const inRange = (iso: string | null) => {
      if (!iso) return false
      const time = new Date(iso).getTime()
      return Number.isFinite(time) && time >= start && time <= end
    }

    const periodSales = sales.value.filter((sale) => inRange(sale.createdAt))
    const periodExpenses = expenses.value.filter(
      (expense) => expense.status === 'pagado' && inRange(expense.paidAt ?? expense.date),
    )

    const salesTotal = periodSales.reduce((sum, sale) => sum + sale.total, 0)
    const expensesTotal = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const profit = salesTotal - expensesTotal

    const days = buildDays(range.value.start, range.value.end)
    const byKey = new Map(days.map((day) => [day.key, day]))
    for (const sale of periodSales) {
      const day = byKey.get(dayKey(new Date(sale.createdAt)))
      if (day) day.sales += sale.total
    }
    for (const expense of periodExpenses) {
      const day = byKey.get(dayKey(new Date(expense.paidAt ?? expense.date)))
      if (day) day.expenses += expense.amount
    }

    const categoryTotals = new Map<ExpenseCategory, number>()
    for (const expense of periodExpenses) {
      categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + expense.amount)
    }
    const categories = slices(
      [...categoryTotals].map(([label, value]) => ({ label, value })),
      expensesTotal,
    )

    const methodTotals = new Map<string, number>()
    for (const sale of periodSales) {
      methodTotals.set(sale.paymentMethod, (methodTotals.get(sale.paymentMethod) ?? 0) + sale.total)
    }
    const methods = slices(
      [...methodTotals].map(([id, value]) => ({
        label: id === 'efectivo' ? 'Efectivo' : 'Tarjeta',
        value,
      })),
      salesTotal,
    )

    const productTotals = new Map<string, TopProduct>()
    for (const sale of periodSales) {
      for (const line of sale.lines) {
        const key = `${line.sku}:${line.name}`
        const current = productTotals.get(key) ?? {
          name: line.name,
          sku: line.sku,
          quantity: 0,
          revenue: 0,
        }
        current.quantity += line.quantity
        current.revenue += line.total
        productTotals.set(key, current)
      }
    }
    const products = [...productTotals.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return {
      sales: periodSales,
      expenses: periodExpenses,
      salesTotal,
      expensesTotal,
      profit,
      margin: salesTotal > 0 ? (profit / salesTotal) * 100 : 0,
      avgTicket: periodSales.length > 0 ? salesTotal / periodSales.length : 0,
      days,
      categories,
      methods,
      products,
    }
  })
}
