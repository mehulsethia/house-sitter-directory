import jwt from 'jsonwebtoken'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { db, ensureDbSchema } from './db'
import type { User } from '@prisma/client'
import { resolveAppOrigin } from './app-origin'

export type RouteContext = { params: Promise<Record<string, string>> }
type AuthedHandler = (req: NextRequest, ctx: RouteContext, user: User) => Promise<NextResponse>
type Handler = (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>
const SCHEMA_GUARD_TIMEOUT_MS = Number(process.env.DB_SCHEMA_GUARD_TIMEOUT_MS ?? 1500)
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function bootstrapRoleFromMetadata(role: unknown): 'house_sit' | 'house_sitter' {
  return role === 'house_sitter' ? 'house_sitter' : 'house_sit'
}

function fallbackNameFromEmail(email: string) {
  const local = email.split('@')[0]?.trim()
  if (!local) return 'User'
  return local.slice(0, 120)
}

async function bootstrapPublicUser(params: {
  id: string
  email: string
  metadata?: Record<string, unknown> | null
}) {
  const email = params.email.trim().toLowerCase()
  if (!email) return null

  const metadata = params.metadata ?? {}
  const metadataName = typeof metadata.name === 'string' ? metadata.name.trim() : ''
  const metadataPhone = typeof metadata.phone === 'string' ? metadata.phone.trim() : ''
  const role = bootstrapRoleFromMetadata(metadata.role)

  return db.user.upsert({
    where: { id: params.id },
    update: {
      email,
      name: metadataName || fallbackNameFromEmail(email),
      ...(metadataPhone ? { phone: metadataPhone } : {}),
    },
    create: {
      id: params.id,
      email,
      name: metadataName || fallbackNameFromEmail(email),
      role,
      ...(metadataPhone ? { phone: metadataPhone } : {}),
    },
  })
}

async function ensureSchemaReadyWithoutBlockingAuth() {
  const schemaPromise = ensureDbSchema().catch((error) => {
    console.warn('[auth] ensureDbSchema failed:', error instanceof Error ? error.message : String(error))
  })

  await Promise.race([
    schemaPromise,
    new Promise<void>((resolve) => setTimeout(resolve, SCHEMA_GUARD_TIMEOUT_MS)),
  ])
}

function getOriginFromRequestHeaders(req: NextRequest): string | null {
  const originHeader = req.headers.get('origin')?.trim()
  if (originHeader) {
    try {
      return new URL(originHeader).origin
    } catch {
      return null
    }
  }

  const refererHeader = req.headers.get('referer')?.trim()
  if (refererHeader) {
    try {
      return new URL(refererHeader).origin
    } catch {
      return null
    }
  }

  return null
}

function isSameOriginMutatingRequest(req: NextRequest): boolean {
  if (SAFE_METHODS.has(req.method.toUpperCase())) return true
  const requestOrigin = getOriginFromRequestHeaders(req)
  if (!requestOrigin) return false
  const appOrigin = resolveAppOrigin(req)
  return requestOrigin === appOrigin
}

export async function getAuthUser(req: NextRequest): Promise<User | null> {
  await ensureSchemaReadyWithoutBlockingAuth()

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()
  const hasBearerToken = Boolean(token)

  // CSRF guard: if a mutating request relies on cookie session (no bearer),
  // only allow same-origin browser requests.
  if (!hasBearerToken && !isSameOriginMutatingRequest(req)) {
    return null
  }

  // 1) Primary path: Bearer token verification (for explicit API auth headers).
  if (token && process.env.SUPABASE_JWT_SECRET) {
    try {
      const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET, {
        audience: 'authenticated',
        algorithms: ['HS256'],
      }) as { sub: string; email?: string; user_metadata?: Record<string, unknown> }

      let user = await db.user.findUnique({ where: { id: payload.sub } })
      if (!user && payload.email) {
        user = await bootstrapPublicUser({
          id: payload.sub,
          email: payload.email,
          metadata: payload.user_metadata ?? null,
        })
      }
      if (user) {
        if (!user.isActive || user.deletedAt) return null
        return user
      }
      // User not in DB — fall through to cookie path which can auto-create
    } catch {
      // Fall through to cookie-based Supabase auth.
    }
  }

  // 2) Fallback path: Supabase cookie session.
  //    The Next.js middleware already refreshes tokens and forwards updated
  //    cookies on the request, so we can safely read them here. setAll is a
  //    no-op because we only need to read the (already-refreshed) cookies.
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: () => {
            /* no-op — middleware handles cookie refresh */
          },
        },
      },
    )

    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null

    let user = await db.user.findUnique({ where: { id: data.user.id } })
    if (!user && data.user.email) {
      user = await bootstrapPublicUser({
        id: data.user.id,
        email: data.user.email,
        metadata: (data.user.user_metadata as Record<string, unknown> | undefined) ?? null,
      })
    }
    if (!user || !user.isActive || user.deletedAt) return null
    return user
  } catch {
    return null
  }
}

export function requireAuth(handler: AuthedHandler): Handler {
  return async (req, ctx) => {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return handler(req, ctx, user)
  }
}

export function requireRole(role: string | string[], handler: AuthedHandler): Handler {
  return requireAuth(async (req, ctx, user) => {
    const roles = Array.isArray(role) ? role : [role]
    if (!roles.includes(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    return handler(req, ctx, user)
  })
}

export const requireHouseSit = (handler: AuthedHandler) => requireRole('house_sit', handler)
export const requireHouseSitter = (handler: AuthedHandler) => requireRole('house_sitter', handler)
export const requireAdmin = (handler: AuthedHandler) => requireRole('admin', handler)
export const requireHouseSitOrHouseSitter = (handler: AuthedHandler) => requireRole(['house_sit', 'house_sitter'], handler)
