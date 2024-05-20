import PropTypes from 'prop-types';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PATH_AUTH } from '../routes/paths';
import ApiClient from '../services/ApiClient';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { School } from '@cometa/trpc/src/types';
import { devtools, persist } from 'zustand/middleware';
import Grid from '../components/atoms/Grid';
import React from 'react';
import useSendUserIntercomEvent from '../hooks/useSendUserIntercomEvent';

AuthGuard.propTypes = {
  children: PropTypes.node,
};

type StateSetter<T extends unknown[]> = (...args: T) => void;

type Permissions = Record<string, boolean>;

interface GlobalStoreState {
  schools: School[];
  selectedSchool: string | null;
  permissions: Permissions;
}

interface IGlobalStore extends GlobalStoreState {
  setSchools: StateSetter<[School[]]>;
  setSelectedSchool: StateSetter<[string]>;
  setPermissions: StateSetter<[Permissions]>;
}

const initialState: GlobalStoreState = {
  schools: [],
  selectedSchool: null,
  permissions: {},
};

const useGlobalStore = create<IGlobalStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setSchools: (schools) => set({ schools }),
        setSelectedSchool: (selectedSchool) => set({ selectedSchool }),
        setPermissions: (permissions) => set({ permissions }),
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
export const useOrinocoSchool = () => {
  const [selectedSchool, schools] = useGlobalStore((state) => [state.selectedSchool, state.schools]);
  return schools?.find((school) => school.id === selectedSchool)?.name.includes('Orinoco');
};
export const useSelectedSchool = () => {
  const [selectedSchool, schools] = useGlobalStore((state) => [state.selectedSchool, state.schools]);

  return schools.find((school) => school.id === selectedSchool);
};
export const useSelectedSchoolId = () => useGlobalStore((state) => state.selectedSchool);

export const useSetSelectedSchool = () => useGlobalStore((state) => state.setSelectedSchool);
const useSetSchools = () => useGlobalStore((state) => state.setSchools);
export const useSetPermissions = () => useGlobalStore((state) => state.setPermissions);
export const useGetPermissions = () => useGlobalStore((state) => state.permissions);
export const useGetSchools = () => useGlobalStore((state) => state.schools);

function AuthGuard({ children }: { children: React.ReactNode }) {
  const _router = useRouter();

  const setSchools = useSetSchools();
  const setPermissions = useSetPermissions();
  const selectedSchool = useSelectedSchool();
  const setSelectedSchool = useSetSelectedSchool();

  const schoolsQuery = async () => await ApiClient.getSchools(session?.token);
  useSendUserIntercomEvent(selectedSchool as School);

  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      _router.push(PATH_AUTH.login);
    },
  });

  const { data: schools } = useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: schoolsQuery,
    enabled: !!session && status === 'authenticated',
    onSuccess: (data) => {
      setSchools(data);
      if (!selectedSchool) {
        setSelectedSchool(data[0].id);
      }
    },
  });

  const permissionsQuery = async () =>
    await ApiClient.getMe(session?.token, selectedSchool?.id || (schools as School[])[0].id);

  useQuery({
    queryKey: ['permissions', selectedSchool?.id],
    queryFn: permissionsQuery,
    enabled: !!schools,
    onSuccess: ({ data }) => {
      setPermissions(data.permission_set);
    },
  });

  if (status === 'loading') {
    // Return skeleton while checking auth
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

        <main className="py-10 px-4 xl:px-9 2xl:px-16 3xl:px-32 w-full max-w-[calc(100vw-20px)] 2lg:max-w-[calc(100vw-290px)] space-y-4">
          <div className="w-full bg-gray-300 rounded-lg bg-opacity-30 animate-pulse h-14" />
          <div className="w-full h-8 bg-gray-300 rounded-lg bg-opacity-30 animate-pulse" />
          <div className="w-full bg-gray-300 rounded-lg bg-opacity-30 animate-pulse h-96" />
          <div className="w-full h-10 bg-gray-300 rounded-lg bg-opacity-30 animate-pulse" />
          <div className="w-full h-20 bg-gray-300 rounded-lg bg-opacity-30 animate-pulse" />
        </main>
      </Grid>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;
