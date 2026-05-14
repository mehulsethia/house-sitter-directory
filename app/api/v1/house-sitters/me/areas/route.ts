import { NextRequest } from 'next/server'
import { requireHouseSitter } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok, err } from '@/server/response'
import { addServiceAreaSchema } from '@/server/schemas/house-sitter.schema'
import { MVP_CITY } from '@/lib/location-policy'

export const POST = requireHouseSitter(async (req: NextRequest, _ctx, user) => {
  const body = await req.json()
  const parsed = addServiceAreaSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)

  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) return err('HouseSitter profile not found', 404)

  const area = await houseSitterRepo.addServiceArea(houseSitter.id, {
    city: MVP_CITY,
    postcodePrefix: parsed.data.postcode_prefix,
    radiusKm: parsed.data.radius_km,
  })
  return ok(area, 201)
})
