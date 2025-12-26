# 🧠 Algorithme de Feed Intelligent - MyWishList

## Vue d'ensemble

Le feed MyWishList utilise maintenant un **système d'algorithmes intelligent** pour afficher les produits les plus pertinents à chaque utilisateur.

## 📊 Score de Popularité

Chaque produit possède un **score de popularité** calculé selon cette formule :

```
Score = (Likes × 3) + (Bookmarks × 5) + (Vues × 0.1) + Bonus Récence
```

### Pondération

- **Likes** : `×3` - Action rapide, engagement moyen
- **Bookmarks** : `×5` - Action forte, l'utilisateur veut vraiment sauvegarder
- **Vues** : `×0.1` - Action passive, faible engagement mais importante pour la viralité
- **Bonus Récence** : `0 à 10 points` - Décroît sur 30 jours pour favoriser les nouveautés

### Exemple de calcul

Un produit avec :
- 10 likes
- 5 bookmarks
- 200 vues
- Créé il y a 5 jours

```
Score = (10 × 3) + (5 × 5) + (200 × 0.1) + 8.33
Score = 30 + 25 + 20 + 8.33 = 83.33
```

---

## 🎯 Algorithmes par Onglet

### 1. "Pour vous" (All)

**Algorithme de personnalisation avec mélange intelligent**

#### Étapes :

1. **Analyse des préférences utilisateur**
   - Identifie les 3 catégories les plus aimées/bookmarkées
   - Calcul du score par catégorie : `(Bookmarks × 2) + Likes`

2. **Création de 3 sources de contenu** :
   - **Personnalisé** (40%) : Produits dans les catégories préférées
   - **Populaire** (35%) : Top 50 par score de popularité
   - **Récent** (25%) : 50 produits les plus récents

3. **Mélange intelligent** :
   - Fonction `mixFeedSources()` qui :
     - Respecte les poids définis
     - Évite les doublons
     - Alterne entre les sources pour la diversité

4. **Fallback** :
   - Si pas assez de données pour personnaliser :
     - Populaire (60%) + Récent (40%)

#### Code simplifié :

```typescript
const userPrefs = await getUserPreferences(userId);
const personalizedItems = items.filter(item =>
  preferredCategories.includes(item.wishlist?.category)
);

const feed = mixFeedSources(
  [personalizedItems, popularItems, recentItems],
  [0.4, 0.35, 0.25],
  100
);
```

---

### 2. "Populaires" (Popular)

**Tri simple par score de popularité décroissant**

```typescript
allItems = sortByPopularity(allItems, true);
```

Les produits avec le meilleur score apparaissent en premier.

---

### 3. "Suivis" (Following)

**Chronologique simple**

- Affiche uniquement les produits des utilisateurs suivis
- Tri par date de création (plus récents en premier)
- Pas de personnalisation supplémentaire

---

## 👁️ Tracking des Vues

### IntersectionObserver API

Le système utilise l'**Intersection Observer API** pour tracker automatiquement les vues :

```typescript
const observer = new IntersectionObserver(handleIntersection, {
  threshold: 0.5, // 50% du produit visible
  rootMargin: '0px'
});
```

### Fonctionnement

1. Chaque card de produit a une `ref` attachée
2. Quand 50% de la card devient visible
3. Une vue est enregistrée dans la table `views`
4. **Maximum 1 vue par jour par utilisateur/produit**

### Contrainte SQL

```sql
CONSTRAINT unique_user_item_view_per_day
  UNIQUE (user_id, item_id, (created_at::date))
```

Cela évite :
- Le spam de vues
- Les vues en boucle lors du scroll
- La manipulation des statistiques

---

## 🔄 Rafraîchissement des Statistiques

### Vue matérialisée

Les statistiques sont **précalculées** dans une vue matérialisée pour les performances :

```sql
CREATE MATERIALIZED VIEW item_popularity_stats AS
SELECT
  wi.id as item_id,
  COUNT(DISTINCT l.id) as likes_count,
  COUNT(DISTINCT b.id) as bookmarks_count,
  COUNT(DISTINCT v.id) as views_count,
  -- Calcul du score
  (COUNT(DISTINCT l.id) * 3 + ...) as popularity_score
FROM wishlist_items wi
LEFT JOIN likes l ON ...
LEFT JOIN bookmarks b ON ...
LEFT JOIN views v ON ...
GROUP BY wi.id;
```

### Rafraîchissement

