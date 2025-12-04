'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NewListChoicePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Créer une nouvelle liste</h1>
        <p className="text-muted-foreground">
          Choisissez le type de liste que vous souhaitez créer
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Wishlist Card */}
        <Link href="/wishlists/new" className="block group">
          <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-primary">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 w-fit">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl">Wishlist</CardTitle>
              <CardDescription className="text-base">
                Liste de souhaits pour vos envies
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <p className="text-sm text-muted-foreground mb-6">
                Créez une liste de vos envies pour un anniversaire, Noël, un mariage ou toute autre occasion spéciale. Partagez-la avec vos proches pour qu&apos;ils sachent quoi vous offrir.
              </p>
              <div className="flex items-center justify-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                <span>Créer une wishlist</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Shopping List Card */}
        <Link href="/shopping/new" className="block group">
          <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-primary">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-6 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 w-fit">
                <ShoppingBag className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl">Shopping List</CardTitle>
              <CardDescription className="text-base">
                Partagez vos achats et recommandations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <p className="text-sm text-muted-foreground mb-6">
                Partagez tout ce que vous avez acheté pour inspirer les autres. Recommandez vos coups de cœur et aidez votre communauté à faire les meilleurs choix.
              </p>
              <div className="flex items-center justify-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                <span>Créer une shopping list</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
