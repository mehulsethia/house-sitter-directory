import { z } from 'zod'
import {
  isCyprusPostcode,
  isMvpCity,
  MVP_CITY,
  MVP_COUNTRY_CODE,
} from '@/lib/location-policy'

export const createClientAddressSchema = z.object({
  label: z.string().trim().max(80).optional(),
  address_line1: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(120).refine((value) => isMvpCity(value), `${MVP_CITY} only for MVP`),
  postcode: z.string().trim().refine((value) => isCyprusPostcode(value), 'Postcode must be 4 digits'),
  country: z.string().trim().length(2).default(MVP_COUNTRY_CODE).refine((value) => value.toUpperCase() === MVP_COUNTRY_CODE, `${MVP_COUNTRY_CODE} only for MVP`),
  apartment_details: z.string().trim().max(255).optional(),
  access_notes: z.string().trim().max(1000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  is_default: z.boolean().optional(),
})

export const updateClientAddressSchema = z.object({
  label: z.string().trim().max(80).optional(),
  address_line1: z.string().trim().min(1).max(255).optional(),
  city: z.string().trim().min(1).max(120).refine((value) => isMvpCity(value), `${MVP_CITY} only for MVP`).optional(),
  postcode: z.string().trim().refine((value) => isCyprusPostcode(value), 'Postcode must be 4 digits').optional(),
  country: z.string().trim().length(2).refine((value) => value.toUpperCase() === MVP_COUNTRY_CODE, `${MVP_COUNTRY_CODE} only for MVP`).optional(),
  apartment_details: z.string().trim().max(255).optional(),
  access_notes: z.string().trim().max(1000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  is_default: z.boolean().optional(),
})
