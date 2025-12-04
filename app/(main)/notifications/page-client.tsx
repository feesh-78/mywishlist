'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Check, CheckCheck, Trash2, User, Heart, MessageCircle, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/lib/hooks/use-notifications';
import type { NotificationWithDetails } from '@/lib/types/notification';

interface NotificationsPageClientProps {
  userId: string;
}

export function NotificationsPageClient({ userId }: NotificationsPageClientProps) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications(userId);

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  const getNotificationIcon = (type: NotificationWithDetails['type']) => {
    switch (type) {
      case 'follow':
        return <User className="h-5 w-5" />;
      case 'like':
        return <Heart className="h-5 w-5" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5" />;
      case 'wishlist_invite':
        return <Users className="h-5 w-5" />;
      case 'wishlist_shared':
        return <Gift className="h-5 w-5" />;
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
  };

  const NotificationCard = ({ notification }: { notification: NotificationWithDetails }) => (
    <div
      className={`group relative rounded-lg border p-4 hover:bg-muted/50 transition-colors ${
        !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' : ''
      }`}
    >
      <Link
        href={getNotificationLink(notification)}
        onClick={() => handleNotificationClick(notification)}
        className="flex gap-4"
      >
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={notification.actor?.avatar_url} />
          <AvatarFallback>
            {notification.actor?.username?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1 text-muted-foreground">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed">
                {getNotificationText(notification)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
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

      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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
  );

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                {unreadCount > 0
                  ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Vous êtes à jour'}
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Aucune notification</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {"Vous recevrez des notifications lorsque quelqu'un interagira avec vos wishlists ou vous suivra"}
              </p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all">
                  Toutes
                  {notifications.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {notifications.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Non lues
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read">
                  Lues
                  {readNotifications.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {readNotifications.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-6">
                {notifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </TabsContent>

              <TabsContent value="unread" className="space-y-3 mt-6">
                {unreadNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucune notification non lue</p>
                  </div>
                ) : (
                  unreadNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="read" className="space-y-3 mt-6">
                {readNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucune notification lue</p>
                  </div>
                ) : (
                  readNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
