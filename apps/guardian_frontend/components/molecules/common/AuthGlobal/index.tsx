import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { School } from '@cometa/trpc/src/types';
import { VerifyRFCProvider } from '~/contexts/VerifyRFCContext';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { FeaturesProvider } from '~/contexts/FeaturesContext';

type StateSetter<T extends unknown[]> = (...args: T) => void;

interface GlobalStoreState {
  schools: School[];
  selectedSchool: string | null;
}

interface IGlobalStore extends GlobalStoreState {
  setSchools: StateSetter<[School[]]>;
  setSelectedSchool: StateSetter<[string]>;
}

const initialState: GlobalStoreState = {
  schools: [],
  selectedSchool: null,
};

const useGlobalStore = create<IGlobalStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setSchools: (schools) => set({ schools }),
        setSelectedSchool: (selectedSchool) => set({ selectedSchool }),
      }),
      {
        name: 'globalStore',
      }
    ),
    {
      name: 'globalStore',
    }
  )
);

export const getSchoolCredentials = () => {
  const { getState } = useGlobalStore;

  const selectedSchool = getState().schools.find((school) => school.id === getState().selectedSchool);

  return selectedSchool?.gateway_credentials;
};

export const useSelectedSchool = () => {
  const [selectedSchool, schools] = useGlobalStore((state) => [state.selectedSchool, state.schools]);

  return schools.find((school) => school.id === selectedSchool);
};
export const useSelectedSchoolId = () => useGlobalStore((state) => state.selectedSchool);

export const useSetSelectedSchool = () => useGlobalStore((state) => state.setSelectedSchool);
export const useGetSchools = () => useGlobalStore((state) => state.schools);

export const useSetSchools = () => useGlobalStore((state) => state.setSchools);

const AuthGlobal = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const setSchools = useSetSchools();
  const selectedSchool = useSelectedSchool();
  const setSelectedSchool = useSetSelectedSchool();

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
    if (session && session.user?.onboarding_stage !== 'COMPLETED' && !_router.pathname.includes('onboarding'))
      _router.push(`/guardians/${guardianHash}/onboarding`);

    const schools = session?.user?.schools ?? [];
    setSchools(schools);
    if (!selectedSchool || !schools.some((school) => school.id === selectedSchool.id)) {
      setSelectedSchool(schools[0]?.id ?? '');
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
