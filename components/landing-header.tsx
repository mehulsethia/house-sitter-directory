'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/client/cleaners', label: 'Find a House Sitter' },
  { href: '/for-cleaners', label: 'House Sitter Info' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
]

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#ece6e0] bg-white/95 backdrop-blur">
      <div className="max-site-width flex h-20 items-center justify-between gap-6">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/branding/logo.png"
            alt="The House Sitter Directory"
            width={320}
            height={96}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="text-[14px] text-[#1a1a1a] hover:text-[#5a4a3b]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-[14px] text-[#1a1a1a] hover:text-[#5a4a3b]">
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center rounded-[4px] bg-[#5a4a3b] px-5 text-[14px] font-medium text-white hover:opacity-95"
          >
            Start Now
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-[4px] border border-[#e0e0e0] p-2 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#ece6e0] bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-1 text-[14px] text-[#1a1a1a]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-[#ece6e0] pt-3">
              <Link href="/login" className="text-[14px] text-[#1a1a1a]">
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-[4px] bg-[#5a4a3b] px-4 text-[14px] text-white"
              >
                Start Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
