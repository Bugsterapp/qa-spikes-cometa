'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { useStore } from 'zustand';

import { type OnboardingStore, createOnboardingStore } from './store';

export type OnboardingStoreApi = ReturnType<typeof createOnboardingStore>;

export const OnboardingStoreContext = createContext<OnboardingStoreApi | undefined>(undefined);

export interface OnboardingStoreProviderProps {
  children: ReactNode;
}

export const OnboardingStoreProvider = ({ children }: OnboardingStoreProviderProps) => {
  const storeRef = useRef<OnboardingStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createOnboardingStore();
  }

  return <OnboardingStoreContext.Provider value={storeRef.current}>{children}</OnboardingStoreContext.Provider>;
};

export const useOnboardingStore = <T,>(selector: (store: OnboardingStore) => T): T => {
  const onboardingStoreContext = useContext(OnboardingStoreContext);

  if (!onboardingStoreContext) {
    throw new Error(`useOnboardingStore must be used within OnboardingStoreProvider`);
  }

  return useStore(onboardingStoreContext, selector);
};
