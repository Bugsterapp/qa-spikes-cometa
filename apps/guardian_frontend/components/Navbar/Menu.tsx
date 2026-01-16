import { FraudStatusEnum } from '@cometa/trpc';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Drawer as Vaul } from 'vaul';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { TrackEvents } from '~/constants/events';
import { useSendEvent } from '~/hooks/useSendEvent';
import { getMenuLinks } from '~/lib/menuLinks';
import Logout from '~/public/icons/nav/logout.svg';
import useCheckoutStore from '~/stores/checkoutStore';
import { useSelectedSchool, useSetSelectedSchool } from '~/stores/globalStore';
import useOrderStore from '~/stores/ordersStore';
import { UTMLink as Link } from '../UtmNavigation';

const Menu = ({ hideTour: _hideTour }: { hideTour?: boolean }) => {
  const _router = useRouter();
  const session = useSession();
  const { guardianHash } = _router.query;
  const [open, setOpen] = useState(false);
  const clearCheckout = useCheckoutStore((state) => state.clear);
  const clearOrders = useOrderStore((state) => state.clear);
  const sendTrackEvent = useSendEvent();
  const selectedSchool = useSelectedSchool();
  const schoolName = selectedSchool?.name ?? 'cometa';
  const setSelectedSchool = useSetSelectedSchool();
  const doesHasHighRiskProfile = session?.data?.user.fraud_status === FraudStatusEnum.HighRisk;
  const subscriptionsEnabled = selectedSchool?.config_dashboard?.enable_subscriptions ?? false;

  const handleOpenChange = (isOpen: boolean) => {
    const trackEvent = isOpen ? TrackEvents.global.menu.menuOpened : TrackEvents.global.menu.menuClosed;
    sendTrackEvent(trackEvent);
    setOpen(isOpen);
  };

  const logout = () => {
    setSelectedSchool('');
    clearCheckout();
    clearOrders();
    signOut({ callbackUrl: `/guardians/${guardianHash}/login` });
  };

  const links = getMenuLinks({
    guardianHash: guardianHash as string,
    doesHasHighRiskProfile,
    subscriptionsEnabled,
    selectedSchool,
  });

  return (
    <Vaul.Root direction="left" open={open} onOpenChange={handleOpenChange}>
      <Vaul.Trigger asChild>
        <button className="justify-start bg-transparent" aria-label="menu" data-testId="menu-btn">
          <svg className="menu-icon text-[#57537A] w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      </Vaul.Trigger>

      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-[1200]" />
        <Vaul.Content
          data-testId="menu-drawer"
          className="fixed top-0 left-0 h-full bg-[#F6F5FA] z-[1300] shadow-xl w-full md:w-[30%] flex flex-col"
        >
          <div className="bg-white">
            <div className="grid grid-cols-3 items-center px-4 py-4">
              <Vaul.Close asChild>
                <button className="justify-self-start bg-transparent" aria-label="close menu">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </Vaul.Close>
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
                    onClick={() => {
                      sendTrackEvent(event, {
                        link: link.id,
                      });
                      setOpen(false);
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
          <div className="flex flex-col justify-end items-start p-4 pb-16 flex-1">
            <Image src="/powered.svg" height={30} width={100} alt="powered by" />
          </div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
};

export default Menu;
