'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';

export function AuthBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex-1">
            <p className="text-sm font-medium">
              Connectez-vous pour profiter de toutes les fonctionnalités
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Créez vos wishlists, likez et commentez
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">S&apos;inscrire</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
