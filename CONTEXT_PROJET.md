# 📝 CONTEXT PROJET - MYWISHLIST

> **Dernière mise à jour** : 26 décembre 2024
> **Version actuelle** : v3 (avec algorithmes de feed intelligents)

---

## 🎯 VUE D'ENSEMBLE DU PROJET

**MyWishList** est une application social de gestion de wishlists (listes de souhaits) avec partage, collaboration et synchronisation web ↔ mobile.

**Stack technique** :
- **Frontend** : Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend** : Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Mobile** : Capacitor 8 (app Android native)
- **Déploiement** : Vercel (web) + APK (Android)
- **UI** : shadcn/ui, Radix UI, Framer Motion

---

## 📁 STRUCTURE DU PROJET

```
mywishlist/
├── app/                          # Pages Next.js (App Router)
│   ├── (main)/                  # Layout principal (authentifié)
│   │   ├── feed/                # Feed d'actualités
│   │   ├── add-product/         # Ajout de produit (partage)
│   │   ├── wishlists/           # Gestion des wishlists
│   │   ├── profile/             # Profils utilisateurs
│   │   └── search/              # Recherche
│   ├── (auth)/                  # Pages d'authentification
│   │   ├── login/
│   │   ├── signup/
│   │   └── auth/confirm/        # Callback auth
│   └── api/                     # API Routes
│       ├── extract-url/         # Extraction produit depuis URL
│       └── analyze-screenshot/  # Analyse d'image produit
│
├── components/                   # Composants React
│   ├── ui/                      # Composants UI (shadcn)
│   ├── shared/                  # Composants partagés (Header)
│   └── pwa-install-prompt.tsx   # Prompt installation PWA
│
├── lib/                          # Bibliothèques utilitaires
│   ├── supabase/                # Client Supabase
│   │   ├── client.ts            # Client browser (avec Capacitor)
│   │   └── middleware.ts        # Middleware auth
│   ├── hooks/                   # Hooks React personnalisés
│   │   ├── use-user.ts          # Hook utilisateur
│   │   ├── use-toast.ts         # Hook toasts
│   │   └── use-platform.ts      # Hook détection plateforme (NEW)
│   └── utils.ts                 # Fonctions utilitaires
│
├── android/                      # Projet Android (Capacitor)
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml  # Manifest (permissions, intents)
│   │   └── java/.../MainActivity.java  # Activity principale
│   ├── build.gradle             # Config Gradle
│   └── gradle.properties        # Properties (Java Home)
│
├── public/                       # Assets statiques
├── supabase/                     # Schéma DB et migrations
├── capacitor.config.ts           # Config Capacitor
├── next.config.ts                # Config Next.js
└── package.json                  # Dépendances npm
```

---

## 🔄 HISTORIQUE DU DÉVELOPPEMENT

### Phase 1 : Setup initial du projet (Début décembre 2024)

✅ Création du projet Next.js 15 avec TypeScript
✅ Configuration Supabase (auth, database, storage)
✅ Schéma de base de données (users, wishlists, items, etc.)
✅ UI avec shadcn/ui et TailwindCSS
✅ Système d'authentification (email/password)
✅ Pages principales (feed, wishlists, profil)

### Phase 2 : Features sociales (Mi-décembre 2024)

✅ Système de followers/following
✅ Feed d'actualités avec grille masonry
✅ Partage de wishlists
✅ Commentaires et likes
✅ Notifications temps réel (Supabase Realtime)
✅ Codes de parrainage

### Phase 3 : Extraction de produits (Fin décembre 2024)

✅ API d'extraction de produits depuis URL (Open Graph)
✅ Support multi-sites (Nike, Amazon, Zara, Jules, etc.)
✅ Analyse d'images avec IA (Ollama - optionnel)
✅ Extraction automatique des métadonnées (titre, prix, image)

