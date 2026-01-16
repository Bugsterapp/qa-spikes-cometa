import { AnchorHTMLAttributes, useEffect, useMemo, useState } from 'react';
import { formatDateShort, PageSize, paymentTypeLabel } from '../../../../utils/general';
import { Status } from '/types/paid-orders';
import { Table } from '/src/components/Table';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import InvoiceChip, { Intent } from 'src/components/atoms/Chip';
import { Tooltip } from 'src/components/atoms/Tooltip';
import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import IcDownload from '/public/assets/icons/ic_download.svg';
import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import { useSelectedSchool } from '/src/guards/AuthGuard';

import PlaceToPay from '/src/components/atoms/PlaceToPay';

import { parseCurrency, toFloat } from '@cometa/utils';
import { cn } from '/src/utils/cn';
import { api } from '/src/utils/api';
import OrderDetailSidepanel from '/src/components/order/OrderDetailSidepanel';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
interface ChargeTableProps {
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideSum?: boolean;
  studentId?: string;
  conceptId?: string;
  schoolCycleId?: string;
}

const InvoiceFoil = ({ value }: { value?: string }) => {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }
  }, [hasCopied]);

  const textToRender = hasCopied ? '¡Copiado!' : value;

  return (
    <Tooltip message={textToRender}>
      <div className="flex items-center">
        <span
          className="max-w-[100px] whitespace-nowrap text-ellipsis overflow-hidden block"
          onClick={(e) => {
            e.stopPropagation();
            if (value) {
              navigator.clipboard.writeText(value).then(() => setHasCopied(true));
            }
          }}
        >
          {value || '-'}
        </span>
      </div>
    </Tooltip>
  );
};

