import Link from 'next/link'
import {
  Bath,
  BedDouble,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquare,
  PawPrint,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'
import { DatePickerInput } from '@/components/date-picker-input'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'
import { PUBLIC_HOUSE_SITS, PUBLIC_SITTERS } from '@/lib/public-marketplace-data'

export default function HomePage() {
  return (
    <main className="bg-white text-[#1a1a1a]">
      <LandingHeader />

      <section className="relative overflow-hidden py-0">
        <img
          src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=2200&q=80"
          alt="Relaxed home lifestyle"
          className="hero-bg absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(48,30,16,0.46)]" />
        <div className="max-site-width relative z-10 py-14 text-center text-white md:py-20">
          <p className="mx-auto inline-flex rounded-[6px] bg-[rgba(34,23,15,0.8)] px-4 py-1.5 text-[12px] md:text-[13px]">
            Trusted by 10,000+ Members
          </p>
          <h1 className="mt-5 text-[36px] leading-tight text-white sm:text-[44px] md:text-[62px]">Your Home, Lovingly Cared For</h1>
          <p className="mx-auto mt-3 max-w-3xl text-[16px] leading-relaxed text-white/95 md:text-[18px]">
            Connect with verified house sitters or find your perfect house sit
          </p>

          <div className="mx-auto mt-7 flex max-w-[540px] flex-col gap-2 rounded-[18px] border border-white/90 bg-[#f8f8f8] p-2 sm:flex-row sm:gap-0 sm:rounded-full sm:p-1">
            <Link
              href="/find-house-sitters"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-[14px] bg-[#5a4a3b] px-4 text-[18px] text-white sm:rounded-full sm:text-[20px]"
            >
              Find a Sitter
            </Link>
            <Link
              href="/find-house-sits"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-[14px] px-4 text-[18px] text-[#5a5a5a] sm:rounded-full sm:text-[20px]"
            >
              Find a House Sit
            </Link>
          </div>

          <form
            action="/find-house-sitters"
            method="get"
            className="mx-auto mt-7 max-w-[980px] rounded-[16px] bg-white p-3 text-left text-[#1a1a1a] shadow-[0_12px_34px_rgba(0,0,0,0.2)] md:p-4"
          >
            <div className="grid gap-3 md:grid-cols-3">
              <input
                name="location"
                placeholder="Where?"
                className="h-12 rounded-[8px] border border-[#e0e0e0] px-4 text-[15px]"
              />
              <DatePickerInput
                name="from"
                ariaLabel="From date"
                className="h-12 rounded-[8px] border border-[#e0e0e0] px-4 text-[15px]"
              />
              <DatePickerInput
                name="to"
                ariaLabel="To date"
                className="h-12 rounded-[8px] border border-[#e0e0e0] px-4 text-[15px]"
              />
            </div>
            <button type="submit" className="mt-3 h-12 w-full rounded-[10px] bg-[#5a4a3b] text-[16px] text-white">
              Search Sitters
            </button>
          </form>

          <p className="mt-6 text-[12px] text-white/95 md:text-[13px]">
            ✅ Background Checked &nbsp; • &nbsp; 🛡️ Fully Insured &nbsp; • &nbsp; 🐾 Pet Care Available
          </p>
        </div>
      </section>

      <section className="bg-[#5a4a3b] py-7">
        <div className="max-site-width grid gap-8 text-center text-white sm:grid-cols-2 lg:grid-cols-4">
          <Stat value="15,000+" label="Active Sitters" />
          <Stat value="25,000+" label="Verified Connections" />
          <Stat value="4.9/5" label="Average Rating" />
          <Stat value="98%" label="Satisfaction Rate" />
        </div>
      </section>

      <section className="bg-white">
        <div className="max-site-width text-center">
          <h2 className="text-[34px]">Why Choose Us?</h2>
          <p className="mt-2 text-[14px] text-[#6b6b6b]">You&apos;ve built the most trusted platform for house sitting.</p>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<CheckCircle2 className="h-5 w-5 text-[#5a4a3b]" />}
              title="Verified Sitters"
              desc="All our sitters go through thorough identity verification and background checks."
            />
            <Feature
              icon={<Star className="h-5 w-5 fill-[#5a4a3b] text-[#5a4a3b]" />}
              title="Trusted Reviews"
              desc="Real reviews from real homeowners to help you make informed decisions."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5 text-[#5a4a3b]" />}
              title="Insurance Included"
              desc="Comprehensive insurance included with every booking for complete peace of mind."
            />
            <Feature
              icon={<Clock3 className="h-5 w-5 text-[#5a4a3b]" />}
              title="24/7 Support"
              desc="Round-the-clock support whenever you need us, day or night."
            />
          </div>
        </div>
      </section>

      <section className="bg-[#f9f6f3]">
        <div className="max-site-width">
          <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-[30px]">Featured House Sitters</h2>
              <p className="mt-1 text-[14px] text-[#6b6b6b]">Connect with verified, skilled sitters</p>
            </div>
            <Link href="/find-house-sitters" className="text-[13px] text-[#5a4a3b]">
              View all →
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <button className="h-8 rounded-[999px] bg-[#5a4a3b] px-4 text-[12px] text-white">View All</button>
            <button className="h-8 rounded-[999px] border border-[#ddd2c8] bg-white px-4 text-[12px] text-[#5a4a3b]">Top Rated</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PUBLIC_SITTERS.map((sitter) => (
              <article key={sitter.id} className="brand-card overflow-hidden border border-[#e8e1da]">
                <div className="relative">
                  <img src={sitter.image} alt={sitter.name} className="h-[218px] w-full object-cover" />
                  <span className="absolute right-2 top-2 rounded bg-[#f1994f] px-2 py-1 text-[10px] text-white">Top Rated</span>
                </div>
                <div className="p-4">
                  <h3 className="text-[22px] leading-tight">{sitter.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                    <MapPin className="h-3.5 w-3.5" />
                    {sitter.location}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                    <Star className="h-3.5 w-3.5 fill-current text-[#f6b019]" />
                    {sitter.rating.toFixed(1)} ({sitter.reviews} reviews)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sitter.tags.map((tag) => (
                      <span key={tag} className="rounded bg-[#f4f0ec] px-2 py-1 text-[10px] text-[#5a4a3b]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/find-house-sitters/${sitter.id}`}
                    className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-[4px] bg-[#5a4a3b] text-[12px] text-white"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 text-right">
            <Link href="/find-house-sitters" className="text-[13px] text-[#5a4a3b]">
              View All Sitters →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-site-width">
          <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-[30px]">Featured House Sits</h2>
              <p className="mt-1 text-[14px] text-[#6b6b6b]">Explore our most popular listings for your perfect sit</p>
            </div>
            <Link href="/find-house-sits" className="text-[13px] text-[#5a4a3b]">
              View all →
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <button className="h-8 rounded-[999px] bg-[#5a4a3b] px-4 text-[12px] text-white">View All</button>
            <button className="h-8 rounded-[999px] border border-[#ddd2c8] bg-white px-4 text-[12px] text-[#5a4a3b]">Available</button>
            <button className="h-8 rounded-[999px] border border-[#ddd2c8] bg-white px-4 text-[12px] text-[#5a4a3b]">New</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PUBLIC_HOUSE_SITS.map((sit) => (
              <article key={sit.id} className="brand-card overflow-hidden border border-[#e8e1da]">
                <div className="relative">
                  <img src={sit.image} alt={sit.title} className="h-[185px] w-full object-cover" />
                  <span
                    className={`absolute right-2 top-2 rounded px-2 py-1 text-[10px] text-white ${
                      sit.badge === 'Urgent' ? 'bg-[#db4a40]' : 'bg-[#2d9852]'
                    }`}
                  >
                    {sit.badge}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[20px] leading-tight">{sit.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                    <MapPin className="h-3.5 w-3.5" />
                    {sit.location}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-3">
                    <span className="rounded bg-[#f4f0ec] px-2 py-1 text-[#5a4a3b]">
                      <BedDouble className="mr-1 inline h-3 w-3" />
                      {sit.beds} Beds
                    </span>
                    <span className="rounded bg-[#f4f0ec] px-2 py-1 text-[#5a4a3b]">
                      <Bath className="mr-1 inline h-3 w-3" />
                      {sit.baths} Baths
                    </span>
                    <span className="rounded bg-[#f4f0ec] px-2 py-1 text-[#5a4a3b]">
                      <PawPrint className="mr-1 inline h-3 w-3" />
                      {sit.pets}
                    </span>
                  </div>

                  <p className="mt-3 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                    <Star className="h-3.5 w-3.5 fill-current text-[#f6b019]" />
                    {sit.rating.toFixed(1)}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href={`/find-house-sits/${sit.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-[4px] border border-[#5a4a3b] text-[12px] text-[#5a4a3b]"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/login?next=${encodeURIComponent(`/find-house-sits/${sit.id}`)}`}
                      className="inline-flex h-9 items-center justify-center rounded-[4px] bg-[#5a4a3b] text-[12px] text-white"
                    >
                      <MessageSquare className="mr-1 inline h-3.5 w-3.5" />
                      Message
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 text-right">
            <Link href="/find-house-sits" className="text-[13px] text-[#5a4a3b]">
              View All Sits →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f9f6f3]">
        <div className="max-site-width text-center">
          <h2 className="text-[34px]">How It Works</h2>
          <p className="mx-auto mt-2 max-w-xl text-[14px] text-[#6b6b6b]">Simple steps to find trusted care for your home.</p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            <HowCard
              number="01"
              title="Create Your Profile"
              desc="Sign up and create a detailed profile showcasing your experience and preferences."
            />
            <HowCard
              number="02"
              title="Browse & Connect"
              desc="Search for house sits or sitters that match your requirements and location."
            />
            <HowCard
              number="03"
              title="Book with Confidence"
              desc="Communicate directly, arrange the details, and enjoy the peace of mind."
            />
          </div>
        </div>
      </section>

      <section className="bg-[#5a4a3b] py-16 text-center text-white">
        <div className="max-site-width">
          <h2 className="text-[36px] text-white">Ready to Get Started?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-[14px] text-white/90">
            Join thousands of homeowners and sitters who trust The House Sitter Directory.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/find-house-sitters"
              className="inline-flex h-9 items-center rounded-[4px] bg-[#5a4a3b] px-4 text-[12px] text-white ring-1 ring-white/80"
            >
              Find a Sitter
            </Link>
            <Link
              href="/signup?role=cleaner"
              className="inline-flex h-9 items-center rounded-[4px] border border-white bg-black px-4 text-[12px] text-white"
            >
              Become a Sitter
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <CookieConsentBanner />
    </main>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[34px] leading-none text-white">{value}</p>
      <p className="mt-2 text-[11px] text-white/90">{label}</p>
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: import("react").ReactNode; title: string; desc: string }) {
  return (
    <article className="rounded-[8px] border border-[#ece7e2] bg-[#faf9f8] p-5 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div>{icon}</div>
      <h3 className="mt-2 text-[20px]">{title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-[#666]">{desc}</p>
    </article>
  )
}

function HowCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <article>
      <p className="text-[56px] leading-none text-[#d7cdc2]">{number}</p>
      <h3 className="mt-3 text-[22px]">{title}</h3>
      <p className="mx-auto mt-2 max-w-[280px] text-[12px] leading-relaxed text-[#6b6b6b]">{desc}</p>
    </article>
  )
}
