import currency from 'currency.js';
import { Order } from '~/types/OrdersApi';

export const formatPrice = (amount: number | string, currency?: string) => {
  if (typeof amount === 'string') amount = parseFloat(amount);
  currency = currency || 'MXN';
  const formatter = Intl.NumberFormat(process.env.NEXT_PUBLIC_MERCADO_PAGO_LOCALE, {
    style: 'currency',
    currency,
  });
  return formatter.format(amount);
};

export const getFinalPricePending = ({ price, interest, discount }: Order) =>
  currency(price).add(interest).subtract(discount).value;
