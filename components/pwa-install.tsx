'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Enregistrement du service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker enregistré:', registration.scope);
          })
          .catch((error) => {
            console.error('❌ Erreur Service Worker:', error);
          });
      });
    }

    // Capturer l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher la mini-infobar automatique de Chrome
      e.preventDefault();

      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowInstallButton(true);

      console.log('✅ beforeinstallprompt capturé - bouton installation affiché');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App déjà installée');
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('❌ Pas de prompt disponible');
      return;
    }

    // Afficher le prompt d'installation
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ Utilisateur a accepté l\'installation');
    } else {
      console.log('❌ Utilisateur a refusé l\'installation');
    }

    // On ne peut utiliser le prompt qu'une seule fois
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    // Sauvegarder dans localStorage pour ne pas embêter l'utilisateur
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne rien afficher si on ne doit pas montrer le bouton
  if (!showInstallButton) {
    return null;
  }

  // Bannière d'installation en haut de page
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Installer MyWishList</p>
              <p className="text-xs opacity-90">
                Accès rapide et partage de produits depuis d&apos;autres apps
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            >
              Installer
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
