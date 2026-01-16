import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { School } from '@cometa/trpc/src/types';

type StateSetter<T extends unknown[]> = (...args: T) => void;

interface GlobalStoreState {
  schools: School[];
  selectedSchool: string | null;
  webview: boolean;
}

interface IGlobalStore extends GlobalStoreState {
  setSchools: StateSetter<[School[]]>;
  setSelectedSchool: StateSetter<[string]>;
  setWebview: StateSetter<[boolean]>;
}

const initialState: GlobalStoreState = {
  schools: [],
  selectedSchool: null,
  webview: false,
};

const useGlobalStore = create<IGlobalStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setSchools: (schools) => set({ schools }),
        setSelectedSchool: (selectedSchool) => set({ selectedSchool }),
        setWebview: (webview) => set({ webview }),
      }),
      {
        name: 'globalStore',
        storage: createJSONStorage(() => sessionStorage),
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

export const shouldUseKushkiSandbox = () => {
  const { getState } = useGlobalStore;

  const selectedSchool = getState().schools.find((school) => school.id === getState().selectedSchool);

  return Boolean(selectedSchool?.config_dashboard?.use_kushki_sandbox);
};

export const useSelectedSchool = () => {
  const [selectedSchool, schools] = useGlobalStore((state) => [state.selectedSchool, state.schools]);

  return schools.find((school) => school.id === selectedSchool);
};
export const useSelectedSchoolId = () => useGlobalStore((state) => state.selectedSchool);

export const useSetSelectedSchool = () => useGlobalStore((state) => state.setSelectedSchool);
export const useGetSchools = () => useGlobalStore((state) => state.schools);

export const useSetSchools = () => useGlobalStore((state) => state.setSchools);

export const useSetWebview = () => useGlobalStore((state) => state.setWebview);
export const useGetWebview = () => useGlobalStore((state) => state.webview);
