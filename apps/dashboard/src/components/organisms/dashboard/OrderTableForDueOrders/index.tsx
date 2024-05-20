import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import { Events } from '/src/constants/events';
import useToggle from '/src/hooks/useToggle';
import ApiClient from '/src/services/ApiClient';
import { sendTrackEvent } from '/src/utils/events';
import * as Sentry from '@sentry/nextjs';
import { QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';
import { createColumnHelper } from '@tanstack/react-table';
import { Table } from '/src/components/Table';
import { renderMoney } from '/src/utils/datagridHeaders';
import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import IcAlert from '/public/assets/icons/ic_alert.svg';
import { IDueOrder } from '/types/due-orders';
import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import { formatDate, renderStatus } from '/src/utils/general';
import ManualPayDetail from '../ManualPayPartial';
import { cn } from '/src/utils/cn';
import FulfillmentDetail from '../FulfillmentDetail';

interface IOrderTableForDueOrdersProps {
  studentId: string;
  concept?: string;
}

export interface DueOrdersTableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IDueOrder[];
}

export default function OrderTableForDueOrders(props: IOrderTableForDueOrdersProps) {
  const { studentId, concept } = props;
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const [orderDetail, setOrderDetail] = useState({ id: '', has_partial_payins: false });
  const [selectedOrderModal, setSelectedOrderModal] = useState<string | undefined>('DUE');

  const getDueOrdersOfStudent = async () => {
    const session = await getSession();
    const res = await ApiClient.getDueOrdersForStudent(session?.token, studentId, concept);
    return res?.data;
  };

  const isInProcess = (order: IDueOrder) => order.pending && !order.has_partial_payins;

  const { data: orders, isLoading } = useQuery([QUERY_KEY_DUE_ORDERS_STUDENT, concept], getDueOrdersOfStudent, {
    onError(err) {
      Sentry.captureException(err);
    },
  });

  const handleOpen = (row: IDueOrder) => {
    const { id, has_partial_payins } = row;
    setOrderDetail({ id, has_partial_payins });
    onOpenTo();
    sendTrackEvent(Events.outstanding_orders, { source: document.title.split(' | ')[0] });
  };

  const onSwithSidepanel = (order?: string) => {
    setSelectedOrderModal(order);
  };

  const columnHelper = createColumnHelper<DueOrdersTableResponse['results'][number]>();

  const columns = [
    columnHelper.accessor('name', {
      cell: (info) => (
        <OrderNameWithParcial name={info.row.original.name} isParcial={info.row.original.has_partial_payins} />
      ),
      size: 380,
      header: () => <span className="w-[280px]">Orden</span>,
    }),
    columnHelper.accessor('due', {
      cell: (info) => {
        const hasBeenPaid = info.row.original.status === 'PAID';
        const todayDate = new Date().toISOString().split('T')[0];
        const hasPastDate = info.row.original.due < todayDate;
        const dueStatus = info.row.original.status === 'DUE';
        return (
          <div
            className={cn('flex flex-row text-center items-center gap-x-1.5', {
              'text-error': (!hasBeenPaid && hasPastDate) || dueStatus,
            })}
          >
            <span>{formatDate(info.row.original.due, 'DD MMM YYYY')}</span>
            {(!hasBeenPaid && hasPastDate && <IcAlert />) || (dueStatus && <IcAlert />)}
          </div>
        );
      },
      header: () => <span className="whitespace-nowrap">Fecha Vcto.</span>,
      size: 250,
    }),
    columnHelper.accessor('status', {
      cell: (info) => renderStatus(isInProcess(info.row.original)),
      header: () => <span className="whitespace-nowrap">Estado</span>,
    }),
    columnHelper.accessor('total_charge', {
      cell: (info) => <div className="text-left">{renderMoney(info.row.original.total_charge) || '0'}</div>,
      header: () => <span className="whitespace-nowrap">Recargos</span>,
      size: 250,
    }),
    columnHelper.accessor('discount', {
      cell: (info) => <div className="text-left">{renderMoney(info.row.original.discount) || '0'}</div>,
      header: () => <span className="whitespace-nowrap">Descuentos</span>,
      size: 250,
    }),
    columnHelper.accessor('final_amount', {
      cell: (info) => {
        const pending_amount = parseFloat(info.getValue() || '0');
        return <div className="text-left">{pending_amount ? renderMoney(pending_amount) : '$0,00'}</div>;
      },
      header: () => <span className="whitespace-nowrap">Por Pagar</span>,
      size: 250,
    }),
    columnHelper.accessor('pending', {
      cell: () => <IcArrowRight />,
      header: () => null,
      size: 250,
    }),
  ];

  return (
    <>
      <div>
        <Table
          data={orders?.results || []}
          columns={columns}
          onRowClick={handleOpen}
          isLoading={isLoading}
          totalCount={orders?.count || 0}
          hideFooter
          hideSum
        />
      </div>
      {selectedOrderModal === 'DUE' ? (
        <ManualPayDetail
          open={openTo}
          onSwithSidepanel={onSwithSidepanel}
          onClose={onCloseTo}
          orderId={orderDetail.id}
          studentId={studentId}
        />
      ) : (
        <FulfillmentDetail
          onClose={() => {
            onCloseTo();
            setSelectedOrderModal('DUE');
          }}
          paymentId={selectedOrderModal || ''}
          open={openTo}
          sponsored
        />
      )}
    </>
  );
}
