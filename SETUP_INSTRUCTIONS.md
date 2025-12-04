# 🚀 Instructions de Configuration - MyWishList

## ✅ Étapes complétées

- [x] Projet Next.js créé
- [x] Stack technique installée
- [x] Variables d'environnement configurées
- [x] Pages d'authentification créées
- [x] Interface utilisateur complète

## 🎯 Étapes à faire MAINTENANT

### 1. Appliquer le schéma SQL (OBLIGATOIRE - 3 min)

#### Aller sur Supabase Dashboard
URL directe : https://supabase.com/dashboard/project/qkbiuatvpylffzijjcej

#### Ouvrir SQL Editor
1. Clique sur **SQL Editor** dans le menu de gauche (icône </> )
2. Clique sur **+ New query**

#### Copier et exécuter le SQL
1. Ouvre le fichier : `/Users/feesh/Projets Claude Code/mywishlist/supabase/migrations/001_initial_schema.sql`
2. Copie TOUT le contenu (Cmd+A puis Cmd+C)
3. Colle dans l'éditeur SQL de Supabase
4. Clique sur **RUN** (ou Cmd+Enter)

✅ Tu verras "Success. No rows returned" - c'est normal !

Cela va créer :
- 11 tables (profiles, wishlists, items, followers, etc.)
- Tous les index pour les performances
- Row Level Security policies (sécurité)
- Triggers automatiques

### 2. Configurer l'authentification (2 min)

#### Dans le Dashboard Supabase :

**A) URL Configuration**
1. Va dans **Authentication** → **URL Configuration**
2. Configure :
   - **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : Ajoute `http://localhost:3000/**`
3. Sauvegarde

**B) Email Templates (IMPORTANT)**
1. Va dans **Authentication** → **Email Templates**
2. Sélectionne **Confirm signup**
3. Dans le template, cherche la ligne avec `{{ .ConfirmationURL }}`
4. Remplace par : `{{ .Token }}`
5. Sauvegarde

### 3. Lancer l'application

```bash
cd "/Users/feesh/Projets Claude Code/mywishlist"
npm run dev
```

Ouvre http://localhost:3000

### 4. Tester l'inscription

1. Va sur http://localhost:3000/signup
2. Crée un compte avec :
   - Username (3+ caractères)
   - Email valide
   - Mot de passe (8+ caractères)
3. Check ton email pour confirmer

## 🎨 Fonctionnalités disponibles

### Pages créées
- ✅ `/` - Page d'accueil
- ✅ `/login` - Connexion
- ✅ `/signup` - Inscription
- ✅ `/feed` - Feed d'activités
- ✅ `/wishlists` - Mes wishlists

### Composants UI
- Header avec navigation
- Menu utilisateur avec dropdown
- Formulaires avec validation
- Toasts pour les notifications
- Layout responsive

## 📊 Vérifier que tout fonctionne

### Dans Supabase Dashboard

**Vérifier les tables**
1. Va dans **Table Editor**
2. Tu dois voir toutes ces tables :
   - profiles
   - wishlists
   - wishlist_items
   - referral_codes
   - followers
   - friendships
   - notifications
   - comments
   - likes
   - wishlist_collaborators
   - activities

**Vérifier l'authentification**
1. Va dans **Authentication** → **Users**
2. Après inscription, tu verras ton utilisateur
3. Va dans **Table Editor** → **profiles**
4. Ton profil doit être créé automatiquement

## 🐛 Troubleshooting

### Erreur "relation does not exist"
→ Le schéma SQL n'a pas été appliqué. Retourne à l'étape 1.

### Erreur "email not confirmed"
→ Check ton email ou désactive la confirmation :
   - Authentication → Providers → Email → Désactive "Confirm email"

### Erreur de connexion à Supabase
→ Vérifie que `.env.local` contient les bonnes clés

### Page blanche ou erreur 500
→ Vérifie la console du navigateur et les logs du terminal

## 📝 Prochaines étapes de développement

Une fois que tout fonctionne :

1. **CRUD Wishlists** : Créer, modifier, supprimer des wishlists
2. **Items** : Ajouter des items aux wishlists
3. **Layout Masonry** : Affichage Pinterest-style
4. **Système social** : Follow, likes, commentaires
5. **Notifications temps réel** : Via Supabase Realtime
6. **Codes de parrainage** : Section dédiée

## 🔗 Liens utiles

- **Supabase Dashboard** : https://supabase.com/dashboard/project/qkbiuatvpylffzijjcej
- **Supabase Docs** : https://supabase.com/docs
- **Next.js Docs** : https://nextjs.org/docs

---

**Besoin d'aide ?** Demande à Claude Code ! 🤖
