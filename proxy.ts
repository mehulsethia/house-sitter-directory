import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require a logged-in user
const PROTECTED_PREFIXES = ['/house-sit', '/house-sits', '/house-sitter', '/house-sitters', '/admin']
// Routes only for unauthenticated users
const AUTH_ROUTES = ['/login', '/signup', '/verify-email']

function normalizeRole(role: unknown): 'house_sit' | 'house_sitter' | 'admin' | null {
  if (role === 'admin') return 'admin'
  if (role === 'house_sitter' || role === 'house-sitter' || role === 'cleaner') return 'house_sitter'
  if (role === 'house_sit' || role === 'house-sit' || role === 'client') return 'house_sit'
  return null
}

function getPostLoginPath(user: { user_metadata?: Record<string, unknown> }) {
  const role = normalizeRole(user.user_metadata?.role) ?? 'house_sit'
  if (role === 'house_sitter') return '/house-sitter/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  return '/house-sit/dashboard'
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))
  const isApiRoute = pathname.startsWith('/api')

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const nextPath = `${pathname}${request.nextUrl.search}`
    url.searchParams.set('next', nextPath)
    return NextResponse.redirect(url)
  }

  // Prevent role mismatch: don't let users access another role's area
  if (isProtected && user) {
    const role = normalizeRole(user.user_metadata?.role)
    const isHouseSitRoute =
      pathname === '/house-sit' ||
      pathname.startsWith('/house-sit/') ||
      pathname === '/house-sits' ||
      pathname.startsWith('/house-sits/')
    const isHouseSitterRoute =
      pathname === '/house-sitter' ||
      pathname.startsWith('/house-sitter/') ||
      pathname === '/house-sitters' ||
      pathname.startsWith('/house-sitters/')
    if (
      (isHouseSitRoute && role === 'house_sitter') ||
      (isHouseSitterRoute && role === 'house_sit')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = getPostLoginPath(user)
      return NextResponse.redirect(url)
    }
  }

  if (isAuthRoute && user) {
    // Redirect logged-in users away from auth pages, preserving a safe `next` destination.
    const url = request.nextUrl.clone()
    const next = request.nextUrl.searchParams.get('next')
    url.pathname = next && next.startsWith('/') ? next : getPostLoginPath(user)
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Logged-in users should stay inside the app area only.
  // Landing/legal/static pages remain visible only after logout.
  const isAdminRoute = pathname.startsWith('/admin')
  if (isAdminRoute && user) {
    const role = normalizeRole(user.user_metadata?.role)
    if (role && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = getPostLoginPath(user)
      return NextResponse.redirect(url)
    }
  }

  if (user && !isProtected && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = getPostLoginPath(user)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)'],
}
