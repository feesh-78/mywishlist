'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2, PauseCircle, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AccountManagementProps {
  userId: string;
}

export function AccountManagement({ userId }: AccountManagementProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  async function handleDeactivateAccount() {
    setIsDeactivating(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.rpc('deactivate_account', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error deactivating account:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de désactiver le compte.',
        });
        setIsDeactivating(false);
        return;
      }

      // Sign out
      await supabase.auth.signOut();

      toast({
        title: 'Compte désactivé',
        description: 'Votre compte a été mis en veille. Vous pouvez le réactiver à tout moment en vous reconnectant.',
      });

      router.push('/login');
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue.',
      });
      setIsDeactivating(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== 'SUPPRIMER') {
      toast({
        variant: 'destructive',
        title: 'Confirmation incorrecte',
        description: 'Veuillez taper "SUPPRIMER" pour confirmer.',
      });
      return;
    }

    setIsDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.rpc('delete_account', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error deleting account:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de supprimer le compte.',
        });
        setIsDeleting(false);
        return;
      }

      // Sign out
      await supabase.auth.signOut();

      toast({
        title: 'Compte supprimé',
        description: 'Votre compte et toutes vos données ont été supprimés définitivement.',
      });

      router.push('/signup');
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue.',
      });
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Deactivate Account */}
      <Card className="border-orange-200 dark:border-orange-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PauseCircle className="h-5 w-5 text-orange-600" />
            <CardTitle>Mettre le compte en veille</CardTitle>
          </div>
          <CardDescription>
            Désactivez temporairement votre compte. Vous pourrez le réactiver à tout moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Que se passe-t-il quand je désactive mon compte ?
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Votre profil ne sera plus visible publiquement</li>
              <li>Vos wishlists seront masquées</li>
              <li>Les autres utilisateurs ne pourront plus vous suivre</li>
              <li>Vous serez automatiquement déconnecté</li>
              <li>Vous pouvez réactiver votre compte en vous reconnectant</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={isDeactivating}>
                {isDeactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <PauseCircle className="mr-2 h-4 w-4" />
                Mettre en veille
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mettre le compte en veille ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Votre compte sera temporairement désactivé. Vous pourrez le réactiver à tout moment en vous reconnectant avec vos identifiants.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeactivateAccount}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-600">Supprimer définitivement le compte</CardTitle>
          </div>
          <CardDescription>
            Supprimez votre compte et toutes vos données de manière permanente. Cette action est irréversible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Attention : Cette action est irréversible !
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Toutes vos wishlists seront supprimées</li>
              <li>Tous vos items seront supprimés</li>
              <li>Tous vos commentaires seront supprimés</li>
              <li>Tous vos likes et favoris seront supprimés</li>
              <li>Vos abonnés et abonnements seront supprimés</li>
              <li>Vous ne pourrez <strong>PAS</strong> récupérer ces données</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={isDeleting}>
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer définitivement mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">
                  Êtes-vous absolument sûr ?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>
                    Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées de nos serveurs.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Tapez <strong>SUPPRIMER</strong> pour confirmer :
                    </label>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="SUPPRIMER"
                      className="font-mono"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'SUPPRIMER'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