**Recommandé** : Toutes les 15-60 minutes via Cron Job

```sql
SELECT cron.schedule(
  'refresh-popularity-stats',
  '*/15 * * * *',
  $$ SELECT refresh_item_popularity_stats(); $$
);
```

---

## 📈 Architecture Technique

### Fichiers créés/modifiés

```
lib/utils/popularity.ts          → Fonctions de calcul et tracking
lib/hooks/use-item-view-tracker.ts → Hook React pour IntersectionObserver
app/(main)/feed/page.tsx           → Intégration des algorithmes
supabase/migrations/010_*.sql      → Base de données
```

### Flow de données

```
1. Utilisateur scroll le feed
   ↓
2. IntersectionObserver détecte visibilité
   ↓
3. trackItemView() enregistre vue dans DB
   ↓
4. Cron Job rafraîchit item_popularity_stats
   ↓
5. loadItems() charge les stats depuis la vue
   ↓
6. Algorithme trie/mélange selon feedType
   ↓
7. Affichage du feed personnalisé
```

---

## 🎛️ Paramètres Configurables

### Poids des actions

```typescript
// Dans lib/utils/popularity.ts
const likesScore = likes * 3;      // Modifier ici
const bookmarksScore = bookmarks * 5;
const viewsScore = views * 0.1;
```

### Poids des sources (Pour vous)

```typescript
// Dans app/(main)/feed/page.tsx
mixFeedSources(
  [personalizedItems, popularItems, recentItems],
  [0.4, 0.35, 0.25], // Modifier ces poids
  100
);
```

### Seuil de visibilité

```typescript
// Dans lib/hooks/use-item-view-tracker.ts
const observer = new IntersectionObserver(callback, {
  threshold: 0.5, // 0 à 1 (0% à 100%)
});
```

---

## 🚀 Améliorations Futures

### Court terme
- [ ] A/B testing des poids d'algorithmes
- [ ] Dashboard analytics pour les stats de popularité
- [ ] Notifications quand un produit devient viral

### Moyen terme
- [ ] Machine Learning pour personnalisation avancée
- [ ] Collaborative filtering (utilisateurs similaires)
- [ ] Analyse de sessions pour mieux comprendre l'engagement

### Long terme
- [ ] Recommandations basées sur l'IA
- [ ] Détection de tendances en temps réel
- [ ] Système d'enchères publicitaires (sponsorisé)

---

## 📊 Monitoring

### Requêtes utiles

**Top 10 produits populaires** :
```sql
SELECT
  wi.title,
  ips.popularity_score,
  ips.likes_count,
  ips.bookmarks_count,
  ips.views_count
FROM item_popularity_stats ips
JOIN wishlist_items wi ON wi.id = ips.item_id
ORDER BY ips.popularity_score DESC
LIMIT 10;
```

**Catégories préférées d'un utilisateur** :
```typescript
const prefs = await getUserPreferences(userId);
console.log(prefs);
// [{ category: 'Mode', score: 15 }, ...]
```

**Vues par produit** :
```sql
SELECT item_id, COUNT(*) as view_count
FROM views
GROUP BY item_id
ORDER BY view_count DESC
LIMIT 10;
```

---

## 🔐 Sécurité et Performance

### Row Level Security (RLS)

```sql
-- Tout le monde peut lire les stats
CREATE POLICY "Views are publicly readable"
  ON views FOR SELECT USING (true);

-- Seuls les utilisateurs authentifiés peuvent créer des vues
CREATE POLICY "Authenticated users can create views"
  ON views FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### Indexes

```sql
CREATE INDEX views_item_id_idx ON views(item_id);
CREATE INDEX views_created_at_idx ON views(created_at);
CREATE INDEX item_popularity_stats_score_idx
  ON item_popularity_stats(popularity_score DESC);
```

### Performance

- Vue matérialisée = **O(1)** pour lecture des stats
- IntersectionObserver = **natif navigateur**, très performant
- Batch tracking = 1 seul observer pour tous les items

---

## 📝 Conclusion

Ce système d'algorithmes offre :

✅ **Personnalisation** : Feed unique par utilisateur
✅ **Popularité** : Détection des tendances
✅ **Performance** : Précalcul des stats
✅ **Scalabilité** : Architecture optimisée
✅ **Flexibilité** : Poids configurables
✅ **Sécurité** : RLS + contraintes SQL

Le feed MyWishList est maintenant **aussi intelligent que celui d'Instagram ou TikTok** ! 🚀
