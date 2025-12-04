# ⚡ Configuration Email Supabase - Guide Rapide

## 🚨 PROBLÈME: Pas d'email reçu?

**Cause:** L'envoi d'emails n'est pas activé dans Supabase par défaut.

**Solution:** Suivez ces 3 étapes simples (5 minutes):

---

## ✅ ÉTAPE 1: Activer la confirmation d'email

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet **MyWishList**
3. Dans le menu de gauche, cliquez sur **Authentication**
4. Cliquez sur **Providers**
5. Cliquez sur **Email** (la ligne Email, pas un bouton)
6. **Descendez** jusqu'à voir "Confirm email"
7. **Cochez la case** ✅ "Confirm email"
8. Cliquez sur **Save** en bas

> ⚠️ **IMPORTANT:** Si vous ne cochez pas cette case, aucun email ne sera envoyé!

---

## ✅ ÉTAPE 2: Configurer le template d'email

1. Toujours dans **Authentication**, cliquez sur **Email Templates** (dans le menu de gauche)
2. Cliquez sur **Confirm signup** dans la liste
3. **REMPLACEZ TOUT** le contenu par ceci:

```html
<h2>Confirmez votre email</h2>

<p>Bonjour,</p>

<p>Merci de vous être inscrit sur MyWishList !</p>

<p>Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse email :</p>

<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmer mon email</a></p>

<p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>

<p>Cordialement,<br>L'équipe MyWishList</p>
```

4. Cliquez sur **Save** en haut à droite

---

## ✅ ÉTAPE 3: Configurer les URLs

1. Toujours dans **Authentication**, cliquez sur **URL Configuration** (dans le menu de gauche)
2. Dans **Site URL**, mettez:
   ```
   http://localhost:3000
   ```

3. Dans **Redirect URLs**, ajoutez ces deux lignes (une par ligne):
   ```
   http://localhost:3000/**
   https://*.vercel.app/**
   ```

4. Cliquez sur **Save**

---

## 🧪 TESTER

1. Sur votre app, allez sur `/signup`
2. Créez un nouveau compte avec un vrai email
3. Vous devriez voir la page "Vérifiez votre email"
4. **Vérifiez votre boîte email** (et les spams!)
5. Cliquez sur le lien dans l'email
6. Vous serez redirigé vers "Email confirmé!"

---

## ❌ Toujours pas d'email?

### Vérifications:

1. **✅ "Confirm email" est coché?**
   - Authentication > Providers > Email > Descendez > "Confirm email" doit être ✅

2. **📧 Email valide?**
   - Utilisez un vrai email (Gmail, Outlook, etc.)

3. **📁 Vérifiez les spams**
   - L'email peut arriver dans spam/indésirables

4. **📊 Vérifiez les logs:**
   - Dans Supabase, menu de gauche: **Logs** > **Auth Logs**
   - Cherchez des erreurs

5. **⏱️ Attendez 1-2 minutes**
   - Les emails peuvent prendre du temps

---

## 🔥 SMTP par défaut de Supabase

Le plan gratuit Supabase utilise leur SMTP avec ces limitations:

- ✅ **30 emails/heure** maximum
- ✅ **Gratuit** mais peut arriver en spam
- ✅ **Suffit pour développement**

### Améliorer la délivrabilité (Optionnel)

Si les emails arrivent en spam, configurez SendGrid (gratuit):

1. Créez un compte sur [SendGrid](https://sendgrid.com) (100 emails/jour gratuit)
2. Générez une API Key
3. Dans Supabase: **Project Settings** > **Auth** > **SMTP Settings**
4. Activez **Enable Custom SMTP**
5. Configurez:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: [Votre API Key]
   - Sender email: `noreply@votredomaine.com`
   - Sender name: `MyWishList`

---

## 🎯 Checklist finale

- [ ] "Confirm email" activé dans Authentication > Providers > Email
- [ ] Template d'email configuré (avec `token_hash`)
- [ ] Site URL = `http://localhost:3000`
- [ ] Redirect URLs configurées
- [ ] Testé avec un vrai email
- [ ] Email reçu (vérifié spam)

---

## 💡 Astuce

**Pour tester sans attendre l'email:**

Vous pouvez confirmer un email manuellement dans Supabase:

1. **Authentication** > **Users**
2. Trouvez l'utilisateur
3. Cliquez dessus
4. Cliquez sur **Confirm User**

Mais c'est seulement pour le dev, en prod les vrais utilisateurs devront confirmer leur email!

---

## 🆘 Besoin d'aide?

Si ça ne marche toujours pas:
1. Vérifiez les **Auth Logs** dans Supabase
2. Vérifiez que vous n'avez pas dépassé 30 emails/heure
3. Essayez avec un autre email
4. Redémarrez votre serveur Next.js (`npm run dev`)
