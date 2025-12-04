import { redirect } from 'next/navigation';

export default function Home() {
  // Rediriger vers le feed (comme Instagram)
  redirect('/feed');
}
