'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/shared/image-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NewItemGlobalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isLoadingWishlists, setIsLoadingWishlists] = useState(true);

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

  const [selectedWishlistId, setSelectedWishlistId] = useState<string>('');

  useEffect(() => {
    loadWishlists();
  }, []);

  async function loadWishlists() {
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load user's wishlists
      const { data: wishlistsData } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!wishlistsData || wishlistsData.length === 0) {
        // Create default wishlist
        const { data: defaultWishlist } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            title: 'Ma wishlist Générale',
            slug: 'ma-wishlist-generale',
            is_public: true,
            is_collaborative: false,
            description: 'Wishlist par défaut pour tous mes souhaits',
          })
          .select()
          .single();

        if (defaultWishlist) {
          setWishlists([defaultWishlist]);
          setSelectedWishlistId(defaultWishlist.id);
        }
      } else {
        setWishlists(wishlistsData);
        // Check if default wishlist exists
        const defaultWishlist = wishlistsData.find(
          (w) => w.slug === 'ma-wishlist-generale'
        );
        if (defaultWishlist) {
          setSelectedWishlistId(defaultWishlist.id);
        } else {
          setSelectedWishlistId(wishlistsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading wishlists:', error);
    } finally {
      setIsLoadingWishlists(false);
    }
  }

  async function handleExtractUrl() {
    const url = form.getValues('url');

    if (!url || !url.trim()) {
      toast({
        variant: 'destructive',
        title: 'URL manquante',
        description: 'Veuillez saisir une URL de produit.',
      });
      return;
    }

    setIsExtracting(true);

    try {
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message with suggestion
        const errorMsg = data.error || "Erreur lors de l'extraction";
        const suggestion = data.suggestion || '';

        toast({
          variant: 'destructive',
          title: errorMsg,
          description: suggestion || "Impossible d'extraire les informations de cette URL.",
        });
        return;
      }

      // Fill the form with extracted data
      if (data.title) {
        form.setValue('title', data.title);
      }
      if (data.description) {
        form.setValue('description', data.description);
      }
      if (data.imageUrl) {
        form.setValue('imageUrl', data.imageUrl);
      }
      if (data.price) {
        form.setValue('price', data.price);
      }
      if (data.currency) {
        form.setValue('currency', data.currency);
      }

      toast({
        title: 'Informations extraites ! ✨',
        description: 'Les champs ont été pré-remplis. Vous pouvez les modifier si besoin.',
      });
    } catch (error: any) {
      console.error('Error extracting URL:', error);
      // Error already handled above, this is for network errors
      if (!error.message.includes('extraction')) {
        toast({
          variant: 'destructive',
          title: 'Erreur réseau',
          description: 'Vérifiez votre connexion internet et réessayez.',
        });
      }
    } finally {
      setIsExtracting(false);
    }
  }

  async function onSubmit(data: any) {
    if (!selectedWishlistId) {
      toast({
        variant: 'destructive',
        title: 'Wishlist manquante',
        description: 'Veuillez sélectionner une wishlist.',
      });
      return;
    }

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

      // Get current position
      const { data: lastItem } = await supabase
        .from('wishlist_items')
        .select('position')
        .eq('wishlist_id', selectedWishlistId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const position = lastItem ? lastItem.position + 1 : 0;

      // Create item
      const { error } = await supabase.from('wishlist_items').insert({
        wishlist_id: selectedWishlistId,
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
        description: "L'item a été ajouté à votre wishlist.",
      });

      // Find the wishlist slug
      const wishlist = wishlists.find((w) => w.id === selectedWishlistId);
      if (wishlist) {
        router.push(`/wishlists/${wishlist.slug}`);
      } else {
        router.push('/wishlists');
      }
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

  if (isLoadingWishlists) {
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
          href="/feed"
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au feed
        </Link>
        <h1 className="text-3xl font-bold mb-2">Ajouter un item</h1>
        <p className="text-muted-foreground">
          Ajoutez un produit ou une idée à l&apos;une de vos wishlists
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
              {/* Wishlist Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Wishlist de destination *
                </label>
                <Select
                  value={selectedWishlistId}
                  onValueChange={setSelectedWishlistId}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une wishlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {wishlists.map((wishlist) => (
                      <SelectItem key={wishlist.id} value={wishlist.id}>
                        {wishlist.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choisissez dans quelle wishlist ajouter cet item
                </p>
              </div>

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
                      <div className="space-y-2">
                        <Input
                          type="url"
                          placeholder="https://example.com/produit"
                          disabled={isLoading || isExtracting}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleExtractUrl}
                          disabled={isLoading || isExtracting || !field.value}
                          className="w-full"
                        >
                          {isExtracting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Extraction en cours...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Extraire automatiquement les infos
                            </>
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Collez l&apos;URL d&apos;un produit et cliquez sur le bouton pour
                      remplir automatiquement les champs
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
