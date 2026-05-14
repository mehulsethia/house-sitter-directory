'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, CalendarDays, MessagesSquare, Bell, User, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { clearAuthCache } from '@/lib/auth-cache'
import { clearApiCache, houseSittersApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useCounts } from '@/hooks/use-counts'
import { SidebarProfile } from '@/components/sidebar-profile'

const NAV_ITEMS = [
  { href: '/house-sitters/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/house-sitters/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/house-sitters/chats', label: 'Messages', icon: MessagesSquare },
  { href: '/house-sitters/notifications', label: 'Notifications', icon: Bell },
  { href: '/house-sitters/report', label: 'Report', icon: Flag },
  { href: '/house-sitters/profile', label: 'Profile', icon: User },
]


function houseSitterStageCopy(pathname: string) {
  if (pathname.startsWith('/house-sitters/dashboard')) {
    return {
      tag: 'The House Sitter Directory House Sitter Hub',
      title: 'House Sitter Dashboard',
      desc: 'Track sits, manage requests, and run your house sitter profile from one focused workspace.',
      image: '/images/stage/cleaner-dashboard.jpg',
    }
  }
  if (pathname.startsWith('/house-sitters/bookings')) {
    return {
      tag: 'The House Sitter Directory House Sitter Sits',
      title: 'House Sitter Bookings',
      desc: 'Review every booking, update status, and keep delivery consistent.',
      image: '/images/stage/cleaner-bookings.jpg',
    }
  }
  if (pathname.startsWith('/house-sitters/chats')) {
    return {
      tag: 'The House Sitter Directory Conversations',
      title: 'Messages',
      desc: 'Coordinate directly with house sit hosts and keep context tied to each sit.',
      image: '/images/stage/cleaner-chats.jpg',
    }
  }
  if (pathname.startsWith('/house-sitters/report')) {
    return {
      tag: 'The House Sitter Directory Resolution Desk',
      title: 'Report Issues',
      desc: 'Report no-shows, access problems, safety concerns, and disputes for admin review.',
      image: '/images/stage/cleaner-default.jpg',
    }
  }
  if (pathname.startsWith('/house-sitters/notifications')) {
    return {
      tag: 'The House Sitter Directory Updates',
      title: 'House Sitter Notifications',
      desc: 'Track booking actions, payouts, disputes, and account alerts in one timeline.',
      image: '/images/stage/cleaner-default.jpg',
    }
  }
  if (pathname.startsWith('/house-sitters/profile')) {
    return {
      tag: 'The House Sitter Directory House Sitter Identity',
      title: 'House Sitter Profile',
      desc: 'Present your experience, rates, and availability with a clear professional profile.',
      image: '/images/stage/cleaner-profile.jpg',
    }
  }
  if (pathname.startsWith('/house-sitters/availability')) {
    return {
      tag: 'The House Sitter Directory Schedule Control',
      title: 'Availability',
      desc: 'Shape your schedule and block times with precision.',
      image: '/images/stage/cleaner-availability.jpg',
    }
  }
  if (pathname.startsWith('/house-sitters/earnings')) {
    return {
      tag: 'The House Sitter Directory Earnings',
      title: 'Payouts & Earnings',
      desc: 'Monitor completed payouts and performance trends over time.',
      image: '/images/stage/cleaner-earnings.jpg',
    }
  }
  if (pathname.startsWith('/house-sitters/onboarding')) {
    return {
      tag: 'The House Sitter Directory Onboarding',
      title: 'House Sitter Onboarding',
      desc: 'Complete your setup and move into live booking mode.',
      image: '/images/stage/cleaner-onboarding.jpg',
    }
  }
  return {
    tag: 'The House Sitter Directory House Sitter',
    title: 'House Sitter Workspace',
    desc: 'Manage all house sitter operations in one place.',
    image: '/images/stage/cleaner-default.jpg',
  }
}

