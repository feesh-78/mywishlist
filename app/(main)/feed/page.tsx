'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, Hash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function FeedPage() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWishlists();
  }, []);

  async function loadWishlists() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          profile:profiles(id, username, full_name, avatar_url),
          items:wishlist_items(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

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
        <h1 className="text-2xl font-bold mb-1">Découvrir</h1>
        <p className="text-muted-foreground text-sm">
          Les wishlists de la communauté
        </p>
      </div>

      {/* Empty state */}
      {wishlists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎁</div>
          <h3 className="text-lg font-semibold mb-2">Aucune wishlist pour le moment</h3>
          <p className="text-muted-foreground mb-4">
            Soyez le premier à créer une wishlist !
          </p>
          <Button asChild>
            <Link href="/wishlists/new">Créer une wishlist</Link>
          </Button>
        </div>
      ) : (
        /* Grille Masonry */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {wishlists.map((wishlist) => (
            <Link href={`/wishlists/${wishlist.slug}`} key={wishlist.id}>
              <Card className="break-inside-avoid overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                {/* Image */}
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

                {/* Content */}
                <CardContent className="p-4">
                  {/* User info */}
                  <Link
                    href={`/profile/${wishlist.profile?.username}`}
                    className="flex items-center gap-2 mb-3 hover:opacity-80"
                    onClick={(e) => e.stopPropagation()}
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
                  <h3 className="font-semibold mb-1 line-clamp-2">{wishlist.title}</h3>
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
                  <p className="text-xs text-muted-foreground mb-3">
                    {wishlist.items?.[0]?.count || 0} articles
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        <span className="text-xs">0</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">0</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
