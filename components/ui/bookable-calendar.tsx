import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookableCalendarProps {
  availableDates: string[]
  selectedDate: string
  onSelectDate: (isoDate: string) => void
  daysAhead?: number
  className?: string
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function BookableCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  daysAhead = 45,
  className,
}: BookableCalendarProps) {
  const today = useMemo(() => {
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  }, [])

  const maxDate = useMemo(() => {
    const max = new Date(today)
    max.setUTCDate(max.getUTCDate() + daysAhead - 1)
    return max
  }, [daysAhead, today])

  const minMonth = useMemo(
    () => ({ year: today.getUTCFullYear(), month: today.getUTCMonth() }),
    [today],
  )
  const maxMonth = useMemo(
    () => ({ year: maxDate.getUTCFullYear(), month: maxDate.getUTCMonth() }),
    [maxDate],
  )

  const [visibleYear, setVisibleYear] = useState(minMonth.year)
  const [visibleMonth, setVisibleMonth] = useState(minMonth.month)

  const availableSet = useMemo(() => new Set(availableDates), [availableDates])

  const monthLabel = useMemo(
    () =>
      new Date(Date.UTC(visibleYear, visibleMonth, 1)).toLocaleDateString('en-IE', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    [visibleMonth, visibleYear],
  )

  const canGoPrev =
    visibleYear > minMonth.year ||
    (visibleYear === minMonth.year && visibleMonth > minMonth.month)

  const canGoNext =
    visibleYear < maxMonth.year ||
    (visibleYear === maxMonth.year && visibleMonth < maxMonth.month)

  const dayCells = useMemo(() => {
    const firstDay = new Date(Date.UTC(visibleYear, visibleMonth, 1))
    const daysInMonth = new Date(Date.UTC(visibleYear, visibleMonth + 1, 0)).getUTCDate()
    const firstWeekdayMondayIndex = (firstDay.getUTCDay() + 6) % 7

    const cells: Array<{ day: number; iso: string } | null> = []
    for (let i = 0; i < firstWeekdayMondayIndex; i++) cells.push(null)

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toIsoDate(visibleYear, visibleMonth, day)
      cells.push({ day, iso })
    }

    return cells
  }, [visibleMonth, visibleYear])

  function goPrevMonth() {
    if (!canGoPrev) return
    if (visibleMonth === 0) {
      setVisibleMonth(11)
      setVisibleYear((y) => y - 1)
      return
    }
    setVisibleMonth((m) => m - 1)
  }

  function goNextMonth() {
    if (!canGoNext) return
    if (visibleMonth === 11) {
      setVisibleMonth(0)
      setVisibleYear((y) => y + 1)
      return
    }
    setVisibleMonth((m) => m + 1)
  }

  return (
    <div className={cn('rounded-2xl border bg-white p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          disabled={!canGoPrev}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-slate-900">{monthLabel}</p>
        <button
          type="button"
          onClick={goNextMonth}
          disabled={!canGoNext}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {dayCells.map((cell, idx) => {
          if (!cell) return <div key={`blank-${idx}`} className="h-10" />

          const dateObj = new Date(`${cell.iso}T00:00:00.000Z`)
          const outOfRange = dateObj < today || dateObj > maxDate
          const isAvailable = availableSet.has(cell.iso)
          const disabled = outOfRange || !isAvailable
          const selected = selectedDate === cell.iso

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => !disabled && onSelectDate(cell.iso)}
              disabled={disabled}
              className={cn(
                'h-10 rounded-lg text-sm font-medium transition-colors',
                selected && 'bg-primary text-primary-foreground',
                !selected && !disabled && 'bg-slate-50 text-slate-800 hover:bg-slate-100',
                disabled && 'cursor-not-allowed bg-slate-50 text-slate-300 line-through',
              )}
              aria-label={cell.iso}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function toIsoDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)
}
