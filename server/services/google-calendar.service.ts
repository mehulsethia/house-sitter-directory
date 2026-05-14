import jwt from 'jsonwebtoken'
import { db } from '@/server/db'
import { config } from '@/server/config'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_EVENTS_SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const GOOGLE_DEFAULT_CALENDAR_ID = 'primary'
const CALENDAR_SYNC_STATUSES = ['confirmed', 'in_progress'] as const
const APP_TIMEZONE = 'Europe/Nicosia'

const GOOGLE_STATE_TTL_SECONDS = 10 * 60

type GoogleTokenRow = {
  userId: string
  accessToken: string
  refreshToken: string
  tokenExpiry: Date
  calendarId: string
}

type CalendarStatePayload = {
  user_id: string
  return_to?: string
}

export function buildGoogleCalendarState(payload: CalendarStatePayload) {
  return jwt.sign(payload, config.SUPABASE_JWT_SECRET, { expiresIn: GOOGLE_STATE_TTL_SECONDS })
}

export function verifyGoogleCalendarState(state: string): CalendarStatePayload {
  return jwt.verify(state, config.SUPABASE_JWT_SECRET) as CalendarStatePayload
}

export function buildGoogleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: config.GOOGLE_CLIENT_ID,
    redirect_uri: config.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: `${GOOGLE_CALENDAR_EVENTS_SCOPE} openid email profile`,
    state,
  })
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
}

export const googleCalendarService = {
  async exchangeCodeAndStoreToken(userId: string, code: string) {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET || !config.GOOGLE_REDIRECT_URI) {
      throw new Error('Google OAuth is not configured on the server.')
    }

    const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: config.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokenJson = await tokenRes.json().catch(() => ({}))
    if (!tokenRes.ok || !tokenJson?.access_token) {
      throw new Error(getGoogleErrorMessage(tokenJson) ?? 'Failed to exchange Google OAuth code.')
    }

    const current = await db.googleCalendarToken.findUnique({ where: { userId } })
    const refreshToken = String(tokenJson.refresh_token ?? current?.refreshToken ?? '').trim()
    if (!refreshToken) {
      throw new Error('Google refresh token was not returned. Reconnect with Google consent.')
    }

    const expiresIn = Number(tokenJson.expires_in ?? 3600)
    const tokenExpiry = new Date(Date.now() + Math.max(expiresIn - 60, 60) * 1000)

    await db.googleCalendarToken.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokenJson.access_token,
        refreshToken,
        tokenExpiry,
        calendarId: GOOGLE_DEFAULT_CALENDAR_ID,
      },
      update: {
        accessToken: tokenJson.access_token,
        refreshToken,
        tokenExpiry,
      },
    })
  },

  async getStatus(userId: string) {
    const token = await db.googleCalendarToken.findUnique({ where: { userId } })
    return {
      connected: Boolean(token),
      calendar_id: token?.calendarId ?? null,
      expires_at: token?.tokenExpiry?.toISOString() ?? null,
    }
  },

  async disconnect(userId: string) {
    await db.googleCalendarToken.deleteMany({ where: { userId } })
  },

  async syncCleanerUpcomingConfirmedBookings(userId: string) {
    const houseSitter = await houseSitterRepo.findByUserId(userId)
    if (!houseSitter) return { synced: 0 }

    const bookings = await db.booking.findMany({
      where: {
        houseSitterId: houseSitter.id,
        status: { in: [...CALENDAR_SYNC_STATUSES] },
        scheduledEnd: { gte: new Date() },
      },
      select: { id: true },
    })

    let synced = 0
    for (const booking of bookings) {
      const ok = await this.upsertCleanerBookingEvent(booking.id)
      if (ok) synced += 1
    }

    return { synced }
  },

  async upsertCleanerBookingEvent(bookingId: string) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        houseSitter: { include: { user: true } },
        houseSit: { include: { user: true } },
      },
    })
    if (!booking) return false
    if (!CALENDAR_SYNC_STATUSES.includes(booking.status as (typeof CALENDAR_SYNC_STATUSES)[number])) {
      return false
    }
    if (booking.scheduledEnd.getTime() < Date.now()) return false

    const token = await db.googleCalendarToken.findUnique({ where: { userId: booking.houseSitter.userId } })
    if (!token) return false

    const eventPayload = {
      summary: `MaidHive Booking: ${formatServiceType(booking.serviceType)}`,
      description: [
        `Booking ID: ${booking.id}`,
        `HouseSit: ${booking.houseSit.user.name ?? booking.houseSit.user.email}`,
        `Address: ${booking.address}, ${booking.city}, ${booking.postcode}`,
        booking.specialInstructions ? `Notes: ${booking.specialInstructions}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      start: {
        dateTime: booking.scheduledStart.toISOString(),
        timeZone: APP_TIMEZONE,
      },
      end: {
        dateTime: booking.scheduledEnd.toISOString(),
        timeZone: APP_TIMEZONE,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'email', minutes: 60 },
        ],
      },
    }

    const calendarId = encodeURIComponent(token.calendarId || GOOGLE_DEFAULT_CALENDAR_ID)
    const existingEventId = booking.houseSitterGcalEventId

    if (existingEventId) {
      const updateUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(existingEventId)}`
      const updated = await requestCalendarJsonWithFallback(booking.houseSitter.userId, updateUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      })

      if (updated.ok) return true
      if (updated.status !== 404) return false
    }

    const createUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`
    const created = await requestCalendarJsonWithFallback(booking.houseSitter.userId, createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    })

    if (!created.ok || !created.json?.id) return false

    await db.booking.update({
      where: { id: booking.id },
      data: { houseSitterGcalEventId: String(created.json.id) },
    })

    return true
  },

  async removeCleanerBookingEvent(bookingId: string) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        houseSitterGcalEventId: true,
        houseSitter: { select: { userId: true } },
      },
    })
    if (!booking?.houseSitterGcalEventId) return

    const token = await db.googleCalendarToken.findUnique({ where: { userId: booking.houseSitter.userId } })
    if (!token) {
      await db.booking.update({
        where: { id: booking.id },
        data: { houseSitterGcalEventId: null },
      })
      return
    }

    const calendarId = encodeURIComponent(token.calendarId || GOOGLE_DEFAULT_CALENDAR_ID)
    const deleteUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(booking.houseSitterGcalEventId)}`
    await requestCalendarJsonWithFallback(booking.houseSitter.userId, deleteUrl, { method: 'DELETE' })

    await db.booking.update({
      where: { id: booking.id },
      data: { houseSitterGcalEventId: null },
    })
  },
}

