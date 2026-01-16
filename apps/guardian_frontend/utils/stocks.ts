import { TOrderPortal, ItemQuantity } from '@cometa/hooks';
import { api } from './api';
import { stockError } from '~/utils/errorsMessages';
import { GuardianDependentOrder } from '@cometa/trpc';
import { appendUtmParameters } from '~/lib/destinationWithUTM';
import { ParsedUrlQuery } from 'querystring';

export function isGuardianDependentOrder(element: TOrderPortal): element is GuardianDependentOrder {
  return 'acquired' in element || 'stock' in element;
}

export const useStock = (schoolId: string) => {
  const utils = api.useUtils();

  const validateStock = async (itemQuantities: ItemQuantity[] = []) => {
    const data = itemQuantities.map((iq) => ({
      order_id: iq.student_id ? iq.order_id.replace(iq.student_id, '') : iq.order_id,
      quantity: iq.counter,
    }));
    const response = await utils.orders.validateStock.fetch({
      schoolId,
      data,
    });

    if (!response) return true;

    const orders = response ?? [];
    const hasInvalidOrders = orders.some((validatedOrder) => validatedOrder.has_stock === false);

    return hasInvalidOrders;
  };
  return { validateStock };
};

export const isStockError = (err: any, guardianHash: any, query: ParsedUrlQuery) => {
  if (err?.error?.items && err.error.items[0]?.non_field_errors?.some((e: any) => e === stockError)) {
    return {
      redirect: {
        permanent: false,
        destination: appendUtmParameters(`/guardians/${guardianHash}/payments?error=stock`, query),
      },
    };
  }
};
