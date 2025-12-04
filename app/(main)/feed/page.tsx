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
import { Heart, MessageCircle, Share2, Bookmark, Hash, TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { WishlistSkeletonGrid } from '@/components/skeletons/wishlist-skeleton';

type FeedType = 'all' | 'following' | 'popular';

export default function FeedPage() {
  const { data: currentUser } = useUser();
  const { toast } = useToast();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedType, setFeedType] = useState<FeedType>('all');
  const [likedWishlists, setLikedWishlists] = useState<Set<string>>(new Set());
  const [bookmarkedWishlists, setBookmarkedWishlists] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWishlists();
    if (currentUser) {
      loadLikedWishlists();
      loadBookmarkedWishlists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedType, currentUser]);

  async function loadLikedWishlists() {
    if (!currentUser) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('likes')
      .select('wishlist_id')
      .eq('user_id', currentUser.id);

    if (data) {
      setLikedWishlists(new Set(data.map((like) => like.wishlist_id)));
    }
  }

  async function loadBookmarkedWishlists() {
    if (!currentUser) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('bookmarks')
      .select('wishlist_id')
      .eq('user_id', currentUser.id)
      .not('wishlist_id', 'is', null);

    if (data) {
      setBookmarkedWishlists(new Set(data.map((bookmark) => bookmark.wishlist_id)));
    }
  }

  async function loadWishlists() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      let query = supabase
        .from('wishlists')
        .select(`
          *,
          profile:profiles(id, username, full_name, avatar_url),
          likes:likes(count),
          comments:comments(count)
        `)
        .eq('is_public', true);

      if (feedType === 'following' && currentUser) {
        // Get followed users
        const { data: followedUsers } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUser.id);

        if (!followedUsers || followedUsers.length === 0) {
          setWishlists([]);
          setIsLoading(false);
          return;
        }

        const followedIds = followedUsers.map((f) => f.following_id);
        query = query.in('user_id', followedIds);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading wishlists:', error);
        return;
      }

      let wishlistsData = data || [];

      // Sort by popularity if needed
      if (feedType === 'popular') {
        wishlistsData = wishlistsData.sort((a, b) => {
          const aLikes = a.likes?.[0]?.count || 0;
          const bLikes = b.likes?.[0]?.count || 0;
          return bLikes - aLikes;
        });
      }

      setWishlists(wishlistsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLike(wishlistId: string, isLiked: boolean) {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour liker une wishlist.',
      });
      return;
    }

    const supabase = createClient();

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('wishlist_id', wishlistId);

        setLikedWishlists((prev) => {
          const newSet = new Set(prev);
          newSet.delete(wishlistId);
          return newSet;
        });

        // Update local count
        setWishlists((prev) =>
          prev.map((w) =>
            w.id === wishlistId
              ? {
                  ...w,
                  likes: [{ count: Math.max(0, (w.likes?.[0]?.count || 1) - 1) }],
                }
              : w
          )
        );
      } else {
        // Like
        await supabase.from('likes').insert({
          user_id: currentUser.id,
          wishlist_id: wishlistId,
        });

        setLikedWishlists((prev) => new Set(prev).add(wishlistId));

        // Update local count
        setWishlists((prev) =>
          prev.map((w) =>
            w.id === wishlistId
              ? {
                  ...w,
                  likes: [{ count: (w.likes?.[0]?.count || 0) + 1 }],
                }
              : w
          )
        );
      }
    } catch (error) {
      console.error('Error liking wishlist:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de liker cette wishlist.',
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

  async function handleBookmark(wishlistId: string, isBookmarked: boolean) {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour ajouter une wishlist en favoris.',
      });
      return;
    }

    const supabase = createClient();

    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('wishlist_id', wishlistId);

        setBookmarkedWishlists((prev) => {
          const newSet = new Set(prev);
          newSet.delete(wishlistId);
          return newSet;
        });

        toast({
          title: 'Retiré des favoris',
          description: 'La wishlist a été retirée de vos favoris.',
        });
      } else {
        // Add bookmark
        await supabase.from('bookmarks').insert({
          user_id: currentUser.id,
          wishlist_id: wishlistId,
          item_id: null,
        });

        setBookmarkedWishlists((prev) => new Set(prev).add(wishlistId));

        toast({
          title: 'Ajouté aux favoris',
          description: 'La wishlist a été ajoutée à vos favoris.',
        });
      }
    } catch (error) {
      console.error('Error bookmarking wishlist:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier les favoris.',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Découvrir</h1>
          <p className="text-muted-foreground text-sm">
            Les wishlists de la communauté
          </p>
        </div>
        <WishlistSkeletonGrid count={6} />
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

      {/* Tabs */}
      <Tabs value={feedType} onValueChange={(v) => setFeedType(v as FeedType)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Pour vous</TabsTrigger>
          <TabsTrigger value="following">
            <Users className="h-4 w-4 mr-2" />
            Suivis
          </TabsTrigger>
          <TabsTrigger value="popular">
            <TrendingUp className="h-4 w-4 mr-2" />
            Populaires
          </TabsTrigger>
        </TabsList>

        <TabsContent value={feedType} className="mt-6">
          {/* Empty state */}
          {wishlists.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">
                {feedType === 'following' ? '👥' : '🎁'}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {feedType === 'following'
                  ? 'Aucune wishlist de vos abonnements'
                  : 'Aucune wishlist pour le moment'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {feedType === 'following'
                  ? 'Suivez des utilisateurs pour voir leurs wishlists ici !'
                  : 'Soyez le premier à créer une wishlist !'}
              </p>
              <Button asChild>
                <Link href={feedType === 'following' ? '/search?type=users' : '/wishlists/new'}>
                  {feedType === 'following' ? 'Trouver des utilisateurs' : 'Créer une wishlist'}
                </Link>
              </Button>
            </div>
          ) : (
            /* Grille Masonry */
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {wishlists.map((wishlist) => {
                const isLiked = likedWishlists.has(wishlist.id);
                const isBookmarked = bookmarkedWishlists.has(wishlist.id);
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleLike(wishlist.id, isLiked)}
                          >
                            <Heart
                              className={`h-4 w-4 mr-1 ${
                                isLiked ? 'fill-red-500 text-red-500' : ''
                              }`}
                            />
                            <span className="text-xs">{likesCount}</span>
                          </Button>
                          <Link href={`/wishlists/${wishlist.slug}#comments`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              <span className="text-xs">{commentsCount}</span>
                            </Button>
                          </Link>
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
                            onClick={() => handleBookmark(wishlist.id, isBookmarked)}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${
                                isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''
                              }`}
                            />
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
      </Tabs>
    </div>
  );
}
