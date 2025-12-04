'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountManagement } from '@/components/account-management';

interface AccountPageClientProps {
  userId: string;
}

export function AccountPageClient({ userId }: AccountPageClientProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/settings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux paramètres
        </Link>
        <h1 className="text-3xl font-bold mb-2">Gestion du compte</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres avancés de votre compte
        </p>
      </div>

      {/* Account Management */}
      <AccountManagement userId={userId} />
    </div>
  );
}
