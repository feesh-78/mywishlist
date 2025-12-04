import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Le commentaire ne peut pas être vide')
    .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères'),
  wishlistId: z.string().uuid().optional().nullable(),
  itemId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
}).refine((data) => data.wishlistId || data.itemId, {
  message: 'Le commentaire doit être associé à une wishlist ou un item',
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Le commentaire ne peut pas être vide')
    .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
