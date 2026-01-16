import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { DashboardDependentFulfillment, GuardianDependentFulfillment, StatusDc1Enum } from '@cometa/trpc/src/types';
import {
  calculateTotalToPay,
  CartItem,
  isDashboardDependentFulfillment,
  ISelectionStore,
  prepareItemQuantities,
  prepareItems,
  ProjectEnum,
  TOrderByProject,
  TOrderDashboard,
  TOrderOnlineStore,
  TOrderPortal,
  useStudentStore,
} from '@cometa/hooks';

/**
 * @description The any is set to be able to use generics in the creation of the store
 * @see https://github.com/pmndrs/zustand/discussions/841#discussioncomment-2280391
 */
const useStoreBase = create<ISelectionStore<any>>()(
  devtools(
    persist(
      (set, get) => ({
        selectedItems: [],
        itemQuantities: [],
        totalToPay: 0,
        ordersHaveDependents: false,
        setState: (state) => set(state),
        setSelectedItems: (itemsSelected) => {
          set((state) => ({
            ...state,
            selectedItems: itemsSelected,
            totalToPay: calculateTotalToPay(itemsSelected, state.itemQuantities),
            ordersHaveDependents: itemsSelected.every((item) => item.student),
          }));
        },
        setItemQuantities: (newItemQuantites) => {
          set((state) => ({
            ...state,
            itemQuantities: newItemQuantites,
          }));
        },
        updateItems: (item: TOrderByProject<any>, counter: number) => {
          const itemQuantities = get().itemQuantities;
          const filteredItemQuantites = prepareItemQuantities(itemQuantities, item, counter);
          const selectedItems = get().selectedItems;
          const amount = calculateTotalToPay(selectedItems, [...filteredItemQuantites]);
          set((state) => ({
            ...state,
            itemQuantities: filteredItemQuantites,
            totalToPay: amount,
          }));
        },
        removeItem: (item: TOrderByProject<any>) => {
          const itemQuantities = get().itemQuantities;
          const selectedItems = get().selectedItems;
          const newItemQuantites = itemQuantities.filter((itemQuantity) => {
            if ('student' in item) {
              return itemQuantity.order_id !== item.id || itemQuantity.student_id !== item.student.id;
            }
            return itemQuantity.order_id !== item.id;
          });
          const amount = calculateTotalToPay(selectedItems, [...newItemQuantites]);
          set((state) => ({
            ...state,
            itemQuantities: newItemQuantites,
            totalToPay: amount,
          }));
        },
        setTotalToPay: (totalToPay) => set((state) => ({ ...state, totalToPay })),
        clear: () => {
          set((state) => ({
            ...state,
            selectedItems: [],
            totalToPay: 0,
          }));
          useStudentStore.setState({ studentIds: [] });
        },
      }),
      {
        name: 'fulfillment-selection',
      }
    ),
    { name: 'fulfillment-selection', enabled: true }
  )
);

export const useSelectionStore = <SelectedProject extends ProjectEnum = ProjectEnum.PORTAL>(): ISelectionStore<
  TOrderByProject<SelectedProject>
> => useStoreBase<ISelectionStore<TOrderByProject<SelectedProject>>>((state) => state);

/**
 * Hook to manage the selection of fulfillments depending on the project.
 * @info https://www.notion.so/cometa/L-gica-de-Bloqueos-de-Fulfillments-Ordenes-en-Dashboard-y-Portal-49eabc20635f484d87f9d87abd89490d
 * @param fulfillments  Fulfillments to be selected
 * @param project  Project to be used in the hook, dashboard or portal
 * @returns  Object with the selected items, the total to pay, the function to select a fulfillment and the function to know if a fulfillment is disabled
 */
