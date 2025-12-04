'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">Erreur de vérification</CardTitle>
        <CardDescription className="text-base">
          {error_description || 'Une erreur est survenue lors de la vérification de votre email'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Que faire ?</p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Le lien de confirmation a peut-être expiré</li>
            <li>Essayez de vous inscrire à nouveau</li>
            <li>Vérifiez que vous avez cliqué sur le bon lien</li>
            <li>Contactez le support si le problème persiste</li>
          </ul>
        </div>

        {error && (
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded border">
            <p className="font-mono">Erreur: {error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/login">Se connecter</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/signup">S&apos;inscrire</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
