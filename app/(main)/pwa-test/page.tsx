'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Copy, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWATestPage() {
  const [checks, setChecks] = useState({
    https: false,
    manifest: false,
    serviceWorker: false,
    standalone: false,
    shareTarget: false,
  });
  const [manifestData, setManifestData] = useState<any>(null);
  const [swRegistration, setSwRegistration] = useState<any>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    runChecks();

    // Capturer l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanInstall(true);
      console.log('✅ beforeinstallprompt capturé');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  async function runChecks() {
    const newChecks = { ...checks };

    // 1. Vérifier HTTPS
    newChecks.https = window.location.protocol === 'https:';

    // 2. Vérifier Manifest
    try {
      const response = await fetch('/manifest.json');
      const data = await response.json();
      newChecks.manifest = !!data;
      setManifestData(data);
      newChecks.shareTarget = !!data.share_target;
    } catch (error) {
      newChecks.manifest = false;
    }

    // 3. Vérifier Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        newChecks.serviceWorker = !!registration;
        setSwRegistration(registration);
      } catch (error) {
        newChecks.serviceWorker = false;
      }
    }

    // 4. Vérifier mode standalone (PWA installée)
    newChecks.standalone = window.matchMedia('(display-mode: standalone)').matches;

    setChecks(newChecks);
  }

  async function registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        alert('✅ Service Worker enregistré !');
        runChecks();
      } catch (error) {
        alert('❌ Erreur: ' + error);
      }
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(window.location.origin);
    alert('📋 URL copiée !');
  }

  async function handleInstall() {
    if (!deferredPrompt) {
      alert('❌ Le prompt d\'installation n\'est pas encore disponible. Attendez quelques secondes et réessayez.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      alert('✅ Installation réussie !');
    } else {
      alert('❌ Installation annulée');
    }

    setDeferredPrompt(null);
    setCanInstall(false);
    runChecks();
  }

  const allGreen = Object.values(checks).every((v) => v);

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">🧪 Diagnostic PWA</h1>

      {/* Bouton installation si disponible */}
      {canInstall && !checks.standalone && (
        <Card className="mb-6 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-6">
            <div className="text-center">
              <Download className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-2">🎉 Installation disponible !</h2>
              <p className="text-muted-foreground mb-4">
                L&apos;app peut maintenant être installée. Clique sur le bouton ci-dessous.
              </p>
              <Button onClick={handleInstall} size="lg" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Installer MyWishList
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statut global */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {allGreen ? (
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">✅ PWA Prête !</h2>
              <p className="text-muted-foreground">
                Tous les critères sont remplis. Tu peux maintenant partager des liens vers l&apos;app.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">⚠️ Configuration incomplète</h2>
              <p className="text-muted-foreground">
                Certains critères ne sont pas remplis. Vois ci-dessous pour corriger.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checks détaillés */}
      <div className="space-y-4 mb-6">
        {/* HTTPS */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {checks.https ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h3 className="font-semibold">HTTPS actif</h3>
                <p className="text-sm text-muted-foreground">
                  Le site doit être en HTTPS pour que le Web Share Target fonctionne
                </p>
              </div>
            </div>
            <Badge variant={checks.https ? 'default' : 'destructive'}>
              {checks.https ? 'OK' : 'Manquant'}
            </Badge>
          </CardContent>
        </Card>

        {/* Manifest */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {checks.manifest ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h3 className="font-semibold">Manifest.json</h3>
                <p className="text-sm text-muted-foreground">
                  Fichier de configuration PWA accessible
                </p>
              </div>
            </div>
            <Badge variant={checks.manifest ? 'default' : 'destructive'}>
              {checks.manifest ? 'OK' : 'Manquant'}
            </Badge>
          </CardContent>
        </Card>

        {/* Service Worker */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {checks.serviceWorker ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <h3 className="font-semibold">Service Worker</h3>
                  <p className="text-sm text-muted-foreground">
                    Requis pour le Web Share Target
                  </p>
                </div>
              </div>
              <Badge variant={checks.serviceWorker ? 'default' : 'destructive'}>
                {checks.serviceWorker ? 'OK' : 'Manquant'}
              </Badge>
            </div>
            {!checks.serviceWorker && (
              <Button onClick={registerSW} className="mt-2">
                Enregistrer le Service Worker
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Mode Standalone */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {checks.standalone ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h3 className="font-semibold">App installée (Standalone)</h3>
                <p className="text-sm text-muted-foreground">
                  L&apos;app doit être ajoutée à l&apos;écran d&apos;accueil
                </p>
              </div>
            </div>
            <Badge variant={checks.standalone ? 'default' : 'destructive'}>
              {checks.standalone ? 'Installée' : 'Non installée'}
            </Badge>
          </CardContent>
        </Card>

        {/* Share Target */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {checks.shareTarget ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h3 className="font-semibold">Web Share Target configuré</h3>
                <p className="text-sm text-muted-foreground">
                  Configuration dans le manifest.json
                </p>
              </div>
            </div>
            <Badge variant={checks.shareTarget ? 'default' : 'destructive'}>
              {checks.shareTarget ? 'OK' : 'Manquant'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Instructions d&apos;installation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">iPhone (Safari)</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Ouvre ce site dans Safari</li>
              <li>Appuie sur le bouton Partager (carré avec flèche)</li>
              <li>Fais défiler et appuie sur &quot;Sur l&apos;écran d&apos;accueil&quot;</li>
              <li>Appuie sur &quot;Ajouter&quot;</li>
              <li>Ouvre l&apos;app depuis ton écran d&apos;accueil</li>
              <li>Rafraîchis cette page pour vérifier</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Android (Chrome)</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Ouvre ce site dans Chrome</li>
              <li>Appuie sur les 3 points en haut à droite</li>
              <li>Appuie sur &quot;Installer l&apos;application&quot;</li>
              <li>Confirme l&apos;installation</li>
              <li>Ouvre l&apos;app</li>
              <li>Rafraîchis cette page pour vérifier</li>
            </ol>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={copyUrl} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copier l&apos;URL du site
            </Button>
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
              {typeof window !== 'undefined' ? window.location.origin : ''}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Données techniques */}
      {manifestData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🔧 Données techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <details>
              <summary className="cursor-pointer font-semibold mb-2">
                Manifest.json
              </summary>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(manifestData, null, 2)}
              </pre>
            </details>

            {swRegistration && (
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold mb-2">
                  Service Worker
                </summary>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(
                    {
                      scope: swRegistration.scope,
                      active: !!swRegistration.active,
                      installing: !!swRegistration.installing,
                      waiting: !!swRegistration.waiting,
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 text-center">
        <Button onClick={runChecks} variant="outline">
          🔄 Rafraîchir les vérifications
        </Button>
      </div>
    </div>
  );
}
