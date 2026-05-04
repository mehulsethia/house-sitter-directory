import { NextRequest } from 'next/server'
import { requireClient } from '@/server/auth'
import { clientRepo } from '@/server/repositories/client.repo'
import { clientAddressRepo } from '@/server/repositories/client-address.repo'
import { updateClientAddressSchema } from '@/server/schemas/client-address.schema'
import { ok, err } from '@/server/response'
import { MVP_CITY, MVP_COUNTRY_CODE, normalizeCyprusPostcode } from '@/lib/location-policy'

export const PATCH = requireClient(async (req: NextRequest, ctx, user) => {
  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const parsed = updateClientAddressSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)

  let client = await clientRepo.findByUserId(user.id)
  if (!client) client = await clientRepo.create(user.id)

  const existing = await clientAddressRepo.findById(id)
  if (!existing || existing.client_id !== client.id) return err('Address not found', 404)

  if (parsed.data.is_default) {
    await clientAddressRepo.clearDefaultForClient(client.id)
  }

  const updated = await clientAddressRepo.updateById(id, {
    label: parsed.data.label ?? null,
    addressLine1: parsed.data.address_line1,
    city: parsed.data.city ? MVP_CITY : undefined,
    postcode: parsed.data.postcode ? normalizeCyprusPostcode(parsed.data.postcode) : undefined,
    country: parsed.data.country ? MVP_COUNTRY_CODE : undefined,
    apartmentDetails: parsed.data.apartment_details ?? null,
    accessNotes: parsed.data.access_notes,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    isDefault: parsed.data.is_default,
  })

  if (!updated) return err('Address not found', 404)
  return ok(updated)
})

export const DELETE = requireClient(async (_req: NextRequest, ctx, user) => {
  const { id } = await ctx.params

  let client = await clientRepo.findByUserId(user.id)
  if (!client) client = await clientRepo.create(user.id)

  const existing = await clientAddressRepo.findById(id)
  if (!existing || existing.client_id !== client.id) return err('Address not found', 404)

  await clientAddressRepo.deleteById(id)
  return ok({ removed: true })
})
