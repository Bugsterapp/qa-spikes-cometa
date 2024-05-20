import currency from 'currency.js';
// TODO - remove this import and use the one from @cometa/trpc
import { Order, OrderType } from '~/types/OrdersApi';
import dayjs from 'dayjs';
import { DashboardDependentFulfillment } from '@cometa/trpc/src/types';

export const formatPrice = (amount: number | string, currency?: string) => {
  if (typeof amount === 'string') amount = parseFloat(amount);
  currency = currency ?? 'MXN';
  const formatter = Intl.NumberFormat(process.env.NEXT_PUBLIC_MERCADO_PAGO_LOCALE, {
    style: 'currency',
    currency,
  });
  return formatter.format(amount);
};

export const getFinalPricePending = ({ price, interest, discount }: Order) =>
  currency(price).add(interest).subtract(discount).value;

export const defineTypeForOder = (order: Order | DashboardDependentFulfillment): OrderType => {
  const typesByStatus: Record<string, OrderType> = {
    PAID: 'paid', // payed orders
    DUE: 'due', // orders that have expired
    OUTSTANDING: 'outstanding', // orders from the same month that haven't expired yet
    FUTURE: 'future', // orders that can be payed in advance
  };

  const isOutstanding = dayjs().isSame(order.due, 'month');
  const isDue = dayjs().isAfter(order.due);

  if (order.status === 'PAID') {
    return typesByStatus[order.status];
  } else if (order.status === 'DUE' || isDue) {
    return typesByStatus['DUE'];
  } else if (isOutstanding) {
    return typesByStatus['OUTSTANDING'];
  } else {
    return typesByStatus['FUTURE'];
  }
};
