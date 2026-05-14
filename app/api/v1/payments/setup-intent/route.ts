import { NextRequest } from 'next/server'
import { requireHouseSit } from '@/server/auth'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { stripe } from '@/server/stripe'
import { ok, err } from '@/server/response'

export const POST = requireHouseSit(async (_req: NextRequest, _ctx, user) => {
  const client = await houseSitRepo.findByUserId(user.id)
  if (!client) return err('Client profile not found', 404)

  let stripeCustomerId = client.stripeCustomerId ?? null
  if (stripeCustomerId) {
    try {
      await stripe.customers.retrieve(stripeCustomerId)
    } catch {
      stripeCustomerId = null
    }
  }

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: client.user?.email ?? undefined,
      name: client.user?.name ?? undefined,
      metadata: {
        app_client_id: client.id,
        app_user_id: user.id,
      },
    })
    stripeCustomerId = customer.id
    await houseSitRepo.update(client.id, { stripeCustomerId })
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
