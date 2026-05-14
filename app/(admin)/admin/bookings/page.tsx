'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { BookingStatusBadge } from '@/components/booking-status-badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/loading-spinner'
import { EmptyState } from '@/components/empty-state'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BookingRead } from '@/types'
import { toast } from 'sonner'

// ── Status groupings ──────────────────────────────────────────────────────────

const GROUPS: { key: string; label: string; statuses: string[] }[] = [
  {
    key: 'all',
    label: 'All',
    statuses: [],
  },
  {
    key: 'pending',
    label: 'Pending',
    statuses: ['pending'],
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    statuses: ['confirmed', 'accepted', 'in_progress'],
  },
  {
    key: 'completed',
    label: 'Completed',
    statuses: ['completed'],
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    statuses: ['cancelled', 'declined'],
  },
  {
    key: 'expired',
    label: 'Expired',
    statuses: ['expired'],
  },
  {
    key: 'failed_payments',
    label: 'Failed payments',
    statuses: ['failed_payments'],
  },
]

const PAGE_SIZE = 20

// ── Booking table ─────────────────────────────────────────────────────────────

function BookingTable({ bookings }: { bookings: BookingRead[] }) {
  if (bookings.length === 0) return <EmptyState title="No bookings" />

  return (
    <div className="internal-table-wrap">
      <table className="internal-table text-sm">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Service</th>
            <th>Location</th>
            <th>Scheduled</th>
            <th>Status</th>
            <th className="text-right">Amount</th>
            <th className="text-right">Platform Fee (10%)</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td className="px-4 py-3 min-w-[140px]">
                <span className="font-mono text-xs text-muted-foreground">#{b.id.slice(0, 8)}</span>
                <p className="text-[10px] text-muted-foreground">{formatDate(b.created_at)}</p>
              </td>
              <td className="px-4 py-3 min-w-[120px] capitalize">{b.service_type.replace(/_/g, ' ')}</td>
              <td className="px-4 py-3 min-w-[110px] text-muted-foreground">
                {b.city}, {b.postcode}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {formatDate(b.scheduled_start)}
              </td>
              <td className="px-4 py-3">
                <BookingStatusBadge status={b.status} proposalBy={b.proposal_by} />
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {formatCurrency(b.total_amount)}
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                {formatCurrency(b.platform_fee)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminBookingsPage() {
  const searchParams = useSearchParams()
  const [activeGroup, setActiveGroup] = useState('all')
  const [bookings, setBookings] = useState<BookingRead[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const activeGroupRef = useRef(activeGroup)
  const pageRef = useRef(page)
  const cacheRef = useRef(
    new Map<string, { items: BookingRead[]; total: number; hasNext: boolean }>(),
  )
  const inFlightRef = useRef(new Map<string, Promise<void>>())

  function cacheKey(group: string, p: number) {
    return `${group}::${p}`
  }

  function applyCacheEntry(entry: { items: BookingRead[]; total: number; hasNext: boolean }) {
    setBookings(entry.items)
    setTotal(entry.total)
    setHasNext(entry.hasNext)
  }

  const load = useCallback(async (group: string, p: number, opts?: { background?: boolean; force?: boolean }) => {
    const key = cacheKey(group, p)
    const cached = cacheRef.current.get(key)
    const background = Boolean(opts?.background)
    const force = Boolean(opts?.force)

    if (cached && !force) {
      applyCacheEntry(cached)
      setLoading(false)
      return
    }

    if (!background) {
      if (!cached) setLoading(true)
      if (cached) setIsRefreshing(true)
    }

    const running = inFlightRef.current.get(key)
    if (running) {
      await running
      if (!background) {
        setLoading(false)
        setIsRefreshing(false)
      }
      return
    }

    const requestPromise = (async () => {
      try {
        const g = GROUPS.find((entry) => entry.key === group)
        const statusParam = g && g.statuses.length > 0
          ? g.statuses.join(',')
          : undefined
        const res = await adminApi.listBookings({ page: p, status: statusParam })
        const nextEntry = {
          items: res.data?.items ?? [],
          total: res.data?.total ?? 0,
          hasNext: res.data?.has_next ?? false,
        }
        cacheRef.current.set(key, nextEntry)

        if (activeGroupRef.current === group && pageRef.current === p) {
          applyCacheEntry(nextEntry)
        }
      } catch {
        if (!background && !cached) {
          toast.error('Failed to load bookings.')
        }
      } finally {
        inFlightRef.current.delete(key)
        if (activeGroupRef.current === group && pageRef.current === p && !background) {
          setLoading(false)
          setIsRefreshing(false)
        }
      }
    })()

    inFlightRef.current.set(key, requestPromise)
    await requestPromise
  }, [])

  useEffect(() => {
    activeGroupRef.current = activeGroup
  }, [activeGroup])

  useEffect(() => {
    pageRef.current = page
  }, [page])

  useEffect(() => {
    load(activeGroup, page)
  }, [activeGroup, page, load])

  useEffect(() => {
    const filter = searchParams.get('filter')
    if (filter && GROUPS.some((g) => g.key === filter)) {
      setActiveGroup(filter)
      setPage(1)
    }
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      // Warm first-page caches for all groups so tab switches feel instant.
      for (const group of GROUPS) {
        if (cancelled) return
        const key = cacheKey(group.key, 1)
        if (cacheRef.current.has(key)) continue
        await load(group.key, 1, { background: true })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [load])

  return (
    <div className="internal-page space-y-6">
      <Tabs value={activeGroup} onValueChange={v => { setActiveGroup(v); setPage(1) }}>
        <TabsList className="scrollbar-hide h-auto w-full justify-start overflow-x-auto whitespace-nowrap pb-1 [-webkit-overflow-scrolling:touch]">
          {GROUPS.map(g => (
            <TabsTrigger key={g.key} value={g.key}>
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {GROUPS.map(g => (
          <TabsContent key={g.key} value={g.key} className="mt-4">
            {loading && bookings.length === 0 ? (
              <LoadingSpinner />
            ) : (
              <BookingTable bookings={bookings} />
            )}
          </TabsContent>
        ))}
      </Tabs>
      {isRefreshing && (
        <p className="text-xs text-muted-foreground">Refreshing bookings…</p>
      )}

      {/* Pagination */}
      {!loading && total > PAGE_SIZE && (
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Page {page} · {Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPage(p => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
