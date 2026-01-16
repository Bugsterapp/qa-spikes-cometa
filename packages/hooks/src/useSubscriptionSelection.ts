import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RetrieveSubscribableConceptsResponseDTO } from '@cometa/trpc/src/types';
import { useStudentStore } from './useStudentStore';

interface State {
  selectedSubscriptions: RetrieveSubscribableConceptsResponseDTO[];
  totalToPay: number;
}

interface ISelectionStore extends State {
  setState: (state: Partial<State>) => void;
  setSelectedItems: (selectedItems: RetrieveSubscribableConceptsResponseDTO[]) => void;
  setTotalToPay: (totalToPay: number) => void;
  clear: () => void;
}

export const useSubscriptionStore = create<ISelectionStore>()(
  devtools(
    (set) => ({
      selectedSubscriptions: [],
      totalToPay: 0,
      studentIds: new Set<RetrieveSubscribableConceptsResponseDTO['student_id']>(),
      setState: (state) => set(state),
      setSelectedItems: (itemsSelected) => {
        set((state) => ({
          ...state,
          selectedSubscriptions: itemsSelected,
          totalToPay: itemsSelected.reduce((total, item) => total + Number(item.concept_price), 0),
        }));
        useStudentStore.setState({
          studentIds: itemsSelected.map((item) => item.student_id),
        });
      },
      setTotalToPay: (totalToPay) => set((state) => ({ ...state, totalToPay })),
      clear: () => {
        set((state) => ({
          ...state,
          selectedSubscriptions: [],
          totalToPay: 0,
        }));
        useStudentStore.setState({
          studentIds: [],
        });
      },
    }),
    { name: 'subscribables-selection' }
  )
);

/**
 * Hook to manage the selection of subscription on the project.
 * @returns  Object with the selected items, the total to pay, the function to select a subscription and the function to know if a subscription is disabled
 */
export const useSubscriptionSelection = () => {
  const { selectedSubscriptions: selectedItems, setSelectedItems, totalToPay } = useSubscriptionStore();

  const handleItemSelect = (subscribable: RetrieveSubscribableConceptsResponseDTO) => {
    const newSelectedFulfillments = selectedItems.some(
      (item) => item.concept_id === subscribable.concept_id && item.student_id === subscribable.student_id
    )
      ? selectedItems.filter(
          (item) => !(item.concept_id === subscribable.concept_id && item.student_id === subscribable.student_id)
        )
      : [...selectedItems, subscribable];

    setSelectedItems(newSelectedFulfillments);
  };

  const resetSelection = () => {
    setSelectedItems([]);
  };

  const isDisabled = (subscribable: RetrieveSubscribableConceptsResponseDTO) => {
    if (selectedItems.length === 0) return false;

    const isDisabled = !selectedItems.some(
      (item) => item.concept_id === subscribable.concept_id && item.student_id === subscribable.student_id
    );

    return isDisabled;
  };

  return {
    selectedItems,
    totalToPay,
    handleItemSelect,
    isDisabled,
    resetSelection,
  };
};
