import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function WishlistsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes Wishlists</h1>
        <Button asChild>
          <Link href="/wishlists/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle liste
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        Créez et gérez vos listes de souhaits pour toutes vos occasions.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6 text-center text-muted-foreground">
          Aucune wishlist pour le moment. Créez-en une !
        </div>
      </div>
    </div>
  );
}
