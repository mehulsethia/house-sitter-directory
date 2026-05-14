import { NextRequest } from 'next/server'

function parseOrigin(value: string): string | null {
  const raw = value.trim()
  if (!raw) return null
  try {
    const normalized = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`
    return new URL(normalized).origin
  } catch {
    return null
  }
}

function parseHost(value: string | null): string | null {
  if (!value) return null
  const host = value.split(',')[0]?.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  return host || null
}

function inferProto(host: string, forwardedProto: string | null): 'http' | 'https' {
  if (forwardedProto === 'http' || forwardedProto === 'https') return forwardedProto
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return 'http'
  return 'https'
}

/**
 * Resolves the canonical app origin for redirects.
 * Priority: request host headers (production-safe) -> explicit env URLs -> localhost fallback.
 */
export function resolveAppOrigin(req?: NextRequest): string {
  if (req) {
    const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? null
    const forwardedHost = parseHost(req.headers.get('x-forwarded-host'))
    const host = forwardedHost ?? parseHost(req.headers.get('host'))
    if (host) {
      const proto = inferProto(host, forwardedProto)
      const origin = parseOrigin(`${proto}://${host}`)
      if (origin) return origin
    }
  }

  const envCandidates = [
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ]

  for (const candidate of envCandidates) {
    if (!candidate) continue
    const origin = parseOrigin(candidate)
    if (origin) return origin
  }

  return 'http://localhost:3000'
}
