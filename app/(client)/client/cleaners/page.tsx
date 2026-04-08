'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Grid3x3, List, Search, MapPin, Briefcase } from 'lucide-react'
import { cleanersApi } from '@/lib/api'
import { EmptyState } from '@/components/empty-state'
import { ListPageSkeleton } from '@/components/page-skeletons'
import { StarRating } from '@/components/star-rating'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import type { CleanerSummary } from '@/types'
import { toast } from 'sonner'

type ViewMode = 'card' | 'list'

type CleanerVM = CleanerSummary & {
  name: string
  city?: string
  years_experience?: number
  profile_image_url?: string
  skills: string[]
}

function avatarLetter(name: string) {
  return (name.trim().charAt(0) || 'C').toUpperCase()
}

export default function ClientCleanersPage() {
  const [loading, setLoading] = useState(true)
  const [cityQuery, setCityQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [minRating, setMinRating] = useState('0')
  const [minRate, setMinRate] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [view, setView] = useState<ViewMode>('card')
  const [cleaners, setCleaners] = useState<CleanerVM[]>([])

  async function load(city?: string) {
    setLoading(true)
    try {
      const res = await cleanersApi.search({ city: city || undefined })
      const items = (res.data?.items ?? []) as any[]
      setCleaners(
        items.map((c) => ({
          ...c,
          name: c?.user?.name ?? 'Cleaner',
          city: c?.service_areas?.[0]?.city,
          years_experience: c?.years_experience ?? c?.yearsExperience,
          profile_image_url: c?.profile_image_url ?? c?.profileImageUrl,
          skills: c?.skills ?? [],
        })),
      )
    } catch {
      toast.error('Failed to load cleaners.')
      setCleaners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const minRatingValue = Number(minRating || 0)
    const minRateValue = minRate ? Number(minRate) : null
    const maxRateValue = maxRate ? Number(maxRate) : null

    return cleaners.filter((c) => {
      const rate = Number(c.hourly_rate ?? 0)
      const rating = Number(c.average_rating ?? 0)
      if (rating < minRatingValue) return false
      if (minRateValue !== null && rate < minRateValue) return false
      if (maxRateValue !== null && rate > maxRateValue) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        (c.bio ?? '').toLowerCase().includes(q) ||
        (c.city ?? '').toLowerCase().includes(q) ||
        c.skills.join(' ').toLowerCase().includes(q)
      )
    })
  }, [cleaners, searchQuery, minRating, minRate, maxRate])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="marketplace-title text-3xl text-slate-900">All Cleaners</h1>
        <p className="mt-1 text-sm text-slate-500">View cleaner profiles and book the one that fits your needs.</p>
      </div>

      <div className="flex flex-col gap-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            load(cityQuery)
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Search by city"
              className="pl-9"
            />
          </div>
          <button type="submit" className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(39,70,250,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95">
            Search
          </button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="grid gap-2 md:grid-cols-[1fr_170px_140px_140px_auto]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, bio, skills"
            />
            <Select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
              <option value="0">Minimum rating</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </Select>
            <Input type="number" min="0" value={minRate} onChange={(e) => setMinRate(e.target.value)} placeholder="Min €/hr" />
            <Input type="number" min="0" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} placeholder="Max €/hr" />
            <div className="inline-flex h-10 rounded-xl border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`inline-flex items-center gap-1 rounded-lg px-2 text-sm font-semibold ${view === 'list' ? 'bg-primary text-white' : 'text-slate-600'}`}
              >
                <List className="h-4 w-4" /> List
              </button>
              <button
                type="button"
                onClick={() => setView('card')}
                className={`inline-flex items-center gap-1 rounded-lg px-2 text-sm font-semibold ${view === 'card' ? 'bg-primary text-white' : 'text-slate-600'}`}
              >
                <Grid3x3 className="h-4 w-4" /> Card
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <ListPageSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No cleaners found"
          description="Try adjusting your filters or searching in a different city."
        />
      ) : view === 'card' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((cleaner) => (
            <article key={cleaner.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
              <div className="flex items-start gap-3">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {avatarLetter(cleaner.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="truncate text-xl font-semibold text-slate-900">{cleaner.name}</h3>
                      <div className="mt-1"><StarRating rating={Number(cleaner.average_rating ?? 0)} /></div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(Number(cleaner.hourly_rate ?? 0))}<span className="text-sm font-medium text-slate-500">/hr</span></p>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    {cleaner.city && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{cleaner.city}</span>}
                    {cleaner.years_experience !== undefined && <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{cleaner.years_experience} years experience</span>}
                  </div>

                  {cleaner.bio && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{cleaner.bio}</p>}

                  <div className="mt-2 flex flex-wrap gap-2">
                    {(cleaner.skills ?? []).slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{skill}</span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Link href={`/client/cleaners/${cleaner.id}`} className="inline-flex h-9 items-center rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50">
                      View Profile
                    </Link>
                    <Link href={`/client/book/${cleaner.id}`} className="inline-flex h-9 items-center rounded-xl bg-primary px-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cleaner) => (
            <article key={cleaner.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {avatarLetter(cleaner.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-slate-900">{cleaner.name}</h3>
                    <div className="mt-1"><StarRating rating={Number(cleaner.average_rating ?? 0)} /></div>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-600">{cleaner.bio || 'Professional cleaner available for bookings.'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(Number(cleaner.hourly_rate ?? 0))}<span className="text-sm font-medium text-slate-500">/hr</span></p>
                  <Link href={`/client/cleaners/${cleaner.id}`} className="inline-flex h-9 items-center rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50">
                    View Profile
                  </Link>
                  <Link href={`/client/book/${cleaner.id}`} className="inline-flex h-9 items-center rounded-xl bg-primary px-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95">
                    Book Now
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
