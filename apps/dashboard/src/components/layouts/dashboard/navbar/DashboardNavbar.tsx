import { Status2B3Enum, type DashboardSchool, type Membership } from '@cometa/trpc/src/types';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { getInitials } from '../../../../utils/get-initials';
import { getBlockedPaymentTooltipMessage } from '../../../../utils/payments';
import DarkArrowDown from '/public/assets/icons/dark-arrow-down.svg';
import { ConfigurationNav, MainNav } from '/src/components/nav-section/vertical';
import type {
  ConfigurationNavConfig,
  MainNavConfig,
  NavItem,
  NavItemKey,
} from '/src/components/nav-section/vertical/types';
import { Button } from '/src/components/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '/src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import { SchoolSwitcherContext } from '/src/contexts/SchoolSwitcherProvider';
import { BANNER_HEIGHT } from '/src/constants/ui';
import {
  useGetPermissions,
  useGetSchools,
  useSelectedSchool,
  useSetSelectedSchool,
  useGetMembership,
  useBannerVisible,
} from '/src/guards/AuthGuard';
import useCollapseDrawer from '/src/hooks/useCollapseDrawer';
import { PATH_AUTH, PATH_PORTAL } from '/src/routes/paths';
import { cn } from '/src/utils/cn';
import { getNavKeyFromPath, isConfigurationNavKey } from '../../../../utils/navigation';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { useSchoolSync } from '/src/hooks/useSchoolSync';
import CollapseButton from './CollapseButton';
import { configurationNav, mainNav } from './NavConfig';
import { useFlag, useFlagWithVariableMatching } from '../../../flags/FlagsProvider';
import { useOnboardingState } from '../../../../hooks/onboarding/useOnboardingState';
import { useOnboardingNavigation } from '../../../../hooks/onboarding/useOnboardingNavigation';
import { Action, useIntegrationsBlockedFields } from '/src/hooks/useIntegrationsBlockedFields';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { api } from '/src/utils/api';

