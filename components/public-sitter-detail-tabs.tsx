'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Globe2, ShieldCheck, Star } from 'lucide-react'
import type { PublicSitter } from '@/lib/public-marketplace-data'

type DetailTab = 'availability' | 'about' | 'reviews'

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

type DaySchedule = {
  day: (typeof DAY_ORDER)[number]
  slots: string[]
}

function buildSchedule(availability: string[]): DaySchedule[] {
  const map = new Map<(typeof DAY_ORDER)[number], Set<string>>(
    DAY_ORDER.map((day) => [day, new Set<string>()]),
  )

  const normalized = availability.map((item) => item.trim().toLowerCase())

  if (normalized.includes('weekdays')) {
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const) {
      map.get(day)?.add('09:00 - 17:00')
    }
  }

  if (normalized.includes('weekends')) {
    for (const day of ['Sat', 'Sun'] as const) {
      map.get(day)?.add('09:00 - 17:00')
    }
  }

  if (normalized.includes('evenings')) {
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const) {
      map.get(day)?.add('18:00 - 21:00')
    }
  }

  if (normalized.includes('flexible')) {
    for (const day of DAY_ORDER) {
      map.get(day)?.add('Anytime during the day')
    }
  }

  return DAY_ORDER.map((day) => ({
    day,
    slots: Array.from(map.get(day) ?? []),
  }))
}

function deriveLanguages(location: string): string[] {
  if (!location) return ['English']
  const value = location.toLowerCase()
  if (value.includes('france')) return ['French', 'English']
  if (value.includes('spain')) return ['Spanish', 'English']
  if (value.includes('germany')) return ['German', 'English']
  return ['English']
}