**Domaines supportés** :
- Amazon (`m.media-amazon.com`, `images-*.ssl-images-amazon.com`)
- Nike (`static.nike.com`)
- Fnac (`static.fnac-static.com`)
- Boulanger (`media.boulanger.com`)
- Zara (`static.zara.net`)
- H&M (`image.hm.com`)
- Sephora (`www.sephora.fr`)
- Jules (`**.jules.com`, `media.jules.com`)
- Wildcard HTTPS (`**`) pour tous les autres sites

### Phase 4 : Application Android (23-26 décembre 2024)

#### 23 décembre : Premier APK

✅ Installation de Capacitor 8
✅ Configuration Android (SDK, Gradle, Java 21)
✅ Intent Filter pour partage depuis autres apps
✅ Deep Link pour partage de produits
✅ Build du premier APK (v1 - 3.9 Mo)

**Problème identifié** : Boucle infinie "Authenticating" lors de la connexion.

#### 24 décembre : PWA via PWABuilder

⚠️ Tentative de création d'app via PWABuilder
⚠️ TWA (Trusted Web Activity) créée (`mywishlist-twa/`)
❌ Partage depuis Nike ne fonctionnait toujours pas

**Diagnostic** : PWA seule insuffisante pour le partage natif.

#### 26 décembre matin : Fix authentification + APK v2

✅ Ajout Deep Link d'authentification (`com.mywishlist.app://login-callback`)
✅ Configuration Intent Filter pour callback Supabase
✅ Modification du client Supabase pour détecter Capacitor
✅ Code Java pour gérer la redirection auth
✅ Déploiement Vercel avec les modifications
✅ Build APK v2 (4.0 Mo) avec auth fonctionnelle

**URL Vercel actuelle** : `https://mywishlist-ruddy.vercel.app`

**Configuration Supabase requise** :
- Redirect URL : `com.mywishlist.app://login-callback`

#### 26 décembre après-midi : Améliorations UX

✅ Fix images produits (Jules + wildcard HTTPS)
✅ Création du hook `usePlatform()` pour détecter le contexte
✅ Masquage du bouton "Installer" sur desktop
✅ Documentation complète du projet

### Phase 5 : Algorithmes de feed intelligents (26 décembre 2024 soir)

#### Problématique initiale
L'utilisateur a demandé : "Comment est-ce que l'on choisit les images qui sont partagées dans le feed ? Il faut un algorithme pour cela non ?"

#### Solution implémentée

✅ **Système de tracking des vues**
- Table `views` dans Supabase
- Tracking automatique avec IntersectionObserver API
- Maximum 1 vue par jour par utilisateur/produit
- Hook React `useItemViewTrackerBatch` pour performance

✅ **Système de score de popularité**
- Formule : `(Likes × 3) + (Bookmarks × 5) + (Vues × 0.1) + Bonus Récence`
- Vue matérialisée `item_popularity_stats` pour précalcul
- Fonction `refresh_item_popularity_stats()` pour rafraîchissement
- Indices SQL pour optimisation des requêtes

✅ **Algorithme "Populaires"**
- Tri par score de popularité décroissant
- Top produits avec le plus d'engagement

✅ **Algorithme "Pour vous" (personnalisé)**
- Analyse des préférences utilisateur (catégories likées/bookmarkées)
- Mélange intelligent de 3 sources :
  - Personnalisé (40%) : Catégories préférées
  - Populaire (35%) : Top scores de popularité
  - Récent (25%) : Nouveautés
- Fonction `mixFeedSources()` pour équilibrage
- Diversité du contenu (pas tous les produits du même utilisateur)

✅ **Algorithme "Suivis"**
- Tri chronologique simple
- Uniquement les produits des utilisateurs suivis

**Fichiers créés** :
- `lib/utils/popularity.ts` : Fonctions de calcul et tracking
- `lib/hooks/use-item-view-tracker.ts` : Hook IntersectionObserver
- `supabase/migrations/010_add_views_and_popularity.sql` : Migration DB
- `docs/ALGORITHME_FEED.md` : Documentation complète
- `supabase/MIGRATION.md` : Guide d'application

