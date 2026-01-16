import { Inter } from 'next/font/google';
import '../src/global_styles.css';

const inter = Inter({ subsets: ['latin'] });
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cometa AI',
  description: 'Cometa AI - Tu IA personalizada',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <meta charSet="utf-8" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/cometa.svg" />
      <link rel="icon" type="image/svg" sizes="32x32" href="/favicon/cometa.svg" />
      <link rel="icon" type="image/svg" sizes="16x16" href="/favicon/cometa.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
