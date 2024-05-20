import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ISelectionStore {
  studentIds: Set<string>;
  setStudentIds: (studentIds: string[]) => void;
  clear: () => void;
}

export const useStudentStore = create<ISelectionStore>()(
  devtools(
    (set) => ({
      studentIds: new Set<string>(),
      setStudentIds: (studentIds) =>
        set((state) => ({
          ...state,
          studentIds: new Set<string>(studentIds),
        })),
      clear: () =>
        set((state) => ({
          ...state,
          studentIds: new Set<string>(),
        })),
    }),
    { name: 'student-ids-store' }
  )
);
