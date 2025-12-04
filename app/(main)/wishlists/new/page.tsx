'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { createWishlistSchema, type CreateWishlistInput } from '@/lib/validations/wishlist';
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
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/shared/image-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NewWishlistPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(createWishlistSchema),
    defaultValues: {
      title: '',
      description: '',
      slug: '',
      coverImageUrl: '',
      isPublic: true,
      isCollaborative: false,
      category: '',
    },
  });

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    form.setValue('slug', slug);
  };

  async function onSubmit(data: any) {
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Vous devez être connecté pour créer une wishlist.',
        });
        return;
      }

      // Check if slug already exists for this user
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('slug', data.slug)
        .single();

      if (existing) {
        toast({
          variant: 'destructive',
          title: 'Slug déjà utilisé',
          description: 'Ce nom est déjà utilisé pour une de vos wishlists.',
        });
        return;
      }

      // Create wishlist
      const { data: wishlist, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          slug: data.slug,
          cover_image_url: data.coverImageUrl || null,
          is_public: data.isPublic,
          is_collaborative: data.isCollaborative,
          category: data.category || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating wishlist:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message,
        });
        return;
      }

      toast({
        title: 'Wishlist créée ! 🎉',
        description: 'Votre wishlist a été créée avec succès.',
      });

      router.push('/wishlists');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/wishlists" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux wishlists
        </Link>
        <h1 className="text-3xl font-bold mb-2">Créer une wishlist</h1>
        <p className="text-muted-foreground">
          Créez une nouvelle liste de souhaits pour une occasion spéciale
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la wishlist</CardTitle>
          <CardDescription>
            Remplissez les informations pour créer votre wishlist
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
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTitleChange(e.target.value);
                        }}
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL personnalisée *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">/wishlist/</span>
                        <Input
                          placeholder="ma-wishlist-noel-2024"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      URL unique pour partager votre wishlist
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
                        disabled={isLoading}
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
                    <FormControl>
                      <Input
                        placeholder="Noël, Anniversaire, Mariage..."
                        disabled={isLoading}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
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
                            disabled={isLoading}
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
                  disabled={isLoading}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer la wishlist
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
