# 🔐 Configuration du Reset Password

Ce guide explique comment configurer la réinitialisation de mot de passe dans Supabase.

## ✅ Fonctionnalités implémentées

- ✅ Page "Mot de passe oublié" (`/forgot-password`)
- ✅ Email avec lien de reset
- ✅ Page de création nouveau mot de passe (`/reset-password`)
- ✅ Validation forte du mot de passe
- ✅ Bouton afficher/masquer le mot de passe
- ✅ Confirmation du mot de passe
- ✅ Auto-redirect après succès

---

## 🚀 Configuration Supabase (2 minutes)

### Étape 1: Configurer le template d'email

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet **MyWishList**
3. Dans le menu: **Authentication** > **Email Templates**
4. Cliquez sur **Reset Password** dans la liste
5. **Remplacez tout** le contenu par:

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

6. Cliquez sur **Save**

---

## 🧪 Tester le flow

### 1. Demander un reset

1. Allez sur `/login`
2. Cliquez sur **"Mot de passe oublié ?"**
3. Entrez votre email
4. Cliquez sur **"Envoyer le lien"**
5. Vérifiez votre boîte email (et spam!)

### 2. Réinitialiser le mot de passe

1. Cliquez sur le lien dans l'email
2. Vous serez redirigé vers `/reset-password`
3. Entrez un nouveau mot de passe (minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre)
4. Confirmez le mot de passe
5. Cliquez sur **"Modifier le mot de passe"**
6. Vous serez auto-redirigé vers `/login` après 3 secondes

### 3. Se connecter

1. Connectez-vous avec votre nouveau mot de passe
2. Succès! 🎉

---

## 🔒 Règles de mot de passe

Le nouveau mot de passe doit respecter:
- ✅ Minimum **8 caractères**
- ✅ Au moins **1 majuscule**
- ✅ Au moins **1 minuscule**
- ✅ Au moins **1 chiffre**

Exemples valides:
- `Password123`
- `MyWishList2024`
- `SuperSecret1`

---

## ⚙️ URLs configurées

Assurez-vous que ces URLs sont dans **Authentication** > **URL Configuration** > **Redirect URLs**:

```
http://localhost:3000/**
https://mywishlist-ruddy.vercel.app/**
```

(Vous devriez déjà les avoir configurées pour l'email de confirmation)

---

## 🛠️ Dépannage

### Le lien ne fonctionne pas

1. **Vérifiez que le template contient `token_hash`** et pas `ConfirmationURL`
2. **Vérifiez les Redirect URLs** dans Supabase
3. **Le lien expire après 1 heure** - demandez un nouveau lien
4. **Vérifiez les Auth Logs** dans Supabase pour voir les erreurs

### L'email n'arrive pas

1. **Vérifiez les spams**
2. **Vérifiez que l'email existe** dans votre base de données
3. **Limite de 30 emails/heure** avec le SMTP Supabase par défaut
4. **Vérifiez les Auth Logs** dans Supabase

### Erreur "Invalid token"

- Le lien a expiré (1 heure max)
- Le lien a déjà été utilisé
- Demandez un nouveau lien sur `/forgot-password`

---

## 🎯 Checklist de vérification

- [ ] Template "Reset Password" configuré dans Supabase
- [ ] Template contient `{{ .TokenHash }}` et `type=recovery`
- [ ] Redirect URLs configurées
- [ ] Testé: demande de reset → email reçu
- [ ] Testé: clic sur lien → page reset password
- [ ] Testé: nouveau mot de passe → connexion réussie

---

## 📱 Pages créées

| Page | URL | Description |
|------|-----|-------------|
| Mot de passe oublié | `/forgot-password` | Demander un lien de reset |
| Reset password | `/reset-password` | Créer nouveau mot de passe |

---

## 🔗 Flow complet

```
/login
  → Clic "Mot de passe oublié?"
  → /forgot-password
  → Entrer email + Envoyer
  → Email reçu
  → Clic sur lien
  → /reset-password
  → Nouveau mot de passe
  → Auto-redirect /login (3s)
  → Connexion avec nouveau mot de passe
  → /feed ✅
```

---

## 💡 Fonctionnalités supplémentaires

### Bouton afficher/masquer mot de passe

- Icône œil pour afficher le mot de passe
- Fonctionne sur les 2 champs (mot de passe + confirmation)

### Validation en temps réel

- Messages d'erreur clairs
- Vérification que les 2 mots de passe correspondent
- Règles de complexité affichées

### Auto-redirect

- Après succès: redirect automatique vers `/login` après 3 secondes
- Page de succès avec message de confirmation

---

## 🔒 Sécurité

- ✅ Token unique généré pour chaque demande
- ✅ Expire après 1 heure
- ✅ Token invalidé après utilisation
- ✅ Pas d'information sensible dans l'URL
- ✅ Validation forte du mot de passe
- ✅ Email envoyé uniquement si l'email existe (pas de fuite d'info)

---

## 📧 Personnalisation de l'email

Vous pouvez personnaliser le template avec:

```html
<!-- Variables disponibles -->
{{ .Email }}         <!-- Email de l'utilisateur -->
{{ .TokenHash }}     <!-- Token de reset (REQUIS) -->
{{ .SiteURL }}       <!-- URL de votre site -->

<!-- Exemple de personnalisation -->
<p>Bonjour {{ .Email }},</p>
```

---

## ✅ Prêt!

La fonctionnalité de reset password est maintenant complète et fonctionnelle! 🎉
