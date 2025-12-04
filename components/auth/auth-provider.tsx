'use client';

import { useUser } from '@/lib/hooks/use-user';
import { AuthBanner } from './auth-banner';
import { AuthDialog } from './auth-dialog';
import { useAuthDialog } from '@/lib/hooks/use-auth-dialog';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const { isOpen, action, closeDialog } = useAuthDialog();

  return (
    <>
      {children}
      {!user && <AuthBanner />}
      <AuthDialog isOpen={isOpen} onClose={closeDialog} action={action} />
    </>
  );
}
