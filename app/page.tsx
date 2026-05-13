import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, BedDouble, Bath, PawPrint } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'

const SITTERS = Array.from({ length: 9 }).map((_, idx) => ({
  id: idx + 1,
  name: ['Emma Carter', 'Noah Bennett', 'Sophie Lane', 'James Turner', 'Olivia Hayes', 'Luca Morgan', 'Mia Collins', 'Ethan Brooks', 'Ava Reed'][idx],
  location: ['London', 'Bristol', 'Manchester', 'Leeds', 'Edinburgh', 'Cardiff', 'Bath', 'York', 'Brighton'][idx],
  rating: ['4.9', '4.8', '4.9', '4.7', '5.0', '4.8', '4.9', '4.8', '4.9'][idx],
  reviews: [182, 140, 205, 96, 134, 121, 164, 109, 177][idx],
  tags: [
    ['Dog Sitting', 'Long Term', 'Experienced'],
    ['Pet Friendly', 'House Security', 'Trusted'],
    ['Cat Care', 'Verified', 'Top Rated'],
    ['Plant Care', 'Long Term', 'Verified'],
    ['Senior Homes', 'Pet Friendly', 'Experienced'],
    ['Family Homes', 'Top Rated', 'Verified'],
    ['Dog Sitting', 'Plant Care', 'Trusted'],
    ['Long Term', 'Verified', 'Experienced'],
    ['Pet Friendly', 'Top Rated', 'Calm'],
  ][idx],
}))

