'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EmailConfirmedPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/feed');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-4 relative">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <CardTitle className="text-2xl">Email confirmé !</CardTitle>
        <CardDescription className="text-base">
          Votre compte a été activé avec succès
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Bienvenue sur MyWishList ! 🎉
          </p>
          <p className="text-sm font-medium">
            Vous allez être redirigé automatiquement...
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Prochaines étapes:</p>
          <ul className="space-y-1 ml-4">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Complétez votre profil
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Créez votre première wishlist
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Explorez les wishlists de la communauté
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/feed">
            Commencer maintenant
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
