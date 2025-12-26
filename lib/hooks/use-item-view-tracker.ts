import { useEffect, useRef } from 'react';
import { trackItemView } from '@/lib/utils/popularity';

/**
 * Hook pour tracker automatiquement les vues d'items
 * Utilise IntersectionObserver pour détecter quand l'item est visible
 *
 * @param itemId ID de l'item à tracker
 * @param userId ID de l'utilisateur (optionnel)
 * @param threshold Pourcentage de visibilité pour déclencher le tracking (0-1, défaut: 0.5)
 * @param enabled Active ou désactive le tracking (défaut: true)
 * @returns Ref à attacher à l'élément DOM à tracker
 *
 * @example
 * const viewRef = useItemViewTracker(item.id, currentUser?.id);
 * return <Card ref={viewRef}>...</Card>;
 */
export function useItemViewTracker(
  itemId: string,
  userId?: string,
  threshold = 0.5,
  enabled = true
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !itemId || hasTrackedRef.current) {
      return;
    }

    const element = elementRef.current;
    if (!element) {
      return;
    }

    // Callback appelé quand l'élément devient visible
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTrackedRef.current) {
          // L'élément est visible, tracker la vue
          trackItemView(itemId, userId).then((success) => {
            if (success) {
              hasTrackedRef.current = true;
            }
          });
        }
      });
    };

    // Créer l'observer
    const observer = new IntersectionObserver(handleIntersection, {
      threshold, // L'élément doit être visible à 50% par défaut
      rootMargin: '0px', // Pas de marge
    });

    // Observer l'élément
    observer.observe(element);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [itemId, userId, threshold, enabled]);

  return elementRef;
}

/**
 * Version batch du hook pour tracker plusieurs items en une fois
 * Plus performant si vous avez beaucoup d'items sur la page
 *
 * @param items Liste d'items avec leur ID
 * @param userId ID de l'utilisateur
 * @param threshold Pourcentage de visibilité (défaut: 0.5)
 * @param enabled Active ou désactive le tracking (défaut: true)
 * @returns Fonction pour obtenir une ref pour un item spécifique
 *
 * @example
 * const getViewRef = useItemViewTrackerBatch(items, currentUser?.id);
 * return items.map(item => <Card ref={getViewRef(item.id)}>...</Card>);
 */
export function useItemViewTrackerBatch(
  items: { id: string }[],
  userId?: string,
  threshold = 0.5,
  enabled = true
) {
  const refsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const trackedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || items.length === 0) {
      return;
    }

    // Callback appelé quand un élément devient visible
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Trouver l'ID de l'item correspondant
          const itemId = entry.target.getAttribute('data-item-id');
          if (itemId && !trackedIds.current.has(itemId)) {
            trackItemView(itemId, userId).then((success) => {
              if (success) {
                trackedIds.current.add(itemId);
              }
            });
          }
        }
      });
    };

    // Créer un seul observer pour tous les items
    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin: '0px',
    });

    // Observer tous les éléments
    refsMap.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [items, userId, threshold, enabled]);

  // Fonction pour obtenir une ref pour un item spécifique
  const getViewRef = (itemId: string) => (element: HTMLDivElement | null) => {
    if (element) {
      element.setAttribute('data-item-id', itemId);
      refsMap.current.set(itemId, element);
    } else {
      refsMap.current.delete(itemId);
    }
  };

  return getViewRef;
}
