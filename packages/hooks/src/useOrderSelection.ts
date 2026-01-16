import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  DashboardDependentFulfillment,
  GuardianDependentFulfillment,
  GuardianDependentOrder,
  OptionalOrder,
  StatusDc1Enum,
} from '@cometa/trpc/src/types';
import { useStudentStore } from './useStudentStore';
import { OrderType } from '../../../apps/dashboard/src/constants/orders';

export enum ProjectEnum {
  DASHBOARD = 'dashboard',
  PORTAL = 'portal',
  ONLINE_STORE = 'online_store',
}

export interface ItemQuantity {
  order_id: string;
  student_id?: string;
  counter: number;
}

export interface CartItem {
  id: string;
  order: string;
  student: string | null;
}

interface State<TOrder> {
  selectedItems: TOrder[];
  itemQuantities: ItemQuantity[];
  totalToPay: number;
  ordersHaveDependents: boolean;
}

export interface ISelectionStore<TOrder> extends State<TOrder> {
  setState: (state: Partial<State<TOrder>>) => void;
  setSelectedItems: (selectedItems: TOrder[]) => void;
  setItemQuantities: (itemQuantities: ItemQuantity[]) => void;
  setTotalToPay: (totalToPay: number) => void;
  clear: () => void;
  updateItems: (item: TOrder, counter: number) => void;
  removeItem: (item: TOrder) => void;
}

type OrderTypeEnrichment = { orderType?: OrderType };

export type TOrderPortal = (GuardianDependentFulfillment | GuardianDependentOrder) & OrderTypeEnrichment;

export type TOrderDashboard = (DashboardDependentFulfillment | GuardianDependentOrder | OptionalOrder) &
  OrderTypeEnrichment;

export type TOrderOnlineStore = OptionalOrder & OrderTypeEnrichment;

export type TOrderDashboardEnriched =
  | (DashboardDependentFulfillment & { orderType: OrderType.SCHOLAR })
  | (GuardianDependentOrder & { orderType: OrderType.OPTIONAL })
  | (OptionalOrder & { orderType: OrderType.OPTIONAL });

export type TOrderOptionalEnriched =
  | (GuardianDependentOrder & { orderType: OrderType.OPTIONAL })
  | (OptionalOrder & { orderType: OrderType.OPTIONAL | OrderType.ONLINE_STORE });

type ProjectTypeMap = {
  [ProjectEnum.DASHBOARD]: TOrderDashboard;
  [ProjectEnum.PORTAL]: TOrderPortal;
  [ProjectEnum.ONLINE_STORE]: TOrderOnlineStore;
};

export type TOrderByProject<SelectedProject extends ProjectEnum> = ProjectTypeMap[SelectedProject];

export const calculateTotalToPay = (
  items: (TOrderPortal | TOrderDashboard | TOrderOnlineStore)[],
  itemQuantities: ItemQuantity[]
) =>
  items.reduce((total, item) => {
    const itemQuantity = itemQuantities.find((i) => {
      if ('student' in item && item.student) {
        return i.order_id === item.id && i.student_id === item.student.id;
      }
      return i.order_id === item.id && i.student_id === undefined;
    });
    const multiplier = itemQuantity ? itemQuantity.counter : 1;
    const amount = multiplier * Number('pending_amount' in item ? item.pending_amount : item.final_amount);
    return total + amount;
  }, 0);
/**
 * @description The any is set to be able to use generics in the creation of the store
 * @see https://github.com/pmndrs/zustand/discussions/841#discussioncomment-2280391
 */
const useStoreBase = create<ISelectionStore<any>>()(
  devtools(
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

        useStudentStore.setState({
          studentIds: itemsSelected
            .map((item) => ('student' in item && item.student ? item.student.id : undefined))
            .filter(Boolean),
        });
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
        const newItemQuantites = itemQuantities.filter((itemQuantity) => {
          if ('student' in item && item.student) {
            return !(itemQuantity.order_id === item.id && itemQuantity.student_id === item.student.id);
          }
          return !(itemQuantity.order_id === item.id && itemQuantity.student_id === undefined);
        });
        const selectedItems = get().selectedItems;
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
    { name: 'fulfillment-selection', enabled: true }
  )
);

