export type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'wishlist_invite'
  | 'wishlist_shared';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string;
  wishlist_id?: string;
  item_id?: string;
  comment_id?: string;
  content?: string;
  is_read: boolean;
  created_at: string;

  // Joined data
  actor?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  wishlist?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface NotificationWithDetails extends Notification {
  actor: NonNullable<Notification['actor']>;
}
