# Guide d'application des migrations Supabase

## Migration 010 : Système de popularité et tracking des vues

Cette migration ajoute un système complet de tracking des vues et de calcul de popularité.

### ⚠️ Important

Cette migration doit être appliquée **AVANT** de déployer le nouveau code sur Vercel.

### Ce qui est ajouté

1. **Table `views`** : Tracking des vues de produits (1 max par jour par utilisateur/produit)
2. **Vue matérialisée `item_popularity_stats`** : Statistiques de popularité précalculées
3. **Fonction `refresh_item_popularity_stats()`** : Pour rafraîchir les stats
4. **Policies RLS** : Sécurité sur la table views

### Application de la migration

#### Option 1 : Via le Dashboard Supabase (Recommandé)

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet MyWishList
3. Aller dans **Database** > **SQL Editor**
4. Cliquer sur **New query**
5. Copier-coller le contenu de `migrations/010_add_views_and_popularity.sql`
6. Cliquer sur **Run**
7. Vérifier qu'il n'y a pas d'erreurs

#### Option 2 : Via Supabase CLI

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter
supabase login

# Lier le projet (remplacer PROJECT_ID)
supabase link --project-ref YOUR_PROJECT_ID

# Appliquer la migration
supabase db push

# Ou appliquer un fichier spécifique
psql $DATABASE_URL -f supabase/migrations/010_add_views_and_popularity.sql
```

### Vérification de l'installation

Exécuter ces requêtes pour vérifier :

```sql
-- Vérifier que la table views existe
SELECT COUNT(*) FROM views;

-- Vérifier que la vue matérialisée existe
SELECT COUNT(*) FROM item_popularity_stats;

-- Tester la fonction de rafraîchissement
SELECT refresh_item_popularity_stats();
```

### Configuration du rafraîchissement automatique (Optionnel)

Pour de meilleures performances, configurer un cron job pour rafraîchir les stats :

1. Aller dans **Database** > **Cron Jobs**
2. Créer un nouveau job :

```sql
-- Rafraîchir les stats toutes les heures
SELECT cron.schedule(
  'refresh-popularity-stats',
  '0 * * * *', -- Toutes les heures
  $$
  SELECT refresh_item_popularity_stats();
  $$
);
```

Ou toutes les 15 minutes pour plus de fraîcheur :

```sql
SELECT cron.schedule(
  'refresh-popularity-stats',
  '*/15 * * * *', -- Toutes les 15 minutes
  $$
  SELECT refresh_item_popularity_stats();
  $$
);
```

### Rollback (en cas de problème)

Si vous devez annuler la migration :

```sql
-- Supprimer le cron job (si créé)
SELECT cron.unschedule('refresh-popularity-stats');

-- Supprimer les objets dans l'ordre inverse
DROP MATERIALIZED VIEW IF EXISTS item_popularity_stats CASCADE;
DROP FUNCTION IF EXISTS refresh_item_popularity_stats() CASCADE;
DROP TABLE IF EXISTS views CASCADE;
```

### Performance

- La vue matérialisée est indexée pour des performances optimales
- Le rafraîchissement peut prendre quelques secondes selon le nombre de produits
- Les vues sont comptées de manière efficace (max 1 par jour par utilisateur)

### Monitoring

Pour voir les statistiques de popularité :

```sql
-- Top 10 produits les plus populaires
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

### Questions fréquentes

**Q: Combien de fois puis-je rafraîchir les stats ?**
R: La commande REFRESH MATERIALIZED VIEW CONCURRENTLY permet de rafraîchir sans bloquer les lectures. Vous pouvez le faire aussi souvent que nécessaire, mais toutes les 15-60 minutes est généralement suffisant.

**Q: Les vues anonymes sont-elles trackées ?**
R: Oui, les vues anonymes sont possibles (user_id = NULL), mais seules les vues authentifiées sont trackées par défaut dans le code.

**Q: Que faire si la migration échoue ?**
R: Vérifier les erreurs SQL, s'assurer que les tables `likes` et `bookmarks` existent, et que l'extension UUID est activée.
