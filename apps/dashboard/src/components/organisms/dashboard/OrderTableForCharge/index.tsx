// @ts-nocheck
import { AnchorHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import useToggle from '../../../../hooks/useToggle';
import HeaderTable from './Header';
import { useSession } from 'next-auth/react';
import ApiClient from '../../../../services/ApiClient';
import { formatDateShort, PageSize, paymentTypeLabel } from '../../../../utils/general';
import { PATH_PORTAL } from '../../../../routes/paths';
import { sendTrackEvent } from '../../../../utils/events';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FulfillmentTable, Status } from '/types/paid-orders';
import { Table } from '/src/components/Table';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import InvoiceChip, { Intent } from 'src/components/atoms/Chip';
import { Tooltip } from 'src/components/atoms/Tooltip';
import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import IcDownload from '/public/assets/icons/ic_download.svg';
import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import FulfillmentDetail from '../FulfillmentDetail';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { FormFilterData, formFilterDataToParams, MultipleFiltersChips } from '../../../MultipleFilters';
import { UseFormReturn } from 'react-hook-form';
import { transformDates } from '/src/components/DateRange';
import PlaceToPay from '/src/components/atoms/PlaceToPay';
import useDebounce from '/src/hooks/useDebounce';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';

import { parseCurrency, toFloat } from '@cometa/utils';
import { cn } from '/src/utils/cn';
import { PartialPayin } from '/types/due-orders';
interface ChargeTableProps {
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideSum?: boolean;
  studentId?: string;
  conceptId?: string;
}

const InvoiceFoil = ({ value, query }: { value?: string; query: string }) => {
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
          <HighlightMatch query={query}>{value || '-'}</HighlightMatch>
        </span>
      </div>
    </Tooltip>
  );
};

