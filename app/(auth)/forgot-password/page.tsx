'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      setEmailSent(true);
      toast({
        title: 'Email envoyé !',
        description: 'Vérifiez votre boîte de réception.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-4">
              <Mail className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Email envoyé !</CardTitle>
          <CardDescription className="text-base">
            Vérifiez votre boîte de réception
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm">
            <p className="mb-2">
              Un email contenant un lien de réinitialisation a été envoyé à:
            </p>
            <p className="font-medium text-foreground">{form.getValues('email')}</p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Instructions:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Vérifiez votre boîte de réception (et spam)</li>
              <li>{"Cliquez sur le lien dans l'email"}</li>
              <li>Créez un nouveau mot de passe</li>
            </ol>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Le lien expire dans 1 heure
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Retour à la connexion</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="mb-4">
          <Link
            href="/login"
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
        </div>
        <CardTitle>Mot de passe oublié ?</CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="vous@exemple.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le lien
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="text-sm text-muted-foreground text-center">
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
