import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LandingPage from '@/components/landing-page';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si l'utilisateur est connecté, rediriger vers le feed
  if (user) {
    redirect('/feed');
  }

  // Sinon, afficher la landing page
  return <LandingPage />;
}
