'use client'

import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, MapPin, Star } from 'lucide-react'
import { DatePickerInput } from '@/components/date-picker-input'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'
import { PUBLIC_SITTERS } from '@/lib/public-marketplace-data'

function FindHouseSittersContent() {
  const searchParams = useSearchParams()
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [startDate, setStartDate] = useState(searchParams.get('from') ?? '')
  const [endDate, setEndDate] = useState(searchParams.get('to') ?? '')
  const [sortBy, setSortBy] = useState<'default' | 'rating_desc' | 'reviews_desc' | 'name_asc'>('default')

  const filteredCards = useMemo(() => {
    const locationQuery = location.trim().toLowerCase()
    let list = PUBLIC_SITTERS.filter((card) => {
      if (!locationQuery) return true
      return (
        card.name.toLowerCase().includes(locationQuery) ||
        card.location.toLowerCase().includes(locationQuery) ||
        card.tags.join(' ').toLowerCase().includes(locationQuery)
      )
    })

    if (sortBy === 'rating_desc') {
      list = [...list].sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'reviews_desc') {
      list = [...list].sort((a, b) => b.reviews - a.reviews)
    } else if (sortBy === 'name_asc') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [location, sortBy])

  const hasDateRange = Boolean(startDate || endDate)

  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#1a1a1a]">
      <LandingHeader />

      <section className="pb-14 pt-14">
        <div className="max-site-width text-center">
          <p className="mx-auto inline-flex rounded-[4px] bg-[#5a4a3b] px-3 py-1 text-[11px] text-white">
            {filteredCards.length} Sitters Available
          </p>
          <h1 className="mt-4 text-[64px] leading-[1.05] md:text-[68px]">Find Your Perfect<br />House Sitter</h1>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] text-[#6b6b6b]">
            Browse our directory of verified, experienced house sitters ready to care for your home and pets
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
              <button
                type="button"
                onClick={() => {
                  // Filters are live-updating; this keeps UX aligned with a search CTA.
                }}
                className="h-11 rounded-[4px] bg-[#5a4a3b] text-[13px] text-white"
              >
                Search
              </button>
            </div>
            {hasDateRange ? (
              <p className="mt-2 text-left text-[11px] text-[#7a6a5c]">Showing sitters for your selected date range.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f3f3] pt-0">
        <div className="max-site-width">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[36px]">{filteredCards.length} Sitters Available</h2>
              <p className="mt-1 text-sm text-[#6b6b6b]">Showing matching sitters</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#4a4a4a]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'default' | 'rating_desc' | 'reviews_desc' | 'name_asc')}
                className="h-10 min-w-[170px] rounded-[4px] border border-[#dcd3ca] bg-white px-3 text-sm"
              >
                <option value="default">Sort by</option>
                <option value="rating_desc">Top Rated</option>
                <option value="reviews_desc">Most Reviews</option>
                <option value="name_asc">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <div className="rounded-[8px] border border-[#e6ddd4] bg-white p-10 text-center text-[#6b6b6b]">
              No sitters matched your filters. Try a broader location search.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card, idx) => (
                <article key={`${card.id}-${idx}`} className="overflow-hidden rounded-[8px] border border-[#e6ddd4] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
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
                      {card.rating.toFixed(1)} <span className="px-1">•</span> {card.reviews} Reviews
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {card.tags.map((tag) => (
                        <span key={tag} className="rounded bg-[#f1ece7] px-2 py-1 text-[10px] text-[#6b6b6b]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/find-house-sitters/${card.id}`}
                      className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-[4px] bg-[#5a4a3b] text-[12px] text-white"
                    >
                      View Profile
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function FindHouseSittersPage() {
  return (
    <Suspense>
      <FindHouseSittersContent />
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
