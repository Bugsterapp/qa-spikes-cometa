import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface BackgroundProcessState {
  status: 'idle' | 'working' | 'success' | 'error' | 'cancelling' | 'cancelled';
  processQueue: string | null;
  setStatus: (status: BackgroundProcessState['status']) => void;
  addToQueue: (id: string) => void;
  removeFromQueue: () => void;
  removeAllFromQueue: () => void;
}

export const useBackgroundProcessStore = create<BackgroundProcessState>()(
  devtools(
    immer(
      persist(
        (set) => ({
          status: 'idle',
          processQueue: null,
          setStatus: (status) =>
            set((state) => {
              state.status = status;
            }),
          addToQueue: (id: string) =>
            set((state) => {
              state.processQueue = id;
            }),
          removeFromQueue: () =>
            set((state) => {
              state.processQueue = null;
            }),
          removeAllFromQueue: () =>
            set((state) => {
              state.processQueue = null;
              state.status = 'idle';
            }),
        }),
        {
          name: 'background-process-store',
          storage: createJSONStorage(() => localStorage),
        }
      )
    ),
    { name: 'background-process-store' }
  )
);

export const useBackgroundProcessStatus = () => useBackgroundProcessStore((store) => store.status);
export const useSetBackgroundProcessStatus = () => useBackgroundProcessStore((store) => store.setStatus);
export const useAddToProcessQueue = () => useBackgroundProcessStore((store) => store.addToQueue);
export const useRemoveFromProcessQueue = () => useBackgroundProcessStore((store) => store.removeFromQueue);
export const useRemoveAllFromProcessQueue = () => useBackgroundProcessStore((store) => store.removeAllFromQueue);
export const useProcessQueueId = () => useBackgroundProcessStore((store) => store.processQueue);