export function DashboardNavbar({
  showConfigNav,
  setShowConfigNav,
}: {
  showConfigNav: boolean;
  setShowConfigNav: (show: boolean) => void;
}) {
  const [controlBoardFlag] = useFlag('control_board');
  const [changeSchoolCycleFlag] = useFlag('change_school_cycle');
  const { isEnabled: enableInstitutionDataFlag } = useFlagWithVariableMatching('enable_institution_data');
  const { isEnabled: enableBankAccountsFlag } = useFlagWithVariableMatching('enable_bank_accounts');
  const { isEnabled: enableFiscalEntitiesFlag } = useFlagWithVariableMatching('enable_fiscal_entities');
  const { isEnabled: enablePaymentBlockFlag } = useFlagWithVariableMatching('enable_payment_block_config');
  const { isEnabled: enableLegalDocumentsFlag } = useFlagWithVariableMatching('enable_legal_documents');
  const { isEnabled: enableSignaturesFlag } = useFlagWithVariableMatching('enable_signatures');
  const permissions = useGetPermissions();
  const membership = useGetMembership();
  const selectedSchool = useSelectedSchool();
  const bannerVisible = useBannerVisible();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const { onboardingState } = useOnboardingState();
  const { filterMainNavItems, filterConfigNavItems, shouldHideManualPaymentButton, isNavItemBlocked } =
    useOnboardingNavigation();
  const { isFieldBlocked } = useIntegrationsBlockedFields();

  const { data: blockedPeriodData } = api.payments.checkBlockedPeriods.useQuery(
    { schoolId: selectedSchool?.id || '' },
    { enabled: Boolean(selectedSchool?.id) }
  );

  const isBlockedPeriod = blockedPeriodData?.is_blocked || false;

  const { isCollapse, collapseClick, onToggleCollapse } = useCollapseDrawer();
  const router = useRouter();
  const { data: session } = useSession();
  const isPayManual = router?.pathname === PATH_PORTAL.pay.manual;
  const MEMBERSHIPS_WITH_USER_PAGE_ACCESS = ['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR'];
  const hasUserPageAccess = MEMBERSHIPS_WITH_USER_PAGE_ACCESS.includes(membership);
  const isSchoolInOnboarding = selectedSchool?.status === Status2B3Enum.Onboarding;

  const navItemsStatus: Record<NavItemKey, boolean> = {
    onboarding: Boolean(onboardingState?.show_onboarding_in_nav),
    collections: true,
    delinquency: true,
    payments: true,
    income: true,
    students: true,
    inscriptions: true,
    admissions: true,
    concepts: true,
    scholarships: true,
    users: true,
    inscriptionsQuota: true,
    levelsGradesGroups: true,
    institutionData: enableInstitutionDataFlag,
    invoicing: true,
    paymentBlock: enablePaymentBlockFlag,
    bankAccounts: enableBankAccountsFlag,
    fiscalEntities: enableFiscalEntitiesFlag,
    scholarshipsConfig: true,
    legalDocuments: enableLegalDocumentsFlag && isSchoolInOnboarding,
    configuration: true,
    control_board: controlBoardFlag?.enabled,
    school_cycle: changeSchoolCycleFlag?.enabled,
    announcements: true,
    credentials: Boolean(selectedSchool?.config_dashboard?.enable_credentials_access),
    signatures: enableSignaturesFlag,
    academic: true,
    academic_configurations: true,
    teachers: true,
    classrooms: true,
    score_cards: true,
    chat: session?.user?.email?.endsWith('@getcometa.com') ?? false,
  };

  const getEnabledNavItemKey = (key: NavItemKey) => {
    if (navItemsStatus[key] === undefined) return null;
    return navItemsStatus[key] ? key : null;
  };

  const membershipPermissionsAccess: Record<string, (NavItemKey | null)[]> = {
    OWNER: [
      getEnabledNavItemKey('control_board'),
      getEnabledNavItemKey('school_cycle'),
      getEnabledNavItemKey('institutionData'),
      getEnabledNavItemKey('invoicing'),
      getEnabledNavItemKey('paymentBlock'),
      getEnabledNavItemKey('bankAccounts'),
      getEnabledNavItemKey('fiscalEntities'),
      getEnabledNavItemKey('scholarshipsConfig'),
      getEnabledNavItemKey('legalDocuments'),
      getEnabledNavItemKey('credentials'),
      getEnabledNavItemKey('signatures'),
    ],
    GENERAL_DIRECTOR: [
      getEnabledNavItemKey('control_board'),
      getEnabledNavItemKey('school_cycle'),
      getEnabledNavItemKey('institutionData'),
      getEnabledNavItemKey('invoicing'),
      getEnabledNavItemKey('paymentBlock'),
      getEnabledNavItemKey('bankAccounts'),
      getEnabledNavItemKey('fiscalEntities'),
      getEnabledNavItemKey('scholarshipsConfig'),
      getEnabledNavItemKey('legalDocuments'),
      getEnabledNavItemKey('credentials'),
      getEnabledNavItemKey('signatures'),
    ],
    ADMINISTRATIVE_DIRECTOR: [
      getEnabledNavItemKey('control_board'),
      getEnabledNavItemKey('school_cycle'),
      getEnabledNavItemKey('institutionData'),
      getEnabledNavItemKey('invoicing'),
      getEnabledNavItemKey('paymentBlock'),
      getEnabledNavItemKey('bankAccounts'),
      getEnabledNavItemKey('fiscalEntities'),
      getEnabledNavItemKey('scholarshipsConfig'),
      getEnabledNavItemKey('legalDocuments'),
      getEnabledNavItemKey('credentials'),
      getEnabledNavItemKey('signatures'),
    ],
    ACCOUNTANT: [],
    TREASURER: [],
    ADMISSIONS: [],
    CASH_COLLECTION: [],
    OTHER: [],
  };

  function handleClickManualPayment() {
    sendTrackEventWithUserName(Events.manual_payment_initiated, {});
    router.push(PATH_PORTAL.pay.manual);
  }

  const [logOutModal, setLogOutModal] = useState(false);
  const [canTriggerHover, setCanTriggerHover] = useState(true);

  function handleCollapse() {
    onToggleCollapse();
    setLogOutModal(false);
    setShowConfigNav(false);
  }

  function handleRedirect() {
    setShowConfigNav(false);
    if (isCollapse) onToggleCollapse();
  }

  function logOut() {
    sendTrackEventWithUserName(Events.navigation_logout, {
      previous_page: router.pathname,
      logout_method: 'manual',
    });
    localStorage.clear();
    signOut({ redirect: true, callbackUrl: PATH_AUTH.login });
  }

  const schoolAccess: Record<string, boolean> = {
    admissions: Boolean(selectedSchool?.config_dashboard?.enable_admissions_access),
    announcements: Boolean(selectedSchool?.config_dashboard?.enable_announcements),
    academic: Boolean(selectedSchool?.config_dashboard?.enable_academic_access),
  };

  const permissionsMap: Record<string, keyof Membership> = {
    collections: 'can_view_collections_page',
    delinquency: 'can_view_delinquency_page',
    payments: 'can_view_received_payment_page',
    concepts: 'can_view_concepts_page',
    scholarships: 'can_view_scholarships_and_discounts',
    admissions: 'can_view_admissions_page',
    inscriptions: 'can_view_inscriptions_page',
    inscriptionsQuota: 'can_view_inscriptions_quotas_page',
  };

  const elementsThatAlwaysBeDisplayed: NavItemKey[] = ['students'];

  const mainSectionNames = Object.keys(mainNav);
  const baseMainNavItems = mainSectionNames.reduce((acc: Record<string, NavItem[]>, key) => {
    const navItems = mainNav[key as keyof typeof mainNav];

    const filteredItems = navItems.filter((item) => {
      if (elementsThatAlwaysBeDisplayed.includes(item.key)) return true;

      if (item.key === 'onboarding') {
        return Boolean(onboardingState?.show_onboarding_in_nav);
      }

      if (membershipPermissionsAccess[membership]?.includes(item.key)) return true;

      if (canViewIncomePage(item.key)) return true;

      if (item.key === 'chat') {
        return session?.user?.email?.endsWith('@getcometa.com') ?? false;
      }

      // Special case for announcements - only check school config, no permission required
      if (item.key === 'announcements') {
        return Boolean(selectedSchool?.config_dashboard?.enable_announcements);
      }
      // Special case for academic - only check school config, no permission required
      if (item.key === 'academic') {
        return Boolean(selectedSchool?.config_dashboard?.enable_academic_access);
      }

      return canViewPage(item.key);
    });

    acc[key] = filteredItems;
    return acc;
  }, {}) as MainNavConfig;

  const mainNavItems = filterMainNavItems(baseMainNavItems);

  const configurationSectionNames = Object.keys(configurationNav);
  const baseConfigurationNavItems = configurationSectionNames.reduce((acc: Record<string, NavItem[]>, key) => {
    const navItems = configurationNav[key as keyof typeof configurationNav];

    const filteredItems = navItems.filter((item) => {
      if (canViewUsersPage(item.key)) return true;
      if (membershipPermissionsAccess[membership]?.includes(item.key)) return true;
      if (item.key === 'levelsGradesGroups') {
        return !isFieldBlocked('page.levels_grades_groups', Action.View);
      }
      return canViewPage(item.key);
    });

    acc[key] = filteredItems;
    return acc;
  }, {}) as ConfigurationNavConfig;

  const configurationNavItems = filterConfigNavItems(baseConfigurationNavItems);

  function canViewIncomePage(key: NavItemKey) {
    if (key !== 'income') return false;

    return (
      permissions.can_view_income_page &&
      permissions.can_view_income_stats_cards &&
      permissions.can_view_registered_payments_table &&
      permissions.can_view_payouts_table
    );
  }

  function canViewUsersPage(key: NavItemKey) {
    if (key !== 'users') return false;
    return hasUserPageAccess;
  }

  function canViewPage(key: NavItemKey) {
    const permissionName = permissionsMap[key];
    const hasPermissionAssigned = permissionName && permissions[permissionName] === true;

    const accessIsNotSpecified = !(key in schoolAccess);
    const hasAccessEnabled = accessIsNotSpecified || Boolean(schoolAccess[key]);

    return hasPermissionAssigned && hasAccessEnabled;
  }

  function canViewConfigurationOption() {
    return hasUserPageAccess || permissions.can_view_inscriptions_page || !!getEnabledNavItemKey('school_cycle');
  }

  function isCurrentPageInConfiguration(): boolean {
    const currentNavKey = getNavKeyFromPath(router.pathname);
    return currentNavKey ? isConfigurationNavKey(currentNavKey) : false;
  }

  function findValidConfigurationNavItem(): NavItem | null {
    const sections = Object.entries(configurationNavItems).filter(([_, items]) => items.length > 0);

    const firstValidItem = sections
      .flatMap(([_, items]) => items)
      .find((item) => !item.disabled && !isNavItemBlocked(item.key));

    return firstValidItem ?? null;
  }

  function handleClickConfiguration() {
    if (showConfigNav) return;

    sendTrackEventWithUserName(Events.navigation_configuration, {
      action: 'open_configuration',
      current_page: router.pathname,
    });

    setShowConfigNav(true);
    setCanTriggerHover(false);

    if (!isCollapse) {
      onToggleCollapse();
    }

    setTimeout(() => {
      setCanTriggerHover(true);
    }, 300);

    if (!isCurrentPageInConfiguration()) {
      const validNavItem = findValidConfigurationNavItem();
      if (validNavItem) {
        router.push(validNavItem.path);
      }
    }
  }

  const variants: Variants = {
    expanded: { width: 248 },
    collapsed: { width: 68 },
  };

  const hoverVariants = {
    initial: {
      opacity: 1,
      zIndex: 10,
    },
    hover: {
      opacity: 0,
      zIndex: -1,
      transition: {
        opacity: { duration: 0.3 },
        zIndex: { delay: 0.3 },
      },
    },
  };

  const configurationVariants: Variants = {
    collapsed: { marginLeft: 0, width: 0, opacity: 0 },
    expanded: { marginLeft: 0, width: 248, opacity: 1 },
    hovered: { marginLeft: 68, width: 248, opacity: 1 },
  };

  const [shadowPosition, setShadowPosition] = useState({ top: false, bottom: false });

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('nav-section-vertical');
      if (element) {
        const isScrolledToTop = element.scrollTop === 0;
        const isScrolledToBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
        setShadowPosition({ top: isScrolledToTop, bottom: isScrolledToBottom });
      }
    };

    const handleResize = () => {
      handleScroll();
    };

    const element = document.getElementById('nav-section-vertical');
    element?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    handleScroll();

    return () => {
      element?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.div className="font-lota">
      <motion.div
        className="h-full row-span-2 overflow-auto"
        variants={variants}
        animate={isCollapse ? 'collapsed' : 'expanded'}
        initial={isCollapse ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-[#FBFCFD] z-30 border-r border-r-[#D5DEED] fixed outline-none group flex flex-col"
          style={{
            top: bannerVisible ? BANNER_HEIGHT : '0px',
            height: bannerVisible ? `calc(100vh - ${BANNER_HEIGHT})` : '100vh',
          }}
          variants={variants}
          initial={isCollapse ? 'collapsed' : 'expanded'}
          animate={showConfigNav ? 'hovered' : isCollapse ? 'collapsed' : 'expanded'}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => {
            if (showConfigNav && isCollapse && canTriggerHover) {
              onToggleCollapse();
            }
          }}
          onMouseLeave={() => {
            if (showConfigNav && !isCollapse) {
              onToggleCollapse();
            }
          }}
        >
          <motion.div
            className={cn('bg-[#FBFCFD] z-30 h-full border-r border-r-[#D5DEED] outline-none group flex flex-col', {
              'border-r-none shadow-[0px_24px_48px_0px_rgba(145,158,171,0.16)]': showConfigNav && !isCollapse,
            })}
            variants={variants}
            animate={isCollapse ? 'collapsed' : 'expanded'}
            initial={isCollapse ? 'collapsed' : 'expanded'}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={cn('flex flex-col px-5 py-4 gap-4 z-20 transition-shadow', {
                'shadow-card': shadowPosition.bottom || (!shadowPosition.bottom && !shadowPosition.top),
                'shadow-none': shadowPosition.bottom && shadowPosition.top,
              })}
              variants={variants}
              animate={isCollapse ? 'collapsed' : 'expanded'}
              initial={isCollapse ? 'collapsed' : 'expanded'}
              transition={{ duration: 0.2 }}
            >
              {isCollapse && (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    className="flex flex-row items-center justify-center w-full h-10"
                    key="LogoCollapse"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ ease: 'easeInOut', duration: 0.3 }}
                  >
                    <motion.div
                      className="flex group-hover:hidden"
                      variants={hoverVariants}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 1 }}
                      transition={{ delay: 0.3, ease: 'easeOut', duration: 0.3 }}
                    >
                      <LogoIcon />
                    </motion.div>
                    <motion.div
                      className="hidden group-hover:flex"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.3, ease: 'easeIn', duration: 0.3 }}
                    >
                      <CollapseButton onToggleCollapse={handleCollapse} collapseClick={collapseClick} />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              )}
              {!isCollapse && (
                <AnimatePresence mode="sync">
                  <motion.div
                    className="flex flex-row items-center justify-between flex-grow w-full"
                    key="Logo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: -0.3, ease: 'backInOut', duration: 0.3 }}
                  >
                    <FullLogoIcon />

                    {!showConfigNav ? (
                      <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              )}

              <SchoolSelector isCollapse={Boolean(isCollapse)} />
            </motion.div>

            <MainNav
              navConfig={mainNavItems}
              isCollapse={isCollapse}
              onClickConfiguration={handleClickConfiguration}
              onRedirect={handleRedirect}
              showConfigNav={showConfigNav}
              canViewConfigurationOption={canViewConfigurationOption()}
            />

            <motion.div
              className={cn(
                'flex flex-col gap-3 py-6 bg-[#FBFCFD] mt-auto transition-shadow h-[136px] w-full border-r border-r-[#D5DEED] z-20',
                isCollapse ? 'px-3.5' : 'px-6',
                {
                  'shadow-cardTop': shadowPosition.top || (!shadowPosition.top && !shadowPosition.bottom),
                  'shadow-none': shadowPosition.bottom && shadowPosition.top,
                  'border-r-none shadow-[0px_24px_48px_0px_rgba(145,158,171,0.16)]': showConfigNav && !isCollapse,
                }
              )}
              variants={variants}
              animate={isCollapse ? 'collapsed' : 'expanded'}
              initial={isCollapse ? 'collapsed' : 'expanded'}
              transition={{ duration: 0.3 }}
            >
              <Tooltip
                disableHover={!isBlockedPeriod}
                message={
                  isBlockedPeriod && blockedPeriodData?.start_date && blockedPeriodData?.end_date
                    ? getBlockedPaymentTooltipMessage(blockedPeriodData.start_date, blockedPeriodData.end_date)
                    : 'Los pagos están bloqueados actualmente debido a un período de bloqueo activo.'
                }
                fullWidth
              >
                <motion.button
                  className={cn(
                    'text-white hover:cursor-pointer flex-shrink-0 h-10 whitespace-nowrap font-bold text-sm flex items-center justify-center cursor-pointer outline-none rounded-full bg-[#00AB55] hover:bg-[#007B55]',
                    {
                      'opacity-0 invisible':
                        !permissions?.can_add_payment || isPayManual || shouldHideManualPaymentButton,
                      'opacity-50 cursor-not-allowed hover:bg-[#00AB55]': isBlockedPeriod,
                    }
                  )}
                  onClick={handleClickManualPayment}
                  disabled={isBlockedPeriod}
                  initial={{ width: isCollapse ? '40px' : '100%' }}
                  animate={{ width: isCollapse ? '40px' : '100%' }}
                  exit={{ width: isCollapse ? '40px' : '100%' }}
                  transition={{ ease: 'easeInOut', duration: 0.2, delay: isCollapse ? 0 : -0.2 }}
                >
                  <AnimatePresence>
                    {isCollapse ? (
                      <RegisterPaymentIcon />
                    ) : (
                      <span key="text" className="flex-shrink-0 text-white hover:cursor-pointer">
                        Registrar pago
                      </span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </Tooltip>

              <div
                className={cn('w-full flex items-center gap-2.5', {
                  'justify-center cursor-pointer': isCollapse,
                })}
                onClick={() => {
                  if (isCollapse) {
                    setLogOutModal(!logOutModal);
                  }
                }}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === 'Space') && isCollapse) {
                    event.preventDefault();
                    setLogOutModal(!logOutModal);
                  }
                }}
              >
                {isCollapse && logOutModal && (
                  <div className="bg-white border border-[#E4EBF6] shadow-conceptButton w-[228px] p-2 rounded-md h-[115px] z-30 transition-all duration-300 ease-in-out">
                    <div className="w-full h-[50px] flex items-center justify-start gap-[10px] px-[10px] py-[9px]">
                      <div className="w-8 h-8 rounded-full bg-[#C4CDD5] flex items-center justify-center text-sm text-[#637381] font-semibold">
                        {session?.user?.first_name.substring(0, 1)}
                        {session?.user?.last_name.substring(0, 1)}
                      </div>
                      <div className="flex flex-col max-w-[132px]">
                        <span className="text-sm font-semibold text-[#121012]">
                          {session?.user?.first_name} {session?.user?.last_name}
                        </span>
                        <span className="text-xs font-normal text-[#637381]">{session?.user?.email}</span>
                      </div>
                    </div>
                    <div className="w-full h-[1px] bg-[#E4EBF6] my-1" />
                    <div
                      className="w-full cursor-pointer flex items-center justify-between px-[10px] py-[9px]"
                      onClick={logOut}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === 'Space') {
                          logOut();
                        }
                      }}
                    >
                      <span className="text-sm text-[#1C1C1D]">Cerrar sesión</span>
                      <button
                        type="button"
                        className="flex items-center justify-center bg-transparent border-none outline-none hover:cursor-pointer"
                      >
                        <LogoutIcon />
                      </button>
                    </div>
                  </div>
                )}
                <div className="w-8 h-8 rounded-full bg-[#C4CDD5] flex items-center justify-center text-sm text-[#637381] font-semibold flex-shrink-0">
                  {getInitials(session?.user?.first_name || '', session?.user?.last_name || '')}
                </div>
                <AnimatePresence>
                  {!isCollapse ? (
                    <div className="flex items-center justify-between gap-2.5 w-full">
                      <div className="flex flex-col max-w-[132px]">
                        <span className="text-sm font-semibold text-[#121012]">
                          {session?.user?.first_name} {session?.user?.last_name}
                        </span>
                        <span className="text-[10px] font-normal text-[#637381]">{session?.user?.email}</span>
                      </div>
                      <button
                        type="button"
                        className="flex items-center justify-center bg-transparent border-none outline-none hover:cursor-pointer"
                        onClick={logOut}
                      >
                        <LogoutIcon />
                      </button>
                    </div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {showConfigNav ? (
        <motion.div
          className="h-full row-span-2"
          variants={configurationVariants}
          initial={isCollapse ? 'collapsed' : 'expanded'}
          animate={showConfigNav ? 'hovered' : isCollapse ? 'collapsed' : 'expanded'}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ConfigurationNav navConfig={configurationNavItems} />
        </motion.div>
      ) : null}
    </motion.div>
  );
}

