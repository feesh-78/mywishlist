import { z } from 'zod';

export const createReferralCodeSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  code: z.string().min(1, 'Le code est requis').max(50, 'Le code ne peut pas dépasser 50 caractères'),
  url: z.string().url('URL invalide').optional().or(z.literal('')),
  category: z.string().max(50).optional().nullable(),
});

export const updateReferralCodeSchema = createReferralCodeSchema.partial();

export type CreateReferralCodeInput = z.infer<typeof createReferralCodeSchema>;
export type UpdateReferralCodeInput = z.infer<typeof updateReferralCodeSchema>;
