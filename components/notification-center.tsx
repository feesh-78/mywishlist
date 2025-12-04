'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Check, CheckCheck, Trash2, User, Heart, MessageCircle, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/lib/hooks/use-notifications';
import type { NotificationWithDetails } from '@/lib/types/notification';

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications(userId);

  const getNotificationIcon = (type: NotificationWithDetails['type']) => {
    switch (type) {
      case 'follow':
        return <User className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'wishlist_invite':
        return <Users className="h-4 w-4" />;
      case 'wishlist_shared':
        return <Gift className="h-4 w-4" />;
    }
  };

  const getNotificationText = (notification: NotificationWithDetails) => {
    const actorName = notification.actor?.full_name || notification.actor?.username || 'Un utilisateur';

    switch (notification.type) {
      case 'follow':
        return `${actorName} a commencé à vous suivre`;
      case 'like':
        return `${actorName} a aimé votre wishlist${notification.wishlist ? ` "${notification.wishlist.title}"` : ''}`;
      case 'comment':
        return `${actorName} a commenté votre wishlist${notification.wishlist ? ` "${notification.wishlist.title}"` : ''}`;
      case 'wishlist_invite':
        return `${actorName} vous a invité à collaborer sur une wishlist`;
      case 'wishlist_shared':
        return `${actorName} a partagé une wishlist avec vous`;
      default:
        return notification.content || 'Nouvelle notification';
    }
  };

  const getNotificationLink = (notification: NotificationWithDetails) => {
    switch (notification.type) {
      case 'follow':
        return `/profile/${notification.actor?.username}`;
      case 'like':
      case 'comment':
        return notification.wishlist ? `/wishlists/${notification.wishlist.slug}` : '/feed';
      case 'wishlist_invite':
      case 'wishlist_shared':
        return notification.wishlist ? `/wishlists/${notification.wishlist.slug}` : '/feed';
      default:
        return '/feed';
    }
  };

  const handleNotificationClick = (notification: NotificationWithDetails) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="font-medium">Aucune notification</p>
              <p className="text-sm text-muted-foreground">
                Vos notifications apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative hover:bg-muted/50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <Link
                    href={getNotificationLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className="flex gap-3 p-4 pr-12"
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={notification.actor?.avatar_url} />
                      <AvatarFallback>
                        {notification.actor?.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">
                            {getNotificationText(notification)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>

                      {!notification.is_read && (
                        <div className="absolute top-4 right-4">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <div className="p-2">
              <Button variant="ghost" className="w-full" size="sm" asChild>
                <Link href="/notifications" onClick={() => setIsOpen(false)}>
                  Voir toutes les notifications
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
