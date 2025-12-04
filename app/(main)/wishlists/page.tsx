'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Heart, Hash, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';

export default function WishlistsPage() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadWishlists() {
    if (!user) return;

    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('list_type', 'wishlist')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading wishlists:', error);
        return;
      }

      setWishlists(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette wishlist ?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer la wishlist.',
      });
      return;
    }

    toast({
      title: 'Wishlist supprimée',
      description: 'La wishlist a été supprimée avec succès.',
    });

    loadWishlists();
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
        <p className="text-muted-foreground mb-4">
          Connectez-vous pour voir vos wishlists.
        </p>
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Wishlists</h1>
          <p className="text-muted-foreground mt-1">
            {wishlists.length} wishlist{wishlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/lists/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle liste
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-6 animate-pulse">
              <div className="h-40 bg-muted rounded mb-4"></div>
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : wishlists.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune wishlist</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première wishlist pour commencer !
            </p>
            <Button asChild>
              <Link href="/lists/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer une liste
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishlists.map((wishlist) => (
            <Card key={wishlist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {wishlist.cover_image_url && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={wishlist.cover_image_url}
                    alt={wishlist.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 line-clamp-1">{wishlist.title}</h3>
                {wishlist.category && (
                  <Badge variant="secondary" className="mb-2">
                    <Hash className="h-3 w-3 mr-1" />
                    {wishlist.category}
                  </Badge>
                )}
                {wishlist.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {wishlist.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/wishlists/${wishlist.slug}`}>
                      <Heart className="h-4 w-4 mr-2" />
                      Voir
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/wishlists/${wishlist.slug}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(wishlist.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
