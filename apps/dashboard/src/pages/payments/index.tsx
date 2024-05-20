import Layout from '../../components/layouts';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import FileIcon from '/public/assets/icons/download/file.svg';
import XMLIcon from '/public/assets/icons/download/xml.svg';
import TableIcon from '/public/assets/icons/download/table.svg';
import PersonIcon from 'public/assets/images/person.svg';
import { AnchorHTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ApiClient from '../../services/ApiClient';
import { formatDateShort, formatDateWithUTCShort, paymentTypeLabel } from '../../utils/general';
import { sendTrackEvent } from '../../utils/events';
import { useMutation } from '@tanstack/react-query';
import { Table } from '/src/components/TableInfinityScroll';
import { createColumnHelper } from '@tanstack/react-table';
import InvoiceChip from 'src/components/atoms/Chip';
import { Tooltip } from 'src/components/atoms/Tooltip';
import IcDownload from '/public/assets/icons/ic_download.svg';
import IcClose from '/public/assets/icons/ic_close.svg';

import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import MultipleFilters, {
  FormFilterData,
  formFilterDataToParams,
  MultipleFiltersChips,
  normalizeFilters,
  Params,
  TooltipIcon,
} from '../../components/MultipleFilters';
import { UseFormReturn } from 'react-hook-form';
import DateRange, { transformDates } from '/src/components/DateRange';
import PlaceToPay from '/src/components/atoms/PlaceToPay';
import useDebounce from '/src/hooks/useDebounce';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';

import { parseCurrency, toFloat } from '@cometa/utils';
import { api } from '/src/utils/api';
import {
  ColumnsResponse,
  DashboardPayinFulfillment,
  PaginatedDashboardPayinFulfillmentList,
} from '@cometa/trpc/src/types';
import { Combobox } from '/src/components/atoms/Combobox';
import {
  useSetIsWorking,
  useAddToQueue,
  useSetToError,
  useSetToIdle,
  ETypeFile,
  DownloadMenu,
  DownloadButton,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import Header from '/src/components/molecules/dashboard/Header';
import GuardianSelector from '/src/components/organisms/dashboard/GuardianSelector';
import useSearchStudents from '/src/hooks/useSearchStudents';
import useToggle from '/src/hooks/useToggle';
import { cn } from '/src/utils/cn';
import FulfillmentDetail from '/src/components/organisms/dashboard/FulfillmentDetail';
import { useFlags } from '/flags/client';
import { useAdjustHeight } from '/src/hooks/useFullScreenHeight';
import { extractPageFromURL } from '/src/utils/object-util';
import useGetActiveSchoolCycleElement from '/src/hooks/useActiveSchoolCycle';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';

PaymentsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Pagos recibidos">
      {page}
    </Layout>
  );
};

