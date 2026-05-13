import Image from 'next/image'
import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="max-site-width py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/branding/logo.png"
                alt="The House Sitter Directory"
                width={320}
                height={96}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-3 max-w-sm text-sm text-[#d4d4d4]">Your Home, Lovingly Cared For</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="#" aria-label="Twitter" className="rounded-full border border-white/20 p-2 text-white/90 hover:text-white">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Instagram" className="rounded-full border border-white/20 p-2 text-white/90 hover:text-white">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Facebook" className="rounded-full border border-white/20 p-2 text-white/90 hover:text-white">
                <Facebook className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <FooterColumn
            title="Platform"
            links={[
              ['Find House Sitters', '/client/cleaners'],
              ['Find House Sits', '/client/bookings'],
              ['How It Works', '/#how-it-works'],
              ['Pricing', '/#pricing'],
            ]}
          />
          <FooterColumn
            title="Sitters"
            links={[
              ['Create Profile', '/signup?role=cleaner'],
              ['Browse Sits', '/client/bookings'],
              ['Sitter Resources', '/for-cleaners'],
              ['Success Stories', '/blog'],
            ]}
          />
          <FooterColumn
            title="Support"
            links={[
              ['Help Center', '/faq'],
              ['Contact Us', '/contact'],
              ['Safety', '/responsible-disclosure-policy'],
              ['Trust & Verification', '/terms-and-conditions'],
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              ['About Us', '/about'],
              ['Blog', '/blog'],
              ['Press', '/press'],
              ['Careers', '/careers'],
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-[#b5b5b5] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2024 The House Sitter Directory. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-3 text-sm text-white">{title}</p>
      <ul className="space-y-2 text-sm text-[#d4d4d4]">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
