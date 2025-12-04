'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  async function handleResendEmail() {
    if (!email || !canResend) return;

    setIsResending(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message,
        });
        return;
      }

      toast({
        title: 'Email renvoyé !',
        description: 'Vérifiez votre boîte de réception.',
      });

      setCanResend(false);
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de renvoyer l'email.",
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-blue-100 p-4">
            <Mail className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">Vérifiez votre email</CardTitle>
        <CardDescription className="text-base">
          Un email de confirmation a été envoyé à
          {email && (
            <span className="block font-medium text-foreground mt-1">{email}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Vérifiez votre boîte de réception</p>
              <p className="text-muted-foreground">
                Cliquez sur le lien de confirmation dans l'email pour activer votre compte.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Vérifiez vos spams</p>
              <p className="text-muted-foreground">
                Si vous ne voyez pas l'email, regardez dans votre dossier spam ou courrier indésirable.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground mb-3">
            Vous n'avez pas reçu l'email ?
          </p>
          <Button
            onClick={handleResendEmail}
            disabled={isResending || !canResend}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : canResend ? (
              "Renvoyer l'email"
            ) : (
              `Renvoyer dans ${countdown}s`
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button variant="ghost" asChild className="w-full">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
