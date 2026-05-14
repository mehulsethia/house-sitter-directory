/**
 * Typed API houseSit for the House Sitter Directory FastAPI backend.
 * Every request attaches the Supabase JWT from the current session.
 */
import { getAccessToken } from '@/lib/auth-cache'
import { getApiBaseUrl } from '@/lib/api-base'
import type {
  AdminHouseSitter,
  AdminDispute,
  AdminOpsQueues,
  AdminStats,
  AdminUser,
  APIResponse,
  BookingCreate,
  BookingFlowDraftRead,
  BookingRead,
  HouseSitterRead,
  HouseSitterOnboardingProgress,
  HouseSitterSummary,
  FavoriteHouseSitter,
  HouseSitAddressCreate,
  HouseSitAddressUpdate,
  HouseSitAddressRead,
  HouseSitProfileRead,
  HouseSitDispute,
  MessageRead,
  NotificationRead,
  PaginatedResponse,
  PaymentIntentResponse,
  PriceBreakdown,
  ReviewCreate,
  ReviewRead,
  UserRead,
  UserUpdate,
} from '@/types'

const BASE = getApiBaseUrl()
const GET_CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_API_CLIENT_CACHE_TTL_MS ?? 30000)

type AnyObj = Record<string, any>
type CachedResponse = { expiresAt: number; data: unknown }

const getResponseCache = new Map<string, CachedResponse>()
const inFlightGetRequests = new Map<string, Promise<unknown>>()

function toUserFriendlyErrorMessage(message: string, fallbackStatus: number): string {
  const text = String(message || '').trim()
  const lower = text.toLowerCase()

  if (!text) return `Something went wrong. Please try again. (${fallbackStatus})`
  if (lower === 'unknown error') return 'Something went wrong. Please try again.'
  if (lower.includes('invalid datetime')) return 'Please select a valid date and time.'
  if (lower.includes('booking draft status is not enabled') || lower.includes('status migration')) {
    return 'Booking is temporarily unavailable. Please try again in a few minutes.'
  }
  if (lower.includes('request failed:')) return `Request failed (${fallbackStatus}). Please try again.`
  if (lower.includes('zoderror') || lower.includes('validation')) return 'Some details are invalid. Please check and try again.'

  return text
}

function normalizePaginated<T>(payload: AnyObj, key: string): PaginatedResponse<T> {
  const items = (payload?.items ?? payload?.[key] ?? []) as T[]
  const total = Number(payload?.total ?? items.length ?? 0)
  const page = Number(payload?.page ?? 1)
  const pageSize = Number(payload?.page_size ?? payload?.pageSize ?? 20)
  return {
    items,
    total,
    page,
    page_size: pageSize,
    has_next: page * pageSize < total,
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function clearApiCache() {
  getResponseCache.clear()
  inFlightGetRequests.clear()
}

async function executeRequest<T>(path: string, options: RequestInit, method: string): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...options,
    cache: 'no-store',
    credentials: 'include',
    headers: { ...headers, ...options.headers },
  })
  if (!res.ok) {
    if (method !== 'GET') {
      // A failed mutation can still change server state (e.g. idempotent endpoints).
      // Clear cached reads so admin pages don't keep stale status cards.
      clearApiCache()
    }
    let parsedError: any = null
    try {
      parsedError = await res.json()
    } catch {
      const rawText = await res.text().catch(() => '')
      parsedError = { detail: rawText || 'Unknown error' }
    }
    const detail = parsedError?.detail
    const detailMessage =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail
            .map((entry) => entry?.message ?? entry?.msg ?? entry?.detail)
            .filter(Boolean)
            .join(', ')
          : detail && typeof detail === 'object'
            ? detail.message ?? detail.error ?? null
            : null
    const rawMessage = String(detailMessage ?? parsedError?.message ?? `Request failed: ${res.status}`)
    throw new Error(toUserFriendlyErrorMessage(rawMessage, res.status))
  }

  const json = (await res.json()) as T
  if (method !== 'GET') {
    // Avoid stale cross-page reads immediately after writes.
    clearApiCache()
  }
  return json
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = String(options.method ?? 'GET').toUpperCase()

  if (method !== 'GET' || GET_CACHE_TTL_MS <= 0) {
    return executeRequest<T>(path, options, method)
  }

  const cacheKey = `${method}:${path}`
  const now = Date.now()
  const cached = getResponseCache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return cached.data as T
  }

  const inflight = inFlightGetRequests.get(cacheKey)
  if (inflight) {
    return inflight as Promise<T>
  }

  const fetchPromise = executeRequest<T>(path, options, method)
    .then((data) => {
      getResponseCache.set(cacheKey, { data, expiresAt: Date.now() + GET_CACHE_TTL_MS })
      return data
    })
    .finally(() => {
      inFlightGetRequests.delete(cacheKey)
    })

  inFlightGetRequests.set(cacheKey, fetchPromise as Promise<unknown>)
  return fetchPromise
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  me: () => request<APIResponse<UserRead>>('/auth/me'),
  sync: (body: { name?: string; phone?: string; role?: 'house_sit' | 'house_sitter'; experience?: number }) =>
    request<APIResponse<UserRead>>('/auth/sync', { method: 'POST', body: JSON.stringify(body) }),
}

