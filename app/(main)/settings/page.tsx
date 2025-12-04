'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2, ArrowLeft, User, Mail, Link as LinkIcon, FileText, Camera } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageUpload } from '@/components/shared/image-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Le nom d&apos;utilisateur doit faire au moins 3 caractères')
    .max(30, 'Le nom d&apos;utilisateur ne peut pas dépasser 30 caractères')
    .regex(/^[a-zA-Z0-9_]+$/, 'Le nom d&apos;utilisateur ne peut contenir que des lettres, chiffres et underscores'),
  full_name: z
    .string()
    .max(100, 'Le nom complet ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'La bio ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
  avatar_url: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { data: currentUser, refetch } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      full_name: '',
      bio: '',
      website: '',
      avatar_url: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function loadProfile() {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const supabase = createClient();

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error || !profileData) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger votre profil.',
        });
        return;
      }

      setProfile(profileData);

      // Set form values
      form.reset({
        username: profileData.username || '',
        full_name: profileData.full_name || '',
        bio: profileData.bio || '',
        website: profileData.website || '',
        avatar_url: profileData.avatar_url || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: ProfileFormValues) {
    if (!currentUser || !profile) return;

    setIsSaving(true);

    try {
      const supabase = createClient();

      // Check if username is taken (if changed)
      if (data.username !== profile.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', data.username)
          .single();

        if (existingUser && existingUser.id !== currentUser.id) {
          toast({
            variant: 'destructive',
            title: 'Nom d&apos;utilisateur déjà pris',
            description: 'Ce nom d&apos;utilisateur est déjà utilisé.',
          });
          setIsSaving(false);
          return;
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          full_name: data.full_name || null,
          bio: data.bio || null,
          website: data.website || null,
          avatar_url: data.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message,
        });
        return;
      }

      toast({
        title: 'Profil mis à jour ! ✅',
        description: 'Vos modifications ont été enregistrées.',
      });

      // Refresh user data
      await refetch();

      // Redirect to profile
      router.push(`/profile/${data.username}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
        <p className="text-muted-foreground mb-4">
          Vous devez être connecté pour accéder aux paramètres.
        </p>
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/profile/${profile?.username}`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au profil
        </Link>
        <h1 className="text-3xl font-bold mb-2">Paramètres du profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et votre présence sur MyWishList
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du profil</CardTitle>
          <CardDescription>
            Ces informations seront visibles publiquement sur votre profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={form.watch('avatar_url')} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                    {form.watch('username')?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Photo de profil</p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG ou GIF. Max 2MB.
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l&apos;avatar</FormLabel>
                    <FormControl>
                      <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Upload</TabsTrigger>
                          <TabsTrigger value="url">URL</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="mt-4">
                          <ImageUpload
                            value={field.value || ''}
                            onChange={field.onChange}
                            bucket="avatars"
                          />
                        </TabsContent>
                        <TabsContent value="url" className="mt-4">
                          <div className="flex gap-2">
                            <Camera className="h-4 w-4 mt-3 text-muted-foreground" />
                            <Input
                              type="url"
                              placeholder="https://example.com/avatar.jpg"
                              disabled={isSaving}
                              value={field.value || ''}
                              onChange={field.onChange}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 ml-6">
                            Collez l&apos;URL d&apos;une image en ligne
                          </p>
                        </TabsContent>
                      </Tabs>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d&apos;utilisateur *</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <User className="h-4 w-4 mt-3 text-muted-foreground" />
                        <Input
                          placeholder="johndoe"
                          disabled={isSaving}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Votre identifiant unique (3-30 caractères, lettres, chiffres et _)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <User className="h-4 w-4 mt-3 text-muted-foreground" />
                        <Input
                          placeholder="John Doe"
                          disabled={isSaving}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Votre nom tel qu&apos;il apparaîtra sur votre profil
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biographie</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <FileText className="h-4 w-4 mt-3 text-muted-foreground" />
                        <Textarea
                          placeholder="Parlez-nous de vous..."
                          disabled={isSaving}
                          rows={4}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Une courte description de vous (max 500 caractères)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <LinkIcon className="h-4 w-4 mt-3 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          disabled={isSaving}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Votre site web ou lien personnel
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
