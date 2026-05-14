import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth'
import { messageRepo } from '@/server/repositories/message.repo'
import { bookingRepo } from '@/server/repositories/booking.repo'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok, err } from '@/server/response'
import { sendMessageSchema } from '@/server/schemas/message.schema'

const CHAT_WINDOW_MINUTES = 30

function isWithinChatWindow(booking: { scheduledEnd?: Date | null }) {
  if (!booking.scheduledEnd) return false
  const cutoff = booking.scheduledEnd.getTime() + CHAT_WINDOW_MINUTES * 60 * 1000
  return Date.now() <= cutoff
}

async function isParty(bookingId: string, userId: string, role: string) {
  const booking = await bookingRepo.findById(bookingId)
  if (!booking) return null
  if (role === 'house_sit') {
    const houseSit = await houseSitRepo.findByUserId(userId)
    return houseSit && booking.houseSitId === houseSit.id ? booking : null
  }
  if (role === 'house_sitter') {
    const houseSitter = await houseSitterRepo.findByUserId(userId)
    return houseSitter && booking.houseSitterId === houseSitter.id ? booking : null
  }
  return booking // admin
}

export const GET = requireAuth(async (_req, ctx, user) => {
  const { bookingId } = await ctx.params
  const booking = await isParty(bookingId, user.id, user.role)
  if (!booking) return err('Forbidden', 403)
  if (!['confirmed', 'in_progress', 'completed', 'disputed'].includes(booking.status) || !isWithinChatWindow(booking)) {
    return err('Chat is unavailable for this booking.', 400)
  }

  await messageRepo.markReadForBooking(bookingId, user.id)
  const messages = await messageRepo.findByBookingId(bookingId)
  return ok(messages)
})

export const POST = requireAuth(async (req: NextRequest, ctx, user) => {
  const { bookingId } = await ctx.params
  const booking = await isParty(bookingId, user.id, user.role)
  if (!booking) return err('Forbidden', 403)
  if (!['confirmed', 'in_progress', 'completed', 'disputed'].includes(booking.status)) {
    return err('Chat is only available for confirmed bookings', 400)
  }
  if (!isWithinChatWindow(booking)) {
    return err(
      `Chat is unavailable after ${CHAT_WINDOW_MINUTES} minutes from the scheduled end time`,
      400,
    )
  }

  const body = await req.json()
  const parsed = sendMessageSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)

  const message = await messageRepo.send(bookingId, user.id, parsed.data.content)
  return ok(message, 201)
})
