'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { useAuthDialog } from '@/lib/hooks/use-auth-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Heart,
  Share2,
  Plus,
  ExternalLink,
  Check,
  Lock,
  ArrowLeft,
  Edit,
  Hash,
  Send,
  Trash2,
  Settings,
  MoreVertical,
  Bookmark,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function WishlistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: currentUser } = useUser();
  const { toast } = useToast();
  const { openDialog } = useAuthDialog();

  const [wishlist, setWishlist] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUser && wishlist && currentUser.id === wishlist.user_id;

  useEffect(() => {
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadWishlist() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // Load wishlist with profile
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select(`
          *,
          profile:profiles(id, username, full_name, avatar_url)
        `)
        .eq('slug', slug)
        .single();

      if (wishlistError || !wishlistData) {
        console.error('Wishlist not found:', wishlistError);
        setWishlist(null);
        return;
      }

      setWishlist(wishlistData);

      // Load items
      const { data: itemsData } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', wishlistData.id)
        .order('position', { ascending: true });

      setItems(itemsData || []);

      // Load comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(id, username, full_name, avatar_url)
        `)
        .eq('wishlist_id', wishlistData.id)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);

      // Check if bookmarked
      if (currentUser) {
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('wishlist_id', wishlistData.id)
          .single();

        setIsBookmarked(!!bookmarkData);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddComment() {
    if (!currentUser) {
      openDialog('comment');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setIsCommentLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          wishlist_id: wishlist.id,
          user_id: currentUser.id,
          content: newComment.trim(),
        })
        .select(`
          *,
          profile:profiles(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) {
        throw error;
      }

      setComments((prev) => [data, ...prev]);
      setNewComment('');

      toast({
        title: 'Commentaire ajouté',
        description: 'Votre commentaire a été publié.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d&apos;ajouter le commentaire.',
      });
    } finally {
      setIsCommentLoading(false);
    }
  }

  async function handleReserve(itemId: string, isReserved: boolean) {
    if (!currentUser) {
      openDialog('like');
      return;
    }

    const supabase = createClient();

    try {
      if (isReserved) {
        // Unreserve
        await supabase
          .from('wishlist_items')
          .update({
            is_reserved: false,
            reserved_by: null,
          })
          .eq('id', itemId);

        toast({
          title: 'Réservation annulée',
          description: 'L&apos;item est de nouveau disponible.',
        });
      } else {
        // Reserve
        await supabase
          .from('wishlist_items')
          .update({
            is_reserved: true,
            reserved_by: currentUser.id,
          })
          .eq('id', itemId);

        toast({
          title: 'Item réservé',
          description: 'Vous avez réservé cet item !',
        });
      }

      // Reload items
      loadWishlist();
    } catch (error) {
      console.error('Error reserving item:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Lien copié',
        description: 'Le lien de la wishlist a été copié dans le presse-papier.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de copier le lien.',
      });
    }
  }

  async function handleDelete() {
    if (!wishlist || !currentUser) return;

    setIsDeleting(true);
    const supabase = createClient();

    try {
      // Delete the wishlist (cascade will delete items, comments, etc.)
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlist.id)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error deleting wishlist:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de supprimer la wishlist.',
        });
        return;
      }

      toast({
        title: 'Wishlist supprimée',
        description: 'Votre wishlist a été supprimée avec succès.',
      });

      router.push('/feed');
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue.',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  async function handleBookmark() {
    if (!currentUser) {
      openDialog('like');
      return;
    }

    if (!wishlist) return;

    const supabase = createClient();

    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('wishlist_id', wishlist.id);

        setIsBookmarked(false);
        toast({
          title: 'Retiré des favoris',
          description: 'La wishlist a été retirée de vos favoris.',
        });
      } else {
        // Add bookmark
        await supabase.from('bookmarks').insert({
          user_id: currentUser.id,
          wishlist_id: wishlist.id,
          item_id: null,
        });

        setIsBookmarked(true);
        toast({
          title: 'Ajouté aux favoris',
          description: 'La wishlist a été ajoutée à vos favoris.',
        });
      }
    } catch (error) {
      console.error('Error bookmarking wishlist:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier les favoris.',
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

  if (!wishlist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Wishlist introuvable</h2>
        <p className="text-muted-foreground mb-4">
          Cette wishlist n&apos;existe pas ou est privée.
        </p>
        <Button asChild>
          <Link href="/feed">Retour au feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      {/* Wishlist Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          {/* Cover Image */}
          {wishlist.cover_image_url && (
            <div className="relative aspect-video w-full mb-6 rounded-lg overflow-hidden">
              <Image
                src={wishlist.cover_image_url}
                alt={wishlist.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{wishlist.title}</h1>
              {wishlist.category && (
                <Badge variant="secondary" className="mb-3">
                  <Hash className="h-3 w-3 mr-1" />
                  {wishlist.category}
                </Badge>
              )}
              {wishlist.description && (
                <p className="text-muted-foreground mb-4">{wishlist.description}</p>
              )}

              {/* Owner */}
              <Link
                href={`/profile/${wishlist.profile?.username}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={wishlist.profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                    {wishlist.profile?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {wishlist.profile?.full_name || wishlist.profile?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{wishlist.profile?.username}
                  </p>
                </div>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-start">
              <Button
                variant="outline"
                size="icon"
                onClick={handleBookmark}
                title={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''
                  }`}
                />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              {isOwner && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/wishlists/${slug}/edit`} className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Paramètres
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button asChild>
                    <Link href={`/wishlists/${slug}/items/new`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un item
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">{items.length}</span> items
            </div>
            <div>
              <span className="font-semibold text-foreground">
                {items.filter((i) => i.is_reserved).length}
              </span>{' '}
              réservés
            </div>
            <div>
              Créée le {new Date(wishlist.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎁</div>
          <h3 className="text-lg font-semibold mb-2">Aucun item</h3>
          <p className="text-muted-foreground mb-4">
            {isOwner
              ? 'Ajoutez des items à votre wishlist !'
              : 'Cette wishlist ne contient pas encore d&apos;items.'}
          </p>
          {isOwner && (
            <Button asChild>
              <Link href={`/wishlists/${slug}/items/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un item
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isReservedByMe = currentUser && item.reserved_by === currentUser.id;
            const canReserve = !isOwner && (!item.is_reserved || isReservedByMe);

            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Item Image */}
                {item.image_url && (
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    {item.is_reserved && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-green-600 text-white">
                          <Check className="h-3 w-3 mr-1" />
                          Réservé
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Item Content */}
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>

                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {item.description}
                    </p>
                  )}

                  {item.price && (
                    <p className="text-lg font-bold text-primary mb-3">
                      {item.price.toFixed(2)} {item.currency || 'EUR'}
                    </p>
                  )}

                  {/* Priority */}
                  {item.priority && (
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Heart
                          key={i}
                          className={`h-4 w-4 ${
                            i < item.priority
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {item.url && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Voir le produit
                        </a>
                      </Button>
                    )}

                    {!isOwner && (
                      <Button
                        variant={isReservedByMe ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => handleReserve(item.id, !!isReservedByMe)}
                        disabled={!canReserve}
                        className="flex-1"
                      >
                        {item.is_reserved && !isReservedByMe ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Réservé
                          </>
                        ) : isReservedByMe ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Annuler
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Réserver
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Comments Section */}
      <div ref={commentsRef} id="comments" className="mt-12 scroll-mt-20">
        <h2 className="text-2xl font-bold mb-6">
          Commentaires ({comments.length})
        </h2>

        {/* Add Comment Form */}
        {currentUser ? (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {currentUser.user_metadata?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isCommentLoading}
                    rows={3}
                    className="mb-2"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={isCommentLoading || !newComment.trim()}
                      size="sm"
                    >
                      {isCommentLoading ? (
                        <>Envoi...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publier
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Connectez-vous pour commenter cette wishlist
              </p>
              <Button asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Aucun commentaire pour le moment. Soyez le premier à commenter !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Link href={`/profile/${comment.profile?.username}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {comment.profile?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/profile/${comment.profile?.username}`}
                          className="font-semibold hover:underline"
                        >
                          {comment.profile?.full_name || comment.profile?.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          @{comment.profile?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          •
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette wishlist ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les items, commentaires et données associés à cette wishlist seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