export const useOrderSelection = <SelectedProject extends ProjectEnum>(
  fulfillments: GuardianDependentFulfillment[] | DashboardDependentFulfillment[],
  project: SelectedProject
) => {
  const studentStore = useStudentStore();
  const { selectedItems, setSelectedItems, totalToPay, itemQuantities, updateItems, removeItem } =
    useSelectionStore<SelectedProject>();

  const handleItemSelect = (item: TOrderByProject<SelectedProject>) => {
    const newSelectedFulfillments = prepareItems(selectedItems, item, project);
    if ('student' in item) {
      studentStore.setStudentIds([item.student.id]);
    }
    setSelectedItems(newSelectedFulfillments);
  };

  const getCartItems = () => {
    const cartItems = selectedItems.reduce((prevOrders, item) => {
      const itemQuantity = itemQuantities.find((itemQuantity) => {
        if ('student' in item) {
          return itemQuantity.order_id === item.id && itemQuantity.student_id === item.student.id;
        }
        return itemQuantity.order_id === item.id;
      });
      const quantity = itemQuantity ? itemQuantity.counter : 1;
      const itemList = Array.from({ length: quantity }, () => ({
        id: item.id,
        order: item.order_id,
        student: 'student' in item ? item.student.id : null,
      }));
      return [...prevOrders, ...itemList];
    }, [] as CartItem[]);
    return cartItems;
  };

  const resetSelection = () => {
    setSelectedItems([]);
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
  const hasFulfillmentsDependentProxyInProcessOrSelected = (fulfillment: TOrderPortal | TOrderOnlineStore) =>
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
  const hasFulfillmentsDependentProxyInProcess = (fulfillment: TOrderDashboard) =>
    'fulfillments_dependent_proxy' in fulfillment
      ? fulfillment?.fulfillments_dependent_proxy.some((dependencyId) => isDependentFulfillmentInProcess(dependencyId))
      : false;

  /**
   * If the fulfillment has required fulfillments and any of them are not selected then it is true
   * @param fulfillment Fulfillment to evaluate
   * @returns boolean
   */
  const haveRequiredFulfillmentAndNotSelected = (
    fulfillment: DashboardDependentFulfillment | GuardianDependentFulfillment
  ) =>
    fulfillment.paid_fulfillments_required_proxy.some(
      (requireId) => !selectedItems.some((selectedFulfillment) => selectedFulfillment.id === requireId)
    );

  const isDisabled = (fulfillment: TOrderByProject<SelectedProject>) => {
    const disabledBySubscription =
      'subscription' in fulfillment && fulfillment?.subscription?.payment_has_failed === false;

    const disabledByNotStock =
      'stock' in fulfillment && !!fulfillment.stock?.is_limited && !fulfillment.stock?.quantity;

    const disabledByPaymentOnlyInDashboard =
      'concept' in fulfillment && fulfillment.concept?.payment_only_in_dashboard === true;

    const isDisabled =
      ('status' in fulfillment &&
        (fulfillment.status === StatusDc1Enum.WAITING_PAID || haveRequiredFulfillmentAndNotSelected(fulfillment))) ||
      disabledByNotStock ||
      disabledBySubscription ||
      disabledByPaymentOnlyInDashboard;

    if (isDisabled) return isDisabled;

    if (project === ProjectEnum.DASHBOARD && isDashboardDependentFulfillment(fulfillment)) {
      return hasFulfillmentsDependentProxyInProcess(fulfillment);
    }

    if (
      [ProjectEnum.PORTAL, ProjectEnum.ONLINE_STORE].includes(project) &&
      !isDashboardDependentFulfillment(fulfillment)
    ) {
      const finalAmount = Number(fulfillment.final_amount);
      return finalAmount <= 0 || hasFulfillmentsDependentProxyInProcessOrSelected(fulfillment);
    }
  };

  return {
    selectedItems,
    itemQuantities,
    totalToPay,
    handleItemSelect,
    updateItems,
    getCartItems,
    isDisabled,
    resetSelection,
    removeItem,
  };
};

export const useCartItems = <SelectedProject extends ProjectEnum>() => {
  const { selectedItems, itemQuantities } = useSelectionStore<SelectedProject>();

  const cartItems = selectedItems.reduce((prevOrders, item) => {
    const itemQuantity = itemQuantities.find((itemQuantity) => {
      if ('student' in item) {
        return itemQuantity.order_id === item.id && itemQuantity.student_id === item.student.id;
      }
      return itemQuantity.order_id === item.id;
    });
    const quantity = itemQuantity ? itemQuantity.counter : 1;
    const itemList = Array.from({ length: quantity }, () => ({
      id: item.id,
      order: item.order_id,
      student: 'student' in item ? item.student.id : null,
    }));
    return [...prevOrders, ...itemList];
  }, [] as CartItem[]);
  return cartItems;
};
