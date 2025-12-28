'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Bell, User, Camera, List, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface BottomNavProps {
  username?: string;
  unreadCount?: number;
}

export function BottomNav({ username, unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Don't show on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/verify-email') || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/reset-password') || pathname?.startsWith('/email-confirmed') || pathname?.startsWith('/auth')) {
    return null;
  }

  const links = [
    { href: '/feed', icon: Home, label: 'Accueil' },
    { href: '/search', icon: Search, label: 'Recherche' },
    { type: 'button', icon: PlusSquare, label: 'Créer' }, // Modifié en bouton
    { href: '/notifications', icon: Bell, label: 'Notifs', badge: unreadCount },
    { href: username ? `/profile/${username}` : '/settings', icon: User, label: 'Profil' },
  ];

  return (
    <>
      {/* Backdrop pour le menu de création */}
      {showCreateMenu && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowCreateMenu(false)}
        />
      )}

      {/* Menu de création (popup depuis le bas) */}
      {showCreateMenu && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-background border-t z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-4 space-y-2">
            <Link
              href="/add-product"
              onClick={() => setShowCreateMenu(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Ajouter un produit</p>
                <p className="text-xs text-muted-foreground">Depuis un lien ou une photo</p>
              </div>
            </Link>

            <Link
              href="/wishlists/new"
              onClick={() => setShowCreateMenu(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <List className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Créer une wishlist</p>
                <p className="text-xs text-muted-foreground">Pour un événement ou thème</p>
              </div>
            </Link>

            <Link
              href="/shopping/new"
              onClick={() => setShowCreateMenu(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Créer une shopping list</p>
                <p className="text-xs text-muted-foreground">Liste de courses ou achats</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t z-50 safe-bottom">
        <div className="flex justify-around items-center h-16">
          {links.map((link, index) => {
            const Icon = link.icon;

            // Bouton "Créer" spécial
            if (link.type === 'button') {
              return (
                <button
                  key={`button-${index}`}
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className={cn(
                    'relative flex flex-col items-center justify-center flex-1 h-full transition-colors',
                    'min-w-[60px] px-2',
                    showCreateMenu
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform',
                      showCreateMenu && 'fill-current'
                    )}
                  />
                  <span className="text-[10px] mt-1 leading-tight">{link.label}</span>
                </button>
              );
            }

            // Liens normaux
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');

            return (
              <Link
                key={link.href}
                href={link.href!}
                className={cn(
                  'relative flex flex-col items-center justify-center flex-1 h-full transition-colors',
                  'min-w-[60px] px-2',
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform',
                    isActive && 'fill-current'
                  )}
                />
                <span className="text-[10px] mt-1 leading-tight">{link.label}</span>

                {/* Badge for notifications */}
                {link.badge && link.badge > 0 && (
                  <span className="absolute top-2 right-1/2 translate-x-2 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
