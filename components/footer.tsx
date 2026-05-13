import Image from 'next/image'
import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e2dc] bg-[#f8f8f8] text-[#1a1a1a]">
      <div className="max-site-width py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/branding/logo.png"
                alt="The House Sitter Directory"
                width={320}
                height={96}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-3 max-w-sm text-sm text-[#6b6b6b]">The most trusted platform for connecting homeowners with verified, reliable house sitters.</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="#" aria-label="Twitter" className="text-[#6b6b6b] hover:text-[#5a4a3b]">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-[#6b6b6b] hover:text-[#5a4a3b]">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Facebook" className="text-[#6b6b6b] hover:text-[#5a4a3b]">
                <Facebook className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <FooterColumn
            title="Platform"
            links={[
              ['Find Sitters', '/find-house-sitters'],
              ['Find House Sits', '/find-house-sits'],
              ['How It Works', '/#how-it-works'],
              ['Pricing', '/pricing'],
            ]}
          />
          <FooterColumn
            title="Sitters"
            links={[
              ['Create Profile', '/signup?role=cleaner'],
              ['Browse Sits', '/find-house-sits'],
              ['Sitter Resources', '/for-cleaners'],
              ['Success Stories', '/about-us'],
            ]}
          />
          <FooterColumn
            title="Support"
            links={[
              ['Help Center', '/terms-and-conditions'],
              ['Contact Us', '/about-us'],
              ['Safety', '/responsible-disclosure-policy'],
              ['Insurance', '/terms-and-conditions'],
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              ['About Us', '/about-us'],
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#e2d9cf] pt-6 text-xs text-[#8d8d8d] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 The House Sitter Directory. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-[#5a4a3b]">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-[#5a4a3b]">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#5a4a3b]">
              Cookie Policy
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
      <p className="mb-3 text-sm text-[#1a1a1a]">{title}</p>
      <ul className="space-y-2 text-sm text-[#6b6b6b]">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-[#5a4a3b]">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
