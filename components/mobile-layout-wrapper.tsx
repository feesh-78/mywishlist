'use client';

import { BottomNav } from '@/components/mobile/bottom-nav';
import { FAB } from '@/components/mobile/fab';
import { useUser } from '@/lib/hooks/use-user';
import { useNotifications } from '@/lib/hooks/use-notifications';

export function MobileLayout() {
  const { data: user } = useUser();
  const { unreadCount } = useNotifications(user?.id);

  if (!user) {
    return null;
  }

  return (
    <>
      <BottomNav
        username={user.user_metadata?.username}
        unreadCount={unreadCount}
      />
      <FAB />
    </>
  );
}
