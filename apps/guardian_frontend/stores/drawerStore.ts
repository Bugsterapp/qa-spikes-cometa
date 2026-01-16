import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Intent } from '~/components/Drawer.Variants';

interface DrawerState {
  show: boolean;
  title: string;
  intent: Intent;
  description: string;
}

interface DrawerStore extends DrawerState {
  showDrawer: (state: Omit<DrawerState, 'show'>) => void;
  hideDrawer: () => void;
}

const initialValues = { show: false, title: '', description: '', intent: 'success' as Intent };

export const useDrawerStore = create<DrawerStore>()(
  devtools(
    (set) => ({
      ...initialValues,
      showDrawer: (state) => set(() => ({ ...state, show: true })),
      hideDrawer: () => set(() => initialValues),
    }),
    { name: 'drawer' }
  )
);
