import { requireHouseSitter } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { stripe } from '@/server/stripe'
import { err, ok } from '@/server/response'

export const POST = requireHouseSitter(async (_req, _ctx, user) => {
  const cleaner = await houseSitterRepo.findByUserId(user.id)
  if (!cleaner) return err('Cleaner profile not found', 404)
  if (!cleaner.stripeAccountId) return err('Stripe account not connected', 400)

  const loginLink = await stripe.accounts.createLoginLink(cleaner.stripeAccountId)
  return ok({ url: loginLink.url })
})

