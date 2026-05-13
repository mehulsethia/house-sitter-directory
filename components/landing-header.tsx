'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/find-house-sitters', label: 'Find House Sitters' },
  { href: '/find-house-sits', label: 'Find House Sits' },
  { href: '/pricing', label: 'Pricing' },
]

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/pricing') return pathname === '/pricing'
    return pathname === href
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9e3de] bg-white">
      <div className="max-site-width flex h-[60px] items-center justify-between gap-6">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/branding/logo.png"
            alt="The House Sitter Directory"
            width={280}
            height={80}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex h-8 items-center rounded-[4px] px-3 text-[13px] transition ${
                isActive(item.href) ? 'bg-[#5a4a3b] text-white' : 'text-[#3d3d3d] hover:text-[#5a4a3b]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-[13px] text-[#3d3d3d] hover:text-[#5a4a3b]">
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-8 items-center rounded-[4px] bg-[#5a4a3b] px-4 text-[12px] text-white hover:opacity-95"
          >
            Join Now
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
                className={`rounded-[4px] px-2 py-1 text-[14px] ${
                  isActive(item.href) ? 'bg-[#5a4a3b] text-white' : 'text-[#1a1a1a]'
                }`}
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
                Join Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
