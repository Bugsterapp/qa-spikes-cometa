'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { PATH_AUTH } from '../routes/paths';

export const SkeletonContent = () => (
  <main className="py-10 px-4 xl:px-9 2xl:px-16 3xl:px-32 w-full max-w-[calc(100vw-20px)] 2lg:max-w-[calc(100vw-290px)] space-y-4">
    <div className="w-full bg-gray-300 rounded-lg bg-opacity-30 animate-pulse h-14" />
    <div className="w-full h-8 bg-gray-300 rounded-lg bg-opacity-30 animate-pulse" />
    <div className="w-full bg-gray-300 rounded-lg bg-opacity-30 animate-pulse h-96" />
    <div className="w-full h-10 bg-gray-300 rounded-lg bg-opacity-30 animate-pulse" />
    <div className="w-full h-20 bg-gray-300 rounded-lg bg-opacity-30 animate-pulse" />
  </main>
);

function AuthGuardAppRouter({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push(PATH_AUTH.login);
    },
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <SkeletonContent />
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthGuardAppRouter;
