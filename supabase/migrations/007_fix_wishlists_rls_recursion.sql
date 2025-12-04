-- ============================================
-- FIX INFINITE RECURSION IN WISHLISTS RLS POLICIES
-- ============================================
-- Simplifier les policies pour éviter la récursion avec wishlist_collaborators

-- Drop les anciennes policies
DROP POLICY IF EXISTS "Public wishlists are viewable by everyone" ON wishlists;
DROP POLICY IF EXISTS "Users can update own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Wishlist items are viewable if wishlist is viewable" ON wishlist_items;
DROP POLICY IF EXISTS "Users can create items in own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can update items in own wishlists" ON wishlist_items;

-- Recréer les policies sans référence à wishlist_collaborators (qui cause la récursion)

-- WISHLISTS POLICIES
CREATE POLICY "Public wishlists are viewable by everyone"
  ON wishlists FOR SELECT
  USING (
    is_public = TRUE OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can update own wishlists"
  ON wishlists FOR UPDATE
  USING (user_id = auth.uid());

-- WISHLIST ITEMS POLICIES
CREATE POLICY "Wishlist items are viewable if wishlist is viewable"
  ON wishlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND (
        is_public = TRUE OR
        user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create items in own wishlists"
  ON wishlist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own wishlists"
  ON wishlist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND user_id = auth.uid()
    )
  );
