'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Users, Share2, Calendar, Heart, Shield, Sparkles, Baby, GraduationCap, Home as HomeIcon, Palmtree, PartyPopper } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Créez et partagez vos wishlists en ligne
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            La plateforme gratuite pour créer vos listes de souhaits et les partager avec vos proches.
            Simplifiez vos cadeaux pour toutes les occasions !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/signup">
                <Gift className="mr-2 h-5 w-5" />
                Créer ma wishlist gratuite
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="#features">
                En savoir plus
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Pourquoi choisir MyWishList ?</h2>
            <p className="text-xl text-muted-foreground">
              Toutes les fonctionnalités pour gérer vos listes de souhaits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Gift className="h-12 w-12 mb-4 text-purple-600" />
                <CardTitle>Wishlists illimitées</CardTitle>
                <CardDescription>
                  Créez autant de wishlists que vous le souhaitez pour chaque occasion
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Share2 className="h-12 w-12 mb-4 text-blue-600" />
                <CardTitle>Partage facile</CardTitle>
                <CardDescription>
                  Partagez vos wishlists avec un simple lien ou QR code
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 mb-4 text-pink-600" />
                <CardTitle>Collaboration</CardTitle>
                <CardDescription>
                  Invitez vos proches à collaborer sur vos wishlists
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 mb-4 text-green-600" />
                <CardTitle>Réservation</CardTitle>
                <CardDescription>
                  Évitez les doublons grâce au système de réservation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-12 w-12 mb-4 text-red-600" />
                <CardTitle>Priorités</CardTitle>
                <CardDescription>
                  Indiquez vos envies les plus importantes avec un système de priorité
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-12 w-12 mb-4 text-yellow-600" />
                <CardTitle>Social</CardTitle>
                <CardDescription>
                  Suivez vos amis, likez et commentez leurs wishlists
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-muted-foreground">
              En 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <CardTitle>Créez votre compte</CardTitle>
                <CardDescription>
                  Inscription gratuite en quelques secondes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <CardTitle>Ajoutez vos envies</CardTitle>
                <CardDescription>
                  Créez vos wishlists et ajoutez les produits que vous désirez
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <CardTitle>Partagez</CardTitle>
                <CardDescription>
                  Envoyez le lien à vos proches et laissez la magie opérer
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Pour toutes les occasions</h2>
            <p className="text-xl text-muted-foreground">
              Créez une wishlist pour chaque moment important de votre vie
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Gift className="h-12 w-12 mx-auto mb-2 text-red-600" />
                <CardTitle>Noël</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <PartyPopper className="h-12 w-12 mx-auto mb-2 text-purple-600" />
                <CardTitle>Anniversaire</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 mx-auto mb-2 text-pink-600" />
                <CardTitle>Mariage</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Baby className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                <CardTitle>Naissance</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <GraduationCap className="h-12 w-12 mx-auto mb-2 text-indigo-600" />
                <CardTitle>Diplôme</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <HomeIcon className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <CardTitle>Pendaison de crémaillère</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Palmtree className="h-12 w-12 mx-auto mb-2 text-teal-600" />
                <CardTitle>Voyage</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 mx-auto mb-2 text-orange-600" />
                <CardTitle>Fête des mères / pères</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à créer votre première wishlist ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers d&apos;utilisateurs qui simplifient leurs cadeaux
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/signup">
                Créer mon compte gratuit
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
              <Link href="/login">
                Se connecter
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">MyWishList</h3>
              <p className="text-muted-foreground">
                La plateforme de wishlist en ligne gratuite pour toutes vos occasions
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/signup" className="hover:text-primary">Créer une wishlist</Link></li>
                <li><Link href="/feed" className="hover:text-primary">Découvrir</Link></li>
                <li><Link href="#features" className="hover:text-primary">Fonctionnalités</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Occasions</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Noël</li>
                <li>Anniversaire</li>
                <li>Mariage</li>
                <li>Naissance</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2024 MyWishList. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
