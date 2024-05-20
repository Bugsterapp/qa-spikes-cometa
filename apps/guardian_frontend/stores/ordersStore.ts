import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { NormalizedOrder } from '~/types/OrdersApi';
import currency from 'currency.js';

interface OrdersStore {
  orderAccumTotal: number;
  selectedOrders: Record<string, string[]>;
  totalSelectedOrders: number;
  setSelectedOrders: (dependentId: string, order: NormalizedOrder) => void;
  removeStaleOrders: (depuredOrders: NormalizedOrder[]) => void;
  clear: () => void;
}
/**
 * @returns Object of dependentId/selectedOrders key pair with new selected orders by dependent and total price accumulated for each order in selected
 */
const toggleSelectOrder = (
  dependentId: string,
  selectedOrders: Record<string, string[]>,
  orderAccumTotal: number,
  totalSelectedOrders: number,
  order: NormalizedOrder
) => {
  const copy = new Set(selectedOrders[dependentId]);
  let total = currency(orderAccumTotal);
  let totalOrders = totalSelectedOrders;
  if (copy.has(order.id)) {
    copy.delete(order.id);
    total = total.subtract(order.price.total);
    totalOrders = --totalOrders;
  } else {
    copy.add(order.id);
    total = total.add(order.price.total);
    totalOrders = ++totalOrders;
  }

  return {
    selectedOrders: { ...selectedOrders, [dependentId]: Array.from(copy) },
    orderAccumTotal: total.value,
    totalSelectedOrders: totalOrders,
  };
};

const removeStaleOrders = (depuredOrders: NormalizedOrder[]) => {
  const copy = new Map();
  let totalPrice = currency(0);
  let totalOrders = 0;

  depuredOrders.forEach((order) => {
    const hasDependant = copy.has(order.dependent.id);

    copy.set(order.dependent.id, hasDependant ? [...copy.get(order.dependent.id), order.id] : [order.id]);

    totalOrders = ++totalOrders;

    totalPrice = totalPrice.add(order.price.total);
  });

  return {
    selectedOrders: Object.fromEntries(copy),
    totalSelectedOrders: totalOrders,
    orderAccumTotal: totalPrice.value,
  };
};

const initialState = {
  orderAccumTotal: 0,
  selectedOrders: {},
  totalSelectedOrders: 0,
};

const useOrderStore = create<OrdersStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setSelectedOrders: (dependentId, order) =>
        set({
          ...toggleSelectOrder(
            dependentId,
            get().selectedOrders,
            get().orderAccumTotal,
            get().totalSelectedOrders,
            order
          ),
        }),
      removeStaleOrders: (depuredOrders) => set(removeStaleOrders(depuredOrders)),
      clear: () => set(initialState),
    }),
    { enabled: process.env.NODE_ENV !== 'production', name: 'OrdersStore' }
  )
);

export default useOrderStore;
