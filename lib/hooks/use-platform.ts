import { useState, useEffect } from 'react';

export type Platform = 'capacitor' | 'desktop' | 'mobile-web';

/**
 * Hook pour détecter le contexte d'exécution de l'application
 *
 * @returns {
 *   platform: 'capacitor' | 'desktop' | 'mobile-web' - Type de plateforme
 *   isCapacitor: boolean - Vrai si l'app est dans Capacitor (app native)
 *   isDesktop: boolean - Vrai si navigateur desktop
 *   isMobileWeb: boolean - Vrai si navigateur mobile
 *   isNative: boolean - Alias de isCapacitor
 * }
 *
 * @example
 * const { isCapacitor, isDesktop, isMobileWeb } = usePlatform();
 *
 * // Afficher un bouton uniquement sur desktop
 * {isDesktop && <Button>Télécharger l'app</Button>}
 *
 * // Afficher uniquement sur mobile web (pas sur l'app)
 * {isMobileWeb && <InstallPWAButton />}
 *
 * // Afficher uniquement dans l'app native
 * {isCapacitor && <NativeFeature />}
 */
export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>('desktop');

  useEffect(() => {
    const detectPlatform = () => {
      // 1. Vérifier si on est dans Capacitor (app native)
      if (typeof window !== 'undefined' && (window as any).Capacitor !== undefined) {
        return 'capacitor' as Platform;
      }

      // 2. Vérifier si on est sur mobile via user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );

      // 3. Vérifier aussi via touch support (plus fiable)
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // 4. Vérifier la largeur d'écran
      const isSmallScreen = window.innerWidth < 768;

      // Déterminer la plateforme
      if (isMobile || (hasTouch && isSmallScreen)) {
        return 'mobile-web' as Platform;
      }

      return 'desktop' as Platform;
    };

    setPlatform(detectPlatform());

    // Re-détecter lors du redimensionnement
    const handleResize = () => {
      setPlatform(detectPlatform());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    platform,
    isCapacitor: platform === 'capacitor',
    isDesktop: platform === 'desktop',
    isMobileWeb: platform === 'mobile-web',
    isNative: platform === 'capacitor', // Alias
  };
}

/**
 * Fonction utilitaire pour obtenir le platform de manière synchrone
 * Attention: À utiliser uniquement côté client
 */
export function getPlatform(): Platform {
  if (typeof window === 'undefined') return 'desktop';

  // Vérifier Capacitor
  if ((window as any).Capacitor !== undefined) {
    return 'capacitor';
  }

  // Vérifier mobile
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 768;

  if (isMobile || (hasTouch && isSmallScreen)) {
    return 'mobile-web';
  }

  return 'desktop';
}
