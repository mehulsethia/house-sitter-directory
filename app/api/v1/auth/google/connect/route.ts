import { NextRequest } from 'next/server'
import { requireCleaner } from '@/server/auth'
import { err, ok } from '@/server/response'
import { buildGoogleAuthUrl, buildGoogleCalendarState } from '@/server/services/google-calendar.service'
import { config } from '@/server/config'

export const GET = requireCleaner(async (req: NextRequest, _ctx, user) => {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET || !config.GOOGLE_REDIRECT_URI) {
    return err('Google Calendar integration is not configured yet.', 500)
  }

  const rawReturnTo = req.nextUrl.searchParams.get('return_to') ?? '/cleaner/profile?tab=availability'
  const returnTo = rawReturnTo.startsWith('/') ? rawReturnTo : '/cleaner/profile?tab=availability'
  const state = buildGoogleCalendarState({ user_id: user.id, return_to: returnTo })
  const url = buildGoogleAuthUrl(state)
  return ok({ url })
})
