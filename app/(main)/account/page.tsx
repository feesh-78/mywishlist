import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AccountPageClient } from './page-client';

export const metadata = {
  title: 'Gestion du compte | MyWishList',
  description: 'Gérer votre compte MyWishList',
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <AccountPageClient userId={user.id} />;
}
