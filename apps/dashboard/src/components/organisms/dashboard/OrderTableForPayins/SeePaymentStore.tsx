import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

interface MyState {
  idToHighlight: string | undefined;
  typeOfPayment: string | undefined;
  removeFromQueue: (id: string) => void;
  setTypeOfPayment: (type: string) => void;
  setId: (id: string) => void;
}

export const useRowToHighlight = create<MyState>()(
  devtools(
    immer((set) => ({
      idToHighlight: undefined,
      typeOfPayment: undefined,
      setId: (id: string) =>
        set((state) => {
          state.idToHighlight = id;
        }),
      setTypeOfPayment: (type: string) =>
        set((state) => {
          state.typeOfPayment = type;
        }),
      removeFromQueue: () =>
        set((state) => {
          state.idToHighlight = undefined;
        }),
    }))
  )
);
export const useIdToHighlight = () => useRowToHighlight((state) => state.idToHighlight);

export const useSetIdToHighlight = () => useRowToHighlight((state) => state.setId);
export const useTypeOfPayment = () => useRowToHighlight((state) => state.typeOfPayment);
export const useSetTypeOfPayment = () => useRowToHighlight((state) => state.setTypeOfPayment);
