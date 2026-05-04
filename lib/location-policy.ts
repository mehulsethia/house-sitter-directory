export const MVP_CITY = 'Larnaca'
export const MVP_COUNTRY_CODE = 'CY'
export const MVP_COUNTRY_NAME = 'Cyprus'
export const CYPRUS_POSTCODE_REGEX = /^\d{4}$/
export const MAX_SAVED_ADDRESSES = 5

export function normalizeCity(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase()
}

export function isMvpCity(value: string | null | undefined): boolean {
  return normalizeCity(value) === MVP_CITY.toLowerCase()
}

export function normalizeCountryCode(value: string | null | undefined): string {
  return String(value ?? '').trim().toUpperCase()
}

export function isMvpCountryCode(value: string | null | undefined): boolean {
  return normalizeCountryCode(value) === MVP_COUNTRY_CODE
}

export function normalizeCyprusPostcode(value: string | null | undefined): string {
  return String(value ?? '').replace(/\D/g, '').slice(0, 4)
}

export function isCyprusPostcode(value: string | null | undefined): boolean {
  return CYPRUS_POSTCODE_REGEX.test(normalizeCyprusPostcode(value))
}