export function HouseSittersShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isOnboardingRoute = pathname === '/house-sitters/onboarding'
  const hideShellBanner = pathname.startsWith('/house-sitters/report') || pathname.startsWith('/house-sitters/dashboard')
  const [gateChecked, setGateChecked] = useState(false)
  const stage = houseSitterStageCopy(pathname)

  useEffect(() => {
    let mounted = true

    async function runGate() {
      if (isOnboardingRoute) {
        if (mounted) setGateChecked(true)
        return
      }

      try {
        const me = await houseSittersApi.me()
        const completion = me.data?.onboarding?.completion_pct ?? 0
        if (completion < 100) {
          router.replace('/house-sitters/onboarding')
          return
        }
      } catch {
        // If gate check fails, keep current route behavior and let page-level auth handle it.
      } finally {
        if (mounted) setGateChecked(true)
      }
    }

    runGate()
    return () => {
      mounted = false
    }
  }, [isOnboardingRoute, router])

  useEffect(() => {
    for (const item of NAV_ITEMS) {
      router.prefetch(item.href)
    }
  }, [router])

  const { data: counts } = useCounts()

  function getBadge(href: string): number {
    if (!counts) return 0
    if (href === '/house-sitters/chats') return counts.unread_chats
    if (href === '/house-sitters/bookings') return counts.pending_bookings
    if (href === '/house-sitters/notifications') return counts.unread_notifications
    return 0
  }

  async function handleLogout() {
    clearAuthCache()
    clearApiCache()
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isOnboardingRoute) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] px-3 py-3 sm:px-4 md:px-8 md:py-4">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <section className="houseSitter-stage overflow-hidden rounded-[2rem] border border-slate-200/70 py-0">
            <div className="houseSitter-stage__media" aria-hidden="true" />
            <div className="houseSitter-stage__grain" aria-hidden="true" />
            <div className="relative z-10 onboarding-stage-content px-5 sm:px-6 text-center">
              <p className={`text-[0.7rem] uppercase tracking-[0.24em] text-white/75`}>
                {stage.tag}
              </p>
              <h1 className={`mt-0.5 text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl`}>
                {stage.title}
              </h1>
              <p className="mt-1 mx-auto max-w-2xl text-sm text-slate-100/90 sm:text-base">{stage.desc}</p>
            </div>
          </section>
          <div>{children}</div>
        </div>
        <style jsx>{`
          .houseSitter-stage {
            position: relative;
            isolation: isolate;
            background: linear-gradient(125deg, #3f3429 12%, #5a4a3b 58%, #6c5947 100%);
          }

          .houseSitter-stage__media {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(105deg, rgba(33, 24, 17, 0.84) 8%, rgba(46, 34, 24, 0.72) 54%, rgba(64, 46, 33, 0.84) 100%),
              radial-gradient(circle at 80% 18%, rgba(255, 236, 214, 0.16), transparent 34%);
            background-size: cover;
            background-position: center;
            opacity: 0.96;
          }

          .houseSitter-stage__grain {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(90deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0) 45%),
              radial-gradient(circle at 20% 28%, rgba(255, 240, 225, 0.14), transparent 28%),
              radial-gradient(circle at 82% 12%, rgba(255, 216, 168, 0.14), transparent 22%);
            animation: houseSitter-sweep 11s ease-in-out infinite;
            pointer-events: none;
          }

          @keyframes houseSitter-sweep {
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

  if (!gateChecked) {
    return (
      <div className="min-h-screen bg-slate-50" />
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f3f3] text-slate-900 lg:pl-72">
      <div className="mx-auto max-w-[1500px]">
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r lg:border-[#e7dfd6] lg:bg-white lg:px-5 lg:py-6">
          <Link href="/house-sitters/dashboard" className="mb-8 inline-flex items-center gap-2.5">
            <Image src="/branding/logo.png" alt="The House Sitter Directory" width={240} height={66} className="h-10 w-auto" />
          </Link>
          <div className="mb-5 border-t border-[#ece4db]" />

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                    active
                      ? 'bg-[#5a4a3b] text-white shadow-inner'
                      : 'text-[#5f6368] hover:bg-[#6b5745] hover:text-white',
                  )}
                >
                  <Icon className={cn('h-4 w-4', active && 'scale-105')} />
                  {item.label}
                  {(() => {
                    const badge = getBadge(item.href)
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

          <SidebarProfile profileHref="/house-sitters/profile" role="house_sitter" />
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#e7dfd6] bg-white px-3 py-3 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <Link href="/house-sitters/dashboard" className="inline-flex items-center gap-2">
                <Image src="/branding/logo.png" alt="The House Sitter Directory" width={160} height={44} className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600"
              >
                Log out
              </button>
            </div>
            <nav className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative inline-flex min-w-[82px] shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold',
                      active ? 'bg-[#5a4a3b] text-white' : 'bg-[#f3ece5] text-[#5f6368]',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                    {(() => {
                      const badge = getBadge(item.href)
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

          <main className="internal-app-shell app-shell-main mx-auto w-full max-w-[1240px] space-y-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            {!hideShellBanner && (
              <section className="houseSitter-stage overflow-hidden rounded-[2rem] border border-slate-200/70">
                <div className="houseSitter-stage__media" aria-hidden="true" />
                <div className="houseSitter-stage__grain" aria-hidden="true" />
                <div className="relative z-10 px-5 py-3 sm:px-6 sm:py-3">
                  <p className={`text-[0.7rem] uppercase tracking-[0.24em] text-white/75`}>
                    {stage.tag}
                  </p>
                  <h1 className={`mt-1.5 text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl`}>
                    {stage.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-100/90 sm:text-base">{stage.desc}</p>
                </div>
              </section>
            )}
            <div>{children}</div>
          </main>
        </div>
      </div>

      <style jsx>{`
        .houseSitter-stage {
          position: relative;
          isolation: isolate;
          background: linear-gradient(125deg, #3f3429 12%, #5a4a3b 58%, #6c5947 100%);
        }

        .houseSitter-stage__media {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(105deg, rgba(33, 24, 17, 0.84) 8%, rgba(46, 34, 24, 0.72) 54%, rgba(64, 46, 33, 0.84) 100%),
            radial-gradient(circle at 80% 18%, rgba(255, 236, 214, 0.16), transparent 34%);
          background-size: cover;
          background-position: center;
          opacity: 0.96;
        }

        .houseSitter-stage__grain {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(90deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0) 45%),
            radial-gradient(circle at 20% 28%, rgba(255, 240, 225, 0.14), transparent 28%),
            radial-gradient(circle at 82% 12%, rgba(255, 216, 168, 0.14), transparent 22%);
          animation: houseSitter-sweep 11s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes houseSitter-sweep {
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
