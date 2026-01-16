import { SchoolTypeEnum, type DashboardSchool, type Membership } from '@cometa/trpc/src/types';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import IcExclamation from 'public/assets/icons/ic_exclamation_solid.svg';
import IcWarningTriangle from 'public/assets/icons/ic_warning_triangle.svg';
import type React from 'react';
import { useEffect } from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import Grid from '../components/atoms/Grid';
import Banner, { NotificationBanner } from '../components/Banner';
import { BANNER_HEIGHT } from '../constants/ui';
import useSendUserIntercomEvent from '../hooks/useSendUserIntercomEvent';
import { useOnboardingState } from '../hooks/onboarding/useOnboardingState';
import { useOnboardingNavigation } from '../hooks/onboarding/useOnboardingNavigation';
import { getNavKeyFromPath } from '../utils/navigation';
import { PATH_AUTH, PATH_PORTAL } from '../routes/paths';
import { api } from '../utils/api';
import { useCSDExpiration } from '../hooks/useCSDExpiration';
import { useFlagWithVariableMatching } from '../components/flags/FlagsProvider';

AuthGuard.propTypes = {
  children: PropTypes.node,
};

type StateSetter<T extends unknown[]> = (...args: T) => void;

interface GlobalStoreState {
  schools: DashboardSchool[];
  selectedSchool: string | null;
  permissions: Membership;
  membership: string;
  dangerBannerVisible: boolean;
  onboardingBannerVisible: boolean;
  csdExpirationBannerVisible: boolean;
  csdExpiredBannerVisible: boolean;
  csdExpirationDate: string | null;
}

interface IGlobalStore extends GlobalStoreState {
  setSchools: StateSetter<[DashboardSchool[]]>;
  setSelectedSchool: StateSetter<[string]>;
  setPermissions: StateSetter<[Membership]>;
  setMembership: StateSetter<[string]>;
  setDangerBannerVisible: StateSetter<[boolean]>;
  setOnboardingBannerVisible: StateSetter<[boolean]>;
  setCsdExpirationBannerVisible: StateSetter<[boolean]>;
  setCsdExpiredBannerVisible: StateSetter<[boolean]>;
  setCsdExpirationDate: StateSetter<[string | null]>;
}

const initialState: GlobalStoreState = {
  schools: [],
  selectedSchool: null,
  permissions: {
    can_add_payment: false,
    can_add_discount: false,
    can_assign_scholarship: false,
    can_deassign_scholarship: false,
    can_assign_guardian: false,
    can_deassign_guardian: false,
    can_add_concept_assignment: false,
    can_edit_concept_assignment: false,
    can_delete_concept_assignment: false,
    can_edit_guardian: false,
    can_add_student: false,
    can_edit_student: false,
    can_send_whatsapp: false,
    can_assign_billing_guardian: false,
    can_view_student_status: false,
    can_add_concept: false,
    can_view_collections_page: false,
    can_view_received_payment_page: false,
    can_view_delinquency_page: false,
    can_view_concepts_page: false,
    can_view_admissions_page: false,
    can_view_income_stats_cards: false,
    can_view_registered_payments_table: false,
    can_view_payouts_table: false,
    can_view_income_page: false,
    can_view_student_total_debt: false,
    can_edit_stock: false,
    can_view_scholarships_and_discounts: false,
    can_delete_manual_payment: false,
    can_perform_invoicing: false,
    can_create_refund: false,
  },
  membership: '',
  dangerBannerVisible: false,
  onboardingBannerVisible: false,
  csdExpirationBannerVisible: false,
  csdExpiredBannerVisible: false,
  csdExpirationDate: null,
};

