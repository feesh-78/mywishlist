# Configuration de la confirmation d'email

Ce guide explique comment configurer la vérification d'email dans Supabase pour MyWishList.

## 🚀 Configuration rapide

### Étape 1: Configuration dans Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet MyWishList
3. Allez dans **Authentication** > **Email Templates** dans le menu de gauche

### Étape 2: Configurer le template "Confirm signup"

1. Cliquez sur **Confirm signup** dans la liste des templates
2. Modifiez le template avec le code suivant:

```html
<h2>Confirmez votre email</h2>

<p>Bonjour,</p>

<p>Merci de vous être inscrit sur MyWishList !</p>

<p>Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse email et activer votre compte :</p>

<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmer mon email</a></p>

<p>Si vous n'avez pas créé de compte sur MyWishList, vous pouvez ignorer cet email.</p>

<p>Cordialement,<br>L'équipe MyWishList</p>
```

3. Cliquez sur **Save**

### Étape 3: Configuration des URLs de redirection

1. Allez dans **Authentication** > **URL Configuration**
2. Dans **Site URL**, mettez:
   - Pour le développement: `http://localhost:3000`
   - Pour la production: `https://votre-domaine.com`

3. Dans **Redirect URLs**, ajoutez:
   ```
   http://localhost:3000/**
   https://votre-domaine.com/**
   ```

4. Cliquez sur **Save**

### Étape 4: Activer la confirmation d'email (IMPORTANT)

1. Allez dans **Authentication** > **Providers** > **Email**
2. Cochez **Enable email confirmations**
3. Cliquez sur **Save**

## ✅ Vérification

Pour tester que tout fonctionne:

1. Créez un nouveau compte sur `/signup`
2. Vous devriez être redirigé vers `/verify-email`
3. Vérifiez votre boîte email
4. Cliquez sur le lien de confirmation
5. Vous devriez être redirigé vers `/email-confirmed`
6. Puis automatiquement vers `/feed` après 5 secondes

## 📧 Configuration SMTP personnalisée (Optionnel mais recommandé)

Par défaut, Supabase utilise son propre serveur SMTP avec des limitations:
- **30 emails/heure** sur le plan gratuit
- **Peut finir dans les spams**

Pour une meilleure délivrabilité, configurez votre propre SMTP:

### Option 1: SendGrid (Gratuit jusqu'à 100 emails/jour)

1. Créez un compte sur [SendGrid](https://sendgrid.com)
2. Générez une API Key
3. Dans Supabase, allez dans **Project Settings** > **Auth** > **SMTP Settings**
4. Activez **Enable Custom SMTP**
5. Configurez:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Votre API Key SendGrid]
   Sender email: noreply@votredomaine.com
   Sender name: MyWishList
   ```

### Option 2: Gmail (Gratuit)

1. Activez l'authentification à 2 facteurs sur votre compte Gmail
2. Générez un mot de passe d'application
3. Dans Supabase, configurez:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: votre-email@gmail.com
   Password: [Mot de passe d'application]
   Sender email: votre-email@gmail.com
   Sender name: MyWishList
   ```

### Option 3: Mailgun, AWS SES, etc.

Suivez la documentation de votre fournisseur SMTP.

## 🎨 Personnalisation du template d'email

Vous pouvez personnaliser le template d'email avec:
- HTML/CSS inline
- Variables disponibles:
  - `{{ .Email }}` - Email de l'utilisateur
  - `{{ .TokenHash }}` - Hash du token de confirmation
  - `{{ .SiteURL }}` - URL de votre site
  - `{{ .ConfirmationURL }}` - URL complète de confirmation (ne pas utiliser, utilisez token_hash à la place)

## 🔒 Bloquer les utilisateurs non vérifiés

Le code actuel autorise déjà uniquement les utilisateurs vérifiés à accéder à l'application.

Si vous voulez bloquer explicitement au login, modifiez `/app/(auth)/login/page.tsx`:

```typescript
// Après le login
const { data: { user } } = await supabase.auth.getUser();

if (user && !user.email_confirmed_at) {
  toast({
    variant: 'destructive',
    title: 'Email non vérifié',
    description: 'Veuillez vérifier votre email avant de vous connecter.',
  });
  await supabase.auth.signOut();
  router.push('/verify-email?email=' + user.email);
  return;
}
```

## 🛠️ Dépannage

### L'email n'arrive pas

1. Vérifiez les spams
2. Vérifiez que l'email est correct
3. Utilisez le bouton "Renvoyer l'email" sur `/verify-email`
4. Vérifiez les logs Supabase dans **Logs** > **Auth logs**

### Le lien de confirmation ne fonctionne pas

1. Vérifiez que le Site URL est correct dans Supabase
2. Vérifiez que la Redirect URL est dans la liste autorisée
3. Le lien expire après 24 heures - demandez un nouveau lien

### L'utilisateur est créé mais pas confirmé

Utilisez cette requête SQL dans Supabase pour confirmer manuellement:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'email@utilisateur.com';
```

## 📝 Notes importantes

- Les utilisateurs non confirmés **NE PEUVENT PAS** se connecter
- Les liens de confirmation expirent après **24 heures**
- Un utilisateur peut demander un nouveau lien via le bouton "Renvoyer l'email"
- Les emails sont limités à **30/heure** avec le SMTP par défaut de Supabase

## 🎯 Prochaines étapes

Une fois la confirmation d'email configurée, vous pouvez:
1. Configurer le reset password (voir `PASSWORD_RESET_SETUP.md`)
2. Activer les notifications par email
3. Configurer le SMTP personnalisé pour une meilleure délivrabilité
