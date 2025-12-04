import { z } from 'zod';

export const wishlistVisibilitySchema = z.enum(['public', 'private', 'followers', 'friends', 'custom']);

export const createWishlistSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional(),
  slug: z
    .string()
    .min(1, 'Le slug est requis')
    .max(100, 'Le slug ne peut pas dépasser 100 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  coverImageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
  visibility: wishlistVisibilitySchema.default('public'),
  isCollaborative: z.boolean().default(false),
  eventDate: z.string().datetime().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
});

export const updateWishlistSchema = createWishlistSchema.partial().omit({ slug: true });

export const createWishlistItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z.string().max(2000, 'La description ne peut pas dépasser 2000 caractères').optional(),
  url: z.string().url('URL invalide').optional().or(z.literal('')),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  price: z.number().positive('Le prix doit être positif').optional().nullable(),
  currency: z.string().default('EUR'),
  priority: z.number().int().min(1).max(5).default(3),
  position: z.number().int().default(0),
});

export const updateWishlistItemSchema = createWishlistItemSchema.partial();

export const reserveWishlistItemSchema = z.object({
  itemId: z.string().uuid(),
  reserve: z.boolean(),
});

export type CreateWishlistInput = z.infer<typeof createWishlistSchema>;
export type UpdateWishlistInput = z.infer<typeof updateWishlistSchema>;
export type CreateWishlistItemInput = z.infer<typeof createWishlistItemSchema>;
export type UpdateWishlistItemInput = z.infer<typeof updateWishlistItemSchema>;
export type ReserveWishlistItemInput = z.infer<typeof reserveWishlistItemSchema>;
