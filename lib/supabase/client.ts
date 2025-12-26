import { createBrowserClient } from '@supabase/ssr';

// Détecter si on est dans Capacitor
const isCapacitor = () => {
  return typeof window !== 'undefined' &&
         (window as any).Capacitor !== undefined;
};

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Configuration pour Capacitor
  const options = isCapacitor() ? {
    auth: {
      flowType: 'pkce' as const,
      detectSessionInUrl: true,
      // Deep Link pour l'authentification sur mobile
      redirectTo: 'com.mywishlist.app://login-callback',
    }
  } : {
    auth: {
      flowType: 'pkce' as const,
      detectSessionInUrl: true,
    }
  };

  return createBrowserClient(supabaseUrl, supabaseAnonKey, options);
}
