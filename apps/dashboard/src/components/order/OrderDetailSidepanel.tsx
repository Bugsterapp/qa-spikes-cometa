import { useState, useEffect } from 'react';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { StatusDc1Enum } from '@cometa/trpc/src/types';
import ManualPayDetail from '../organisms/dashboard/ManualPayPartial';
import FulfillmentDetail from '../payments/FulfillmentDetail';
import Sheet from '../atoms/Sheet';

interface OrderDetailSidepanelProps {
  open: boolean;
  onClose: () => void;
  orderId?: string;
  studentId?: string;
  fulfillmentId?: string;
  typeOfOrder: 'DUE' | 'PAYMENT';
}

export default function OrderDetailSidepanel({
  open,
  onClose,
  orderId,
  studentId,
  fulfillmentId,
  typeOfOrder,
}: OrderDetailSidepanelProps) {
  const selectedSchool = useSelectedSchool();
  const [selectedOrderModal, setSelectedOrderModal] = useState<'DUE' | 'PAYMENT'>(typeOfOrder);
  const [orderIdLocal, setOrderIdLocal] = useState<string>(orderId || '');
  const { data: fulfillment, isPending: isLoading } = api.payments.retrieveFulfillment.useQuery(
    { schoolId: selectedSchool?.id ?? '', fulfillmentId: fulfillmentId || '' },
    { enabled: !!selectedSchool?.id && !!fulfillmentId }
  );
  const { data: order, isPending: isLoadingOrder } = api.students.orderDetail.useQuery(
    {
      orderId: orderIdLocal || orderId || '',
      studentId: studentId || '',
    },
    {
      enabled: !!selectedSchool && !!(orderIdLocal || orderId) && !!studentId && selectedOrderModal === 'DUE',
    }
  );
  const [previousStatus, setPreviousStatus] = useState<StatusDc1Enum | null>(null);

  useEffect(() => {
    if (fulfillment && fulfillment.status !== previousStatus) {
      if (previousStatus === null && fulfillment.status) {
        setPreviousStatus(fulfillment.status);
      } else {
        const isPaidOrWaiting =
          fulfillment.status === StatusDc1Enum.PAID || fulfillment.status === StatusDc1Enum.WAITING_PAID;
        const isNotPaidOrPartial =
          fulfillment.status === StatusDc1Enum.NOT_PAID || fulfillment.status === StatusDc1Enum.PARTIAL_PAID;

        if (isPaidOrWaiting && fulfillment.id && selectedOrderModal !== 'PAYMENT') {
          setSelectedOrderModal('PAYMENT');
          setOrderIdLocal(fulfillment.order_id);
        } else if (isNotPaidOrPartial && selectedOrderModal !== 'DUE') {
          setSelectedOrderModal('DUE');
          setOrderIdLocal(fulfillment.order_id);
        }
        setPreviousStatus(fulfillment.status ?? null);
      }
    }
  }, [fulfillment, previousStatus, selectedOrderModal]);

  const sheetKey = `${selectedOrderModal}-${fulfillmentId}`;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()} key={sheetKey}>
      <Sheet.Content>
        {selectedOrderModal === 'DUE' && !!(orderIdLocal || orderId) && !!studentId ? (
          <ManualPayDetail
            open={open}
            onClose={onClose}
            orderId={orderIdLocal || orderId || ''}
            studentId={studentId}
            order={order}
            isLoading={isLoadingOrder}
          />
        ) : selectedOrderModal === 'PAYMENT' && !!fulfillmentId ? (
          <FulfillmentDetail
            onClose={() => {
              onClose();
            }}
            paymentId={fulfillmentId}
            fulfillment={fulfillment}
            isLoading={isLoading}
            sponsored
          />
        ) : null}
      </Sheet.Content>
    </Sheet>
  );
}
