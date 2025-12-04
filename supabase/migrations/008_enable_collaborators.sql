-- ============================================
-- ENABLE WISHLIST COLLABORATORS PERMISSIONS
-- ============================================
-- Update RLS policies to allow collaborators to edit wishlists and items

-- Drop existing policies that we need to update
DROP POLICY IF EXISTS "Users can update own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Users can create items in own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can update items in own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete items in own wishlists" ON wishlist_items;

-- WISHLISTS POLICIES - Allow collaborators with 'editor' role to update
CREATE POLICY "Users can update own wishlists or as editor"
  ON wishlists FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM wishlist_collaborators
      WHERE wishlist_id = wishlists.id
      AND user_id = auth.uid()
      AND role = 'editor'
      AND status = 'accepted'
    )
  );

-- WISHLIST ITEMS POLICIES - Allow collaborators with 'editor' role

CREATE POLICY "Users can create items in own wishlists or as editor"
  ON wishlist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM wishlist_collaborators
          WHERE wishlist_id = wishlists.id
          AND user_id = auth.uid()
          AND role = 'editor'
          AND status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Users can update items in own wishlists or as editor"
  ON wishlist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM wishlist_collaborators
          WHERE wishlist_id = wishlists.id
          AND user_id = auth.uid()
          AND role = 'editor'
          AND status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Users can delete items in own wishlists or as editor"
  ON wishlist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM wishlist_collaborators
          WHERE wishlist_id = wishlists.id
          AND user_id = auth.uid()
          AND role = 'editor'
          AND status = 'accepted'
        )
      )
    )
  );

-- WISHLIST COLLABORATORS POLICIES
-- Enable RLS
ALTER TABLE wishlist_collaborators ENABLE ROW LEVEL SECURITY;

-- Collaborators can view if they are part of the wishlist
CREATE POLICY "Users can view collaborators of their wishlists"
  ON wishlist_collaborators FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_collaborators.wishlist_id
      AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM wishlist_collaborators wc2
      WHERE wc2.wishlist_id = wishlist_collaborators.wishlist_id
      AND wc2.user_id = auth.uid()
    )
  );

-- Only wishlist owners can invite collaborators
CREATE POLICY "Wishlist owners can add collaborators"
  ON wishlist_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_collaborators.wishlist_id
      AND user_id = auth.uid()
    )
  );

-- Only wishlist owners can update collaborators
CREATE POLICY "Wishlist owners can update collaborators"
  ON wishlist_collaborators FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_collaborators.wishlist_id
      AND user_id = auth.uid()
    )
  );

-- Only wishlist owners can remove collaborators
CREATE POLICY "Wishlist owners can delete collaborators"
  ON wishlist_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_collaborators.wishlist_id
      AND user_id = auth.uid()
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_collaborators_wishlist_id
  ON wishlist_collaborators(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_collaborators_user_id
  ON wishlist_collaborators(user_id);
