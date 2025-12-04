'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FAB() {
  const pathname = usePathname();

  // Don't show on create pages or auth pages
  if (
    pathname === '/lists/new' ||
    pathname === '/wishlists/new' ||
    pathname === '/shopping/new' ||
    pathname?.includes('/items/new') ||
    pathname?.includes('/edit') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/settings')
  ) {
    return null;
  }

  return (
    <Button
      asChild
      size="lg"
      className="md:hidden fixed bottom-20 right-4 rounded-full shadow-lg h-14 w-14 p-0 z-40"
    >
      <Link href="/lists/new" aria-label="Créer une liste">
        <Plus className="h-6 w-6" />
      </Link>
    </Button>
  );
}
