import { useMemo, useState } from 'react';
import { Events } from '/src/constants/events';
import { sendTrackEvent } from '/src/utils/events';
import { extractPageFromURL } from '/src/utils/object-util';
import { createColumnHelper } from '@tanstack/react-table';
import { renderMoney } from '/src/utils/datagridHeaders';
import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import IcAlert from '/public/assets/icons/ic_alert.svg';
import { IDueOrder } from '/types/due-orders';
import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import { formatDateWithUTCShort, renderStatus } from '/src/utils/general';
import { cn } from '/src/utils/cn';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { api } from '/src/utils/api';
import OrderDetailSidepanel from '/src/components/order/OrderDetailSidepanel';

interface IOrderTableForDueOrdersProps {
  studentId: string;
  concept?: string;
  schoolCycle?: string;
}

export interface DueOrdersTableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IDueOrder[];
  setSelectedOrderModal: (value: string) => void;
  selectedOrderModal: string;
}

export default function OrderTableForDueOrders(props: IOrderTableForDueOrdersProps) {
  const { studentId, concept, schoolCycle } = props;
  const [orderDetail, setOrderDetail] = useState({
    id: '',
    has_partial_payins: false,
    fulfillment_id: '',
  });
  const isInProcess = (order: IDueOrder) => order.pending && !order.has_partial_payins;
  const [open, setOpen] = useState(false);
  const {
    data: orders,
    isPending: isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.students.studentsOrdersList.useInfiniteQuery(
    {
      student_id: studentId,
      concepts: concept ? [concept] : undefined,
      school_cycle: schoolCycle ? schoolCycle : undefined,
      status: ['DUE', 'PENDING', 'OUTSTANDING'],
    },
    {
      getNextPageParam: (currentPage) => extractPageFromURL((currentPage as any)?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => extractPageFromURL((firstPage as any)?.previous as string) ?? undefined,
      meta: { logErrorToSentry: true },
    }
  );

  const handleOpen = (row: IDueOrder) => {
    const { id, has_partial_payins } = row;
    setOrderDetail({ id, has_partial_payins, fulfillment_id: row.fulfillment_id || '' });
    setOpen(true);
    sendTrackEvent(Events.outstanding_orders, { source: document.title.split(' | ')[0] });
  };

  const flatData = useMemo(() => orders?.pages.flatMap((page: any) => page?.results ?? []), [orders]);
  const totalCount = useMemo(() => (orders as any)?.pages[0]?.count || 0, [orders]);
  const columnHelper = createColumnHelper<DueOrdersTableResponse['results'][number]>();

  const columns = [
    columnHelper.accessor('name', {
      cell: (info) => (
        <div className="pl-3">
          <OrderNameWithParcial name={info.row.original.name} isParcial={info.row.original.has_partial_payins} />
        </div>
      ),
      size: 280,
      header: () => <span className="pl-3 w-fit">Orden</span>,
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
            <span>{formatDateWithUTCShort(info.row.original.due, false, false)}</span>
            {(!hasBeenPaid && hasPastDate && <IcAlert />) || (dueStatus && <IcAlert />)}
          </div>
        );
      },
      header: () => <span className="whitespace-nowrap">Fecha Vcto.</span>,
      size: 150,
    }),
    columnHelper.accessor('status', {
      cell: (info) => renderStatus(isInProcess(info.row.original)),
      header: () => <span className="whitespace-nowrap">Estado</span>,
    }),
    columnHelper.accessor('total_charge', {
      cell: (info) => <div className="text-left">{renderMoney(info.row.original.total_charge) || '0'}</div>,
      header: () => <span className="whitespace-nowrap">Recargos</span>,
      size: 180,
    }),
    columnHelper.accessor('discount', {
      cell: (info) => <div className="text-left">{renderMoney(info.row.original.discount) || '0'}</div>,
      header: () => <span className="whitespace-nowrap">Descuentos</span>,
      size: 150,
    }),
    columnHelper.accessor('final_amount', {
      cell: (info) => {
        const pending_amount = parseFloat(info.getValue() || '0');
        return <div className="text-left">{pending_amount ? renderMoney(pending_amount) : '$0,00'}</div>;
      },
      header: () => <span className="whitespace-nowrap">Por Pagar</span>,
      size: 180,
    }),
    columnHelper.accessor('pending', {
      cell: () => <IcArrowRight />,
      header: () => null,
      size: 100,
    }),
  ];

  return (
    <>
      <div>
        <TableVirtualized
          data={flatData || []}
          columns={columns}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage || false}
          fetchNextPage={fetchNextPage}
          onRowClick={handleOpen}
          totalFetched={flatData?.length || 0}
          totalCount={totalCount}
          isLoading={isLoading}
          isFetching={isFetching}
          hideSum
          hideFooter
          showEmptyStateImage
          emptyEndText="No hay más órdenes para mostrar"
          emptyStateText="No hay órdenes para mostrar"
        />
      </div>
      {orderDetail?.id && (
        <OrderDetailSidepanel
          typeOfOrder="DUE"
          open={open}
          onClose={() => {
            setOpen(false);
            setOrderDetail({ id: '', has_partial_payins: false, fulfillment_id: '' });
          }}
          orderId={orderDetail.id}
          studentId={studentId}
          fulfillmentId={orderDetail.fulfillment_id}
        />
      )}
    </>
  );
}
