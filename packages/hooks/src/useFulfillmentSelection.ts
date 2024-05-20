import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DashboardDependentFulfillment, GuardianDependentOrder, StatusDc1Enum } from '@cometa/trpc/src/types';

export enum ProjectEnum {
  DASHBOARD = 'dashboard',
  PORTAL = 'portal',
}
export type DependentFulfillmentOrder = DashboardDependentFulfillment | GuardianDependentOrder;
export interface IUseSelectionOptions<T> {
  onSelect?: (fulfillment: T) => void;
  onUnselect?: (fulfillment: T) => void;
  extraConditionsInIsDisabled?: (fulfillment: T) => boolean;
}
interface State {
  selectedItems: DependentFulfillmentOrder[];
  totalToPay: number;
  studentIds: Set<DependentFulfillmentOrder['student']['id']>;
}

interface ISelectionStore extends State {
  setState: (state: Partial<State>) => void;
  setSelectedItems: (selectedItems: DependentFulfillmentOrder[]) => void;
  setTotalToPay: (totalToPay: number) => void;
  clear: () => void;
}

export const useSelectionStore = create<ISelectionStore>()(
  devtools(
    (set) => ({
      selectedItems: [],
      totalToPay: 0,
      studentIds: new Set<DependentFulfillmentOrder['student']['id']>(),
      setState: (state) => set(state),
      setSelectedItems: (itemsSelected) =>
        set((state) => ({
          ...state,
          selectedItems: itemsSelected,
          totalToPay: itemsSelected.reduce(
            (total, item) => total + Number('pending_amount' in item ? item.pending_amount : item.final_amount),
            0
          ),
          studentIds: new Set<DependentFulfillmentOrder['student']['id']>(itemsSelected.map((item) => item.student.id)),
        })),
      setTotalToPay: (totalToPay) => set((state) => ({ ...state, totalToPay })),
      clear: () =>
        set((state) => ({
          ...state,
          selectedItems: [],
          totalToPay: 0,
          studentIds: new Set<DependentFulfillmentOrder['student']['id']>(),
        })),
    }),
    { name: 'fulfillment-selection' }
  )
);

/**
 * Hook to manage the selection of fulfillments depending on the project.
 * @info https://www.notion.so/cometa/L-gica-de-Bloqueos-de-Fulfillments-Ordenes-en-Dashboard-y-Portal-49eabc20635f484d87f9d87abd89490d
 * @param fulfillments  Fulfillments to be selected
 * @param project  Project to be used in the hook, dashboard or portal
 * @param options  Options to be used in the hook
 * @returns  Object with the selected items, the total to pay, the function to select a fulfillment and the function to know if a fulfillment is disabled
 */
