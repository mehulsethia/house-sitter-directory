import { NextRequest, NextResponse } from 'next/server'
import { requireCleaner } from '@/server/auth'
import { googleCalendarService, verifyGoogleCalendarState } from '@/server/services/google-calendar.service'

export const GET = requireCleaner(async (req: NextRequest, _ctx, user) => {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const error = req.nextUrl.searchParams.get('error')

  const origin = req.nextUrl.origin
  const fallbackPath = '/house-sitters/profile?tab=availability'

  if (error) {
    return NextResponse.redirect(`${origin}${fallbackPath}&google_calendar=failed`)
  }
  if (!code || !state) {
    return NextResponse.redirect(`${origin}${fallbackPath}&google_calendar=missing_code`)
  }

  let returnTo = fallbackPath
  try {
    const parsedState = verifyGoogleCalendarState(state)
    if (parsedState.user_id !== user.id) {
      return NextResponse.redirect(`${origin}${fallbackPath}&google_calendar=state_mismatch`)
    }
    if (parsedState.return_to) returnTo = parsedState.return_to

    await googleCalendarService.exchangeCodeAndStoreToken(user.id, code)
    await googleCalendarService.syncCleanerUpcomingConfirmedBookings(user.id)

    const url = new URL(returnTo, origin)
    url.searchParams.set('google_calendar', 'connected')
    return NextResponse.redirect(url.toString())
  } catch {
    const url = new URL(returnTo, origin)
    url.searchParams.set('google_calendar', 'failed')
    return NextResponse.redirect(url.toString())
  }
})
