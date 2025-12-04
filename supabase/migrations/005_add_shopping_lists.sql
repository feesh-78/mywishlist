-- ============================================
-- ADD LIST_TYPE TO WISHLISTS TABLE
-- ============================================
-- Add list_type column to differentiate between wishlists and shopping lists
ALTER TABLE wishlists ADD COLUMN IF NOT EXISTS list_type VARCHAR(20) DEFAULT 'wishlist' CHECK (list_type IN ('wishlist', 'shopping_list'));

-- Add purchase_date for shopping list items
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ;
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS store TEXT;
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS review TEXT;

-- Create index for list_type
CREATE INDEX IF NOT EXISTS idx_wishlists_list_type ON wishlists(list_type);

-- Update activities type to include shopping list
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check
  CHECK (type IN ('created_wishlist', 'created_shopping_list', 'added_item', 'reserved_item', 'followed_user', 'liked_wishlist', 'commented'));

-- Function to create activity on shopping list creation
CREATE OR REPLACE FUNCTION create_list_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.list_type = 'shopping_list' THEN
    INSERT INTO activities (user_id, type, entity_type, entity_id, is_public)
    VALUES (NEW.user_id, 'created_shopping_list', 'shopping_list', NEW.id, NEW.is_public);
  ELSE
    INSERT INTO activities (user_id, type, entity_type, entity_id, is_public)
    VALUES (NEW.user_id, 'created_wishlist', 'wishlist', NEW.id, NEW.is_public);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace old trigger
DROP TRIGGER IF EXISTS on_wishlist_created ON wishlists;
CREATE TRIGGER on_list_created
  AFTER INSERT ON wishlists
  FOR EACH ROW EXECUTE FUNCTION create_list_activity();
