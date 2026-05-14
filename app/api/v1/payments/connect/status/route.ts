import { requireHouseSitter } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { stripe } from '@/server/stripe'
import { ok, err } from '@/server/response'
import { pushInAppNotification } from '@/server/services/in-app-notification.service'

export const GET = requireHouseSitter(async (_req, _ctx, user) => {
  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) return err('HouseSitter profile not found', 404)

  if (!houseSitter.stripeAccountId) {
    return ok({
      connected: false,
      onboarded: false,
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
    })
  }

  const fallbackConnected = Boolean(houseSitter.stripeOnboardingComplete)

  try {
    const account = await Promise.race([
      stripe.accounts.retrieve(houseSitter.stripeAccountId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Stripe status lookup timed out.')), 2500),
      ),
    ])
    const currentlyDue = account.requirements?.currently_due?.length ?? 0
    const pastDue = account.requirements?.past_due?.length ?? 0
    const hasDisabledReason = Boolean(account.requirements?.disabled_reason)
    const restrictedOrIncomplete = currentlyDue > 0 || pastDue > 0 || hasDisabledReason
    const connected =
      account.details_submitted &&
      account.charges_enabled &&
      account.payouts_enabled &&
      !restrictedOrIncomplete

    if (houseSitter.stripeOnboardingComplete !== connected) {
      await houseSitterRepo.update(houseSitter.id, { stripeOnboardingComplete: connected })
      if (connected) {
        await pushInAppNotification({
          userId: user.id,
          type: 'stripe_connected',
          title: 'Stripe connected',
          body: 'Your payment setup is complete. Your profile is now live and visible to house_sits.',
          data: { house_sitter_id: houseSitter.id },
        })
      }
    }

    return ok({
      connected,
      onboarded: connected,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      restricted_or_incomplete: restrictedOrIncomplete,
      requirements_currently_due: account.requirements?.currently_due ?? [],
      requirements_past_due: account.requirements?.past_due ?? [],
      requirements_disabled_reason: account.requirements?.disabled_reason ?? null,
    })
  } catch (error) {
    console.warn('[payments/connect/status] Stripe lookup failed; returning cached status.', {
      houseSitterId: houseSitter.id,
      error: error instanceof Error ? error.message : String(error),
    })
    return ok({
      connected: fallbackConnected,
      onboarded: fallbackConnected,
      charges_enabled: fallbackConnected,
      payouts_enabled: fallbackConnected,
      details_submitted: fallbackConnected,
      restricted_or_incomplete: !fallbackConnected,
      requirements_currently_due: [],
      requirements_past_due: [],
      requirements_disabled_reason: null,
    })
  }
})
