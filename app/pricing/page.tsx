import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#1a1a1a]">
      <LandingHeader />
      <section>
        <div className="max-site-width text-center">
          <h1 className="text-[64px] leading-tight md:text-[68px]">Simple, Transparent Pricing</h1>
          <p className="mx-auto mt-3 max-w-2xl text-[16px] text-[#6b6b6b]">
            The House Sitter Directory applies a straightforward platform fee while keeping booking costs clear for everyone.
          </p>

          <div className="mx-auto mt-8 max-w-[680px] rounded-[8px] border border-[#e3d9ce] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            <p className="text-[14px] uppercase tracking-[0.18em] text-[#5a4a3b]">Platform Fee</p>
            <p className="mt-3 text-[72px] leading-none">10%</p>
            <p className="mt-3 text-[14px] text-[#6b6b6b]">Applied clearly during booking checkout. No hidden fees.</p>
            <Link href="/signup" className="mt-6 inline-flex h-10 items-center rounded-[4px] bg-[#5a4a3b] px-5 text-[13px] text-white">
              Join Now
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
