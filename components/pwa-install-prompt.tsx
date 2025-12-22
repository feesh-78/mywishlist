'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import Link from 'next/link';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Vérifier si c'est iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Vérifier si déjà installé
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Ne pas afficher si déjà installé ou si déjà fermé
    if (standalone || localStorage.getItem('pwa-prompt-dismissed')) {
      return;
    }

    // Attendre 3 secondes avant d'afficher
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    // Écouter l'événement beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      // Android/Desktop
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA installée via prompt');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setShowPrompt(false);
  }

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="shadow-2xl border-2">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Installer MyWishList</h3>
                <p className="text-xs text-muted-foreground">
                  Accès rapide et partage de liens
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isIOS ? (
            // Instructions iOS
            <div className="space-y-2 mb-3">
              <p className="text-xs text-muted-foreground">
                Pour installer l&apos;app sur iPhone :
              </p>
              <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Appuie sur <strong>Partager</strong> en bas</li>
                <li>Fais défiler et appuie sur <strong>&quot;Sur l&apos;écran d&apos;accueil&quot;</strong></li>
                <li>Appuie sur <strong>&quot;Ajouter&quot;</strong></li>
              </ol>
            </div>
          ) : (
            // Bouton install Android/Desktop
            <Button onClick={handleInstall} className="w-full mb-3" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Installer l&apos;application
            </Button>
          )}

          <div className="flex gap-2">
            <Link href="/pwa-test" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                🧪 Tester la config
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
