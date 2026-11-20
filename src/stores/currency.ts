import { computed, reactive } from 'vue'

import {
  currencyCodes,
  defaultRates,
  findCurrency,
  type CurrencyCode,
  type ExchangeRates,
} from '@/config/currency'
import { platform } from '@/config/platform'

const STORAGE_KEY = 'estante.currency.v1'

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === 'USD' || value === 'COP' || value === 'CRC'
}

interface CurrencyState {
  code: CurrencyCode
  rates: ExchangeRates
}

function initialState(): CurrencyState {
  return { code: platform.currency, rates: { ...defaultRates } }
}

function load(): CurrencyState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()

    // Formato anterior: solo el código de la moneda, sin conversión.
    if (isCurrencyCode(raw)) return { code: raw, rates: { ...defaultRates } }

    const parsed = JSON.parse(raw) as Record<string, unknown>
    const state = initialState()
    if (isCurrencyCode(parsed.code)) state.code = parsed.code
    if (parsed.rates && typeof parsed.rates === 'object') {
      const saved = parsed.rates as Record<string, unknown>
      for (const code of currencyCodes) {
        const rate = Number(saved[code])
        if (Number.isFinite(rate) && rate > 0) state.rates[code] = rate
      }
    }
    state.rates.USD = 1
    return state
  } catch {
    // Preferencia inicial si el almacenamiento no está disponible o es inválido.
    return initialState()
  }
}

const state = reactive<CurrencyState>(load())

export const currencyCode = computed(() => state.code)
export const currencySymbol = computed(() => findCurrency(state.code).symbol)
export const currencyLabel = computed(() => findCurrency(state.code).label)
export const rates = computed<ExchangeRates>(() => ({ ...state.rates }))

export function rateFor(code: CurrencyCode): number {
  return state.rates[code]
}

/** Importe guardado en USD → importe en la moneda indicada (o en la activa). */
export function fromUsd(value: number, code: CurrencyCode = state.code): number {
  return value * state.rates[code]
}

/** Importe en la moneda indicada (o en la activa) → USD. */
export function toUsd(value: number, code: CurrencyCode = state.code): number {
  return value / state.rates[code]
}

function persist() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ code: state.code, rates: state.rates }),
    )
  } catch {
    // La preferencia sigue activa durante la sesión.
  }
}

export function setCurrency(code: CurrencyCode) {
  if (!isCurrencyCode(code)) return
  state.code = code
  persist()
}

export function setRate(code: CurrencyCode, value: number) {
  if (!isCurrencyCode(code) || code === 'USD') return
  const rate = Number(value)
  if (!Number.isFinite(rate) || rate <= 0) return
  state.rates[code] = rate
  persist()
}

export function resetRates() {
  Object.assign(state.rates, defaultRates)
  persist()
}