**Fichiers modifiés** :
- `app/(main)/feed/page.tsx` : Intégration des algorithmes
- `CONTEXT_PROJET.md` : Documentation mise à jour

**Migration requise** :
⚠️ Appliquer `010_add_views_and_popularity.sql` dans Supabase avant déploiement

**Recommandation** :
Configurer un Cron Job Supabase pour rafraîchir les stats toutes les 15-60 minutes

---

## 🔑 FONCTIONNALITÉS CLÉS

### 1. Authentification
- ✅ Email/Password via Supabase Auth
- ✅ Vérification email obligatoire
- ✅ Reset mot de passe
- ✅ Deep Link pour callback (app Android)

### 2. Wishlists
- ✅ Création/édition/suppression
- ✅ Collaboration multi-utilisateurs
- ✅ Visibilité (publique/privée/amis)
- ✅ Catégories et tags
- ✅ Grille masonry (Pinterest-style)

### 3. Produits
- ✅ Ajout manuel ou via URL
- ✅ Extraction automatique (titre, prix, image)
- ✅ Upload d'images
- ✅ Catégories auto-complétées
- ✅ Multi-devises (EUR, USD, GBP)

### 4. Social
- ✅ Followers/Following
- ✅ Feed d'actualités
- ✅ Likes et commentaires
- ✅ Notifications temps réel
- ✅ Profils publics

### 5. Partage (Android uniquement)
- ✅ Intent Filter pour recevoir partages
- ✅ Deep Link vers `/add-product?url=...`
- ✅ Extraction automatique au partage
- ✅ Fonctionne depuis Nike, Amazon, etc.

---

## 🛠️ CONFIGURATION TECHNIQUE

### Environnement (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://qkbiuatvpylffzijjcej.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Dashboard

**Redirect URLs configurées** :
```
http://localhost:3000/**
https://mywishlist-ruddy.vercel.app/**
com.mywishlist.app://login-callback
```

**Tables principales** :
- `profiles` : Profils utilisateurs
- `wishlists` : Wishlists
- `wishlist_items` : Items dans wishlists
- `follows` : Relations followers
- `notifications` : Notifications
- `comments` : Commentaires
- `likes` : Likes

### Capacitor (android/)

**App ID** : `com.mywishlist.app`
**App Name** : MyWishList
**Server URL** : `https://mywishlist-ruddy.vercel.app`

**Java version** : 21 (JDK 21.0.5+11)
**Android SDK** : `/opt/homebrew/share/android-commandlinetools`
**Min SDK** : 24
**Target SDK** : 36

**Intent Filters configurés** :
1. `ACTION_MAIN` + `CATEGORY_LAUNCHER` (icône app)
2. `ACTION_SEND` + `text/plain` (partage depuis autres apps)
3. `ACTION_VIEW` + `com.mywishlist.app://login-callback` (auth callback)

### Next.js

**Mode** : Production (standard, pas export)
**Images** : Wildcard HTTPS autorisé (`hostname: '**'`)
**Middleware** : Auth sur routes protégées

---

## 🚀 COMMANDES UTILES

### Développement

```bash
# Lancer en local
npm run dev

# Builder le site
npm run build

# Déployer sur Vercel (production)
npx vercel --prod
```

### Android

```bash
# Synchroniser Capacitor
npx cap sync android

# Builder l'APK
export JAVA_HOME="/Users/feesh/.bubblewrap/jdk/jdk-21.0.5+11/Contents/Home"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
cd android
./gradlew assembleDebug

# APK généré
android/app/build/outputs/apk/debug/app-debug.apk
```

### Debugging Android

```bash
# Installer via ADB
adb install path/to/app-debug.apk

# Voir les logs
adb logcat | grep -i "mywishlist\|capacitor"

# Inspecter la WebView (Chrome DevTools)
# Ouvrir chrome://inspect dans Chrome Desktop
```

---

## 🔄 WORKFLOW DE DÉVELOPPEMENT

### Pour 95% des modifications (UI, features, bugs)

