'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/lib/hooks/use-toast';
import { Heart, MessageCircle, Share2, Bookmark, Hash, Star, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function FavorisPage() {
  const { data: currentUser } = useUser();
  const { toast } = useToast();
  const [bookmarkedWishlists, setBookmarkedWishlists] = useState<any[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wishlists' | 'items'>('wishlists');

  useEffect(() => {
    if (currentUser) {
      loadBookmarks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function loadBookmarks() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // Load bookmarked wishlists
      const { data: wishlistBookmarks } = await supabase
        .from('bookmarks')
        .select(`
          *,
          wishlist:wishlists(
            *,
            profile:profiles(id, username, full_name, avatar_url),
            likes:likes(count),
            comments:comments(count)
          )
        `)
        .eq('user_id', currentUser!.id)
        .not('wishlist_id', 'is', null)
        .order('created_at', { ascending: false });

      // Load bookmarked items
      const { data: itemBookmarks } = await supabase
        .from('bookmarks')
        .select(`
          *,
          item:wishlist_items(
            *,
            wishlist:wishlists(
              *,
              profile:profiles(id, username, full_name, avatar_url)
            )
          )
        `)
        .eq('user_id', currentUser!.id)
        .not('item_id', 'is', null)
        .order('created_at', { ascending: false });

      setBookmarkedWishlists(wishlistBookmarks?.map((b) => b.wishlist).filter(Boolean) || []);
      setBookmarkedItems(itemBookmarks?.map((b) => b.item).filter(Boolean) || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveBookmark(wishlistId?: string, itemId?: string) {
    if (!currentUser) return;

    const supabase = createClient();

    try {
      const query = supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', currentUser.id);

      if (wishlistId) {
        await query.eq('wishlist_id', wishlistId);
        setBookmarkedWishlists((prev) => prev.filter((w) => w.id !== wishlistId));
      } else if (itemId) {
        await query.eq('item_id', itemId);
        setBookmarkedItems((prev) => prev.filter((i) => i.id !== itemId));
      }

      toast({
        title: 'Retiré des favoris',
        description: 'L&apos;élément a été retiré de vos favoris.',
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de retirer des favoris.',
      });
    }
  }

  async function handleShare(wishlist: any) {
    const url = `${window.location.origin}/wishlists/${wishlist.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Lien copié',
        description: 'Le lien de la wishlist a été copié dans le presse-papier.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de copier le lien.',
      });
    }
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
        <p className="text-muted-foreground mb-4">
          Vous devez être connecté pour voir vos favoris.
        </p>
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-500" />
          Mes Favoris
        </h1>
        <p className="text-muted-foreground text-sm">
          Retrouvez toutes vos wishlists et objets favoris
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'wishlists' | 'items')} className="mb-6">
        <TabsList>
          <TabsTrigger value="wishlists">
            <Bookmark className="h-4 w-4 mr-2" />
            Wishlists ({bookmarkedWishlists.length})
          </TabsTrigger>
          <TabsTrigger value="items">
            <Package className="h-4 w-4 mr-2" />
            Objets ({bookmarkedItems.length})
          </TabsTrigger>
        </TabsList>

        {/* Wishlists Tab */}
        <TabsContent value="wishlists" className="mt-6">
          {bookmarkedWishlists.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔖</div>
              <h3 className="text-lg font-semibold mb-2">Aucune wishlist en favoris</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des wishlists en favoris pour les retrouver facilement ici
              </p>
              <Button asChild>
                <Link href="/feed">Explorer les wishlists</Link>
              </Button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {bookmarkedWishlists.map((wishlist) => {
                const likesCount = wishlist.likes?.[0]?.count || 0;
                const commentsCount = wishlist.comments?.[0]?.count || 0;

                return (
                  <Card
                    key={wishlist.id}
                    className="break-inside-avoid overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <Link href={`/wishlists/${wishlist.slug}`}>
                      {wishlist.cover_image_url && (
                        <div className="relative aspect-auto overflow-hidden">
                          <Image
                            src={wishlist.cover_image_url}
                            alt={wishlist.title}
                            width={400}
                            height={400}
                            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <CardContent className="p-4">
                      {/* User info */}
                      <Link
                        href={`/profile/${wishlist.profile?.username}`}
                        className="flex items-center gap-2 mb-3 hover:opacity-80"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={wishlist.profile?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                            {wishlist.profile?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {wishlist.profile?.full_name || wishlist.profile?.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{wishlist.profile?.username}
                          </p>
                        </div>
                      </Link>

                      {/* Wishlist info */}
                      <Link href={`/wishlists/${wishlist.slug}`}>
                        <h3 className="font-semibold mb-1 line-clamp-2 hover:text-primary">
                          {wishlist.title}
                        </h3>
                      </Link>
                      {wishlist.category && (
                        <Badge variant="secondary" className="mb-2">
                          <Hash className="h-3 w-3 mr-1" />
                          {wishlist.category}
                        </Badge>
                      )}
                      {wishlist.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {wishlist.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Heart className="h-4 w-4" />
                            <span>{likesCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            <span>{commentsCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleShare(wishlist)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveBookmark(wishlist.id)}
                          >
                            <Bookmark className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="mt-6">
          {bookmarkedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2">Aucun objet en favoris</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des objets en favoris pour les retrouver facilement ici
              </p>
              <Button asChild>
                <Link href="/feed">Explorer les wishlists</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  {item.image_url && (
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Price & Priority */}
                    <div className="flex items-center justify-between mb-3">
                      {item.price && (
                        <span className="text-lg font-bold text-primary">
                          {item.price.toFixed(2)} {item.currency}
                        </span>
                      )}
                      <div className="flex gap-1">
                        {Array.from({ length: item.priority || 0 }).map((_, i) => (
                          <Heart key={i} className="h-3 w-3 fill-red-500 text-red-500" />
                        ))}
                      </div>
                    </div>

                    {/* Wishlist info */}
                    {item.wishlist && (
                      <Link
                        href={`/wishlists/${item.wishlist.slug}`}
                        className="text-xs text-muted-foreground hover:text-primary mb-3 block"
                      >
                        De la wishlist: {item.wishlist.title}
                      </Link>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {item.url && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            Voir le produit
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveBookmark(undefined, item.id)}
                      >
                        <Bookmark className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
