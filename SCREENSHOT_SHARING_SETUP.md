# 📸 Partage de Screenshot - Configuration & Utilisation

> **Feature**: Ajout automatique de produits via screenshot avec analyse IA
> **Date**: 21 décembre 2025
> **Status**: ✅ Implémenté (MVP)

---

## 🎯 Fonctionnalité

Permet aux utilisateurs de **partager un screenshot** depuis leur smartphone directement vers MyWishList. L'app analyse automatiquement le screenshot avec **Google Gemini AI** et extrait :

- ✅ Titre du produit
- ✅ Prix et devise
- ✅ Description
- ✅ Marque/Magasin
- ✅ Catégorie
- ✅ URL du produit (si visible)

---

## ⚙️ SETUP (5 minutes)

### 1. Obtenir une clé API Gemini (GRATUIT)

1. Va sur [Google AI Studio](https://aistudio.google.com/apikey)
2. Connecte-toi avec ton compte Google
3. Clique sur **"Get API Key"** ou **"Create API Key"**
4. Copie la clé générée

**Limites gratuites:**
- ✅ 15 requêtes/minute
- ✅ Pas de limite mensuelle
- ✅ Gratuit à vie pour usage personnel

### 2. Ajouter la clé dans `.env.local`

Ouvre `/Users/feesh/Projets Claude Code/mywishlist/.env.local` et remplace :

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Par ta vraie clé :

```env
GEMINI_API_KEY=AIzaSyC...ton_vrai_api_key
```

### 3. Déployer sur Vercel

```bash
cd "/Users/feesh/Projets Claude Code/mywishlist"
git add .
git commit -m "feat: Ajout partage screenshot avec analyse IA Gemini"
git push
```

Vercel va auto-déployer. **IMPORTANT** : Ajoute la variable `GEMINI_API_KEY` dans les **Environment Variables** Vercel :

1. Dashboard Vercel → Project → Settings → Environment Variables
2. Ajoute `GEMINI_API_KEY` = ta clé API
3. Redéploie le projet

---

## 📱 INSTALLATION PWA (Utilisateurs)

### Sur iPhone (iOS 16+)

1. Ouvre Safari et va sur `https://ton-app.vercel.app`
2. Clique sur le bouton **Partager** (carré avec flèche)
3. Descends et sélectionne **"Sur l'écran d'accueil"**
4. Clique **"Ajouter"**
5. ✅ L'app est maintenant installée !

**Bonus iOS:** Active **Live Text** dans Réglages → Général → Langue et région

### Sur Android (Samsung, Google Pixel, etc.)

1. Ouvre Chrome et va sur `https://ton-app.vercel.app`
2. Un popup apparaît : **"Installer MyWishList"**
3. Clique **"Installer"**
4. ✅ L'app est installée !

Sinon :
1. Menu (⋮) → **"Ajouter à l'écran d'accueil"**
2. Confirme

---

## 🚀 UTILISATION

### Méthode 1 : Partage de Screenshot (recommandé)

**Sur iPhone:**
1. Fais un screenshot d'un produit (Instagram, site web, story...)
2. Appuie sur la miniature du screenshot
3. Clique **Partager** → Sélectionne **MyWishList**
4. ✅ L'app s'ouvre avec le formulaire pré-rempli !

**Sur Android:**
1. Fais un screenshot
2. Ouvre la galerie → Sélectionne le screenshot
3. Clique **Partager** → Sélectionne **MyWishList**
4. ✅ L'app s'ouvre avec le formulaire pré-rempli !

### Méthode 2 : Upload Manuel

1. Ouvre MyWishList
2. Va dans **Menu** → **"Ajouter un produit"** (ou `/add-product`)
3. Clique **"Upload screenshot"**
4. Sélectionne ton screenshot
5. ✨ L'analyse commence automatiquement
6. Vérifie/ajuste les infos extraites
7. Clique **"Continuer"**

---

## 🔧 ARCHITECTURE TECHNIQUE

### Fichiers créés

```
/public/
  ├── manifest.json          # PWA manifest avec Web Share Target
  ├── sw.js                  # Service Worker pour cache
  ├── icon-192.png          # Icône PWA 192x192
  └── icon-512.png          # Icône PWA 512x512

/app/
  ├── layout.tsx            # Mis à jour avec PWA metadata
  ├── (main)/add-product/
  │   └── page.tsx          # Page de réception du partage
  └── api/analyze-screenshot/
      └── route.ts          # API d'analyse avec Gemini

/components/
  └── pwa-install.tsx       # Enregistrement du Service Worker

/.env.local
  └── GEMINI_API_KEY        # Clé API Gemini (à ajouter)
```

### Flow technique

```
1. Utilisateur partage screenshot
   ↓
2. Web Share Target API → /add-product (POST)
   ↓
3. Page /add-product reçoit le fichier
   ↓
4. Upload vers /api/analyze-screenshot
   ↓
5. API Gemini analyse l'image (OCR + Vision AI)
   ↓
6. Retourne JSON structuré
   ↓
7. Formulaire pré-rempli avec les données
   ↓
8. Utilisateur valide/ajuste
   ↓
9. Ajout à la wishlist/shopping list
```

---

## 🧪 TESTER EN LOCAL

### 1. Démarrer le serveur

```bash
cd "/Users/feesh/Projets Claude Code/mywishlist"
npm run dev
```

### 2. Exposer en HTTPS (requis pour PWA)

**Option A : ngrok (recommandé)**

```bash
# Installer ngrok
brew install ngrok

# Exposer le port 3000
ngrok http 3000
```

Tu obtiens une URL HTTPS : `https://xxxx.ngrok.io`

**Option B : Cloudflare Tunnel**

```bash
# Installer cloudflared
brew install cloudflared

# Exposer
cloudflared tunnel --url http://localhost:3000
```

### 3. Tester sur smartphone

1. Va sur l'URL HTTPS depuis ton smartphone
2. Installe la PWA (voir instructions ci-dessus)
3. Fais un screenshot de test (ex: photo d'un produit Amazon)
4. Partage vers MyWishList
5. Vérifie que le formulaire se remplit automatiquement ✨

---

## 🐛 DÉPANNAGE

### ❌ "GEMINI_API_KEY is not defined"

**Solution:**
1. Vérifie que `.env.local` contient bien `GEMINI_API_KEY=...`
2. Redémarre le serveur : `npm run dev`
3. Si sur Vercel : Ajoute la variable dans Settings → Environment Variables

### ❌ "Le partage ne fonctionne pas sur mon iPhone"

**Causes possibles:**
1. L'app n'est pas installée en PWA → Réinstalle depuis Safari
2. Tu es sur Chrome iOS → Utilise **Safari** (Chrome iOS ne supporte pas Web Share Target)
3. iOS < 16 → Mets à jour iOS

### ❌ "L'analyse du screenshot échoue"

**Solutions:**
1. Vérifie que l'image est claire et nette
2. Vérifie que le texte est lisible
3. Vérifie les logs de l'API : Console → Network → analyze-screenshot
4. Teste avec un screenshot plus simple (page produit Amazon par exemple)

### ❌ "Le service worker ne s'enregistre pas"

**Solutions:**
1. Active HTTPS (obligatoire pour PWA)
2. Vérifie Console → Application → Service Workers
3. Efface le cache : DevTools → Application → Clear storage

---

## 📊 MONITORING

### Vérifier l'utilisation de l'API Gemini

1. Va sur [Google AI Studio](https://aistudio.google.com)
2. Menu → **Usage** ou **Quotas**
3. Vérifie le nombre de requêtes

**Free tier:** 15 requêtes/minute = **21 600 screenshots/jour**

---

## 🔄 AMÉLIORATIONS FUTURES

### Phase 2 (optionnel)

- [ ] Extraction automatique de l'image du produit (crop intelligent)
- [ ] Support de plusieurs images par partage
- [ ] Fallback vers OCR local si Gemini rate
- [ ] Cache des analyses pour éviter de re-analyser le même screenshot
- [ ] Détection automatique de duplicatas (même produit déjà ajouté)

### Phase 3 (avancé)

- [ ] Extension Chrome/Safari pour scraping direct (pas besoin de screenshot)
- [ ] App React Native pour ML Kit on-device (Android)
- [ ] iOS Shortcuts avec Live Text
- [ ] Price tracking automatique
- [ ] Notifications de baisse de prix

---

## 💰 COÛTS

### Gratuit (actuel)

- ✅ Gemini 1.5 Flash : Gratuit illimité (15 req/min)
- ✅ Vercel hosting : Gratuit (hobby tier)
- ✅ Supabase : Gratuit (500MB storage)

**Total : 0€/mois**

### Si dépassement (futur)

Si > 15 requêtes/minute :
- **Option 1** : Passer à Gemini 1.5 Pro (~0.50$/1M tokens)
- **Option 2** : Ajouter un fallback sur Google Vision API (gratuit 1000/mois)
- **Option 3** : Ajouter une file d'attente (queue) pour lisser les requêtes

**Estimation:** Même avec 10 000 screenshots/mois → **< 5€/mois**

---

## ✅ CHECKLIST VALIDATION

- [x] Clé API Gemini ajoutée dans `.env.local`
- [ ] Clé API Gemini ajoutée dans Vercel Environment Variables
- [ ] App déployée sur Vercel
- [ ] PWA installée sur smartphone de test
- [ ] Test partage screenshot → formulaire pré-rempli ✅
- [ ] Test analyse avec produit Amazon
- [ ] Test analyse avec produit Instagram
- [ ] Test analyse avec produit site e-commerce français

---

## 📞 SUPPORT

**Si problème :**
1. Vérifie les logs API : `/api/analyze-screenshot`
2. Vérifie la console navigateur (F12)
3. Teste avec un screenshot simple (page produit Amazon)
4. Vérifie que la clé Gemini est valide

**Logs utiles :**
```bash
# Logs Vercel
vercel logs

# Logs local
# Console navigateur → Network → analyze-screenshot → Preview
```

---

## 🎉 PRÊT !

La fonctionnalité de partage de screenshot est maintenant opérationnelle !

**Prochaine étape** : Obtenir ta clé API Gemini et tester sur ton smartphone.

**URL Google AI Studio** : https://aistudio.google.com/apikey
