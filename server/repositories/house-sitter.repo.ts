import { db } from '../db'

export const houseSitterRepo = {
  findById: (id: string) =>
    db.houseSitter.findUnique({
      where: { id },
      include: { user: true, serviceAreas: true },
    }),

  findByUserId: (userId: string) =>
    db.houseSitter.findUnique({
      where: { userId },
      include: { user: true, serviceAreas: true },
    }),

  create: (userId: string) =>
    db.houseSitter.create({
      data: { userId, hourlyRate: 15 },
      include: { user: true, serviceAreas: true },
    }),

  update: (id: string, data: Partial<{
    bio: string | null
    profileImageUrl: string | null
    skills: string[]
    cleaningSupplies: string | null
    yearsExperience: number
    hourlyRate: number
    transportMode: string | null
    transportPickupLocation: string | null
    idType: string | null
    idFileName: string | null
    idFileUrl: string | null
    petAcceptance: boolean
    petComfortable: boolean | null
    workEligibilityAnswer: boolean | null
    workEligibilityConfirmed: boolean
    termsAccepted: boolean
    cleaningStandardsAccepted: boolean
    cleaningQuizScore: number | null
    cleaningQuizPassedAt: Date | null
    standardsCompleted: boolean
    quizPassed: boolean
    quizScore: number | null
    onboardingStep: number
    onboardingSkippedStep3: boolean
    onboardingSkippedStep4: boolean
    onboardingCompletedAt: Date | null
    profileComplete: boolean
    identityVerified: boolean
    stripeOnboardingComplete: boolean
    stripeAccountId: string
    status: string
    rejectionReason: string | null
    approvedAt: Date | null
    approvedBy: string | null
  }>) =>
    db.houseSitter.update({
      where: { id },
      data,
      include: { user: true, serviceAreas: true },
    }),

  search: (params: {
    city?: string
    availability?: 'any' | 'next_7_days'
    transportMode?: 'own_car' | 'bus_walk' | 'requires_pickup'
    cleaningSupplies?: 'own_supplies' | 'house_sit_supplies'
    servicesOffered?: string[]
    minRating?: number
    minPrice?: number
    maxPrice?: number
    page: number
    pageSize: number
  }) => {
    const where = {
      status: 'approved' as const,
      profileComplete: true,
      stripeOnboardingComplete: true,
      ...(params.transportMode ? { transportMode: params.transportMode } : {}),
      ...(params.cleaningSupplies ? { cleaningSupplies: params.cleaningSupplies } : {}),
      ...(params.availability === 'next_7_days'
        ? { availabilitySchedules: { some: { isActive: true } } }
        : {}),
      ...(params.servicesOffered && params.servicesOffered.length > 0
        ? { skills: { hasSome: params.servicesOffered } }
        : {}),
      ...(params.minRating !== undefined ? { averageRating: { gte: params.minRating } } : {}),
      ...(params.minPrice !== undefined ? { hourlyRate: { gte: params.minPrice } } : {}),
      ...(params.maxPrice !== undefined ? { hourlyRate: { lte: params.maxPrice } } : {}),
      ...(params.city
        ? { serviceAreas: { some: { city: { contains: params.city, mode: 'insensitive' as const } } } }
        : {}),
    }
    return Promise.all([
      db.houseSitter.findMany({
        where,
        include: { user: true, serviceAreas: true },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { averageRating: 'desc' },
      }),
      db.houseSitter.count({ where }),
    ])
  },

  listPending: () =>
    db.houseSitter.findMany({
      where: { status: 'pending' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    }),

  listAll: (params: { status?: string; page: number; pageSize: number }) => {
    const where =
      !params.status
        ? {}
        : params.status === 'pending_approval'
          ? { status: 'pending' }
          : params.status === 'live'
            ? { status: 'approved', stripeOnboardingComplete: true }
            : params.status === 'approved'
              ? { status: 'approved', stripeOnboardingComplete: false }
              : { status: params.status }
    return Promise.all([
      db.houseSitter.findMany({
        where,
        include: { user: true },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.houseSitter.count({ where }),
    ])
  },

  addServiceArea: (houseSitterId: string, data: { city: string; postcodePrefix?: string; radiusKm?: number }) =>
    db.serviceArea.create({ data: { houseSitterId, ...data } }),

  removeServiceArea: (id: string, houseSitterId: string) =>
    db.serviceArea.deleteMany({ where: { id, houseSitterId } }),

  countStrikes: (houseSitterId: string) =>
    db.houseSitterStrike.count({ where: { houseSitterId } }),

  suspend: (id: string, suspended: boolean) =>
    db.houseSitter.update({
      where: { id },
      data: { status: suspended ? 'suspended' : 'approved' },
    }),
}
