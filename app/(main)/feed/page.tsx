'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { useAuthDialog } from '@/lib/hooks/use-auth-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/lib/hooks/use-toast';
import { Heart, MessageCircle, Share2, Bookmark, Hash, TrendingUp, Users, ShoppingBag, Gift, ExternalLink, Grid3x3, List } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { WishlistSkeletonGrid } from '@/components/skeletons/wishlist-skeleton';
import { getPopularityStats, getUserPreferences, mixFeedSources, sortByPopularity } from '@/lib/utils/popularity';
import { useItemViewTrackerBatch } from '@/lib/hooks/use-item-view-tracker';

type FeedType = 'all' | 'following' | 'popular';
type ContentType = 'wishlists' | 'products'; // Nouveau

export default function FeedPage() {
  const { data: currentUser } = useUser();
  const { toast } = useToast();
  const { openDialog } = useAuthDialog();
  const [items, setItems] = useState<any[]>([]);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedType, setFeedType] = useState<FeedType>('all');
  const [contentType, setContentType] = useState<ContentType>('products'); // Par défaut produits
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Hook pour tracker les vues des produits
  const getViewRef = useItemViewTrackerBatch(items, currentUser?.id);

  useEffect(() => {
    if (contentType === 'products') {
      loadItems();
    } else {
      loadWishlists();
    }
    loadCategories();
    if (currentUser) {
      loadLikedItems();
      loadBookmarkedItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedType, currentUser, selectedCategory, contentType]);

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

  async function loadWishlists() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      let query = supabase
        .from('wishlists')
        .select(`
          *,
          profile:profiles(id, username, full_name, avatar_url),
          items:wishlist_items(count)
        `)
        .eq('is_public', true);

      // Filter by category if selected
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      // Filter by following
      if (feedType === 'following' && currentUser) {
        const { data: followedUsers } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUser.id);

        if (followedUsers && followedUsers.length > 0) {
          const followedIds = followedUsers.map((f) => f.following_id);
          query = query.in('user_id', followedIds);
        } else {
          setWishlists([]);
          setIsLoading(false);
          return;
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading wishlists:', error);
        return;
      }

      // Filter out wishlists with 0 items from feed
      const wishlistsWithItems = (data || []).filter((wishlist: any) => {
        const itemCount = Array.isArray(wishlist.items) ? wishlist.items.length : 0;
        return itemCount > 0;
      });

      setWishlists(wishlistsWithItems);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadItems() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      let allItems: any[] = [];

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

      // Build query for PUBLIC items from community
      let publicQuery = supabase
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
        `)
        .eq('wishlist.is_public', true);

      // Filter by followed users if needed
      if (feedType === 'following' && wishlistIds.length > 0) {
        publicQuery = publicQuery.in('wishlist_id', wishlistIds);
      }

      // Filter by category if selected
      if (selectedCategory) {
        publicQuery = publicQuery.eq('wishlist.category', selectedCategory);
      }

      const { data: publicData, error: publicError } = await publicQuery
        .order('created_at', { ascending: false })
        .limit(100);

      if (publicError) {
        console.error('Error loading public items:', publicError);
      } else {
        allItems = publicData || [];
      }

      // Also load user's OWN items (public AND private)
      if (currentUser) {
        const { data: userWishlists } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', currentUser.id);

        if (userWishlists && userWishlists.length > 0) {
          const userWishlistIds = userWishlists.map((w) => w.id);

          let userItemsQuery = supabase
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
            `)
            .in('wishlist_id', userWishlistIds);

          // Filter by category if selected
          if (selectedCategory) {
            userItemsQuery = userItemsQuery.eq('wishlist.category', selectedCategory);
          }

          const { data: userData, error: userError } = await userItemsQuery
            .order('created_at', { ascending: false });

          if (!userError && userData) {
            // Merge user items with public items, avoiding duplicates
            const publicItemIds = new Set(allItems.map((item) => item.id));
            const uniqueUserItems = userData.filter((item) => !publicItemIds.has(item.id));
            allItems = [...uniqueUserItems, ...allItems];
          }
        }
      }

      // Charger les statistiques de popularité pour tous les items
      if (allItems.length > 0) {
        const itemIds = allItems.map((item) => item.id);
        const popularityStats = await getPopularityStats(itemIds);

        // Ajouter le score de popularité à chaque item
        allItems = allItems.map((item) => {
          const stats = popularityStats.get(item.id);
          return {
            ...item,
            popularity_score: stats?.popularity_score || 0,
            likes_count: stats?.likes_count || 0,
            bookmarks_count: stats?.bookmarks_count || 0,
            views_count: stats?.views_count || 0,
          };
        });
      }

      // Algorithme de tri selon le feedType
      if (feedType === 'popular') {
        // Tri par score de popularité
        allItems = sortByPopularity(allItems, true);
      } else if (feedType === 'all' && currentUser) {
        // "Pour vous" - Feed personnalisé avec mélange intelligent
        try {
          // 1. Obtenir les préférences de l'utilisateur
          const userPrefs = await getUserPreferences(currentUser.id);
          const preferredCategories = userPrefs.slice(0, 3).map((p) => p.category);

          // 2. Séparer les items en différentes sources
          const recentItems = [...allItems].slice(0, 50); // 50 items les plus récents
          const popularItems = sortByPopularity([...allItems], true).slice(0, 50); // 50 items les plus populaires

          // Items dans les catégories préférées de l'utilisateur
          const personalizedItems =
            preferredCategories.length > 0
              ? allItems.filter((item) =>
                  preferredCategories.includes(item.wishlist?.category)
                )
              : [];

          // 3. Mélanger intelligemment les sources
          // Poids: Personnalisé (40%), Populaire (35%), Récent (25%)
          if (personalizedItems.length > 0) {
            allItems = mixFeedSources(
              [personalizedItems, popularItems, recentItems],
              [0.4, 0.35, 0.25],
              100
            );
          } else {
            // Pas assez de données pour personnaliser, mélanger populaire et récent
            allItems = mixFeedSources(
              [popularItems, recentItems],
              [0.6, 0.4],
              100
            );
          }
        } catch (error) {
          console.error('Error personalizing feed:', error);
          // En cas d'erreur, garder le tri chronologique par défaut
        }
      }
      // Sinon (feedType === 'following'), garder le tri chronologique

      setItems(allItems);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLike(itemId: string, isLiked: boolean) {
    if (!currentUser) {
      openDialog('like');
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
      openDialog('like');
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
          Les produits et wishlists de la communauté
        </p>
      </div>

      {/* Content Type Selector */}
      <div className="mb-4">
        <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
          <TabsList>
            <TabsTrigger value="products">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="wishlists">
              <List className="h-4 w-4 mr-2" />
              Wishlists
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
          {/* Products View */}
          {contentType === 'products' && (
            <>
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
                    <Link href={feedType === 'following' ? '/search?type=users' : '/add-product'}>
                      {feedType === 'following' ? 'Trouver des utilisateurs' : 'Ajouter un produit'}
                    </Link>
                  </Button>
                </div>
              ) : (
                /* Grille 3 colonnes */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => {
                    const isLiked = likedItems.has(item.id);
                    const isBookmarked = bookmarkedItems.has(item.id);
                    const listType = item.wishlist?.list_type || 'wishlist';
                    const isShoppingItem = listType === 'shopping_list';

                    return (
                      <Card
                        key={item.id}
                        ref={getViewRef(item.id)}
                        className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
                      >
                        {/* Image */}
                        {item.image_url && (
                          <div className="relative aspect-square overflow-hidden">
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              width={400}
                              height={400}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                        <CardContent className="p-4 flex-1 flex flex-col">
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
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                              {item.description}
                            </p>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-auto">
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
            </>
          )}

          {/* Wishlists View */}
          {contentType === 'wishlists' && (
            <>
              {wishlists.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">Aucune wishlist pour le moment</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez votre première wishlist !
                  </p>
                  <Button asChild>
                    <Link href="/wishlists/new">Créer une wishlist</Link>
                  </Button>
                </div>
              ) : (
                /* Grille 3 colonnes pour wishlists */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlists.map((wishlist) => {
                    const itemCount = Array.isArray(wishlist.items) ? wishlist.items.length : 0;

                    return (
                      <Link key={wishlist.id} href={`/wishlists/${wishlist.slug}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">{wishlist.title}</h3>
                            {wishlist.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {wishlist.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              {wishlist.category && (
                                <Badge variant="outline">
                                  <Hash className="h-3 w-3 mr-1" />
                                  {wishlist.category}
                                </Badge>
                              )}
                              <Badge variant="secondary">
                                <Gift className="h-3 w-3 mr-1" />
                                {itemCount} {itemCount > 1 ? 'produits' : 'produit'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={wishlist.profile?.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                                  {wishlist.profile?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                @{wishlist.profile?.username}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
