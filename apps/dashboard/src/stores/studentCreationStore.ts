import { create } from 'zustand';

interface DrawerState {
  isOpen: boolean;
  selectedTab: 'search' | 'create' | null;
  guardian: Partial<Guardian.Guardian> | null;
  disabled: boolean;
  guardianFound: boolean;
  studentGuardians: Partial<Guardian.Guardian>[] | null;
}

interface DrawerStore extends DrawerState {
  setState: (state: Partial<DrawerState>) => void;
  setDisabled: (state: boolean) => void;
  setGuardian: (guardian: Partial<Guardian.Guardian> | null) => void;
  setOpen: (state: boolean) => void;
}

export const InitialDrawerState: DrawerState = {
  isOpen: false,
  selectedTab: null,
  guardian: null,
  disabled: true,
  guardianFound: false,
  studentGuardians: null,
};

export const useDrawerStore = create<DrawerStore>((set) => ({
  ...InitialDrawerState,
  setState: (state) => set(state),
  setDisabled: (state) => set({ disabled: state }),
  setGuardian: (guardian) => set({ guardian }),
  setOpen: (state) => set({ isOpen: state }),
}));

export const useSetDisabled = () => useDrawerStore((state) => state.setDisabled);
export const useGuardian = () =>
  useDrawerStore((state) => [state.guardian, state.setGuardian]) as [
    DrawerState['guardian'],
    DrawerStore['setGuardian']
  ];
export const useSetOpen = () => useDrawerStore((state) => state.setOpen);
export const useSetDrawerState = () => useDrawerStore((state) => state.setState);
