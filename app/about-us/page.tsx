import Link from 'next/link'
import { CheckCircle2, Heart, Shield, Sparkles, Users } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'

const values = [
  {
    icon: Shield,
    title: 'Trustworthy',
    text: 'Everything starts with trust. We verify every sitter and homeowner properly so people can connect with confidence and peace of mind.',
  },
  {
    icon: Users,
    title: 'Safety',
    text: 'Homes, pets, and people deserve to feel safe. Our checks, standards, and insurance are designed to protect everyone involved.',
  },
  {
    icon: Heart,
    title: 'Caring',
    text: 'We believe in caring for homes and pets as if they were our own. Kindness, respect, and responsibility guide every interaction.',
  },
  {
    icon: Sparkles,
    title: 'Community',
    text: 'We are building a supportive, welcoming network where sitters and homeowners feel valued, respected, and connected.',
  },
]

const apart = [
  'Genuine verification you can trust',
  'A safer, more secure experience',
  'A community built on care',
  'Clear, transparent standards',
  'Support when you need it',
  'Quality over quantity',
]

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#1a1a1a]">
      <LandingHeader />

      <section className="bg-[#f3f3f3] pb-10 pt-14">
        <div className="max-site-width text-center">
          <h1 className="text-[62px] leading-tight md:text-[68px]">About The House Sitter Directory</h1>
          <p className="mx-auto mt-3 max-w-3xl text-[18px] text-[#6b6b6b]">
            We&apos;re building the most trusted platform for homeowners and house sitters to connect, creating peace of mind for travellers and opportunities for reliable caretakers.
          </p>
        </div>
      </section>

      <section className="bg-[#f3f3f3] pt-0">
        <div className="max-site-width max-w-[980px]">
          <h2 className="text-[42px]">Our Story</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-8 text-[#5f5f5f]">
            <p>
              The House Sitter Directory began in 2024 as a small, trusted community created after we experienced the shortcomings of other house sitting platforms. Many platforms claimed to verify users, but the checks were often incomplete or unclear.
            </p>
            <p>
              We saw real problems: sitters joining with little accountability, homeowners accepting incomplete profiles, and people arriving not knowing who they had invited into their homes. Everyone lost confidence.
            </p>
            <p>
              We built this platform to fix that. Every sitter and homeowner should feel protected by transparent standards, strong verification, and clear communication from the start.
            </p>
            <p>
              Today, we combine rigorous verification, clear trust levels, insurance-backed protection, and a modern platform to make house sitting safer for both sides.
            </p>
          </div>

          <div className="mt-8 rounded-[8px] border border-[#e2d9cf] bg-[#f7f3ef] p-6">
            <h3 className="text-[34px]">Our Mission</h3>
            <p className="mt-2 text-[15px] leading-8 text-[#5f5f5f]">
              To create the safest, most trusted house sitting community by ensuring every sitter and homeowner is genuinely verified, transparently tiered, and supported by clear standards, meaningful protection, and accountability.
            </p>
            <h3 className="mt-5 text-[34px]">Our Vision</h3>
            <p className="mt-2 text-[15px] leading-8 text-[#5f5f5f]">
              To become the UK&apos;s leading trusted house sitting platform where homeowners travel with complete confidence and sitters build meaningful opportunities through transparent verification and genuine trust.
            </p>
          </div>

          <h2 className="mt-10 text-[42px]">Our Values</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {values.map((value) => (
              <article key={value.title} className="rounded-[8px] border border-[#e4dbd1] bg-white p-5">
                <value.icon className="h-5 w-5 text-[#5a4a3b]" />
                <h3 className="mt-2 text-[28px]">{value.title}</h3>
                <p className="mt-2 text-[14px] leading-7 text-[#666]">{value.text}</p>
              </article>
            ))}
          </div>

          <h2 className="mt-10 text-[42px]">What Sets Us Apart</h2>
          <ul className="mt-4 space-y-3">
            {apart.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[15px] text-[#5f5f5f]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#5a4a3b]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-[42px]">Our Team</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-8 text-[#5f5f5f]">
            <p>
              The House Sitter Directory was born from real experience. We saw how inconsistent verification, unclear standards, and a lack of accountability could leave both homeowners and sitters exposed.
            </p>
            <p>
              We are a team of technologists, pet lovers, and travel enthusiasts who believe safe, caring house sitting should be simple and trusted for everyone.
            </p>
            <p>
              Our promise is simple: build the most trusted, transparent, and caring house sitting community in the UK.
            </p>
          </div>

          <div className="mt-10 rounded-[8px] bg-[#5a4a3b] px-6 py-8 text-center text-white">
            <h3 className="text-[42px] text-white">Join Our Community</h3>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] text-white/90">
              Whether you&apos;re a homeowner looking for reliable care or a house sitter seeking new opportunities, we&apos;d love to have you as part of our trusted community.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link href="/signup" className="inline-flex h-10 items-center rounded-[4px] bg-white px-5 text-[13px] text-[#5a4a3b]">Join Now</Link>
              <Link href="/terms-and-conditions" className="inline-flex h-10 items-center rounded-[4px] border border-white px-5 text-[13px] text-white">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
