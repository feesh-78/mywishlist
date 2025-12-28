'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import Link from 'next/link';
import { UserPlus, UserMinus } from 'lucide-react';

interface FollowersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  type: 'followers' | 'following';
  initialCount?: number;
}

interface ProfileWithFollow {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  isFollowing?: boolean;
}

export function FollowersDialog({
  open,
  onOpenChange,
  userId,
  type,
  initialCount = 0,
}: FollowersDialogProps) {
  const { data: currentUser } = useUser();
  const [profiles, setProfiles] = useState<ProfileWithFollow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followStates, setFollowStates] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (open) {
      loadProfiles();
    }
  }, [open, userId, type]);

  async function loadProfiles() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      let query;

      if (type === 'followers') {
        // Charger les followers (ceux qui suivent cet utilisateur)
        query = supabase
          .from('followers')
          .select(`
            follower_id,
            profiles:follower_id (
              id,
              username,
              full_name,
              avatar_url,
              bio
            )
          `)
          .eq('following_id', userId);
      } else {
        // Charger les following (ceux que cet utilisateur suit)
        query = supabase
          .from('followers')
          .select(`
            following_id,
            profiles:following_id (
              id,
              username,
              full_name,
              avatar_url,
              bio
            )
          `)
          .eq('follower_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      // Extraire les profils
      const profilesList = data?.map((item: any) => {
        const profile = type === 'followers' ? item.profiles : item.profiles;
        return profile;
      }).filter(Boolean) || [];

      setProfiles(profilesList);

      // Si l'utilisateur est connecté, vérifier quels profils il suit
      if (currentUser && profilesList.length > 0) {
        const profileIds = profilesList.map((p: any) => p.id);
        const { data: followData } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUser.id)
          .in('following_id', profileIds);

        const followMap = new Map<string, boolean>();
        followData?.forEach((f) => {
          followMap.set(f.following_id, true);
        });
        setFollowStates(followMap);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFollow(profileId: string, isFollowing: boolean) {
    if (!currentUser) return;

    const supabase = createClient();

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileId);

        setFollowStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(profileId, false);
          return newMap;
        });
      } else {
        // Follow
        await supabase.from('followers').insert({
          follower_id: currentUser.id,
          following_id: profileId,
        });

        setFollowStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(profileId, true);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'Followers' : 'Following'}
            {!isLoading && <span className="text-muted-foreground ml-2">({profiles.length})</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {type === 'followers'
                ? 'Aucun follower pour le moment'
                : 'Ne suit personne pour le moment'}
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => {
                const isFollowing = followStates.get(profile.id) || false;
                const isOwnProfile = currentUser?.id === profile.id;

                return (
                  <div
                    key={profile.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
                  >
                    <Link
                      href={`/profile/${profile.username}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {profile.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {profile.full_name || profile.username}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          @{profile.username}
                        </p>
                      </div>
                    </Link>

                    {!isOwnProfile && currentUser && (
                      <Button
                        size="sm"
                        variant={isFollowing ? 'outline' : 'default'}
                        onClick={() => handleFollow(profile.id, isFollowing)}
                        className="shrink-0"
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-3 w-3 mr-1" />
                            Suivi
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3 w-3 mr-1" />
                            Suivre
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
