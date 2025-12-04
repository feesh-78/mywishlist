'use client';

import { create } from 'zustand';

type AuthAction = 'like' | 'comment' | 'follow' | 'create' | 'notification';

interface AuthDialogStore {
  isOpen: boolean;
  action: AuthAction;
  openDialog: (action: AuthAction) => void;
  closeDialog: () => void;
}

export const useAuthDialog = create<AuthDialogStore>((set) => ({
  isOpen: false,
  action: 'like',
  openDialog: (action) => set({ isOpen: true, action }),
  closeDialog: () => set({ isOpen: false }),
}));
