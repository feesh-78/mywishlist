'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2, CheckCircle, PauseCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReactivatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isReactivating, setIsReactivating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      } else {
        router.push('/login');
      }
    }

    checkUser();
  }, [router]);

  async function handleReactivate() {
    if (!userId) return;

    setIsReactivating(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.rpc('reactivate_account', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error reactivating account:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de réactiver le compte.',
        });
        setIsReactivating(false);
        return;
      }

      toast({
        title: 'Compte réactivé !',
        description: 'Bienvenue de retour sur MyWishList.',
      });

      router.push('/feed');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue.',
      });
      setIsReactivating(false);
    }
  }

  if (!userId) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-4">
            <PauseCircle className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">Votre compte est en veille</CardTitle>
        <CardDescription className="text-base">
          Réactivez votre compte pour continuer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
          <p className="text-sm text-muted-foreground">
            Votre compte a été mis en veille. En le réactivant, vous retrouverez:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 mt-2 ml-4 list-disc">
            <li>Accès à toutes vos wishlists</li>
            <li>Votre profil public</li>
            <li>Vos abonnés et abonnements</li>
            <li>Tous vos favoris et likes</li>
          </ul>
        </div>

        <Button onClick={handleReactivate} disabled={isReactivating} className="w-full" size="lg">
          {isReactivating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Réactivation en cours...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Réactiver mon compte
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="text-sm text-muted-foreground text-center">
          {"Vous ne souhaitez pas réactiver votre compte ?"}{' '}
          <Link href="/login" className="text-primary hover:underline">
            Se déconnecter
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
