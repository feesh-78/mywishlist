'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CategoryAutocomplete } from '@/components/ui/category-autocomplete';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { data: currentUser } = useUser();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    currency: 'EUR',
    description: '',
    brand: '',
    category: '',
    url: '',
    product_type: 'wishlist',
  });

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function loadProduct() {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      // Vérifier que c'est bien le propriétaire
      if (product.user_id !== currentUser?.id) {
        toast({
          variant: 'destructive',
          title: 'Accès refusé',
          description: 'Tu ne peux modifier que tes propres produits.',
        });
        router.back();
        return;
      }

      setFormData({
        title: product.title || '',
        price: product.price?.toString() || '',
        currency: product.currency || 'EUR',
        description: product.description || '',
        brand: product.brand || '',
        category: product.category || '',
        url: product.url || '',
        product_type: product.product_type || 'wishlist',
      });
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger le produit.',
      });
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.title) {
        toast({
          variant: 'destructive',
          title: 'Titre requis',
          description: 'Le titre est obligatoire.',
        });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          description: formData.description || null,
          price: formData.price ? parseFloat(formData.price) : null,
          currency: formData.currency || 'EUR',
          brand: formData.brand || null,
          category: formData.category || null,
          url: formData.url || null,
          product_type: formData.product_type,
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: '✅ Produit modifié !',
        description: 'Les modifications ont été enregistrées.',
      });

      router.push(`/product/${productId}`);
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder les modifications.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Modifier le produit</h1>
        <p className="text-muted-foreground">Modifie les informations de ton produit</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="title">Titre du produit *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: iPhone 15 Pro"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="brand">Marque / Magasin</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ex: Apple, Zara, Amazon..."
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Commencez à taper pour filtrer (ex: &quot;Foo&quot; → &quot;Football&quot;)
              </p>
              <CategoryAutocomplete
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du produit..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="url">Lien du produit</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="product_type">Type</Label>
              <Select
                value={formData.product_type}
                onValueChange={(value) => setFormData({ ...formData, product_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wishlist">💭 Envie (Wishlist)</SelectItem>
                  <SelectItem value="purchased">✅ Déjà acheté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
