import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { announcementId?: string } }): Promise<Metadata> {
  const { announcementId } = params;

  return {
    title: announcementId ? 'Detalle de comunicado' : 'Comunicados',
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
