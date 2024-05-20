import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DrawerState {
  show: boolean;
  title: string;
  description: string;
}

interface DrawerStore extends DrawerState {
  showDrawer: (state: Omit<DrawerState, 'show'>) => void;
  hideDrawer: () => void;
}

const initialValues = { show: false, title: '', description: '' };

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
