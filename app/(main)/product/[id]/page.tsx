'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/hooks/use-toast';
import {
  ArrowLeft,
  ExternalLink,
  Share2,
  Trash2,
  Package,
  Hash,
  Store,
  Calendar,
  Star,
  Bookmark,
  Edit,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { data: currentUser } = useUser();
  const { toast } = useToast();
  const supabase = createClient();

  const [product, setProduct] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function loadProduct() {
    setIsLoading(true);

    try {
      // Charger le produit
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError || !productData) {
        toast({
          variant: 'destructive',
          title: 'Produit introuvable',
          description: 'Ce produit n\'existe pas ou a été supprimé.',
        });
        router.push('/feed');
        return;
      }

      setProduct(productData);

      // Charger le profil du propriétaire
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', productData.user_id)
        .single();

      setOwner(ownerData);
    } catch (error) {
      console.error('Erreur chargement produit:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: '✅ Produit supprimé',
        description: 'Le produit a été supprimé avec succès.',
      });

      const username = currentUser?.user_metadata?.username || currentUser?.id;
      router.push(`/profile/${username}`);
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast({
        variant: 'destructive',
        title: '❌ Erreur',
        description: 'Impossible de supprimer le produit.',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveToMyCollection() {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Connecte-toi pour sauvegarder ce produit.',
      });
      router.push('/login');
      return;
    }

    setIsSaving(true);

    try {
      // Créer une copie du produit dans la collection de l'utilisateur
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          user_id: currentUser.id,
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          brand: product.brand,
          category: product.category,
          image_url: product.image_url,
          url: product.url,
          product_type: 'wishlist', // Par défaut en wishlist
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '✅ Produit sauvegardé !',
        description: 'Le produit a été ajouté à ta collection.',
      });

      const username = currentUser.user_metadata?.username || currentUser.id;
      router.push(`/profile/${username}`);
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast({
        variant: 'destructive',
        title: '❌ Erreur',
        description: 'Impossible de sauvegarder le produit.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShare() {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Découvre ce produit sur MyWishList : ${product.title}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copier dans le presse-papier
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: '📋 Lien copié !',
        description: 'Le lien a été copié dans le presse-papier.',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const isOwner = currentUser?.id === product.user_id;

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>

          {!isOwner && currentUser && (
            <Button
              variant="default"
              onClick={handleSaveToMyCollection}
              disabled={isSaving}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          )}

          {isOwner && (
            <>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/product/${productId}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {product.image_url ? (
              <div className="relative aspect-square bg-muted">
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Détails */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

            {product.price && (
              <p className="text-4xl font-bold text-primary mb-4">
                {product.price} {product.currency === 'EUR' ? '€' : product.currency === 'USD' ? '$' : '£'}
              </p>
            )}

            {/* Type Badge */}
            {product.product_type === 'purchased' ? (
              <Badge variant="default" className="mb-4">
                ✅ Déjà acheté
              </Badge>
            ) : (
              <Badge variant="outline" className="mb-4">
                💭 Envie
              </Badge>
            )}

            {product.description && (
              <p className="text-muted-foreground mb-6">{product.description}</p>
            )}
          </div>

          {/* Informations */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {product.brand && (
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Marque:</strong> {product.brand}
                  </span>
                </div>
              )}

              {product.category && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Catégorie:</strong> {product.category}
                  </span>
                </div>
              )}

              {product.purchase_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Acheté le:</strong>{' '}
                    {new Date(product.purchase_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}

              {product.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Note:</strong> {product.rating}/5
                  </span>
                </div>
              )}

              {product.review && (
                <div>
                  <p className="text-sm font-semibold mb-1">Avis :</p>
                  <p className="text-sm text-muted-foreground">{product.review}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Ajouté le:</strong>{' '}
                  {new Date(product.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Propriétaire */}
          {owner && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Partagé par</p>
                <Link href={`/profile/${owner.username}`}>
                  <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                      {owner.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{owner.full_name || owner.username}</p>
                      <p className="text-sm text-muted-foreground">@{owner.username}</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Bouton lien produit */}
          {product.url && (
            <Button asChild className="w-full" size="lg">
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir sur le site
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
