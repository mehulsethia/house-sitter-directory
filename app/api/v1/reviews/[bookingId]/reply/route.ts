import { NextRequest } from 'next/server'
import { requireHouseSitter } from '@/server/auth'
import { reviewRepo } from '@/server/repositories/review.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { houseSitterReviewResponseSchema } from '@/server/schemas/review.schema'
import { ok, err } from '@/server/response'

export const POST = requireHouseSitter(async (req: NextRequest, ctx, user) => {
  const { bookingId: reviewId } = await ctx.params
  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) return err('HouseSitter profile not found', 404)

  const review = await reviewRepo.findById(reviewId)
  if (!review) return err('Review not found', 404)
  if (review.houseSitterId !== houseSitter.id) return err('Forbidden', 403)
  if (review.houseSitterReply) return err('Reply already submitted and cannot be edited', 409)

  const body = await req.json()
  const parsed = houseSitterReviewResponseSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)

  const updated = await reviewRepo.update(reviewId, {
    houseSitterReply: parsed.data.response,
    houseSitterReplyAt: new Date(),
  })
  return ok(updated)
})
