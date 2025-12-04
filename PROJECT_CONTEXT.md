# MyWishList - Documentation Projet Complète

> **Date de dernière mise à jour**: 4 décembre 2025
> **Version**: 1.2.0
> **Statut**: En développement actif

---

## 📋 PROMPT DE CONTEXTE POUR IA

```
Tu es Claude Code, un assistant de développement. Voici le contexte complet du projet MyWishList :

PROJET: MyWishList - Plateforme sociale de partage de wishlists et achats
STACK: Next.js 15, TypeScript, Supabase (PostgreSQL), TailwindCSS, shadcn/ui
ARCHITECTURE: App Router (Next.js 15), Client/Server Components
AUTHENTIFICATION: Supabase Auth
DÉPLOIEMENT: Vercel
REPOSITORY: https://github.com/feesh-78/mywishlist.git

Le projet est une plateforme sociale type Instagram/Pinterest permettant de :
1. Créer et partager des WISHLISTS (envies, souhaits)
2. Créer et partager des SHOPPING LISTS (achats effectués)
3. Suivre d'autres utilisateurs
4. Interagir (likes, commentaires, favoris)
5. Rechercher par catégories (focus sur les thématiques, pas le type de liste)
6. Feed de découverte avec produits individuels (Pinterest-style)

PHILOSOPHIE: L'accent est mis sur les CATÉGORIES et les PRODUITS individuels,
pas sur le type de liste (wishlist vs shopping). Les deux sont traités de manière égale.
```

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique
- **Frontend**: Next.js 15.5.7 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: TanStack Query, Zustand
- **Validation**: Zod
- **Layout**: Masonry Grid (@masonry-grid/react)
- **Déploiement**: Vercel

### Structure du Projet
```
mywishlist/
├── app/
│   ├── (auth)/                 # Routes d'authentification
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/                 # Routes principales (nécessite auth)
│   │   ├── feed/              # Feed de découverte (produits individuels)
│   │   ├── search/            # Recherche unifiée (users + collections)
│   │   ├── explore/           # Page d'exploration
│   │   ├── profile/[username]/ # Profils utilisateurs (onglets Wishlists/Achats)
│   │   ├── settings/          # Paramètres (onglets Profil/Paramètres)
│   │   ├── wishlists/         # Gestion des wishlists
│   │   │   ├── new/          # Création wishlist
│   │   │   └── [slug]/       # Détail wishlist
│   │   └── shopping/          # Gestion des shopping lists
│   │       └── new/          # Création shopping list
│   └── layout.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── shared/                # Composants partagés
│   │   ├── header.tsx        # Navigation principale
│   │   └── image-upload.tsx  # Upload d'images Supabase
│   ├── skeletons/            # Loading states
│   └── notification-center.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Client Supabase
│   │   └── server.ts         # Server Supabase
│   ├── hooks/
│   │   ├── use-user.ts       # Hook utilisateur
│   │   └── use-toast.ts      # Hook toast
│   └── utils.ts
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_add_profiles.sql
│       ├── 003_add_wishlists.sql
│       ├── 004_add_social.sql
│       └── 005_add_shopping_lists.sql  # ✅ DERNIER EXÉCUTÉ
└── middleware.ts              # Auth middleware
```

---

## 🗄️ STRUCTURE BASE DE DONNÉES (Supabase PostgreSQL)

### Tables Principales

#### `profiles`
```sql
- id (uuid, PK, ref: auth.users)
- username (text, unique)
- full_name (text)
- avatar_url (text)
- bio (text)
- website (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `wishlists`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- title (text)
- description (text)
- slug (text, unique)
- category (text)  -- 🔥 IMPORTANT: Utilisé pour les filtres
- cover_image_url (text)
- is_public (boolean, default: true)
- list_type (varchar(20), default: 'wishlist')  -- 🔥 'wishlist' OU 'shopping_list'
- created_at (timestamptz)
- updated_at (timestamptz)

Indexes:
- idx_wishlists_user_id
- idx_wishlists_slug
- idx_wishlists_list_type  -- 🔥 Nouveau
```

