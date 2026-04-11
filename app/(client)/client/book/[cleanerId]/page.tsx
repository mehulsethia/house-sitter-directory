'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Lock, Shield, Star } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { cleanersApi, bookingsApi, availabilityApi, clientsApi, paymentsApi } from '@/lib/api'
import { FormPageSkeleton } from '@/components/page-skeletons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import type { CleanerRead, PriceBreakdown, BookingRead, ClientProfileRead } from '@/types'
import { toast } from 'sonner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const SERVICE_TYPES = [
  { value: 'standard', label: 'Standard Clean' },
  { value: 'deep_clean', label: 'Deep Clean' },
  { value: 'end_of_tenancy', label: 'End of Tenancy' },
  { value: 'move_in', label: 'Move-in Clean' },
]

const SERVICE_LABELS: Record<string, string> = {
  standard: 'Standard Clean',
  deep_clean: 'Deep Clean',
  end_of_tenancy: 'End of Tenancy',
  move_in: 'Move-in Clean',
}

const DURATION_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8]

const STEP_INFO = [
  { num: 1, title: 'Service &\nDate', desc: 'Select service and schedule' },
  { num: 2, title: 'Your\nDetails', desc: 'Contact and location info' },
  { num: 3, title: 'Payment', desc: 'Secure payment processing' },
  { num: 4, title: 'Confirmation', desc: 'Booking confirmation' },
]

// ── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_INFO.map((s, idx) => {
        const done = current > s.num
        const active = current === s.num
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center w-20 sm:w-28">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <p className={`mt-1.5 text-center text-[10px] leading-tight whitespace-pre-line ${active || done ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>
                {s.title}
              </p>
              <p className="text-[9px] text-slate-400 text-center leading-tight hidden sm:block">{s.desc}</p>
            </div>
            {idx < STEP_INFO.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-14 -mt-5 sm:-mt-7 ${current > s.num ? 'bg-primary' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Booking Summary Sidebar ───────────────────────────────────────────────
function BookingSummary({
  cleaner,
  serviceType,
  duration,
  breakdown,
}: {
  cleaner: CleanerRead
  serviceType: string
  duration: number
  breakdown: PriceBreakdown | null
}) {
  const cleanerName = cleaner.user?.name ?? 'Professional Cleaner'
  return (
    <Card className="border-slate-200 sticky top-6">
      <CardContent className="p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">Booking Summary</h3>

        {/* Cleaner info */}
        <div className="flex items-center gap-3">
          {cleaner.profile_image_url ? (
            <img src={cleaner.profile_image_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">{cleanerName.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-slate-900">{cleanerName}</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < Math.round(cleaner.average_rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
              ))}
              <span className="text-xs text-slate-500 ml-0.5">{cleaner.average_rating?.toFixed(1) ?? '—'}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Service details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span className="text-slate-700">{SERVICE_LABELS[serviceType] ?? serviceType}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{duration} hours</span>
          </div>
        </div>

        <Separator />

        {/* Price breakdown */}
        {breakdown && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Service ({duration} hours)</span>
              <span className="font-medium">{formatCurrency(breakdown.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Service fee</span>
              <span className="font-medium">{formatCurrency(breakdown.platform_fee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatCurrency(breakdown.total_amount)}</span>
            </div>
          </div>
        )}

        {/* Trust signals */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="h-3.5 w-3.5 text-slate-400" /> Secure payment processing
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" /> Satisfaction guaranteed
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" /> Free cancellation up to 24h
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Stripe Payment Form (inner) ──────────────────────────────────────────
function StripePaymentForm({ onSuccess, totalAmount }: { onSuccess: () => void; totalAmount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!stripe || !elements) return
    setSubmitting(true)
    const { error } = await stripe.confirmPayment({ elements, redirect: 'if_required' })
    if (error) {
      toast.error(error.message ?? 'Payment failed. Please try again.')
    } else {
      toast.success('Payment authorised! Your booking is confirmed.')
      onSuccess()
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2">
        <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-700">Your payment information is secure and encrypted</p>
      </div>

      <PaymentElement />

      <p className="text-xs text-slate-500">
        I agree to the Terms of Service and Privacy Policy. I understand that payment will be processed securely.
        Your card is authorised now — payment is only captured after your job is completed.
      </p>

      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-slate-500">Total: <strong className="text-slate-900">{formatCurrency(totalAmount)}</strong></span>
        <Button onClick={handleSubmit} loading={submitting} disabled={!stripe || !elements}>
          Complete Booking
        </Button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function BookingFlowPage() {
  const { cleanerId } = useParams<{ cleanerId: string }>()
  const router = useRouter()

  const [cleaner, setCleaner] = useState<CleanerRead | null>(null)
  const [clientProfile, setClientProfile] = useState<ClientProfileRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)

  // Step 1: Service & Schedule
  const [serviceType, setServiceType] = useState('standard')
  const [duration, setDuration] = useState(2)
  const [date, setDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null)

  // Step 2: Your Details
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [notes, setNotes] = useState('')

  // Step 3: Payment
  const [booking, setBooking] = useState<BookingRead | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Load cleaner + client profile
  useEffect(() => {
    Promise.all([
      cleanersApi.getById(cleanerId),
      clientsApi.me().catch(() => null),
    ])
      .then(([cleanerRes, clientRes]) => {
        setCleaner(cleanerRes.data ?? null)
        const cp = (clientRes as any)?.data ?? null
        setClientProfile(cp)
        // Autofill from client profile
        if (cp) {
          const user = cp.user
          if (user?.name) {
            const parts = user.name.trim().split(' ')
            setFirstName(parts[0] ?? '')
            setLastName(parts.slice(1).join(' '))
          }
          if (user?.email) setEmail(user.email)
          if (user?.phone) setPhone(user.phone)
          if (cp.default_address) setAddress(cp.default_address)
          if (cp.default_city) setCity(cp.default_city)
          if (cp.default_postcode) setPostcode(cp.default_postcode)
        }
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [cleanerId])

  // Fetch available slots
  useEffect(() => {
    if (!date || !cleanerId) return
    setSlotsLoading(true)
    setSelectedSlot('')
    availabilityApi.getSlots(cleanerId, `${date}T00:00:00Z`, duration)
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [date, duration, cleanerId])

  // Fetch price breakdown
  useEffect(() => {
    if (!cleanerId) return
    bookingsApi.previewPrice(cleanerId, duration)
      .then(r => setBreakdown(r.data ?? null))
      .catch(() => {})
  }, [duration, cleanerId])

  const estimatedCost = useMemo(() => {
    if (!cleaner) return 0
    return cleaner.hourly_rate * duration
  }, [cleaner, duration])

  // Navigation helpers
  function goNext() {
    if (step === 1) {
      if (!date) { toast.error('Please select a date.'); return }
      if (!selectedSlot) { toast.error('Please select a time slot.'); return }
      setStep(2)
    } else if (step === 2) {
      if (!firstName.trim()) { toast.error('First name is required.'); return }
      if (!lastName.trim()) { toast.error('Last name is required.'); return }
      if (!email.trim()) { toast.error('Email is required.'); return }
      if (!phone.trim()) { toast.error('Phone number is required.'); return }
      if (!address.trim()) { toast.error('Service address is required.'); return }
      if (!city.trim()) { toast.error('City is required.'); return }
      if (!postcode.trim()) { toast.error('ZIP code is required.'); return }
      // Create booking and move to payment
      createBookingAndProceed()
    }
  }

  async function createBookingAndProceed() {
    setSubmitting(true)
    try {
      const res = await bookingsApi.create({
        cleaner_id: cleanerId,
        service_type: serviceType as any,
        address: address.trim(),
        city: city.trim(),
        postcode: postcode.trim(),
        scheduled_start: selectedSlot,
        duration_hours: duration,
        special_instructions: notes || undefined,
      })
      const b = res.data
      if (!b) throw new Error('Failed to create booking')
      setBooking(b)

      // If booking is pending (cleaner hasn't accepted yet), skip payment step
      // and go straight to confirmation
      if (b.status === 'pending') {
        setStep(4)
      } else if (b.status === 'accepted') {
        // Create payment intent
        const intentRes = await paymentsApi.createIntent(b.id)
        setClientSecret(intentRes.data?.client_secret ?? null)
        setStep(3)
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  function handlePaymentSuccess() {
    setStep(4)
  }

  if (loading) return <FormPageSkeleton />
  if (!cleaner) return <div className="text-center py-16 text-muted-foreground">Cleaner not found.</div>

  const cleanerName = cleaner.user?.name ?? 'Professional Cleaner'

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => step > 1 && step < 4 ? setStep(step - 1) : router.back()}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {step > 1 && step < 4 ? 'Previous' : 'Back to Profile'}
        </button>
        <h1 className="text-xl font-bold text-slate-900">Book Service</h1>
        <div className="w-24" />
      </div>

      <StepIndicator current={step} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div>
          {/* ── Step 1: Service & Date ─────────────────────────────── */}
          {step === 1 && (
            <Card className="border-slate-200">
              <CardContent className="p-5 sm:p-6 space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Select Service & Schedule</h2>

                {/* Service type */}
                <div>
                  <Label className="text-sm font-semibold">Service</Label>
                  <Select value={serviceType} onChange={e => setServiceType(e.target.value)} className="mt-1">
                    {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                </div>

                {/* Duration & estimated cost */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Duration (hours)</Label>
                    <Select value={String(duration)} onChange={e => setDuration(Number(e.target.value))} className="mt-1">
                      {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d} hours</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Estimated Cost</Label>
                    <div className="mt-1">
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(estimatedCost)}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(cleaner.hourly_rate)}/hr x {duration} hours</p>
                    </div>
                  </div>
                </div>

                {/* Date picker */}
                <div>
                  <Label className="text-sm font-semibold">Preferred Date</Label>
                  <Input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Time slots */}
                {date && (
                  <div>
                    <Label className="text-sm font-semibold">Preferred Time</Label>
                    {slotsLoading ? (
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                        ))}
                      </div>
                    ) : slots.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">No available slots on this date.</p>
                    ) : (
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map(slot => {
                          const time = new Date(slot.start).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: true })
                          return (
                            <button
                              key={slot.start}
                              type="button"
                              onClick={() => setSelectedSlot(slot.start)}
                              className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                                selectedSlot === slot.start
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-primary/40 hover:-translate-y-0.5'
                              }`}
                            >
                              {time}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-end pt-2">
                  <Button onClick={goNext} className="gap-1.5">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 2: Your Details ───────────────────────────────── */}
          {step === 2 && (
            <Card className="border-slate-200">
              <CardContent className="p-5 sm:p-6 space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Your Information</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-semibold">First Name</Label>
                    <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1" placeholder="John" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Last Name</Label>
                    <Input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1" placeholder="Doe" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Email</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Phone Number</Label>
                    <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" placeholder="+353 XX XXX XXXX" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Service Address</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} className="mt-1" placeholder="Street address" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label className="text-sm font-semibold">City</Label>
                    <Input value={city} onChange={e => setCity(e.target.value)} className="mt-1" placeholder="Dublin" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">State</Label>
                    <Input className="mt-1" placeholder="County" disabled />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">ZIP Code</Label>
                    <Input value={postcode} onChange={e => setPostcode(e.target.value)} className="mt-1" placeholder="D01 AB12" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Project Description</Label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Describe your project in detail..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </button>
                  <Button onClick={goNext} loading={submitting} className="gap-1.5">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 3: Payment ────────────────────────────────────── */}
          {step === 3 && clientSecret && booking && (
            <Card className="border-slate-200">
              <CardContent className="p-5 sm:p-6 space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Payment Information</h2>

                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <StripePaymentForm
                    onSuccess={handlePaymentSuccess}
                    totalAmount={booking.total_amount}
                  />
                </Elements>
              </CardContent>
            </Card>
          )}

          {/* ── Step 4: Confirmation ───────────────────────────────── */}
          {step === 4 && booking && (
            <Card className="border-slate-200">
              <CardContent className="p-5 sm:p-8 text-center space-y-5">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Your service has been successfully booked with {cleanerName}
                  </p>
                </div>

                {/* Booking details */}
                <div className="mx-auto max-w-sm text-left rounded-xl border border-slate-200 p-4 space-y-3">
                  <h3 className="font-semibold text-slate-900">Booking Details</h3>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-medium text-slate-900">{SERVICE_LABELS[booking.service_type] ?? booking.service_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(booking.scheduled_start).toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Time:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(booking.scheduled_start).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-medium text-slate-900">{booking.duration_hours} hours</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(booking.total_amount)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 mx-auto max-w-sm">
                  <Button className="w-full" onClick={() => router.push('/client/dashboard')}>
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/client/cleaners`)}>
                    Book Another Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — show on steps 1-3 */}
        {step < 4 && (
          <div className="hidden lg:block">
            <BookingSummary
              cleaner={cleaner}
              serviceType={serviceType}
              duration={duration}
              breakdown={breakdown}
            />
          </div>
        )}
      </div>
    </div>
  )
}
