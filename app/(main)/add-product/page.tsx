'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  'Mode',
  'Tech',
  'Déco',
  'Sport',
  'Beauté',
  'Cuisine',
  'Livres',
  'Jeux',
  'Voyage',
  'Autre',
];

function AddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    currency: 'EUR',
    description: '',
    brand: '',
    category: '',
    url: '',
    listType: 'wishlist', // wishlist ou shopping_list
  });

  // Détecter si on vient d'un partage (Web Share Target)
  useEffect(() => {
    const handleShare = async () => {
      // Vérifier si on a des données de partage dans les query params
      const sharedTitle = searchParams.get('title');
      const sharedText = searchParams.get('text');
      const sharedUrl = searchParams.get('url');
      const isShared = searchParams.get('shared') === 'true';

      if (sharedTitle || sharedText || sharedUrl) {
        setFormData(prev => ({
          ...prev,
          title: sharedTitle || prev.title,
          description: sharedText || prev.description,
          url: sharedUrl || prev.url,
        }));

        // Si c'est un partage ET qu'on a une URL, extraire automatiquement
        if (isShared && sharedUrl) {
          // Attendre un peu pour que le formulaire soit rempli
          setTimeout(() => {
            extractFromUrl(sharedUrl);
          }, 500);
        }
      }
    };

    handleShare();
  }, [searchParams]);

  // Fonction d'extraction d'URL séparée pour la réutiliser
  const extractFromUrl = async (url: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Erreur extraction URL');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        price: data.price ? data.price.toString() : prev.price,
        currency: data.currency || prev.currency,
        description: data.description || prev.description,
        url: data.url || prev.url,
      }));

      // Si une image a été extraite, l'afficher en preview
      if (data.imageUrl) {
        setScreenshotPreview(data.imageUrl);
      }

      toast({
        title: '✅ Produit extrait !',
        description: 'Les informations ont été récupérées depuis le lien.',
      });
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'extraire les infos. Essayez avec un screenshot.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Analyser le screenshot avec Gemini
  const analyzeScreenshot = async (file: File) => {
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse du screenshot');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Pré-remplir le formulaire avec les données extraites
        setFormData(prev => ({
          ...prev,
          title: result.data.title || prev.title,
          price: result.data.price ? result.data.price.toString() : prev.price,
          currency: result.data.currency || prev.currency,
          description: result.data.description || prev.description,
          brand: result.data.brand || prev.brand,
          category: result.data.category || prev.category,
          url: result.data.url || prev.url,
        }));

        toast({
          title: '✨ Screenshot analysé !',
          description: 'Les informations ont été extraites automatiquement.',
        });
      } else {
        throw new Error('Aucune donnée extraite');
      }
    } catch (error) {
      console.error('Erreur analyse:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'analyser le screenshot. Vous pouvez remplir manuellement.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Gérer l'upload de screenshot
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);

      // Créer preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Analyser automatiquement
      analyzeScreenshot(file);
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation basique
      if (!formData.title) {
        toast({
          title: '❌ Titre requis',
          description: 'Veuillez entrer un titre pour le produit.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Obtenir l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Créer le produit directement dans la base
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          price: formData.price ? parseFloat(formData.price) : null,
          currency: formData.currency || 'EUR',
          brand: formData.brand || null,
          category: formData.category || null,
          image_url: screenshotPreview || null,
          url: formData.url || null,
          product_type: formData.listType === 'shopping_list' ? 'purchased' : 'wishlist',
          is_public: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: '✅ Produit ajouté !',
        description: 'Le produit a été ajouté à votre collection.',
      });

      // Rediriger vers le profil
      const username = user.user_metadata?.username || user.id;
      router.push(`/profile/${username}`);

    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: '❌ Erreur',
        description: error.message || 'Impossible d\'ajouter le produit.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ajouter un produit</h1>
        <p className="text-muted-foreground">
          Partagez un screenshot ou ajoutez manuellement un produit à votre wishlist
        </p>
      </div>

      {/* Upload de screenshot OU URL */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="url-input">Lien du produit (optionnel)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Collez un lien Amazon, Fnac, etc. pour remplir automatiquement ✨
            </p>
            <div className="flex gap-2">
              <Input
                id="url-input"
                type="url"
                placeholder="https://www.amazon.fr/..."
                disabled={analyzing}
              />
              <Button
                type="button"
                onClick={async (e) => {
                  const input = document.getElementById('url-input') as HTMLInputElement;
                  const url = input.value;
                  if (!url) return;

                  extractFromUrl(url);
                }}
                disabled={analyzing}
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Extraire'}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou</span>
            </div>
          </div>

          <div>
            <Label htmlFor="screenshot">Screenshot (optionnel)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Ajoutez un screenshot comme image du produit
            </p>
            <Input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setScreenshot(file);
                  // Créer preview uniquement (pas d'analyse automatique)
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setScreenshotPreview(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              disabled={analyzing}
            />
            {screenshotPreview && !analyzing && (
              <Button
                type="button"
                onClick={() => screenshot && analyzeScreenshot(screenshot)}
                className="mt-2 w-full"
                variant="outline"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Analyser avec l&apos;IA (optionnel)
              </Button>
            )}
          </div>

          {analyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyse en cours...</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
          )}
        </div>
      </Card>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
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
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ✅ Rempli automatiquement depuis le lien extrait
              </p>
            </div>

            {/* Aperçu de l'image du produit */}
            {screenshotPreview && (
              <div>
                <Label>Image du produit</Label>
                <div className="relative aspect-square max-w-sm mx-auto bg-muted rounded-lg overflow-hidden border-2 border-border">
                  <img
                    src={screenshotPreview}
                    alt="Aperçu du produit"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Cette image sera utilisée pour votre produit
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="listType">Type de liste</Label>
              <Select
                value={formData.listType}
                onValueChange={(value) => setFormData({ ...formData, listType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wishlist">Envie (Wishlist)</SelectItem>
                  <SelectItem value="shopping_list">Déjà acheté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Button type="submit" className="w-full" disabled={loading || analyzing}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Ajout en cours...
            </>
          ) : (
            'Continuer'
          )}
        </Button>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <AddProductContent />
    </Suspense>
  );
}
