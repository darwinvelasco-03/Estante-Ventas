import { findCurrency, type CurrencyCode } from '@/config/currency'
import { platform } from '@/config/platform'
import { currencyCode, fromUsd } from '@/stores/currency'

/**
 * El valor recibido está en USD (base) y se convierte a `code` o a la moneda activa.
 * Un documento puede fijar su moneda con `code`; el número sigue viniendo de la base.
 */
export function formatCurrency(valueUsd: number, decimals = 0, code?: CurrencyCode): string {
  const target = code ?? currencyCode.value
  const converted = fromUsd(valueUsd, target)
  const amount = new Intl.NumberFormat(platform.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(converted))
  return `${converted < 0 ? '-' : ''}${findCurrency(target).symbol} ${amount}`
}

/** Importe ya convertido, sin símbolo, listo para un campo numérico. */
export function amountForInput(valueUsd: number, code?: CurrencyCode): string {
  return String(Number(fromUsd(valueUsd, code ?? currencyCode.value).toFixed(4)))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(platform.locale).format(value)
}

export function formatPercent(value: number): string {
  return `${formatNumber(value)}%`
}

/** Hora para hoy, "Ayer" para ayer y fecha corta para el resto. */
export function formatMovementDate(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const time = new Intl.DateTimeFormat(platform.locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  if (date.toDateString() === today.toDateString()) return time

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return `Ayer ${time}`

  return new Intl.DateTimeFormat(platform.locale, { day: '2-digit', month: 'short' }).format(date)
}

/** Día y mes para el lomo de la agenda; fecha completa para la ficha. */
export function formatVisitParts(iso: string | null) {
  if (!iso) return { day: '—', month: 'sin visita', full: 'Sin visita registrada' }
  const date = new Date(iso)
  const day = new Intl.DateTimeFormat(platform.locale, { day: '2-digit' }).format(date)
  const month = new Intl.DateTimeFormat(platform.locale, { month: 'short' })
    .format(date)
    .replace('.', '')
  const full = new Intl.DateTimeFormat(platform.locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  return { day, month, full }
}
