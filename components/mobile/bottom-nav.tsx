'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  username?: string;
  unreadCount?: number;
}

export function BottomNav({ username, unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  // Don't show on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/verify-email') || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/reset-password') || pathname?.startsWith('/email-confirmed') || pathname?.startsWith('/auth')) {
    return null;
  }

  const links = [
    { href: '/feed', icon: Home, label: 'Accueil' },
    { href: '/search', icon: Search, label: 'Recherche' },
    { href: '/wishlists/new', icon: PlusSquare, label: 'Créer' },
    { href: '/notifications', icon: Bell, label: 'Notifs', badge: unreadCount },
    { href: username ? `/profile/${username}` : '/settings', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t z-50 safe-bottom">
      <div className="flex justify-around items-center h-16">
        {links.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
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
              <span className="text-[10px] mt-1 leading-tight">{label}</span>

              {/* Badge for notifications */}
              {badge && badge > 0 && (
                <span className="absolute top-2 right-1/2 translate-x-2 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
