import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import type {
  ColumnsResponse,
  DashboardPayinFulfillment,
  DashboardSchool,
  ListDashboardInvoiceResponseDTO,
  PaginatedDashboardPayinFulfillmentList,
  PaginatedListDashboardInvoiceResponseDTOList,
} from '@cometa/trpc/src/types';
import { parseCurrency, toFloat } from '@cometa/utils';
import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { type NextRouter, useRouter } from 'next/router';
import { type AnchorHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { ColumnCustomizerAction, type ColumnCustomizerColumn } from 'src/components/ColumnCustomizer';
import { useFixedColumnsCustomizer } from 'src/components/ColumnCustomizer/hooks';
import { RefundPaymentNotShowDetailDialog } from '../../components/payments/refund/RefundPaymentNotShowDetailDialog';
import { YearlyInvoiceDownload } from '../../components/payments/YearlyInvoiceDownload';
import IcDownload from '/public/assets/icons/ic_download.svg';
import PersonIcon from '/public/assets/images/person.svg';
import {
  DownloadButton,
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import DateRange, { transformDates } from '/src/components/DateRange';
import { DownloadReport, DownloadReportOptions } from '/src/components/DownloadReport';
import MultipleFilters, {
  type FormFilterData,
  formFilterDataToParams,
  MultipleFiltersChips,
  normalizeFilters,
  type Params,
} from '/src/components/MultipleFilters';
import { ShareTableAction } from '/src/components/ShareTable';
import { convertToOrdering } from '/src/components/Table';
import { Table, TableVirtualized } from '/src/components/TableInfinityScroll';
import { LeadLabel } from '/src/components/admissions/labels';
import InvoiceChip from '/src/components/atoms/Chip';
import { Combobox } from '/src/components/atoms/Combobox';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';
import MultipleSelectionComponent, { type Item } from '/src/components/atoms/MultipleSelection';
import PlaceToPay from '/src/components/atoms/PlaceToPay';
import { Tooltip } from '/src/components/atoms/Tooltip';
import Layout from '/src/components/layouts';
import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import OrderDetailSidepanel from '/src/components/order/OrderDetailSidepanel';
import GuardianSelector from '/src/components/organisms/dashboard/GuardianSelector';
import { SchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import InvoiceDetail from '/src/components/payments/invoice/InvoiceDetail';
import SidePanelDetail from '/src/components/ui/SidepanelDetail';
import { TabsWrapper } from '/src/components/ui/Tabs';
import { Events } from '/src/constants/events';
import { invoiceStatus, invoiceStatusI18N } from '/src/constants/invoice';
import { useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import useDebounce from '/src/hooks/useDebounce';
import { useAdjustHeight } from '/src/hooks/useFullScreenHeight';
import { useReportConfig } from '/src/hooks/useReportConfig';
import useSearchStudents from '/src/hooks/useSearchStudents';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import useToggle from '/src/hooks/useToggle';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { formatDateShort, formatDateWithUTCShort, paymentTypeLabel } from '/src/utils/general';
import { extractPageFromURL } from '/src/utils/object-util';

enum TableType {
  PAYMENTS = 'payments',
  INVOICES = 'invoices',
}

PaymentsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Pagos y Facturas">
      {page}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => ({
  props: {
    tab: ctx.query.tab ?? TableType.PAYMENTS,
  },
});

function PaymentsPage({ tab }: { tab: string }) {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          session,
          selectedSchool,
        });
      }}
    >
      <div>
        <PaymentsTable tab={tab} />
      </div>
    </Sentry.ErrorBoundary>
  );
}

PaymentsPage.auth = true;

export default PaymentsPage;

interface ChargeTableProps {
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideSum?: boolean;
  studentId?: string;
  conceptId?: string;
  tab: string;
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
      <span
        className="max-w-[100px] whitespace-nowrap text-ellipsis overflow-hidden block"
        onClick={(e) => {
          e.stopPropagation();
          if (value) {
            navigator.clipboard
              .writeText(value)
              .then(() => setHasCopied(true))
              .catch(() => setHasCopied(false));
          }
        }}
      >
        <HighlightMatch query={query}>{value ?? '-'}</HighlightMatch>
      </span>
    </Tooltip>
  );
};

type GuaranteedResults = PaginatedDashboardPayinFulfillmentList & { results: DashboardPayinFulfillment[] };

type GuaranteedResultsInvoices = PaginatedListDashboardInvoiceResponseDTOList & {
  results: ListDashboardInvoiceResponseDTO[];
};