const SITS = Array.from({ length: 6 }).map((_, idx) => ({
  id: idx + 1,
  title: ['Riverside Family Home', 'Cotswold Cottage Retreat', 'Modern Townhouse', 'Seaside Villa', 'Country Barn House', 'Central Apartment'][idx],
  location: ['Oxford', 'Gloucester', 'London', 'Brighton', 'Somerset', 'Birmingham'][idx],
  beds: [3, 2, 4, 5, 3, 2][idx],
  baths: [2, 1, 3, 3, 2, 1][idx],
  pets: ['2 Dogs', '1 Cat', 'None', '1 Dog', '2 Cats', '1 Dog'][idx],
  rating: ['4.9', '4.8', '4.9', '5.0', '4.8', '4.7'][idx],
  status: idx % 2 === 0 ? 'Available' : 'NEW',
}))

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <LandingHeader />

      <section className="relative overflow-hidden bg-[#f9f6f3] pt-16">
        <div className="hero-bg absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

        <div className="max-site-width relative z-10 pb-16 text-white">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm">Trusted by 5000+ Members</p>
            <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">Your Home, Lovingly Cared For</h1>
            <p className="mt-4 max-w-2xl text-base text-white/90">
              Connect with verified, trusted house sitters who treat your home like their own. Find the perfect match for your home and lifestyle.
            </p>
          </div>

          <div className="mt-8 brand-card rounded-[8px] bg-white p-4 text-[#1a1a1a]">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input type="text" placeholder="📍 Where?" className="h-11 px-3" />
              <input type="text" placeholder="📅 From" className="h-11 px-3" />
              <input type="text" placeholder="📅 To" className="h-11 px-3" />
              <button className="h-11 rounded-[4px] bg-[#5a4a3b] px-5 text-white">Search Sitters</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#5a4a3b]">
              <span>🐾 Pet Friendly</span>
              <span>✅ Verified Sitters</span>
              <span>⭐ Top Rated</span>
              <span>💬 Best Feedback</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1a1a1a] py-8">
        <div className="max-site-width grid gap-6 text-center text-white sm:grid-cols-2 lg:grid-cols-4">
          <Stat value="15,000+" label="Active Sitters" />
          <Stat value="25,000+" label="Verified Connections" />
          <Stat value="4.9/5" label="Average Rating" />
          <Stat value="98%" label="Satisfaction Rate" />
        </div>
      </section>

      <section className="bg-white" id="why-us">
        <div className="max-site-width">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl">Why Choose Us?</h2>
            <p className="mt-3 text-[#6b6b6b]">You&apos;ve built the most trusted platform for house sitting.</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard icon="✅" title="Verified Sitters" desc="All our sitters go through thorough identity verification and background checks." />
            <InfoCard icon="⭐" title="Trusted Reviews" desc="Real reviews from real homeowners to help you make informed decisions." />
            <InfoCard icon="🛡️" title="Insurance Included" desc="Comprehensive insurance included with every booking for complete peace of mind." />
            <InfoCard icon="🕐" title="24/7 Support" desc="Round-the-clock support whenever you need us, day or night." />
          </div>
        </div>
      </section>

      <section className="bg-[#f9f6f3]" id="featured-sitters">
        <div className="max-site-width">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-4xl">Featured House Sitters</h2>
              <p className="mt-2 text-[#6b6b6b]">Connect with verified, skilled sitters</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#d4c8be] px-4 py-1.5 text-sm">View All</span>
              <span className="rounded-full bg-[#5a4a3b] px-4 py-1.5 text-sm text-white">Top Rated</span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SITTERS.map((sitter) => (
              <article key={sitter.id} className="brand-card overflow-hidden rounded-[8px] border border-[#efe9e3] p-5">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-[#ece3db]">
                    <Image src="/images/stage/cleaner-default.jpg" alt={sitter.name} width={64} height={64} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-2xl leading-tight">{sitter.name}</h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#6b6b6b]"><MapPin className="h-4 w-4" />{sitter.location}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#6b6b6b]"><Star className="h-4 w-4 fill-current text-[#5a4a3b]" />{sitter.rating} ({sitter.reviews} reviews)</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {sitter.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#f2ece7] px-3 py-1 text-xs text-[#5a4a3b]">
                      {tag}
                    </span>
                  ))}
                </div>

                <button className="mt-5 h-10 w-full rounded-[4px] bg-[#5a4a3b] text-white">View Profile</button>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/client/cleaners" className="text-sm text-[#5a4a3b]">View All Sitters →</Link>
          </div>
        </div>
      </section>

      <section className="bg-white" id="featured-sits">
        <div className="max-site-width">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-4xl">Featured House Sits</h2>
              <p className="mt-2 text-[#6b6b6b]">Explore our most popular listings for your perfect sit</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#d4c8be] px-4 py-1.5 text-sm">View All</span>
              <span className="rounded-full bg-[#5a4a3b] px-4 py-1.5 text-sm text-white">Available</span>
              <span className="rounded-full border border-[#d4c8be] px-4 py-1.5 text-sm">New</span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SITS.map((sit) => (
              <article key={sit.id} className="brand-card overflow-hidden rounded-[8px] border border-[#efe9e3]">
                <div className="relative h-48">
                  <Image src="/images/stage/client-booking-detail.jpg" alt={sit.title} fill className="object-cover" />
                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-white ${
                      sit.status === 'Available' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {sit.status}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-2xl leading-tight">{sit.title}</h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#6b6b6b]"><MapPin className="h-4 w-4" />{sit.location}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[#f2ece7] px-3 py-1 text-[#5a4a3b]"><BedDouble className="mr-1 inline h-3.5 w-3.5" />{sit.beds} Bedrooms</span>
                    <span className="rounded-full bg-[#f2ece7] px-3 py-1 text-[#5a4a3b]"><Bath className="mr-1 inline h-3.5 w-3.5" />{sit.baths} Bathrooms</span>
                    <span className="rounded-full bg-[#f2ece7] px-3 py-1 text-[#5a4a3b]"><PawPrint className="mr-1 inline h-3.5 w-3.5" />{sit.pets}</span>
                  </div>

                  <p className="mt-3 inline-flex items-center gap-1 text-sm text-[#6b6b6b]"><Star className="h-4 w-4 fill-current text-[#5a4a3b]" />{sit.rating}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="h-10 rounded-[4px] border border-[#5a4a3b] bg-transparent text-[#5a4a3b]">View Details</button>
                    <button className="h-10 rounded-[4px] bg-[#5a4a3b] text-white">Message</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/client/bookings" className="text-sm text-[#5a4a3b]">View All Sits →</Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f9f6f3]" id="how-it-works">
        <div className="max-site-width">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl">How It Works</h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <StepCard
              step="1"
              title="Create Your Profile"
              desc="Sign up and create a detailed profile showcasing your experience and preferences."
            />
            <StepCard
              step="2"
              title="Browse & Connect"
              desc="Search for house sits or sitters that match your requirements and location."
            />
            <StepCard
              step="3"
              title="Book with Confidence"
              desc="Communicate directly, arrange the details, and enjoy the peace of mind."
            />
          </div>
        </div>
      </section>

      <section className="bg-[#1a1a1a]">
        <div className="max-site-width text-center text-white">
          <h2 className="text-4xl text-white">Ready to Get Started?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/85">
            Join thousands of homeowners and sitters who trust The House Sitter Directory.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/client/cleaners" className="inline-flex h-11 items-center justify-center rounded-[4px] bg-[#5a4a3b] px-6 text-white">
              Find a Sitter
            </Link>
            <Link href="/signup?role=cleaner" className="inline-flex h-11 items-center justify-center rounded-[4px] border border-white bg-black px-6 text-white">
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
      <p className="text-3xl text-white">{value}</p>
      <p className="mt-1 text-sm text-white/80">{label}</p>
    </div>
  )
}

function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <article className="brand-card rounded-[8px] border border-[#efe9e3] p-5">
      <p className="text-2xl">{icon}</p>
      <h3 className="mt-3 text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-[#6b6b6b]">{desc}</p>
    </article>
  )
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <article className="brand-card rounded-[8px] border border-[#efe9e3] p-6 text-center">
      <p className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#5a4a3b] text-sm text-white">{step}</p>
      <h3 className="mt-3 text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-[#6b6b6b]">{desc}</p>
    </article>
  )
}
