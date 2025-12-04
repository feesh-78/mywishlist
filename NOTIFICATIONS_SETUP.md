# 🔔 Configuration du Centre de Notifications

Ce guide explique comment configurer et utiliser le système de notifications en temps réel.

## ✅ Fonctionnalités implémentées

- ✅ Notifications en temps réel (Supabase Realtime)
- ✅ Badge de compteur sur l'icône cloche
- ✅ Panel déroulant avec liste des notifications
- ✅ Page complète des notifications (`/notifications`)
- ✅ Types de notifications: follow, like, comment, wishlist_invite, wishlist_shared
- ✅ Marquer comme lu / tout marquer comme lu
- ✅ État lu/non lu avec indicateur visuel
- ✅ Suppression de notifications
- ✅ Toast pour les nouvelles notifications
- ✅ Liens directs vers le contenu concerné

---

## 🚀 Configuration Supabase (3 minutes)

### Étape 1: Exécuter la migration SQL

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet **MyWishList**
3. Dans le menu de gauche: **SQL Editor**
4. Cliquez sur **New query**
5. Copiez-collez le contenu du fichier `supabase/migrations/003_add_notifications.sql`
6. Cliquez sur **Run** (ou Ctrl+Enter)
7. Vérifiez que "Success. No rows returned" apparaît

**Ce que cette migration fait:**
- Crée la table `notifications`
- Configure les RLS policies (sécurité)
- Crée les indexes pour la performance
- Crée les triggers automatiques pour les follows
- Crée une fonction helper `create_notification()`

---

### Étape 2: Activer Realtime (Optionnel mais recommandé)

Pour recevoir les notifications instantanément sans recharger la page:

1. Dans Supabase: **Database** > **Replication**
2. Trouvez la table `notifications`
3. Activez **Realtime** pour cette table
4. Cliquez sur **Save**

> ⚠️ **Note:** Sans Realtime, les notifications s'afficheront seulement au refresh de la page.

---

## 🎯 Types de notifications

| Type | Description | Trigger |
|------|-------------|---------|
| `follow` | Quelqu'un vous suit | Automatique via trigger |
| `like` | Quelqu'un aime votre wishlist | À implémenter dans le code des likes |
| `comment` | Quelqu'un commente votre wishlist | À implémenter dans le code des commentaires |
| `wishlist_invite` | Invitation à collaborer | À implémenter |
| `wishlist_shared` | Wishlist partagée avec vous | À implémenter |

---

## 💻 Utilisation dans le code

### Créer une notification manuellement

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Exemple: notification de like
const { data, error } = await supabase.rpc('create_notification', {
  p_user_id: wishlistOwnerId,  // ID du propriétaire de la wishlist
  p_type: 'like',
  p_actor_id: currentUserId,    // ID de l'utilisateur qui like
  p_wishlist_id: wishlistId,
  p_content: null,              // Optionnel
});
```

### Créer une notification de commentaire

```typescript
// Exemple: notification de commentaire
const { data, error } = await supabase.rpc('create_notification', {
  p_user_id: wishlistOwnerId,
  p_type: 'comment',
  p_actor_id: currentUserId,
  p_wishlist_id: wishlistId,
  p_comment_id: commentId,      // Optionnel
  p_content: 'Commentaire: ...' // Optionnel
});
```

---

## 🧪 Tester le système

### 1. Tester les notifications de follow

1. Créez 2 comptes différents (ou utilisez 2 navigateurs)
2. Compte A suit Compte B
3. Compte B devrait voir:
   - Badge "1" sur l'icône cloche
   - Toast "Nouvelle notification"
   - Notification dans le panel
   - Point bleu pour "non lu"

### 2. Tester le panel de notifications

1. Cliquez sur l'icône cloche 🔔
2. Vous devriez voir:
   - Liste des notifications
   - Badge avec le nombre de non lues
   - Bouton "Tout marquer comme lu"
   - Boutons de suppression au survol

### 3. Tester la page complète

1. Allez sur `/notifications`
2. Vous devriez voir:
   - Onglets: Toutes / Non lues / Lues
   - Filtrage automatique
   - Actions sur chaque notification

---

## 🎨 Personnalisation

### Modifier les icônes

Dans `components/notification-center.tsx` ligne 22-34:

```typescript
const getNotificationIcon = (type: NotificationWithDetails['type']) => {
  switch (type) {
    case 'follow':
      return <User className="h-4 w-4" />;
    // ... changez les icônes ici
  }
};
```

### Modifier les messages

Dans la même fonction `getNotificationText`:

```typescript
case 'follow':
  return `${actorName} a commencé à vous suivre`;
```

### Modifier les couleurs du badge

Dans `components/notification-center.tsx` ligne 97:

```typescript
<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 ...">
  {/* Changez bg-red-500 en bg-blue-500, bg-green-500, etc. */}
