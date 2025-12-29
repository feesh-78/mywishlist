'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';

interface AvatarViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarUrl: string | null;
  username: string;
}

export function AvatarViewDialog({
  open,
  onOpenChange,
  avatarUrl,
  username,
}: AvatarViewDialogProps) {
  if (!avatarUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-black/95 border-none">
        <div className="relative w-full aspect-square">
          <Image
            src={avatarUrl}
            alt={`Photo de profil de ${username}`}
            fill
            className="object-contain"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
