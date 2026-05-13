'use client'

import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bath, BedDouble, Calendar, MapPin, PawPrint, Star } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'

type SitCard = {
  title: string
  location: string
  dateRange: string
  type: string
  beds: string
  baths: string
  pets: string
  rating: string
  applications: number
  badge: string
  daysLeft: string
  image: string
}

const sitCards: SitCard[] = [
  {
    title: 'demo',
    location: 'Mumbai, Maharashtra, India',
    dateRange: '11/05/2026 - 25/05/2026',
    type: 'Studio',
    beds: '2 bed',
    baths: '1 bath',
    pets: '1 pet',
    rating: '0',
    applications: 0,
    badge: 'Urgent',
    daysLeft: '14 days',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Gravity House',
    location: 'Mumbai, Maharashtra, India',
    dateRange: '12/05/2026 - 16/05/2026',
    type: 'House',
    beds: '3 bed',
    baths: '6 bath',
    pets: '2 pets',
    rating: '0',
    applications: 0,
    badge: 'Urgent',
    daysLeft: '4 days',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Beautiful Home',
    location: 'Ahmedabad, Gujarat, India',
    dateRange: '12/05/2026 - 14/05/2026',
    type: 'Apartment',
    beds: '3 bed',
    baths: '5 bath',
    pets: '1 pet',
    rating: '0',
    applications: 0,
    badge: 'Active',
    daysLeft: '2 days',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'sada',
    location: 'Suratgarh, Rajasthan 335804, India',
    dateRange: '08/05/2026 - 25/05/2026',
    type: 'Villa',
    beds: '2 bed',
    baths: '1 bath',
    pets: '0 pets',
    rating: '0',
    applications: 0,
    badge: 'Active',
    daysLeft: '17 days',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Test House',
    location: 'London, UK',
    dateRange: '18/05/2026 - 25/05/2026',
    type: 'Apartment',
    beds: '4 bed',
    baths: '3 bath',
    pets: '1 pet',
    rating: '0',
    applications: 0,
    badge: 'Urgent',
    daysLeft: '7 days',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'tested',
    location: 'Surat, Gujarat, India',
    dateRange: '05/05/2026 - 27/05/2026',
    type: 'Apartment',
    beds: '3 bed',
    baths: '4 bath',
    pets: '1 pet',
    rating: '0',
    applications: 0,
    badge: 'Urgent',
    daysLeft: '22 days',
    image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Rustic Farmhouse',
    location: 'Cotswold District, UK',
    dateRange: '06/05/2026 - 26/05/2026',
    type: 'Farmhouse',
    beds: '4 bed',
    baths: '4 bath',
    pets: '2 pets',
    rating: '4.9',
    applications: 1,
    badge: 'Active',
    daysLeft: '20 days',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Cozy Family Home in Quiet Suburb',
    location: 'Austin, TX, USA',
    dateRange: '10/08/2026 - 20/08/2026',
    type: 'House',
    beds: '3 bed',
    baths: '1 bath',
    pets: '1 pet',
    rating: '4.8',
    applications: 2,
    badge: 'Urgent',
    daysLeft: '10 days',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Oceanfront Condo in Miami Beach',
    location: 'Miami, FL, USA',
    dateRange: '10/08/2026 - 30/08/2026',
    type: 'Apartment',
    beds: '3 bed',
    baths: '2 bath',
    pets: '0 pets',
    rating: '4.7',
    applications: 0,
    badge: 'Urgent',
    daysLeft: '19 days',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Modern 3-Bedroom Family Home',
    location: 'United States',
    dateRange: '10/08/2026 - 20/08/2026',
    type: 'House',
    beds: '2 bed',
    baths: '1 bath',
    pets: '1 pet',
    rating: '4.6',
    applications: 2,
    badge: 'Active',
    daysLeft: '12 days',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
  },
]

function daysToNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9]/g, ''))
  return Number.isFinite(parsed) ? parsed : 999
}

