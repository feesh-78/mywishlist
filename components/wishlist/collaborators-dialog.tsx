'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, X, Crown, Edit3, Eye, Search, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CollaboratorsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  wishlistOwnerId: string;
}

export function CollaboratorsDialog({
  isOpen,
  onClose,
  wishlistId,
  wishlistOwnerId,
}: CollaboratorsDialogProps) {
  const { data: currentUser } = useUser();
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = currentUser?.id === wishlistOwnerId;

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, wishlistId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  async function loadCollaborators() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('wishlist_collaborators')
        .select(`
          *,
          profile:profiles(id, username, full_name, avatar_url)
        `)
        .eq('wishlist_id', wishlistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function searchUsers() {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq('id', wishlistOwnerId)
        .limit(5);

      if (error) throw error;

      // Filter out already invited users
      const alreadyInvited = collaborators.map((c) => c.user_id);
      const filtered = (data || []).filter((user) => !alreadyInvited.includes(user.id));

      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }

  async function inviteUser(userId: string, role: 'editor' | 'viewer' = 'editor') {
    if (!currentUser) return;

    const supabase = createClient();

    try {
      const { error } = await supabase.from('wishlist_collaborators').insert({
        wishlist_id: wishlistId,
        user_id: userId,
        role,
        invited_by: currentUser.id,
        status: 'accepted', // Auto-accept for now, can add pending invites later
      });

      if (error) throw error;

      toast({
        title: 'Collaborateur ajouté ! 🎉',
        description: 'L\'utilisateur peut maintenant contribuer à cette liste.',
      });

      setSearchQuery('');
      setSearchResults([]);
      loadCollaborators();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter le collaborateur.',
      });
    }
  }

  async function updateCollaboratorRole(collaboratorId: string, newRole: string) {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('wishlist_collaborators')
        .update({ role: newRole })
        .eq('id', collaboratorId);

      if (error) throw error;

      toast({
        title: 'Rôle mis à jour',
        description: 'Le rôle du collaborateur a été modifié.',
      });

      loadCollaborators();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier le rôle.',
      });
    }
  }

  async function removeCollaborator(collaboratorId: string) {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce collaborateur ?')) return;

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('wishlist_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      toast({
        title: 'Collaborateur retiré',
        description: 'L\'utilisateur n\'a plus accès à cette liste.',
      });

      loadCollaborators();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de retirer le collaborateur.',
      });
    }
  }

  const roleIcons = {
    owner: <Crown className="h-4 w-4 text-yellow-600" />,
    editor: <Edit3 className="h-4 w-4 text-blue-600" />,
    viewer: <Eye className="h-4 w-4 text-gray-600" />,
  };

  const roleLabels = {
    owner: 'Propriétaire',
    editor: 'Éditeur',
    viewer: 'Lecteur',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collaborateurs</DialogTitle>
          <DialogDescription>
            Invitez des personnes à contribuer à cette liste
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="space-y-4">
            {/* Search Users */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          @{user.username}
                        </p>
                        {user.full_name && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.full_name}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => inviteUser(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collaborators List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            Collaborateurs ({collaborators.length})
          </h4>
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Aucun collaborateur pour le moment
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={collab.profile?.avatar_url} />
                      <AvatarFallback>
                        {collab.profile?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        @{collab.profile?.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {roleIcons[collab.role as keyof typeof roleIcons]}
                        <span className="text-xs text-muted-foreground">
                          {roleLabels[collab.role as keyof typeof roleLabels]}
                        </span>
                      </div>
                    </div>
                    {isOwner && collab.role !== 'owner' && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={collab.role}
                          onValueChange={(value) =>
                            updateCollaboratorRole(collab.id, value)
                          }
                        >
                          <SelectTrigger className="h-8 w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Éditeur</SelectItem>
                            <SelectItem value="viewer">Lecteur</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeCollaborator(collab.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