const GenerateColumns = (
  searchDebounced: string,
  selectedSchool: any,
  fulfillmentTable?: any,
  totalCount?: number,
  paramsFromForm?: any
) => {
  const columnHelper = createColumnHelper<GuaranteedResults['results'][number]>();

  const columns = [
    columnHelper.accessor('fulfillment.correlative_id', {
      cell: (info) => {
        const idOrder = info.row.original.fulfillment.correlative_id;
        return (
          <span className={!idOrder ? 'italic font-normal text-sm' : ''}>
            <HighlightMatch query={searchDebounced}>{idOrder ?? 'ID por generar'}</HighlightMatch>
          </span>
        );
      },
      header: () => <span className="min-w-[148px] text-left">ID de orden</span>,
      footer: () => (
        <>
          {totalCount && paramsFromForm?.billing_to && (
            <span className="flex flex-row items-end text-xs">
              <strong className="mr-1 text-sm font-bold">{totalCount}</strong>
              Pagos recibidos
            </span>
          )}
        </>
      ),
      enableSorting: true,
    }),
    columnHelper.accessor('payin.paid_date', {
      cell: (info) => (
        <span className="font-semibold">
          {info.getValue() ? formatDateWithUTCShort(info.getValue() || '', false, false) : '-'}
        </span>
      ),
      header: () => <div className="min-w-[110px] text-left">Fecha de pago</div>,
      size: 320,
      enableSorting: true,
    }),
    columnHelper.accessor('total_paid', {
      cell: (info) => {
        const hasRefund = !!info.row.original.refund;
        const isParcialRefund = hasRefund && info.row.original.total_paid !== (info.row.original.refund?.amount || 0);
        return (
          <div className="flex flex-col">
            <span className="py-1">{parseCurrency(info.getValue(), 'MXN') || '-'}</span>
            {hasRefund ? (
              <span className="text-xs font-normal leading-5">
                {isParcialRefund ? 'Devuelto parcialmente' : 'Devuelto'}
              </span>
            ) : null}
          </div>
        );
      },
      header: () => <span className="whitespace-nowrap min-w-[148px] text-right">Monto pagado</span>,
      meta: {
        numeric: true,
      },
      footer: () => (
        <>
          {fulfillmentTable?.pages?.[0]?.total_amount && fulfillmentTable.pages[0]?.total_amount !== 'None' && (
            <span className="flex flex-col items-end text-xs">
              Suma{' '}
              <strong className="text-sm font-bold" data-testid="footerTotalAmount-text">
                {parseCurrency(toFloat(fulfillmentTable.pages[0].total_amount), 'MXN')}
              </strong>
            </span>
          )}
        </>
      ),
    }),
    columnHelper.accessor('invoice.status', {
      cell: (info) => {
        const status = info.getValue();
        const invoiceStatus = {
          success: 'success',
          pending: 'info',
          canceled: 'error',
          canceling: 'error',
          not_requested: 'disabled',
          failed: 'warning',
          multiple: 'neutral',
        } as const;
        if (!status)
          return (
            <Tooltip message="No se ha solicitado la emisión de una factura">
              <InvoiceChip intent={invoiceStatus.not_requested}>Sin factura</InvoiceChip>
            </Tooltip>
          );

        const invoiceStatusI18N = {
          success: {
            status: 'Emitida',
            tooltip: '',
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
            tooltip: 'No hace falta tomar acción. Cometa estará solucionando el problema. Más info.',
          },
          multiple: {
            status: 'Múltiples',
            tooltip: 'Esta orden ha recibido múltiples pagos parciales',
          },
        } as const;

        return (
          <Tooltip message={invoiceStatusI18N[status].tooltip}>
            <InvoiceChip intent={invoiceStatus[status]}>{invoiceStatusI18N[status].status}</InvoiceChip>
          </Tooltip>
        );
      },
      header: () => <span className="min-w-[150px] text-start">Facturación</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('fulfillment.student_fullname', {
      cell: (info) => (
        <span className="flex gap-2 font-semibold">
          {info.getValue()}
          {info.row.original.fulfillment.student?.state ? (
            <LeadLabel state={info.row.original.fulfillment.student?.state} />
          ) : (
            '-'
          )}
        </span>
      ),
      header: () => <span className="min-w-[250px] text-left">Estudiante</span>,
    }),
    columnHelper.accessor('payin.type', {
      cell: (info) => paymentTypeLabel(info.getValue() as string),
      header: () => <span className="min-w-[160px] text-left">Medio de pago</span>,
    }),
    columnHelper.accessor('payin.guardian_fullname', {
      cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
      header: () => <div className="min-w-[200px] text-left">Pagador(Tutor)</div>,
      size: 60,
    }),
    columnHelper.accessor('order', {
      cell: (info) => <OrderNameWithParcial name={info.row.original.order} isParcial={info.row.original.is_partial} />,
      header: () => <div className="min-w-[280px] text-left">Orden</div>,
    }),
    columnHelper.accessor('payin.collected_at', {
      cell: (info) => <PlaceToPay at_school={info.getValue() === 'collected_at_school'} />,
      header: () => <span className="min-w-[116px]">Lugar de pago</span>,
    }),
    columnHelper.accessor('invoice.fiscal_identifier', {
      cell: (info) => <InvoiceFoil value={info.getValue() || ''} query={searchDebounced} />,
      header: () => <span className="min-w-[103px]">Folio de factura</span>,
      size: 250,
    }),
    columnHelper.accessor('payin.correlative_id', {
      cell: (info) => <HighlightMatch query={searchDebounced}>{info.getValue() || '-'}</HighlightMatch>,
      header: () => <span className="min-w-[116px]">ID de pago</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('invoice', {
      id: 'invoice.billing_identifier',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="text-xs truncate">{info.getValue()?.billing_name}</span>
          <span className="text-[#919EAB] text-xs">{info.getValue()?.tax_id}</span>
        </div>
      ),
      header: () => <span className="min-w-[253px] text-start">Facturado a:</span>,
      size: 250,
    }),
    columnHelper.accessor('invoice.pdf_url', {
      cell: (info) => {
        const Element = info.getValue() ? 'a' : 'span';

        const Props: AnchorHTMLAttributes<HTMLAnchorElement> = {
          href: info.getValue(),
          target: '_blank',
          rel: 'noreferrer noopener',
          onClick: (e) => e.stopPropagation(),
        };

        return (
          <Element
            {...(info.getValue() ? Props : undefined)}
            className={cn('text-gray-400 text-center mt-4  z-40', {
              'text-blue-secondary': !!info.getValue(),
            })}
          >
            <IcDownload fill="currentColor" />
          </Element>
        );
      },
      header: () => null,
      size: 250,
    }),
    columnHelper.accessor('payout.correlative_id', {
      cell: (info) => (
        <HighlightMatch query={searchDebounced}>
          {!info.getValue() ? (
            <span className="min-w-[140px] italic text-[#919EAB]">
              {info.row.original.invoice?.status === 'pending' ? 'Pendiente' : 'No aplica'}
            </span>
          ) : (
            info.getValue()
          )}
        </HighlightMatch>
      ),
      header: () => <span>ID de depósito</span>,
    }),
    columnHelper.accessor('payin.created', {
      cell: (info) => {
        if (info.row.original.payin.collected_at === 'collected_at_school') {
          return <span className="font-semibold">{formatDateShort(info.getValue())}</span>;
        }
        return <span className="italic text-[#919EAB]">No aplica</span>;
      },
      header: () => <div className="min-w-[115px] text-left">Fecha de registro</div>,
      size: 320,
    }),
    columnHelper.accessor('payin.created_by_fullname', {
      cell: (info) =>
        info.getValue() ||
        (info.row.original.payin.collected_at !== 'collected_at_school' ? (
          <span className="italic text-[#919EAB]">No aplica</span>
        ) : (
          '-'
        )),
      header: () => <span className="min-w-[98px] text-left">Registrado por</span>,
    }),
  ];

  return columns;
};

const GenerateColumnsInvoices = (router: NextRouter, searchDebounced: string, selectedSchool?: DashboardSchool) => {
  const columnHelper = createColumnHelper<GuaranteedResultsInvoices['results'][number]>();

  const statusI18N = invoiceStatusI18N(selectedSchool?.config_dashboard?.emit_invoice_time);

  const handleOpenRelatedInvoice = (invoice_id: string) => {
    router.push({ query: { ...router.query, invoice_detail_id: invoice_id } }, undefined, {
      shallow: true,
    });
  };

  const columns = [
    columnHelper.accessor('client_identifier', {
      cell: (info) => {
        const clientIdentifier = info.row.original.client_identifier;
        const invoiceType = info.row.original.invoice_type;
        return (
          <span className={cn('flex flex-col', { 'italic font-normal text-sm': !clientIdentifier })}>
            <HighlightMatch query={searchDebounced}>{clientIdentifier ?? '-'}</HighlightMatch>
            {invoiceType === 'credit_note' ? (
              <span className="text-[#919EAB] text-xs mt-2">Nota de crédito</span>
            ) : null}
          </span>
        );
      },
      size: 164,
      header: 'Nº de folio',
      enableSorting: true,
    }),
    columnHelper.accessor('status', {
      cell: (info) => {
        const status = info.row.original.status;
        return (
          <span className={!status ? 'italic font-normal text-sm' : ''}>
            <InvoiceChip intent={invoiceStatus[status]}>{statusI18N[status].status}</InvoiceChip>
          </span>
        );
      },
      size: 160,
      header: 'Estado',
      enableSorting: true,
    }),
    columnHelper.accessor('fiscal_identifier', {
      cell: (info) => {
        const pdfUrl = info.row.original.pdf_url;
        const fiscalIdentifier = info.row.original.fiscal_identifier;
        const Element = pdfUrl ? 'a' : 'span';

        if (fiscalIdentifier === null) {
          return <></>;
        }

        const Props: AnchorHTMLAttributes<HTMLAnchorElement> = {
          href: info.row.original.pdf_url,
          target: '_blank',
          rel: 'noreferrer noopener',
          download: `${info.row.original.fiscal_identifier}.pdf`,
          onClick: (e) => e.stopPropagation(),
        };
        return (
          <span className="flex items-center gap-5">
            <span className={cn('block truncate', { 'italic font-normal text-sm': !fiscalIdentifier })}>
              <HighlightMatch query={searchDebounced}>
                <Tooltip message={fiscalIdentifier}>
                  <span className="block truncate max-w-[140px]">{fiscalIdentifier ?? '-'}</span>{' '}
                </Tooltip>
              </HighlightMatch>
            </span>
            <Element
              {...(info.getValue() ? Props : undefined)}
              className={cn('text-gray-400 text-center z-10', {
                'text-blue-secondary': !!info.getValue(),
              })}
            >
              <IcDownload fill="currentColor" />
            </Element>
          </span>
        );
      },
      size: 220,
      header: 'Folio fiscal',
    }),
    columnHelper.accessor('expedition_date', {
      cell: (info) => {
        const expeditionDate = info.row.original.expedition_date;
        return (
          <span className={!expeditionDate ? 'italic font-normal text-sm' : ''}>
            <HighlightMatch query={searchDebounced}>{formatDateShort(expeditionDate) ?? '-'}</HighlightMatch>
          </span>
        );
      },
      size: 200,
      header: 'Fecha de factura',
      enableSorting: true,
    }),
    columnHelper.accessor('payment_amount', {
      cell: (info) => {
        const payment_amount = info.row.original.payment_amount;
        return (
          <span className={!payment_amount ? 'italic font-normal text-sm' : ''}>
            <HighlightMatch query={searchDebounced}>{parseCurrency(payment_amount ?? '0', 'MXN')}</HighlightMatch>
          </span>
        );
      },
      size: 160,
      header: 'Monto facturado',
    }),
    columnHelper.accessor('student_name', {
      cell: (info) => {
        const studentName = info.row.original.student_name;
        const studentState = info.row.original.student_state;
        return (
          <span
            className={cn('min-w-[260px] max-w-[260px] truncate flex gap-2', {
              'italic font-normal text-sm': !studentName,
            })}
          >
            <HighlightMatch query={searchDebounced}>{studentName ?? '-'}</HighlightMatch>
            {studentState && <LeadLabel state={studentState} />}
          </span>
        );
      },
      size: 260,
      header: 'Estudiante',
    }),
    columnHelper.accessor('order_name', {
      cell: (info) => {
        const order = info.row.original.order_name;
        return (
          <span className={cn('max-w-[280px] whitespace-break-spaces block', { 'italic font-normal text-sm': !order })}>
            <HighlightMatch query={searchDebounced}>{order ?? '-'}</HighlightMatch>
          </span>
        );
      },
      size: 280,
      header: 'Orden',
    }),
    columnHelper.accessor('billing_guardian_name', {
      cell: (info) => {
        const billingGuardian = info.row.original.billing_guardian_name;
        const billingTaxId = info.row.original.billing_tax_id;
        return (
          <div className="flex flex-col">
            <span className="text-xs truncate">{billingGuardian}</span>
            <span className="text-[#919EAB] text-xs">{billingTaxId}</span>
          </div>
        );
      },
      size: 250,
      header: 'Facturado a:',
    }),
    columnHelper.accessor('related_invoice', {
      cell: (info) => {
        const related_invoice_id = info.row.original.related_invoice?.id;
        const related_fiscal_identifier = info.row.original.related_invoice?.fiscal_identifier;
        return related_invoice_id ? (
          <div className="block col-span-3 w-fit">
            <SidePanelDetail
              text={related_fiscal_identifier ?? '-'}
              textClass="block truncate max-w-[170px]"
              message="Ver detalle de orden"
              className="text-sm font-semibold text-[#212B36] "
              setOnClick={(e) => {
                e.stopPropagation();
                handleOpenRelatedInvoice(related_invoice_id ?? null);
              }}
            />
          </div>
        ) : (
          <div>-</div>
        );
      },
      size: 250,
      header: 'Folio relacionado',
    }),
    columnHelper.accessor('order_id', {
      cell: (info) => {
        const order_id = info.row.original.order_id;
        return (
          <span className={!order_id ? 'italic font-normal text-sm' : ''}>
            <HighlightMatch query={searchDebounced}>{order_id ?? '-'}</HighlightMatch>
          </span>
        );
      },
      size: 160,
      header: 'ID de pago',
      enableSorting: true,
    }),
    columnHelper.accessor('guardian_name', {
      cell: (info) => {
        const guardian_name = info.row.original.guardian_name;
        return (
          <span className={!guardian_name ? 'italic font-normal text-sm' : 'max-w-[250px] block truncate'}>
            <HighlightMatch query={searchDebounced}>{guardian_name ?? '-'}</HighlightMatch>
          </span>
        );
      },
      size: 220,
      header: 'Pagador',
    }),
  ];

  return columns;
};

export function PaymentsTable({ hideHeader, hideSum, studentId = '', tab }: Readonly<ChargeTableProps>) {
  const router = useRouter();
  const { invoice_detail_id } = router.query;
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const selectedSchool = useSelectedSchool();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedDates, onDatesChange] = useState<Date[]>([]);

  const selectedSchoolId = useSelectedSchoolId();
  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    {
      school_id: selectedSchoolId as string,
    },
    {
      enabled: !!selectedSchoolId,
    }
  );
  const [selectedSchoolCycle, setSelectedSchoolCycle] = useState<SchoolCycleEntity | null>(null);

  const [startDate, endDate] = transformDates(selectedDates);
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const params = {
    multiple_search: searchDebounced,
  };
  const [ordenDetailId, setOrdenDetailId] = useState('');
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState<Record<string, string[]>>();
  const [paymentsSorting, setPaymentsSorting] = useState<string>();
  const [invoicesSorting, setInvoicesSorting] = useState<string>();
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const {
    data: fulfillmentTable,
    isFetching,
    isPending: isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.payments.payinsFulfillment.useInfiniteQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        end_date: endDate,
        start_date: startDate,
        guardians: selectedGuardian?.id ? [selectedGuardian?.id] : [],
        students: [selectedStudent?.id || studentId],
        school_cycles: selectedSchoolCycle ? [selectedSchoolCycle.id as string] : undefined,
        ordering: paymentsSorting ? [paymentsSorting] : undefined,
        ...paramsFromForm,
        ...params,
      },
    },
    {
      getNextPageParam: (lastPage) => extractPageFromURL(lastPage?.next as string) ?? undefined,
      enabled: !!selectedSchool?.id && tab !== 'invoices',
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    }
  );

  const handleSelectionGuardian = (selectedGuardian: any) => {
    setSelectedGuardian(selectedGuardian);
    sendTrackEventWithUserName(Events.filtro_pagos_recibidos, {
      Type: 'Filtros',
      Source: 'Pagos recibidos',
      Filtros: ['guardian'],
    });
  };
  const handleSelectionStudent = (selectedStudent: any) => {
    setSelectedStudent(selectedStudent);
    sendTrackEventWithUserName(Events.filtro_pagos_recibidos, {
      Type: 'Filtros',
      Source: 'Pagos recibidos',
      Filtros: ['student'],
    });
  };

  const flatData = useMemo(() => fulfillmentTable?.pages?.flatMap((page) => page?.results ?? []), [fulfillmentTable]);
  const totalCount = useMemo(() => fulfillmentTable?.pages?.[0]?.count ?? 0, [fulfillmentTable]);
  const handleOpen = (row: any) => {
    if (!!row.refund && !!row.fulfillment.deleted) {
      setShowRefundDialog(true);
      return;
    }

    sendTrackEventWithUserName(Events.pagos_recibidos_order_open, { source: document.title.split(' | ')[0] });
    setOrdenDetailId(String(row.fulfillment.id));
    onOpenTo();
  };
  const handleOpenInvoice = (row: any) => {
    router.push({ query: { ...router.query, invoice_detail_id: String(row.id) } }, undefined, {
      shallow: true,
    });
  };

  const handleCloseInvoiceDetail = () => {
    router.push({ query: { ...router.query, invoice_detail_id: undefined } }, undefined, {
      shallow: true,
    });
  };
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);

  const handleFilterDataForSegment = (data: FormFilterData) => {
    const filtered = Object.entries(data)
      .reduce((acc: { [key: string]: string }[], [key, value]) => {
        if (value.checked) {
          const newKey = key.split('$')[0];
          acc.push({ [newKey]: value.name });
        }
        return acc;
      }, [])
      .map((item) => Object.keys(item)[0]);

    return filtered;
  };

  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    const filterEventsData = handleFilterDataForSegment(data);
    sendTrackEventWithUserName(Events.filtro_pagos_recibidos, {
      Type: 'Filtros',
      Source: 'Pagos recibidos',
      Filtros: Array.isArray(filterEventsData) ? filterEventsData : [],
    });
    setFormFilterData(data);
  };
  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };
  const { wrapperRef, headerRef, maxHeight } = useAdjustHeight(550);

  const {
    data: invoices,
    isPending: isLoadingInvoices,
    hasNextPage: hasNextPageInvoice,
    isFetchingNextPage: isFetchingNextPageInvoice,
    fetchNextPage: fetchNextPageInvoice,
  } = api.payments.listInvoices.useInfiniteQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        end_date: endDate,
        start_date: startDate,
        guardians: selectedGuardian?.id ? [selectedGuardian?.id] : [],
        students: [selectedStudent?.id || studentId],
        school_cycles: selectedSchoolCycle ? [selectedSchoolCycle.id as string] : undefined,
        ordering: invoicesSorting ? [invoicesSorting] : undefined,
        ...paramsFromForm,
        ...params,
        ...selectedInvoiceStatus,
      },
    },
    {
      getNextPageParam: (lastPage) => extractPageFromURL(lastPage?.next as string) ?? undefined,
      enabled: !!selectedSchool?.id && tab === 'invoices',
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    }
  );

  const flatDataInvoices = useMemo(() => invoices?.pages?.flatMap((page) => page?.results ?? []) ?? [], [invoices]);

  const columnsDataPayments = useMemo(
    () => GenerateColumns(searchDebounced, selectedSchool, fulfillmentTable, totalCount, paramsFromForm),
    [searchDebounced, selectedSchool, fulfillmentTable, totalCount, paramsFromForm]
  );

  const {
    tableColumns: tableColumnsPayments,
    visibleTableColumns: visibleTableColumnsPayments,
    handleColumnsChange: handleColumnsChangePayments,
    fixedColumnIds: fixedColumnIdsPayments,
  } = usePaymentsColumnCustomizer({
    tableName: tab === TableType.PAYMENTS ? TableType.PAYMENTS : TableType.INVOICES,
    columns: columnsDataPayments,
  });

  const columnsDataInvoices = useMemo(
    () => GenerateColumnsInvoices(router, searchDebounced, selectedSchool),
    [router, searchDebounced, selectedSchool]
  );
  const {
    tableColumns: tableColumnsInvoices,
    visibleTableColumns: visibleTableColumnsInvoices,
    handleColumnsChange: handleColumnsChangeInvoices,
    fixedColumnIds: fixedColumnIdsInvoices,
  } = useInvoicesColumnCustomizer({
    tableName: tab === TableType.INVOICES ? TableType.INVOICES : TableType.PAYMENTS,
    columns: columnsDataInvoices,
  });

  const tableColumns = tab === TableType.PAYMENTS ? tableColumnsPayments : tableColumnsInvoices;
  const visibleTableColumns = tab === TableType.PAYMENTS ? visibleTableColumnsPayments : visibleTableColumnsInvoices;
  const handleColumnsChange = tab === TableType.PAYMENTS ? handleColumnsChangePayments : handleColumnsChangeInvoices;
  const fixedColumnIds = tab === TableType.PAYMENTS ? fixedColumnIdsPayments : fixedColumnIdsInvoices;

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-80px)] min-h-[calc(100vh-70px)] font-lota" ref={wrapperRef}>
      {!hideHeader && (
        <div ref={headerRef} className="pb-4">
          <HeaderTable
            tab={tab}
            title="Pagos y Facturas"
            selectedGuardian={selectedGuardian}
            setSelectedGuardian={handleSelectionGuardian}
            selectedStudent={selectedStudent}
            setSelectedStudent={handleSelectionStudent}
            selectedDates={selectedDates}
            onDatesChange={onDatesChange}
            filterParams={paramsFromForm}
            filters={{ startDate, endDate }}
            handleFilter={handleFilter}
            handleClearFilter={() => setFormFilterData({})}
            setSelectedItemsCount={setItemsCount}
            itemsCount={itemsCount}
            setSearch={setSearch}
            search={search}
            setInvoiceStatus={setSelectedInvoiceStatus}
            schoolCycle={selectedSchoolCycle ?? null}
            setSchoolCycle={setSelectedSchoolCycle}
            schoolCycles={schoolCycles ?? []}
            tableColumns={tableColumns}
            handleColumnsChange={handleColumnsChange}
            fixedColumnIds={fixedColumnIds}
            formFilterData={formFilterData}
          />
          <div className="pl-4">
            <MultipleFiltersChips
              onChange={handleChangeChipFilter}
              formFilterData={formFilterData}
              setItemsCount={setItemsCount}
              itemsCount={itemsCount}
              tableName={tab === TableType.INVOICES ? TableType.INVOICES : TableType.PAYMENTS}
            />
          </div>
        </div>
      )}

      <div
        className={`${
          isFetching && !isFetchingNextPage ? 'opacity-50 cursor-wait' : 'transition-opacity duration-300'
        }`}
      >
        {tab === TableType.PAYMENTS ? (
          <>
            <Table
              data={flatData || []}
              columns={visibleTableColumns}
              onRowClick={handleOpen}
              totalCount={totalCount || 0}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage || false}
              isFetching={isFetching}
              isLoading={isLoading}
              hideSum={hideSum}
              totalFetched={flatData?.length ?? 0}
              maxHeight={maxHeight}
              isFetchingNextPage={isFetchingNextPage}
              onSortingChange={(sorting) => {
                const text = convertToOrdering(sorting);
                setPaymentsSorting(text);
              }}
              emptyStateText={`${
                search.length > 0
                  ? 'No hemos encontrado pagos con esos criterios de búsqueda'
                  : 'No hay pagos recibidos'
              }`}
              showEmptyStateImage
            />
            <OrderDetailSidepanel
              key={ordenDetailId}
              onClose={() => {
                setOrdenDetailId('');
                onCloseTo();
              }}
              fulfillmentId={ordenDetailId}
              open={openTo}
              typeOfOrder="PAYMENT"
            />
          </>
        ) : (
          <>
            <div className="w-full">
              <TableVirtualized
                isLoading={isLoadingInvoices}
                hasNextPage={Boolean(hasNextPageInvoice)}
                fetchNextPage={fetchNextPageInvoice}
                isFetchingNextPage={isFetchingNextPageInvoice}
                data={flatDataInvoices}
                columns={visibleTableColumnsInvoices}
                onRowClick={handleOpenInvoice}
                totalCount={invoices?.pages?.[0]?.count ?? 0}
                totalFetched={flatDataInvoices?.length || 0}
                maxHeight={maxHeight}
                onSortingChange={(sorting) => {
                  const text = convertToOrdering(sorting);
                  setInvoicesSorting(text);
                }}
                emptyStateText={`${
                  search.length > 0 ? 'No hemos encontrado facturas con esos criterios de búsqueda' : 'No hay facturas'
                }`}
                showEmptyStateImage
                addMorePaddingFirstRow
              />
            </div>
            <InvoiceDetail
              onClose={handleCloseInvoiceDetail}
              invoiceId={invoice_detail_id as string}
              open={!!invoice_detail_id}
            />
          </>
        )}
      </div>

      <RefundPaymentNotShowDetailDialog open={showRefundDialog} onClose={() => setShowRefundDialog(false)} />
    </div>
  );
}
interface HeaderTableProps {
  filterParams: Params;
  filters: any;
  title: string;
  selectedGuardian: any;
  setSelectedGuardian: (selectedGuardian: any) => void;
  selectedStudent: any;
  setSelectedStudent: (selectedStudent: any) => void;
  handleFilter: (formFilterData: FormFilterData, methods: UseFormReturn<FormFilterData>) => void;
  handleClearFilter: () => void;
  selectedDates: Date[];
  onDatesChange(dates: Date[]): void;
  setSearch: (search: string) => void;
  search: string;
  itemsCount: { watchKey: string; count: number }[];
  setSelectedItemsCount: (itemsCount: { watchKey: string; count: number }[]) => void;
  tab: string;
  setInvoiceStatus: (selectedInvoiceStatus: Record<string, string[]>) => void;
  setSchoolCycle: (value: SchoolCycleEntity | null) => void;
  schoolCycle: SchoolCycleEntity | null;
  schoolCycles: SchoolCycleEntity[];
  tableColumns: ColumnCustomizerColumn[];
  handleColumnsChange: (columns: ColumnCustomizerColumn[]) => void;
  fixedColumnIds?: string[];
  formFilterData: FormFilterData;
}