export default function OrderTableForCharge({ hideHeader, hideSum, studentId = '', conceptId = '' }: ChargeTableProps) {
  const { data: session } = useSession();
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const queryClient = useQueryClient();
  const selectedSchool = useSelectedSchool();
  const [ordenDetailId, setOrdenDetailId] = useState('');
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PageSize,
  });
  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedDates, onDatesChange] = useState<Date[]>([]);

  const [startDate, endDate] = transformDates(selectedDates);
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);

  const params = {
    ...paramsFromForm,
    multiple_search: searchDebounced,
  };
  const getSchoolFulfillments = async (page: number) =>
    await ApiClient.getSchoolFulfillments(
      session?.token,
      selectedSchool?.id,
      page === 0 ? 1 : page + 1,
      selectedGuardian?.id,
      selectedStudent?.id || studentId,
      startDate,
      endDate,
      conceptId,
      params
    );

  const { data: fulfillmentTable, isFetching } = useQuery<FulfillmentTable>(
    [
      'schoolFulfillments',
      pageIndex,
      params,
      selectedSchool?.id,
      selectedGuardian?.id,
      selectedStudent?.id || studentId,
      startDate,
      endDate,
      conceptId,
    ],
    () => getSchoolFulfillments(pageIndex),
    {
      enabled: !!selectedSchool?.id,
      onSuccess: async (data) => {
        if (data.next) {
          await queryClient.prefetchQuery({
            queryKey: [
              'schoolFulfillments',
              pageIndex + 1,
              params,
              selectedSchool?.id,
              selectedGuardian?.id,
              selectedStudent?.id || studentId,
              startDate,
              endDate,
              conceptId,
            ],
            queryFn: () => getSchoolFulfillments(pageIndex + 1),
          });
        }
      },
      onError: () => {
        setPagination({ pageIndex: 0, pageSize: PageSize });
      },
    }
  );

  const handleOpen = (row: any) => {
    sendTrackEvent('dashboard: Paid Order Detail Opened', { source: document.title.split(' | ')[0] });
    setOrdenDetailId(row.id);
    onOpenTo();
  };

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const columnHelper = createColumnHelper<FulfillmentTable['results'][number]>();

  const columns = [
    columnHelper.accessor('correlative_id', {
      cell: (info) => {
        const idOrder = info.row.original.correlative_id;
        return (
          <span className={!idOrder ? 'italic font-normal text-sm' : ''}>
            <HighlightMatch query={searchDebounced}>{idOrder ?? 'ID por generar'}</HighlightMatch>
          </span>
        );
      },
      header: () => <span>ID de Orden</span>,
      minSize: 350,
    }),
    columnHelper.accessor('order_name', {
      cell: (info) => (
        <OrderNameWithParcial
          name={info.row.original.order_name}
          isParcial={info.row.original.payins.length > 1 || info.row.original.status === 'PARTIAL_PAID'}
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
    columnHelper.accessor('payins[0].paid_date', {
      header: () => <span className="whitespace-nowrap">Fecha de pago</span>,
      cell: (info) => {
        const date = (info.row.original.payins[0] as PartialPayin)?.paid_date;
        return info.row.original.payins.length > 1 || !info.getValue()
          ? formatDateShort(date || '')
          : formatDateShort(info.getValue());
      },
    }),
    columnHelper.accessor('total_paid', {
      cell: (info) => <span className="py-1">{parseCurrency(toFloat(info.getValue()), 'MXN') || '-'}</span>,
      header: () => <span className="whitespace-nowrap">Monto pagado</span>,
      meta: {
        numeric: true,
      },
      footer: () => (
        <>
          {fulfillmentTable && fulfillmentTable?.total_amount && (
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
            status: 'No facturable',
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
              <InvoiceFoil value={lastInvoice?.fiscal_identifier} query={searchDebounced} />
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
        return <PlaceToPay at_school={info.getValue()} sponsored={is_sponsored} />;
      },
      header: () => <span>Lugar de pago</span>,
    }),
    columnHelper.accessor('payin_correlative_id', {
      header: () => <span>Pagos vinculados</span>,
      cell: (info) => {
        const { payins } = info.row.original;
        // remove the first payin because it's the last payin
        // TODO make a lot renders because can't use shift
        const lastPayin = payins[0];
        const restPayins = payins.slice(1);
        return (
          <div className="flex flex-row">
            <span>
              <HighlightMatch query={searchDebounced}>{lastPayin?.correlative_id}</HighlightMatch>
            </span>
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
      cell: (info) => <HighlightMatch query={searchDebounced}>{info.getValue()?.correlative_id || '-'}</HighlightMatch>,
    }),
    columnHelper.display({
      id: 'arrow',
      cell: () => <IcArrowRight />,
      size: 250,
    }),
  ];
  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
    setPagination({
      pageIndex: 0,
      pageSize: PageSize,
    });
  };
  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setPagination({
      pageIndex: 0,
      pageSize: PageSize,
    });
  };
  return (
    <>
      <div>
        {!hideHeader && (
          <>
            <HeaderTable
              title="Órdenes Pagadas"
              selectedGuardian={selectedGuardian}
              setSelectedGuardian={setSelectedGuardian}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              clickOnButton={() => {
                sendTrackEvent('dashboard: Manual Payment Initiated', {});
                location.href = PATH_PORTAL.pay.manual;
              }}
              selectedDates={selectedDates}
              onDatesChange={onDatesChange}
              filterParams={paramsFromForm}
              filters={{ startDate, endDate }}
              handleFilter={handleFilter}
              handleClearFilter={() => setFormFilterData({})}
              setSearch={setSearch}
              search={search}
            />
            <MultipleFiltersChips onChange={handleChangeChipFilter} formFilterData={formFilterData} />
          </>
        )}
        <div>
          <div className={`${isFetching ? 'opacity-25 cursor-wait' : 'transition-opacity duration-300'}`}>
            <Table
              data={fulfillmentTable?.results || []}
              columns={columns}
              onRowClick={handleOpen}
              totalCount={fulfillmentTable?.count || 0}
              pagination={pagination}
              setPagination={setPagination}
              isLoading={isFetching}
              hideSum={hideSum}
              emptyStateText={`${
                search.length > 0
                  ? 'No hemos encontrado órdenes con esos criterios de búsqueda'
                  : 'No hay órdenes pagadas'
              }`}
              showEmptyStateImage
            />
          </div>
        </div>
      </div>
      <FulfillmentDetail onClose={onCloseTo} paymentId={ordenDetailId} open={openTo} />
    </>
  );
}
