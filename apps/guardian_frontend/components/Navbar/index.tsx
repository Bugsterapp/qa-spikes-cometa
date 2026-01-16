'use client';
import BackButton from '~/components/atoms/guardians/BackButton';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { FraudStatusEnum } from '@cometa/trpc';
import { useGetWebview } from '~/stores/globalStore';
import { ComponentType } from 'react';

const SelectSchool = dynamic(() => import('./SelectSchool'), { ssr: false });
const DefaultMenu = dynamic(() => import('./Menu'), { ssr: false });

interface NavbarProps {
  backButton?: boolean;
  backButtonHref?: string;
  disabledTitle?: boolean;
  disabledMenu?: boolean;
  hideTour?: boolean;
  MenuComponent?: ComponentType<{ hideTour?: boolean }>;
}

const Navbar = ({
  backButton = false,
  backButtonHref = '',
  disabledTitle = false,
  disabledMenu = false,
  hideTour = false,
  MenuComponent,
}: NavbarProps) => {
  const Menu = MenuComponent ?? DefaultMenu;
  const menuComponent = disabledMenu ? <div className="w-6" /> : <Menu hideTour={hideTour} />;
  const session = useSession();
  const doesHasHighRiskProfile = session?.data?.user.fraud_status === FraudStatusEnum.HighRisk;
  const webview = useGetWebview();

  if (webview) return null;

  return (
    <header className="bg-white">
      <div className="max-w-md mx-auto px-4">
        <nav className="flex items-center justify-between min-h-[58px]">
          {backButton ? <BackButton id="nav-back-button" href={backButtonHref} /> : menuComponent}
          <div className="mx-auto">
            {!doesHasHighRiskProfile && <SelectSchool disabledTitle={disabledTitle} appRouter={!!MenuComponent} />}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
