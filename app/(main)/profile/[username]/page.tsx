'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Hash,
  Settings,
  UserPlus,
  UserMinus,
  List,
  ShieldAlert
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const { data: currentUser } = useUser();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);
  const [stats, setStats] = useState({ wishlists: 0, shoppingLists: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.user_metadata?.username === username;
  const defaultTab = searchParams.get('tab') || 'wishlists';

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  async function loadProfile() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (!profileData) {
        return;
      }

      setProfile(profileData);

      // Load wishlists (type = wishlist)
      const { data: wishlistsData } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('is_public', true)
        .eq('list_type', 'wishlist')
        .order('created_at', { ascending: false });

      setWishlists(wishlistsData || []);

      // Load shopping lists (type = shopping_list)
      const { data: shoppingListsData } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('is_public', true)
        .eq('list_type', 'shopping_list')
        .order('created_at', { ascending: false });

      setShoppingLists(shoppingListsData || []);

      // Load stats
      const { count: wishlistCount } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileData.id)
        .eq('is_public', true)
        .eq('list_type', 'wishlist');

      const { count: shoppingListCount } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileData.id)
        .eq('is_public', true)
        .eq('list_type', 'shopping_list');

      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileData.id);

      const { count: followingCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileData.id);

      setStats({
        wishlists: wishlistCount || 0,
        shoppingLists: shoppingListCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0,
      });

      // Check if current user follows this profile
      if (currentUser && !isOwnProfile) {
        const { data: followData } = await supabase
          .from('followers')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileData.id)
          .single();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFollow() {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour suivre un utilisateur.',
      });
      return;
    }

    setIsFollowLoading(true);
    const supabase = createClient();

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);

        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
        toast({
          title: 'Désabonné',
          description: `Vous ne suivez plus @${username}`,
        });
      } else {
        // Follow
        await supabase
          .from('followers')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id,
          });

        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast({
          title: 'Abonné',
          description: `Vous suivez maintenant @${username}`,
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsFollowLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Utilisateur introuvable</h2>
        <p className="text-muted-foreground mb-4">
          Cet utilisateur n&apos;existe pas.
        </p>
        <Button asChild>
          <Link href="/search">Rechercher</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                  {profile.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">
                      {profile.full_name || profile.username}
                    </h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <>
                        <Button variant="outline" asChild>
                          <Link href="/settings">
                            <Settings className="h-4 w-4 mr-2" />
                            Modifier le profil
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/account">
                            <ShieldAlert className="h-4 w-4 mr-2" />
                            Gérer mon compte
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        variant={isFollowing ? 'outline' : 'default'}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Ne plus suivre
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Suivre
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.wishlists}</div>
                    <div className="text-sm text-muted-foreground">Wishlists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.followers}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="wishlists">
            <Heart className="h-4 w-4 mr-2" />
            Wishlists
          </TabsTrigger>
          <TabsTrigger value="shopping">
            <List className="h-4 w-4 mr-2" />
            Mes Achats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wishlists">
          {wishlists.length === 0 ? (
            <div className="text-center py-12">
              <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune wishlist</h3>
              <p className="text-muted-foreground mb-4">
                {isOwnProfile
                  ? 'Créez votre première wishlist !'
                  : `@${username} n'a pas encore créé de wishlist publique.`}
              </p>
              {isOwnProfile && (
                <Button asChild>
                  <Link href="/wishlists/new">Créer une wishlist</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {wishlists.map((wishlist) => (
                <Card
                  key={wishlist.id}
                  className="break-inside-avoid overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Image */}
                  {wishlist.cover_image_url && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={wishlist.cover_image_url}
                        alt={wishlist.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2">{wishlist.title}</h3>
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
                    <p className="text-xs text-muted-foreground">
                      Créée le {new Date(wishlist.created_at).toLocaleDateString('fr-FR')}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Heart className="h-4 w-4 mr-1" />
                          <span className="text-xs">0</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">0</span>
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shopping">
          {shoppingLists.length === 0 ? (
            <div className="text-center py-12">
              <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun achat partagé</h3>
              <p className="text-muted-foreground mb-4">
                {isOwnProfile
                  ? 'Partagez vos achats pour inspirer les autres !'
                  : `@${username} n'a pas encore partagé d'achats.`}
              </p>
              {isOwnProfile && (
                <Button asChild>
                  <Link href="/shopping/new">Partager un achat</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {shoppingLists.map((shopping) => (
                <Card
                  key={shopping.id}
                  className="break-inside-avoid overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Image */}
                  {shopping.cover_image_url && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={shopping.cover_image_url}
                        alt={shopping.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2">{shopping.title}</h3>
                    {shopping.category && (
                      <Badge variant="secondary" className="mb-2">
                        <Hash className="h-3 w-3 mr-1" />
                        {shopping.category}
                      </Badge>
                    )}
                    {shopping.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {shopping.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Acheté le {new Date(shopping.created_at).toLocaleDateString('fr-FR')}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Heart className="h-4 w-4 mr-1" />
                          <span className="text-xs">0</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">0</span>
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
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