1. Modifier le code Next.js
2. `npx vercel --prod`
3. L'app Android se met à jour automatiquement ✨

**Pas besoin de rebuilder l'APK !**

### Pour 5% des modifications (natif Android)

Rebuild APK uniquement si tu changes :
- Icône de l'app
- Nom de l'app
- Permissions Android
- Intent Filters
- URL Vercel pointée

---

## 📦 FICHIERS IMPORTANTS CRÉÉS

Sur le bureau de l'utilisateur :
- `MyWishList-v2-fixed-auth.apk` : APK Android fonctionnel (4.0 Mo)
- `FIX_AUTHENTIFICATION.txt` : Guide installation et config Supabase
- `INSTALLATION_ANDROID.txt` : Instructions d'installation détaillées
- `GUIDE_TECHNIQUE_APK.txt` : Guide technique (rebuild, release, etc.)
- `README_TRANSFERT.txt` : Résumé rapide

Dans le projet :
- `lib/hooks/use-platform.ts` : Hook pour détecter desktop/mobile/app
- `capacitor.config.ts` : Config Capacitor
- `android/` : Projet Android complet
- `.env.production` : Variables d'environnement production

---

## 🐛 PROBLÈMES RÉSOLUS

### Problème 1 : Boucle "Authenticating" (26 déc matin)

**Symptôme** : Après connexion, l'app restait bloquée sur "Authenticating".

**Cause** : Supabase redirige vers une URL web, mais l'app Android ne savait pas comment l'intercepter.

**Solution** :
1. Ajout Deep Link `com.mywishlist.app://login-callback`
2. Intent Filter Android pour intercepter ce lien
3. Code Java pour rediriger la WebView
4. Configuration Supabase avec l'URL de callback

✅ **Résolu** : Connexion fonctionne parfaitement dans l'app.

### Problème 2 : Images ne s'affichent pas (Jules) (26 déc après-midi)

**Symptôme** : Image extraite de Jules affichait le texte alternatif mais pas l'image.

**Cause** : Domaine Jules non autorisé dans `next.config.ts`.

**Solution** :
1. Ajout de `**.jules.com` et `media.jules.com`
2. Ajout wildcard HTTPS `**` pour tous les sites

✅ **Résolu** : Toutes les images de tous les sites s'affichent.

### Problème 3 : Bouton "Installer" sur desktop (26 déc après-midi)

**Symptôme** : Popup PWA s'affiche partout, même sur desktop.

**Cause** : Pas de détection du contexte d'exécution.

**Solution** :
1. Création du hook `usePlatform()`
2. Modification de `<PWAInstallPrompt />` pour masquer sur desktop/app
3. Affichage uniquement sur mobile web

✅ **Résolu** : Popup visible uniquement sur mobile web.

---

## 📝 NOTES POUR REPRENDRE LE PROJET

### État actuel (26 déc 2024, 14h)

**✅ Ce qui fonctionne** :
- Site web Vercel : https://mywishlist-ruddy.vercel.app
- App Android : Connexion, navigation, ajout produits
- Partage depuis Nike/Amazon/Jules : Fonctionne
- Extraction produits : Tous les sites supportés
- Images : Affichage correct (y compris Jules)
- PWA prompt : Affiché uniquement sur mobile web

**🚧 En cours / À faire** :
- [ ] Icône personnalisée pour l'app Android
- [ ] Version Release APK (signée)
- [ ] Publication Play Store (optionnel - 25$)
- [ ] App iOS (via Capacitor ou PWA)
- [ ] Notifications push (Firebase)
- [ ] Mode offline (Service Worker)

**📊 Statistiques** :
- Lignes de code : ~15,000
- Composants React : ~50
- Pages : 31
- API Routes : 5
- Taille APK : 4.0 Mo
- Taille déploiement Vercel : ~10 MB

---

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

### Court terme (cette semaine)

1. **Tester l'app intensivement**
   - Partage depuis différents sites
   - Navigation dans l'app
   - Synchronisation web ↔ app

