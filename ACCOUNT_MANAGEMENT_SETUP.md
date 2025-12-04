# 🔐 Gestion du Compte - Désactivation et Suppression

Ce guide explique comment utiliser les fonctionnalités de désactivation et suppression de compte.

## ✅ Fonctionnalités implémentées

- ✅ **Mise en veille du compte** (désactivation temporaire)
- ✅ **Suppression définitive du compte**
- ✅ **Réactivation automatique** lors de la reconnexion
- ✅ **Protection des données** avec confirmation obligatoire
- ✅ **Statuts de compte** dans la base de données

---

## 🚀 Configuration Supabase (1 minute)

### Exécuter la migration SQL

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet **MyWishList**
3. Menu gauche → **SQL Editor** → **New query**
4. Copiez-collez le contenu de `supabase/migrations/004_add_account_status.sql`
5. Cliquez **Run**
6. Vérifiez: "Success. No rows returned"

**Ce que cette migration fait:**
- Ajoute les colonnes `account_status` et `deactivated_at` à la table `profiles`
- Crée les fonctions `deactivate_account()`, `reactivate_account()`, `delete_account()`
- Met à jour les RLS policies pour masquer les comptes désactivés
- Ajoute un index pour optimiser les requêtes

---

## 📱 Utilisation

### 1. Mettre le compte en veille

**Accès:** `/settings` → Section "Gestion du compte" → "Mettre en veille"

**Processus:**
1. Cliquer sur "Mettre en veille"
2. Confirmer dans la boîte de dialogue
3. Déconnexion automatique

**Conséquences:**
- ❌ Profil non visible publiquement
- ❌ Wishlists masquées
- ❌ Plus possible de suivre/être suivi
- ❌ Notifications désactivées
- ✅ Toutes les données sont conservées
- ✅ Réactivation possible à tout moment

**Réactiver:**
1. Se reconnecter avec email/mot de passe
2. Page de réactivation automatique (`/reactivate`)
3. Cliquer "Réactiver mon compte"
4. Accès immédiat à tout le contenu

---

### 2. Supprimer définitivement le compte

**Accès:** `/settings` → Section "Gestion du compte" → "Supprimer définitivement"

**Processus:**
1. Cliquer sur "Supprimer définitivement mon compte"
2. Lire les avertissements
3. Taper **"SUPPRIMER"** (en majuscules) dans le champ
4. Confirmer

**⚠️ ATTENTION: Cette action est IRRÉVERSIBLE!**

**Ce qui est supprimé:**
- ❌ Toutes les wishlists
- ❌ Tous les items
- ❌ Tous les commentaires
- ❌ Tous les likes
- ❌ Tous les favoris (bookmarks)
- ❌ Tous les abonnés/abonnements
- ❌ Toutes les notifications
- ❌ Le profil utilisateur
- ❌ Le compte d'authentification

**Impossible de:**
- ❌ Récupérer les données
- ❌ Annuler l'opération
- ❌ Se reconnecter avec le même email

---

## 🔄 Flow complet

### Désactivation → Réactivation

```
/settings
  → Clic "Mettre en veille"
  → Confirmation
  → Déconnexion automatique

/login (reconnexion)
  → Email + mot de passe
  → Détection compte désactivé
  → Redirect /reactivate
  → Clic "Réactiver mon compte"
  → Redirect /feed ✅
```

### Suppression définitive

```
/settings
  → Clic "Supprimer définitivement"
  → Lecture avertissements
  → Taper "SUPPRIMER"
  → Confirmation
  → Suppression complète
  → Redirect /signup
```

---

## 📊 Statuts de compte

| Statut | Description | Visible publiquement | Peut se connecter | Réversible |
|--------|-------------|---------------------|-------------------|------------|
| `active` | Compte actif normal | ✅ Oui | ✅ Oui | - |
| `deactivated` | Compte en veille | ❌ Non | ✅ Oui (→ réactivation) | ✅ Oui |
| `deleted` | Compte supprimé | ❌ Non | ❌ Non | ❌ Non |

---

## 🔒 Sécurité et Politique de données

### Désactivation (soft delete)
- Les données sont **conservées** dans la base
- Le compte est **masqué** de la vue publique
- RLS policies empêchent l'accès aux autres utilisateurs
- Statut `deactivated` + timestamp `deactivated_at`
- Réversible à tout moment

### Suppression (hard delete)
- Les données sont **supprimées définitivement**
- Cascade delete sur toutes les tables liées
- Suppression du compte auth Supabase
- **Irréversible** - aucune récupération possible
- Statut temporaire `deleted` avant suppression complète

### RLS Policies

```sql
-- Masquer les comptes désactivés de la vue publique
"Public profiles are viewable by everyone"
  USING (account_status = 'active')

-- Permettre aux users de voir leur propre profil même désactivé
"Users can view own profile regardless of status"
  USING (auth.uid() = id)
```

