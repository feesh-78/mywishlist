'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2, ArrowLeft, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/shared/image-upload';

export default function NewShoppingListPage() {
  const router = useRouter();
  const { data: user } = useUser();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour créer une liste d\'achats.',
      });
      router.push('/login');
      return;
    }

    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Titre requis',
        description: 'Veuillez entrer un titre pour votre liste.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          slug,
          category: category.trim() || null,
          cover_image_url: coverImage || null,
          is_public: isPublic,
          list_type: 'shopping_list',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating shopping list:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de créer la liste. Veuillez réessayer.',
        });
        return;
      }

      toast({
        title: 'Liste créée ! 🛍️',
        description: 'Votre liste d\'achats a été créée avec succès.',
      });

      // Redirect to profile
      router.push(`/profile/${user.user_metadata?.username}?tab=shopping`);
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
        <p className="text-muted-foreground mb-4">
          Vous devez être connecté pour créer une liste d&apos;achats.
        </p>
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/profile/${user.user_metadata?.username}`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au profil
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Partager mes achats</h1>
        </div>
        <p className="text-muted-foreground">
          Partagez vos achats et recommandations pour inspirer les autres
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de la liste</CardTitle>
            <CardDescription>
              Créez une liste pour partager tout ce que vous avez acheté
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="cover-image">Image de couverture</Label>
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                bucket="wishlist-covers"
              />
              <p className="text-sm text-muted-foreground">
                Une image représentative de vos achats (optionnel)
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Mes achats tech 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
              <p className="text-sm text-muted-foreground">
                Donnez un titre à votre liste d&apos;achats
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez vos achats et pourquoi vous les recommandez..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                placeholder="Ex: Électronique, Mode, Maison..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Aidez les autres à trouver votre liste
              </p>
            </div>

            {/* Visibility */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is-public" className="text-base">
                  Liste publique
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tout le monde peut voir cette liste
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>

            {/* Submit Buttons */}
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
                Créer la liste
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