export function SchoolSelector({ isCollapse }: { isCollapse: boolean }) {
  const [open, setOpen] = useState(false);
  const schools = useGetSchools();
  const selectedSchool = useSelectedSchool();
  const setSelectedSchool = useSetSelectedSchool();
  const router = useRouter();
  const { selectedCounter, setSelectedCounter } = useContext(SchoolSwitcherContext);
  const { broadcastSchoolChange } = useSchoolSync();
  const selectItem = (school: DashboardSchool) => {
    setSelectedSchool(school.id);
    setSelectedCounter(selectedCounter + 1);
    broadcastSchoolChange(school.id);
    setOpen(false);

    // Handles navigation after selecting a school based on the current URL path.
    // Examples:
    // - "/student" -> "/student"
    // - "/student" or "/student/1" -> "/student"
    // - "/concepts" or "/concepts/1" -> "/concepts"
    // - "/guardian/id" -> "/student"
    // - Any other URL -> "/charge"
    const pathSegments = router.pathname.split('/').filter(Boolean);
    const allowedPaths = ['student', 'concepts', 'guardian', 'payments'];
    const defaultPath = '/charge';

    if (pathSegments.length === 1) {
      router.push(router.pathname);
    } else if (pathSegments[0] === 'guardian' && pathSegments[1] === '[guardianId]') {
      router.push('/student');
    } else if (allowedPaths.includes(pathSegments[0])) {
      router.push(`/${pathSegments[0]}`);
    } else {
      router.push(defaultPath);
    }
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const reducedName = (name: string): string => name?.split(' ').reduce((acc, cur) => acc + cur[0], '');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <>
          {isCollapse && (
            <AnimatePresence>
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.3, ease: 'easeInOut' }}
                className="z-20 flex-shrink-0 py-4"
              >
                <Button
                  variant="outline"
                  data-testid="schoolname-Collapsable"
                  aria-expanded={open}
                  className="flex bg-[#F3F6FB] w-full border-none px-4 justify-center h-8 items-center text-[#212B36] font-semibold"
                >
                  {reducedName(selectedSchool?.name as string)}
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
          {!isCollapse && (
            <AnimatePresence>
              <motion.div
                key="icon"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.3, delay: 0.3, ease: 'easeInOut' }}
                className="z-20 flex-shrink-0"
              >
                <Button
                  variant="outline"
                  data-testid="schoolname-Collapsable"
                  aria-expanded={open}
                  className="flex bg-[#F3F6FB] w-full border-none flex-shrink-0 p-3 justify-between h-16"
                >
                  <motion.div
                    className={cn('text-[#212B36] font-semibold flex-shrink-0', {
                      'w-full': schools.length === 1,
                      'line-clamp-2 max-w-[156px] text-start': schools.length > 1,
                    })}
                    variants={{
                      initial: { opacity: 0, y: -20 },
                      show: { opacity: 1, y: 0 },
                    }}
                    initial="initial"
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ease: 'easeInOut', duration: 0.3 }}
                  >
                    <span>
                      {selectedSchool && isCollapse
                        ? reducedName(selectedSchool?.name as string)
                        : selectedSchool?.name}
                    </span>
                  </motion.div>
                  {schools.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ ease: 'easeInOut', duration: 0.3 }}
                    >
                      <DarkArrowDown />
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </>
      </PopoverTrigger>
      {schools.length > 1 && (
        <PopoverContent
          className={cn('w-[208px] p-0 shadow-schoolSelector', {
            'ml-4': isCollapse,
          })}
        >
          <Command className="z-30">
            {schools.length > 3 && (
              <>
                <CommandInput placeholder="Buscar" className="bg-[#F3F6FB] border-none ring-0" />
                <CommandEmpty>No se encontró ninguna escuela</CommandEmpty>
              </>
            )}
            <CommandList className="z-30 customScrollbar">
              <CommandGroup>
                {schools.map((school) => (
                  <CommandItem
                    className="cursor-pointer z-30 text-[#717993] hover:bg-[#F3F6FB] hover:text-[#212B36] flex px-2 py-3 items-center"
                    key={school.id}
                    value={school.name}
                    data-testid={`${school.name}-option`}
                    onSelect={() => {
                      selectItem(school);
                      setOpen(false);
                    }}
                  >
                    <span className="line-clamp-2 font-lota">{school.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}

function LogoIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>logo</title>
      <rect x="13.8333" width="26.6667" height="26.6667" fill="url(#paint0_radial_1675_118163)" />
      <rect x="0.5" y="26.6667" width="13.3333" height="13.3333" fill="url(#paint1_linear_1675_118163)" />
      <defs>
        <radialGradient
          id="paint0_radial_1675_118163"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(14.3889 26.1111) rotate(-45) scale(36.9267)"
        >
          <stop stopColor="#FF63AF" />
          <stop offset="0.135417" stopColor="#FF63AF" />
          <stop offset="0.296875" stopColor="#FF7E87" />
          <stop offset="0.473958" stopColor="#FE985F" />
          <stop offset="1" stopColor="#F89857" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_1675_118163"
          x1="0.5"
          y1="40"
          x2="14.9444"
          y2="26.6667"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F863AA" />
          <stop offset="1" stopColor="#FF63B0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FullLogoIcon() {
  return (
    <svg width="105" height="40" viewBox="0 0 105 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>logo</title>

      <g clipPath="url(#clip0_5047_24664)">
        <rect width="104.752" height="40" fill="none" />
        <path
          d="M0 21.2362C0 17.3234 2.84212 14.4065 6.78275 14.4065C9.45329 14.4065 11.7596 15.9143 12.5878 18.1027L10.1828 19.2012C9.90956 18.5264 9.43891 17.9503 8.83215 17.5486C8.22538 17.147 7.51029 16.938 6.78275 16.9505C4.5311 16.9505 2.86896 18.7516 2.86896 21.2506C2.86896 23.7495 4.52151 25.5727 6.78275 25.5727C7.51413 25.5823 8.23113 25.3695 8.83885 24.9612C9.44658 24.5538 9.91531 23.971 10.1828 23.2894L12.5878 24.433C11.7864 26.5447 9.47534 28.1254 6.78275 28.1254C2.868 28.134 0 25.172 0 21.2362Z"
          fill="#121012"
        />
        <path
          d="M30.3457 14.6991H32.9712V16.3286C33.7007 15.0633 35.0388 14.4057 36.6415 14.4057C37.4649 14.3808 38.2797 14.5764 39.0024 14.9722C39.7242 15.3681 40.3281 15.95 40.7489 16.6574C41.1649 15.9461 41.7669 15.3614 42.4897 14.9646C43.2124 14.5687 44.0281 14.3751 44.8525 14.4057C45.5043 14.3914 46.1514 14.5102 46.7552 14.7547C47.3591 14.9991 47.9065 15.3643 48.3647 15.8282C48.8219 16.2922 49.1804 16.8443 49.4162 17.4511C49.653 18.0578 49.7622 18.7068 49.7392 19.3576V27.8581H46.992V20.1005C46.992 18.1556 45.8753 16.9488 44.2227 16.9488C42.5702 16.9488 41.4036 18.1374 41.4036 20.1005V27.8485H38.7014V20.1005C38.7014 18.1556 37.5579 16.9488 35.9092 16.9488C34.2605 16.9488 33.1121 18.1374 33.1121 20.1005V27.8485H30.3649L30.3457 14.6991Z"
          fill="#121012"
        />
        <path
          d="M54.6688 19.8856H61.5906C61.58 19.4581 61.4842 19.0373 61.3087 18.6471C61.1333 18.257 60.8831 17.9052 60.5716 17.6119C60.2601 17.3186 59.8939 17.0905 59.4932 16.94C59.0926 16.7895 58.667 16.7195 58.2395 16.7348C56.4652 16.7166 55.0062 17.8832 54.6679 19.8731L54.6688 19.8856ZM51.751 21.2362C51.751 17.3013 54.548 14.4065 58.2404 14.4065C62.1992 14.4065 64.5094 17.3732 64.5094 20.7732C64.517 21.2055 64.4768 21.6378 64.3876 22.0606H54.6199C54.6736 22.8868 54.9909 23.6748 55.5248 24.3074C56.0587 24.941 56.7815 25.3868 57.5867 25.5794C58.3919 25.7721 59.2383 25.7021 60.0013 25.3791C60.7643 25.0561 61.4036 24.4972 61.8254 23.785L64.0771 24.8787C63.2757 26.747 61.1362 28.134 58.4609 28.134C54.5202 28.134 51.751 25.1222 51.751 21.2362Z"
          fill="#121012"
        />
        <path
          d="M68.1256 23.5416V17.1749H65.8193V14.6989H68.1256V11.0564H70.8729V14.6989H73.8588V17.1749H70.8681V23.4199C70.8681 24.7705 71.4758 25.5584 73.0564 25.5584C73.3584 25.5565 73.6594 25.5325 73.9575 25.4865V27.8417C73.4677 27.9251 72.9721 27.973 72.4756 27.9855C69.7063 27.9855 68.1256 26.3598 68.1256 23.5416Z"
          fill="#121012"
        />
        <path
          d="M80.4919 25.9552C80.9769 25.9792 81.461 25.9025 81.9153 25.7309C82.3697 25.5593 82.7838 25.2976 83.1327 24.9593C83.4816 24.6218 83.7567 24.2164 83.9427 23.7678C84.1286 23.3192 84.2197 22.838 84.212 22.3529V21.6503L80.5685 22.281C79.1096 22.5245 78.4521 23.2262 78.4521 24.249C78.4521 25.2708 79.3033 25.9552 80.4919 25.9552ZM75.5879 24.3697C75.5879 22.2532 76.9979 20.7004 80.0327 20.1914L84.212 19.507V18.998C84.212 17.7106 83.1672 16.7875 81.5865 16.7875C80.9232 16.7751 80.2714 16.963 79.7174 17.3272C79.1633 17.6915 78.731 18.2139 78.4789 18.8274L76.1956 17.6886C76.9481 15.7705 79.1585 14.4065 81.6584 14.4065C84.7709 14.4065 86.9593 16.2795 86.9593 18.9989V27.8416H84.3338V26.3108C83.8018 26.9137 83.1413 27.3911 82.4004 27.7065C81.6604 28.0218 80.859 28.1685 80.0548 28.1349C77.3842 28.134 75.5879 26.653 75.5879 24.3697Z"
          fill="#121012"
        />
        <path
          d="M25.2202 21.2592C25.2202 18.7832 23.4958 16.9591 21.2115 16.9591C18.9282 16.9591 17.2038 18.7602 17.2038 21.2592C17.2038 23.7581 18.9062 25.5813 21.2115 25.5813C23.5168 25.5813 25.2202 23.7351 25.2202 21.2592ZM14.3348 21.2592C14.3377 19.9028 14.7422 18.5781 15.4976 17.4518C16.2529 16.3255 17.3246 15.4484 18.5784 14.9308C19.8321 14.4132 21.2106 14.278 22.541 14.5435C23.8715 14.809 25.0927 15.4618 26.0522 16.4204C27.0117 17.3789 27.6645 18.6011 27.93 19.9306C28.1956 21.2601 28.0604 22.6385 27.5428 23.8923C27.0252 25.1452 26.1471 26.2178 25.0208 26.9722C23.8945 27.7275 22.5688 28.1311 21.2125 28.1339C20.3038 28.155 19.3998 27.9921 18.5553 27.6547C17.7109 27.3163 16.944 26.8111 16.3018 26.1679C15.6586 25.5248 15.1534 24.7589 14.8151 23.9144C14.4767 23.0718 14.3137 22.1679 14.3348 21.2592Z"
          fill="#121012"
        />
        <rect x="95.5566" y="1.8606" width="9.19586" height="9.19586" fill="url(#paint0_radial_5047_24664)" />
        <rect x="90.959" y="11.0564" width="4.59793" height="4.59793" fill="url(#paint1_linear_5047_24664)" />
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_5047_24664"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(95.7482 10.8649) rotate(-45) scale(12.734)"
        >
          <stop stopColor="#FF63AF" />
          <stop offset="0.135417" stopColor="#FF63AF" />
          <stop offset="0.296875" stopColor="#FF7E87" />
          <stop offset="0.473958" stopColor="#FE985F" />
          <stop offset="1" stopColor="#F89857" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_5047_24664"
          x1="90.959"
          y1="15.6543"
          x2="95.9401"
          y2="11.0564"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F863AA" />
          <stop offset="1" stopColor="#FF63B0" />
        </linearGradient>
        <clipPath id="clip0_5047_24664">
          <rect width="104.752" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function RegisterPaymentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>register payment</title>
      <g clipPath="url(#clip0_4525_365)">
        <path
          d="M3 0C2.20435 0 1.44129 0.316071 0.87868 0.87868C0.316071 1.44129 0 2.20435 0 3V11C0 11.7956 0.316071 12.5587 0.87868 13.1213C1.44129 13.6839 2.20435 14 3 14H6.6C6.43647 13.6804 6.30483 13.3454 6.207 13H3C2.46957 13 1.96086 12.7893 1.58579 12.4142C1.21071 12.0391 1 11.5304 1 11V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H11C11.5304 1 12.0391 1.21071 12.4142 1.58579C12.7893 1.96086 13 2.46957 13 3V6.207C13.349 6.306 13.683 6.437 14 6.6V3C14 2.20435 13.6839 1.44129 13.1213 0.87868C12.5587 0.316071 11.7956 0 11 0H3ZM6.5 7H8.337C9.232 6.37 10.323 6 11.5 6H6.5C6.36739 6 6.24021 6.05268 6.14645 6.14645C6.05268 6.24021 6 6.36739 6 6.5C6 6.63261 6.05268 6.75979 6.14645 6.85355C6.24021 6.94732 6.36739 7 6.5 7ZM2.5 2C2.36739 2 2.24021 2.05268 2.14645 2.14645C2.05268 2.24021 2 2.36739 2 2.5C2 2.63261 2.05268 2.75979 2.14645 2.85355C2.24021 2.94732 2.36739 3 2.5 3H11.5C11.6326 3 11.7598 2.94732 11.8536 2.85355C11.9473 2.85355 12 2.75979 12 2.5C12 2.36739 11.9473 2.24021 11.8536 2.14645C11.7598 2.05268 11.6326 2 11.5 2H2.5ZM3.5 8C3.89782 8 4.27936 7.84196 4.56066 7.56066C4.84196 7.27936 5 6.89782 5 6.5C5 6.10218 4.84196 5.72064 4.56066 5.43934C4.27936 5.15804 3.89782 5 3.5 5C3.10218 5 2.72064 5.15804 2.43934 5.43934C2.15804 5.72064 2 6.10218 2 6.5C2 6.89782 2.15804 7.27936 2.43934 7.56066C2.72064 7.84196 3.10218 8 3.5 8ZM3.5 7C3.36739 7 3.24021 6.94732 3.14645 6.85355C3.05268 6.75979 3 6.63261 3 6.5C3 6.36739 3.05268 6.24021 3.14645 6.14645C3.24021 6.05268 3.36739 6 3.5 6C3.63261 6 3.75979 6.05268 3.85355 6.14645C3.94732 6.24021 4 6.36739 4 6.5C4 6.63261 3.94732 6.75979 3.85355 6.85355C3.75979 6.94732 3.63261 7 3.5 7ZM3.5 12C3.89782 12 4.27936 11.842 4.56066 11.5607C4.84196 11.2794 5 10.8978 5 10.5C5 10.1022 4.84196 9.72064 4.56066 9.43934C4.27936 9.15804 3.89782 9 3.5 9C3.10218 9 2.72064 9.15804 2.43934 9.43934C2.15804 9.72064 2 10.1022 2 10.5C2 10.8978 2.15804 11.2794 2.43934 11.5607C2.72064 11.842 3.10218 12 3.5 12ZM3.5 10C3.63261 10 3.75979 10.0527 3.85355 10.1464C3.94732 10.2402 4 10.3674 4 10.5C4 10.6326 3.94732 10.7598 3.85355 10.8536C3.75979 10.9473 3.63261 11 3.5 11C3.36739 11 3.24021 10.9473 3.14645 10.8536C3.05268 10.7598 3 10.6326 3 10.5C3 10.3674 3.05268 10.2402 3.14645 10.1464C3.24021 10.0527 3.36739 10 3.5 10ZM16 11.5C16 12.6935 15.5259 13.8381 14.682 14.682C13.8381 15.5259 12.6935 16 11.5 16C10.3065 16 9.16193 15.5259 8.31802 14.682C7.47411 13.8381 7 12.6935 7 11.5C7 10.3065 7.47411 9.16193 8.31802 8.31802C9.16193 7.47411 10.3065 7 11.5 7C12.6935 7 13.8381 7.47411 14.682 8.31802C15.5259 9.16193 16 10.3065 16 11.5ZM12 9.5C12 9.36739 11.9473 9.24021 11.8536 9.14645C11.7598 9.05268 11.6326 9 11.5 9C11.3674 9 11.2402 9.05268 11.1464 9.14645C11.0527 9.24021 11 9.36739 11 9.5V11H9.5C9.36739 11 9.24021 11.0527 9.14645 11.1464C9.05268 11.2402 9 11.3674 9 11.5C9 11.6326 9.05268 11.7598 9.14645 11.8536C9.24021 11.9473 9.36739 12 9.5 12H11V13.5C11 13.6326 11.0527 13.7598 11.1464 13.8536C11.2402 13.9473 11.3674 14 11.5 14C11.6326 14 11.7598 13.9473 11.8536 13.8536C11.9473 13.7598 12 13.6326 12 13.5V12H13.5C13.6326 12 13.7598 11.9473 13.8536 11.8536C13.9473 11.7598 14 11.6326 14 11.5C14 11.3674 13.9473 11.2402 13.8536 11.1464C13.7598 11.0527 13.6326 11 13.5 11H12V9.5Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_4525_365">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>logout</title>
      <g clipPath="url(#clip0_4526_3198)">
        <path
          d="M7.65067 10C7.47386 10 7.30429 10.0702 7.17926 10.1953C7.05424 10.3203 6.984 10.4899 6.984 10.6667V12.6667C6.984 13.1971 6.77329 13.7058 6.39821 14.0809C6.02314 14.456 5.51443 14.6667 4.984 14.6667H3.33333C2.8029 14.6667 2.29419 14.456 1.91912 14.0809C1.54405 13.7058 1.33333 13.1971 1.33333 12.6667V3.33333C1.33333 2.8029 1.54405 2.29419 1.91912 1.91912C2.29419 1.54405 2.8029 1.33333 3.33333 1.33333H4.984C5.51443 1.33333 6.02314 1.54405 6.39821 1.91912C6.77329 2.29419 6.984 2.8029 6.984 3.33333V5.33333C6.984 5.51014 7.05424 5.67971 7.17926 5.80474C7.30429 5.92976 7.47386 6 7.65067 6C7.82748 6 7.99705 5.92976 8.12207 5.80474C8.2471 5.67971 8.31733 5.51014 8.31733 5.33333V3.33333C8.31627 2.4496 7.96475 1.60237 7.33985 0.97748C6.71496 0.352588 5.86773 0.00105857 4.984 0H3.33333C2.4496 0.00105857 1.60237 0.352588 0.97748 0.97748C0.352588 1.60237 0.00105857 2.4496 0 3.33333L0 12.6667C0.00105857 13.5504 0.352588 14.3976 0.97748 15.0225C1.60237 15.6474 2.4496 15.9989 3.33333 16H4.984C5.86773 15.9989 6.71496 15.6474 7.33985 15.0225C7.96475 14.3976 8.31627 13.5504 8.31733 12.6667V10.6667C8.31733 10.4899 8.2471 10.3203 8.12207 10.1953C7.99705 10.0702 7.82748 10 7.65067 10Z"
          fill="#8B93A0"
        />
        <path
          d="M15.2443 6.58605L12.187 3.52872C12.1255 3.46505 12.0519 3.41426 11.9706 3.37932C11.8893 3.34438 11.8018 3.32599 11.7133 3.32522C11.6248 3.32445 11.537 3.34132 11.455 3.37484C11.3731 3.40836 11.2987 3.45786 11.2361 3.52046C11.1735 3.58305 11.124 3.65749 11.0905 3.73942C11.0569 3.82135 11.0401 3.90914 11.0408 3.99766C11.0416 4.08617 11.06 4.17365 11.0949 4.25499C11.1299 4.33633 11.1807 4.40989 11.2443 4.47139L14.0857 7.31339L3.99967 7.33339C3.82286 7.33339 3.65329 7.40363 3.52827 7.52865C3.40325 7.65367 3.33301 7.82324 3.33301 8.00005C3.33301 8.17687 3.40325 8.34643 3.52827 8.47146C3.65329 8.59648 3.82286 8.66672 3.99967 8.66672L14.125 8.64605L11.243 11.5287C11.1793 11.5902 11.1285 11.6638 11.0936 11.7451C11.0587 11.8265 11.0403 11.9139 11.0395 12.0025C11.0387 12.091 11.0556 12.1788 11.0891 12.2607C11.1226 12.3426 11.1722 12.4171 11.2347 12.4797C11.2973 12.5422 11.3718 12.5917 11.4537 12.6253C11.5356 12.6588 11.6234 12.6757 11.7119 12.6749C11.8005 12.6741 11.8879 12.6557 11.9693 12.6208C12.0506 12.5858 12.1242 12.5351 12.1857 12.4714L15.243 9.41405C15.6181 9.03918 15.829 8.53066 15.8292 8.00033C15.8295 7.47 15.6191 6.96129 15.2443 6.58605Z"
          fill="#8B93A0"
        />
      </g>
      <defs>
        <clipPath id="clip0_4526_3198">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
