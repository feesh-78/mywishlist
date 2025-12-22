'use client';

import { useState } from 'react';
import { Plus, Camera, List, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FAB() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show on create pages or auth pages
  if (
    pathname === '/lists/new' ||
    pathname === '/wishlists/new' ||
    pathname === '/shopping/new' ||
    pathname === '/add-product' ||
    pathname?.includes('/items/new') ||
    pathname?.includes('/edit') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/settings')
  ) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Actions menu */}
      {isOpen && (
        <div className="md:hidden fixed bottom-36 right-4 flex flex-col gap-3 z-40">
          <Link
            href="/add-product"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 bg-background border rounded-full shadow-lg px-4 py-3 hover:bg-accent transition-colors"
          >
            <Camera className="h-5 w-5" />
            <span className="text-sm font-medium">Produit</span>
          </Link>

          <Link
            href="/wishlists/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 bg-background border rounded-full shadow-lg px-4 py-3 hover:bg-accent transition-colors"
          >
            <List className="h-5 w-5" />
            <span className="text-sm font-medium">Wishlist</span>
          </Link>

          <Link
            href="/shopping/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 bg-background border rounded-full shadow-lg px-4 py-3 hover:bg-accent transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-medium">Shopping List</span>
          </Link>
        </div>
      )}

      {/* Main FAB button */}
      <Button
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed bottom-20 right-4 rounded-full shadow-lg h-14 w-14 p-0 z-40 transition-transform ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
}
