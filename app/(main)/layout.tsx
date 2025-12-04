import { Header } from '@/components/shared/header';
import { MobileLayout } from '@/components/mobile-layout-wrapper';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6 pb-20 md:pb-6">{children}</main>
      <footer className="border-t py-6 md:py-0 mb-16 md:mb-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 MyWishList. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">
              À propos
            </a>
            <a href="#" className="hover:text-primary">
              Confidentialité
            </a>
            <a href="#" className="hover:text-primary">
              Contact
            </a>
          </div>
        </div>
      </footer>
      <MobileLayout />
    </div>
  );
}
