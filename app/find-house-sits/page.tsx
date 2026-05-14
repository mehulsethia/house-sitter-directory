'use client'

import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bath, BedDouble, Calendar, MapPin, PawPrint, Star } from 'lucide-react'
import { DatePickerInput } from '@/components/date-picker-input'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'
import { PUBLIC_HOUSE_SITS } from '@/lib/public-marketplace-data'

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
    let list = PUBLIC_HOUSE_SITS.filter((card) => {
      const matchLocation = !query || card.location.toLowerCase().includes(query) || card.title.toLowerCase().includes(query)
      const matchEmergency = !emergencyOnly || card.badge === 'Urgent'
      return matchLocation && matchEmergency
    })

    if (sortBy === 'urgent_first') {
      list = [...list].sort((a, b) => Number(b.badge === 'Urgent') - Number(a.badge === 'Urgent'))
    } else if (sortBy === 'soonest') {
      list = [...list].sort((a, b) => daysToNumber(a.daysLeft) - daysToNumber(b.daysLeft))
    } else if (sortBy === 'rating_desc') {
      list = [...list].sort((a, b) => b.rating - a.rating)
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
          <h1 className="mt-4 text-[38px] leading-[1.08] sm:text-[48px] md:text-[56px] lg:text-[64px]">
            Find Your Perfect
            <br />
            House Sitting Opportunity
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] text-[#6b6b6b]">
            Browse verified house sitting opportunities from trusted homeowners worldwide
          </p>

          <div className="mx-auto mt-7 max-w-[980px] rounded-[12px] border border-[#e7e1db] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_180px]">
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
                  <DatePickerInput
                    name="from"
                    value={startDate}
                    ariaLabel="Start Date"
                    onChange={setStartDate}
                    className="w-full bg-transparent text-[12px] text-[#1a1a1a] outline-none"
                  />
                }
              />
              <SearchInput
                label="End Date"
                icon={<Calendar className="h-4 w-4" />}
                input={
                  <DatePickerInput
                    name="to"
                    value={endDate}
                    ariaLabel="End Date"
                    onChange={setEndDate}
                    className="w-full bg-transparent text-[12px] text-[#1a1a1a] outline-none"
                  />
                }
              />
              <button type="button" className="h-11 w-full rounded-[4px] bg-[#5a4a3b] text-[13px] text-white md:col-span-2 lg:col-span-1">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f3f3] pt-0">
        <div className="max-site-width">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[30px] leading-tight sm:text-[36px]">{filteredCards.length} Opportunities Available</h2>
              <p className="mt-1 text-sm text-[#6b6b6b]">Showing matching listings</p>
            </div>
            <div className="flex w-full flex-col gap-2 text-sm sm:w-auto sm:flex-row sm:items-center">
              <label className="inline-flex items-center gap-1 rounded-[4px] border border-[#dcd3ca] bg-white px-3 py-2 text-[12px] text-[#6b6b6b]">
                <input type="checkbox" checked={emergencyOnly} onChange={(event) => setEmergencyOnly(event.target.checked)} />
                Emergency sits only
              </label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'default' | 'urgent_first' | 'soonest' | 'rating_desc')}
                className="h-10 w-full rounded-[4px] border border-[#dcd3ca] bg-white px-3 text-sm sm:min-w-[170px] sm:w-auto"
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
                <article key={`${card.id}-${idx}`} className="overflow-hidden rounded-[8px] border border-[#e6ddd4] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                  <div className="relative">
                    <img src={card.image} alt={card.title} className="h-[250px] w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded bg-[#ececec] px-2 py-1 text-[10px] text-[#5a5a5a]">{card.daysLeft}</span>
                    {card.badge === 'Urgent' && <span className="absolute right-2 top-2 rounded bg-[#e6373a] px-2 py-1 text-[10px] text-white">Urgent</span>}
                  </div>

                  <div className="p-4">
                    <h3 className="text-[24px] leading-tight sm:text-[30px]">{card.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-[#7a7a7a]">
                      <MapPin className="h-3 w-3" />
                      {card.location}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-[#7a7a7a]">
                      <Calendar className="h-3 w-3" />
                      {card.dateRange}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-[#6b6b6b] sm:grid-cols-4">
                      <span className="rounded bg-[#f1ece7] px-2 py-1">{card.type}</span>
                      <span className="rounded bg-[#f1ece7] px-2 py-1"><BedDouble className="mr-1 inline h-3 w-3" />{card.beds} bed</span>
                      <span className="rounded bg-[#f1ece7] px-2 py-1"><Bath className="mr-1 inline h-3 w-3" />{card.baths} bath</span>
                      <span className="rounded bg-[#f1ece7] px-2 py-1"><PawPrint className="mr-1 inline h-3 w-3" />{card.pets}</span>
                    </div>

                    <p className="mt-2 flex items-center gap-1 text-[11px] text-[#6b6b6b]">
                      <Star className="h-3.5 w-3.5 fill-current text-[#f5b01a]" /> {card.rating.toFixed(1)}
                      <span className="px-1">•</span>
                      {card.applications} Application{card.applications === 1 ? '' : 's'}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link href={`/find-house-sits/${card.id}`} className="inline-flex h-9 items-center justify-center rounded-[4px] bg-[#5a4a3b] text-[12px] text-white">
                        View Details
                      </Link>
                      <Link
                        href={`/login?next=${encodeURIComponent(`/find-house-sits/${card.id}`)}`}
                        className="inline-flex h-9 items-center justify-center rounded-[4px] border border-[#5a4a3b] text-[12px] text-[#5a4a3b]"
                      >
                        Message
                      </Link>
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
          <h2 className="text-[34px] leading-tight text-white sm:text-[44px]">Ready to Start Your House Sitting Journey?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] text-white/85">Create your sitter profile and start applying to house sitting opportunities today</p>
          <Link href="/signup?role=house_sitter" className="mt-7 inline-flex h-10 items-center rounded-[4px] bg-white px-6 text-[13px] text-[#5a4a3b]">
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
