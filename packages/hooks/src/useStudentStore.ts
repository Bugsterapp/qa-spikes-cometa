import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ISelectionStore {
  studentIds: string[];
  setStudentIds: (studentIds: string[] | Set<string>) => void;
  clear: () => void;
}

const initialState = {
  studentIds: [],
};

export const useStudentStore = create<ISelectionStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setStudentIds: (studentIds) => {
          set((state) => ({
            studentIds: Array.from(new Set([...state.studentIds, ...studentIds])),
          }));
        },
        clear: () => {
          set((state) => ({
            ...state,
            studentIds: [],
          }));
        },
      }),
      { name: 'student-ids-store' }
    ),
    { name: 'student-ids-store', enabled: true }
  )
);
