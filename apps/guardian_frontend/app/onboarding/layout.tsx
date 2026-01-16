'use client';
import React from 'react';
import { OnboardingStoreProvider } from './store/OnboardingStoreProvider';
import { sendPageViewed } from '~/utils/events';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  sendPageViewed('Onboarding', 'Portal');
  return (
    <div className="max-w-md mx-auto">
      <OnboardingStoreProvider>{children}</OnboardingStoreProvider>
    </div>
  );
}