const useGlobalStore = create<IGlobalStore>()(
  devtools(
    persist<IGlobalStore>(
      (set) => ({
        ...initialState,
        setSchools: (schools: DashboardSchool[]) => set({ schools }),
        setSelectedSchool: (selectedSchool: string) => set({ selectedSchool }),
        setPermissions: (permissions: Membership) => set({ permissions }),
        setMembership: (membership: string) => set({ membership }),
        setDangerBannerVisible: (dangerBannerVisible: boolean) => set({ dangerBannerVisible }),
        setOnboardingBannerVisible: (onboardingBannerVisible: boolean) => set({ onboardingBannerVisible }),
        setCsdExpirationBannerVisible: (csdExpirationBannerVisible: boolean) => set({ csdExpirationBannerVisible }),
        setCsdExpiredBannerVisible: (csdExpiredBannerVisible: boolean) => set({ csdExpiredBannerVisible }),
        setCsdExpirationDate: (csdExpirationDate: string | null) => set({ csdExpirationDate }),
      }),
      {
        name: 'globalStore',
        version: 1,
        migrate: (persistedState: unknown, version: number): IGlobalStore => {
          if (version === 0) {
            return persistedState as IGlobalStore;
          }

          const state = persistedState as Partial<IGlobalStore>;

          if (!Array.isArray(state?.schools)) {
            return {
              ...state,
              schools: [],
            } as IGlobalStore;
          }

          return persistedState as IGlobalStore;
        },
      }
    ),
    {
      name: 'globalStore',
    }
  )
);
export const useOrinocoSchool = () => {
  const [selectedSchool, schools] = useGlobalStore((state) => [state.selectedSchool, state.schools]);
  return schools?.find((school) => school.id === selectedSchool)?.name.includes('Orinoco');
};
export const useSelectedSchool = () => {
  const [selectedSchool, schools] = useGlobalStore((state) => [state.selectedSchool, state.schools]);

  return schools?.find((school) => school.id === selectedSchool);
};
export const useSelectedSchoolId = () => useGlobalStore((state) => state.selectedSchool);

export const useSetSelectedSchool = () => useGlobalStore((state) => state.setSelectedSchool);
const useSetSchools = () => useGlobalStore((state) => state.setSchools);
export const useSetPermissions = () => useGlobalStore((state) => state.setPermissions);
export const useSetMembership = () => useGlobalStore((state) => state.setMembership);
/**
 * Hook to get the current user's permissions.
 * Returns an object containing all the user's permissions.
 * @returns {typeof Permissions}
 * Remember to update the permissions in the global store when the user's permissions change.
 */
export const useGetPermissions = () => useGlobalStore((state) => state.permissions);
export const useGetMembership = () => useGlobalStore((state) => state.membership);
export const useGetSchools = () => useGlobalStore((state) => state.schools);
export const useBannerVisible = () => {
  const dangerBannerVisible = useGlobalStore((state) => state.dangerBannerVisible);
  const onboardingBannerVisible = useGlobalStore((state) => state.onboardingBannerVisible);
  const csdExpirationBannerVisible = useGlobalStore((state) => state.csdExpirationBannerVisible);
  const csdExpiredBannerVisible = useGlobalStore((state) => state.csdExpiredBannerVisible);
  return dangerBannerVisible || onboardingBannerVisible || csdExpirationBannerVisible || csdExpiredBannerVisible;
};
export const useSetDangerBannerVisible = () => useGlobalStore((state) => state.setDangerBannerVisible);
export const useOnboardingBannerVisible = () => useGlobalStore((state) => state.onboardingBannerVisible);
export const useSetOnboardingBannerVisible = () => useGlobalStore((state) => state.setOnboardingBannerVisible);
export const useCsdExpirationBannerVisible = () => useGlobalStore((state) => state.csdExpirationBannerVisible);
export const useSetCsdExpirationBannerVisible = () => useGlobalStore((state) => state.setCsdExpirationBannerVisible);
export const useCsdExpiredBannerVisible = () => useGlobalStore((state) => state.csdExpiredBannerVisible);
export const useSetCsdExpiredBannerVisible = () => useGlobalStore((state) => state.setCsdExpiredBannerVisible);
export const useCsdExpirationDate = () => useGlobalStore((state) => state.csdExpirationDate);
export const useSetCsdExpirationDate = () => useGlobalStore((state) => state.setCsdExpirationDate);