function PaymentsPage() {
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
        <PaymentsTable />
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
    }),
    columnHelper.accessor('payin.paid_date', {
      cell: (info) => (
        <span className="font-semibold">
          {info.getValue() ? formatDateWithUTCShort(info.getValue() || '', false, false) : '-'}
        </span>
      ),
      header: () => <div className="min-w-[110px] text-left">Fecha de pago</div>,
      size: 320,
    }),
    columnHelper.accessor('order', {
      cell: (info) => <OrderNameWithParcial name={info.row.original.order} isParcial={info.row.original.is_partial} />,
      header: () => <div className="min-w-[280px] text-left">Orden</div>,
    }),
    columnHelper.accessor('fulfillment.student_fullname', {
      cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
      header: () => <span className="min-w-[250px] text-left">Estudiante</span>,
    }),
    columnHelper.accessor('payin.guardian_fullname', {
      cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
      header: () => <div className="min-w-[200px] text-left">Pagador(Tutor)</div>,
      size: 60,
    }),
    columnHelper.accessor('payin.collected_at', {
      cell: (info) => <PlaceToPay at_school={info.getValue() === 'collected_at_school'} />,
      header: () => <span className="min-w-[116px]">Lugar de pago</span>,
    }),
    columnHelper.accessor('payin.type', {
      cell: (info) => paymentTypeLabel(info.getValue() as string),
      header: () => <span className="min-w-[160px] text-left">Medio de pago</span>,
    }),
    columnHelper.accessor('total_paid', {
      cell: (info) => <span className="py-1">{parseCurrency(info.getValue(), 'MXN') || '-'}</span>,
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

    columnHelper.accessor('invoice', {
      cell: (info) => {
        const { status } = info.getValue() || {};
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
              <InvoiceChip intent={invoiceStatus['not_requested']}>No Facturable</InvoiceChip>
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
            status: 'No facturable',
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
    }),
    columnHelper.accessor('invoice.fiscal_identifier', {
      cell: (info) => <InvoiceFoil value={info.getValue() || ''} query={searchDebounced} />,
      header: () => <span className="min-w-[103px]">Folio de factura</span>,
      size: 250,
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
    columnHelper.accessor('payin.correlative_id', {
      cell: (info) => <HighlightMatch query={searchDebounced}>{info.getValue() || '-'}</HighlightMatch>,
      header: () => <span className="min-w-[116px]">ID de pago</span>,
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
        } else {
          return <span className="italic text-[#919EAB]">No aplica</span>;
        }
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
export function PaymentsTable({ hideHeader, hideSum, studentId = '' }: ChargeTableProps) {
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const selectedSchool = useSelectedSchool();
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedDates, onDatesChange] = useState<Date[]>([]);

  const [startDate, endDate] = transformDates(selectedDates);
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const params = {
    multiple_search: searchDebounced,
  };
  const [ordenDetailId, setOrdenDetailId] = useState('');

  const {
    data: fulfillmentTable,
    isFetching,
    isLoading,
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
        ...paramsFromForm,
        ...params,
      },
    },
    {
      getNextPageParam: (lastPage) => extractPageFromURL(lastPage?.next as string) ?? undefined,
      enabled: !!selectedSchool?.id,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    }
  );

  const handleSelectionGuardian = (selectedGuardian: any) => {
    setSelectedGuardian(selectedGuardian);
    sendTrackEvent('dashboard: Filtro Pagos Recibidos', {
      Type: 'Filtros',
      Source: 'Pagos recibidos',
      Filtros: ['guardian'],
    });
  };
  const handleSelectionStudent = (selectedStudent: any) => {
    setSelectedStudent(selectedStudent);
    sendTrackEvent('dashboard: Filtro Pagos Recibidos', {
      Type: 'Filtros',
      Source: 'Pagos recibidos',
      Filtros: ['student'],
    });
  };

  const flatData = useMemo(() => fulfillmentTable?.pages?.flatMap((page) => page?.results ?? []), [fulfillmentTable]);
  const totalCount = useMemo(() => fulfillmentTable?.pages?.[0]?.count ?? 0, [fulfillmentTable]);
  const handleOpen = (row: any) => {
    sendTrackEvent('dashboard: Pagos Recibidos order open', { source: document.title.split(' | ')[0] });
    setOrdenDetailId(String(row.fulfillment.id));
    onOpenTo();
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
    sendTrackEvent('dashboard: Filtro Pagos Recibidos', {
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

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-80px)] min-h-[calc(100vh-70px)]" ref={wrapperRef}>
      {!hideHeader && (
        <div ref={headerRef} className="pb-4">
          <HeaderTable
            title="Pagos recibidos"
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
          />
          <div className="pl-4">
            <MultipleFiltersChips
              onChange={handleChangeChipFilter}
              formFilterData={formFilterData}
              setItemsCount={setItemsCount}
              itemsCount={itemsCount}
            />
          </div>
        </div>
      )}

      <div
        className={`${
          isFetching && !isFetchingNextPage ? 'opacity-50 cursor-wait' : 'transition-opacity duration-300'
        }`}
      >
        <Table
          data={flatData || []}
          columns={GenerateColumns(searchDebounced, selectedSchool, fulfillmentTable, totalCount, paramsFromForm)}
          onRowClick={handleOpen}
          totalCount={totalCount || 0}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage || false}
          isFetching={isFetching}
          isLoading={isLoading}
          hideSum={hideSum}
          totalFetched={flatData?.length || 0}
          maxHeight={maxHeight}
          isFetchingNextPage={isFetchingNextPage}
          emptyStateText={`${
            search.length > 0 ? 'No hemos encontrado pagos con esos criterios de búsqueda' : 'No hay pagos recibidos'
          }`}
          showEmptyStateImage
        />
        <FulfillmentDetail onClose={onCloseTo} paymentId={ordenDetailId} open={openTo} />
      </div>
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
}: HeaderTableProps) {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const selectedSchoolId = useSelectedSchoolId();
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const [searchStudent, setSearchStudent] = useState('');
  const debouncedQuery = String(useDebounce(searchStudent, 300));
  const flags = useFlags({
    traits: { school_id: selectedSchoolId, schoolName: selectedSchool?.name, email: session?.user?.email },
  }).flags;

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
  const { data: studentsOnSchool, isFetching } = useSearchStudents(
    session?.token,
    selectedSchoolId || '',
    debouncedQuery
  );

  const [selectedRows] = useReportConfig();
  const getDelicuencyReport = async ({ config }: { config: boolean }) =>
    ApiClient.generatePayinsFulfillmentsReport(session?.token || '', selectedSchoolId || '', {
      ...filters,
      ...filterParams,
      students: selectedStudent?.id,
      guardians: selectedGuardian?.id,
      v2: flags?.show_new_reports_payments,
      ...(config && selectedRows?.length > 0 ? { config: selectedRows } : {}),
    });

  const downloadInvoices = async (extension: 'xml' | 'pdf') => {
    sendTrackEvent('dashboard: Pagos recibidos Downloaded', {
      Type: `Facturas ${extension.toUpperCase()}`,
      Source: 'Pagos recibidos',
    });

    setIsWorking();

    return ApiClient.getOrderPayinFulfillmentReport(session?.token || '', selectedSchoolId, extension, {
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
    mutationFn: ({ config }: { config: boolean }) => getDelicuencyReport({ config }),
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
    sendTrackEvent('dashboard: Pagos Recibidos Downloaded', { Type: 'Tabla', Source: 'Pagos recibidos' });
    await mutation.mutate({ config: false });
    setIsWorking();
  };
  const handleOpenDownloadReportMenu = () => {
    onOpenDownloadReportMenu();
  };
  const { data: columnsData } = api.schools.schoolsPayinsFulfillmentsColumns.useQuery({
    schoolId: selectedSchoolId as string,
  });

  const accountingReport = api.payments.generatePayinFulfillmentsReportWithSegments.useMutation({
    async onSuccess(response) {
      if (response?.data.id) {
        addToQueue(response.data.id);
      } else {
        setIsError();
        setTimeout(() => setToIdle(), 3000);
      }
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });

  useSendPageViewedEvent('Pagos Recibidos', selectedSchool);
  const handleDownloadReportPersonalized = async () => {
    await mutation.mutate({ config: true });
    setIsWorking();
    sendTrackEvent('dashboard: Pagos Recibidos Downloaded', {
      Type: 'Tabla Personalizada',
      Source: 'Pagos recibidos',
      ColumnasSeleccionadas: Array.isArray(selectedRows) ? selectedRows : [],
    });
  };
  const DownloadMenuItems = [
    {
      key: 'invoices-zip',
      children: (
        <>
          <FileIcon className="w-4" />
          <span>Descargar facturas PDF</span>
        </>
      ),
      onClick: () => downloadInvoices('pdf'),
    },
    {
      key: 'invoices-xml',
      children: (
        <>
          <XMLIcon className="w-4" />
          <span>Descargar facturas XML</span>
        </>
      ),
      onClick: () => downloadInvoices('xml'),
    },
    {
      key: 'table-report',
      children: (
        <>
          <TableIcon className="w-5" />
          <span>Descargar tabla</span>
        </>
      ),
      onClick: () => handleAdd(),
    },

    flags?.show_accounting_download
      ? {
          key: 'table-accounting-report',
          children: (
            <>
              <TableIcon className="w-5" />
              <span>Descargar tabla - Contabilidad</span>
            </>
          ),
          onClick: async () => {
            await accountingReport.mutateAsync({
              schoolId: selectedSchoolId as string,
              query: {
                ...filters,
                ...filterParams,
                students: selectedStudent?.id,
                guardians: selectedGuardian?.id,
              },
            });
            setIsWorking();
          },
        }
      : null,
  ].filter((item) => item !== null) as {
    key: string;
    children: JSX.Element;
    onClick: () => Promise<unknown>;
  }[];

  const { data: filtersData } = api.payments.payinsFulfillmentFilters.useQuery({
    schoolId: selectedSchoolId as string,
  });
  const schoolFulfillmentsFilters = useMemo(() => {
    if (!filtersData) return undefined;
    return normalizeFilters(filtersData);
  }, [filtersData]);

  const filterItems = [
    {
      header: 'Lugar de pago',
      watchKey: 'collected_at',
      contents: schoolFulfillmentsFilters?.collected_at,
    },
    {
      header: 'Tipo de concepto',
      watchKey: 'concept_types',
      contents: schoolFulfillmentsFilters?.concept_types,
    },
    {
      header: 'Concepto',
      watchKey: 'concepts',
      contents: schoolFulfillmentsFilters?.concepts,
    },
    {
      header: 'Orden',
      watchKey: 'orders',
      contents: schoolFulfillmentsFilters?.orders,
    },
    {
      header: 'Medio de pago',
      watchKey: 'types',
      contents: schoolFulfillmentsFilters?.types,
    },
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: schoolFulfillmentsFilters?.levels,
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: schoolFulfillmentsFilters?.sections,
    },
    {
      header: 'Facturado a',
      watchKey: 'billing_to',
      contents: schoolFulfillmentsFilters?.billing_to,
    },
    {
      header: 'Estado de factura',
      watchKey: 'invoice_statuses',
      contents: schoolFulfillmentsFilters?.invoice_statuses?.filter((item) => item.id !== 'not_requested'),
    },
    {
      header: (
        <TooltipIcon message="Filtra los conceptos que pertenezcan al ciclo escolar de tu elección">
          Ciclo escolar
        </TooltipIcon>
      ),
      watchKey: 'school_cycles',
      contents: schoolFulfillmentsFilters?.school_cycles.sort((a, b) => b.name.localeCompare(a.name)),
    },
    {
      header: 'Registrado por',
      watchKey: 'registered_by',
      contents: schoolFulfillmentsFilters?.registered_by,
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
  const schoolCycleChip = useGetActiveSchoolCycleElement;
  return (
    <div className="px-10">
      <Header title={title} />
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col w-full gap-4 md:gap-4">
          <div className="flex items-center gap-4">
            <MultipleFilters
              filterItems={filterItems}
              handleFilter={handleFilter}
              onClearFilter={handleClearFilter}
              itemsCount={itemsCount}
              setItemsCount={setSelectedItemsCount}
              postFixElement={schoolCycleChip}
            />
            <GlobalSearch
              search={search}
              setSearch={setSearch}
              placeholder="Buscar por ID de orden, pagos, depósitos o facturas"
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
                  <Combobox.Input icon={<PersonIcon />} placeholder="Buscar por alumno" />
                  <Combobox.Options>
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
              <DateRange selectedDates={selectedDates} onDatesChange={onDatesChange} />
            </div>
            <div className="h-fit w-fit download-btn" data-testid="download-button">
              {flags?.show_personalized_reports ? (
                <>
                  <DownloadButton size="large" theme="blue" onClick={handleOpenDownloadReportMenu} />
                  <DownloadReport
                    open={openDownloadReportMenu}
                    setOpen={setToggleDownloadReportMenu}
                    onOpen={onOpenDownloadReportMenu}
                    onClose={onCloseDownloadReportMenu}
                    openDownloadReportMenuOptions={setToggleDownloadReportMenuOptions}
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
                  />
                  <DownloadReportOptions
                    open={openDownloadReportMenuOptions}
                    setOpen={setToggleDownloadReportMenuOptions}
                    onClose={onCloseDownloadReportMenuOptions}
                    onOpen={onOpenDownloadReportMenuOptions}
                    columnsData={columnsData as unknown as ColumnsResponse['columns']}
                  />
                </>
              ) : (
                <DownloadMenu items={DownloadMenuItems}>
                  <DownloadButton size="large" theme="blue" />
                </DownloadMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Dialog from '../../components/atoms/Dialog';
import Button from '../../components/organisms/dashboard/Button';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpen: () => void;
  onClose: () => void;
  isLoading?: boolean;
  isMutating?: boolean;
  openDownloadReportMenuOptions: React.Dispatch<any>;
  handleDownloadReportComplete: () => void;
  handleDownloadReportPersonalized: () => void;
  handleDownloadInvoices: () => void;
};

export function DownloadReport({
  open,
  onClose,
  onOpen,
  isLoading,
  handleDownloadReportComplete,
  handleDownloadInvoices,
  handleDownloadReportPersonalized,
  openDownloadReportMenuOptions,
}: Props) {
  useEffect(() => {
    if (open) {
      onOpen();
    }
  }, [open]);
  const [selectedRows] = useReportConfig();
  return (
    <>
      <Dialog.Root
        classNames="px-0 pt-4 pb-0 h-[465px] min-w-[500px]"
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            onClose();
          }
        }}
      >
        {isLoading ? (
          <div className="min-h-[180px] flex items-center justify-center">
            <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
          </div>
        ) : (
          <>
            <Dialog.Title>
              <div className="px-6 flex justify-between">
                <div className="flex flex-col">
                  <h3 className="flex text-lg mb-1 font-bold">Descarga de pagos recibidos</h3>
                  <span className="text-sm font-normal flex text-[#637381]">
                    Elige entre los distintos reportes que puedes descargar.
                  </span>
                </div>
                <Dialog.Close onClick={onClose} className="-translate-y-3">
                  <IcClose fill="#637381" />
                </Dialog.Close>
              </div>
            </Dialog.Title>
            <div className="h-[1px] my-4 bg-[rgba(145,158,171,0.24)] mx-5" />
            <div className="px-4">
              <div className="bg-white rounded-lg h-[104px] px-[18px] py-4 mb-4 flex border border-[#DFE3E8] gap-6 items-center">
                <div className="flex flex-col items-start gap-2 ">
                  <h3 className="text-secondary font-semibold">Reporte personalizado</h3>
                  <p className="text-xs text-gray-600 text-left">
                    Configura un reporte a tu medida, guárdalo y lo tendrás disponible cada vez que lo necesites.
                  </p>
                </div>
                {selectedRows?.length === 0 && (
                  <Button
                    className="mt-2 bg-white border border-blue-secondary-200 text-blue-secondary-200 font-bold rounded-lg py-1 text-sm h-9"
                    variant="outline"
                    onClick={openDownloadReportMenuOptions}
                    id="report-config-button"
                  >
                    Configurar
                  </Button>
                )}
                {selectedRows?.length > 0 && (
                  <div className="flex">
                    <Button
                      className="mt-2 bg-white border border-blue-secondary-200 text-blue-secondary-200 font-bold rounded-r-none py-1 text-sm h-9 rounded-l-lg"
                      variant="outline"
                      onClick={handleDownloadReportPersonalized}
                    >
                      Descargar
                    </Button>
                    <Tooltip message="Configurar reporte personalizado">
                      <Button
                        className="mt-2 bg-white border border-blue-secondary-200 text-blue-secondary-200 font-bold rounded-l-none rounded-r-lg py-1 text-sm h-9 w-10 flex p-0"
                        variant="outline"
                        onClick={openDownloadReportMenuOptions}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M15.0251 6.80829H15.9334C16.708 6.81288 17.3334 7.44207 17.3334 8.21663V9.83329C17.3294 10.5841 16.7338 11.1982 15.9834 11.225H15.0751C14.9658 11.2342 14.8717 11.3056 14.8334 11.4083C14.7726 11.5021 14.7726 11.6228 14.8334 11.7166L15.4417 12.325C15.7048 12.5862 15.8528 12.9417 15.8528 13.3125C15.8528 13.6832 15.7048 14.0387 15.4417 14.3L14.3251 15.4166C14.0668 15.6823 13.7123 15.8326 13.3417 15.8333C12.9696 15.8284 12.614 15.679 12.3501 15.4166L11.7167 14.775C11.623 14.7141 11.5022 14.7141 11.4084 14.775C11.2834 14.825 11.1917 14.9083 11.1917 15.025V15.9333C11.1872 16.7078 10.558 17.3333 9.78341 17.3333H8.20842C7.45433 17.3338 6.83535 16.7369 6.80841 15.9833V15.075C6.7992 14.9657 6.7278 14.8716 6.62508 14.8333C6.52096 14.7666 6.38754 14.7666 6.28341 14.8333L5.64175 15.45C5.38049 15.7131 5.02503 15.861 4.65425 15.861C4.28346 15.861 3.92801 15.7131 3.66675 15.45L2.55008 14.3166C2.2831 14.0558 2.13284 13.6982 2.13341 13.325C2.1383 12.9528 2.28772 12.5972 2.55008 12.3333L3.22508 11.7166C3.2859 11.6228 3.2859 11.5021 3.22508 11.4083C3.17508 11.2833 3.09175 11.1916 2.97508 11.1916H2.06675C1.2922 11.187 0.666734 10.5579 0.666748 9.78329V8.20829C0.666748 7.43509 1.29355 6.80829 2.06675 6.80829H2.92508C3.03432 6.79908 3.12844 6.72768 3.16675 6.62496C3.23346 6.52084 3.23346 6.38741 3.16675 6.28329L2.55008 5.66663C2.2792 5.40445 2.12627 5.0436 2.12627 4.66663C2.12627 4.28965 2.2792 3.9288 2.55008 3.66663L3.69175 2.54996C3.95 2.28425 4.30455 2.13402 4.67508 2.13329C5.04719 2.13818 5.40282 2.2876 5.66675 2.54996L6.28341 3.22496C6.3772 3.28578 6.49797 3.28578 6.59175 3.22496C6.71675 3.17496 6.80841 3.09163 6.80841 2.97496V2.06663C6.813 1.29208 7.44219 0.666612 8.21675 0.666626H9.83342C10.5903 0.689162 11.1921 1.30941 11.1917 2.06663V2.92496C11.201 3.0342 11.2724 3.12832 11.3751 3.16663C11.4792 3.23334 11.6126 3.23334 11.7167 3.16663L12.3584 2.54996C12.6197 2.28686 12.9751 2.13889 13.3459 2.13889C13.7167 2.13889 14.0722 2.28686 14.3334 2.54996L15.4501 3.69163C15.7163 3.95298 15.8664 4.31025 15.8667 4.68329C15.8679 5.05421 15.7174 5.40949 15.4501 5.66663L14.7751 6.28329C14.7143 6.37707 14.7143 6.49785 14.7751 6.59163C14.8251 6.71663 14.9084 6.80829 15.0251 6.80829ZM6.30543 10.1161C6.75688 11.206 7.8204 11.9166 9.00008 11.9166C10.6109 11.9166 11.9167 10.6108 11.9167 8.99996C11.9167 7.82028 11.2061 6.75676 10.1162 6.30531C9.02636 5.85387 7.77185 6.1034 6.93769 6.93756C6.10353 7.77173 5.85399 9.02624 6.30543 10.1161Z"
                            fill="#3366FF"
                          />
                        </svg>
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg h-[104px] px-[18px] py-4 mb-4 flex border border-[#DFE3E8] gap-6 items-center">
                <div className="flex flex-col items-start gap-2">
                  <h3 className="text-secondary font-semibold">Reporte completo</h3>
                  <p className="text-xs text-gray-600 text-left">
                    Descarga toda la información que tenemos sobre cada uno de los pagos que has recibido.
                  </p>
                </div>
                <Button
                  className="mt-2 bg-white border border-blue-secondary-200 text-blue-secondary-200 font-bold rounded-lg py-1 text-sm h-9"
                  variant="outline"
                  onClick={handleDownloadReportComplete}
                >
                  Descargar
                </Button>
              </div>
              <div className="bg-white rounded-lg h-[104px] px-[18px] py-4 mb-4 flex border border-[#DFE3E8] gap-6 items-center">
                <div className="flex flex-col items-start gap-2">
                  <h3 className="text-secondary font-semibold">Facturas (XML y PDF)</h3>
                  <p className="text-xs text-gray-600 text-left">
                    Descarga todas las facturas emitidas de los pagos recibidos{' '}
                  </p>
                </div>
                <Button
                  className="mt-2 bg-white border border-blue-secondary-200 text-blue-secondary-200 font-bold rounded-lg py-1 text-sm h-9"
                  variant="outline"
                  onClick={handleDownloadInvoices}
                >
                  Descargar
                </Button>
              </div>
            </div>
          </>
        )}
      </Dialog.Root>
    </>
  );
}

type DownloadReportOptions = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
  onOpen: () => void;
  isLoading?: boolean;
  columnsData: ColumnsResponse['columns'];
};
export function DownloadReportOptions({ open, onClose, onOpen, isLoading, columnsData }: DownloadReportOptions) {
  useEffect(() => {
    if (open) {
      onOpen();
    }
  }, [open]);
  return (
    <>
      <Dialog.Root
        classNames="min-w-[500px] px-0 pt-4 pb-1 h-[465px]"
        open={open}
        hideShadow
        overlay={false}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            onClose();
          }
        }}
      >
        {isLoading ? (
          <div className="min-h-[180px] flex items-center justify-center">
            <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
          </div>
        ) : (
          <div id="report-config-menu-options">
            <Dialog.Title>
              <div className="px-6 flex justify-between">
                <div className="flex flex-col">
                  <h3 className="flex text-lg mb-1 font-bold">Personaliza tu reporte</h3>
                  <span className="text-sm font-normal flex text-[#637381]">
                    Selecciona la información que quieres incluir en tu descargable.{' '}
                  </span>
                </div>
                <Dialog.Close onClick={onClose} className="-translate-y-3">
                  <IcClose fill="#637381" />
                </Dialog.Close>
              </div>
            </Dialog.Title>
            <div>
              {columnsData ? (
                <TableComponent data={columnsData} onClose={onClose} />
              ) : (
                <div className="relative flex flex-col justify-between min-h-[380px]">
                  <div className="h-[293px] pr-1 pb-6">
                    <div className="flex items-center bg-[#FBFCFD] sticky top-0 z-10 pl-3 h-[45px]">
                      <div className="p-3.5">
                        <Skeleton className="w-5 h-5" />
                      </div>
                      <Skeleton className="w-1/3 h-4 ml-2" />
                    </div>
                    <div className="overflow-y-scroll h-full scrollbar">
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div key={index} className="flex items-center border-b border-gray-300 mx-3">
                          <div className="p-3.5">
                            <Skeleton className="w-5 h-5" />
                          </div>
                          <Skeleton className="w-3/4 h-4 ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-[64px] bg-white shadow-combinedShadow w-full rounded-b-2xl">
                    <div className="px-3 flex justify-end items-center gap-3 flex-1 h-full">
                      <Skeleton className="w-20 h-8" />
                      <Skeleton className="w-36 h-8" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog.Root>
    </>
  );
}

import { GenericRowCheckBoxButton } from '/src/components/organisms/dashboard/StudentAssignedTable';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { useReportConfig } from '/src/hooks/useReportConfig';

const TableComponent: React.FC<{ data: ColumnsResponse['columns']; onClose: () => void }> = ({ data, onClose }) => {
  const [selectedRowsPersisted, setSelectedRowsPersisted] = useReportConfig();
  const [localSelectedRows, setLocalSelectedRows] = useState<string[]>(selectedRowsPersisted);
  const [isScrolled, setIsScrolled] = useState(false);

  const dataAsArray = useMemo(() => Object.entries(data), [data]);

  const selectAllChecked =
    localSelectedRows.length === 0 ? false : localSelectedRows.length === dataAsArray.length ? true : 'indeterminate';

  const handleSelectRow = useCallback(
    (key: string) => {
      setLocalSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows.includes(key)) {
          return prevSelectedRows.filter((selectedRow) => selectedRow !== key);
        } else {
          return [...prevSelectedRows, key];
        }
      });
    },
    [setLocalSelectedRows]
  );

  const handleSelectAll = useCallback(() => {
    if (localSelectedRows.length === dataAsArray.length) {
      setLocalSelectedRows([]);
    } else {
      setLocalSelectedRows(dataAsArray.map(([key]) => key));
    }
  }, [dataAsArray, localSelectedRows, setLocalSelectedRows]);

  const handleSave = useCallback(() => {
    setSelectedRowsPersisted(localSelectedRows);
    onClose();
  }, [localSelectedRows, setSelectedRowsPersisted, onClose]);

  const handleDiscard = useCallback(() => {
    setLocalSelectedRows(selectedRowsPersisted);
    onClose();
  }, [selectedRowsPersisted, onClose]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    setIsScrolled(top > 5);
  }, []);

  return (
    <div className="relative flex flex-col justify-between min-h-[380px]">
      <div className="h-[293px] pr-1 pb-6">
        <div
          className={cn(
            'flex items-center bg-[#FBFCFD] sticky top-0 z-10 pl-4 h-[45px] transition-shadow duration-300',
            {
              'shadow-card': isScrolled,
            }
          )}
          onScroll={handleScroll}
        >
          <div className="pr-2 py-2 pl-1">
            <GenericRowCheckBoxButton checked={selectAllChecked} onClick={handleSelectAll} className="py-2 px-1" />
          </div>
          <div className="text-left text-[#637381] text-sm font-bold">Nombre de la columna</div>
        </div>
        <div className="overflow-y-scroll h-full scrollbar" onScroll={handleScroll}>
          {dataAsArray.map(([key, value], index) => (
            <div key={index} className="flex items-center border-b border-[rgba(145,158,171,0.24)] mx-4">
              <div className="pr-2 py-2 cursor-pointer pl-1">
                <GenericRowCheckBoxButton
                  checked={localSelectedRows.includes(key)}
                  className="py-1.5 px-1 cursor-pointer"
                  onClick={() => handleSelectRow(key)}
                />
              </div>
              <div className="text-left text-sm">{value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[64px] bg-white shadow-combinedShadow w-full rounded-b-2xl">
        <div className="px-4 flex justify-end items-center gap-4 flex-1 h-full">
          <button className="font-bold text-[#3366FF] text-sm" onClick={handleDiscard}>
            Descartar
          </button>
          <Tooltip
            message="Selecciona al menos una columna para continuar"
            disableHover={localSelectedRows?.length > 0}
          >
            <Button
              variant={localSelectedRows?.length === 0 ? 'ghost' : 'secondary'}
              className={cn('h-[36px] w-[155px] disabled:cursor-not-allowed', {
                'bg-[#E5E8EB] ': localSelectedRows?.length === 0,
              })}
              onClick={handleSave}
              disabled={localSelectedRows?.length === 0}
              id="report-config-save-button"
            >
              Guardar cambios
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