#### `wishlist_items`
```sql
- id (uuid, PK)
- wishlist_id (uuid, FK -> wishlists)
- title (text)
- description (text)
- url (text)
- image_url (text)
- price (decimal)
- currency (varchar(3), default: 'EUR')
- priority (integer)
- is_reserved (boolean, default: false)
- reserved_by (uuid, FK -> profiles)
- reserved_at (timestamptz)
- purchase_date (timestamptz)  -- 🔥 Nouveau (pour shopping lists)
- store (text)                 -- 🔥 Nouveau
- rating (integer, 1-5)        -- 🔥 Nouveau
- review (text)                -- 🔥 Nouveau
- order_index (integer)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `followers`
```sql
- id (uuid, PK)
- follower_id (uuid, FK -> profiles)
- following_id (uuid, FK -> profiles)
- created_at (timestamptz)

Unique constraint: (follower_id, following_id)
```

#### `likes`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- entity_type (text)  -- 'wishlist', 'item', 'comment'
- entity_id (uuid)
- created_at (timestamptz)

Unique constraint: (user_id, entity_id, entity_type)
```

#### `bookmarks`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- wishlist_id (uuid, FK -> wishlists, nullable)
- item_id (uuid, FK -> wishlist_items, nullable)
- created_at (timestamptz)
```

#### `comments`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- entity_type (text)  -- 'wishlist', 'item'
- entity_id (uuid)
- content (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `activities`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- type (text)  -- 'created_wishlist', 'created_shopping_list', 'added_item', etc.
- entity_type (text)
- entity_id (uuid)
- is_public (boolean, default: true)
- created_at (timestamptz)

Indexes:
- idx_activities_user_id
- idx_activities_created_at
```