export function PublicSitterDetailTabs({ sitter }: { sitter: PublicSitter }) {
  const [tab, setTab] = useState<DetailTab>('availability')

  const schedule = useMemo(() => buildSchedule(sitter.availability), [sitter.availability])
  const hasAnyAvailability = useMemo(() => schedule.some((item) => item.slots.length > 0), [schedule])

  const specialties = sitter.tags.slice(0, 4)
  const skills = sitter.tags
  const languages = deriveLanguages(sitter.location)
  const certifications: string[] = []
  const reviewItems: Array<{ id: string; rating: number; comment: string; date: string }> = []

  return (
    <div className="rounded-[10px] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-3 overflow-hidden rounded-[8px] bg-[#f5f5f5] text-center text-[13px]">
        <button
          type="button"
          onClick={() => setTab('availability')}
          className={`px-3 py-3 transition-colors ${tab === 'availability' ? 'bg-white text-[#111827]' : 'text-[#374151]'}`}
        >
          Availability
        </button>
        <button
          type="button"
          onClick={() => setTab('about')}
          className={`px-3 py-3 transition-colors ${tab === 'about' ? 'bg-white text-[#111827]' : 'text-[#374151]'}`}
        >
          About
        </button>
        <button
          type="button"
          onClick={() => setTab('reviews')}
          className={`px-3 py-3 transition-colors ${tab === 'reviews' ? 'bg-white text-[#111827]' : 'text-[#374151]'}`}
        >
          Reviews
        </button>
      </div>

      {tab === 'availability' && (
        <div className="mt-6 rounded-[10px] border border-[#e5e7eb] p-5">
          <h2 className="flex items-center gap-2 text-[30px] sm:text-[34px]">
            <CalendarDays className="h-7 w-7 text-[#5a4a3b]" />
            Availability
          </h2>

          {hasAnyAvailability ? (
            <div className="mt-4 space-y-3">
              {schedule.map((item) => (
                <div
                  key={item.day}
                  className={`rounded-[8px] border p-3 ${item.slots.length > 0 ? 'border-[#ece7e2] bg-[#fcfaf8]' : 'border-[#f0f0f0] bg-[#fafafa]'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#1f2937]">{item.day}</p>
                    {item.slots.length === 0 ? (
                      <span className="text-[11px] text-[#9ca3af]">No slots selected</span>
                    ) : (
                      <span className="text-[11px] text-[#16a34a]">Selected</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.slots.length > 0 ? (
                      item.slots.map((slot) => (
                        <span
                          key={`${item.day}-${slot}`}
                          className="rounded bg-[#dcfce7] px-2.5 py-1 text-[12px] font-medium text-[#166534]"
                        >
                          {slot}
                        </span>
                      ))
                    ) : (
                      <span className="rounded bg-[#f3f4f6] px-2.5 py-1 text-[11px] text-[#9ca3af]">Not available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[8px] border border-dashed border-[#d8d8d8] bg-[#fafafa] px-4 py-6 text-center text-sm text-[#6b7280]">
              No availability added yet.
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {sitter.availability.length === 0 ? (
              <span className="rounded bg-[#f1ece7] px-3 py-1 text-[12px] text-[#6b6b6b]">No preferences added</span>
            ) : (
              sitter.availability.map((label) => (
                <span key={label} className="rounded bg-[#f1ece7] px-3 py-1 text-[12px] text-[#6b6b6b]">
                  {label}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'about' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-[10px] border border-[#e5e7eb] p-5">
            <h3 className="text-[32px]">Specialties</h3>
            {specialties.length === 0 ? (
              <p className="mt-3 text-sm text-[#6b7280]">No specialties added.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {specialties.map((item) => (
                  <span key={item} className="rounded bg-[#f1ece7] px-3 py-1 text-[12px] text-[#2b2b2b]">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-[#e5e7eb] p-5">
            <h3 className="text-[30px]">Skills & Services</h3>
            {skills.length === 0 ? (
              <p className="mt-3 text-sm text-[#6b7280]">No services added.</p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {skills.map((item) => (
                  <p key={item} className="flex items-center gap-2 text-base text-[#374151]">
                    <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-[#e5e7eb] p-5">
            <h3 className="flex items-center gap-2 text-[30px]">
              <Globe2 className="h-6 w-6 text-[#5a4a3b]" />
              Languages
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {languages.map((item) => (
                <span key={item} className="rounded border border-[#dcdcdc] bg-[#f9fafb] px-3 py-1 text-[12px] text-[#374151]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] border border-[#e5e7eb] p-5">
            <h3 className="flex items-center gap-2 text-[30px]">
              <ShieldCheck className="h-6 w-6 text-[#5a4a3b]" />
              Certifications
            </h3>
            {certifications.length === 0 ? (
              <p className="mt-4 text-sm font-medium text-[#374151]">No certifications added</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-[#374151]">
                {certifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-[10px] border border-[#e5e7eb] p-5">
            <h3 className="text-[30px]">About {sitter.name}</h3>
            <p className="mt-3 text-base leading-relaxed text-[#4b5563]">{sitter.about || 'No about details added.'}</p>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="mt-6 rounded-[10px] border border-[#e5e7eb] p-5">
          <h2 className="text-[34px]">Reviews</h2>
          {reviewItems.length === 0 ? (
            <div className="mt-5 rounded-[8px] border border-dashed border-[#d8d8d8] bg-[#fafafa] px-4 py-6 text-center">
              <p className="text-lg font-semibold text-[#1f2937]">
                {sitter.reviews === 0 ? 'No reviews added yet' : 'No written reviews available'}
              </p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {sitter.reviews === 0
                  ? 'This sitter has not received any reviews yet.'
                  : 'Rating data exists, but detailed review text is not available yet.'}
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {reviewItems.map((item) => (
                <article key={item.id} className="rounded-[8px] border border-[#ece7e2] bg-[#fcfaf8] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1f2937]">Homeowner review</p>
                    <div className="inline-flex items-center gap-1 text-[#f2b01f]">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={`${item.id}-${idx}`} className={`h-3.5 w-3.5 ${idx < item.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[#6b7280]">{item.date}</p>
                  <p className="mt-2 text-sm text-[#4b5563]">{item.comment}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
