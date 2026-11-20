/** Monedas de la plataforma. Los importes se guardan siempre en USD y se convierten al mostrarlos. */
export type CurrencyCode = 'USD' | 'COP' | 'CRC'

export const currencyCodes: CurrencyCode[] = ['USD', 'COP', 'CRC']

export interface CurrencyOption {
  code: CurrencyCode
  /** Símbolo que se antepone al importe; se elige para que las tres monedas se distingan. */
  symbol: string
  label: string
}

export const currencies: CurrencyOption[] = [
  { code: 'USD', symbol: 'US$', label: 'Dólar estadounidense' },
  { code: 'COP', symbol: 'COL$', label: 'Peso colombiano' },
  { code: 'CRC', symbol: '₡', label: 'Colón costarricense' },
]

/** Unidades de cada moneda equivalentes a 1 USD. La tasa de USD es fija. */
export type ExchangeRates = Record<CurrencyCode, number>

export const defaultRates: ExchangeRates = {
  USD: 1,
  COP: 4000,
  CRC: 500,
}

export function findCurrency(code: CurrencyCode): CurrencyOption {
  return currencies.find((currency) => currency.code === code) ?? currencies[0]!
}
