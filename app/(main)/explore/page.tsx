'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, Hash, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const trendingCategories = [
  { name: 'Noël', count: 1234, icon: '🎄' },
  { name: 'Tech', count: 892, icon: '💻' },
  { name: 'Gaming', count: 756, icon: '🎮' },
  { name: 'Mode', count: 645, icon: '👗' },
  { name: 'Déco', count: 534, icon: '🏠' },
  { name: 'Voyage', count: 423, icon: '✈️' },
  { name: 'Sport', count: 389, icon: '⚽' },
  { name: 'Beauté', count: 312, icon: '💄' },
];

const featuredWishlists = [
  {
    id: 1,
    user: { name: 'Marie Laurent', username: 'marie_l', avatar: '' },
    title: 'Setup Bureau Parfait 💼',
    description: 'Tous les essentiels pour un espace de travail productif',
    cover: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=500&fit=crop',
    category: 'Tech',
    items: 18,
    likes: 156,
    comments: 23,
  },
  {
    id: 2,
    user: { name: 'Alex Martin', username: 'alex_m', avatar: '' },
    title: 'Voyager au Japon 🇯🇵',
    description: 'Mes indispensables pour un voyage inoubliable',
    cover: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=600&fit=crop',
    category: 'Voyage',
    items: 25,
    likes: 234,
    comments: 45,
  },
  {
    id: 3,
    user: { name: 'Léa Dubois', username: 'lea_d', avatar: '' },
    title: 'Routine Beauté Coréenne ✨',
    description: 'Les meilleurs produits K-Beauty',
    cover: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    category: 'Beauté',
    items: 15,
    likes: 189,
    comments: 34,
  },
  {
    id: 4,
    user: { name: 'Thomas Petit', username: 'thomas_p', avatar: '' },
    title: 'Battle Station 2024 🎮',
    description: 'Setup gaming ultime',
    cover: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=450&fit=crop',
    category: 'Gaming',
    items: 22,
    likes: 312,
    comments: 56,
  },
  {
    id: 5,
    user: { name: 'Emma Bernard', username: 'emma_b', avatar: '' },
    title: 'Garde-robe Minimaliste 🤍',
    description: 'L\'essentiel pour un dressing parfait',
    cover: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=350&fit=crop',
    category: 'Mode',
    items: 30,
    likes: 267,
    comments: 41,
  },
  {
    id: 6,
    user: { name: 'Lucas Moreau', username: 'lucas_m', avatar: '' },
    title: 'Home Gym Complet 💪',
    description: 'Équipement pour s\'entraîner à la maison',
    cover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop',
    category: 'Sport',
    items: 12,
    likes: 198,
    comments: 28,
  },
];

export default function ExplorePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Trending Categories */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Catégories Tendances</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {trendingCategories.map((category) => (
            <Link
              key={category.name}
              href={`/search?category=${encodeURIComponent(category.name)}`}
            >
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-semibold mb-1">{category.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {category.count} wishlists
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Wishlists */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Wishlists à la Une ⭐</h2>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {featuredWishlists.map((wishlist) => (
            <Card key={wishlist.id} className="break-inside-avoid overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              {/* Image */}
              <div className="relative aspect-auto overflow-hidden">
                <Image
                  src={wishlist.cover}
                  alt={wishlist.title}
                  width={400}
                  height={400}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <CardContent className="p-4">
                {/* User info */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={wishlist.user.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                      {wishlist.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{wishlist.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{wishlist.user.username}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                    Suivre
                  </Button>
                </div>

                {/* Wishlist info */}
                <h3 className="font-semibold mb-1 line-clamp-2">{wishlist.title}</h3>
                <Badge variant="secondary" className="mb-2">
                  <Hash className="h-3 w-3 mr-1" />
                  {wishlist.category}
                </Badge>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {wishlist.description}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {wishlist.items} articles
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Heart className="h-4 w-4 mr-1" />
                      <span className="text-xs">{wishlist.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">{wishlist.comments}</span>
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
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="font-semibold mb-2">Créer ma wishlist</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Partagez vos envies avec vos proches
            </p>
            <Button asChild className="w-full">
              <Link href="/wishlists/new">Commencer</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-semibold mb-2">Trouver des amis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Découvrez les wishlists de vos amis
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/search?type=users">Explorer</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">💡</div>
            <h3 className="font-semibold mb-2">Codes de parrainage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Partagez vos codes promo préférés
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/referrals">Découvrir</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
