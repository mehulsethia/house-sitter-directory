'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { NotificationBell } from '@/components/notification-bell'
import { useRouter } from 'next/navigation'

interface NavLink {
  href: string
  label: string
}

interface NavBarProps {
  links: NavLink[]
}

export function NavBar({ links }: NavBarProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex items-center justify-between border-b border-[#ece6e0] bg-white px-6 py-3">
      <Link href="/" className="inline-flex items-center">
        <Image src="/branding/logo.png" alt="The House Sitter Directory" width={220} height={66} className="h-8 w-auto" />
      </Link>

      <nav className="flex items-center gap-6">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm text-[#6b6b6b] hover:text-[#5a4a3b]">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {userId && <NotificationBell userId={userId} />}
        <button
          onClick={signOut}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[#6b6b6b] transition-colors hover:bg-[#f5f1ec] hover:text-[#1a1a1a]"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