function FindHouseSitsContent() {
  const searchParams = useSearchParams()
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [startDate, setStartDate] = useState(searchParams.get('from') ?? '')
  const [endDate, setEndDate] = useState(searchParams.get('to') ?? '')
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'default' | 'urgent_first' | 'soonest' | 'rating_desc'>('default')

  const filteredCards = useMemo(() => {
    const query = location.trim().toLowerCase()
    let list = sitCards.filter((card) => {
      const matchLocation = !query || card.location.toLowerCase().includes(query) || card.title.toLowerCase().includes(query)
      const matchEmergency = !emergencyOnly || card.badge === 'Urgent'
      return matchLocation && matchEmergency
    })

    if (sortBy === 'urgent_first') {
      list = [...list].sort((a, b) => Number(b.badge === 'Urgent') - Number(a.badge === 'Urgent'))
    } else if (sortBy === 'soonest') {
      list = [...list].sort((a, b) => daysToNumber(a.daysLeft) - daysToNumber(b.daysLeft))
    } else if (sortBy === 'rating_desc') {
      list = [...list].sort((a, b) => Number(b.rating) - Number(a.rating))
    }

    return list
  }, [location, emergencyOnly, sortBy])

  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#1a1a1a]">
      <LandingHeader />

      <section className="pb-14 pt-14">
        <div className="max-site-width text-center">
          <p className="mx-auto inline-flex rounded-[4px] bg-[#5a4a3b] px-3 py-1 text-[11px] text-white">
            {filteredCards.length} Active House Sits
          </p>
          <h1 className="mt-4 text-[64px] leading-[1.05] md:text-[68px]">Find Your Perfect<br />House Sitting Opportunity</h1>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] text-[#6b6b6b]">
            Browse verified house sitting opportunities from trusted homeowners worldwide
          </p>

          <div className="mx-auto mt-7 max-w-[980px] rounded-[12px] border border-[#e7e1db] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_180px]">
              <SearchInput
                label="Location"
                icon={<MapPin className="h-4 w-4" />}
                input={
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Where?"
                    className="w-full bg-transparent text-[12px] text-[#1a1a1a] outline-none"
                  />
                }
              />
              <SearchInput
                label="Start Date"
                icon={<Calendar className="h-4 w-4" />}
                input={
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full bg-transparent text-[12px] text-[#1a1a1a] outline-none"
                  />
                }
              />
              <SearchInput
                label="End Date"
                icon={<Calendar className="h-4 w-4" />}
                input={
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full bg-transparent text-[12px] text-[#1a1a1a] outline-none"
                  />
                }
              />
              <button type="button" className="h-11 rounded-[4px] bg-[#5a4a3b] text-[13px] text-white">Search</button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f3f3] pt-0">
        <div className="max-site-width">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[36px]">{filteredCards.length} Opportunities Available</h2>
              <p className="mt-1 text-sm text-[#6b6b6b]">Showing matching listings</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label className="inline-flex items-center gap-1 rounded-[4px] border border-[#dcd3ca] bg-white px-3 py-2 text-[12px] text-[#6b6b6b]">
                <input type="checkbox" checked={emergencyOnly} onChange={(event) => setEmergencyOnly(event.target.checked)} />
                Emergency sits only
              </label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'default' | 'urgent_first' | 'soonest' | 'rating_desc')}
                className="h-10 min-w-[170px] rounded-[4px] border border-[#dcd3ca] bg-white px-3 text-sm"
              >
                <option value="default">Sort by</option>
                <option value="urgent_first">Urgent first</option>
                <option value="soonest">Soonest start</option>
                <option value="rating_desc">Top rated homes</option>
              </select>
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <div className="rounded-[8px] border border-[#e6ddd4] bg-white p-10 text-center text-[#6b6b6b]">
              No house sits matched your filters. Try adjusting location or emergency settings.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card, idx) => (
                <article key={`${card.title}-${idx}`} className="overflow-hidden rounded-[8px] border border-[#e6ddd4] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                  <div className="relative">
                    <img src={card.image} alt={card.title} className="h-[250px] w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded bg-[#ececec] px-2 py-1 text-[10px] text-[#5a5a5a]">{card.daysLeft}</span>
                    {card.badge === 'Urgent' && <span className="absolute right-2 top-2 rounded bg-[#e6373a] px-2 py-1 text-[10px] text-white">Urgent</span>}
                  </div>

                  <div className="p-4">
                    <h3 className="text-[30px] leading-tight">{card.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-[#7a7a7a]">
                      <MapPin className="h-3 w-3" />
                      {card.location}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-[#7a7a7a]">
                      <Calendar className="h-3 w-3" />
                      {card.dateRange}
                    </p>

                    <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] text-[#6b6b6b]">
                      <span className="rounded bg-[#f1ece7] px-2 py-1">{card.type}</span>
                      <span className="rounded bg-[#f1ece7] px-2 py-1"><BedDouble className="mr-1 inline h-3 w-3" />{card.beds}</span>
                      <span className="rounded bg-[#f1ece7] px-2 py-1"><Bath className="mr-1 inline h-3 w-3" />{card.baths}</span>
                      <span className="rounded bg-[#f1ece7] px-2 py-1"><PawPrint className="mr-1 inline h-3 w-3" />{card.pets}</span>
                    </div>

                    <p className="mt-2 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                      <Star className="h-3.5 w-3.5 fill-current text-[#f5b01a]" /> {card.rating}
                      <span className="px-1">•</span>
                      {card.applications} Application{card.applications === 1 ? '' : 's'}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link href="/signup" className="inline-flex h-9 items-center justify-center rounded-[4px] bg-[#5a4a3b] text-[12px] text-white">
                        View Details
                      </Link>
                      <button className="h-9 rounded-[4px] border border-[#5a4a3b] text-[12px] text-[#5a4a3b]">Message</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#5a4a3b] py-16 text-center text-white">
        <div className="max-site-width">
          <h2 className="text-[44px] leading-tight text-white">Ready to Start Your House Sitting Journey?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] text-white/85">Create your sitter profile and start applying to house sitting opportunities today</p>
          <Link href="/signup?role=cleaner" className="mt-7 inline-flex h-10 items-center rounded-[4px] bg-white px-6 text-[13px] text-[#5a4a3b]">
            Create Your Profile
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function FindHouseSitsPage() {
  return (
    <Suspense>
      <FindHouseSitsContent />
    </Suspense>
  )
}

function SearchInput({
  label,
  icon,
  input,
}: {
  label: string
  icon: React.ReactNode
  input: React.ReactNode
}) {
  return (
    <label className="rounded-[4px] bg-[#f8f8f8] p-2 text-left">
      <span className="mb-1 block text-[11px] text-[#646464]">{label}</span>
      <span className="flex items-center gap-2 text-[12px] text-[#848484]">
        {icon}
        {input}
      </span>
    </label>
  )
}