---

## 🧪 Tester les fonctionnalités

### Test 1: Désactivation
1. Se connecter sur le compte
2. Aller dans `/settings`
3. Descendre à "Gestion du compte"
4. Cliquer "Mettre en veille" → Confirmer
5. Vérifier: déconnexion automatique ✅
6. Essayer d'accéder au profil → 404 ou non visible ✅

### Test 2: Réactivation
1. Aller sur `/login`
2. Se connecter avec les mêmes identifiants
3. Vérifier: redirect vers `/reactivate` ✅
4. Cliquer "Réactiver mon compte"
5. Vérifier: redirect vers `/feed` ✅
6. Vérifier: profil à nouveau visible ✅

### Test 3: Suppression
1. Se connecter
2. `/settings` → "Supprimer définitivement"
3. Taper "SUPPRIMER" → Confirmer
4. Vérifier: redirect vers `/signup` ✅
5. Essayer de se reconnecter → Erreur "Invalid credentials" ✅
6. Vérifier dans Supabase: profil supprimé ✅

---

## 🛠️ Dépannage

### La désactivation ne fonctionne pas
1. Vérifier que la migration SQL a été exécutée
2. Vérifier les colonnes `account_status` et `deactivated_at` dans la table `profiles`
3. Vérifier les logs d'erreur dans la console du navigateur

### La réactivation ne s'affiche pas
1. Vérifier que le redirect se fait bien dans `login/page.tsx`
2. Vérifier que l'utilisateur est bien connecté
3. Vérifier le statut dans la base: `account_status = 'deactivated'`

### La suppression échoue
1. Vérifier les RLS policies - la fonction `delete_account` a `SECURITY DEFINER`
2. Vérifier les cascades - toutes les FK doivent avoir `ON DELETE CASCADE`
3. Vérifier les logs Supabase pour voir les erreurs détaillées

### L'utilisateur voit toujours le profil désactivé
1. Vérifier que la RLS policy "Public profiles are viewable by everyone" filtre bien sur `account_status = 'active'`
2. Vider le cache du navigateur
3. Vérifier en navigation privée

---

## 📝 Notes importantes

### Pour les administrateurs
- Les comptes désactivés sont toujours présents dans la base
- Envisager un nettoyage automatique après X mois d'inactivité
- Les comptes supprimés libèrent les emails et usernames

### Pour les développeurs
- Ne jamais bypass les RLS policies pour les comptes désactivés
- Toujours vérifier `account_status` avant d'afficher un profil
- Utiliser les fonctions SQL pour modifier les statuts (pas de UPDATE direct)

### Conformité RGPD
- ✅ Droit à l'effacement (suppression définitive)
- ✅ Droit à la limitation du traitement (désactivation)
- ✅ Portabilité des données (export avant suppression à implémenter)
- ⚠️ Considérer l'ajout d'un export de données avant suppression

---

## 🔧 Commandes utiles

```bash
# Vérifier les statuts de compte
SELECT id, username, account_status, deactivated_at
FROM profiles
WHERE account_status != 'active';

# Compter les comptes par statut
SELECT account_status, COUNT(*)
FROM profiles
GROUP BY account_status;

# Réactiver manuellement un compte (admin)
SELECT reactivate_account('USER_UUID_HERE');

# Nettoyer les comptes désactivés depuis + de 6 mois
DELETE FROM profiles
WHERE account_status = 'deactivated'
AND deactivated_at < NOW() - INTERVAL '6 months';
```

---

## ✅ Checklist de vérification

- [ ] Migration 004_add_account_status.sql exécutée
- [ ] Colonnes `account_status` et `deactivated_at` présentes dans `profiles`
- [ ] Fonctions SQL créées (deactivate_account, reactivate_account, delete_account)
- [ ] RLS policies mises à jour
- [ ] Testé: Désactivation → Profil non visible
- [ ] Testé: Reconnexion → Page de réactivation
- [ ] Testé: Réactivation → Profil à nouveau visible
- [ ] Testé: Suppression → Données supprimées

---

## 🎯 Prochaines améliorations possibles

1. **Export de données** avant suppression (RGPD)
2. **Délai de grâce** de 30 jours avant suppression définitive
3. **Email de confirmation** avant désactivation/suppression
4. **Historique** des désactivations/réactivations
5. **Raison** de la désactivation/suppression (feedback)
6. **Nettoyage automatique** des comptes désactivés après X mois
7. **Dashboard admin** pour gérer les comptes

---

## 🆘 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs dans Supabase → Logs
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que la migration a bien été exécutée
4. Testez en navigation privée pour éliminer les problèmes de cache

---

## 🎉 Prêt!

Les fonctionnalités de gestion de compte sont maintenant opérationnelles! Les utilisateurs peuvent mettre leur compte en veille ou le supprimer définitivement en toute sécurité.
