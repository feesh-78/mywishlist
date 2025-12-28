import { Header } from '@/components/shared/header';
import { MobileLayout } from '@/components/mobile-layout-wrapper';
import { AuthProvider } from '@/components/auth/auth-provider';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-6 pb-20 md:pb-6">{children}</main>
        <MobileLayout />
        <PWAInstallPrompt />
      </div>
    </AuthProvider>
  );
}
