import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Tooltip } from '/src/components/atoms/Tooltip';
import NavSelectItems from '/src/components/layouts/dashboard/NavSelectItems';
import { cn } from '@cometa/utils';
import { ICONS } from '../../layouts/dashboard/navbar/NavConfig';
import { useBannerVisible } from '/src/guards/AuthGuard';
import { BANNER_HEIGHT } from '/src/constants/ui';
import type { ConfigurationNavConfig, MainNavConfig, NavItem } from './types';

export function MainNav({
  navConfig,
  isCollapse,
  onClickConfiguration,
  onRedirect,
  showConfigNav,
  canViewConfigurationOption,
}: {
  navConfig: MainNavConfig;
  isCollapse: boolean;
  onClickConfiguration: () => void;
  onRedirect: () => void;
  showConfigNav?: boolean;
  canViewConfigurationOption?: boolean;
}) {
  const item: NavItem = { key: 'configuration', icon: ICONS.configuration, title: 'Configuración', path: '' };

  return (
    <motion.div
      className={cn('flex flex-col gap-2.5 bg-[#FBFCFD] px-5 pb-4 overflow-auto overflow-x-hidden', {
        'px-3': isCollapse,
      })}
      id="nav-section-vertical"
    >
      {navConfig.onboarding.length > 0 && (
        <div className={cn({ 'px-0.5': isCollapse })}>
          <NavItems items={navConfig.onboarding} isCollapse={isCollapse} onClick={onRedirect} />
        </div>
      )}

      <div className={cn({ 'px-0.5': isCollapse })}>
        {!isCollapse ? <Title>Finanzas</Title> : <Divider isCollapse={isCollapse} />}
        <NavItems items={navConfig.finance} isCollapse={isCollapse} onClick={onRedirect} />
      </div>

      <div className={cn({ 'px-0.5': isCollapse })}>
        {!isCollapse ? <Title>Gestión</Title> : <Divider isCollapse={isCollapse} />}
        <NavItems items={navConfig.edManagement} isCollapse={isCollapse} onClick={onRedirect} />
      </div>

      {navConfig.announcements.length > 0 && (
        <div className={cn({ 'px-0.5': isCollapse })}>
          {!isCollapse ? <Title>Comunicaciones</Title> : <Divider isCollapse={isCollapse} />}
          <NavItems items={navConfig.announcements} isCollapse={isCollapse} onClick={onRedirect} />
        </div>
      )}

      {canViewConfigurationOption ? (
        <>
          <Divider isCollapse isFullWidth />
          <NavButton item={item} isCollapse={isCollapse} onClick={onClickConfiguration} isActive={showConfigNav} />
        </>
      ) : null}
    </motion.div>
  );
}

export function ConfigurationNav({ navConfig }: { navConfig: ConfigurationNavConfig }) {
  const bannerVisible = useBannerVisible();

  return (
    <motion.div
      className="flex flex-col gap-4 px-5 py-8 fixed left-[68px] w-[248px] border-r border-neutral-200 bg-[#FBFCFD]"
      style={{
        top: bannerVisible ? BANNER_HEIGHT : '0px',
        height: bannerVisible ? `calc(100vh - ${BANNER_HEIGHT})` : '100vh',
      }}
    >
      {navConfig.school_structure.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Title>Estructura escolar</Title>
          <NavItems items={navConfig.school_structure} isCollapse={false} />
        </div>
      ) : null}

      {navConfig.payments_collections.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Title>Pagos y cobranza</Title>
          <NavItems items={navConfig.payments_collections} isCollapse={false} />
        </div>
      ) : null}

      {navConfig.organization.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Title>Tu organización</Title>
          <NavItems items={navConfig.organization} isCollapse={false} />
        </div>
      ) : null}
    </motion.div>
  );
}

function NavItems({ items, isCollapse, onClick }: { items: NavItem[]; isCollapse: boolean; onClick?: () => void }) {
  return items.map((item) => (
    <NavItemComponent key={item.path} item={item} isCollapse={isCollapse} onClick={onClick} />
  ));
}

const itemStyles = {
  checked: 'bg-[#F4F6F8] font-semibold active:bg-[#00AB5514] active:text-[#00AB55]',
  normal:
    'w-full transition-all text-sm leading-5 font-lota hover:bg-[#00AB5514] hover:font-bold hover:text-[#00AB55] text-[#22283A] min-h-10 px-3 py-2.5 rounded-lg flex items-center flex-row gap-3 cursor-pointer transition-all duration-300 ease-in-out',
  onboarding:
    'w-full transition-all text-sm leading-5 font-lota bg-[#e9eef7] font-semibold text-[#1c1c1d] min-h-10 px-3 py-2.5 rounded-lg flex items-center flex-row gap-3 cursor-pointer transition-all duration-300 ease-in-out hover:bg-[#d5deed]',
};

function NavItemComponent({ item, isCollapse, onClick }: { item: NavItem; isCollapse: boolean; onClick?: () => void }) {
  const [openItemModal, setOpenItemModal] = React.useState(false);

  if (item.children) {
    return (
      <NavSelectItems
        key={item.path}
        isCollapse={isCollapse}
        openItemModal={openItemModal}
        setOpenItemModal={setOpenItemModal}
        itemStyles={itemStyles}
        item={item}
      />
    );
  }

  if (isCollapse) {
    return (
      <Tooltip key={item.path} message={item.title} disableHover={!isCollapse} delayDuration={0} side="right" fullWidth>
        <NavItemLink item={item} isCollapse={isCollapse} onClick={onClick} />
      </Tooltip>
    );
  }

  return <NavItemLink item={item} isCollapse={isCollapse} onClick={onClick} />;
}

