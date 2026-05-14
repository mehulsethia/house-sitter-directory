import type { HouseSitter } from '@prisma/client'

export type HouseSitterOnboardingProgress = {
  completion_pct: number
  can_be_listed: boolean
  current_step: 1 | 2 | 3 | 4 | 5
  steps: {
    step1_basic_details: boolean
    step2_kyc: boolean
    step3_availability: boolean
    step4_stripe_setup: boolean
    step5_training: boolean
  }
}

function hasValue(v?: string | null) {
  return typeof v === 'string' && v.trim().length > 0
}

export type HouseSitterSubmissionValidation = {
  valid: boolean
  missingFields: string[]
}

export function computeCleanerOnboardingProgress(args: {
  houseSitter: HouseSitter
  hasAvailabilitySlots: boolean
}): HouseSitterOnboardingProgress {
  const { houseSitter, hasAvailabilitySlots } = args

  const step1BasicDetails =
    hasValue(houseSitter.profileImageUrl) &&
    hasValue(houseSitter.bio) &&
    Number(houseSitter.hourlyRate) >= 6 &&
    houseSitter.skills.length > 0 &&
    hasValue(houseSitter.cleaningSupplies)

  const needsPickupLocation = houseSitter.transportMode === 'requires_pickup'
  const step2Kyc =
    hasValue(houseSitter.transportMode) &&
    (!needsPickupLocation || hasValue(houseSitter.transportPickupLocation)) &&
    hasValue(houseSitter.idType) &&
    hasValue(houseSitter.idFileName) &&
    houseSitter.petComfortable !== null &&
    houseSitter.workEligibilityAnswer === true &&
    houseSitter.workEligibilityConfirmed &&
    houseSitter.termsAccepted

  const step3Availability = hasAvailabilitySlots
  const step4StripeSetup =
    houseSitter.stripeOnboardingComplete ||
    houseSitter.onboardingSkippedStep4 ||
    houseSitter.onboardingStep >= 5
  const step5Training =
    houseSitter.standardsCompleted &&
    houseSitter.quizPassed &&
    houseSitter.quizScore !== null &&
    houseSitter.quizScore >= 80

  const completedSteps = [
    step1BasicDetails,
    step2Kyc,
    step3Availability,
    step4StripeSetup,
    step5Training,
  ].filter(Boolean).length

  const completionPct = Math.round((completedSteps / 5) * 100)

  let currentStep: 1 | 2 | 3 | 4 | 5 = 1
  if (!step1BasicDetails) currentStep = 1
  else if (!step2Kyc) currentStep = 2
  else if (!step3Availability) currentStep = houseSitter.onboardingSkippedStep3 ? 4 : 3
  else if (!step4StripeSetup) currentStep = 4
  else if (!step5Training) currentStep = 5
  else currentStep = 5

  return {
    completion_pct: completionPct,
    can_be_listed: completionPct === 100,
    current_step: currentStep,
    steps: {
      step1_basic_details: step1BasicDetails,
      step2_kyc: step2Kyc,
      step3_availability: step3Availability,
      step4_stripe_setup: step4StripeSetup,
      step5_training: step5Training,
    },
  }
}

export function validateCleanerSubmissionRequirements(args: {
  houseSitter: HouseSitter
  hasAvailabilitySlots: boolean
}): HouseSitterSubmissionValidation {
  const { houseSitter, hasAvailabilitySlots } = args
  const missingFields: string[] = []

  if (!hasValue(houseSitter.bio)) missingFields.push('Professional bio')
  if (!Array.isArray(houseSitter.skills) || houseSitter.skills.length === 0) missingFields.push('Services offered')
  if (Number(houseSitter.hourlyRate) < 6) missingFields.push('Hourly rate')
  if (!hasValue(houseSitter.cleaningSupplies)) missingFields.push('Supplies preference')
  if (!hasValue(houseSitter.transportMode)) missingFields.push('Transport mode')
  if (houseSitter.transportMode === 'requires_pickup' && !hasValue(houseSitter.transportPickupLocation)) {
    missingFields.push('Pickup location')
  }
  if (!hasValue(houseSitter.idType)) missingFields.push('ID document type')
  if (!hasValue(houseSitter.idFileName) || !hasValue(houseSitter.idFileUrl)) {
    missingFields.push('Uploaded ID document')
  }
  if (houseSitter.workEligibilityAnswer !== true || !houseSitter.workEligibilityConfirmed) {
    missingFields.push('Work eligibility confirmation')
  }
  if (!houseSitter.termsAccepted) missingFields.push('Terms acceptance')
  if (!hasAvailabilitySlots) missingFields.push('Availability schedule')
  if (!houseSitter.standardsCompleted) missingFields.push('Cleaning standards confirmation')
  if (!houseSitter.quizPassed || (houseSitter.quizScore ?? 0) < 80) {
    missingFields.push('Quiz pass (80%+)')
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}
