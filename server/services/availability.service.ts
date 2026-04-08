import { availabilityRepo } from '../repositories/availability.repo'
import { bookingRepo } from '../repositories/booking.repo'

interface TimeSlot {
  start: string // ISO string
  end: string
}

export const availabilityService = {
  async getAvailableSlots(
    cleanerId: string,
    dateStr: string,
    durationHours: number,
  ): Promise<TimeSlot[]> {
    const date = new Date(dateStr)
    const dayOfWeek = isoWeekday(date) // 1=Mon...7=Sun

    const [schedules, blockedTimes, existingBookings] = await Promise.all([
      availabilityRepo.getSchedule(cleanerId),
      availabilityRepo.getBlockedTimesInRange(
        cleanerId,
        startOfDay(date),
        endOfDay(date),
      ),
      bookingRepo.findActiveForCleaner(cleanerId, startOfDay(date), endOfDay(date)),
    ])

    const daySchedules = schedules
      .filter((s) => s.dayOfWeek === dayOfWeek && s.isActive)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    if (daySchedules.length === 0) return []

    const durationMs = durationHours * 60 * 60 * 1000
    const allSlots: TimeSlot[] = []

    for (const schedule of daySchedules) {
      const [startH, startM] = schedule.startTime.split(':').map(Number)
      const [endH, endM] = schedule.endTime.split(':').map(Number)
      const bufferMs = schedule.bufferMinutes * 60 * 1000

      const dayStart = new Date(date)
      dayStart.setUTCHours(startH, startM, 0, 0)

      const dayEnd = new Date(date)
      dayEnd.setUTCHours(endH, endM, 0, 0)

      let cursor = dayStart.getTime()

      while (cursor + durationMs <= dayEnd.getTime()) {
        const slotStart = new Date(cursor)
        const slotEnd = new Date(cursor + durationMs)

        const hasConflict =
          blockedTimes.some(
            (b) => b.startDatetime < slotEnd && b.endDatetime > slotStart,
          ) ||
          existingBookings.some(
            (b) => b.scheduledStart < slotEnd && b.scheduledEnd > slotStart,
          )

        if (!hasConflict) {
          allSlots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() })
        }

        cursor += durationMs + bufferMs
      }
    }

    const uniqueSlots = new Map<string, TimeSlot>()
    for (const slot of allSlots) {
      uniqueSlots.set(`${slot.start}_${slot.end}`, slot)
    }
    return Array.from(uniqueSlots.values())
  },
}

function isoWeekday(date: Date): number {
  const d = date.getUTCDay() // 0=Sun...6=Sat
  return d === 0 ? 7 : d
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(23, 59, 59, 999)
  return d
}
