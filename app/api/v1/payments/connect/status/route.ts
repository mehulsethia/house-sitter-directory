import { requireCleaner } from '@/server/auth'
import { cleanerRepo } from '@/server/repositories/cleaner.repo'
import { stripe } from '@/server/stripe'
import { ok, err } from '@/server/response'

export const GET = requireCleaner(async (_req, _ctx, user) => {
  const cleaner = await cleanerRepo.findByUserId(user.id)
  if (!cleaner) return err('Cleaner profile not found', 404)

  if (!cleaner.stripeAccountId) {
    return ok({
      connected: false,
      onboarded: false,
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
    })
  }

  const account = await stripe.accounts.retrieve(cleaner.stripeAccountId)
  const connected = account.details_submitted && account.charges_enabled

  if (connected && !cleaner.stripeOnboardingComplete) {
    await cleanerRepo.update(cleaner.id, { stripeOnboardingComplete: true })
  }

  return ok({
    connected,
    onboarded: cleaner.stripeOnboardingComplete || connected,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
  })
})
