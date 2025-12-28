'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, Users, Share2, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/settings"
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux paramètres
        </Link>
        <h1 className="text-3xl font-bold mb-2">À propos de MyWishList</h1>
        <p className="text-muted-foreground">
          L&apos;application sociale de listes de souhaits
        </p>
      </div>

      <div className="space-y-6">
        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notre mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              MyWishList est une application conçue pour faciliter le partage de vos envies et
              souhaits avec vos proches. Que ce soit pour un anniversaire, Noël, un mariage ou
              simplement pour garder une trace de vos coups de cœur, MyWishList est là pour vous.
            </p>
            <p className="text-muted-foreground">
              Notre objectif est de rendre le partage de vos listes de souhaits simple,
              intuitif et social, tout en respectant votre vie privée.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités principales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Listes de souhaits illimitées</h3>
                  <p className="text-sm text-muted-foreground">
                    Créez autant de listes que vous le souhaitez pour tous vos événements
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Partage facile</h3>
                  <p className="text-sm text-muted-foreground">
                    Partagez vos listes via un lien, un QR code ou directement sur les réseaux sociaux
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Aspect social</h3>
                  <p className="text-sm text-muted-foreground">
                    Suivez vos amis, découvrez leurs envies et interagissez avec la communauté
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Personnalisation</h3>
                  <p className="text-sm text-muted-foreground">
                    Organisez vos produits par catégories, ajoutez des photos et des descriptions
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version */}
        <Card>
          <CardHeader>
            <CardTitle>Informations techniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">v3.0 - Algorithmes intelligents</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dernière mise à jour</span>
              <span className="font-medium">Décembre 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plateforme</span>
              <span className="font-medium">Web & Android</span>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-4">
          <Button asChild variant="outline">
            <Link href="/feed">Découvrir l&apos;application</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
