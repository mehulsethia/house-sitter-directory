'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { bookingsApi, paymentsApi } from '@/lib/api'
import { PriceBreakdownCard } from '@/components/price-breakdown-card'
import { CheckoutPageSkeleton } from '@/components/page-skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingStatusBadge } from '@/components/booking-status-badge'
import { formatDate } from '@/lib/utils'
import type { BookingRead } from '@/types'
import { toast } from 'sonner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Inner component — must live inside <Elements>
function CheckoutForm({ booking, onSuccess }: { booking: BookingRead; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    const returnUrl = `${window.location.origin}/client/bookings/${booking.id}?payment=authorized`
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: returnUrl,
      },
    })

    if (error) {
      toast.error(error.message ?? 'Payment failed. Please try again.')
    } else {
      try {
        await paymentsApi.syncAuthorization(booking.id)
      } catch {
        // Webhook normally handles this; sync is best-effort fallback for local dev.
      }
      toast.success('Card authorised. Your booking request is now sent to the cleaner.')
      onSuccess()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={!stripe || !elements}>
        Authorize {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(booking.total_amount)}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingRead | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const bookingRes = await bookingsApi.getById(bookingId)
        const b = bookingRes.data
        if (!b) throw new Error('Booking not found')
        if (!['pending', 'accepted'].includes(b.status)) {
          toast.error('This booking cannot be authorized right now.')
          router.push(`/client/bookings/${bookingId}`)
          return
        }
        setBooking(b)

        const intentRes = await paymentsApi.createIntent(bookingId)
        setClientSecret(intentRes.data?.client_secret ?? null)
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to initialise card authorization')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [bookingId])

  if (loading) return <CheckoutPageSkeleton />
  if (!booking || !clientSecret) return <div className="text-center py-16 text-muted-foreground">Unable to load checkout.</div>

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <h1 className="marketplace-title text-2xl text-slate-900">Authorize card</h1>

      {/* Booking summary */}
      <Card>
        <CardHeader><CardTitle>Booking summary</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <BookingStatusBadge status={booking.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Scheduled</span>
            <span>{formatDate(booking.scheduled_start)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span>{booking.duration_hours}h</span>
          </div>
        </CardContent>
      </Card>

      <PriceBreakdownCard breakdown={{
        hourly_rate: booking.hourly_rate,
        duration_hours: booking.duration_hours,
        subtotal: booking.total_amount,
        platform_fee_pct: 10,
        platform_fee: booking.platform_fee,
        cleaner_payout: booking.cleaner_payout,
        total_amount: booking.total_amount,
      }} />

      {/* Stripe payment form */}
      <Card>
        <CardHeader><CardTitle>Card authorization</CardTitle></CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <CheckoutForm booking={booking} onSuccess={() => router.push(`/client/bookings/${bookingId}`)} />
          </Elements>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Your card is authorized now. Stripe captures it 24 hours after the job is completed unless a dispute is raised.
      </p>
    </div>
  )
}
