# ⚡ Configuration rapide - MyWishList

## Checklist complète (10 minutes)

### ✅ Étape 1: Migrations SQL (2 min)

1. Ouvrir Supabase: https://app.supabase.com
2. Sélectionner projet **MyWishList**
3. **SQL Editor** → **New query**

**Migration 1 - Bookmarks:**
- Copier le contenu de `supabase/migrations/002_add_bookmarks.sql`
- Coller dans SQL Editor
- Cliquer **Run**
- Vérifier: "Success. No rows returned"

**Migration 2 - Notifications:**
- New query
- Copier le contenu de `supabase/migrations/003_add_notifications.sql`
- Coller dans SQL Editor
- Cliquer **Run**
- Vérifier: "Success. No rows returned"

---

### ✅ Étape 2: Email Templates (3 min)

**Authentication → Email Templates**

#### Template 1: Confirm signup
```html
<h2>Confirmez votre email</h2>
<p>Bonjour,</p>
<p>Merci de vous être inscrit sur MyWishList !</p>
<p>Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse email :</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmer mon email</a></p>
<p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
<p>Cordialement,<br>L'équipe MyWishList</p>
```

#### Template 2: Reset Password
```html
<h2>Réinitialisation de mot de passe</h2>
<p>Bonjour,</p>
<p>Vous avez demandé à réinitialiser votre mot de passe sur MyWishList.</p>
<p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
<p><a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery">Réinitialiser mon mot de passe</a></p>
<p><strong>Ce lien expire dans 1 heure.</strong></p>
<p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
<p>Cordialement,<br>L'équipe MyWishList</p>
```

---

### ✅ Étape 3: Activer les emails (1 min)

**Authentication → Providers → Email:**
1. Cliquer sur **Email**
2. Descendre jusqu'à **"Confirm email"**
3. ✅ Cocher la case
4. **Save**

---

### ✅ Étape 4: Activer Realtime (1 min)

**Database → Replication:**
1. Trouver table **notifications**
2. Activer toggle **Realtime**
3. **Save**

---

### ✅ Étape 5: URLs (déjà fait normalement)

**Authentication → URL Configuration:**

Vérifier que ces URLs sont présentes:
- Site URL: `http://localhost:3000`
- Redirect URLs:
  ```
  http://localhost:3000/**
  https://mywishlist-ruddy.vercel.app/**
  ```

Si absentes, les ajouter et **Save**.

---

## 🧪 Tester que tout fonctionne

### Test 1: Inscription + Email
1. Aller sur `/signup`
2. Créer un compte avec un vrai email
3. Vérifier que l'email de confirmation arrive
4. Cliquer sur le lien
5. Voir "Email confirmé!" ✅

### Test 2: Reset Password
1. Aller sur `/login`
2. Cliquer "Mot de passe oublié ?"
3. Entrer votre email
4. Vérifier que l'email arrive
5. Cliquer sur le lien
6. Créer nouveau mot de passe ✅

### Test 3: Notifications
1. Créer 2 comptes (ou utiliser 2 navigateurs)
2. Compte A suit Compte B
3. Compte B devrait voir:
   - Badge "1" sur icône cloche
   - Notification "X a commencé à vous suivre"
   - Toast notification ✅

### Test 4: Dark Mode
1. Cliquer sur icône soleil/lune dans header
2. Choisir "Sombre"
3. Vérifier que toute l'app passe en dark ✅

### Test 5: Mobile
1. Ouvrir sur mobile ou DevTools (F12 → Device mode)
2. Vérifier:
   - Bottom nav bar visible ✅
   - FAB (bouton +) en bas à droite ✅
   - Tout responsive ✅

---

## 📊 Tables créées

Après les migrations, vous devriez avoir:
- ✅ `bookmarks` (favoris)
- ✅ `notifications` (notifications)

Vérifier dans **Database → Tables**

---

## 🔧 Commandes utiles

```bash
# Démarrer le dev server
npm run dev

# Build production
npm run build

# Vérifier les erreurs TypeScript
npm run type-check

# Ouvrir Supabase
open https://app.supabase.com
```

---

## 🆘 Problèmes courants

### "No rows returned" → ✅ Normal!
C'est bon signe, ça veut dire que la migration a réussi.

### Emails n'arrivent pas
1. Vérifier que "Confirm email" est ✅ coché
2. Vérifier les spams
3. Attendre 1-2 minutes
4. Limite: 30 emails/heure (plan gratuit)

### Notifications ne s'affichent pas
1. Vérifier que Realtime est activé pour `notifications`
2. Vérifier que les 2 migrations SQL ont réussi
3. Rafraîchir la page

### Dark mode ne fonctionne pas
1. Vider le cache du navigateur
2. Vérifier que le bouton apparaît dans le header
3. Essayer en navigation privée

---

## 🎉 C'est prêt!

Toutes les fonctionnalités sont maintenant opérationnelles:
- ✅ Authentification complète
- ✅ Emails de confirmation et reset
- ✅ Notifications temps réel
- ✅ Interface mobile optimisée
- ✅ Dark mode

**Temps total: ~10 minutes**

Si tout fonctionne, vous pouvez déployer sur Vercel! 🚀