export const useFulfillmentSelection = (
  fulfillments: DashboardDependentFulfillment[],
  project: ProjectEnum,
  options?: IUseSelectionOptions<DependentFulfillmentOrder>
) => {
  const { selectedItems, setSelectedItems, totalToPay } = useSelectionStore();

  const prepareItems = (prevItems: DependentFulfillmentOrder[], item: DependentFulfillmentOrder) => {
    if (prevItems.some((prevItem) => prevItem.id === item.id)) {
      // If the item is in the state, we remove it
      if (options?.onUnselect) {
        options.onUnselect(item);
      }
      if (project === ProjectEnum.PORTAL) {
        return prevItems.filter((prevItem) => prevItem.id !== item.id);
      } else {
        if ('fulfillments_dependent' in item) {
          const removeIds = [...item.fulfillments_dependent, item.id];
          return prevItems.filter((prevItem) => !removeIds.includes(prevItem.id));
        }
        return prevItems.filter((prevItem) => prevItem.id !== item.id);
      }
    } else {
      // If the item is not in the state, we add it
      if (options?.onSelect) {
        options.onSelect(item);
      }
      return [...prevItems, item];
    }
  };

  const handleItemSelect = (item: DependentFulfillmentOrder) => {
    const newSelectedFulfillments = prepareItems(selectedItems, item);
    setSelectedItems(newSelectedFulfillments);
  };

  /**
   * If the fulfillment has dependent fulfillments and any of them are in progress or partial, then it is true.
   * @param dependencyId ID dependent fulfillment
   * @returns boolean
   */
  const isDependentFulfillmentInProcess = (dependencyId: string) =>
    fulfillments.some(
      (fulfillment) => fulfillment.id === dependencyId && fulfillment.status === StatusDc1Enum.WAITING_PAID
    );

  /**
   * If the fulfillment has dependent fulfillments and any of them are selected, in progress,
   * or partial, then it is true
   * @param fulfillment Fulfillment to evaluate
   * @returns boolean
   */
  const isDependentFulfillmentSelectedPortal = (fulfillment: DependentFulfillmentOrder) =>
    'fulfillments_dependent_proxy' in fulfillment
      ? fulfillment.fulfillments_dependent_proxy.some(
          (dependencyId) =>
            selectedItems.some((selectedFulfillment) => selectedFulfillment.id === dependencyId) ||
            isDependentFulfillmentInProcess(dependencyId)
        )
      : false;

  /**
   * If the fulfillment has dependent fulfillments and any of them are in progress,
   * or partial, then it is true
   * @param fulfillment Fulfillment to evaluate
   * @returns boolean
   */
  const isDependentFulfillmentSelectedDashboard = (fulfillment: DependentFulfillmentOrder) =>
    'fulfillments_dependent_proxy' in fulfillment
      ? fulfillment?.fulfillments_dependent_proxy.some((dependencyId) => isDependentFulfillmentInProcess(dependencyId))
      : false;

  /**
   * If the fulfillment has required fulfillments and any of them are in progress or partial, then it is true
   * @param requireId ID required fulfillment
   * @returns boolean
   */
  const isRequireInPartialOrInProcess = (requireId: string) =>
    fulfillments.some(
      (f) => f.id === requireId && (f.status === StatusDc1Enum.WAITING_PAID || f.status === StatusDc1Enum.PARTIAL_PAID)
    );

  /**
   * If the fulfillment has required fulfillments and any of them are not selected
   * or any of them are in process or partial, then it is true
   * @param fulfillment Fulfillment to evaluate
   * @returns boolean
   */
  const haveRequiresNotSelectedOrIsPartialOrInProcess = (fulfillment: DashboardDependentFulfillment) =>
    fulfillment.paid_fulfillments_required_proxy.some(
      (requireId) =>
        !selectedItems.some((selectedFulfillment) => selectedFulfillment.id === requireId) ||
        isRequireInPartialOrInProcess(requireId)
    );

  const whenSelectedPartialDisableOthers = (
    selectedItem: DependentFulfillmentOrder,
    curr: DependentFulfillmentOrder
  ) => {
    const selectedItemStatus = 'status' in selectedItem ? selectedItem.status : null;
    return curr.id !== selectedItem.id && selectedItemStatus === StatusDc1Enum.PARTIAL_PAID;
  };

  const whenSelectedNormalDisablePartials = (
    selectedItem: DependentFulfillmentOrder,
    curr: DependentFulfillmentOrder
  ) => {
    const currStatus = 'status' in curr ? curr.status : null;
    const selectedItemStatus = 'status' in selectedItem ? selectedItem.status : null;
    return currStatus === StatusDc1Enum.PARTIAL_PAID && selectedItemStatus !== StatusDc1Enum.PARTIAL_PAID;
  };

  /**
   * Search in selected items if any of them meets the conditions
   * @param selectedItems Array of selected items
   * @param fulfillment Fulfillment to evaluate
   * @returns boolean
   */
  const whenSelectedFulfillments = (
    selectedItems: DependentFulfillmentOrder[],
    fulfillment: DependentFulfillmentOrder
  ) =>
    selectedItems.some(
      (selectedFulfillment) =>
        whenSelectedPartialDisableOthers(selectedFulfillment, fulfillment) ||
        whenSelectedNormalDisablePartials(selectedFulfillment, fulfillment)
    );

  const isDisabled = (fulfillment: DependentFulfillmentOrder) => {
    const isDisabled =
      'status' in fulfillment &&
      (fulfillment.status === StatusDc1Enum.WAITING_PAID || haveRequiresNotSelectedOrIsPartialOrInProcess(fulfillment));

    if (isDisabled) return isDisabled;

    if (options && options.extraConditionsInIsDisabled) {
      if (options.extraConditionsInIsDisabled(fulfillment)) return options.extraConditionsInIsDisabled(fulfillment);
    }

    if (project === ProjectEnum.DASHBOARD) {
      return (
        whenSelectedFulfillments(selectedItems, fulfillment) || isDependentFulfillmentSelectedDashboard(fulfillment)
      );
    }

    if (project === ProjectEnum.PORTAL) {
      return !Number(fulfillment.final_amount) || isDependentFulfillmentSelectedPortal(fulfillment);
    }
  };

  return {
    selectedItems,
    totalToPay,
    handleItemSelect,
    isDisabled,
  };
};
