import { z } from 'zod'

export const createDisputeSchema = z.object({
  reason: z.string().min(1).max(2000),
  evidence: z.array(z.string().url()).optional(),
})

export const updateDisputeStatusSchema = z.object({
  status: z.enum(['under_review']),
})

const optionalPositiveNumber = z.preprocess(
  (value) => (value === null || value === '' ? undefined : value),
  z.number().positive().optional(),
)

const optionalPercentage = z.preprocess(
  (value) => (value === null || value === '' ? undefined : value),
  z.number().min(1).max(100).optional(),
)

export const resolveDisputeSchema = z.object({
  resolution_type: z.enum(['full_refund', 'partial_refund', 'no_refund', 'payment_released']),
  resolution_note: z.string().min(1),
  refund_amount: optionalPositiveNumber,
  charge_percentage: optionalPercentage,
})
