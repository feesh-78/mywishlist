import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mywishlist.app',
  appName: 'MyWishList',
  webDir: 'www', // Dossier de fallback
  server: {
    // URL de production - Mise à jour avec le dernier déploiement
    url: 'https://mywishlist-ruddy.vercel.app',
    cleartext: true,
    // Pour le développement local, commenter la ligne url ci-dessus et utiliser:
    // url: 'http://localhost:3000',
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
