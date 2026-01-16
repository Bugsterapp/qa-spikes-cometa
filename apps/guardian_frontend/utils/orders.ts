import type { TOrderOnlineStore, TOrderPortal } from '@cometa/hooks';
import type {
  DashboardDependentFulfillment,
  GuardianDependentFulfillment,
  GuardianDependentOrder,
  OptionalOrder,
} from '@cometa/trpc/src/types';
import currency from 'currency.js';
import dayjs from 'dayjs';
// TODO - remove this import and use the one from @cometa/trpc
import type { Order, OrderType } from '~/types/OrdersApi';

export const formatPrice = (amount: number | string, currency?: string) => {
  if (typeof amount === 'string') amount = parseFloat(amount);
  currency = currency ?? 'MXN';
  const formatter = Intl.NumberFormat(process.env.NEXT_PUBLIC_CURRENCY_LOCALE, {
    style: 'currency',
    currency,
  });
  const formatted = formatter.format(amount);
  // Replace MX$ or MXN with $ and ensure space
  return formatted.replace(/MX\$\s?|MXN\s?/, '$ ').replace(/\$(?!\s)/, '$ ');
};
// FIXME: need this?
export const getFinalPricePending = ({ price, interest, discount }: Order) =>
  currency(price).add(interest).subtract(discount).value;

export const defineTypeForOder = (order: DashboardDependentFulfillment | GuardianDependentFulfillment): OrderType => {
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

export const typeOfOrdersInStore = (selectedItems: (TOrderPortal | TOrderOnlineStore)[]) => {
  const hasMandatoryOrders = selectedItems.some((item) => !item.concept.optional);
  const hasOptionalOrders = selectedItems.some((item) => item.concept.optional);

  return {
    optional: hasOptionalOrders,
    mandatory: hasMandatoryOrders,
  };
};

export function extractConceptTypesFromOrders(orders: (GuardianDependentOrder | OptionalOrder)[]) {
  return orders.reduce((previousExtractedTypes, order) => {
    if (!previousExtractedTypes.find((previousExtractedTypes) => previousExtractedTypes.value === order.concept.type))
      previousExtractedTypes.push({
        value: order.concept.type,
        displayValue: order.concept.display_type,
      });
    return previousExtractedTypes;
  }, [] as { value: string; displayValue: string }[]);
}
