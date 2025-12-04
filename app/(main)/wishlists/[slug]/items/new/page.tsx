'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { createWishlistItemSchema } from '@/lib/validations/wishlist';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/shared/image-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NewItemPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [wishlist, setWishlist] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(createWishlistItemSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      imageUrl: '',
      price: undefined,
      currency: 'EUR',
      priority: 3,
    },
  });

  useEffect(() => {
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadWishlist() {
    const supabase = createClient();

    try {
      const { data: wishlistData } = await supabase
        .from('wishlists')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!wishlistData) {
        router.push('/feed');
        return;
      }

      setWishlist(wishlistData);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      router.push('/feed');
    }
  }

  async function onSubmit(data: any) {
    if (!wishlist) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Vous devez être connecté.',
        });
        return;
      }

      // Check if user is owner
      if (user.id !== wishlist.user_id) {
        toast({
          variant: 'destructive',
          title: 'Non autorisé',
          description: 'Vous n&apos;êtes pas le propriétaire de cette wishlist.',
        });
        return;
      }

      // Get current position
      const { data: lastItem } = await supabase
        .from('wishlist_items')
        .select('position')
        .eq('wishlist_id', wishlist.id)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const position = lastItem ? lastItem.position + 1 : 0;

      // Create item
      const { error } = await supabase.from('wishlist_items').insert({
        wishlist_id: wishlist.id,
        title: data.title,
        description: data.description || null,
        url: data.url || null,
        image_url: data.imageUrl || null,
        price: data.price || null,
        currency: data.currency,
        priority: data.priority,
        position,
      });

      if (error) {
        console.error('Error creating item:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message,
        });
        return;
      }

      toast({
        title: 'Item ajouté ! 🎉',
        description: 'L&apos;item a été ajouté à votre wishlist.',
      });

      router.push(`/wishlists/${slug}`);
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

  if (!wishlist) {
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
          href={`/wishlists/${slug}`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la wishlist
        </Link>
        <h1 className="text-3xl font-bold mb-2">Ajouter un item</h1>
        <p className="text-muted-foreground">
          Ajoutez un produit ou une idée à votre wishlist &quot;{wishlist.title}&quot;
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;item</CardTitle>
          <CardDescription>
            Remplissez les informations sur le produit que vous souhaitez
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
                        placeholder="iPhone 15 Pro"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Le nom du produit (max 200 caractères)
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
                        placeholder="Couleur bleu titane, 256 Go..."
                        disabled={isLoading}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Détails, couleur, taille, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lien du produit</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/produit"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL où acheter le produit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image du produit</FormLabel>
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
                            bucket="wishlist-images"
                          />
                        </TabsContent>
                        <TabsContent value="url" className="mt-4">
                          <Input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            disabled={isLoading}
                            value={field.value || ''}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="99.99"
                          disabled={isLoading}
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseFloat(value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CHF">CHF (Fr)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              className="transition-transform hover:scale-110"
                            >
                              <Heart
                                className={`h-8 w-8 ${
                                  value <= (field.value || 0)
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {field.value === 1 && 'Priorité faible'}
                          {field.value === 2 && 'Priorité basse'}
                          {field.value === 3 && 'Priorité moyenne'}
                          {field.value === 4 && 'Priorité haute'}
                          {field.value === 5 && 'Priorité maximale'}
                        </p>
                      </div>
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
                  Ajouter l&apos;item
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
