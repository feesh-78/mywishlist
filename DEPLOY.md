# 🚀 Guide de Déploiement - MyWishList

## Option 1 : Déploiement Automatique (Recommandé)

### 1. Créer le repository GitHub

Va sur : https://github.com/new

Configure :
- **Repository name** : `mywishlist`
- **Description** : `MyWishList - Plateforme sociale pour partager vos wishlists 🎁`
- **Public** : Coché
- **NE PAS initialiser** avec README, .gitignore ou license

Clique sur **"Create repository"**

### 2. Pousser le code

Une fois le repository créé, copie les commandes affichées et exécute :

```bash
cd "/Users/feesh/Projets Claude Code/mywishlist"
git remote add origin https://github.com/TON_USERNAME/mywishlist.git
git branch -M main
git push -u origin main
```

### 3. Déployer sur Vercel

1. Va sur : https://vercel.com/new
2. Connecte-toi avec GitHub
3. **Import Git Repository** : Sélectionne `mywishlist`
4. Configure :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `./`
   - **Build Command** : `npm run build` (par défaut)

5. **IMPORTANT - Variables d'environnement** :

   Clique sur **"Environment Variables"** et ajoute :

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qkbiuatvpylffzijjcej.supabase.co
   ```

   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYml1YXR2cHlsZmZ6aWpqY2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTM2NTIsImV4cCI6MjA4MDM4OTY1Mn0.lMLLDmWpREq4IzFCRi28MKkgSvAJkigJ62srPTV8Byk
   ```

   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYml1YXR2cHlsZmZ6aWpqY2VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgxMzY1MiwiZXhwIjoyMDgwMzg5NjUyfQ.L6Wz875hFRHH_JtlBMPavBWTwfPVGfgZ06JHi02JpVw
   ```

6. Clique sur **"Deploy"**

### 4. Configurer Supabase pour la production

Une fois déployé, tu auras une URL comme : `https://mywishlist-xxx.vercel.app`

Va dans **Supabase Dashboard** > **Authentication** > **URL Configuration** :

- **Site URL** : `https://mywishlist-xxx.vercel.app`
- **Redirect URLs** : Ajoute `https://mywishlist-xxx.vercel.app/**`

## Option 2 : Déploiement Manuel via Interface

### Via GitHub.com

1. Va sur https://github.com/new
2. Crée le repository
3. Sur ta machine, exécute les commandes affichées

### Via Vercel.com

1. Connecte-toi sur https://vercel.com
2. Clique sur **"Add New"** > **"Project"**
3. Sélectionne ton repository GitHub
4. Configure les variables d'environnement
5. Déploie

## ✅ Vérification

Une fois déployé :

1. ✅ L'application est accessible via l'URL Vercel
2. ✅ Tu peux te connecter/créer un compte
3. ✅ Les wishlists s'affichent
4. ✅ La recherche fonctionne

## 🔧 Mises à jour futures

Pour mettre à jour le site après modifications :

```bash
git add .
git commit -m "Description des modifications"
git push
```

Vercel redéploiera automatiquement ! 🚀

## 📝 URLs à configurer

Après déploiement, configure ces URLs dans Supabase :

- Production : `https://mywishlist-xxx.vercel.app`
- Dev : `http://localhost:3000`

## 🎉 C'est tout !

Ton application est maintenant en ligne et accessible à tous !
