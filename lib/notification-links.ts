import type { NotificationRead } from '@/types'

type UserRole = 'house_sit' | 'house_sitter' | 'admin'

function bookingDetailBase(role: UserRole) {
  if (role === 'house_sitter') return '/house-sitters/bookings'
  if (role === 'admin') return '/admin/bookings'
  return '/house-sits/bookings'
}

export function getNotificationHref(role: UserRole, notification: NotificationRead) {
  const bookingId = notification.data?.booking_id as string | undefined
  const disputeId = notification.data?.dispute_id as string | undefined

  switch (notification.type) {
    case 'booking_request':
    case 'booking_created_pending':
    case 'booking_accepted':
    case 'booking_proposed_new_time':
    case 'booking_counter_proposal':
    case 'booking_time_agreed':
    case 'booking_request_declined':
    case 'booking_request_expired':
    case 'booking_cancelled':
    case 'booking_completed':
    case 'booking_confirmed':
    case 'payment_captured':
    case 'payment_transferred':
    case 'payout_released':
      return bookingId ? `${bookingDetailBase(role)}/${bookingId}` : bookingDetailBase(role)
    case 'dispute_raised':
    case 'dispute_under_review':
    case 'dispute_resolved':
      if (role === 'admin') return '/admin/disputes'
      if (role === 'house_sitter') return disputeId ? `/house-sitters/bookings/${bookingId ?? ''}` : '/house-sitters/bookings'
      return disputeId ? `/house-sits/bookings/${bookingId ?? ''}` : '/house-sits/bookings'
    case 'house_sitter_application_submitted':
    case 'house_sitter_application_approved':
    case 'house_sitter_application_rejected':
      if (role === 'admin') return '/admin/house-sitters'
      if (role === 'house_sitter') {
        return notification.type === 'house_sitter_application_approved'
          ? '/house-sitters/profile?tab=payments'
          : '/house-sitters/profile'
      }
      return '/house-sitters/profile'
    case 'account_created':
      return role === 'admin' ? '/admin/users' : role === 'house_sitter' ? '/house-sitters/profile' : '/house-sits/house-sitters'
    default:
      if (role === 'admin') return '/admin/dashboard'
      if (role === 'house_sitter') return '/house-sitters/dashboard'
      return '/house-sits/dashboard'
  }
}
