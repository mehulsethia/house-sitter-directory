export function normalizePhoneE164(input: string): string {
  const trimmed = String(input || '').trim()
  if (!trimmed) return ''
  const compact = trimmed.replace(/[\s()-]/g, '')
  if (!compact.startsWith('+')) return ''
  const normalized = `+${compact.slice(1).replace(/\D/g, '')}`
  return normalized
}

export function isLikelyE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone)
}
