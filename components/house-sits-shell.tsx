'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid,
  Users,
  CalendarDays,
  MessagesSquare,
  Bell,
  User,
  Flag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { clearAuthCache } from '@/lib/auth-cache'
import { clearApiCache } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useCounts } from '@/hooks/use-counts'
import { SidebarProfile } from '@/components/sidebar-profile'

const NAV_ITEMS = [
  { href: '/house-sits/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/house-sits/house-sitters', label: 'Sitters', icon: Users },
  { href: '/house-sits/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/house-sits/chats', label: 'Messages', icon: MessagesSquare },
  { href: '/house-sits/notifications', label: 'Notifications', icon: Bell },
  { href: '/house-sits/report', label: 'Report', icon: Flag },
  { href: '/house-sits/profile', label: 'Profile', icon: User },
]

export function HouseSitsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const { data: counts } = useCounts()

  function getBadge(href: string): number {
    if (!counts) return 0
    if (href === '/house-sits/chats') return counts.unread_chats
    if (href === '/house-sits/bookings') return counts.pending_bookings
    if (href === '/house-sits/notifications') return counts.unread_notifications
    return 0
  }

  async function handleLogout() {
    clearAuthCache()
    clearApiCache()
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f3f3] text-slate-900 lg:pl-72">
      <div className="mx-auto max-w-[1500px]">
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r lg:border-[#e7dfd6] lg:bg-white lg:px-5 lg:py-6">
          <Link href="/house-sits/dashboard" className="mb-8 inline-flex items-center gap-2.5">
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
                      : 'text-[#5f6368] hover:bg-[#f7f2ed] hover:text-[#3a322a]',
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

          <SidebarProfile profileHref="/house-sits/profile" role="client" />
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#e7dfd6] bg-white px-3 py-3 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <Link href="/house-sits/dashboard" className="inline-flex items-center gap-2">
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
                      'relative inline-flex min-w-[86px] shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors',
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

          <main className="internal-app-shell app-shell-main mx-auto w-full max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
