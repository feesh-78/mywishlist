-- Migration: Créer table products pour produits indépendants
-- Date: 2025-12-21
-- Description: Permet d'ajouter des produits sans créer de wishlist

-- Créer la table products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Informations produit
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  brand TEXT,
  category TEXT,
  image_url TEXT,
  url TEXT,

  -- Type: wishlist (envie) ou purchased (acheté)
  product_type VARCHAR(20) DEFAULT 'wishlist' CHECK (product_type IN ('wishlist', 'purchased')),

  -- Champs spécifiques pour produits achetés
  purchase_date TIMESTAMPTZ,
  store TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,

  -- Visibilité
  is_public BOOLEAN DEFAULT true,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut voir les produits publics
CREATE POLICY "Public products are viewable by everyone"
  ON products FOR SELECT
  USING (is_public = true);

-- Politique: Les utilisateurs peuvent voir leurs propres produits
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent insérer leurs propres produits
CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leurs propres produits
CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs propres produits
CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Commentaires
COMMENT ON TABLE products IS 'Produits individuels pouvant exister indépendamment des wishlists';
COMMENT ON COLUMN products.product_type IS 'Type: wishlist (envie) ou purchased (déjà acheté)';
COMMENT ON COLUMN products.is_public IS 'Si false, seul le propriétaire peut voir le produit';
