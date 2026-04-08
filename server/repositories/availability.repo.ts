import { db } from '../db'

export const availabilityRepo = {
  getSchedule: (cleanerId: string) =>
    db.availabilitySchedule.findMany({
      where: { cleanerId },
      orderBy: { dayOfWeek: 'asc' },
    }),

  replaceSchedule: async (
    cleanerId: string,
    schedules: Array<{
      dayOfWeek: number
      startTime: string
      endTime: string
      bufferMinutes: number
      isActive: boolean
    }>
  ) => {
    await db.availabilitySchedule.deleteMany({ where: { cleanerId } })
    if (schedules.length === 0) return []

    await db.availabilitySchedule.createMany({
      data: schedules.map((s) => ({
        cleanerId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        bufferMinutes: s.bufferMinutes,
        isActive: s.isActive,
      })),
    })

    return db.availabilitySchedule.findMany({
      where: { cleanerId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
  },

  getBlockedTimes: (cleanerId: string) =>
    db.blockedTime.findMany({
      where: { cleanerId },
      orderBy: { startDatetime: 'asc' },
    }),

  addBlockedTime: (cleanerId: string, data: { startDatetime: Date; endDatetime: Date; reason?: string }) =>
    db.blockedTime.create({ data: { cleanerId, ...data } }),

  deleteBlockedTime: (id: string, cleanerId: string) =>
    db.blockedTime.deleteMany({ where: { id, cleanerId } }),

  getBlockedTimesInRange: (cleanerId: string, start: Date, end: Date) =>
    db.blockedTime.findMany({
      where: {
        cleanerId,
        startDatetime: { lt: end },
        endDatetime: { gt: start },
      },
    }),
}
