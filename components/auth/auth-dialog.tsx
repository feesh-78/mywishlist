'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action?: 'like' | 'comment' | 'follow' | 'create' | 'notification';
}

const actionConfig = {
  like: {
    icon: Heart,
    title: 'Likez ce que vous aimez',
    description: 'Connectez-vous pour liker des produits et créer vos collections favorites.',
  },
  comment: {
    icon: MessageCircle,
    title: 'Rejoignez la conversation',
    description: 'Connectez-vous pour commenter et partager votre avis avec la communauté.',
  },
  follow: {
    icon: UserPlus,
    title: 'Suivez vos créateurs préférés',
    description: 'Connectez-vous pour suivre des utilisateurs et voir leurs nouveautés dans votre feed.',
  },
  create: {
    icon: Heart,
    title: 'Créez votre première wishlist',
    description: 'Connectez-vous pour créer vos wishlists et les partager avec vos proches.',
  },
  notification: {
    icon: Bell,
    title: 'Activez les notifications',
    description: 'Connectez-vous pour recevoir des notifications sur vos wishlists et interactions.',
  },
};

export function AuthDialog({ isOpen, onClose, action = 'like' }: AuthDialogProps) {
  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-center text-xl">{config.title}</DialogTitle>
          <DialogDescription className="text-center">
            {config.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/signup">Créer un compte</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/login">Se connecter</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
