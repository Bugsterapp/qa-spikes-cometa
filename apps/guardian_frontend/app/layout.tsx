import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/server/auth';
import ClientProviders from './ClientProviders';

import './global.css';

export const metadata: Metadata = {
  title: {
    template: '%s — Portal Cometa',
    default: 'Inicio', // a default is required when creating a template
  },
  description: 'Portal de pagos cometa',
  icons: [
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/apple-touch-icon.png?v=1.0.1',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png?v=1.0.1',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png?v=1.0.1',
    },
    {
      rel: 'mask-icon',
      url: '/safari-pinned-tab.svg?v=1.0.1',
      color: '#4a5cff',
    },
    {
      rel: 'shortcut icon',
      url: '/favicon.ico?v=1.0.1',
    },
  ],
  manifest: '/site.webmanifest?v=1.0.1',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="antialiased font-lota">
      <body>
        <main>
          <ClientProviders session={session}>{children}</ClientProviders>
        </main>
      </body>
    </html>
  );
}
