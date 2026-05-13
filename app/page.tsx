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
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'

type Sitter = {
  name: string
  city: string
  rating: string
  reviews: number
  tags: string[]
  image: string
}

type HouseSit = {
  title: string
  city: string
  status: 'Available' | 'NEW'
  beds: number
  baths: number
  pets: string
  rating: string
  image: string
}

const sitters: Sitter[] = [
  {
    name: 'Ivy',
    city: 'New York, NY',
    rating: '4.9',
    reviews: 116,
    tags: ['Dog Sitting', 'Long Term', 'Experienced'],
    image:
      'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Rosie Walker',
    city: 'Chicago, IL',
    rating: '4.8',
    reviews: 92,
    tags: ['Pet Friendly', 'Verified', 'Top Rated'],
    image:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Sia',
    city: 'Austin, TX',
    rating: '5.0',
    reviews: 104,
    tags: ['Plant Care', 'Long Term', 'Trusted'],
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Luca',
    city: 'Seattle, WA',
    rating: '4.7',
    reviews: 88,
    tags: ['Short Term', 'Verified', 'Experienced'],
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'JJ',
    city: 'San Diego, CA',
    rating: '4.9',
    reviews: 121,
    tags: ['Dog Sitting', 'Top Rated', 'Long Term'],
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'George P',
    city: 'Miami, FL',
    rating: '4.8',
    reviews: 97,
    tags: ['Pet Sitting', 'Experienced', 'Verified'],
    image:
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Ria',
    city: 'Denver, CO',
    rating: '4.9',
    reviews: 133,
    tags: ['Plant Care', 'Top Rated', 'Trusted'],
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Ari',
    city: 'Portland, OR',
    rating: '4.7',
    reviews: 89,
    tags: ['Verified', 'Short Term', 'Flexible'],
    image:
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Ash',
    city: 'Boston, MA',
    rating: '4.8',
    reviews: 102,
    tags: ['Dog Sitting', 'Long Term', 'Reliable'],
    image:
      'https://images.unsplash.com/photo-1542204625-de293a06df53?auto=format&fit=crop&w=900&q=80',
  },
]

const houseSits: HouseSit[] = [
  {
    title: 'Serene Family Home',
    city: 'Atlanta, GA',
    status: 'Available',
    beds: 3,
    baths: 2,
    pets: '2 Pets',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'City Loft Stay',
    city: 'Nashville, TN',
    status: 'NEW',
    beds: 2,
    baths: 1,
    pets: 'No Pets',
    rating: '4.7',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Beautiful Home',
    city: 'Salt Lake City, UT',
    status: 'NEW',
    beds: 4,
    baths: 3,
    pets: '1 Pet',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Modern Villa',
    city: 'Phoenix, AZ',
    status: 'Available',
    beds: 3,
    baths: 2,
    pets: 'No Pets',
    rating: '4.7',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Cozy Kitchen Home',
    city: 'Boise, ID',
    status: 'NEW',
    beds: 2,
    baths: 2,
    pets: '2 Pets',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'West End Stay',
    city: 'Cleveland, OH',
    status: 'Available',
    beds: 3,
    baths: 2,
    pets: '1 Pet',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Lakeside Retreat',
    city: 'Madison, WI',
    status: 'Available',
    beds: 4,
    baths: 2,
    pets: '3 Pets',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1434082033009-b81d41d32e1c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Corner Modern House',
    city: 'Raleigh, NC',
    status: 'Available',
    beds: 3,
    baths: 2,
    pets: 'No Pets',
    rating: '4.7',
    image:
      'https://images.unsplash.com/photo-1613553497126-a44624272024?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'New Build Home',
    city: 'Plano, TX',
    status: 'NEW',
    beds: 4,
    baths: 3,
    pets: '1 Pet',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1200&q=80',
  },
]

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
        <div className="max-site-width relative z-10 py-20 text-center text-white md:py-24">
          <p className="mx-auto inline-flex rounded-[2px] bg-[rgba(34,23,15,0.75)] px-3 py-1 text-[11px]">
            Trusted by 5000+ Members
          </p>
          <h1 className="mt-4 text-[38px] leading-tight text-white md:text-[48px]">Your Home, Lovingly Cared For</h1>
          <p className="mx-auto mt-2 max-w-2xl text-[14px] leading-relaxed text-white/95 md:text-[15px]">
            Connect with verified, trusted house sitters who treat your home like their own. Find the perfect match
            for your home and lifestyle.
          </p>

          <div className="mx-auto mt-6 max-w-[760px] rounded-[8px] bg-white p-3 text-left text-[#1a1a1a] shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
            <div className="grid gap-2 md:grid-cols-3">
              <input placeholder="📍 Where?" className="h-10 rounded-[4px] border border-[#e0e0e0] px-3 text-[13px]" />
              <input placeholder="📅 From" className="h-10 rounded-[4px] border border-[#e0e0e0] px-3 text-[13px]" />
              <input placeholder="📅 To" className="h-10 rounded-[4px] border border-[#e0e0e0] px-3 text-[13px]" />
            </div>
            <button className="mt-2 h-9 w-full rounded-[4px] bg-[#5a4a3b] text-[13px] text-white">Search Sitters</button>
          </div>

          <p className="mt-4 text-[11px] text-white/90">🐾 Pet Friendly &nbsp; • &nbsp; ✅ Verified Sitters &nbsp; • &nbsp; ⭐ Top Rated &nbsp; • &nbsp; 💬 Best Feedback</p>
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
          <div className="mb-7 flex items-end justify-between gap-4">
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
            {sitters.map((sitter) => (
              <article key={sitter.name} className="brand-card overflow-hidden border border-[#e8e1da]">
                <div className="relative">
                  <img src={sitter.image} alt={sitter.name} className="h-[218px] w-full object-cover" />
                  <span className="absolute right-2 top-2 rounded bg-[#f1994f] px-2 py-1 text-[10px] text-white">Top Rated</span>
                </div>
                <div className="p-4">
                  <h3 className="text-[22px] leading-tight">{sitter.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                    <MapPin className="h-3.5 w-3.5" />
                    {sitter.city}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                    <Star className="h-3.5 w-3.5 fill-current text-[#f6b019]" />
                    {sitter.rating} ({sitter.reviews} reviews)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sitter.tags.map((tag) => (
                      <span key={tag} className="rounded bg-[#f4f0ec] px-2 py-1 text-[10px] text-[#5a4a3b]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="mt-4 h-9 w-full rounded-[4px] bg-[#5a4a3b] text-[12px] text-white">View Profile</button>
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
          <div className="mb-7 flex items-end justify-between gap-4">
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
            {houseSits.map((sit) => (
              <article key={sit.title} className="brand-card overflow-hidden border border-[#e8e1da]">
                <div className="relative">
                  <img src={sit.image} alt={sit.title} className="h-[185px] w-full object-cover" />
                  <span
                    className={`absolute right-2 top-2 rounded px-2 py-1 text-[10px] text-white ${
                      sit.status === 'NEW' ? 'bg-[#db4a40]' : 'bg-[#2d9852]'
                    }`}
                  >
                    {sit.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[20px] leading-tight">{sit.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                    <MapPin className="h-3.5 w-3.5" />
                    {sit.city}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
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
                    {sit.rating}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="h-9 rounded-[4px] border border-[#5a4a3b] text-[12px] text-[#5a4a3b]">View Details</button>
                    <button className="h-9 rounded-[4px] bg-[#5a4a3b] text-[12px] text-white">
                      <MessageSquare className="mr-1 inline h-3.5 w-3.5" />
                      Message
                    </button>
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
