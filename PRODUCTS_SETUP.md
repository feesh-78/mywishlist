# 📦 Système de Produits Indépendants

> **Date**: 21 décembre 2025
> **Feature**: Ajout de produits sans créer de wishlist

---

## 🎯 **Nouveauté**

Avant : **Wishlist → Produits** (il fallait créer une wishlist d'abord)
Maintenant : **Produits indépendants** (on peut ajouter des produits directement)

---

## ⚙️ **SETUP (2 minutes)**

### **Étape 1 : Exécuter la migration SQL**

1. Va sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionne ton projet **MyWishList**
3. Menu gauche → **SQL Editor**
4. Clique **New query**
5. Copie le contenu de `supabase/migrations/009_create_products_table.sql`
6. Colle et clique **Run**
7. ✅ Vérifie : "Success. No rows returned"

### **Étape 2 : C'est tout !**

La table `products` est maintenant créée.

---

## 📊 **Structure de la table `products`**

```sql
CREATE TABLE products (
  id UUID,
  user_id UUID,

  -- Infos produit
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(3),
  brand TEXT,
  category TEXT,
  image_url TEXT,
  url TEXT,

  -- Type
  product_type VARCHAR(20), -- 'wishlist' ou 'purchased'

  -- Si acheté
  purchase_date TIMESTAMPTZ,
  store TEXT,
  rating INTEGER (1-5),
  review TEXT,

  -- Visibilité
  is_public BOOLEAN,

  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## 🔄 **Nouveau flux utilisateur**

### **Option A : Ajout rapide de produit**

1. Appuyer sur **+** (FAB)
2. Sélectionner **"Screenshot"**
3. Coller un lien Amazon ou uploader screenshot
4. ✨ Le produit est **créé directement**
5. **Pas besoin de wishlist !**

### **Option B : Organiser en wishlist après**

1. Aller sur **"Mon profil"**
2. Voir tous ses **produits** (onglet "Produits")
3. Sélectionner des produits
4. Cliquer **"Ajouter à une wishlist"**
5. Choisir wishlist existante ou en créer une

---

## 📱 **Affichage profil**

### **3 onglets :**

1. **Produits** (tous les produits, envies + achats)
2. **Wishlists** (collections d'envies)
3. **Achats** (collections d'achats)

### **Filtres dans "Produits" :**

- 🎁 **Tous** (wishlist + purchased)
- 💭 **Envies** (product_type = 'wishlist')
- ✅ **Achetés** (product_type = 'purchased')

---

## 🚀 **Avantages**

✅ **Plus rapide** : Ajouter un produit en 10 secondes
✅ **Plus flexible** : Organiser en wishlists plus tard
✅ **Feed personnalisé** : Voir tous tes produits d'un coup
✅ **Import multiple** : Ajouter 10 liens d'un coup

---

## 🔒 **RLS Policies**

- ✅ Tout le monde peut voir les produits `is_public = true`
- ✅ Seul le propriétaire voit ses produits privés
- ✅ Seul le propriétaire peut modifier/supprimer ses produits

---

## ✅ **Checklist de vérification**

- [ ] Migration 009 exécutée sur Supabase
- [ ] Table `products` créée
- [ ] RLS policies actives
- [ ] Testé : Ajout d'un produit depuis /add-product
- [ ] Testé : Affichage sur le profil

---

## 🆕 **Prochaines étapes**

1. [x] Créer la table `products`
2. [ ] Modifier `/add-product` pour créer directement le produit
3. [ ] Créer affichage profil avec onglet "Produits"
4. [ ] Ajouter import multiple de liens
5. [ ] Permettre d'ajouter des produits à des wishlists existantes

---

**Prêt à utiliser !** 🎉
