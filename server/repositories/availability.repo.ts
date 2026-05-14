import { db } from '../db'

/** Convert "HH:MM" string to a Date with only the time portion set (UTC) */
function timeStringToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number)
  return new Date(Date.UTC(1970, 0, 1, h, m, 0, 0))
}

/** Convert a Date (time-only, UTC) back to "HH:MM" string */
function dateToTimeString(d: Date): string {
  const h = d.getUTCHours().toString().padStart(2, '0')
  const m = d.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

/** Normalise a schedule row from Prisma (DateTime time fields) to plain strings */
function normalizeSchedule(row: any) {
  return {
    ...row,
    startTime: row.startTime instanceof Date ? dateToTimeString(row.startTime) : row.startTime,
    endTime: row.endTime instanceof Date ? dateToTimeString(row.endTime) : row.endTime,
  }
}

export const availabilityRepo = {
  getSchedule: async (houseSitterId: string) => {
    const rows = await db.availabilitySchedule.findMany({
      where: { houseSitterId },
      orderBy: { dayOfWeek: 'asc' },
    })
    return rows.map(normalizeSchedule)
  },

  replaceSchedule: async (
    houseSitterId: string,
    schedules: Array<{
      dayOfWeek: number
      startTime: string
      endTime: string
      bufferMinutes: number
      isActive: boolean
    }>
  ) => {
    // Group by day and validate logic
    const byDay: Record<number, typeof schedules> = {}
    for (const s of schedules) {
      if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = []
      byDay[s.dayOfWeek].push(s)
    }

    for (const day of Object.keys(byDay)) {
      const daySlots = byDay[Number(day)].sort((a, b) => a.startTime.localeCompare(b.startTime))
      let lastEnd: number | null = null

      for (const slot of daySlots) {
        const start = timeStringToDate(slot.startTime).getTime()
        const end = timeStringToDate(slot.endTime).getTime()

        if (end <= start) {
          throw new Error(`Invalid slot: end time ${slot.endTime} must be after start time ${slot.startTime}`)
        }

        if (lastEnd !== null) {
          const gapMs = start - lastEnd
          if (gapMs < 30 * 60 * 1000) {
            throw new Error(
              `Slots must have at least a 30-minute gap. Gap between ${dateToTimeString(new Date(lastEnd))} and ${
                slot.startTime
              } is too small.`
            )
          }
        }
        lastEnd = end
      }
    }

    return db.$transaction(async (tx) => {
      await tx.availabilitySchedule.deleteMany({ where: { houseSitterId } })
      
      if (schedules.length > 0) {
        await tx.availabilitySchedule.createMany({
          data: schedules.map((s) => ({
            houseSitterId,
            dayOfWeek: s.dayOfWeek,
            startTime: timeStringToDate(s.startTime),
            endTime: timeStringToDate(s.endTime),
            bufferMinutes: s.bufferMinutes,
            isActive: s.isActive,
          })),
        })
      }

      const rows = await tx.availabilitySchedule.findMany({
        where: { houseSitterId },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      })
      return rows.map(normalizeSchedule)
    })
  },

  getBlockedTimes: (houseSitterId: string) =>
    db.blockedTime.findMany({
      where: { houseSitterId },
      orderBy: { startDatetime: 'asc' },
    }),

  addBlockedTime: (houseSitterId: string, data: { startDatetime: Date; endDatetime: Date; reason?: string }) =>
    db.blockedTime.create({ data: { houseSitterId, ...data } }),

  deleteBlockedTime: (id: string, houseSitterId: string) =>
    db.blockedTime.deleteMany({ where: { id, houseSitterId } }),

  getBlockedTimesInRange: (houseSitterId: string, start: Date, end: Date) =>
    db.blockedTime.findMany({
      where: {
        houseSitterId,
        startDatetime: { lt: end },
        endDatetime: { gt: start },
      },
    }),
}
