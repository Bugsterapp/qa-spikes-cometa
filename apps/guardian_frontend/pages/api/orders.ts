import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import ApiClient from '~/services/ApiClient';
import currency from 'currency.js';
import dayjs from 'dayjs';
import { formatPrice } from '~/utils/orders';
import type { NormalizedOrder, Order, OrderStatus, OrderType } from '~/types/OrdersApi';
import { DashboardDependentFulfillment } from '@cometa/trpc/src/types';

// Nasty thing will refactor later i guess
const composePriceForOrder = (order: Order) => {
  const orderPrice = currency(order.price);
  const finalAmount = currency((order.has_partial_payins ? order.pending_amount : order.final_amount) || '').value;
  const discountsToApply = order.discount_breakdown?.total || 0;
  const interest =
    order.interest && currency(order.interest).value ? formatPrice(order.interest, order.price_currency) : null;
  const {
    scholarships,
    special,
    early_bird: earlyBird,
  } = order.discount_breakdown?.details || { scholarships: null, special: null, early_bird: null };

  const scholarshipsResume = [...(scholarships?.details ?? [])].map(({ discount, name, active }) => ({
    name,
    amount: formatPrice(discount, order.price_currency),
    active,
  }));

  // Accumulate common discounts and only save the amount and name for reference
  const otherDiscounts = [...(special?.details ?? [])].map(({ discount, name }) => ({
    amount: formatPrice(discount, order.price_currency),
    name,
    active: true,
  }));

  const normalizedDiscounts = [...scholarshipsResume, ...otherDiscounts];
  const calculation = orderPrice.subtract(discountsToApply).add(interest || '').value;
  const total = formatPrice(finalAmount || calculation, order.price_currency);

  // Backend doesn't return percentages 😅
  const earlyBirdPercent = currency(earlyBird?.total)
    .multiply(100)
    .divide(orderPrice.add(interest || '').value).value;

  const normalizedEarlyBird = earlyBird
    ? {
        percent: `-${earlyBirdPercent}%`,
        untilDate: earlyBird?.details[0]?.until_date ? dayjs(earlyBird.details[0].until_date).format('DD.MM') : null,
      }
    : null;

  return {
    subtotal: formatPrice(orderPrice.value, order.price_currency),
    modifiers: {
      earlyBird: normalizedEarlyBird,
      discounts: normalizedDiscounts,
      interest,
    },
    total,
    currency: order.price_currency,
  };
};

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

const purgeRequiredPayedOrders = (ordersRequired: string[], orders: Order[], currentDependentId: string) =>
  ordersRequired
    .map((orderId) =>
      orders
        .filter((order) => order.id === orderId && order.status !== 'PAID' && order.dependent.id === currentDependentId)
        .map((order) => order.id)
    )
    .flat();
const OrdersHandler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, token }: { userId: string; token: string } = req.body;

  const { status }: { status?: OrderStatus[] } = req.query || {
    status: ['to_pay'],
  };
  const { data: orders }: { data: Order[] } = await ApiClient.getGuardianDependentsOrders(userId, token);

  // reduce array to get objects with only necessary data.
  const normalizedOrders = orders.reduce<NormalizedOrder[]>((prev, curr) => {
    const arr = [...prev];
    const order = {
      price: composePriceForOrder(curr),
      concept: curr.concept,
      id: curr.id,
      due: curr.due,
      payin: curr.has_partial_payins ? null : curr.payins[0],
      invoice: curr.invoice,
      dependent: curr.dependent,
      partial_payins: curr.has_partial_payins ? curr.payins : [],
      commissions: curr.commissions,
      guardian_commission: curr.guardian_commission,
      orders_required: {
        all_orders: purgeRequiredPayedOrders(curr.paid_orders_required, orders, curr.dependent.id),
        proxy: purgeRequiredPayedOrders(curr.paid_orders_required_proxy, orders, curr.dependent.id),
      },
      name: curr.name,
      pending: curr.pending,
      type: defineTypeForOder(curr),
      has_partial_payins: curr.has_partial_payins,
    };
    arr.push(order as NormalizedOrder);
    return arr;
  }, []);

  const returnItemsByFilter = (order: NormalizedOrder) => {
    if (status?.includes('to_pay') && (order.type === 'due' || order.type === 'outstanding')) {
      return order;
    } else if (status?.includes('future') && order.type === 'future') {
      return order;
    } else if (status?.includes('historic') && order.type === 'paid') {
      return order;
    } else if (status?.includes('pending') && order.pending) {
      return order;
    }
  };

  const ordersByStatus = {
    items: normalizedOrders.filter(returnItemsByFilter),
    pendingCount: normalizedOrders.filter((item) => item.pending).length,
  };

  res.status(200).send(ordersByStatus);
};

export default OrdersHandler;
