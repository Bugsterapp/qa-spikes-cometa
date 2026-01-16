import Home from '~/public/icons/nav/home.svg';
import Profile from '~/public/icons/nav/profile.svg';
import Billing from '~/public/icons/nav/billing.svg';
import FAQ from '~/public/icons/nav/faqs.svg';
import Chat from '~/public/icons/nav/support.svg';
import History from '~/public/icons/nav/history.svg';
import Admissions from '~/public/icons/nav/admissions.svg';
import Students from '~/public/icons/nav/students.svg';
import Subscriptions from '~/public/icons/nav/subscriptions.svg';
import { School } from '@cometa/trpc/src/types';
import Announcements from '~/public/icons/nav/announcements.svg';

export interface MenuLink {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
  id: string;
  external?: boolean;
}

interface GetMenuLinksParams {
  guardianHash?: string;
  doesHasHighRiskProfile: boolean;
  subscriptionsEnabled: boolean;
  selectedSchool?: School;
}

export function getMenuLinks({
  guardianHash,
  doesHasHighRiskProfile,
  subscriptionsEnabled,
  selectedSchool,
}: GetMenuLinksParams): MenuLink[] {
  const conditionalLinks = doesHasHighRiskProfile
    ? [
        {
          icon: Billing,
          label: 'Datos de facturación',
          href: `/guardians/${guardianHash}/billing`,
          id: 'billing',
        },
      ]
    : [
        { icon: Students, label: 'Estudiantes', href: `/guardians/${guardianHash}/students`, id: 'students' },
        {
          icon: Subscriptions,
          label: 'Domiciliaciones',
          href: `/guardians/${guardianHash}/subscriptions`,
          id: 'subscriptions',
        },
        {
          icon: Billing,
          label: 'Datos de facturación',
          href: `/guardians/${guardianHash}/billing`,
          id: 'billing',
        },
        {
          icon: History,
          label: 'Historial de pagos',
          href: `/guardians/${guardianHash}/payments/history`,
          id: 'history',
        },
      ];

  const allLinks = [
    { icon: Home, label: 'Home', href: `/guardians/${guardianHash}`, id: 'home' },
    { icon: Profile, label: 'Mi perfil', href: `/guardians/${guardianHash}/profile`, id: 'profile' },
    ...conditionalLinks,
    {
      icon: Admissions,
      label: 'Admisiones',
      href: `/guardians/${guardianHash}/admissions`,
      id: 'admissions',
    },
    {
      icon: FAQ,
      label: 'Preguntas frecuentes',
      id: 'faq',
      href: 'https://cometa-tutoriales.super.site/',
      external: true,
    },
    {
      icon: Chat,
      label: 'Habla con nosotros',
      href: `/guardians/${guardianHash}/talk-to-us`,
      id: 'chat',
    },
    {
      icon: Announcements,
      label: 'Comunicaciones',
      href: `/announcements`,
      id: 'announcements',
    },
  ] as const;

  // Filter links based on conditions
  return allLinks.filter((link) => {
    if (link.id === 'billing' && selectedSchool?.does_invoice === false) return false;
    if (link.id === 'subscriptions' && !subscriptionsEnabled) return false;
    if (link.id === 'admissions' && !selectedSchool?.config_portal?.enable_admissions_access) return false;
    if (link.id === 'announcements' && !selectedSchool?.config_dashboard?.enable_announcements) return false;
    return true;
  });
}