export const SkeletonContent = () => (
  <main className="py-10 px-4 xl:px-9 2xl:px-16 3xl:px-32 w-full max-w-[calc(100vw-20px)] 2lg:max-w-[calc(100vw-290px)] space-y-4">
    <div className="w-full bg-gray-300 rounded-lg bg-opacity-30 animate-pulse h-14" />
    <div className="w-full h-8 bg-gray-300 rounded-lg bg-opacity-30 animate-pulse" />
    <div className="w-full bg-gray-300 rounded-lg bg-opacity-30 animate-pulse h-96" />
    <div className="w-full h-10 bg-gray-300 rounded-lg bg-opacity-30 animate-pulse" />
    <div className="w-full h-20 bg-gray-300 rounded-lg bg-opacity-30 animate-pulse" />
  </main>
);

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const bannerVisible = useBannerVisible();
  const setDangerBannerVisible = useSetDangerBannerVisible();
  const onboardingBannerVisible = useOnboardingBannerVisible();
  const setOnboardingBannerVisible = useSetOnboardingBannerVisible();
  const csdExpirationBannerVisible = useCsdExpirationBannerVisible();
  const setCsdExpirationBannerVisible = useSetCsdExpirationBannerVisible();
  const csdExpiredBannerVisible = useCsdExpiredBannerVisible();
  const setCsdExpiredBannerVisible = useSetCsdExpiredBannerVisible();
  const csdExpirationDate = useCsdExpirationDate();
  const setCsdExpirationDate = useSetCsdExpirationDate();

  const setSchools = useSetSchools();
  const setPermissions = useSetPermissions();
  const setMembership = useSetMembership();
  const membership = useGetMembership();
  const selectedSchool = useSelectedSchool();
  const setSelectedSchool = useSetSelectedSchool();
  const { onboardingState, isLoading: onboardingLoading } = useOnboardingState();
  const { isNavItemBlocked } = useOnboardingNavigation();
  const permissions = useGetPermissions();
  const { isEnabled: enableFiscalEntitiesFlag } = useFlagWithVariableMatching('enable_fiscal_entities');

  useSendUserIntercomEvent(selectedSchool as DashboardSchool);

  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push(PATH_AUTH.login);
    },
  });

  const { data: schools } = api.schools.schoolsList.useQuery(undefined, {
    enabled: !!session && status === 'authenticated',
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (schools) {
      setSchools(schools);
      if (!selectedSchool && schools.length > 0) {
        setSelectedSchool(schools[0].id);
      }
    }
  }, [schools, selectedSchool]);

  const { data: meData } = api.users.getMe.useQuery(
    {
      schoolId: selectedSchool?.id || schools?.[0]?.id || '',
    },
    {
      enabled: !!selectedSchool?.id && !!schools?.length,
    }
  );

  useEffect(() => {
    if (meData) {
      setPermissions(meData.permission_set);
      setMembership(meData.membership_name);
    }
  }, [meData]);

  const allowedMemberships = ['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR'];
  const hasAccessToFiscalEntities = allowedMemberships.includes(membership);

  const { data: fiscalEntities } = api.bot.getFiscalEntities.useQuery(
    {
      schoolId: selectedSchool?.id ?? '',
    },
    {
      enabled: !!selectedSchool?.id && enableFiscalEntitiesFlag && hasAccessToFiscalEntities,
      refetchOnWindowFocus: false,
    }
  );

  const { hasExpiringCSD, hasExpiredCSD, closestExpirationDate } = useCSDExpiration(fiscalEntities);

  useEffect(() => {
    if (!session?.user) return;

    const isStaff = Boolean(session.user.is_staff);
    const isCometaEmail = session.user.email?.endsWith('@getcometa.com') ?? false;
    const isCometaUser = isCometaEmail || isStaff;

    if (isCometaUser && !selectedSchool?.demo && selectedSchool?.school_type !== SchoolTypeEnum.Demo) {
      setDangerBannerVisible(true);
    } else {
      setDangerBannerVisible(false);
    }
  }, [session?.user, selectedSchool, router.asPath]);

  useEffect(() => {
    const shouldShowOnboarding = onboardingState?.show_onboarding_in_nav === true;

    if (shouldShowOnboarding) {
      setOnboardingBannerVisible(true);
    } else {
      setOnboardingBannerVisible(false);
    }
  }, [onboardingState]);

  useEffect(() => {
    if (hasExpiredCSD) {
      setCsdExpiredBannerVisible(true);
      setCsdExpirationBannerVisible(false);
      setCsdExpirationDate(null);
      return;
    }

    if (hasExpiringCSD && closestExpirationDate) {
      setCsdExpirationBannerVisible(true);
      setCsdExpiredBannerVisible(false);
      setCsdExpirationDate(closestExpirationDate);
      return;
    }

    setCsdExpirationBannerVisible(false);
    setCsdExpiredBannerVisible(false);
    setCsdExpirationDate(null);
  }, [hasExpiringCSD, hasExpiredCSD, closestExpirationDate]);

  useEffect(() => {
    if (onboardingLoading) {
      return;
    }

    if (router.pathname === '/welcome' || router.pathname === '/onboarding') {
      return;
    }

    if (onboardingState?.welcome_incomplete === true) {
      router.push('/welcome');
      return;
    }

    const currentPageNavKey = getNavKeyFromPath(router.pathname);
    if (currentPageNavKey && isNavItemBlocked(currentPageNavKey)) {
      router.push('/onboarding');
    }
  }, [permissions, onboardingState, onboardingLoading, router, isNavItemBlocked]);

  useEffect(() => {
    if (status === 'authenticated' && schools !== undefined) {
      if (!schools || schools.length === 0) {
        sessionStorage.setItem('auth_error', 'no_school_membership');
        signOut({
          callbackUrl: `${PATH_AUTH.login}?error=no_school_membership`,
          redirect: true,
        });
      }
    }
  }, [status, schools, router]);

  if (status === 'loading') {
    return (
      <Grid columns={['grid-cols-[auto_1fr]']} className="mx-auto max-w-screen-3xl h-screen grid-rows-[auto_1fr]">
        <header className="sticky top-0 bg-white z-10 col-start-2 col-end-[-1] row-span-1 h-16 px-9 2xl:px-24 3xl:px-48 shadow-sm flex items-center justify-end">
          <div className="w-8 h-8 bg-gray-300 rounded-full bg-opacity-30 animate-pulse" />
        </header>
        <div className="relative h-full row-span-2 row-start-1 py-16 overflow-auto ease-in-out border-r border-gray-600 w-80 col-span-auto border-opacity-10">
          <div className="px-4 mb-2 space-y-8 bg-white animate-pulse">
            <div className="block w-full px-6 py-2 bg-gray-300 bg-opacity-30 rounded-xl " />
            <div className="block w-full px-6 py-2 bg-gray-300 bg-opacity-30 rounded-xl " />
            <div className="block w-full px-6 py-2 bg-gray-300 bg-opacity-30 rounded-xl " />
            <div className="block w-full px-6 py-2 bg-gray-300 bg-opacity-30 rounded-xl " />
          </div>
        </div>
        <SkeletonContent />
      </Grid>
    );
  }

  const showDangerBanner =
    bannerVisible && !onboardingBannerVisible && !csdExpirationBannerVisible && !csdExpiredBannerVisible;

  return (
    <div>
      {showDangerBanner && (
        <Banner
          message={
            <div>
              <strong>¡Atención!</strong> Estás navegando en un colegio activo. Cualquier cambio afectará al colegio y
              sus estudiantes.
            </div>
          }
          isVisible={showDangerBanner}
          variant="danger"
          icon={<IcExclamation className="w-4 h-4 text-sm text-white" />}
          onClose={() => setDangerBannerVisible(false)}
        />
      )}
      {onboardingBannerVisible && (
        <NotificationBanner
          message={
            <div>
              <strong className="font-bold">Onboarding en proceso.</strong>{' '}
              <span className="font-normal">Completa la configuración inicial para empezar a usar Cometa</span>
            </div>
          }
          isVisible={onboardingBannerVisible}
          variant="default"
          showActionButton={router.pathname !== PATH_PORTAL.onboarding.root}
          onActionClick={() => router.push(PATH_PORTAL.onboarding.root)}
        />
      )}
      {csdExpirationBannerVisible && csdExpirationDate && (
        <NotificationBanner
          message={
            <>
              <span>Tu CSD vence el {csdExpirationDate}. </span>
              <span className="font-normal">
                Actualízalo antes de esa fecha para evitar interrupciones en tu facturación.
              </span>
            </>
          }
          isVisible={csdExpirationBannerVisible}
          variant="warning"
          icon={
            <div className="w-4 h-4 flex items-center justify-center">
              <IcWarningTriangle className="w-[15px] h-[14px] text-[#8c6a04]" />
            </div>
          }
          showActionButton={router.pathname !== PATH_PORTAL.fiscalEntities.root}
          onActionClick={() => router.push(PATH_PORTAL.fiscalEntities.root)}
        />
      )}
      {csdExpiredBannerVisible && (
        <NotificationBanner
          message={
            <>
              <span>Tu CSD ha vencido. </span>
              <span className="font-normal">Actualízalo para poder volver a emitir facturas.</span>
            </>
          }
          isVisible={csdExpiredBannerVisible}
          variant="danger"
          icon={
            <div className="w-4 h-4 flex items-center justify-center">
              <IcWarningTriangle className="w-[15px] h-[14px] text-[#8b3636]" />
            </div>
          }
          showActionButton={router.pathname !== PATH_PORTAL.fiscalEntities.root}
          onActionClick={() => router.push(PATH_PORTAL.fiscalEntities.root)}
        />
      )}
      <div
        style={{
          paddingTop:
            onboardingBannerVisible || bannerVisible || csdExpirationBannerVisible || csdExpiredBannerVisible
              ? BANNER_HEIGHT
              : '0px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default AuthGuard;
