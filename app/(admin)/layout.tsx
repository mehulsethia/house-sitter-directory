'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Bell,
  BookOpen,
  Eye,
  EyeOff,
  LogOut,
  MessageSquareWarning,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useCounts } from '@/hooks/use-counts'

const NAV = [
  { href: '/admin/dashboard', label: 'Overview',  icon: BarChart3 },
  { href: '/admin/house-sitters',  label: 'House Sitters',  icon: ShieldCheck },
  { href: '/admin/bookings',  label: 'Bookings',  icon: BookOpen },
  { href: '/admin/disputes',  label: 'Disputes',  icon: MessageSquareWarning },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/users',     label: 'Users',     icon: Users },
]


function adminStageCopy(pathname: string) {
  if (pathname.startsWith('/admin/dashboard')) {
    return {
      tag: 'The House Sitter Directory Admin Console',
      title: 'Platform Overview',
      desc: 'Monitor platform health, revenue, and operational signals in real time.',
      image: '/images/stage/admin-dashboard.jpg',
    }
  }
  if (pathname.startsWith('/admin/house-sitters')) {
    return {
      tag: 'The House Sitter Directory Admin Console',
      title: 'House Sitter Operations',
      desc: 'Review onboarding quality, approvals, and houseSitter account status.',
      image: '/images/stage/admin-cleaners.jpg',
    }
  }
  if (pathname.startsWith('/admin/bookings')) {
    return {
      tag: 'The House Sitter Directory Admin Console',
      title: 'Booking Operations',
      desc: 'Inspect booking flow, statuses, and edge-case interventions.',
      image: '/images/stage/admin-bookings.jpg',
    }
  }
  if (pathname.startsWith('/admin/disputes')) {
    return {
      tag: 'The House Sitter Directory Admin Console',
      title: 'Dispute Resolution',
      desc: 'Triages active disputes and apply structured resolution outcomes.',
      image: '/images/stage/admin-disputes.jpg',
    }
  }
  if (pathname.startsWith('/admin/users')) {
    return {
      tag: 'The House Sitter Directory Admin Console',
      title: 'User Management',
      desc: 'Audit user accounts, access controls, and account activity.',
      image: '/images/stage/admin-users.jpg',
    }
  }
  if (pathname.startsWith('/admin/notifications')) {
    return {
      tag: 'The House Sitter Directory Admin Console',
      title: 'Notifications',
      desc: 'Monitor system alerts, disputes, payouts, and operational events in real time.',
      image: '/images/stage/admin-default.jpg',
    }
  }
  return {
    tag: 'The House Sitter Directory Admin Console',
    title: 'Administration',
    desc: 'Control and monitor platform operations from one command surface.',
    image: '/images/stage/admin-default.jpg',
  }
}

