import { requireHouseSitter } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { stripe } from '@/server/stripe'
import { ok, err } from '@/server/response'

export const POST = requireHouseSitter(async (_req, _ctx, user) => {
  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) return err('HouseSitter profile not found', 404)

  let accountId = houseSitter.stripeAccountId
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      metadata: { house_sitter_id: houseSitter.id },
    })
    accountId = account.id
    await houseSitterRepo.update(houseSitter.id, { stripeAccountId: accountId })
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/house-sitters/onboarding?refresh=true`,
    return_url: `${origin}/api/v1/payments/connect/return`,
    type: 'account_onboarding',
  })

  return ok({ url: link.url })
})
