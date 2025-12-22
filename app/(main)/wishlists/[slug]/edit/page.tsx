'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { updateWishlistSchema } from '@/lib/validations/wishlist';
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
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/shared/image-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { CategoryAutocomplete } from '@/components/ui/category-autocomplete';

export default function EditWishlistPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [wishlist, setWishlist] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(updateWishlistSchema),
    defaultValues: {
      title: '',
      description: '',
      coverImageUrl: '',
      isPublic: true,
      isCollaborative: false,
      category: '',
    },
  });

  useEffect(() => {
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadWishlist() {
    const supabase = createClient();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load wishlist
      const { data: wishlistData, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('slug', slug)
        .eq('user_id', user.id)
        .single();

      if (error || !wishlistData) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Wishlist introuvable ou accès refusé.',
        });
        router.push('/feed');
        return;
      }

      setWishlist(wishlistData);

      // Set form values
      form.reset({
        title: wishlistData.title,
        description: wishlistData.description || '',
        coverImageUrl: wishlistData.cover_image_url || '',
        isPublic: wishlistData.is_public,
        isCollaborative: wishlistData.is_collaborative,
        category: wishlistData.category || '',
      });
    } catch (error) {
      console.error('Error loading wishlist:', error);
      router.push('/feed');
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: any) {
    if (!wishlist) return;

    setIsSaving(true);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.id !== wishlist.user_id) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Vous n&apos;êtes pas autorisé à modifier cette wishlist.',
        });
        return;
      }

      // Update wishlist
      const { error } = await supabase
        .from('wishlists')
        .update({
          title: data.title,
          description: data.description || null,
          cover_image_url: data.coverImageUrl || null,
          is_public: data.isPublic,
          is_collaborative: data.isCollaborative,
          category: data.category || null,
        })
        .eq('id', wishlist.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating wishlist:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message,
        });
        return;
      }

      toast({
        title: 'Wishlist mise à jour ! ✅',
        description: 'Vos modifications ont été enregistrées.',
      });

      router.push(`/wishlists/${slug}`);
      router.refresh();
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!wishlist) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/wishlists/${slug}`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la wishlist
        </Link>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Paramètres de la wishlist</h1>
          <Button asChild>
            <Link href={`/wishlists/${slug}/items/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un item
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Modifiez les informations et la visibilité de votre wishlist
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la wishlist</CardTitle>
          <CardDescription>
            Mettez à jour les informations de votre wishlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ma wishlist de Noël 2024"
                        disabled={isSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Le nom de votre wishlist (max 100 caractères)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Quelques idées pour les fêtes..."
                        disabled={isSaving}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Décrivez le thème ou l&apos;occasion de cette wishlist
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <FormDescription>
                      Commencez à taper pour filtrer (ex: &quot;Foo&quot; → &quot;Football&quot;)
                    </FormDescription>
                    <FormControl>
                      <CategoryAutocomplete
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Wishlist publique</FormLabel>
                      <FormDescription>
                        Rendre cette wishlist visible par tout le monde
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image de couverture</FormLabel>
                    <FormControl>
                      <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Upload</TabsTrigger>
                          <TabsTrigger value="url">URL</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="mt-4">
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </TabsContent>
                        <TabsContent value="url" className="mt-4">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            disabled={isSaving}
                            value={field.value}
                            onChange={field.onChange}
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Collez l&apos;URL d&apos;une image en ligne
                          </p>
                        </TabsContent>
                      </Tabs>
                    </FormControl>
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