</span>
```

---

## 📊 Structure de la base de données

### Table `notifications`

```sql
- id              UUID (Primary Key)
- user_id         UUID (qui reçoit la notification)
- type            VARCHAR(50) (follow, like, comment, etc.)
- actor_id        UUID (qui a déclenché la notification)
- wishlist_id     UUID (optionnel)
- item_id         UUID (optionnel)
- comment_id      UUID (optionnel)
- content         TEXT (optionnel)
- is_read         BOOLEAN (default: false)
- created_at      TIMESTAMPTZ
```

### Indexes créés

- `user_id` - Pour charger rapidement les notifications d'un user
- `created_at DESC` - Pour trier par date
- `is_read` - Pour filtrer par statut
- `(user_id, is_read)` - Pour compter les non lues rapidement

---

## 🔐 Sécurité (RLS Policies)

Les policies suivantes sont automatiquement configurées:

1. **Users can view own notifications** - Un user voit seulement ses notifications
2. **Users can update own notifications** - Un user peut marquer ses notifications comme lues
3. **System can insert notifications** - Le système peut créer des notifications
4. **Users can delete own notifications** - Un user peut supprimer ses notifications

---

## 🛠️ Dépannage

### Les notifications n'apparaissent pas

1. **Vérifiez que la migration a été exécutée:**
   - SQL Editor > History
   - Vérifiez qu'il n'y a pas d'erreurs

2. **Vérifiez les RLS policies:**
   - Database > Tables > notifications > RLS
   - Les 4 policies doivent être actives (✅)

3. **Vérifiez Realtime:**
   - Database > Replication
   - Table `notifications` doit avoir Realtime activé

4. **Vérifiez les logs:**
   - Ouvrez la console du navigateur (F12)
   - Vérifiez s'il y a des erreurs

### Le compteur n'est pas à jour

- Le hook `useNotifications` se met à jour automatiquement via Realtime
- Si Realtime n'est pas activé, rafraîchissez la page
- Vérifiez que `userId` est bien passé au composant `NotificationCenter`

### Les toasts ne s'affichent pas

- Le hook `useToast` doit être configuré dans `lib/hooks/use-toast.ts`
- Vérifiez que le composant `Toaster` est présent dans le layout

---

## 🎯 Prochaines étapes

### À implémenter:

1. **Notifications de like:**
   - Dans le code des likes, ajouter:
   ```typescript
   await supabase.rpc('create_notification', {
     p_user_id: wishlist.user_id,
     p_type: 'like',
     p_actor_id: currentUserId,
     p_wishlist_id: wishlistId,
   });
   ```

2. **Notifications de commentaire:**
   - Dans le code des commentaires, ajouter le même pattern

3. **Email notifications (optionnel):**
   - Configurer un webhook Supabase
   - Envoyer un email récapitulatif des notifications

4. **Push notifications (optionnel):**
   - Intégrer Firebase Cloud Messaging
   - Demander la permission pour les notifications push

---

## 📱 Pages créées

| Page | URL | Description |
|------|-----|-------------|
| Notifications | `/notifications` | Page complète avec filtres et tabs |

## 🧩 Composants créés

| Composant | Fichier | Description |
|-----------|---------|-------------|
| NotificationCenter | `components/notification-center.tsx` | Panel déroulant dans le header |
| NotificationsPageClient | `app/(main)/notifications/page-client.tsx` | Page complète des notifications |

## 🪝 Hooks créés

| Hook | Fichier | Description |
|------|---------|-------------|
| useNotifications | `lib/hooks/use-notifications.ts` | Gestion des notifications et realtime |

---

## ✅ Checklist de vérification

- [ ] Migration SQL exécutée dans Supabase
- [ ] Table `notifications` créée
- [ ] RLS policies activées (4 policies)
- [ ] Realtime activé pour la table `notifications`
- [ ] Testé: follow → notification reçue
- [ ] Testé: clic sur notification → redirect vers le contenu
- [ ] Testé: marquer comme lu
- [ ] Testé: supprimer notification
- [ ] Badge de compteur s'affiche correctement

---

## 🎉 Prêt!

Le système de notifications est maintenant opérationnel! Les utilisateurs recevront des notifications en temps réel pour tous les événements importants.

### Flow complet:

```
Action (follow, like, etc.)
  ↓
Trigger / Function create_notification()
  ↓
INSERT dans table notifications
  ↓
Realtime broadcast
  ↓
useNotifications hook détecte
  ↓
Badge + Toast + Liste mise à jour
  ↓
Utilisateur clique
  ↓
Redirect vers contenu + marquer comme lu
```

---

## 💡 Astuces

1. **Performance:** Les indexes créés permettent de charger rapidement même avec des milliers de notifications
2. **Nettoyage:** Pensez à ajouter un cron job pour supprimer les vieilles notifications (> 30 jours)
3. **Groupement:** Pour éviter le spam, vous pouvez grouper les notifications similaires
4. **Préférences:** Ajoutez une page paramètres pour désactiver certains types de notifications

---

## 🆘 Support

Si vous rencontrez des problèmes:

1. Vérifiez les Auth Logs dans Supabase
2. Vérifiez la console du navigateur
3. Testez la fonction `create_notification` manuellement dans SQL Editor:

```sql
SELECT create_notification(
  p_user_id := 'YOUR_USER_ID',
  p_type := 'follow',
  p_actor_id := 'ACTOR_USER_ID'
);
```
