import { useSession } from 'next-auth/react';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { useEffect } from 'react';
import { FraudStatusEnum } from '@cometa/trpc';
import { VerifyRFCProvider } from '~/contexts/VerifyRFCContext';
import { FeaturesProvider } from '~/contexts/FeaturesContext';
import {
  useSetSchools,
  useSelectedSchool,
  useSetSelectedSchool,
  useGetWebview,
  useSelectedSchoolId,
} from '~/stores/globalStore';

const AuthGlobal = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const setSchools = useSetSchools();
  const selectedSchool = useSelectedSchool();
  const selectedSchoolId = useSelectedSchoolId();
  const setSelectedSchool = useSetSelectedSchool();
  const webview = useGetWebview();

  // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      try {
        localStorage.clear();
        _router.push(`/guardians/${guardianHash}/login`);
      } catch {
        _router.push('/cookies-error');
      }
    },
  });

  useEffect(() => {
    if (
      session &&
      session.user?.onboarding_stage !== 'COMPLETED' &&
      !_router.pathname.includes('onboarding') &&
      !_router.pathname.includes('school-unavailable')
    )
      _router.push(`/guardians/${guardianHash}/onboarding`);

    const doesHasHighRiskProfile = session?.user.fraud_status === FraudStatusEnum.HighRisk;
    const chargebackSchoolId = process.env.NEXT_PUBLIC_CHARGEBACK_SCHOOL_ID;
    const schools =
      (!doesHasHighRiskProfile
        ? session?.user?.schools.filter((school) => school.id !== chargebackSchoolId)
        : session?.user?.schools) ?? [];
    setSchools(schools);
    if (doesHasHighRiskProfile && !!chargebackSchoolId) {
      setSelectedSchool(chargebackSchoolId);
    } else {
      // Don't override if in webview mode and a valid selectedSchoolId exists
      const isWebviewWithSelectedSchool = webview && selectedSchoolId;

      if (!isWebviewWithSelectedSchool) {
        if (!selectedSchool || !schools.some((school) => school.id === selectedSchool.id)) {
          setSelectedSchool(schools[0]?.id ?? '');
        }
      }
    }
  }, [session]);

  // FIXME: This logic prevents using the `update` callback of useSession

  if (status === 'loading')
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div
          className="inline-block h-20 w-20 animate-spin rounded-full border-[8px] border-solid border-blue-100 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          data-testid="loading-spinner"
        />
      </div>
    );

  return (
    <FeaturesProvider>
      <VerifyRFCProvider>{children}</VerifyRFCProvider>
    </FeaturesProvider>
  );
};

export default AuthGlobal;