export const useSelectionStore = <SelectedProject extends ProjectEnum = ProjectEnum.PORTAL>(): ISelectionStore<
  TOrderByProject<SelectedProject>
> => useStoreBase<ISelectionStore<TOrderByProject<SelectedProject>>>((state) => state);

export const prepareItems = <SelectedProject extends ProjectEnum>(
  prevItems: TOrderByProject<SelectedProject>[],
  item: TOrderByProject<SelectedProject>,
  project: SelectedProject
): TOrderByProject<SelectedProject>[] => {
  if (prevItems.some((prevItem) => prevItem.id === item.id)) {
    // If the item is in the state, we remove it
    if (project === ProjectEnum.PORTAL || project === ProjectEnum.ONLINE_STORE) {
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
    return [...prevItems, item];
  }
};

export const prepareItemQuantities = <SelectedProject extends ProjectEnum>(
  prevItems: ItemQuantity[],
  item: TOrderByProject<SelectedProject>,
  counter: number
): ItemQuantity[] => {
  if (
    prevItems.some((itemQuantity) => {
      if ('student' in item && item.student) {
        return itemQuantity.order_id === item.id && itemQuantity.student_id === item.student.id;
      }
      return itemQuantity.order_id === item.id && itemQuantity.student_id === undefined;
    })
  ) {
    const filteredPrevState = prevItems.filter((itemQuantity) => {
      if ('student' in item && item.student) {
        return itemQuantity.order_id !== item.id || itemQuantity.student_id !== item.student.id;
      }
      return itemQuantity.order_id !== item.id || itemQuantity.student_id !== undefined;
    });

    return [
      ...filteredPrevState,
      { order_id: item.id, student_id: 'student' in item && item.student ? item.student.id : undefined, counter },
    ];
  } else {
    // If the item is not in the state, we add it
    return [
      ...prevItems,
      { order_id: item.id, student_id: 'student' in item && item.student ? item.student.id : undefined, counter },
    ];
  }
};

const createCartItems = (
  selectedItems: (TOrderPortal | TOrderDashboard | TOrderOnlineStore)[],
  itemQuantities: ItemQuantity[]
): CartItem[] =>
  selectedItems.reduce((prevOrders, item) => {
    const itemQuantity = itemQuantities.find((itemQuantity) => {
      if ('student' in item && item.student) {
        return itemQuantity.order_id === item.id && itemQuantity.student_id === item.student.id;
      }
      return itemQuantity.order_id === item.id && itemQuantity.student_id === undefined;
    });
    const quantity = itemQuantity ? itemQuantity.counter : 1;
    const itemList = Array.from({ length: quantity }, () => ({
      id: item.id,
      order: item.order_id,
      student: 'student' in item && item.student ? item.student.id : null,
    }));
    return [...prevOrders, ...itemList];
  }, [] as CartItem[]);

export const getOrderType = (item: TOrderDashboard | TOrderPortal | TOrderOnlineStore): OrderType => {
  if (item.orderType !== undefined) {
    return item.orderType;
  }
  return OrderType.OPTIONAL;
};

export function isDashboardDependentFulfillment(
  element: TOrderByProject<ProjectEnum>
): element is DashboardDependentFulfillment {
  return 'is_billable' in element;
}

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
  const { selectedItems, setSelectedItems, totalToPay, itemQuantities, updateItems, removeItem } =
    useSelectionStore<SelectedProject>();

  const handleItemSelect = (item: TOrderByProject<SelectedProject>) => {
    const newSelectedFulfillments = prepareItems(selectedItems, item, project);
    setSelectedItems(newSelectedFulfillments);
  };

  const getCartItems = () => createCartItems(selectedItems, itemQuantities);

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

    const isDisabled =
      ('status' in fulfillment &&
        (fulfillment.status === StatusDc1Enum.WAITING_PAID || haveRequiredFulfillmentAndNotSelected(fulfillment))) ||
      disabledByNotStock ||
      disabledBySubscription;

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
    setSelectedItems,
  };
};

export const useCartItems = <SelectedProject extends ProjectEnum>() => {
  const { selectedItems, itemQuantities } = useSelectionStore<SelectedProject>();

  return createCartItems(selectedItems, itemQuantities);
};
