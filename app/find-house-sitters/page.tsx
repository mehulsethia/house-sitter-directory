import Link from 'next/link'
import { Calendar, MapPin, Star } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'
import type { ReactNode } from 'react'

type SitterCard = {
  name: string
  location: string
  rating: string
  reviews: number
  tags: string[]
  badge: string
  badgeTone: 'orange' | 'green'
  image: string
}

const sitterCards: SitterCard[] = [
  {
    name: 'Hol',
    location: 'No Location Found',
    rating: '0.0',
    reviews: 0,
    tags: ['Dog Walking', 'Garden Maintenance'],
    badge: 'Premium Verified',
    badgeTone: 'orange',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Faye Walker',
    location: 'Lower Dicker, Hailsham BN27, UK',
    rating: '0.0',
    reviews: 0,
    tags: ['Dog Walking', 'Property Care & Security', 'Cleaning'],
    badge: 'Premium Verified',
    badgeTone: 'orange',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Bee',
    location: 'Sydney NSW, Australia',
    rating: '5.0',
    reviews: 1,
    tags: ['Pet Care', 'Dog Walking', 'Cat Care'],
    badge: 'Premium Verified',
    badgeTone: 'orange',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'ZC',
    location: 'Cotswolds, UK',
    rating: '5.0',
    reviews: 1,
    tags: ['Dog Walking', 'Plant Care', 'Garden Maintenance'],
    badge: 'Premium Verified',
    badgeTone: 'orange',
    image: 'https://images.unsplash.com/photo-1542204625-de293a06df53?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Liv K',
    location: 'Crewe-by-Farndon, Chester CH3 6PH, UK',
    rating: '4.0',
    reviews: 1,
    tags: ['Dog Walking', 'Cooking', 'Cleaning', 'Driving'],
    badge: 'Premium Verified',
    badgeTone: 'orange',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Mia',
    location: 'Carmel Valley, San Diego, CA, USA',
    rating: '3.5',
    reviews: 6,
    tags: ['Plant Care', 'Property Care & Security', 'First Aid'],
    badge: 'Premium Verified',
    badgeTone: 'orange',
    image: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Shez',
    location: 'No Location Found',
    rating: '3.3',
    reviews: 3,
    tags: ['Pool Maintenance', 'Property Care & Security'],
    badge: 'Verified',
    badgeTone: 'green',
    image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Olivia Martinez',
    location: 'No Location Found',
    rating: '3.5',
    reviews: 2,
    tags: ['Cat Care', 'Cleaning', 'CPR Certified'],
    badge: 'Verified',
    badgeTone: 'green',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Liv K',
    location: 'Davenham, UK',
    rating: '5.0',
    reviews: 1,
    tags: ['Pet Care', 'Dog Walking', 'Cooking', 'Cleaning'],
    badge: 'Verified',
    badgeTone: 'green',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
  },
]

export default function FindHouseSittersPage() {
  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#1a1a1a]">
      <LandingHeader />

      <section className="pb-14 pt-14">
        <div className="max-site-width text-center">
          <p className="mx-auto inline-flex rounded-[4px] bg-[#5a4a3b] px-3 py-1 text-[11px] text-white">18 Sitters Available</p>
          <h1 className="mt-4 text-[64px] leading-[1.05] md:text-[68px]">Find Your Perfect<br />House Sitter</h1>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] text-[#6b6b6b]">
            Browse our directory of verified, experienced house sitters ready to care for your home and pets
          </p>

          <div className="mx-auto mt-7 max-w-[980px] rounded-[12px] border border-[#e7e1db] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_180px]">
              <SearchInput label="Location" placeholder="Where ?" icon={<MapPin className="h-4 w-4" />} />
              <SearchInput label="Start Date" placeholder="Start Date" icon={<Calendar className="h-4 w-4" />} />
              <SearchInput label="End Date" placeholder="End Date" icon={<Calendar className="h-4 w-4" />} />
              <button className="h-11 rounded-[4px] bg-[#5a4a3b] text-[13px] text-white">Search</button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f3f3] pt-0">
        <div className="max-site-width">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[36px]">18 Sitters Available</h2>
              <p className="mt-1 text-sm text-[#6b6b6b]">Showing all sitters</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#4a4a4a]">Sort by:</span>
              <select className="h-10 min-w-[150px] rounded-[4px] border border-[#dcd3ca] bg-white px-3 text-sm">
                <option>Sort by</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sitterCards.map((card, idx) => (
              <article key={`${card.name}-${idx}`} className="overflow-hidden rounded-[8px] border border-[#e6ddd4] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <div className="relative">
                  <img src={card.image} alt={card.name} className="h-[280px] w-full object-cover" />
                  <span
                    className={`absolute right-2 top-2 rounded px-2 py-1 text-[10px] text-white ${
                      card.badgeTone === 'green' ? 'bg-[#0f9f58]' : 'bg-[#f59b45]'
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-[34px] leading-tight">{card.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[#7a7a7a]">
                    <MapPin className="h-3 w-3" />
                    {card.location}
                  </p>

                  <p className="mt-2 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                    <Star className="h-3.5 w-3.5 fill-current text-[#f5b01a]" />
                    {card.rating} <span className="px-1">•</span> {card.reviews} Reviews
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                      <span key={tag} className="rounded bg-[#f1ece7] px-2 py-1 text-[10px] text-[#6b6b6b]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/signup"
                    className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-[4px] bg-[#5a4a3b] text-[12px] text-white"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function SearchInput({
  label,
  placeholder,
  icon,
}: {
  label: string
  placeholder: string
  icon: ReactNode
}) {
  return (
    <label className="rounded-[4px] bg-[#f8f8f8] p-2 text-left">
      <span className="mb-1 block text-[11px] text-[#646464]">{label}</span>
      <span className="flex items-center gap-2 text-[12px] text-[#848484]">
        {icon}
        {placeholder}
      </span>
    </label>
  )
}
