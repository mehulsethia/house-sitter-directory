import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'

const BENEFITS = [
  'Build a trusted profile visible to homeowners.',
  'Set your availability and preferred sitting locations.',
  'Connect directly with homeowners and confirm sits confidently.',
  'Grow with verified reviews and repeat opportunities.',
]

export default function SitterInfoPage() {
  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <LandingHeader />

      <section className="bg-[#f9f6f3]">
        <div className="max-site-width grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#5a4a3b]">House Sitter Info</p>
            <h1 className="mt-3 text-5xl">Grow your house sitting profile with confidence</h1>
            <p className="mt-4 max-w-xl text-[#6b6b6b]">
              Join The House Sitter Directory and connect with homeowners looking for reliable, caring support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup?role=cleaner" className="inline-flex h-11 items-center rounded-[4px] bg-[#5a4a3b] px-5 text-white">
                Become a Sitter
              </Link>
              <Link href="/find-house-sitters" className="inline-flex h-11 items-center rounded-[4px] border border-[#5a4a3b] px-5 text-[#5a4a3b]">
                Browse Sitters
              </Link>
            </div>
          </div>

          <div className="brand-card rounded-[8px] border border-[#efe9e3] bg-white p-6">
            <h2 className="text-3xl">Why sitters join</h2>
            <ul className="mt-4 space-y-3">
              {BENEFITS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[#6b6b6b]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#5a4a3b]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-site-width text-center">
          <h2 className="text-4xl">How It Works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="brand-card rounded-[8px] border border-[#efe9e3] p-5">
              <h3 className="text-2xl">1. Create your profile</h3>
              <p className="mt-2 text-sm text-[#6b6b6b]">Share your experience, preferences, and availability.</p>
            </div>
            <div className="brand-card rounded-[8px] border border-[#efe9e3] p-5">
              <h3 className="text-2xl">2. Connect with homeowners</h3>
              <p className="mt-2 text-sm text-[#6b6b6b]">Respond to opportunities that match your location and style.</p>
            </div>
            <div className="brand-card rounded-[8px] border border-[#efe9e3] p-5">
              <h3 className="text-2xl">3. Confirm and support</h3>
              <p className="mt-2 text-sm text-[#6b6b6b]">Agree details directly and provide trusted home care.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
