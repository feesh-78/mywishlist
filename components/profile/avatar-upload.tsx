'use client';

import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';
import { AvatarCropDialog } from './avatar-crop-dialog';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  username: string;
  onUpdate: (url: string) => void;
  onView?: () => void;
}

export function AvatarUpload({ userId, currentAvatarUrl, username, onUpdate, onView }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
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

    // Create preview URL and open crop dialog
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  }

  async function handleCropComplete(croppedImageBlob: Blob) {
    try {
      const supabase = createClient();

      // Upload to Supabase Storage
      const fileName = `avatar-${userId}-${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImageBlob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      if (updateError) throw updateError;

      // Also update profiles table
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      setPreviewUrl(avatarUrl);
      onUpdate(avatarUrl);

      toast({
        title: 'Photo de profil mise à jour',
        description: 'Votre photo de profil a été mise à jour avec succès.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors du téléchargement.',
      });
    }
  }

  return (
    <>
      <div className="relative group">
        <div
          className="cursor-pointer"
          onClick={(e) => {
            if (onView && previewUrl && !(e.target as HTMLElement).closest('.camera-button')) {
              onView();
            }
          }}
          title="Voir la photo de profil"
        >
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={previewUrl || ''} alt={username} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl">
              {username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div
          className="camera-button absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          title="Changer la photo de profil"
        >
          <Camera className="h-5 w-5" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <AvatarCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
