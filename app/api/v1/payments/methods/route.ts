import { NextRequest } from 'next/server'
import { requireHouseSit } from '@/server/auth'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { stripe } from '@/server/stripe'
import { ok } from '@/server/response'

export const GET = requireHouseSit(async (_req: NextRequest, _ctx, user) => {
  const houseSit = await houseSitRepo.findByUserId(user.id)
  if (!houseSit?.stripeCustomerId) return ok([])

  const paymentMethods = await stripe.paymentMethods.list({
    customer: houseSit.stripeCustomerId,
    type: 'card',
  })

  return ok(
    paymentMethods.data.map((method) => ({
      id: method.id,
      brand: method.card?.brand ?? 'card',
      last4: method.card?.last4 ?? '0000',
      exp_month: method.card?.exp_month ?? null,
      exp_year: method.card?.exp_year ?? null,
    })),
  )
})
