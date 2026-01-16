'use client';

import { FraudStatusEnum } from '@cometa/trpc';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import type React from 'react';
import { type MouseEvent, useState, useEffect } from 'react';
import { TrackEvents } from '~/constants/events';
import { useSendEvent } from '~/hooks/useSendEvent';
import { getMenuLinks } from '~/lib/menuLinks';
import Logout from '~/public/icons/nav/logout.svg';
import useCheckoutStore from '~/stores/checkoutStore';
import { useSelectedSchool, useSetSelectedSchool } from '~/stores/globalStore';
import useOrderStore from '~/stores/ordersStore';
import { UTMLink as Link } from './UtmNavigation';

const Menu = ({ hideTour: _hideTour }: { hideTour?: boolean }) => {
  const session = useSession();
  const guardianHash = session?.data?.user.hash;
  const [open, setOpen] = useState(false);
  const clearCheckout = useCheckoutStore((state) => state.clear);
  const clearOrders = useOrderStore((state) => state.clear);
  const sendTrackEvent = useSendEvent();
  const selectedSchool = useSelectedSchool();
  const schoolName = selectedSchool?.name ?? 'cometa';
  const setSelectedSchool = useSetSelectedSchool();
  const doesHasHighRiskProfile = session?.data?.user.fraud_status === FraudStatusEnum.HighRisk;
  const subscriptionsEnabled = selectedSchool?.config_dashboard?.enable_subscriptions ?? false;

  const toggleDrawer =
    (open: boolean, track = true) =>
    (event?: MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      if (
        event &&
        event.type === 'keydown' &&
        event instanceof KeyboardEvent &&
        (event.key === 'Tab' || event.key === 'Shift')
      )
        return;
      const trackEvent = open ? TrackEvents.global.menu.menuOpened : TrackEvents.global.menu.menuClosed;

      if (track) {
        sendTrackEvent(trackEvent);
      }
      setOpen(open);
    };

  // Close drawer on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        toggleDrawer(false)(undefined);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const logout = () => {
    setSelectedSchool('');
    clearCheckout();
    clearOrders();
    signOut({ callbackUrl: `/guardians/${guardianHash}/login` });
  };

  const links = getMenuLinks({
    guardianHash,
    doesHasHighRiskProfile,
    subscriptionsEnabled,
    selectedSchool,
  });

  return (
    <div>
      <button
        className="justify-start bg-transparent"
        aria-label="menu"
        data-testId="menu-btn"
        onClick={toggleDrawer(true)}
      >
        {open ? null : (
          <svg className="menu-icon text-[#57537A] w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleDrawer(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#F6F5FA] z-50 transform transition-transform duration-300 ease-in-out w-full md:w-[30%] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testId="menu-drawer"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white" role="presentation">
          <div className="grid grid-cols-3 items-center px-4 py-4">
            <button onClick={toggleDrawer(false)} className="justify-self-start bg-transparent" aria-label="close menu">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="text-sm font-medium text-center md:hidden">{schoolName}</span>
          </div>
          <ul className="divide-y-[1px] divide-[#F2F4F7]" data-testId="menu-linkList">
            {links.map((link) => {
              const Icon = link.icon;
              const className = 'flex items-center gap-4 px-4 py-4 text-[#57537A]';

              const event =
                link.id === 'faq' || link.id === 'chat'
                  ? TrackEvents[link.id].linkClicked
                  : TrackEvents.global.menu.linkClicked;
              return (
                <li
                  key={link.id}
                  className="hover:bg-[#e3e0ff7f]"
                  onClick={(e) => {
                    sendTrackEvent(event, {
                      link: link.id,
                    });
                    toggleDrawer(false)(e);
                  }}
                >
                  {'external' in link && link.external ? (
                    <a
                      className={className}
                      href={link.href}
                      data-testId={`${link.id}-menuLink`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="w-6" />

                      <span>{link.label}</span>
                    </a>
                  ) : (
                    <Link href={link.href} data-testId={`${link.id}-menuLink`} className={className}>
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
        <div className="flex flex-col justify-end items-start p-4 pb-16 h-full">
          <Image src="/powered.svg" height={30} width={100} alt="powered by" />
        </div>
      </div>
    </div>
  );
};

export default Menu;
