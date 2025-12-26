import { createClient } from '@/lib/supabase/client';

/**
 * Interface pour les statistiques de popularité d'un item
 */
export interface PopularityStats {
  item_id: string;
  likes_count: number;
  bookmarks_count: number;
  views_count: number;
  popularity_score: number;
  last_updated: string;
}

/**
 * Interface pour un item avec son score de popularité
 */
export interface ItemWithPopularity {
  id: string;
  popularity_score: number;
  [key: string]: any; // Autres propriétés de l'item
}

/**
 * Calcule le score de popularité d'un item
 * Score = (Likes × 3) + (Bookmarks × 5) + (Vues × 0.1) + Bonus Récence
 *
 * @param likes Nombre de likes
 * @param bookmarks Nombre de bookmarks
 * @param views Nombre de vues
 * @param createdAt Date de création de l'item
 * @returns Score de popularité
 */
export function calculatePopularityScore(
  likes: number,
  bookmarks: number,
  views: number,
  createdAt: Date
): number {
  const likesScore = likes * 3;
  const bookmarksScore = bookmarks * 5;
  const viewsScore = views * 0.1;

  // Bonus récence: items récents ont un boost (max 10 points, décroît sur 30 jours)
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyBonus = Math.max(0, 10 - (daysSinceCreation / 30) * 10);

  return likesScore + bookmarksScore + viewsScore + recencyBonus;
}

/**
 * Enregistre une vue pour un item
 * Note: La contrainte unique garantit max 1 vue par jour par user/item
 *
 * @param itemId ID de l'item
 * @param userId ID de l'utilisateur (optionnel pour les vues anonymes)
 * @returns true si la vue a été enregistrée, false sinon
 */
export async function trackItemView(
  itemId: string,
  userId?: string
): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase.from('views').insert({
      item_id: itemId,
      user_id: userId || null,
      // view_date sera automatiquement rempli avec CURRENT_DATE
    });

    // Si erreur de contrainte unique, c'est normal (déjà vu aujourd'hui)
    if (error) {
      if (error.code === '23505') {
        // UNIQUE constraint violation
        return false;
      }
      console.error('Error tracking view:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error tracking view:', error);
    return false;
  }
}

/**
 * Récupère les statistiques de popularité d'un ou plusieurs items
 *
 * @param itemIds Un ou plusieurs IDs d'items
 * @returns Map<itemId, PopularityStats>
 */
export async function getPopularityStats(
  itemIds: string | string[]
): Promise<Map<string, PopularityStats>> {
  const supabase = createClient();
  const ids = Array.isArray(itemIds) ? itemIds : [itemIds];

  const { data, error } = await supabase
    .from('item_popularity_stats')
    .select('*')
    .in('item_id', ids);

  if (error) {
    console.error('Error fetching popularity stats:', error);
    return new Map();
  }

  const statsMap = new Map<string, PopularityStats>();
  data?.forEach((stat) => {
    statsMap.set(stat.item_id, stat);
  });

  return statsMap;
}

/**
 * Rafraîchit les statistiques de popularité (vue matérialisée)
 * À appeler périodiquement (ex: toutes les heures via cron job)
 *
 * @returns true si le rafraîchissement a réussi
 */
export async function refreshPopularityStats(): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase.rpc('refresh_item_popularity_stats');

    if (error) {
      console.error('Error refreshing popularity stats:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error refreshing popularity stats:', error);
    return false;
  }
}

/**
 * Trie des items par score de popularité
 *
 * @param items Liste d'items
 * @param descending Tri décroissant (par défaut) ou croissant
 * @returns Items triés par popularité
 */
export function sortByPopularity<T extends ItemWithPopularity>(
  items: T[],
  descending = true
): T[] {
  return items.sort((a, b) => {
    const scoreA = a.popularity_score || 0;
    const scoreB = b.popularity_score || 0;
    return descending ? scoreB - scoreA : scoreA - scoreB;
  });
}

/**
 * Analyse les préférences d'un utilisateur basées sur ses interactions
 *
 * @param userId ID de l'utilisateur
 * @returns Catégories préférées triées par score
 */
export async function getUserPreferences(
  userId: string
): Promise<{ category: string; score: number }[]> {
  const supabase = createClient();

  // Récupérer les catégories des items que l'utilisateur a liké/bookmarké
  const { data: likedItems } = await supabase
    .from('likes')
    .select(
      `
      entity_id,
      wishlist_items!inner(
        wishlist:wishlists!inner(category)
      )
    `
    )
    .eq('user_id', userId)
    .eq('entity_type', 'item');

  const { data: bookmarkedItems } = await supabase
    .from('bookmarks')
    .select(
      `
      item_id,
      wishlist_items!inner(
        wishlist:wishlists!inner(category)
      )
    `
    )
    .eq('user_id', userId)
    .not('item_id', 'is', null);

  // Compter les catégories (bookmarks = poids 2, likes = poids 1)
  const categoryScores = new Map<string, number>();

  likedItems?.forEach((item: any) => {
    const category = item.wishlist_items?.wishlist?.category;
    if (category) {
      categoryScores.set(category, (categoryScores.get(category) || 0) + 1);
    }
  });

  bookmarkedItems?.forEach((item: any) => {
    const category = item.wishlist_items?.wishlist?.category;
    if (category) {
      categoryScores.set(category, (categoryScores.get(category) || 0) + 2);
    }
  });

  // Convertir en tableau et trier par score
  return Array.from(categoryScores.entries())
    .map(([category, score]) => ({ category, score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Mélange intelligemment des items de différentes sources
 * pour créer un feed équilibré
 *
 * @param sources Différentes listes d'items (ex: nouveaux, populaires, personnalisés)
 * @param weights Poids de chaque source (doit avoir la même longueur que sources)
 * @param totalItems Nombre total d'items à retourner
 * @returns Liste d'items mélangés
 */
export function mixFeedSources<T extends { id: string }>(
  sources: T[][],
  weights: number[],
  totalItems: number
): T[] {
  if (sources.length !== weights.length) {
    throw new Error('Sources and weights must have the same length');
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map((w) => w / totalWeight);

  const result: T[] = [];
  const usedIds = new Set<string>();
  const sourceIndices = sources.map(() => 0);

  // Calculer combien d'items prendre de chaque source
  const itemsPerSource = normalizedWeights.map((w) =>
    Math.round(w * totalItems)
  );

  // Remplir le résultat en alternant entre les sources selon leur poids
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const itemsNeeded = itemsPerSource[i];

    let itemsTaken = 0;
    while (itemsTaken < itemsNeeded && sourceIndices[i] < source.length) {
      const item = source[sourceIndices[i]];
      sourceIndices[i]++;

      // Éviter les doublons
      if (!usedIds.has(item.id)) {
        result.push(item);
        usedIds.add(item.id);
        itemsTaken++;
      }
    }
  }

  // Si on n'a pas assez d'items, compléter avec ce qui reste
  if (result.length < totalItems) {
    for (let i = 0; i < sources.length && result.length < totalItems; i++) {
      while (sourceIndices[i] < sources[i].length && result.length < totalItems) {
        const item = sources[i][sourceIndices[i]];
        sourceIndices[i]++;

        if (!usedIds.has(item.id)) {
          result.push(item);
          usedIds.add(item.id);
        }
      }
    }
  }

  return result.slice(0, totalItems);
}
