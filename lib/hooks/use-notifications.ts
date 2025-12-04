'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Notification, NotificationWithDetails } from '@/lib/types/notification';
import { useToast } from './use-toast';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id(id, username, full_name, avatar_url),
          wishlist:wishlist_id(id, title, slug)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedData = data as NotificationWithDetails[];
      setNotifications(typedData);
      setUnreadCount(typedData.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      toast({
        title: 'Notifications marquées comme lues',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de marquer les notifications comme lues',
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const notification = notifications.find((n) => n.id === notificationId);
      const wasUnread = notification && !notification.is_read;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer la notification',
      });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch full notification with joined data
          const { data } = await supabase
            .from('notifications')
            .select(`
              *,
              actor:actor_id(id, username, full_name, avatar_url),
              wishlist:wishlist_id(id, title, slug)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const newNotification = data as NotificationWithDetails;
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Show toast for new notification
            const actorName = newNotification.actor?.full_name || newNotification.actor?.username;
            let message = '';

            switch (newNotification.type) {
              case 'follow':
                message = `${actorName} a commencé à vous suivre`;
                break;
              case 'like':
                message = `${actorName} a aimé votre wishlist`;
                break;
              case 'comment':
                message = `${actorName} a commenté votre wishlist`;
                break;
              case 'wishlist_invite':
                message = `${actorName} vous a invité à collaborer`;
                break;
              case 'wishlist_shared':
                message = `${actorName} a partagé une wishlist avec vous`;
                break;
            }

            toast({
              title: 'Nouvelle notification',
              description: message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
