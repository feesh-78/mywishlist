-- Add cover photo column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Add comment
COMMENT ON COLUMN profiles.cover_photo_url IS 'URL de la photo de couverture du profil (comme Facebook/LinkedIn)';
