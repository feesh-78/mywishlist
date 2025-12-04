-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- ============================================
-- WISHLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_collaborative BOOLEAN DEFAULT FALSE,
  event_date TIMESTAMPTZ,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, slug),
  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100)
);

-- ============================================
-- WISHLIST ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'purchased')),
  reserved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200)
);

-- ============================================
-- REFERRAL CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  url TEXT,
  category TEXT,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100)
);

-- ============================================
-- FOLLOWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- ============================================
-- FRIENDSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id_1, user_id_2),
  CONSTRAINT no_self_friend CHECK (user_id_1 != user_id_2),
  CONSTRAINT ordered_user_ids CHECK (user_id_1 < user_id_2)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'comment', 'like', 'reserved', 'collaboration_invite', 'friend_request')),
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  item_id UUID REFERENCES wishlist_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  CONSTRAINT has_target CHECK ((wishlist_id IS NOT NULL) OR (item_id IS NOT NULL))
);

-- ============================================
-- LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('wishlist', 'item', 'comment')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, entity_type, entity_id)
);

-- ============================================
-- WISHLIST COLLABORATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(wishlist_id, user_id)
);

-- ============================================
-- ACTIVITIES TABLE (for feed)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created_wishlist', 'added_item', 'reserved_item', 'followed_user', 'liked_wishlist', 'commented')),
  entity_type TEXT,
  entity_id UUID,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_username ON profiles(username);

-- Wishlists
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_slug ON wishlists(user_id, slug);
CREATE INDEX idx_wishlists_public ON wishlists(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_wishlists_category ON wishlists(category);

-- Wishlist Items
CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_reserved_by ON wishlist_items(reserved_by);
CREATE INDEX idx_wishlist_items_status ON wishlist_items(status);

-- Referral Codes
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_category ON referral_codes(category);

-- Followers
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);

-- Friendships
CREATE INDEX idx_friendships_user_id_1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user_id_2 ON friendships(user_id_2);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Comments
CREATE INDEX idx_comments_wishlist_id ON comments(wishlist_id);
CREATE INDEX idx_comments_item_id ON comments(item_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Likes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_entity ON likes(entity_type, entity_id);

-- Activities
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_public ON activities(is_public) WHERE is_public = TRUE;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- WISHLISTS POLICIES
-- ============================================
CREATE POLICY "Public wishlists are viewable by everyone"
  ON wishlists FOR SELECT
  USING (
    is_public = TRUE OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM wishlist_collaborators
      WHERE wishlist_id = wishlists.id
      AND user_id = auth.uid()
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can create own wishlists"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlists"
  ON wishlists FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM wishlist_collaborators
      WHERE wishlist_id = wishlists.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can delete own wishlists"
  ON wishlists FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- WISHLIST ITEMS POLICIES
-- ============================================
CREATE POLICY "Wishlist items are viewable if wishlist is viewable"
  ON wishlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND (
        is_public = TRUE OR
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM wishlist_collaborators
          WHERE wishlist_id = wishlists.id
          AND user_id = auth.uid()
          AND status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Users can create items in own wishlists"
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
          AND role IN ('owner', 'editor')
          AND status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Users can update items in own wishlists"
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
          AND role IN ('owner', 'editor')
          AND status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Users can delete items from own wishlists"
  ON wishlist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- REFERRAL CODES POLICIES
-- ============================================
CREATE POLICY "Referral codes are viewable by everyone"
  ON referral_codes FOR SELECT
  USING (true);

CREATE POLICY "Users can create own referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes"
  ON referral_codes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own referral codes"
  ON referral_codes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- FOLLOWERS POLICIES
-- ============================================
CREATE POLICY "Followers are viewable by everyone"
  ON followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON followers FOR DELETE
  USING (follower_id = auth.uid());

-- ============================================
-- FRIENDSHIPS POLICIES
-- ============================================
CREATE POLICY "Friendships are viewable by involved users"
  ON friendships FOR SELECT
  USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON friendships FOR INSERT
  WITH CHECK (
    auth.uid() = requested_by AND
    (user_id_1 = auth.uid() OR user_id_2 = auth.uid())
  );

CREATE POLICY "Users can update friendships they're part of"
  ON friendships FOR UPDATE
  USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

CREATE POLICY "Users can delete friendships they're part of"
  ON friendships FOR DELETE
  USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- COMMENTS POLICIES
-- ============================================
CREATE POLICY "Comments are viewable if target is viewable"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- LIKES POLICIES
-- ============================================
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create own likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- WISHLIST COLLABORATORS POLICIES
-- ============================================
CREATE POLICY "Collaborators are viewable by wishlist members"
  ON wishlist_collaborators FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_collaborators.wishlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Wishlist owners can invite collaborators"
  ON wishlist_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_collaborators.wishlist_id
      AND user_id = auth.uid()
    ) AND invited_by = auth.uid()
  );

CREATE POLICY "Users can update collaborations they're part of"
  ON wishlist_collaborators FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_collaborators.wishlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove themselves as collaborators"
  ON wishlist_collaborators FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_collaborators.wishlist_id
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- ACTIVITIES POLICIES
-- ============================================
CREATE POLICY "Public activities are viewable by everyone"
  ON activities FOR SELECT
  USING (
    is_public = TRUE OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM followers
      WHERE following_id = activities.user_id
      AND follower_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_codes_updated_at BEFORE UPDATE ON referral_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_collaborators_updated_at BEFORE UPDATE ON wishlist_collaborators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to create activity on wishlist creation
CREATE OR REPLACE FUNCTION create_wishlist_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (user_id, type, entity_type, entity_id, is_public)
  VALUES (NEW.user_id, 'created_wishlist', 'wishlist', NEW.id, NEW.is_public);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_wishlist_created
  AFTER INSERT ON wishlists
  FOR EACH ROW EXECUTE FUNCTION create_wishlist_activity();

-- Function to create notification on follow
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, actor_id, entity_type, entity_id)
  VALUES (NEW.following_id, 'follow', NEW.follower_id, 'follow', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_followed
  AFTER INSERT ON followers
  FOR EACH ROW EXECUTE FUNCTION create_follow_notification();