export default function OrderTableForCharge({
  hideSum,
  studentId = '',
  conceptId = '',
  schoolCycleId = '',
}: ChargeTableProps) {
  // const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const selectedSchool = useSelectedSchool();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [ordenDetailId, setOrdenDetailId] = useState('');
  const [open, setOpen] = useState(false);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PageSize,
  });

  const {
    data: fulfillmentTable,
    isFetching,
    isPending: isLoading,
    error: fulfillmentError,
  } = api.payments.listFulfillment.useQuery(
    {
      schoolId: selectedSchool?.id || '',
      query: {
        page: pageIndex + 1,
        page_size: pageSize,
        concepts: [conceptId],
        students: [studentId],
        school_cycle: schoolCycleId,
      },
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  useEffect(() => {
    if (fulfillmentError) {
      setPagination({ pageIndex: 0, pageSize: PageSize });
    }
  }, [fulfillmentError]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const fulfillmentTableResults = fulfillmentTable?.results ?? [];
  const handleOpen = (row: (typeof fulfillmentTableResults)[number]) => {
    setOrdenDetailId(row.id);
    setOpen(true);

    sendTrackEventWithUserName(Events.paid_orders_detail_opened, { source: document.title.split(' | ')[0] });
    // onOpenTo();
  };
  const columnHelper = createColumnHelper<(typeof fulfillmentTableResults)[number]>();

  const columns = [
    columnHelper.accessor('correlative_id', {
      cell: (info) => {
        const idOrder = info.row.original.correlative_id;
        return <span className={!idOrder ? 'text-sm italic font-normal' : ''}>{idOrder ?? 'ID por generar'}</span>;
      },
      header: () => <span>ID de Orden</span>,
      minSize: 350,
    }),
    columnHelper.accessor('order_name', {
      cell: (info) => (
        <OrderNameWithParcial
          name={info.row.original.order_name}
          isParcial={
            info.row.original.status === 'PARTIAL_PAID' ||
            (info.row.original.status !== 'PAID' && info.row.original.payins.length > 1)
          }
        />
      ),
      header: () => <span className="w-[280px]">Orden</span>,
      minSize: 350,
    }),
    columnHelper.accessor('student', {
      cell: (info) => (
        <span className="font-semibold">
          {info.row.original.student.first_name} {info.row.original.student.last_name}
        </span>
      ),
      header: () => <span>Estudiante</span>,
    }),
    columnHelper.accessor('guardian', {
      cell: (info) => {
        const sponsored = info.row.original.is_sponsored;
        if (sponsored) return <span>Patrocinado</span>;
        return `${info.row.original?.guardian?.first_name} ${info.row.original?.guardian?.last_name}`;
      },
      header: () => <span>Pagador(Tutor)</span>,
    }),
    columnHelper.accessor('payins.paid_date', {
      header: () => <span className="whitespace-nowrap">Fecha de pago</span>,
      cell: (info) => {
        const date = info.row.original.payins[0]?.paid_date;
        return info.row.original.payins.length > 1 || !info.getValue()
          ? formatDateShort(date || '')
          : formatDateShort((info.getValue() as string) || '');
      },
    }),
    columnHelper.accessor('total_paid', {
      cell: (info) => <span className="py-1">{parseCurrency(toFloat(info.getValue() || '0'), 'MXN') || '-'}</span>,
      header: () => <span className="whitespace-nowrap">Monto pagado</span>,
      meta: {
        numeric: true,
      },
      footer: () => (
        <>
          {fulfillmentTable?.total_amount && (
            <span className="flex flex-col items-start pl-3 text-xs">
              Suma{' '}
              <strong className="text-sm font-bold">
                {parseCurrency(toFloat(fulfillmentTable.total_amount), 'MXN')}
              </strong>
            </span>
          )}
        </>
      ),
    }),
    columnHelper.accessor('payins', {
      cell: (info) => paymentTypeLabel(info.getValue()[0]?.type),
      header: () => <span>Medio de pago</span>,
    }),
    columnHelper.accessor('invoice_status', {
      cell: (info) => {
        const status = info.row.original.is_sponsored ? 'sponsored' : info.getValue();

        const invoiceStatus: Record<string, Intent> = {
          success: 'success',
          pending: 'info',
          canceled: 'error',
          canceling: 'error',
          not_requested: 'disabled',
          failed: 'warning',
          multiple: 'neutral',
          sponsored: 'disabled',
        };

        const invoiceStatusI18N: Record<string, { status: string; tooltip?: string }> = {
          success: {
            status: 'Emitida',
          },
          pending: {
            status: 'Por emitir',
            tooltip: `La factura se emitirá hoy a las ${
              selectedSchool?.config_dashboard?.emit_invoice_time || '11:59'
            }`,
          },
          canceled: {
            status: 'Cancelada',
            tooltip: 'Esta factura ha sido cancelada manualmente',
          },
          canceling: {
            status: 'Por cancelar',
            tooltip: 'Se ha solicitado la cancelación de esta factura',
          },
          not_requested: {
            status: 'Sin factura',
            tooltip: 'No se ha solicitado la emisión de una factura',
          },
          failed: {
            status: 'En revisión',
            tooltip: 'Hemos detectado inconsistencias con esta factura.',
          },
          multiple: {
            status: 'Múltiples',
            tooltip: 'Esta orden ha recibido múltiples pagos parciales',
          },
          sponsored: {
            status: 'Sin factura',
          },
        };

        return (
          <Tooltip message={invoiceStatusI18N[status as Status]?.tooltip}>
            <InvoiceChip intent={invoiceStatus[status as Status]}>
              {invoiceStatusI18N[status as Status]?.status}
            </InvoiceChip>
          </Tooltip>
        );
      },
      header: () => <span>Facturación</span>,
    }),
    columnHelper.accessor('invoices', {
      header: () => <span>Folio de factura </span>,
      cell: (info) => {
        const { invoices } = info.row.original;
        const lastInvoice = invoices[0];
        const Element = lastInvoice?.pdf_url ? 'a' : 'span';
        const Props: AnchorHTMLAttributes<HTMLAnchorElement> = {
          href: lastInvoice?.pdf_url,
          target: '_blank',
          rel: 'noreferrer noopener',
          onClick: (e) => e.stopPropagation(),
        };
        return (
          <div className="grid grid-cols-3 gap-1 min-w-[200px]">
            <div className="col-span-2">
              <InvoiceFoil value={lastInvoice?.fiscal_identifier ?? undefined} />
            </div>
            <div>
              <Element
                {...(lastInvoice?.pdf_url ? Props : undefined)}
                className={cn('text-gray-400 text-center', {
                  'text-blue-secondary': !!lastInvoice?.pdf_url,
                })}
              >
                <IcDownload fill="currentColor" className="mx-auto" />
              </Element>
            </div>
          </div>
        );
      },
      minSize: 380,
    }),
    columnHelper.accessor('collected_at_school', {
      cell: (info) => {
        const { is_sponsored } = info.row.original;
        return <PlaceToPay at_school={info.getValue() as boolean} sponsored={is_sponsored} />;
      },
      header: () => <span>Lugar de pago</span>,
    }),

    columnHelper.accessor('payins.correlative_id', {
      header: () => <span>Pagos vinculados</span>,
      cell: (info) => {
        const { payins } = info.row.original;
        // remove the first payin because it's the last payin
        // TODO make a lot renders because can't use shift
        const lastPayin = payins[0];
        const restPayins = payins.slice(1);
        return (
          <div className="flex flex-row">
            <span>{lastPayin?.correlative_id}</span>
            {restPayins.length ? (
              <Tooltip message={restPayins.map((payin) => payin.correlative_id).join(', ')}>
                <span className="px-2 py-1 ml-1 font-semibold text-center rounded-full text-info bg-info/8">
                  +{restPayins.length}
                </span>
              </Tooltip>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.accessor('payout', {
      header: () => <span>Depósito vinculado</span>,
      cell: (info) => info.getValue()?.correlative_id || '-',
    }),
    columnHelper.display({
      id: 'arrow',
      cell: () => <IcArrowRight />,
      size: 250,
    }),
  ];

  return (
    <>
      <div>
        <Table
          data={fulfillmentTable?.results || []}
          columns={columns}
          onRowClick={handleOpen}
          totalCount={fulfillmentTable?.count || 0}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
          isFetching={isFetching}
          hideSum={hideSum}
          emptyStateText="No hay órdenes pagadas"
          showEmptyStateImage
        />
      </div>
      {ordenDetailId && (
        <OrderDetailSidepanel
          open={open}
          onClose={() => {
            setOpen(false);
            setOrdenDetailId('');
          }}
          orderId={ordenDetailId}
          studentId={studentId}
          fulfillmentId={ordenDetailId}
          typeOfOrder="PAYMENT"
        />
      )}
    </>
  );
}