type AuthState = 'loading' | 'login' | 'authed'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const stage = adminStageCopy(pathname)
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const { data: counts } = useCounts()

  function getBadge(href: string): number {
    if (!counts) return 0
    if (href === '/admin/notifications') return counts.unread_notifications
    return 0
  }

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    setAuthState('loading')
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()

    if (!data.session) {
      setAuthState('login')
      return
    }

    const res = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    }).then(r => r.json()).catch(() => null)

    if (res?.data?.role === 'admin') {
      setAuthState('authed')
    } else {
      // Signed in but not admin — sign out of this session and show login
      await supabase.auth.signOut()
      setAuthState('login')
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Invalid credentials.')
      setLoginLoading(false)
      return
    }

    // Verify admin role
    const { data } = await supabase.auth.getSession()
    const res = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${data.session!.access_token}` },
    }).then(r => r.json()).catch(() => null)

    if (res?.data?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      await supabase.auth.signOut()
      setLoginLoading(false)
      return
    }

    setAuthState('authed')
    setLoginLoading(false)
    router.push('/admin/dashboard')
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuthState('login')
    setEmail('')
    setPassword('')
  }

  // Loading spinner
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Admin login screen
  if (authState === 'login') {
    return (
      <div className="relative min-h-screen bg-[#f3f3f3] px-4 py-8">
        <div className="admin-stage-bg" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-sm">
          <section className="admin-stage overflow-hidden rounded-[2rem] border border-slate-200/70">
            <div className="admin-stage__media" aria-hidden="true" />
            <div className="admin-stage__grain" aria-hidden="true" />
            <div className="relative z-10 px-5 py-4 text-white">
              <p className={`text-[0.7rem] uppercase tracking-[0.24em] text-white/75`}>
                The House Sitter Directory Admin Console
              </p>
              <p className="mt-2 text-sm text-slate-100/90">Sign in with authorized admin credentials to continue.</p>
            </div>
          </section>

          <form onSubmit={handleLogin} className="mt-5 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_45px_rgba(11,33,78,0.08)] backdrop-blur-sm">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 pr-11 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-lg bg-[#5a4a3b] py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#6b5745] disabled:opacity-50"
              >
                {loginLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            This area is restricted to authorized administrators.
          </p>
        </div>

        <style jsx>{`
          .admin-stage-bg {
            position: absolute;
            inset: 0;
            background-image:
              radial-gradient(circle at 14% 0%, rgba(133, 94, 66, 0.1), transparent 32%),
              radial-gradient(circle at 100% 8%, rgba(107, 87, 69, 0.08), transparent 28%),
              linear-gradient(180deg, #f6f1eb 0%, #f7f3ef 42%, #f8f5f1 100%);
          }
        `}</style>
      </div>
    )
  }

  // Authenticated admin — full layout
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f3f3] lg:pl-60">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-[#e7dfd6] lg:bg-white">
        <div className="px-6 py-5">
          <Link href="/admin/dashboard" className="inline-flex">
            <Image src="/branding/logo.png" alt="The House Sitter Directory" width={200} height={54} className="h-9 w-auto" />
          </Link>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">
            Admin console
          </p>
        </div>
        <div className="mx-6 mb-2 border-t border-[#ece4db]" />

        <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-[#5a4a3b] text-white font-medium'
                      : 'text-[#5f6368] hover:text-[#3a322a] hover:bg-[#f7f2ed]',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                  {(() => {
                    const badge = getBadge(href)
                    return badge > 0 ? (
                      <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    ) : null
                  })()}
                </Link>
              )
          })}
        </nav>

        <div className="px-3 py-4 border-t">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-[#e7dfd6] bg-white px-3 py-3 lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <Link href="/admin/dashboard" className="inline-flex">
            <Image src="/branding/logo.png" alt="The House Sitter Directory" width={160} height={44} className="h-8 w-auto" />
          </Link>
          <button
            onClick={signOut}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600"
          >
            Sign out
          </button>
        </div>
        <nav className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-[#5a4a3b] text-white'
                    : 'bg-[#f3ece5] text-[#5f6368] hover:bg-[#efe6dd]',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {(() => {
                  const badge = getBadge(href)
                  return badge > 0 ? (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  ) : null
                })()}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="internal-app-shell app-shell-main px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="internal-page min-w-0 space-y-6">
          <section className="admin-stage overflow-hidden rounded-[2rem] border border-slate-200/70">
            <div className="admin-stage__media" aria-hidden="true" />
            <div className="admin-stage__grain" aria-hidden="true" />
            <div className="relative z-10 px-5 py-4 sm:px-6 sm:py-4">
              <p className={`text-[0.7rem] uppercase tracking-[0.24em] text-white/75`}>
                {stage.tag}
              </p>
              <h1 className={`mt-2 text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl`}>
                {stage.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-100/90 sm:text-base">{stage.desc}</p>
            </div>
          </section>
          <div className="internal-page">{children}</div>
        </div>
      </main>

      <style jsx>{`
        .admin-stage {
          position: relative;
          isolation: isolate;
            background: linear-gradient(125deg, #3f3429 12%, #5a4a3b 58%, #6c5947 100%);
        }

        .admin-stage__media {
          position: absolute;
          inset: 0;
            background-image:
              linear-gradient(105deg, rgba(33, 24, 17, 0.84) 8%, rgba(46, 34, 24, 0.72) 54%, rgba(64, 46, 33, 0.84) 100%),
              radial-gradient(circle at 80% 18%, rgba(255, 236, 214, 0.16), transparent 34%);
          background-size: cover;
          background-position: center;
          mix-blend-mode: screen;
          opacity: 0.82;
        }

        .admin-stage__grain {
          position: absolute;
          inset: 0;
            background-image:
              linear-gradient(90deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0) 45%),
              radial-gradient(circle at 20% 28%, rgba(255, 240, 225, 0.14), transparent 28%),
              radial-gradient(circle at 82% 12%, rgba(255, 216, 168, 0.14), transparent 22%);
          animation: admin-sweep 11s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes admin-sweep {
          0%,
          100% {
            transform: translateX(0%);
            opacity: 1;
          }
          50% {
            transform: translateX(1.6%);
            opacity: 0.88;
          }
        }
      `}</style>
    </div>
  )
}
