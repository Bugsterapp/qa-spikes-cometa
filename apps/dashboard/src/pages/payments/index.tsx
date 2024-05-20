import Layout from '../../components/layouts';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import FileIcon from '/public/assets/icons/download/file.svg';
import XMLIcon from '/public/assets/icons/download/xml.svg';
import TableIcon from '/public/assets/icons/download/table.svg';
import PersonIcon from 'public/assets/images/person.svg';
import { AnchorHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import ApiClient from '../../services/ApiClient';
import { formatDateShort, formatDateWithUTCShort, paymentTypeLabel } from '../../utils/general';
import { sendTrackEvent } from '../../utils/events';
import { useMutation } from '@tanstack/react-query';
import { Table } from '/src/components/TableInfinityScroll';
import { createColumnHelper } from '@tanstack/react-table';
import InvoiceChip from 'src/components/atoms/Chip';
import { Tooltip } from 'src/components/atoms/Tooltip';
import IcDownload from '/public/assets/icons/ic_download.svg';

import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import MultipleFilters, {
  FormFilterData,
  formFilterDataToParams,
  MultipleFiltersChips,
  normalizeFilters,
  Params,
} from '../../components/MultipleFilters';
import { UseFormReturn } from 'react-hook-form';
import DateRange, { transformDates } from '/src/components/DateRange';
import PlaceToPay from '/src/components/atoms/PlaceToPay';
import useDebounce from '/src/hooks/useDebounce';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';

import { parseCurrency, toFloat } from '@cometa/utils';
import { api } from '/src/utils/api';
import { DashboardPayinFulfillment, PaginatedDashboardPayinFulfillmentList } from '@cometa/trpc/src/types';
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

  function extractPageFromURL(url: string) {
    if (!url) return undefined;
    const urlObj = new URL(url); // Dummy base URL because the URL API expects absolute URLs
    const params = new URLSearchParams(urlObj.search);
    const page = params.get('page');
    return page;
  }

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
      // getPreviousPageParam: (firstPage) => firstPage ?? undefined,
      enabled: !!selectedSchool?.id,
      refetchOnWindowFocus: false,
    }
  );

  const flatData = useMemo(() => fulfillmentTable?.pages?.flatMap((page) => page?.results ?? []), [fulfillmentTable]);
  const totalCount = useMemo(() => fulfillmentTable?.pages?.[0]?.count ?? 0, [fulfillmentTable]);
  const handleOpen = (row: any) => {
    sendTrackEvent('dashboard: Pagos Recibidos order open', { source: document.title.split(' | ')[0] });
    setOrdenDetailId(String(row.fulfillment.id));
    onOpenTo();
  };
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);

  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };
  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(300);
  useEffect(() => {
    const adjustHeight = () => {
      const wrapperHeight = wrapperRef.current?.offsetHeight || 0;
      const siblingHeight = headerRef.current?.offsetHeight || 0;
      setMaxHeight(wrapperHeight - siblingHeight);
    };

    // Initial adjust
    adjustHeight();

    // Create new ResizeObserver object
    const resizeObserver = new ResizeObserver(adjustHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }
    // Start observing the sibling

    return () => {
      // Disconnect the observer when the component is unmounted
      resizeObserver.disconnect();
    };
  }, []);
  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-80px)] min-h-[calc(100vh-70px)]" ref={wrapperRef}>
      {!hideHeader && (
        <div ref={headerRef}>
          <HeaderTable
            title="Pagos recibidos"
            selectedGuardian={selectedGuardian}
            setSelectedGuardian={setSelectedGuardian}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
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
  const selectedSchool = useSelectedSchoolId();
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const [searchStudent, setSearchStudent] = useState('');
  const debouncedQuery = String(useDebounce(searchStudent, 300));
  const flags = useFlags({ traits: { school_id: selectedSchool } }).flags;

  const { data: studentsOnSchool, isFetching } = useSearchStudents(
    session?.token,
    selectedSchool || '',
    debouncedQuery
  );
  const getDelicuencyReport = async () =>
    ApiClient.generatePayinsFulfillmentsReport(session?.token || '', selectedSchool || '', {
      ...filters,
      ...filterParams,
      students: selectedStudent?.id,
      guardians: selectedGuardian?.id,
    });

  const downloadInvoices = async (extension: 'xml' | 'pdf') => {
    sendTrackEvent('dashboard: Pagos recibidos Downloaded', {
      Type: `Facturas ${extension.toUpperCase()}`,
      Source: 'Pagos recibidos',
    });
    setIsWorking();

    return ApiClient.getOrderPayinFulfillmentReport(session?.token || '', selectedSchool, extension, {
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
    mutationFn: getDelicuencyReport,
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
    await mutation.mutate();
    setIsWorking();
  };

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
              schoolId: selectedSchool as string,
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

  const { data: filtersData } = api.payments.payinsFulfillmentFilters.useQuery({ schoolId: selectedSchool as string });
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
      header: 'Ciclo escolar',
      watchKey: 'school_cycles',
      contents: schoolFulfillmentsFilters?.school_cycles,
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
                          <span className="text-base overflow-hidden text-ellipsis max-w-[220px] font-semibold">
                            {person.name}
                          </span>
                          <p className="text-xs font-light"> Matrícula: {person.enrollment_code}</p>
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
              <DownloadMenu items={DownloadMenuItems}>
                <DownloadButton size="large" theme="blue" />
              </DownloadMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
