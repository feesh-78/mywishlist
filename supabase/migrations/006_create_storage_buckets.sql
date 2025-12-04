-- ============================================
-- CREATE STORAGE BUCKETS
-- ============================================
-- Créer les buckets de stockage pour les images

-- Bucket pour les images de couverture des wishlists/shopping lists
INSERT INTO storage.buckets (id, name, public)
VALUES ('wishlist-covers', 'wishlist-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les avatars des utilisateurs
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les images des items de wishlist
INSERT INTO storage.buckets (id, name, public)
VALUES ('wishlist-images', 'wishlist-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Politiques de sécurité pour les buckets

-- Politique de lecture publique pour tous les buckets (les images sont publiques)
CREATE POLICY "Public read access for wishlist-covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wishlist-covers');

CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Public read access for wishlist-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wishlist-images');

-- Politique d'upload: seulement les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload wishlist-covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wishlist-covers');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload wishlist-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wishlist-images');

-- Politique de suppression: seulement le propriétaire peut supprimer ses fichiers
CREATE POLICY "Users can delete their own wishlist-covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'wishlist-covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own wishlist-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'wishlist-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique de mise à jour: seulement le propriétaire peut modifier ses fichiers
CREATE POLICY "Users can update their own wishlist-covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'wishlist-covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own wishlist-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'wishlist-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
