# MyWishList 🎁

Une application web sociale pour créer et partager des wishlists, codes de parrainage et idées cadeaux avec vos proches.

## 🚀 Stack Technique

### Frontend
- **Next.js 15** (App Router) - Framework React avec SSR/SSG
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui + Radix UI** - Composants UI accessibles
- **@masonry-grid/react** - Layout Pinterest-style
- **Framer Motion** - Animations

### Backend & Database
- **Supabase**
  - PostgreSQL avec Row Level Security (RLS)
  - Authentication (cookie-based avec @supabase/ssr)
  - Realtime pour les notifications
  - Storage pour les images
  - Edge Functions

### State Management & Data Fetching
- **TanStack Query** - Cache et synchronisation des données
- **Zustand** - State management global
- **Zod** - Validation de schémas

## 📋 Fonctionnalités

### V1 (Core)
- ✅ Multi-wishlists par utilisateur
- ✅ Wishlists collaboratives avec invitations
- ✅ Items avec prix, priorité, statut, images
- ✅ Dates d'événements et catégories
- ✅ Système de followers et amis
- ✅ Feed d'activités personnalisé
- ✅ Commentaires sur wishlists/items
- ✅ Likes
- ✅ Notifications temps réel
- ✅ Profils publics/privés
- ✅ Section codes promo/parrainage avec tracking
- ✅ Affichage grille Pinterest + vue liste
- ✅ Partage via lien/QR code

### Roadmap (Post-V1)
- 🔮 Extension navigateur pour quick-add
- 🔮 Import depuis Amazon/autres sites
- 🔮 Price tracking automatique
- 🔮 Suggestions basées sur IA
- 🔮 Collections thématiques
- 🔮 Stats et analytics détaillées
- 🔮 Ads dans le feed
- 🔮 Partenariats avec marques

## 🛠️ Installation

### Prérequis
- Node.js 18+ et npm
- Un compte Supabase (gratuit)

### 1. Cloner le projet

```bash
cd "/Users/feesh/Projets Claude Code/mywishlist"
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Attendre que le projet soit prêt (2-3 minutes)

#### Récupérer les clés API
1. Aller dans **Project Settings** > **API**
2. Copier :
   - `URL` (Project URL)
   - `anon/public` key
   - `service_role` key (⚠️ À garder secrète)

#### Créer le fichier .env.local

```bash
cp .env.example .env.local
```

Puis éditer `.env.local` avec vos clés :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 4. Initialiser la base de données

#### Option A : Via l'interface Supabase
1. Aller dans **SQL Editor**
2. Copier le contenu de `supabase/migrations/001_initial_schema.sql`
3. Exécuter le script

#### Option B : Via Supabase CLI (recommandé)

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref your-project-ref

# Appliquer les migrations
supabase db push
```

### 5. Configurer l'authentification Supabase

1. Aller dans **Authentication** > **URL Configuration**
2. Ajouter votre URL de développement :
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

3. Aller dans **Authentication** > **Email Templates**
4. Modifier le template "Confirm signup" pour utiliser `{{ .Token }}` au lieu de `{{ .ConfirmationURL }}`

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
mywishlist/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Routes d'authentification
│   ├── (main)/              # Routes principales
│   ├── api/                 # API Routes
│   ├── globals.css          # Styles globaux
│   ├── layout.tsx           # Layout racine
│   └── page.tsx             # Page d'accueil
├── components/              # Composants React
│   ├── ui/                  # Composants shadcn/ui
│   ├── auth/                # Composants d'authentification
│   ├── wishlist/            # Composants wishlists
│   ├── social/              # Composants sociaux
│   ├── feed/                # Composants feed
│   └── shared/              # Composants partagés
├── lib/                     # Utilitaires et configurations
│   ├── supabase/            # Configuration Supabase
│   │   ├── client.ts        # Client browser
│   │   ├── server.ts        # Client serveur
│   │   └── middleware.ts    # Middleware auth
│   ├── validations/         # Schémas Zod
│   ├── hooks/               # Custom hooks
│   └── utils.ts             # Fonctions utilitaires
├── types/                   # Types TypeScript
│   └── database.types.ts    # Types de la base de données
├── supabase/                # Configuration Supabase
│   ├── migrations/          # Migrations SQL
│   └── functions/           # Edge Functions
├── public/                  # Fichiers statiques
└── middleware.ts            # Middleware Next.js
```

## 🔒 Sécurité

- **Row Level Security (RLS)** : Toutes les tables sont protégées par des policies RLS
- **HTTP-only Cookies** : Authentication via cookies sécurisés (anti-XSS)
- **TypeScript strict** : Typage fort pour éviter les erreurs
- **Validation Zod** : Validation côté client et serveur
- **CSRF Protection** : Intégré dans Next.js

## 🗄️ Base de Données

### Tables principales

- **profiles** : Profils utilisateurs (extension de auth.users)
- **wishlists** : Listes de souhaits
- **wishlist_items** : Items dans les wishlists
- **referral_codes** : Codes de parrainage
- **followers** : Relations followers/following
- **friendships** : Relations d'amitié
- **notifications** : Notifications utilisateurs
- **comments** : Commentaires
- **likes** : Likes sur wishlists/items/comments
- **wishlist_collaborators** : Collaborateurs sur wishlists
- **activities** : Activités pour le feed

### Schéma complet
Voir `supabase/migrations/001_initial_schema.sql` pour le schéma complet avec indexes et policies RLS.

## 🎨 Personnalisation

### Couleurs
Les couleurs sont définies dans `app/globals.css` avec des variables CSS. Modifier les valeurs HSL pour personnaliser le thème.

### Composants UI
Les composants shadcn/ui peuvent être ajoutés avec :

```bash
npx shadcn@latest add [component-name]
```

## 📝 Scripts disponibles

```bash
npm run dev      # Lancer le serveur de développement
npm run build    # Build de production
npm run start    # Lancer le serveur de production
npm run lint     # Linter le code
```

## 🚀 Déploiement

### Vercel (recommandé)

1. Push le code sur GitHub
2. Importer le projet sur [Vercel](https://vercel.com)
3. Ajouter les variables d'environnement
4. Déployer !

### Autres plateformes
Compatible avec toute plateforme supportant Next.js 15 (Netlify, Railway, etc.)

## 📄 License

Ce projet est privé et propriétaire.

## 🤝 Contribution

Pour l'instant, ce projet est en développement privé.

---

**Développé avec ❤️ par Claude Code**