export const googleCalendarApi = {
  getConnectUrl: (returnTo = '/house-sitters/profile?tab=availability') =>
    request<APIResponse<{ url: string }>>(
      `/auth/google/connect?return_to=${encodeURIComponent(returnTo)}`,
    ),
  getStatus: () =>
    request<APIResponse<{ connected: boolean; calendar_id?: string | null; expires_at?: string | null }>>(
      '/auth/google/status',
    ),
  disconnect: () =>
    request<APIResponse<{ connected: boolean }>>('/auth/google/disconnect', { method: 'POST' }),
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const usersApi = {
  updateMe: (body: UserUpdate) =>
    request<APIResponse<UserRead>>('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
}

export const phoneVerificationApi = {
  sendCode: (phone: string) =>
    request<APIResponse<{ sent: boolean }>>('/phone-verification/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  verifyCode: (phone: string, code: string) =>
    request<APIResponse<{ verified: boolean }>>('/phone-verification/check', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),
}

// ---------------------------------------------------------------------------
// House Sits Profile
// ---------------------------------------------------------------------------
export const houseSitsApi = {
  me: () => request<APIResponse<HouseSitProfileRead>>('/house-sits/me'),
  updateMe: (body: {
    name?: string
    phone?: string
    default_address?: string | null
    default_city?: string | null
    default_postcode?: string | null
    default_country?: string | null
  }) =>
    request<APIResponse<HouseSitProfileRead>>('/house-sits/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  listAddresses: () =>
    request<APIResponse<HouseSitAddressRead[]>>('/house-sits/addresses'),
  addAddress: (body: HouseSitAddressCreate) =>
    request<APIResponse<HouseSitAddressRead>>('/house-sits/addresses', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateAddress: (id: string, body: HouseSitAddressUpdate) =>
    request<APIResponse<HouseSitAddressRead>>(`/house-sits/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteAddress: (id: string) =>
    request<APIResponse<{ removed: true }>>(`/house-sits/addresses/${id}`, {
      method: 'DELETE',
    }),
}

export const favoritesApi = {
  list: () =>
    request<APIResponse<FavoriteHouseSitter[]>>('/house-sits/favorites'),
  add: (houseSitterId: string) =>
    request<APIResponse<{ favorite: true }>>('/house-sits/favorites', {
      method: 'POST',
      body: JSON.stringify({ house_sitter_id: houseSitterId }),
    }),
  remove: (houseSitterId: string) =>
    request<APIResponse<{ favorite: false }>>(`/house-sits/favorites/${houseSitterId}`, {
      method: 'DELETE',
    }),
}

// ---------------------------------------------------------------------------
// House Sitters
// ---------------------------------------------------------------------------
export const houseSittersApi = {
  search: async (params: {
    city?: string
    availability?: 'any' | 'next_7_days'
    transport_mode?: 'own_car' | 'bus_walk' | 'requires_pickup'
    brings_own_supplies?: 'yes' | 'no'
    services_offered?: string
    min_rating?: number
    min_price?: number
    max_price?: number
    page?: number
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString()
    const res = await request<APIResponse<any>>(`/house-sitters?${qs}`)
    return { ...res, data: normalizePaginated<HouseSitterSummary>(res.data ?? {}, 'house_sitters') }
  },
  getById: (id: string) => request<APIResponse<HouseSitterRead>>(`/house-sitters/${id}`),
  me: () =>
    request<APIResponse<{ houseSitter: HouseSitterRead; onboarding: HouseSitterOnboardingProgress }>>('/house-sitters/me'),
  updateMyProfile: (body: { bio?: string; years_experience?: number; hourly_rate: number }) =>
    request<APIResponse<HouseSitterRead>>('/house-sitters/me', { method: 'PATCH', body: JSON.stringify(body) }),
  updateMyOnboarding: (body: Record<string, unknown>) =>
    request<APIResponse<{ houseSitter: HouseSitterRead; onboarding: HouseSitterOnboardingProgress }>>('/house-sitters/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  submitForApproval: () =>
    request<APIResponse<{ houseSitter: HouseSitterRead; onboarding: HouseSitterOnboardingProgress }>>('/house-sitters/me/submit', {
      method: 'POST',
    }),
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------
export const availabilityApi = {
  getMySchedule: () => request<APIResponse<any[]>>('/availability/me'),
  setMySchedule: (schedules: any[]) =>
    request<APIResponse<any[]>>('/availability/me', {
      method: 'PUT',
      body: JSON.stringify({ schedules }),
    }),
  getMyBlocked: () => request<APIResponse<any[]>>('/availability/me/blocked-list'),
  addBlocked: (body: { start_datetime: string; end_datetime: string; reason?: string }) =>
    request<APIResponse<any>>('/availability/me/blocked', { method: 'POST', body: JSON.stringify(body) }),
  deleteBlocked: (id: string) =>
    request<APIResponse<null>>(`/availability/me/blocked/${id}`, { method: 'DELETE' }),
  getSlots: (houseSitterId: string, date: string, durationHours: number) => {
    const qs = new URLSearchParams({ date, duration_hours: String(durationHours) })
    return request<{ success: boolean; data: { start: string; end: string; disabled?: boolean }[] }>(
      `/availability/${houseSitterId}/slots?${qs}`,
    )
  },
  getBookableDates: (houseSitterId: string, durationHours: number, daysAhead = 28) => {
    const qs = new URLSearchParams({
      duration_hours: String(durationHours),
      days_ahead: String(daysAhead),
    })
    return request<{ success: boolean; data: string[] }>(
      `/availability/${houseSitterId}/dates?${qs}`,
    )
  },
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------
export const bookingsApi = {
  previewPrice: (houseSitterId: string, durationHours: number) => {
    const qs = new URLSearchParams({ house_sitter_id: houseSitterId, duration_hours: String(durationHours) })
    return request<APIResponse<PriceBreakdown>>(`/bookings/preview-price?${qs}`)
  },
  create: (body: BookingCreate) =>
    request<APIResponse<BookingRead>>('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  my: async (page = 1, status?: string) => {
    const qs = new URLSearchParams({ page: String(page) })
    if (status) qs.set('status', status)
    const res = await request<APIResponse<any>>(`/bookings?${qs.toString()}`)
    return { ...res, data: normalizePaginated<BookingRead>(res.data ?? {}, 'bookings') }
  },
  getById: (id: string) => request<APIResponse<BookingRead>>(`/bookings/${id}`),
  action: (
    id: string,
    action:
      | 'accept'
      | 'decline'
      | 'start'
      | 'propose_alternative'
      | 'counter_proposal'
      | 'accept_proposal'
      | 'decline_proposal'
      | 'amend_start_time',
    proposedStart?: string,
    startLocation?: {
      latitude: number
      longitude: number
      accuracy_m?: number
    },
  ) =>
    request<APIResponse<BookingRead>>(`/bookings/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        ...(proposedStart ? { proposed_start: proposedStart } : {}),
        ...(startLocation ? { start_location: startLocation } : {}),
      }),
    }),
  complete: (id: string) =>
    request<APIResponse<BookingRead>>(`/bookings/${id}/complete`, {
      method: 'POST',
    }),
  cancel: (id: string, reason: string) =>
    request<APIResponse<BookingRead>>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  getFlowDraft: (houseSitterId: string) =>
    request<APIResponse<BookingFlowDraftRead | null>>(`/bookings/draft?house_sitter_id=${encodeURIComponent(houseSitterId)}`),
  saveFlowDraft: (body: {
    house_sitter_id: string
    booking_id?: string
    last_step: number
    duration_hours?: number
    selected_date?: string
    selected_slot?: string
    payload?: Record<string, any>
  }) =>
    request<APIResponse<BookingFlowDraftRead>>('/bookings/draft', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  clearFlowDraft: (houseSitterId: string) =>
    request<APIResponse<{ removed: true }>>(`/bookings/draft?house_sitter_id=${encodeURIComponent(houseSitterId)}`, {
      method: 'DELETE',
    }),
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export const paymentsApi = {
  createIntent: (bookingId: string) =>
    request<APIResponse<PaymentIntentResponse>>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    }),
  createConnectOnboardLink: () =>
    request<APIResponse<{ url: string }>>('/payments/connect/onboard', { method: 'POST' }),
  createConnectDashboardLink: () =>
    request<APIResponse<{ url: string }>>('/payments/connect/dashboard', { method: 'POST' }),
  getConnectStatus: () =>
    request<APIResponse<{
      connected: boolean
      onboarded?: boolean
      charges_enabled: boolean
      payouts_enabled: boolean
      details_submitted?: boolean
      restricted_or_incomplete?: boolean
      requirements_currently_due?: string[]
      requirements_past_due?: string[]
      requirements_disabled_reason?: string | null
      stripe_account_id?: string
    }>>('/payments/connect/status'),
  syncAuthorization: (bookingId: string) =>
    request<APIResponse<{ payment_intent_status: string; payment_status: string; sync: any }>>(
      `/payments/sync/${bookingId}`,
      { method: 'POST' },
    ),
  listMethods: () =>
    request<APIResponse<Array<{
      id: string
      brand: string
      last4: string
      exp_month: number | null
      exp_year: number | null
    }>>>('/payments/methods'),
  deleteMethod: (paymentMethodId: string, replacementPaymentMethodId?: string) =>
    request<APIResponse<{ removed: boolean; replaced?: boolean; linked_bookings_reauthorised?: number }>>(
      `/payments/methods/${paymentMethodId}`,
      {
        method: 'DELETE',
        body: JSON.stringify(
          replacementPaymentMethodId
            ? { replacement_payment_method_id: replacementPaymentMethodId }
            : {},
        ),
      },
    ),
  createSetupIntent: () =>
    request<APIResponse<{ setup_intent_id: string; client_secret: string | null }>>('/payments/setup-intent', {
      method: 'POST',
    }),
  confirmWithSavedMethod: (bookingId: string, paymentMethodId: string) =>
    request<APIResponse<{ payment_intent_id: string; payment_intent_status: string; sync: any }>>(
      '/payments/confirm-existing',
      {
        method: 'POST',
        body: JSON.stringify({
          booking_id: bookingId,
          payment_method_id: paymentMethodId,
        }),
      },
    ),
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export const reviewsApi = {
  create: (bookingId: string, body: ReviewCreate) =>
    request<APIResponse<ReviewRead>>(`/reviews/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getForHouseSitter: async (houseSitterId: string) => {
    const res = await request<APIResponse<any>>(`/reviews/house-sitters/${houseSitterId}`)
    return { ...res, data: (res.data?.reviews ?? res.data ?? []) as ReviewRead[] }
  },
  getForHouseSitterPaged: (houseSitterId: string, page = 1, pageSize = 20) =>
    request<APIResponse<{ reviews: ReviewRead[]; total: number; page: number; page_size: number }>>(
      `/reviews/house-sitters/${houseSitterId}?page=${page}&page_size=${pageSize}`,
    ),
  replyToReview: (reviewId: string, response: string) =>
    request<APIResponse<ReviewRead>>(`/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    }),
}

// ---------------------------------------------------------------------------
// Messages (chat)
// ---------------------------------------------------------------------------
export const messagesApi = {
  getHistory: (bookingId: string) =>
    request<APIResponse<MessageRead[]>>(`/messages/${bookingId}`),
  send: (bookingId: string, content: string) =>
    request<APIResponse<MessageRead>>(`/messages/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export const notificationsApi = {
  list: async (params?: {
    page?: number
    page_size?: number
    unread_only?: boolean
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString()
    const res = await request<
      APIResponse<{ notifications: NotificationRead[]; total: number; page: number; page_size: number }>
    >(`/notifications${qs ? `?${qs}` : ''}`)
    const payload = res.data
    const notifications = (payload?.notifications ?? []).map((notification) => ({
      ...notification,
      archived: Boolean(notification?.data?._archived),
      archived_at:
        typeof notification?.data?._archived_at === 'string' ? notification.data._archived_at : null,
    }))
    return {
      ...res,
      data: {
        notifications,
        total: Number(payload?.total ?? notifications.length),
        page: Number(payload?.page ?? params?.page ?? 1),
        page_size: Number(payload?.page_size ?? params?.page_size ?? 20),
      },
    }
  },
  markAllRead: () =>
    request<APIResponse<null>>('/notifications/read-all', { method: 'PATCH' }),
  markRead: (id: string) =>
    request<APIResponse<null>>(`/notifications/${id}/read`, { method: 'PATCH' }),
  delete: (id: string) =>
    request<APIResponse<null>>(`/notifications/${id}`, { method: 'DELETE' }),
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export const adminApi = {
  getStats: () =>
    request<APIResponse<AdminStats>>('/admin/stats'),
  getOpsQueues: () =>
    request<APIResponse<AdminOpsQueues>>('/admin/ops-queues'),

  listUsers: async (params: { page?: number; role?: string; search?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString()
    const res = await request<APIResponse<any>>(`/admin/users${qs ? `?${qs}` : ''}`)
    return { ...res, data: normalizePaginated<AdminUser>(res.data ?? {}, 'users') }
  },
  toggleUserActive: (id: string) =>
    request<APIResponse<{ id: string; is_active: boolean }>>(`/admin/users/${id}/toggle-active`, {
      method: 'PATCH',
    }),

  listHouseSitters: async (params: { page?: number; status?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString()
    const res = await request<APIResponse<any>>(`/admin/house-sitters${qs ? `?${qs}` : ''}`)
    return { ...res, data: normalizePaginated<AdminHouseSitter>(res.data ?? {}, 'house_sitters') }
  },
  suspendHouseSitter: (id: string) =>
    request<APIResponse<{ id: string; status: string }>>(`/admin/house-sitters/${id}/suspend`, {
      method: 'POST',
    }),
  approveHouseSitter: (
    id: string,
    action: 'approve' | 'reject',
    rejection_reason?: string,
    extras?: { rejection_reason_code?: string; rejection_custom_message?: string },
  ) =>
    request<APIResponse<HouseSitterRead>>(`/house-sitters/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, rejection_reason, ...extras }),
    }),

  listBookings: async (params: { page?: number; page_size?: number; status?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString()
    const res = await request<APIResponse<any>>(`/admin/bookings${qs ? `?${qs}` : ''}`)
    return { ...res, data: normalizePaginated<BookingRead>(res.data ?? {}, 'bookings') }
  },

  listDisputes: async () => {
    const res = await request<APIResponse<any>>('/disputes')
    const disputes = (res.data?.disputes ?? res.data ?? []) as AdminDispute[]
    return { ...res, data: disputes }
  },
  markDisputeUnderReview: (id: string) =>
    request<APIResponse<AdminDispute>>(`/disputes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'under_review' }),
    }),
  resolveDispute: (id: string, body: {
    resolution_type: string
    resolution_note: string
    refund_amount?: number
    charge_percentage?: number
  }) =>
    request<APIResponse<AdminDispute>>(`/disputes/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

// ---------------------------------------------------------------------------
// House Sits Disputes
// ---------------------------------------------------------------------------
export const disputesApi = {
  listMine: async (page = 1, pageSize = 20) => {
    const res = await request<APIResponse<any>>(`/disputes?page=${page}&page_size=${pageSize}`)
    return { ...res, data: normalizePaginated<HouseSitDispute>(res.data ?? {}, 'disputes') }
  },
  createForBooking: (
    bookingId: string,
    body: {
      issue_type: 'house_sitter_didnt_arrive' | 'house_sit_no_show' | 'service_not_completed' | 'property_damage_safety' | 'other_issue'
      explanation: string
      evidence?: string[]
    },
  ) =>
    request<APIResponse<any>>(`/disputes/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
