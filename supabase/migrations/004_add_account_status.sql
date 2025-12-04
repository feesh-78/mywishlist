-- Add account status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;

-- Add constraint for valid statuses
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_account_status;
ALTER TABLE profiles ADD CONSTRAINT valid_account_status 
  CHECK (account_status IN ('active', 'deactivated', 'deleted'));

-- Create index for filtering active users
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- Function to deactivate account
CREATE OR REPLACE FUNCTION deactivate_account(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    account_status = 'deactivated',
    deactivated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Function to reactivate account
CREATE OR REPLACE FUNCTION reactivate_account(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    account_status = 'active',
    deactivated_at = NULL
  WHERE id = p_user_id;
END;
$$;

-- Function to delete account and all related data
CREATE OR REPLACE FUNCTION delete_account(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark as deleted first
  UPDATE profiles
  SET 
    account_status = 'deleted',
    deactivated_at = NOW()
  WHERE id = p_user_id;
  
  -- Delete user data (cascading will handle related tables)
  -- Bookmarks, notifications, follows, likes, comments will cascade
  DELETE FROM wishlists WHERE user_id = p_user_id;
  
  -- Finally delete the profile
  DELETE FROM profiles WHERE id = p_user_id;
  
  -- Delete auth user (this will cascade to everything)
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Update RLS policies to exclude deactivated accounts from public views
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (account_status = 'active');

-- Allow users to view their own profile even if deactivated
CREATE POLICY "Users can view own profile regardless of status"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

COMMENT ON COLUMN profiles.account_status IS 'Account status: active, deactivated, or deleted';
COMMENT ON COLUMN profiles.deactivated_at IS 'Timestamp when account was deactivated or deleted';