#### `notifications`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- type (text)
- title (text)
- message (text)
- link (text)
- is_read (boolean, default: false)
- created_at (timestamptz)
```

### Triggers & Functions

#### `create_list_activity()`
Trigger automatique sur `INSERT wishlists`:
- Si `list_type = 'shopping_list'` → crée activité `created_shopping_list`
- Sinon → crée activité `created_wishlist`

---

## 🎨 FONCTIONNALITÉS IMPLÉMENTÉES

### 1. Authentification
- [x] Login/Signup avec Supabase Auth
- [x] Middleware de protection des routes
- [x] Gestion des sessions
- [x] Redirection automatique si non connecté

### 2. Profils Utilisateurs
- [x] Création automatique du profil (trigger Supabase)
- [x] Modification du profil (avatar, bio, website, nom)
- [x] Page profil avec onglets "Wishlists" et "Mes Achats"
- [x] Support URL `?tab=shopping` pour ouvrir directement onglet achats
- [x] Statistiques (followers, following, nombre de listes)
- [x] Système de follow/unfollow

### 3. Wishlists (Envies)
- [x] Création de wishlists avec image de couverture
- [x] Ajout/modification/suppression d'items
- [x] Catégorisation (catégories libres)
- [x] Visibilité publique/privée
- [x] Slug unique pour partage

### 4. Shopping Lists (Achats)
- [x] Création de shopping lists avec image de couverture
- [x] Même structure que wishlists mais `list_type = 'shopping_list'`
- [x] Champs spécifiques: date d'achat, magasin, note, avis
- [x] Page de création `/shopping/new`
- [x] Affichage séparé dans le profil (onglet "Mes Achats")

### 5. Feed de Découverte
- [x] Affichage des **produits individuels** (pas des collections)
- [x] Layout Pinterest/Masonry (4 colonnes sur XL)
- [x] Badges visuels "Acheté" (vert) vs "Envie" (gris)
- [x] Filtrage par catégories (badges cliquables)
- [x] 3 onglets: Pour vous / Suivis / Populaires
- [x] Likes sur les items
- [x] Favoris (bookmarks) sur les items
- [x] Bouton lien externe si l'item a une URL
- [x] Partage (copie du lien)

### 6. Recherche Unifiée
- [x] Recherche utilisateurs (username, full_name)
- [x] Recherche collections (wishlists + shopping lists fusionnés)
- [x] Filtrage par catégories (badges)
- [x] Onglets: Tout / Utilisateurs / Collections
- [x] Badges "Achats" vs "Envies" sur chaque résultat
- [x] Placeholder: "Rechercher utilisateurs, collections, catégories..."

### 7. Navigation & Menu
- [x] Header sticky avec logo, search, navigation
- [x] Menu déroulant utilisateur:
  - Mon profil
  - Mes wishlists
  - **Mes achats** (nouveau, redirige vers profil?tab=shopping)
  - Paramètres
  - Se déconnecter
- [x] Navigation mobile responsive
- [x] NotificationCenter

### 8. Paramètres
- [x] Structure à onglets: "Profil" / "Paramètres"
- [x] Onglet Profil: Modification avatar, nom, bio, username, website
- [x] Onglet Paramètres:
  - Notifications (email, push, followers, commentaires)
  - Confidentialité (profil public)
  - Sécurité (lien changement mot de passe)
  - Langue (FR, EN, ES)
  - Apparence (thème: système/clair/sombre)
  - Gestion du compte (lien vers /account)

### 9. Interactions Sociales
- [x] Follow/Unfollow
- [x] Likes (wishlists, items)
- [x] Bookmarks (wishlists, items)
- [x] Commentaires (structure DB prête, UI à implémenter)
- [x] Notifications (structure DB prête, UI partiellement implémentée)

### 10. Upload d'Images
- [x] Component `ImageUpload` avec Supabase Storage
- [x] Buckets: `wishlist-covers`, `wishlist-items`, `avatars`
- [x] Preview avant upload
- [x] Suppression d'anciennes images

---

## 🎯 PHILOSOPHIE DU PROJET

### Concept Clé: CATÉGORIES > TYPE DE LISTE

**Principe fondamental**: Les utilisateurs s'intéressent aux **produits** et aux **catégories**, pas au fait qu'un produit soit dans une wishlist ou une shopping list.

**Conséquences**:
1. **Recherche unifiée**: Wishlists et Shopping Lists sont mélangées dans les résultats
2. **Feed unifié**: Le feed montre tous les produits, qu'ils soient achetés ou désirés
3. **Filtrage par catégories**: Le filtre principal est la catégorie, pas le type
4. **Badges visuels discrets**: Des badges permettent de distinguer visuellement mais ne séparent pas

**Vocabulaire**:
- "Collections" = terme générique pour wishlists + shopping lists
- "Envies" = items dans une wishlist
- "Achats" = items dans une shopping list

### Layout Pinterest-Style

Le feed utilise un layout masonry (colonnes CSS):
- 1 colonne sur mobile
- 2 colonnes sur tablet
- 3 colonnes sur desktop
- 4 colonnes sur XL screens

Chaque carte affiche:
- Image du produit
- Badge type (Acheté/Envie) en overlay
- Badge prix en overlay
- Avatar + username de l'auteur
- Titre du produit
- Badge catégorie (lien vers la collection)
- Actions: like, external link, share, bookmark

---

## 📝 HISTORIQUE DES DÉVELOPPEMENTS

### Session 1 - Setup Initial
- Setup Next.js 15 + Supabase
- Migrations DB complètes (001 à 004)
- Système d'authentification
- Composants shadcn/ui de base

### Session 2 - Paramètres & Thème
- Déplacement du toggle thème dans les paramètres
- Création structure à onglets (Profil/Paramètres)
- Ajout sections paramètres (notifications, confidentialité, sécurité, langue, apparence)

### Session 3 - Shopping Lists
- Migration 005: Ajout `list_type` à `wishlists`
- Champs spécifiques shopping (purchase_date, store, rating, review)
- Page `/shopping/new`
- Onglets séparés dans les profils (Wishlists/Mes Achats)
- Mise à jour triggers et activités

### Session 4 - Transformation du Feed
- Feed transformé pour afficher des **produits individuels**
- Layout Pinterest/Masonry
- Badges visuels Acheté/Envie
- Filtrage par catégories
- Likes/bookmarks sur les items

### Session 5 - Navigation & Recherche (ACTUEL)
- Ajout menu "Mes achats" dans header
- Support URL `?tab=shopping` pour profils
- Fusion wishlists + shopping lists dans recherche
- Onglet "Collections" au lieu de "Wishlists"
- Badges Achats/Envies dans résultats de recherche
- Placeholders mis à jour ("collections" au lieu de "wishlists")

---

## 🚀 ÉTAT ACTUEL DU PROJET

### ✅ Fonctionnel
- Authentification complète
- Création/gestion wishlists
- Création/gestion shopping lists
- Feed de découverte (produits individuels)
- Recherche unifiée
- Profils utilisateurs
- Follow/Unfollow
- Likes & Bookmarks
- Upload d'images
- Paramètres complets
- Navigation intuitive

### 🚧 À Implémenter
- [ ] UI complète pour les commentaires
- [ ] Centre de notifications fonctionnel
- [ ] Page de détail d'un item
- [ ] Page de détail d'une collection
- [ ] Réservation d'items (système de cadeaux)
- [ ] Codes de parrainage
- [ ] QR codes pour partage
- [ ] Page Explorer avec tendances
- [ ] Statistiques avancées
- [ ] Gestion des collaborateurs (wishlists partagées)

### 🐛 Bugs Connus
- Aucun bug majeur identifié

---

## 🔑 INFORMATIONS CLÉS POUR LE DÉVELOPPEMENT

### Variables d'Environnement (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=<url_supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé_anon>
SUPABASE_SERVICE_ROLE_KEY=<clé_service>
```

