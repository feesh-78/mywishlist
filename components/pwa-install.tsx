'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Download, X, Menu } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

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

    // Détecter Android
    const userAgent = navigator.userAgent.toLowerCase();
    const android = /android/.test(userAgent);
    setIsAndroid(android);

    // Vérifier si déjà installé
    const installed = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(installed);

    // Si Android et pas installé, montrer la bannière après 3 secondes
    if (android && !installed) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => {
          setShowInstallBanner(true);
        }, 3000);
      }
    }

    // Capturer l'événement beforeinstallprompt (bonus si disponible)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      console.log('✅ beforeinstallprompt capturé');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // Si on a le prompt, l'utiliser
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ Installation acceptée');
        setShowInstallBanner(false);
      }

      setDeferredPrompt(null);
    } else {
      // Sinon, montrer les instructions manuelles
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne rien afficher si installé ou pas Android
  if (isInstalled || !isAndroid || !showInstallBanner) {
    return null;
  }

  // Instructions manuelles
  if (showManualInstructions) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">📱 Installer MyWishList</h3>
            <button onClick={() => setShowManualInstructions(false)} className="text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Pour installer l&apos;application sur ton téléphone :
            </p>

            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">1.</span>
                <span>Appuie sur le menu <Menu className="inline h-4 w-4" /> (3 points) en haut à droite de Chrome</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">2.</span>
                <span>Cherche <strong>&quot;Installer l&apos;application&quot;</strong> ou <strong>&quot;Ajouter à l&apos;écran d&apos;accueil&quot;</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">3.</span>
                <span>Appuie dessus et confirme l&apos;installation</span>
              </li>
            </ol>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 mt-4">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>Important:</strong> Choisis bien &quot;Installer l&apos;application&quot; (pas juste &quot;Ajouter à l&apos;écran&quot;) pour que le partage depuis d&apos;autres apps fonctionne !
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowManualInstructions(false)}
            className="w-full mt-6"
          >
            J&apos;ai compris
          </Button>
        </div>
      </div>
    );
  }

  // Bannière d'installation
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Installer MyWishList</p>
              <p className="text-xs opacity-90">
                Partage de produits depuis d&apos;autres apps
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
