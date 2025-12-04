# Migrations de la base de données

Ce fichier contient les instructions pour exécuter les migrations de la base de données Supabase.

## Migration 002: Ajout de la table bookmarks

### Date: 2024-12-04

### Description
Cette migration ajoute la fonctionnalité de favoris (bookmarks) permettant aux utilisateurs de sauvegarder des wishlists et des items.

### Instructions d'exécution

#### Option A: Via l'interface Supabase (recommandé)

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet MyWishList
3. Allez dans **SQL Editor** dans le menu de gauche
4. Cliquez sur **New query**
5. Copiez le contenu du fichier `supabase/migrations/002_add_bookmarks.sql`
6. Collez-le dans l'éditeur SQL
7. Cliquez sur **Run** pour exécuter la migration
8. Vérifiez qu'il n'y a pas d'erreurs dans la console

#### Option B: Via Supabase CLI

```bash
# Si vous n'avez pas encore installé Supabase CLI
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet (si pas déjà fait)
supabase link --project-ref votre-project-ref

# Appliquer la migration
supabase db push
```

### Vérification

Après l'exécution de la migration, vérifiez que:

1. La table `bookmarks` existe dans la base de données
2. Les indexes sont créés correctement
3. Les politiques RLS (Row Level Security) sont actives

Vous pouvez vérifier cela en exécutant cette requête SQL:

```sql
-- Vérifier que la table existe
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'bookmarks';

-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'bookmarks';
```

### Rollback (si nécessaire)

Si vous devez annuler cette migration, exécutez:

```sql
-- Supprimer les politiques RLS
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

-- Supprimer la table
DROP TABLE IF EXISTS bookmarks;
```

## Fonctionnalités ajoutées

Après cette migration, les utilisateurs peuvent:
- ⭐ Ajouter des wishlists en favoris
- 📦 Ajouter des items individuels en favoris
- 📋 Voir tous leurs favoris sur la page `/favoris`
- 🔄 Retirer des éléments de leurs favoris

## Structure de la table bookmarks

```sql
bookmarks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,           -- Utilisateur qui a créé le bookmark
  wishlist_id UUID,                 -- ID de la wishlist (nullable)
  item_id UUID,                     -- ID de l'item (nullable)
  created_at TIMESTAMPTZ,           -- Date de création

  -- Contrainte: soit wishlist_id soit item_id doit être renseigné
  -- Empêche les doublons
)
```
