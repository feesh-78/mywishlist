import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NotificationsPageClient } from './page-client';

export const metadata = {
  title: 'Notifications | MyWishList',
  description: 'Vos notifications',
};

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <NotificationsPageClient userId={user.id} />;
}
