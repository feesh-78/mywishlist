-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'follow', 'like', 'comment', 'wishlist_invite', 'wishlist_shared'
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- user who triggered the notification
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  item_id UUID REFERENCES wishlist_items(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_notification_type CHECK (
    type IN ('follow', 'like', 'comment', 'wishlist_invite', 'wishlist_shared')
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System/app can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_actor_id UUID,
  p_wishlist_id UUID DEFAULT NULL,
  p_item_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL,
  p_content TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Don't create notification if actor is the same as user
  IF p_actor_id = p_user_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (
    user_id,
    type,
    actor_id,
    wishlist_id,
    item_id,
    comment_id,
    content
  ) VALUES (
    p_user_id,
    p_type,
    p_actor_id,
    p_wishlist_id,
    p_item_id,
    p_comment_id,
    p_content
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Trigger function for follow notifications
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_notification(
    p_user_id := NEW.following_id,
    p_type := 'follow',
    p_actor_id := NEW.follower_id,
    p_content := NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger for follow notifications
DROP TRIGGER IF EXISTS trigger_notify_new_follower ON follows;
CREATE TRIGGER trigger_notify_new_follower
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_follower();
