'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';
import Image from 'next/image';

interface CoverPhotoUploadProps {
  userId: string;
  currentCoverUrl?: string | null;
  onUpdate: (url: string) => void;
}

export function CoverPhotoUpload({ userId, currentCoverUrl, onUpdate }: CoverPhotoUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentCoverUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Fichier invalide',
        description: 'Veuillez sélectionner une image.',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'La taille maximale est de 5 Mo.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${userId}-${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const coverUrl = urlData.publicUrl;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_photo_url: coverUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPreviewUrl(coverUrl);
      onUpdate(coverUrl);

      toast({
        title: 'Photo de couverture mise à jour',
        description: 'Votre photo de couverture a été mise à jour avec succès.',
      });
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors du téléchargement.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg overflow-hidden group">
      {previewUrl && (
        <Image
          src={previewUrl}
          alt="Photo de couverture"
          fill
          className="object-cover"
          priority
        />
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Modifier la couverture
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
