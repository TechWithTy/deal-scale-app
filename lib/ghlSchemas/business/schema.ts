import { z } from 'zod';

// Define zod schemas for validation
const BusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.record(z.string(), z.string().nullable()),
  updatedBy: z.record(z.string(), z.string().nullable()).optional()
});

const BusinessPayloadSchema = z.object({
  website: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  name: z.string(),
  locationId: z.string()
});
export type Business = z.infer<typeof BusinessSchema>;
export type BusinessPayload = z.infer<typeof BusinessPayloadSchema>;
export { BusinessSchema, BusinessPayloadSchema };
