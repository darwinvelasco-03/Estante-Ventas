import type { ReportData } from '@/composables/useReportData'

function cell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`
}

function datePart(iso: string) {
  return iso.slice(0, 10)
}

/** CSV con BOM y separador `;` para que abra directamente en Excel en español. */
export function buildReportCsv(data: ReportData) {
  const rows: (string | number)[][] = [
    ['Tipo', 'Folio / concepto', 'Fecha', 'Detalle', 'Monto USD'],
  ]

  for (const sale of data.sales) {
    rows.push([
      'Venta',
      sale.folio,
      datePart(sale.createdAt),
      sale.paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta',
      sale.total.toFixed(2),
    ])
  }
  for (const expense of data.expenses) {
    rows.push([
      'Gasto',
      `${expense.folio} ${expense.concept}`.trim(),
      datePart(expense.paidAt ?? expense.date),
      expense.category,
      expense.amount.toFixed(2),
    ])
  }

  rows.push([])
  rows.push(['Resumen', 'Ventas', '', '', data.salesTotal.toFixed(2)])
  rows.push(['Resumen', 'Gastos pagados', '', '', data.expensesTotal.toFixed(2)])
  rows.push(['Resumen', 'Utilidad', '', '', data.profit.toFixed(2)])
  rows.push(['Resumen', 'Margen (%)', '', '', data.margin.toFixed(2)])

  return `\uFEFF${rows.map((row) => row.map(cell).join(';')).join('\r\n')}`
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
