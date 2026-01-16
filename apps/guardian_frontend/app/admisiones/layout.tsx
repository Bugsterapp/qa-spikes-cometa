import { ErrorBoundary } from '@sentry/nextjs';
import { PropsWithChildren } from 'react';

export default function AdmissionsLayout({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <main className="bg-[#f4f4f4] flex justify-center sm:p-12 font-lota antialiased bg-[url('/admissions/bg.svg')] bg-cover bg-bottom min-h-screen">
        {children}
      </main>
    </ErrorBoundary>
  );
}
