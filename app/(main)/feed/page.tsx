'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import Image from 'next/image';

// Données de démo
const demoWishlists = [
  {
    id: 1,
    user: { name: 'Sophie Martin', username: 'sophie_m', avatar: '' },
    title: 'Mes envies pour Noël 🎄',
    description: 'Quelques idées pour les fêtes !',
    cover: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=300&fit=crop',
    items: 12,
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    user: { name: 'Thomas Dubois', username: 'thomas_d', avatar: '' },
    title: 'Setup Gaming 🎮',
    description: 'Pour améliorer mon setup',
    cover: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=500&fit=crop',
    items: 8,
    likes: 45,
    comments: 12,
  },
  {
    id: 3,
    user: { name: 'Emma Petit', username: 'emma_p', avatar: '' },
    title: 'Décoration appartement 🏠',
    description: 'Idées déco scandinave',
    cover: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop',
    items: 15,
    likes: 67,
    comments: 8,
  },
  {
    id: 4,
    user: { name: 'Lucas Bernard', username: 'lucas_b', avatar: '' },
    title: 'Voyage au Japon 🇯🇵',
    description: 'Souvenirs à ramener',
    cover: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=600&fit=crop',
    items: 20,
    likes: 89,
    comments: 15,
  },
  {
    id: 5,
    user: { name: 'Chloé Laurent', username: 'chloe_l', avatar: '' },
    title: 'Mode Printemps 2024 👗',
    description: 'Nouvelle garde-robe',
    cover: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=350&fit=crop',
    items: 25,
    likes: 102,
    comments: 18,
  },
  {
    id: 6,
    user: { name: 'Antoine Moreau', username: 'antoine_m', avatar: '' },
    title: 'Matériel Photo 📸',
    description: 'Pour la photographie',
    cover: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=450&fit=crop',
    items: 10,
    likes: 56,
    comments: 9,
  },
];

export default function FeedPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header avec filtres */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Découvrir</h1>
          <p className="text-muted-foreground text-sm">
            Les wishlists de la communauté
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Pour vous
          </Button>
          <Button variant="ghost" size="sm">
            Suivis
          </Button>
          <Button variant="ghost" size="sm">
            Populaire
          </Button>
        </div>
      </div>

      {/* Grille Masonry */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {demoWishlists.map((wishlist) => (
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
  );
}