export function HeaderTable({
  title,
  selectedGuardian,
  setSelectedGuardian,
  selectedStudent,
  setSelectedStudent,
  selectedDates,
  onDatesChange,
  handleFilter,
  handleClearFilter,
  filterParams,
  filters,
  setSearch,
  search,
  setSelectedItemsCount,
  itemsCount,
  tab,
  setInvoiceStatus,
  setSchoolCycle,
  schoolCycle,
  schoolCycles,
  tableColumns,
  handleColumnsChange,
  fixedColumnIds,
  formFilterData,
}: Readonly<HeaderTableProps>) {
  const selectedSchool = useSelectedSchool();
  const selectedSchoolId = useSelectedSchoolId();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const router = useRouter();
  const [searchStudent, setSearchStudent] = useState('');
  const debouncedQuery = String(useDebounce(searchStudent, 300));

  const {
    toggle: openDownloadReportMenu,
    onOpen: onOpenDownloadReportMenu,
    onClose: onCloseDownloadReportMenu,
    setToggle: setToggleDownloadReportMenu,
  } = useToggle();
  const {
    toggle: openDownloadReportMenuOptions,
    onOpen: onOpenDownloadReportMenuOptions,
    onClose: onCloseDownloadReportMenuOptions,
    setToggle: setToggleDownloadReportMenuOptions,
  } = useToggle();
  const { data: studentsOnSchool, isFetching } = useSearchStudents(selectedSchoolId ?? '', debouncedQuery);

  const isInvoiceTab = tab === 'invoices';

  const [selectedRows] = useReportConfig(tab);
  const generateReport = async ({ config }: { config: boolean }) => {
    filters = {
      school_cycles: schoolCycle ? [schoolCycle.id] : undefined,
      ...filters,
      ...filterParams,
      students: selectedStudent?.id,
      guardians: selectedGuardian?.id,
      ...(config && selectedRows?.length > 0 ? { config: selectedRows } : {}),
    };
    if (tab === TableType.PAYMENTS) {
      return ApiClient.generatePayinsFulfillmentsReport(selectedSchoolId || '', filters);
    }
    if (isInvoiceTab) {
      return ApiClient.generateInvoicesReport(selectedSchoolId || '', filters);
    }
  };

  const downloadInvoices = async (extension: 'xml' | 'pdf') => {
    sendTrackEventWithUserName(Events.pagos_recibidos_downloaded_lower, {
      Type: `Facturas ${extension.toUpperCase()}`,
      Source: 'Pagos recibidos',
    });

    setIsWorking();

    const reportEndpoint = isInvoiceTab ? ApiClient.getInvoicesZip : ApiClient.getOrderPayinFulfillmentReport;
    return reportEndpoint(selectedSchoolId, extension, {
      school_cycles: schoolCycle ? [schoolCycle.id] : undefined,
      ...filters,
      ...filterParams,
      students: selectedStudent?.id,
      guardians: selectedGuardian?.id,
    })
      .then((data: any) => {
        addToQueue(data.id, ETypeFile.ZIP);
      })
      .catch(() => {
        setIsError();
        setTimeout(() => setToIdle(), 3000);
      });
  };

  const mutation = useMutation({
    mutationFn: ({ config }: { config: boolean }) => generateReport({ config }),
    async onSuccess(data) {
      addToQueue(data.id);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });
  const handleAdd = async () => {
    sendTrackEventWithUserName(Events.pagos_recibidos_downloaded, { Type: 'Tabla', Source: 'Pagos recibidos' });
    await mutation.mutate({ config: false });
    setIsWorking();
  };
  const handleOpenDownloadReportMenu = () => {
    onOpenDownloadReportMenu();
  };

  const { data: paymentsColumnsData } = api.schools.schoolsPayinsFulfillmentsColumns.useQuery(
    { schoolId: selectedSchoolId as string },
    { staleTime: Number.POSITIVE_INFINITY, enabled: tab === TableType.PAYMENTS }
  );
  const { data: invoiceColumnsData } = api.payments.retrieveInvoiceReportColumns.useQuery(
    { schoolId: selectedSchoolId as string },
    { staleTime: Number.POSITIVE_INFINITY, enabled: isInvoiceTab }
  );
  const columnsData = isInvoiceTab ? invoiceColumnsData : paymentsColumnsData;

  useSendPageViewedEvent('Pagos Recibidos', selectedSchool);
  const handleDownloadReportPersonalized = async () => {
    await mutation.mutate({ config: true });
    setIsWorking();
    sendTrackEventWithUserName(Events.pagos_recibidos_downloaded, {
      Type: 'Tabla Personalizada',
      Source: 'Pagos recibidos',
      ColumnasSeleccionadas: Array.isArray(selectedRows) ? selectedRows : [],
    });
  };

  const { data: filtersDataPayments } = api.payments.payinsFulfillmentFilters.useQuery(
    {
      schoolId: selectedSchoolId as string,
    },
    { enabled: tab !== 'invoices' }
  );

  const { data: filtersDataInvoices } = api.payments.invoicesFilters.useQuery(
    {
      schoolId: selectedSchoolId as string,
    },
    { enabled: tab === 'invoices' }
  );

  const tableFilters = useMemo(() => {
    if (tab === 'payments' && filtersDataPayments) {
      return normalizeFilters(filtersDataPayments);
    }
    if (tab === 'invoices' && filtersDataInvoices) {
      return normalizeFilters(filtersDataInvoices);
    }
    return undefined;
  }, [filtersDataPayments, tab, filtersDataInvoices]);

  const filterItems = [
    {
      header: 'Lugar de pago',
      watchKey: 'collected_at',
      contents: tableFilters?.collected_at,
    },
    {
      header: 'Tipo de concepto',
      watchKey: 'concept_types',
      contents: tableFilters?.concept_types,
    },
    {
      header: 'Concepto',
      watchKey: 'concepts',
      contents: tableFilters?.concepts,
    },
    ...(tab === 'invoices'
      ? [
          {
            header: 'Tipo de factura',
            watchKey: 'invoice_types',
            // @ts-ignore
            contents: tableFilters?.invoice_types,
          },
        ]
      : []),
    {
      header: 'Orden',
      watchKey: 'orders',
      contents: tableFilters?.orders,
    },
    {
      header: 'Medio de pago',
      watchKey: 'types',
      contents: tableFilters?.types,
    },
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: tableFilters?.levels,
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: tableFilters?.sections,
    },
    {
      header: 'Facturado a',
      watchKey: 'billing_to',
      contents: tableFilters?.billing_to,
    },
    ...(tab === 'payments'
      ? [
          {
            header: 'Estado de factura',
            watchKey: 'invoice_statuses',
            contents: tableFilters?.invoice_statuses?.filter((item) => item.id !== 'not_requested'),
          },
        ]
      : []),
    {
      header: 'Registrado por',
      watchKey: 'registered_by',
      contents: tableFilters?.registered_by,
    },
  ];

  const studentsSearch = useMemo(
    () =>
      studentsOnSchool?.map((student: any) => ({
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        enrollment_code: student.enrollment_code,
      })),
    [studentsOnSchool]
  );

  const handleChangeTabs = (tab: string) => router.replace({ query: { ...router.query, tab: tab } });

  const tabsData = [
    {
      label: 'Pagos',
      value: 'payments',
    },
    {
      label: 'Facturas',
      value: 'invoices',
    },
  ];

  const [selectedStatusItems, setSelectedStatusItems] = useState<Item<string | number>[]>([]);

  const mappedInvoiceStatuses = selectedStatusItems.map((item) => ({
    value: item.value,
    label: item.label,
  }));

  return (
    <>
      <section className="pb-6">
        <div className="flex items-center justify-between pl-10 pr-10 mt-6">
          <h3 className="pb-6 text-2xl font-bold">{title}</h3>
          <YearlyInvoiceDownload />
        </div>
        <TabsWrapper
          tabs={tabsData}
          tab={tab}
          handleChangeTab={handleChangeTabs}
          defaultValue="payments"
          tabsListClassName="pl-10"
        />
      </section>
      <div className="px-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col w-full gap-4 md:gap-4">
            <div className="flex items-center gap-4">
              <MultipleFilters
                filterItems={filterItems}
                handleFilter={handleFilter}
                onClearFilter={handleClearFilter}
                itemsCount={itemsCount}
                setItemsCount={setSelectedItemsCount}
                tableName={tab === 'invoices' ? 'invoices' : 'payments'}
              />
              {schoolCycles && schoolCycles.length > 0 ? (
                <SchoolCycleSelector selected={schoolCycle} setFn={setSchoolCycle} cycles={schoolCycles || []} />
              ) : null}
              <GlobalSearch
                tableName={tab === 'invoices' ? 'invoices' : 'payments'}
                search={search}
                setSearch={setSearch}
                placeholder={
                  tab === 'invoices'
                    ? 'Buscar por ID de factura, órdenes o folio fiscal'
                    : 'Buscar por ID de orden, pagos, depósitos o facturas'
                }
              />
            </div>
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex gap-4">
                {studentsSearch && (
                  <Combobox
                    value={searchStudent}
                    onChange={setSearchStudent}
                    items={studentsSearch}
                    setSearch={setSearchStudent}
                    keyLabel="name"
                    handleSelection={(selectedStudent) => {
                      setSelectedStudent(selectedStudent);
                    }}
                  >
                    <Combobox.Input icon={<PersonIcon />} placeholder="Buscar por estudiante" />
                    <Combobox.Options className="z-40">
                      {studentsSearch?.map((person: any, index: any) => (
                        <Combobox.Option key={person.id} value={person} index={index}>
                          <div className="flex flex-col items-start font-normal">
                            <span className="text-base overflow-hidden text-ellipsis max-w-[220px] font-semibold truncate">
                              {person.name}
                            </span>
                            <span className="text-xs max-w-[220px] font-light truncate">{person.enrollment_code}</span>
                          </div>
                        </Combobox.Option>
                      ))}
                      {studentsSearch?.length === 0 && !isFetching && (
                        <div className="flex flex-col items-start gap-1 p-1 font-normal text-gray-600">
                          <span className="text-base">No se encontraron resultados</span>
                        </div>
                      )}
                    </Combobox.Options>
                  </Combobox>
                )}
                <GuardianSelector
                  selectedGuardian={selectedGuardian}
                  setSelectedGuardian={setSelectedGuardian}
                  guardianFilterText="Seleccionar el pagador"
                />
                {tab === 'invoices' && (
                  <MultipleSelectionComponent
                    tableName="invoices"
                    items={
                      tableFilters?.invoice_statuses
                        ?.filter((i) => i.id !== 'not_requested')
                        .map((item) => ({
                          value: item.id ?? '',
                          label: item.name ?? '',
                        })) || []
                    }
                    onChange={(value) => {
                      setSelectedStatusItems(value);
                      setInvoiceStatus({ invoice_statuses: value.map((v) => v.value as string) });
                    }}
                    label="Estado de facturas"
                    allSelectedLabel="Todos los estados"
                    labelName="estados de facturas"
                    fullWidth
                    showSelectAll={false}
                    disableAll={tableFilters?.invoice_statuses?.length === 0}
                    className="outline-none flex items-center min-w-220 max-w-[220px] 2xl:max-w-[368px] 2xl:min-w-[368px]"
                    classNames="min-h-[54px] truncate"
                  />
                )}

                <DateRange
                  tableName={tab === 'invoices' ? 'invoices' : 'payments'}
                  selectedDates={selectedDates}
                  onDatesChange={onDatesChange}
                />
              </div>
              <div className="flex justify-between gap-4 ml-auto w-fit">
                <ShareTableAction
                  tableName={tab === 'invoices' ? 'invoices' : 'payments'}
                  relativeUrl={`payments?tab=${tab}`}
                  filters={{
                    search: search,
                    selected_items: mappedInvoiceStatuses,
                    filters: formFilterData,
                    dates: selectedDates.map((date) => date.toISOString()),
                  }}
                  columns={{
                    columns: tableColumns.map((col) => ({
                      columnId: col.columnId,
                      columnName: col.columnName,
                      isVisible: col.isVisible,
                      order: col.order,
                      isFixed: col.isFixed,
                    })),
                  }}
                />
                <ColumnCustomizerAction
                  columns={tableColumns}
                  onColumnsChange={handleColumnsChange}
                  fixedColumnIds={fixedColumnIds}
                  tableName={tab === 'invoices' ? 'invoices' : 'payments'}
                />
                <div className="h-fit w-fit download-btn" data-testid="download-button">
                  <DownloadButton size="large" theme="blue" onClick={handleOpenDownloadReportMenu} />
                  <DownloadReport
                    open={openDownloadReportMenu}
                    setOpen={setToggleDownloadReportMenu}
                    onOpen={onOpenDownloadReportMenu}
                    onClose={onCloseDownloadReportMenu}
                    openDownloadReportMenuOptions={setToggleDownloadReportMenuOptions}
                    reportHeaderTitle={isInvoiceTab ? 'facturas' : 'pagos recibidos'}
                    completeReportSubtitle={
                      isInvoiceTab ? 'las facturas que has emitido' : 'los pagos que has recibido'
                    }
                    zipReportSubtitle={isInvoiceTab ? '' : 'de los pagos recibidos'}
                    handleDownloadReportComplete={() => {
                      handleAdd();
                      setToggleDownloadReportMenu(false);
                    }}
                    handleDownloadInvoices={() => {
                      downloadInvoices('pdf');
                      setToggleDownloadReportMenu(false);
                    }}
                    handleDownloadReportPersonalized={() => {
                      handleDownloadReportPersonalized();
                      setToggleDownloadReportMenu(false);
                    }}
                    storeKey={tab}
                  />
                  <DownloadReportOptions
                    open={openDownloadReportMenuOptions}
                    setOpen={setToggleDownloadReportMenuOptions}
                    onClose={onCloseDownloadReportMenuOptions}
                    onOpen={onOpenDownloadReportMenuOptions}
                    columnsData={columnsData as unknown as ColumnsResponse['columns']}
                    storeKey={tab}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const usePaymentsColumnCustomizer = ({ tableName, columns }: { tableName: string; columns: ColumnDef<any, any>[] }) => {
  const fixedColumnIds = [
    'fulfillment.correlative_id', // ID de orden
    'payin.paid_date', // Fecha de pago
    'total_paid', // Monto pagado
    'invoice.status', // Facturación
  ];

  const hiddenColumnIds = [
    'invoice.pdf_url', // PDF download icon column - should be shown in table but hidden in ColumnCustomizer
  ];

  return useFixedColumnsCustomizer({
    tableName,
    columns,
    fixedColumnIds,
    hiddenColumnIds,
  });
};

const useInvoicesColumnCustomizer = ({ tableName, columns }: { tableName: string; columns: ColumnDef<any, any>[] }) => {
  const fixedColumnIds = [
    'client_identifier', // Nº de folio
    'status', // Estado
    'expedition_date', // Fecha de factura
    'payment_amount', // Monto facturado
    'fiscal_identifier', // Nº de factura + PDF download icon
  ];

  const hiddenColumnIds: string[] = [];

  return useFixedColumnsCustomizer({
    tableName,
    columns,
    fixedColumnIds,
    hiddenColumnIds,
  });
};
