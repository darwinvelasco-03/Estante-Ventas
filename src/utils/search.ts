/** Ignora tildes y mayúsculas para que "cafe" encuentre "Café". */
export function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