function NavItemLink({ item, isCollapse, onClick }: { item: NavItem; isCollapse: boolean; onClick?: () => void }) {
  const router = useRouter();
  const isActive = (item: { path: string }) => item.path === router.pathname;
  const isOnboardingItem = item.key === 'onboarding';
  const isOnOnboardingPage = router.pathname === item.path && isOnboardingItem;
  const isDisabled = item.disabled;
  const isChatItem = item.key === 'chat';
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  const content = (
    <>
      <div
        className={cn('flex flex-shrink-0 w-4 h-4 relative z-10', {
          'text-[#B4B8C6]': isDisabled,
        })}
      >
        {item.icon}
      </div>
      {!isCollapse ? (
        <AnimatePresence>
          <motion.div
            className="flex flex-grow"
            initial={{ opacity: 0, display: 'none' }}
            animate={{ opacity: 1, display: 'block' }}
            exit={{ opacity: 0, display: 'none' }}
            transition={{ duration: 0.3, delay: 0.3, ease: 'easeInOut' }}
          >
            <p
              className={cn('line-clamp-2 relative z-10', {
                'text-[#B4B8C6]': isDisabled,
              })}
              data-testid={`${item.title}-link`}
            >
              {item.title}
            </p>
          </motion.div>
        </AnimatePresence>
      ) : null}
    </>
  );

  if (isDisabled) {
    return (
      <div
        key={item.path}
        className={cn(isOnOnboardingPage ? itemStyles.onboarding : itemStyles.normal, {
          [itemStyles.checked]: isActive(item) && !isOnboardingItem,
          'justify-center px-0 gap-0 max-w-10': isCollapse,
          'cursor-not-allowed hover:bg-transparent hover:font-normal hover:text-[#B4B8C6]': isDisabled,
        })}
        onClick={handleClick}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      key={item.path}
      href={item.path}
      scroll
      className={cn(
        isOnOnboardingPage ? itemStyles.onboarding : itemStyles.normal,
        {
          [itemStyles.checked]: isActive(item) && !isOnboardingItem,
          'justify-center px-0 gap-0 max-w-10': isCollapse,
        },
        isChatItem && 'relative overflow-hidden hover:!bg-transparent hover:!text-pink-600 hover:!font-semibold'
      )}
      onClick={handleClick}
      target={item.target}
      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isChatItem && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(236, 72, 153, 0.15) 40%, rgba(219, 39, 119, 0.15) 60%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      )}
      {content}
    </Link>
  );
}

function NavButton({
  item,
  isCollapse,
  onClick,
  isActive,
}: {
  item: NavItem;
  isCollapse: boolean;
  onClick: () => void;
  isActive?: boolean;
}) {
  if (isCollapse) {
    return (
      <Tooltip key={item.path} message={item.title} disableHover={!isCollapse} delayDuration={0} side="right" fullWidth>
        <NavItemButton item={item} isCollapse={isCollapse} onClick={onClick} isActive={isActive} />
      </Tooltip>
    );
  }

  return <NavItemButton item={item} isCollapse={isCollapse} onClick={onClick} isActive={isActive} />;
}

function NavItemButton({
  item,
  isCollapse,
  onClick,
  isActive,
}: {
  item: NavItem;
  isCollapse: boolean;
  onClick: () => void;
  isActive?: boolean;
}) {
  const isDisabled = item.disabled;

  const handleClick = () => {
    if (isDisabled) return;
    onClick();
  };

  return (
    <button
      type="button"
      key={item.path}
      onClick={handleClick}
      className={cn(itemStyles.normal, {
        [itemStyles.checked]: isActive && !isDisabled,
        'justify-center px-0 gap-0 max-w-10': isCollapse,
        'cursor-not-allowed hover:bg-transparent hover:font-normal hover:text-[#B4B8C6]': isDisabled,
      })}
    >
      <div
        className={cn('flex flex-shrink-0 w-4 h-4', {
          'text-[#B4B8C6]': isDisabled,
        })}
      >
        {item.icon}
      </div>
      <AnimatePresence>
        {!isCollapse ? (
          <motion.div
            className="flex flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: 'easeInOut' }}
          >
            <p
              className={cn('line-clamp-2', {
                'text-[#B4B8C6]': isDisabled,
              })}
              data-testid={`${item.title}-button`}
            >
              {item.title}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </button>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex items-center px-3 text-xs font-semibold uppercase h-7 whitespace-nowrap text-neutral-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.075, duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function Divider({ isCollapse, isFullWidth }: { isCollapse: boolean; isFullWidth?: boolean }) {
  return (
    <motion.div
      className="flex items-center justify-center w-full px-2 h-7"
      animate={{ opacity: isCollapse ? 1 : 0 }}
      transition={{ duration: 0.1, delay: isCollapse ? 0.11 : 0 }}
    >
      <motion.span
        id="divider"
        className={cn('h-[1px] bg-[#919EAB3D] w-7 block', {
          'w-full': isFullWidth,
        })}
        animate={{ width: isFullWidth ? '100%' : isCollapse ? 28 : 0 }}
        transition={{ duration: 0.1, delay: isCollapse ? 0.1 : 0 }}
      />
    </motion.div>
  );
}
