import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { NormalizedOrder } from '~/types/OrdersApi';

type CashIn = {
  expiration_date: string;
  ticket_number: string;
  pin: string;
  pdf_url: string;
  pin_barcode: string;
  currency: string;
  total: number;
};

interface CheckoutStore {
  checkoutOrders: Record<string, NormalizedOrder[]> | null;
  itemsQuantity: number;
  totalPrice: number;
  currency: string;
  setCheckoutOrders: (orders: Record<string, NormalizedOrder[]>) => void;
  setCheckoutData: (totalPrice: number, currency: string, itemsQuantity: number) => void;
  clear: (...omitKeys: (keyof typeof initialState)[]) => void;
  updateTotalPrice: (totalPrice: number) => void;
  cashIn: Partial<CashIn>;
  setCashInData: (cashIn: Partial<CashIn>) => void;
}

const toggleCheckoutOrders = (orders: Record<string, NormalizedOrder[]>) => {
  const prev = new Map();

  Object.keys(orders).forEach((key) => {
    prev.set(key, orders[key]);
  });

  const checkoutOrders = Object.fromEntries(prev);

  return { checkoutOrders };
};

const initialState = {
  checkoutOrders: null,
  itemsQuantity: 0,
  totalPrice: 0,
  currency: '',
  cashIn: {},
};

const useCheckoutStore = create<CheckoutStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setCheckoutOrders: (orders) => set(toggleCheckoutOrders(orders)),
      setCheckoutData: (totalPrice, currency, itemsQuantity) => set({ totalPrice, currency, itemsQuantity }),
      clear: (...omitKeys) => {
        const copy = new Map(Object.entries(initialState));

        omitKeys.forEach((key) => {
          if (copy.has(key)) {
            copy.delete(key);
          }
        });

        return copy;
      },
      updateTotalPrice: (totalPrice) => set({ totalPrice }),
      setCashInData: (cashIn: Partial<CashIn>) =>
        set({
          cashIn: { ...cashIn, currency: cashIn.currency || get().currency, total: cashIn.total || get().totalPrice },
        }),
    }),
    { enabled: process.env.NODE_ENV !== 'production', name: 'CheckoutStore' }
  )
);

export default useCheckoutStore;