### Commandes Utiles
```bash
# Dev
npm run dev

# Build
npm run build

# Migrations Supabase (via Dashboard SQL Editor)
# Coller le contenu des fichiers .sql dans l'éditeur

# Déploiement Vercel (automatique sur push GitHub)
git push origin main
```

### Conventions de Code
- **Composants**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase avec préfixe `use` (`useUser.ts`)
- **Types**: PascalCase avec suffixe `Type` si nécessaire
- **Server Components**: Par défaut (sauf 'use client')
- **Client Components**: Avec directive `'use client'`

### Points d'Attention
1. **Toujours lire un fichier avant de l'éditer** (obligation de l'outil Edit)
2. **list_type**: Ne jamais oublier de filtrer ou inclure selon le contexte
3. **Categories**: Focus principal du projet
4. **Badges visuels**: Toujours distinguer Achats (vert) vs Envies (gris)
5. **Recherche unifiée**: Ne pas séparer wishlists et shopping lists

---

## 📞 CONTACT & DÉPLOIEMENT

- **GitHub**: https://github.com/feesh-78/mywishlist.git
- **Vercel**: Auto-déployé sur push
- **Supabase**: Dashboard pour gérer la DB

---

## 🔄 INSTRUCTIONS POUR MISE À JOUR DE CE DOCUMENT

Quand l'utilisateur demande "Mets à jour le document de contexte", suivre ces étapes:

1. Lire ce fichier (`PROJECT_CONTEXT.md`)
2. Mettre à jour la section "Date de dernière mise à jour" et "Version"
3. Ajouter les nouvelles fonctionnalités dans "FONCTIONNALITÉS IMPLÉMENTÉES"
4. Ajouter une nouvelle entrée dans "HISTORIQUE DES DÉVELOPPEMENTS"
5. Mettre à jour "ÉTAT ACTUEL DU PROJET"
6. Si changements DB: mettre à jour "STRUCTURE BASE DE DONNÉES"
7. Si changements architecture: mettre à jour "ARCHITECTURE TECHNIQUE"
8. Commit le fichier avec message: "docs: Mise à jour contexte projet [Session X]"

---

**FIN DU DOCUMENT DE CONTEXTE**
