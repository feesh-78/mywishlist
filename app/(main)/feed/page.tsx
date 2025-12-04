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
import { Heart, MessageCircle, Share2, Bookmark, Hash, TrendingUp, Users, ShoppingBag, Gift, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { WishlistSkeletonGrid } from '@/components/skeletons/wishlist-skeleton';

type FeedType = 'all' | 'following' | 'popular';

export default function FeedPage() {
  const { data: currentUser } = useUser();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedType, setFeedType] = useState<FeedType>('all');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
    loadCategories();
    if (currentUser) {
      loadLikedItems();
      loadBookmarkedItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedType, currentUser, selectedCategory]);

  async function loadLikedItems() {
    if (!currentUser) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('likes')
      .select('entity_id')
      .eq('user_id', currentUser.id)
      .eq('entity_type', 'item');

    if (data) {
      setLikedItems(new Set(data.map((like) => like.entity_id)));
    }
  }

  async function loadBookmarkedItems() {
    if (!currentUser) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('bookmarks')
      .select('item_id')
      .eq('user_id', currentUser.id)
      .not('item_id', 'is', null);

    if (data) {
      setBookmarkedItems(new Set(data.map((bookmark) => bookmark.item_id)));
    }
  }

  async function loadCategories() {
    const supabase = createClient();
    const { data } = await supabase
      .from('wishlists')
      .select('category')
      .eq('is_public', true)
      .not('category', 'is', null);

    if (data) {
      // Get unique categories
      const uniqueCategories = Array.from(new Set(data.map((w) => w.category).filter(Boolean)));
      setCategories(uniqueCategories as string[]);
    }
  }

  async function loadItems() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // First, get list of wishlists to filter items from
      let wishlistIds: string[] = [];

      if (feedType === 'following' && currentUser) {
        // Get followed users
        const { data: followedUsers } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUser.id);

        if (!followedUsers || followedUsers.length === 0) {
          setItems([]);
          setIsLoading(false);
          return;
        }

        const followedIds = followedUsers.map((f) => f.following_id);

        // Get wishlists from followed users
        const { data: wishlists } = await supabase
          .from('wishlists')
          .select('id')
          .in('user_id', followedIds)
          .eq('is_public', true);

        wishlistIds = wishlists?.map((w) => w.id) || [];

        if (wishlistIds.length === 0) {
          setItems([]);
          setIsLoading(false);
          return;
        }
      }

      // Build query for items
      let query = supabase
        .from('wishlist_items')
        .select(`
          *,
          wishlist:wishlists!inner(
            id,
            title,
            slug,
            category,
            user_id,
            is_public,
            list_type,
            profile:profiles(id, username, full_name, avatar_url)
          )
        `);

      // Filter by public wishlists
      query = query.eq('wishlist.is_public', true);

      // Filter by followed users if needed
      if (feedType === 'following' && wishlistIds.length > 0) {
        query = query.in('wishlist_id', wishlistIds);
      }

      // Filter by category if selected
      if (selectedCategory) {
        query = query.eq('wishlist.category', selectedCategory);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading items:', error);
        return;
      }

      let itemsData = data || [];

      // Sort by popularity if needed (based on price as a simple metric for now)
      if (feedType === 'popular') {
        itemsData = itemsData.sort((a, b) => {
          // You can implement a more sophisticated popularity metric later
          return (b.price || 0) - (a.price || 0);
        });
      }

      setItems(itemsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLike(itemId: string, isLiked: boolean) {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour liker un produit.',
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
          .eq('entity_id', itemId)
          .eq('entity_type', 'item');

        setLikedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } else {
        // Like
        await supabase.from('likes').insert({
          user_id: currentUser.id,
          entity_id: itemId,
          entity_type: 'item',
        });

        setLikedItems((prev) => new Set(prev).add(itemId));
      }
    } catch (error) {
      console.error('Error liking item:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de liker ce produit.',
      });
    }
  }

  async function handleShare(item: any) {
    const url = item.url || `${window.location.origin}/wishlists/${item.wishlist.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Lien copié',
        description: 'Le lien du produit a été copié dans le presse-papier.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de copier le lien.',
      });
    }
  }

  async function handleBookmark(itemId: string, isBookmarked: boolean) {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour ajouter un produit en favoris.',
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
          .eq('item_id', itemId);

        setBookmarkedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });

        toast({
          title: 'Retiré des favoris',
          description: 'Le produit a été retiré de vos favoris.',
        });
      } else {
        // Add bookmark
        await supabase.from('bookmarks').insert({
          user_id: currentUser.id,
          wishlist_id: null,
          item_id: itemId,
        });

        setBookmarkedItems((prev) => new Set(prev).add(itemId));

        toast({
          title: 'Ajouté aux favoris',
          description: 'Le produit a été ajouté à vos favoris.',
        });
      }
    } catch (error) {
      console.error('Error bookmarking item:', error);
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
          Les produits et achats de la communauté
        </p>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategory(null)}
            >
              Toutes les catégories
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                <Hash className="h-3 w-3 mr-1" />
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

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
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">
                {feedType === 'following' ? '👥' : '🛍️'}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {feedType === 'following'
                  ? 'Aucun produit de vos abonnements'
                  : 'Aucun produit pour le moment'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {feedType === 'following'
                  ? 'Suivez des utilisateurs pour voir leurs produits ici !'
                  : 'Soyez le premier à partager un produit !'}
              </p>
              <Button asChild>
                <Link href={feedType === 'following' ? '/search?type=users' : '/lists/new'}>
                  {feedType === 'following' ? 'Trouver des utilisateurs' : 'Créer une liste'}
                </Link>
              </Button>
            </div>
          ) : (
            /* Grille Masonry Pinterest-style */
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {items.map((item) => {
                const isLiked = likedItems.has(item.id);
                const isBookmarked = bookmarkedItems.has(item.id);
                const listType = item.wishlist?.list_type || 'wishlist';
                const isShoppingItem = listType === 'shopping_list';

                return (
                  <Card
                    key={item.id}
                    className="break-inside-avoid overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {/* Image */}
                    {item.image_url && (
                      <div className="relative aspect-auto overflow-hidden">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          width={400}
                          height={400}
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Type badge overlay */}
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={isShoppingItem ? 'default' : 'secondary'}
                            className={isShoppingItem ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {isShoppingItem ? (
                              <>
                                <ShoppingBag className="h-3 w-3 mr-1" />
                                Acheté
                              </>
                            ) : (
                              <>
                                <Gift className="h-3 w-3 mr-1" />
                                Envie
                              </>
                            )}
                          </Badge>
                        </div>
                        {/* Price overlay */}
                        {item.price && (
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-black/70 hover:bg-black/80 text-white">
                              {item.price} {item.currency}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <CardContent className="p-4">
                      {/* User info */}
                      <Link
                        href={`/profile/${item.wishlist?.profile?.username}`}
                        className="flex items-center gap-2 mb-3 hover:opacity-80"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={item.wishlist?.profile?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                            {item.wishlist?.profile?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {item.wishlist?.profile?.full_name || item.wishlist?.profile?.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{item.wishlist?.profile?.username}
                          </p>
                        </div>
                      </Link>

                      {/* Item info */}
                      <h3 className="font-semibold mb-1 line-clamp-2 text-sm">
                        {item.title}
                      </h3>

                      {/* Collection/Category */}
                      {item.wishlist?.category && (
                        <Link href={`/wishlists/${item.wishlist.slug}`}>
                          <Badge variant="outline" className="mb-2 text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {item.wishlist.category}
                          </Badge>
                        </Link>
                      )}

                      {item.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleLike(item.id, isLiked)}
                          >
                            <Heart
                              className={`h-3 w-3 mr-1 ${
                                isLiked ? 'fill-red-500 text-red-500' : ''
                              }`}
                            />
                          </Button>
                          {item.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              asChild
                            >
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleShare(item)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleBookmark(item.id, isBookmarked)}
                          >
                            <Bookmark
                              className={`h-3 w-3 ${
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
