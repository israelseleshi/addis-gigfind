import * as z from 'zod'
import { LOCATIONS } from '@/lib/types/locations'

const locationEnum = z.enum(LOCATIONS)

export const onboardingSchema = z.object({
  phone: z.string().regex(/^(\+251)?(9\d{8})$/, 'Invalid Ethiopian phone number. Use 09... format.'),
  location: locationEnum,
  bio: z.string().min(10, 'Bio must be at least 10 characters.').max(500, 'Bio must be less than 500 characters.'),
  avatarUrl: z.string().url('Invalid URL.').optional(),
})
