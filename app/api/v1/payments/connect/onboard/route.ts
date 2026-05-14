import { requireHouseSitter } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { stripe } from '@/server/stripe'
import { ok, err } from '@/server/response'

export const POST = requireHouseSitter(async (_req, _ctx, user) => {
  const cleaner = await houseSitterRepo.findByUserId(user.id)
  if (!cleaner) return err('Cleaner profile not found', 404)

  let accountId = cleaner.stripeAccountId
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      metadata: { cleaner_id: cleaner.id },
    })
    accountId = account.id
    await houseSitterRepo.update(cleaner.id, { stripeAccountId: accountId })
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
