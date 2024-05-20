import { DependentFulfillmentOrder } from '@cometa/hooks';
import { ServiceClient } from './api';
import { stockError } from '~/utils/errorsMessages';

export const validateStock = async (schoolId: string, token: string, ordersToPay: DependentFulfillmentOrder[]) => {
  const { data: orders } = await ServiceClient.apiV1SchoolsOptionalOrdersList(
    schoolId,
    {},
    {
      headers: {
        token,
      },
    }
  );
  const isAnyOrderInvalid = ordersToPay.some((order) => {
    const orderToPay = orders.find((o) => o.id === order.id);
    const isOrderValid = orderToPay?.stock && orderToPay?.stock?.is_limited && orderToPay?.stock?.quantity === 0;
    return isOrderValid;
  });
  return !isAnyOrderInvalid;
};

export const isStockError = (err: any, guardianHash: any) => {
  if (err?.error?.items && err.error.items[0]?.non_field_errors?.some((e: any) => e === stockError)) {
    return {
      redirect: {
        permanent: false,
        destination: `/guardians/${guardianHash}/payments?error=stock`,
      },
    };
  }
};
