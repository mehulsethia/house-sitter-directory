import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types'

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'info' }> = {
  draft:       { label: 'Draft', variant: 'outline' },
  pending:     { label: 'Pending House Sitter Acceptance',     variant: 'warning' },
  accepted:    { label: 'Accepted',    variant: 'info' },
  confirmed:   { label: 'Confirmed',   variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed:   { label: 'Completed - Awaiting Release',   variant: 'success' },
  cancelled:   { label: 'Cancelled',   variant: 'secondary' },
  declined:    { label: 'Declined',    variant: 'secondary' },
  expired:     { label: 'Expired',     variant: 'secondary' },
  disputed:    { label: 'Under Review',    variant: 'destructive' },
}

function isPaymentAuthorized(paymentStatus?: string | null) {
  return ['authorized', 'captured', 'transferred'].includes(String(paymentStatus ?? ''))
}

function pendingLabel(proposalBy?: 'house_sit' | 'house_sitter' | null) {
  if (proposalBy === 'house_sitter') return 'Awaiting Homeowner Response'
  if (proposalBy === 'house_sit') return 'Awaiting House Sitter Response'
  return STATUS_CONFIG.pending.label
}

export function BookingStatusBadge({
  status,
  paymentStatus,
  proposalBy,
  showPaymentRequiredForUnpaid = true,
}: {
  status: BookingStatus
  paymentStatus?: string | null
  proposalBy?: 'house_sit' | 'house_sitter' | null
  showPaymentRequiredForUnpaid?: boolean
}) {
  const config = (showPaymentRequiredForUnpaid && (status === 'draft' || (status === 'pending' && !isPaymentAuthorized(paymentStatus))))
    ? { label: 'Payment Required', variant: 'warning' as const }
    : status === 'pending'
      ? { label: pendingLabel(proposalBy), variant: STATUS_CONFIG.pending.variant }
      : STATUS_CONFIG[status] ?? { label: status, variant: 'outline' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
