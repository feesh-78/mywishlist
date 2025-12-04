export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      wishlists: {
        Row: Wishlist
        Insert: Omit<Wishlist, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Wishlist, 'id' | 'user_id' | 'created_at'>>
      }
      wishlist_items: {
        Row: WishlistItem
        Insert: Omit<WishlistItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WishlistItem, 'id' | 'wishlist_id' | 'created_at'>>
      }
      referral_codes: {
        Row: ReferralCode
        Insert: Omit<ReferralCode, 'id' | 'created_at' | 'updated_at' | 'clicks_count' | 'conversions_count'>
        Update: Partial<Omit<ReferralCode, 'id' | 'user_id' | 'created_at'>>
      }
      followers: {
        Row: Follower
        Insert: Omit<Follower, 'id' | 'created_at'>
        Update: never
      }
      friendships: {
        Row: Friendship
        Insert: Omit<Friendship, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Friendship, 'id' | 'user_id_1' | 'user_id_2' | 'requested_by' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at' | 'is_read'>
        Update: Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Comment, 'id' | 'user_id' | 'created_at'>>
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'id' | 'created_at'>
        Update: never
      }
      wishlist_collaborators: {
        Row: WishlistCollaborator
        Insert: Omit<WishlistCollaborator, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WishlistCollaborator, 'id' | 'wishlist_id' | 'user_id' | 'invited_by' | 'created_at'>>
      }
      activities: {
        Row: Activity
        Insert: Omit<Activity, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  title: string
  description: string | null
  slug: string
  cover_image_url: string | null
  is_public: boolean
  is_collaborative: boolean
  event_date: string | null
  category: string | null
  created_at: string
  updated_at: string
}

export type WishlistItemStatus = 'available' | 'reserved' | 'purchased'

export interface WishlistItem {
  id: string
  wishlist_id: string
  title: string
  description: string | null
  url: string | null
  image_url: string | null
  price: number | null
  currency: string
  priority: number
  status: WishlistItemStatus
  reserved_by: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface ReferralCode {
  id: string
  user_id: string
  title: string
  description: string | null
  code: string
  url: string | null
  category: string | null
  clicks_count: number
  conversions_count: number
  created_at: string
  updated_at: string
}

export interface Follower {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined'

export interface Friendship {
  id: string
  user_id_1: string
  user_id_2: string
  status: FriendshipStatus
  requested_by: string
  created_at: string
  updated_at: string
}

export type NotificationType = 'follow' | 'comment' | 'like' | 'reserved' | 'collaboration_invite' | 'friend_request'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  actor_id: string | null
  entity_type: string | null
  entity_id: string | null
  is_read: boolean
  created_at: string
  expires_at: string
}

export interface Comment {
  id: string
  wishlist_id: string | null
  item_id: string | null
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

export type LikeEntityType = 'wishlist' | 'item' | 'comment'

export interface Like {
  id: string
  user_id: string
  entity_type: LikeEntityType
  entity_id: string
  created_at: string
}

export type CollaboratorRole = 'owner' | 'editor' | 'viewer'
export type CollaboratorStatus = 'pending' | 'accepted' | 'declined'

export interface WishlistCollaborator {
  id: string
  wishlist_id: string
  user_id: string
  role: CollaboratorRole
  invited_by: string
  status: CollaboratorStatus
  created_at: string
  updated_at: string
}

export type ActivityType = 'created_wishlist' | 'added_item' | 'reserved_item' | 'followed_user' | 'liked_wishlist' | 'commented'

export interface Activity {
  id: string
  user_id: string
  type: ActivityType
  entity_type: string | null
  entity_id: string | null
  is_public: boolean
  created_at: string
}

// Extended types with relations
export interface ProfileWithStats extends Profile {
  followers_count?: number
  following_count?: number
  wishlists_count?: number
  friends_count?: number
}

export interface WishlistWithItems extends Wishlist {
  items?: WishlistItem[]
  items_count?: number
  profile?: Profile
  collaborators?: WishlistCollaborator[]
}

export interface WishlistItemWithWishlist extends WishlistItem {
  wishlist?: Wishlist
  reserved_by_profile?: Profile
}

export interface CommentWithProfile extends Comment {
  profile?: Profile
  replies?: CommentWithProfile[]
  likes_count?: number
}

export interface ActivityWithDetails extends Activity {
  profile?: Profile
  wishlist?: Wishlist
  item?: WishlistItem
}

export interface NotificationWithDetails extends Notification {
  actor?: Profile
  wishlist?: Wishlist
  item?: WishlistItem
}
