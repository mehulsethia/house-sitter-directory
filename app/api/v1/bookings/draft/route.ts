import { NextRequest } from 'next/server'
import { requireClient } from '@/server/auth'
import { clientRepo } from '@/server/repositories/house-sit.repo'
import { cleanerRepo } from '@/server/repositories/house-sitter.repo'
import { bookingRepo } from '@/server/repositories/booking.repo'
import { bookingFlowDraftRepo } from '@/server/repositories/booking-flow-draft.repo'
import { ok, err } from '@/server/response'
import { bookingFlowDraftQuerySchema, saveBookingFlowDraftSchema } from '@/server/schemas/booking.schema'

function isPaymentAuthorized(status?: string | null) {
  return ['authorized', 'captured', 'transferred'].includes(String(status ?? ''))
}

export const GET = requireClient(async (req: NextRequest, _ctx, user) => {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = bookingFlowDraftQuerySchema.safeParse(params)
  if (!parsed.success) return err(parsed.error.message, 422)

  const client = await clientRepo.findByUserId(user.id)
  if (!client) return err('Client profile not found', 404)

  const draft = await bookingFlowDraftRepo.findByClientAndCleaner(client.id, parsed.data.cleaner_id)
  return ok(draft)
})

export const PUT = requireClient(async (req: NextRequest, _ctx, user) => {
  const body = await req.json().catch(() => null)
  const parsed = saveBookingFlowDraftSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)

  const client = await clientRepo.findByUserId(user.id)
  if (!client) return err('Client profile not found', 404)

  const cleaner = await cleanerRepo.findById(parsed.data.cleaner_id)
  if (!cleaner) return err('Cleaner not found', 404)

  const existing = await bookingFlowDraftRepo.findByClientAndCleaner(client.id, cleaner.id)

  if (parsed.data.booking_id) {
    const booking = await bookingRepo.findById(parsed.data.booking_id)
    if (!booking) return err('Booking not found', 404)
    if (booking.clientId !== client.id || booking.cleanerId !== cleaner.id) return err('Forbidden', 403)

    const lockedPaymentRequired =
      ['draft', 'pending'].includes(String(booking.status ?? '')) &&
      !isPaymentAuthorized(booking.payment?.status)

    if (lockedPaymentRequired && parsed.data.last_step < 3) {
      return err('Booking is locked in Payment Required state. Continue payment or cancel draft.', 409)
    }
  }

  const existingPayload =
    existing?.payload && typeof existing.payload === 'object' && !Array.isArray(existing.payload)
      ? (existing.payload as Record<string, any>)
      : {}
  const incomingPayload = parsed.data.payload ?? {}
  const mergedPayload = { ...existingPayload, ...incomingPayload } as Record<string, any>
  const incomingSelectedSlot = (incomingPayload as any).selectedSlot
  const incomingDate = (incomingPayload as any).date
  const incomingDuration = (incomingPayload as any).duration
  if ((!('selectedSlot' in incomingPayload) || !String(incomingSelectedSlot ?? '').trim()) && existing?.selectedSlot) {
    mergedPayload.selectedSlot = existing.selectedSlot.toISOString()
  }
  if ((!('date' in incomingPayload) || !String(incomingDate ?? '').trim()) && existing?.selectedDate) {
    mergedPayload.date = existing.selectedDate
  }
  if ((!('duration' in incomingPayload) || !Number(incomingDuration)) && existing?.durationHours != null) {
    mergedPayload.duration = Number(existing.durationHours)
  }

  const draft = await bookingFlowDraftRepo.upsertByClientAndCleaner({
    clientId: client.id,
    cleanerId: cleaner.id,
    bookingId: parsed.data.booking_id ?? null,
    lastStep: parsed.data.last_step,
    durationHours: parsed.data.duration_hours ?? (Number(mergedPayload.duration || existing?.durationHours || 0) || null),
    selectedDate: parsed.data.selected_date ?? (String(mergedPayload.date ?? '').trim() || existing?.selectedDate || null),
    selectedSlot: parsed.data.selected_slot
      ? new Date(parsed.data.selected_slot)
      : (String(mergedPayload.selectedSlot ?? '').trim()
          ? new Date(String(mergedPayload.selectedSlot))
          : existing?.selectedSlot ?? null),
    payload: mergedPayload,
  })

  return ok(draft)
})

export const POST = PUT

export const DELETE = requireClient(async (req: NextRequest, _ctx, user) => {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = bookingFlowDraftQuerySchema.safeParse(params)
  if (!parsed.success) return err(parsed.error.message, 422)

  const client = await clientRepo.findByUserId(user.id)
  if (!client) return err('Client profile not found', 404)

  await bookingFlowDraftRepo.clearByClientAndCleaner(client.id, parsed.data.cleaner_id)
  return ok({ removed: true })
})