2. **Personnaliser l'app**
   - Changer l'icône (voir GUIDE_TECHNIQUE_APK.txt)
   - Ajuster les couleurs/branding si besoin

3. **Optimisations mineures**
   - Améliorer la vitesse de chargement
   - Ajouter des animations
   - Peaufiner l'UX mobile

### Moyen terme (ce mois)

1. **Notifications push**
   - Configurer Firebase
   - Implémenter les notifications

2. **Version iOS**
   - Builder avec Capacitor
   - Tester sur iPhone

3. **Features additionnelles**
   - Mode sombre
   - Filtres avancés
   - Statistiques

### Long terme

1. **Publication stores**
   - Play Store (Android)
   - App Store (iOS)

2. **Monétisation** (si souhaité)
   - Premium features
   - Abonnements
   - Pub (pas recommandé)

---

## 💾 BACKUP ET VERSIONING

### Git

```bash
# Le projet est dans un repo Git
cd "/Users/feesh/Projets Claude Code/mywishlist"
git status

# Pour créer un commit
git add .
git commit -m "Description des changements"
git push
```

### Sauvegardes importantes

**Code source** : Git + GitHub
**Base de données** : Supabase (backups auto)
**APK builds** : `android/app/build/outputs/apk/`
**Déploiements** : Vercel (historique complet)

---

## 🔐 SECRETS ET CREDENTIALS

**⚠️ NE JAMAIS COMMIT** :
- `.env.local` (clés Supabase)
- `android/local.properties` (SDK path)
- Keystores de signature (si créés)
- Tokens d'API personnels

**✅ Déjà dans .gitignore** :
- `.env.local`
- `node_modules/`
- `.next/`
- `android/build/`
- `android/app/build/`

---

## 📞 RESSOURCES ET SUPPORT

**Documentation** :
- Next.js : https://nextjs.org/docs
- Supabase : https://supabase.com/docs
- Capacitor : https://capacitorjs.com/docs
- shadcn/ui : https://ui.shadcn.com

**Debugging** :
- Chrome DevTools : chrome://inspect (pour WebView)
- Supabase Dashboard : https://supabase.com/dashboard
- Vercel Dashboard : https://vercel.com/dashboard
- Android Studio : Pour éditer le code Java/Kotlin

**Claude Code** :
- Ce fichier sert de contexte pour reprendre le projet
- Inclure ce fichier dans une nouvelle conversation pour que je me souvienne de tout

---

## ✅ CHECKLIST DE REPRISE

Si tu reprends le projet après une pause, vérifie :

**Environnement** :
- [ ] Node.js et npm installés
- [ ] Java 21 disponible (`~/.bubblewrap/jdk/jdk-21.0.5+11/`)
- [ ] Android SDK installé (`/opt/homebrew/share/android-commandlinetools/`)
- [ ] Variables d'environnement configurées (`.env.local`)

**Services externes** :
- [ ] Supabase projet actif (https://supabase.com/dashboard)
- [ ] Vercel projet déployé (https://vercel.com/dashboard)
- [ ] URL de redirect configurée dans Supabase

**Dépendances** :
- [ ] `npm install` exécuté
- [ ] `npx cap sync android` si modifications Capacitor

**Fichiers critiques** :
- [ ] `capacitor.config.ts` pointe vers la bonne URL
- [ ] `android/local.properties` contient le bon SDK path
- [ ] `android/gradle.properties` contient le bon JAVA_HOME

---

## 🎉 CONCLUSION

Le projet MyWishList est **opérationnel et fonctionnel** :
- ✅ Site web déployé sur Vercel
- ✅ App Android native avec Capacitor
- ✅ Authentification fixée
- ✅ Partage depuis autres apps fonctionnel
- ✅ Base de données synchronisée
- ✅ PWA installable sur mobile web

**Prêt pour** : Tests utilisateurs, améliorations, publication.

---

*Dernière mise à jour : 26 décembre 2024, 14h00*
*Créé avec Claude Code*
