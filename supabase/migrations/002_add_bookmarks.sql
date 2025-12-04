-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  item_id UUID REFERENCES wishlist_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Either wishlist_id or item_id must be set, but not both
  CONSTRAINT bookmark_target CHECK (
    (wishlist_id IS NOT NULL AND item_id IS NULL) OR
    (wishlist_id IS NULL AND item_id IS NOT NULL)
  ),

  -- Prevent duplicate bookmarks
  UNIQUE(user_id, wishlist_id, item_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_wishlist_id ON bookmarks(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_item_id ON bookmarks(item_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own bookmarks
CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
