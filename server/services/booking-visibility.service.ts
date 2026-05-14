type Role = 'house_sit' | 'house_sitter' | 'admin'

const ADDRESS_VISIBLE_STATUSES = new Set([
  'accepted',
  'confirmed',
  'in_progress',
  'completed',
  'disputed',
  'cancelled',
])

export function sanitizeBookingForRole<T extends Record<string, any>>(booking: T, role: Role): T {
  if (role !== 'house_sitter') return booking
  return sanitizeBookingForCleaner(booking)
}

export function sanitizeBookingsForRole<T extends Record<string, any>>(bookings: T[], role: Role): T[] {
  if (role !== 'house_sitter') return bookings
  return bookings.map((booking) => sanitizeBookingForCleaner(booking))
}

function sanitizeBookingForCleaner<T extends Record<string, any>>(booking: T): T {
  const copy: Record<string, any> = { ...booking }
  const status = String(copy.status ?? '')
  const cancelledBeforeConfirmation =
    status === 'cancelled' &&
    !copy.acceptedAt &&
    !copy.confirmedAt
  const scheduledStartMs = copy.scheduledStart ? new Date(copy.scheduledStart).getTime() : 0
  const scheduledEndMs = copy.scheduledEnd ? new Date(copy.scheduledEnd).getTime() : 0
  const phoneVisibleAtMs = scheduledStartMs - 6 * 60 * 60 * 1000
  const phoneVisibleUntilMs = scheduledEndMs + 30 * 60 * 1000
  const isAddressVisible = ADDRESS_VISIBLE_STATUSES.has(status) && !cancelledBeforeConfirmation
  const isPhoneVisible = isAddressVisible && Date.now() >= phoneVisibleAtMs && Date.now() <= phoneVisibleUntilMs

  const fullClientName = String(copy?.houseSit?.user?.name ?? '').trim()
  const firstName = fullClientName ? fullClientName.split(/\s+/)[0] : 'HouseSit'

  if (copy.houseSit?.user) {
    const completedBookingsCount = Number(copy?.houseSit?._count?.bookings ?? 0)
    const memberSince = copy?.houseSit?.createdAt
      ? new Date(copy.houseSit.createdAt).toISOString()
      : null

    copy.houseSit = {
      ...copy.houseSit,
      _count: undefined,
      user: {
        ...copy.houseSit.user,
        name: firstName,
        phone: isPhoneVisible ? copy.houseSit.user.phone : null,
      },
      trust: {
        memberSince,
        completedBookingsCount,
        idSubmitted: Boolean(copy.houseSit.idFileUrl ?? copy.houseSit.id_file_url),
      },
    }
  }

  if (!isAddressVisible) {
    copy.address = `Approximate area near ${copy.city ?? 'service location'}`
    copy.apartmentDetails = null
    copy.accessNotes = null
  }

  copy.houseSitterPrivacy = {
    addressVisible: isAddressVisible,
    phoneVisible: isPhoneVisible,
    phoneVisibleAt: isAddressVisible && Number.isFinite(phoneVisibleAtMs)
      ? new Date(phoneVisibleAtMs).toISOString()
      : null,
    phoneVisibleUntil: isAddressVisible && Number.isFinite(phoneVisibleUntilMs)
      ? new Date(phoneVisibleUntilMs).toISOString()
      : null,
    mapMode: isAddressVisible ? 'exact' : 'offset_50_100m',
    requestExpiresAt: copy.acceptBy ?? null,
  }

  return copy as T
}
