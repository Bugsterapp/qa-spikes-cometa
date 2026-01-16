'use client';

import { SessionProvider } from 'next-auth/react';
import AuthGuardAppRouter from '../src/guards/AuthGuardAppRouter';

export default function ChatWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthGuardAppRouter>{children}</AuthGuardAppRouter>
    </SessionProvider>
  );
}
