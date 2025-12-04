'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, Search, Filter, X, User, List, Hash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  'Noël', 'Anniversaire', 'Mariage', 'Naissance', 'Crémaillère',
  'Gaming', 'Mode', 'Tech', 'Déco', 'Sport', 'Voyage', 'Beauté'
];

function SearchContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<'all' | 'users' | 'wishlists'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [results, setResults] = useState<any>({ users: [], wishlists: [] });
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      let usersData = [];
      let wishlistsData = [];

      // Search users
      if (searchType === 'all' || searchType === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .limit(20);
        usersData = users || [];
      }

      // Search wishlists
      if (searchType === 'all' || searchType === 'wishlists') {
        let query = supabase
          .from('wishlists')
          .select(`
            *,
            profile:profiles(username, full_name, avatar_url)
          `)
          .eq('is_public', true);

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        if (selectedCategories.length > 0) {
          query = query.in('category', selectedCategories);
        }

        const { data: wishlists } = await query.limit(50);
        wishlistsData = wishlists || [];
      }

      setResults({ users: usersData, wishlists: wishlistsData });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, searchType, selectedCategories]);

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [searchQuery, performSearch]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher des utilisateurs, wishlists, catégories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Categories */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filtrer par catégorie :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleCategory(category)}
              >
                <Hash className="h-3 w-3 mr-1" />
                {category}
              </Badge>
            ))}
            {selectedCategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategories([])}
                className="h-6"
              >
                Effacer tout
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <Tabs value={searchType} onValueChange={(v) => setSearchType(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            Tout ({results.users.length + results.wishlists.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            <User className="h-4 w-4 mr-2" />
            Utilisateurs ({results.users.length})
          </TabsTrigger>
          <TabsTrigger value="wishlists">
            <List className="h-4 w-4 mr-2" />
            Wishlists ({results.wishlists.length})
          </TabsTrigger>
        </TabsList>

        {/* All Results */}
        <TabsContent value="all" className="space-y-6 mt-6">
          {results.users.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Utilisateurs</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.users.slice(0, 6).map((user: any) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <Link href={`/profile/${user.username}`} className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            {user.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.full_name || user.username}</p>
                          <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.wishlists.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Wishlists</h2>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {results.wishlists.map((wishlist: any) => (
                  <Card key={wishlist.id} className="break-inside-avoid overflow-hidden hover:shadow-lg transition-shadow">
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
                      <div className="flex items-center gap-2 mb-2">
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
                      <h3 className="font-semibold mb-1">{wishlist.title}</h3>
                      {wishlist.category && (
                        <Badge variant="secondary" className="mb-2">
                          <Hash className="h-3 w-3 mr-1" />
                          {wishlist.category}
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {wishlist.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!isLoading && results.users.length === 0 && results.wishlists.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
              <p className="text-muted-foreground">
                Essayez avec d&apos;autres mots-clés ou catégories
              </p>
            </div>
          )}
        </TabsContent>

        {/* Users Only */}
        <TabsContent value="users" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.users.map((user: any) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Link href={`/profile/${user.username}`} className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.full_name || user.username}</p>
                      <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                      {user.bio && (
                        <p className="text-xs text-muted-foreground truncate mt-1">{user.bio}</p>
                      )}
                    </div>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Voir le profil
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Wishlists Only */}
        <TabsContent value="wishlists" className="mt-6">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {results.wishlists.map((wishlist: any) => (
              <Card key={wishlist.id} className="break-inside-avoid overflow-hidden hover:shadow-lg transition-shadow">
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
                  <div className="flex items-center gap-2 mb-2">
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
                  <h3 className="font-semibold mb-1">{wishlist.title}</h3>
                  {wishlist.category && (
                    <Badge variant="secondary" className="mb-2">
                      <Hash className="h-3 w-3 mr-1" />
                      {wishlist.category}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {wishlist.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Créée le {new Date(wishlist.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