function formatServiceType(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function getGoogleErrorMessage(payload: any): string | null {
  if (!payload) return null
  const nested = payload?.error?.message
  if (typeof nested === 'string' && nested.trim()) return nested
  if (typeof payload?.error_description === 'string' && payload.error_description.trim()) {
    return payload.error_description
  }
  if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error
  if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message
  return null
}

function shouldRefreshToken(token: GoogleTokenRow) {
  return token.tokenExpiry.getTime() <= Date.now() + 60 * 1000
}

async function getValidAccessToken(userId: string, forceRefresh = false): Promise<GoogleTokenRow> {
  const token = await db.googleCalendarToken.findUnique({ where: { userId } })
  if (!token) {
    throw new Error('Google Calendar is not connected.')
  }

  if (!forceRefresh && !shouldRefreshToken(token)) {
    return token
  }

  const refreshed = await refreshAccessToken(token)
  return refreshed
}

async function refreshAccessToken(token: GoogleTokenRow): Promise<GoogleTokenRow> {
  const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      refresh_token: token.refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const tokenJson = await tokenRes.json().catch(() => ({}))

  if (!tokenRes.ok || !tokenJson?.access_token) {
    throw new Error(getGoogleErrorMessage(tokenJson) ?? 'Failed to refresh Google Calendar token.')
  }

  const expiresIn = Number(tokenJson.expires_in ?? 3600)
  const tokenExpiry = new Date(Date.now() + Math.max(expiresIn - 60, 60) * 1000)
  const nextRefreshToken = String(tokenJson.refresh_token ?? token.refreshToken)

  return db.googleCalendarToken.update({
    where: { userId: token.userId },
    data: {
      accessToken: tokenJson.access_token,
      refreshToken: nextRefreshToken,
      tokenExpiry,
    },
  })
}

async function requestCalendarJsonWithFallback(
  userId: string,
  url: string,
  init: RequestInit,
) {
  const firstToken = await getValidAccessToken(userId)
  let response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${firstToken.accessToken}`,
    },
  })

  if (response.status === 401) {
    const refreshedToken = await getValidAccessToken(userId, true)
    response = await fetch(url, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${refreshedToken.accessToken}`,
      },
    })
  }

  let json: any = null
  if (response.status !== 204) {
    json = await response.json().catch(() => null)
  }

  if (!response.ok && response.status !== 404) {
    console.error('Google Calendar API error:', response.status, getGoogleErrorMessage(json) ?? json)
  }

  return { ok: response.ok, status: response.status, json }
}
