import { signOut } from 'next-auth/react';
import JoyrideTooltip from '~/components/atoms/common/JoyrideTooltip';
import React, { useState, MouseEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import { SwipeableDrawer } from '@mui/material';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import ClearIcon from '@mui/icons-material/Clear';
import { MENU_JOYRIDE } from '~/utils/joyride';
import Tour from '~/components/atoms/common/Tour';
import useCheckoutStore from '~/stores/checkoutStore';
import useOrderStore from '~/stores/ordersStore';
import { useTour } from '~/hooks/useTour';
import type { CallBackProps } from 'react-joyride';
import useSendTrackEvent from '~/hooks/useSendEvent';
import Link from 'next/link';
import Home from '~/public/icons/nav/home.svg';
import Profile from '~/public/icons/nav/profile.svg';
import Billing from '~/public/icons/nav/billing.svg';
import FAQ from '~/public/icons/nav/faqs.svg';
import Chat from '~/public/icons/nav/support.svg';
import Logout from '~/public/icons/nav/logout.svg';
import History from '~/public/icons/nav/history.svg';
import Students from '~/public/icons/nav/students.svg';
import { useSelectedSchool, useSetSelectedSchool } from '~/components/molecules/common/AuthGlobal';

const Menu = ({ hideTour = false }: { hideTour?: boolean }) => {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const [open, setOpen] = useState(false);
  const clearCheckout = useCheckoutStore((state) => state.clear);
  const clearOrders = useOrderStore((state) => state.clear);
  const { showTour, handleShowTour } = useTour();
  const sendTrackEvent = useSendTrackEvent();
  const selectedSchool = useSelectedSchool();
  const schoolName = selectedSchool?.name ?? 'cometa';
  const setSelectedSchool = useSetSelectedSchool();

  const toggleDrawer =
    (open: boolean) => (event: MouseEvent<HTMLDivElement | HTMLButtonElement> | KeyboardEvent<HTMLDivElement>) => {
      if (
        event &&
        event.type === 'keydown' &&
        event instanceof KeyboardEvent &&
        (event.key === 'Tab' || event.key === 'Shift')
      )
        return;
      if (open === true) {
        sendTrackEvent('portal: Menu Open', {});
      }
      setOpen(open);
    };
  const logout = () => {
    setSelectedSchool('');
    clearCheckout();
    clearOrders();
    signOut({ callbackUrl: `/guardians/${guardianHash}/login` });
  };
  interface Link {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    href: string;
    id: string;
    external?: boolean;
  }
  const links: Link[] = [
    { icon: Home, label: 'Home', href: `/guardians/${guardianHash}`, id: 'home' },
    { icon: Profile, label: 'Mi perfil', href: `/guardians/${guardianHash}/profile`, id: 'profile' },
    { icon: Students, label: 'Estudiantes', href: `/guardians/${guardianHash}/students`, id: 'students' },
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
      id: 'talk-to-us',
    },
  ];

  const handleJoyrideCallback = (callBack: CallBackProps) => {
    if (callBack.status === 'finished') handleShowTour('menu');
  };

  return (
    <div>
      <>
        <Tour
          run={Boolean(showTour !== null && !showTour?.menu && !hideTour)}
          steps={MENU_JOYRIDE}
          tooltipComponent={JoyrideTooltip}
          callback={handleJoyrideCallback}
        />

        <button
          className="justify-start bg-transparent"
          aria-label="menu"
          data-test-id="menu-btn"
          onClick={toggleDrawer(true)}
        >
          {open ? null : <MenuIcon className="menu-icon text-[#57537A]" />}
        </button>
        <SwipeableDrawer
          anchor="left"
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          PaperProps={{ sx: { backgroundColor: '#F6F5FA', width: { xs: '100%', md: '30%' } } }}
        >
          <div
            className="px-4 bg-white"
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <div className="grid items-center grid-cols-3 py-4">
              <button onClick={toggleDrawer(true)} className="bg-transparent justify-self-start">
                <ClearIcon />
              </button>
              <span className="text-sm font-medium text-center md:hidden">{schoolName}</span>
            </div>
            <ul className="divide-y-[1px] border-[#E3E0FF]">
              {links.map((link) => {
                // If Guardian does not have students, we hide the navigation to home and history pages
                if (link.id === 'billing' && selectedSchool?.does_invoice === false) return null;

                const Icon = link.icon;
                const className = 'flex items-center gap-4 px-4 py-5 text-[#57537A]';
                return (
                  <li key={link.id} className="hover:bg-[#e3e0ff7f]">
                    {link.external ? (
                      <a className={className} href={link.href} target="_blank" rel="noopener noreferrer">
                        <Icon className="w-6" />

                        <span>{link.label}</span>
                      </a>
                    ) : (
                      <Link href={link.href} className={className}>
                        <Icon className="w-6" />

                        <span>{link.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
              <li className="hover:bg-[#e3e0ff7f]">
                <button
                  className="flex items-center w-full gap-4 px-4 py-5 bg-transparent text-[#57537A]"
                  onClick={logout}
                >
                  <Logout className="w-6" />
                  <span>Cerrar sesión</span>
                </button>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-end h-full p-4 pb-16">
            <Image src="/powered.svg" height={30} width={100} alt="powered by" />
          </div>
        </SwipeableDrawer>
      </>
    </div>
  );
};

export default Menu;
