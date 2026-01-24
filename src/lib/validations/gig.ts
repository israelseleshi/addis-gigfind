import * as z from 'zod'

export const gigSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  category: z.string().min(1, 'Please select a category'),
  budget: z.coerce.number().min(100, 'Minimum budget is 100 ETB'),
  location: z.string().min(1, 'Please select a location'),
  deadline: z.date().optional(),
})
