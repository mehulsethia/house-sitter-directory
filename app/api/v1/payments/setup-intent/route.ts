import { NextRequest } from 'next/server'
import { requireHouseSit } from '@/server/auth'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { stripe } from '@/server/stripe'
import { ok, err } from '@/server/response'

export const POST = requireHouseSit(async (_req: NextRequest, _ctx, user) => {
  const houseSit = await houseSitRepo.findByUserId(user.id)
  if (!houseSit) return err('HouseSit profile not found', 404)

  let stripeCustomerId = houseSit.stripeCustomerId ?? null
  if (stripeCustomerId) {
    try {
      await stripe.customers.retrieve(stripeCustomerId)
    } catch {
      stripeCustomerId = null
    }
  }

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: houseSit.user?.email ?? undefined,
      name: houseSit.user?.name ?? undefined,
      metadata: {
        app_client_id: houseSit.id,
        app_user_id: user.id,
      },
    })
    stripeCustomerId = customer.id
    await houseSitRepo.update(houseSit.id, { stripeCustomerId })
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    usage: 'off_session',
    payment_method_types: ['card'],
  })

  return ok({
    setup_intent_id: setupIntent.id,
    client_secret: setupIntent.client_secret,
  })
})
