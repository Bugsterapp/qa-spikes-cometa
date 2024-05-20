import Layout from '../components/layouts';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import FileIcon from '/public/assets/icons/download/file.svg';
import XMLIcon from '/public/assets/icons/download/xml.svg';
import TableIcon from '/public/assets/icons/download/table.svg';
import { useMemo, useRef, useState } from 'react';
import { formatDateShort, formatPrice } from '/src/utils/general';
import { sendTrackEvent } from '../utils/events';
import { useMutation } from '@tanstack/react-query';
import { TableInfinity } from '../components/GridInfinityScroll';
import { createColumnHelper } from '@tanstack/react-table';
import Link_To from '/public/assets/icons/ic_link_to.svg';
import MultipleFilters, {
  FormFilterData,
  formFilterDataToParams,
  MultipleFiltersChips,
  normalizeFilters,
  TooltipIcon,
} from '../components/MultipleFilters';
import { UseFormReturn } from 'react-hook-form';
import useDebounce from '/src/hooks/useDebounce';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';
import { ServiceClient, api } from '/src/utils/api';

import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import Header from '/src/components/molecules/dashboard/Header';
import * as Accordion from '@radix-ui/react-accordion';
import { cn } from '../utils/cn';
import * as React from 'react';
import Arrow from '/public/assets/icons/accordion_arrow.svg';
import Warning from '/public/assets/icons/navigation/delinquency_warning.svg';
import Status from '../components/Status';
import Chip from '../components/atoms/Chip';
import Grid from '../components/atoms/Grid';
import Button from '../components/organisms/dashboard/Button';
import Sheet from '../components/atoms/Sheet';
import SidebarHeader from '../components/molecules/dashboard/SidebarHeader';
import { Title, Value } from '../components/organisms/dashboard/FulfillmentDetail';
import LinkDetail from '../components/atoms/LinkDetail';
import Mail from '/public/assets/icons/studentDetail/mail.svg';
import Phone from '/public/assets/icons/studentDetail/phone.svg';
import Link from 'next/link';
import ManualPayDetail from '../components/organisms/dashboard/ManualPayPartial';
import {
  DownloadButton,
  DownloadMenu,
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '../components/BackgroundDownload/BackgroundDownload';
import MultipleSelectionComponent from '../components/organisms/dashboard/MultiSelect';
import { Tooltip } from '../components/atoms/Tooltip';
import useSendPageViewedEvent from '../hooks/useSendPageViewedEvent';
import { extractPageFromURL } from '/src/utils/object-util';
import { useAdjustHeight } from '../hooks/useFullScreenHeight';
import useGetActiveSchoolCycleElement from '../hooks/useActiveSchoolCycle';

const AccordionItem = React.forwardRef<HTMLDivElement, Accordion.AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Item
      className={cn('bg-[#F4F6F8]  overflow-hidden first:mt-0 first:rounded-t-lg last:rounded-b-lg', className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Accordion.Item>
  )
);

const AccordionTrigger = React.forwardRef<HTMLButtonElement, Accordion.AccordionTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="flex data-[state=open]:pb-4 transition-all">
      <Accordion.Trigger
        className={cn(
          'bg-[#F4F6F8] group flex flex-1 p-4 items-center leading-none outline-none cursor-pointer',
          className
        )}
        {...props}
        ref={forwardedRef}
        asChild
      >
        <div>
          <Arrow className="text-[#3366FF] -rotate-90 group-data-[state=open]:rotate-0 transition-transform w-4 ease-[cubic-bezier(0.87,_0,_0.13,_1)] mr-3" />
          {children}
        </div>
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

const AccordionContent = React.forwardRef<HTMLDivElement, Accordion.AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={cn(
        'px-4 last-of-type:pb-4 group pt-0 overflow-hidden text-[15px] border-b-[#F4F6F8] border-solid border-b data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="bg-white h-[72px] p-3.5 px-[60px] transition-colors hover:bg-blue-secondary-200/[.04] group-last:rounded-b-lg  group-first-of-type:rounded-t-lg ">
        {children}
      </div>
    </Accordion.Content>
  )
);

export default function Delinquency() {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  useSendPageViewedEvent('dashboard: delinquency table', selectedSchool);

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
        <DelinquencyTable />
      </div>
    </Sentry.ErrorBoundary>
  );
}

Delinquency.auth = true;
Delinquency.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Morosidad" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

interface ChargeTableProps {
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideSum?: boolean;
  studentId?: string;
  conceptId?: string;
}

export function DelinquencyTable({ hideSum }: ChargeTableProps) {
  const selectedSchool = useSelectedSchool();
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const [conceptTypes, setConceptTypes] = useState<
    (
      | 'BOOKS_AND_MATERIALS'
      | 'CAFETERIA'
      | 'EXAMS_AND_CERTIFICATES'
      | 'EXTRACURRICULAR'
      | 'INSCRIPTION'
      | 'MONTHLY_FEE'
      | 'OTHER'
      | 'PRE_DEBT'
      | 'REINSCRIPTION'
      | 'SPORTS'
      | 'TRANSPORT'
      | 'UNIFORMS_AND_MERCH'
    )[]
  >([]);

  const handleConceptType = (
    items: { value: 'INSCRIPTION' | 'MONTHLY_FEE' | 'OTHER' | 'PRE_DEBT' | 'TRANSPORT'; label: string }[]
  ) => {
    setConceptTypes(items.map((item) => item.value));
  };

  const params = {
    search: searchDebounced,
  };
  const [studentDetailId, setStudentDetailId] = useState<string | null>(null);

  const {
    data: fulfillmentTable,
    isFetching,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.delinquency.getDelinquency.useInfiniteQuery(
    {
      school_id: selectedSchool?.id as string,
      query: {
        concept_types: conceptTypes,
        ...paramsFromForm,
        ...params,
      },
    },
    {
      getNextPageParam: (lastPage) => extractPageFromURL(lastPage?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => firstPage ?? undefined,
      enabled: !!selectedSchool?.id,
    }
  );

  const totalStudentsFetched = useMemo(
    () => fulfillmentTable?.pages?.flatMap((page) => page?.results ?? []).length,
    [fulfillmentTable]
  );

  const flatData = useMemo(
    () =>
      fulfillmentTable?.pages?.flatMap(
        (page) => page?.results?.reduce<any[]>((acc, curr) => [...acc, ...curr.fulfillments], []) ?? []
      ),
    [fulfillmentTable]
  );
  const totalCount = useMemo(() => fulfillmentTable?.pages?.[0]?.count ?? 0, [fulfillmentTable]);
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);

  // FIXME: typing is coming bad from backend
  const columnHelper = createColumnHelper<any>();
  const columns = [
    columnHelper.accessor('student_id', {
      header: (header) => (
        <div className="text-left" style={{ minWidth: header.header.getSize() }}>
          student_id
        </div>
      ),
    }),
    columnHelper.accessor('order.name', {
      header: (header) => (
        <div className="text-left w-[190px]" style={{ minWidth: header.header.getSize() }}>
          Orden
        </div>
      ),
    }),
    columnHelper.accessor('order.due', {
      header: () => <div className="text-left w-[100px]">Fecha Vcto.</div>,
    }),
    columnHelper.accessor('status', {
      header: () => <span className="w-[100px]">Estado</span>,
    }),
    columnHelper.accessor('total_charge', {
      header: (header) => (
        <div className="text-right min-w-[100px]" style={{ maxWidth: header.header.getSize() }}>
          Recargos
        </div>
      ),
      size: 60,
    }),
    columnHelper.accessor('discount', {
      header: (header) => (
        <span className="w-full text-right min-w-[100px]" style={{ maxWidth: header.header.getSize() }}>
          Dctos y becas
        </span>
      ),
    }),
    columnHelper.accessor('total_paid', {
      header: (header) => (
        <span className="w-full text-right min-w-[100px]" style={{ maxWidth: header.header.getSize() }}>
          Pagado
        </span>
      ),
    }),
    columnHelper.accessor('total_remaining', {
      header: (header) => (
        <span
          className="w-full text-right whitespace-nowrap min-w-[100px]"
          style={{ maxWidth: header.header.getSize() }}
        >
          Por pagar
        </span>
      ),
    }),
  ];
  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };
  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };
  const { wrapperRef, headerRef, maxHeight } = useAdjustHeight(550);

  const [selectedOrder, setSelectedOrder] = useState<{ order: string; student: string } | null>(null);

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-80px)] min-h-[calc(100vh-70px)]" ref={wrapperRef}>
      <Sheet
        open={Boolean(studentDetailId)}
        onOpenChange={(open) => {
          if (!open) setStudentDetailId(null);
        }}
      >
        <Sheet.Content>
          {studentDetailId ? (
            <DelinquencyDetails student_id={studentDetailId} handleCloseDetails={() => setStudentDetailId(null)} />
          ) : (
            <> </>
          )}
        </Sheet.Content>
      </Sheet>
      <div ref={headerRef} className="pb-4">
        <HeaderTable
          title="Morosidad"
          selectedGuardian={selectedGuardian}
          setSelectedGuardian={setSelectedGuardian}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          filterParams={paramsFromForm as any}
          handleFilter={handleFilter}
          handleClearFilter={() => setFormFilterData({})}
          setSelectedItemsCount={setItemsCount}
          itemsCount={itemsCount}
          setSearch={setSearch}
          search={search}
          multiSelectChange={handleConceptType}
          conceptTypes={conceptTypes}
        />
        <div className="px-4">
          <MultipleFiltersChips
            onChange={handleChangeChipFilter}
            formFilterData={formFilterData}
            setItemsCount={setItemsCount}
            itemsCount={itemsCount}
          />{' '}
        </div>
      </div>
      <div className={`${isFetching ? 'opacity-50' : 'opacity-100'}`}>
        <TableInfinity
          data={flatData || []}
          columns={columns}
          totalCount={totalCount || 0}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage || false}
          isFetching={isFetching}
          isLoading={isLoading}
          hideSum={hideSum}
          totalFetched={totalStudentsFetched || 0}
          maxHeight={maxHeight}
          isFetchingNextPage={isFetchingNextPage}
          emptyStateText={
            !isFetching && !isLoading && !flatData?.length
              ? 'No hemos encontrado órdenes vencidas con esos criterios de búsqueda'
              : ''
          }
          showEmptyStateImage={!isFetching && !isLoading && !flatData?.length}
          state={{
            grouping: ['student_id'],
          }}
          hideColumns={['student_id']}
        >
          {(row) => {
            const studentData = fulfillmentTable?.pages
              .find((page) => page?.results?.find((r) => r.id === row?.getValue('student_id')))
              ?.results?.find((r) => r.id === row.getValue('student_id'));

            return !row?.subRows.length ? null : (
              <div className="px-5 my-4 col-span-full" key={row.getValue('student_id')}>
                <Accordion.Root type="single" collapsible value={row.getIsExpanded() ? row.getValue('student_id') : ''}>
                  <AccordionItem value={row.getValue('student_id')}>
                    <AccordionTrigger
                      onClick={(e) => {
                        if (e.target instanceof Element) {
                          const isExpandElement =
                            e.target.id === 'details-expand' || e.target.parentElement?.id === 'details-expand';
                          if (isExpandElement) {
                            e.preventDefault();
                          } else {
                            row.toggleExpanded();
                          }
                        }
                      }}
                      data-testid="details-expand-button"
                    >
                      <Grid columns={['grid-cols-2']} className="items-center w-full">
                        <div className="flex items-center gap-4 select-none justify-self-start">
                          <div className="flex flex-col">
                            <strong className="text-base text-left text-[#212B36]">
                              <HighlightMatch query={searchDebounced}>
                                {studentData?.first_name} {studentData?.last_name}
                              </HighlightMatch>
                            </strong>
                            <span className="text-xs text-[#637381] text-left">
                              <HighlightMatch query={searchDebounced}>{studentData?.enrollment_code}</HighlightMatch> |{' '}
                              {studentData?.section} - {studentData?.level}
                            </span>
                          </div>
                          <Tooltip message="Órdenes vencidas">
                            <Chip intent="error" rounded="full">
                              {studentData?.number_of_past_due_orders}
                            </Chip>
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-5 justify-self-end">
                          <div className="flex flex-col select-none">
                            <span className="text-xs text-[#637381] text-left">Deuda del alumno</span>
                            <strong className="text-base text-right text-[#212B36] ">
                              {formatPrice(studentData?.total_debt || '0')}
                            </strong>
                          </div>
                          <Tooltip message="Ver más detalle">
                            <Button
                              id="details-expand"
                              variant="icon"
                              data-testid="student-details-expand-button"
                              onClick={() => {
                                sendTrackEvent('dashboard: delinquency student detail open', {});
                                setStudentDetailId(row.getValue('student_id'));
                              }}
                              className="w-8 h-8 p-1 group/expand"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  className="group-hover/expand:[transform:translate(2px,-2px)] transition-all duration-100 ease-in-out"
                                  d="M16.6663 4.16683C16.6663 3.70659 16.2932 3.3335 15.833 3.3335H11.6663C11.2061 3.3335 10.833 3.70659 10.833 4.16683C10.833 4.62707 11.2061 5.00016 11.6663 5.00016H13.808L11.0746 7.74183C10.9169 7.8983 10.8281 8.1113 10.8281 8.3335C10.8281 8.55569 10.9169 8.76869 11.0746 8.92516C11.2311 9.08292 11.4441 9.17166 11.6663 9.17166C11.8885 9.17166 12.1015 9.08292 12.258 8.92516L14.9996 6.1835V8.3335C14.9996 8.79373 15.3727 9.16683 15.833 9.16683C16.2932 9.16683 16.6663 8.79373 16.6663 8.3335V4.16683Z"
                                  fill="#3366FF"
                                />
                                <path
                                  className="group-hover/expand:[transform:translate(-2px,2px)] transition-all duration-100 ease-in-out"
                                  d="M8.92467 11.0751C8.7682 10.9174 8.55521 10.8286 8.33301 10.8286C8.11081 10.8286 7.89781 10.9174 7.74134 11.0751L4.99967 13.8084V11.6668C4.99967 11.2065 4.62658 10.8334 4.16634 10.8334C3.7061 10.8334 3.33301 11.2065 3.33301 11.6668V15.8334C3.33301 16.2937 3.7061 16.6668 4.16634 16.6668H8.33301C8.79324 16.6668 9.16634 16.2937 9.16634 15.8334C9.16634 15.3732 8.79324 15.0001 8.33301 15.0001H6.18301L8.92467 12.2584C9.08243 12.102 9.17117 11.889 9.17117 11.6668C9.17117 11.4446 9.08243 11.2316 8.92467 11.0751V11.0751Z"
                                  fill="#3366FF"
                                />
                              </svg>
                            </Button>
                          </Tooltip>
                        </div>
                      </Grid>
                    </AccordionTrigger>
                    {row.subRows.map((subRow) => {
                      const getFulfillmentStatusValues = (
                        fulfillmentStatus: 'NOT_PAID' | 'WAITING_PAID' | 'PARTIAL_PAID'
                      ) => {
                        switch (fulfillmentStatus) {
                          case 'WAITING_PAID':
                            return {
                              value: 'Pago iniciado',
                              status: 'muted',
                              tooltip: 'El tutor ha iniciado un proceso de pago para esta orden desde su portal.',
                            } as const;
                          case 'PARTIAL_PAID':
                            return {
                              value: 'Pago parcial',
                              status: 'warning',
                              tooltip: 'Una parte de esta orden ha sido pagada. Pero aún tiene pagos pendientes.',
                            } as const;
                          default:
                            return {
                              value: 'Por pagar',
                              status: 'info',
                              tooltip: 'Esta orden está pendiente de pago.',
                            } as const;
                        }
                      };

                      const { value, status, tooltip } = getFulfillmentStatusValues(subRow.original.status);
                      return (
                        <AccordionContent
                          key={subRow.id}
                          className="subrow hover:cursor-pointer"
                          onClick={() => {
                            sendTrackEvent('dashboard: delinquency order open', { origin: 'row' });
                            setSelectedOrder({ order: subRow.original.order.id, student: row.getValue('student_id') });
                          }}
                        >
                          <div className="grid grid-cols-[repeat(7,minmax(auto,1fr))] items-center gap-2">
                            <div className="flex flex-col min-w-[200px] max-w-[200px]">
                              <Tooltip message={subRow.original.order.name}>
                                <span className="break-all line-clamp-2">{subRow.original.order.name}</span>
                              </Tooltip>
                            </div>

                            <div className="flex items-center text-[#FF4842] min-w-[100px]">
                              <span className="mr-1 text-sm font-semibold">
                                {formatDateShort(subRow.original.order.due, false, true)}
                              </span>
                              <Warning className="w-3.5 h-3" />
                            </div>

                            <div className="min-w-[100px] flex items-center">
                              <Tooltip message={tooltip}>
                                <Status variant={status}>{value}</Status>
                              </Tooltip>
                            </div>

                            <div className="w-[100px] text-right">
                              {subRow.getValue('total_charge')
                                ? `+${formatPrice(subRow.getValue('total_charge'))}`
                                : '-'}
                            </div>
                            <div className="min-w-[100px] text-right">
                              {subRow.getValue('discount') ? `-${formatPrice(subRow.getValue('discount'))}` : '-'}
                            </div>
                            <div className="min-w-[100px] text-right">
                              {subRow.getValue('total_paid') ? formatPrice(subRow.getValue('total_paid')) : '-'}
                            </div>
                            <div className="min-w-[100px] text-right">
                              {subRow.getValue('total_remaining')
                                ? formatPrice(subRow.getValue('total_remaining'))
                                : '-'}
                            </div>
                          </div>
                        </AccordionContent>
                      );
                    })}
                  </AccordionItem>
                </Accordion.Root>
              </div>
            );
          }}
        </TableInfinity>
      </div>
      <div className="relative">
        <footer className="absolute py-4 bg-[#F4F6F8] bottom-0 inset-x-0 px-8">
          <div className="flex items-center justify-between pr-16 pl-7">
            <span className="text-xs text-[#454F5B]">
              <strong className="text-sm text-[#212B36] font-semibold mr-1" data-testid="totalStudents-txt">
                {fulfillmentTable?.pages[0]?.count || '-'}
              </strong>
              estudiantes
            </span>
            <span className="text-xs text-[#454F5B] text-right">
              Deuda total
              <strong className="ml-1 text-sm text-[#212B36] font-semibold">
                {(fulfillmentTable?.pages[0] as any)?.total_debt
                  ? formatPrice((fulfillmentTable?.pages[0] as any)?.total_debt)
                  : '-'}
              </strong>
            </span>
          </div>
        </footer>
      </div>
      {selectedOrder ? (
        <ManualPayDetail
          open={!!selectedOrder}
          onClose={() => {
            sendTrackEvent('dashboard: delinquency student detail close', {});
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.order}
          studentId={selectedOrder.student}
        />
      ) : null}
    </div>
  );
}
interface HeaderTableProps {
  filterParams: Record<string, string>;
  title: string;
  selectedGuardian: any;
  setSelectedGuardian: (selectedGuardian: any) => void;
  selectedStudent: any;
  setSelectedStudent: (selectedStudent: any) => void;
  handleFilter: (formFilterData: FormFilterData, methods: UseFormReturn<FormFilterData>) => void;
  handleClearFilter: () => void;
  setSearch: (search: string) => void;
  search: string;
  itemsCount: { watchKey: string; count: number }[];
  setSelectedItemsCount: (itemsCount: { watchKey: string; count: number }[]) => void;
  multiSelectChange: (
    items: { value: 'INSCRIPTION' | 'MONTHLY_FEE' | 'OTHER' | 'PRE_DEBT' | 'TRANSPORT'; label: string }[]
  ) => void;
  conceptTypes: (
    | 'BOOKS_AND_MATERIALS'
    | 'CAFETERIA'
    | 'EXAMS_AND_CERTIFICATES'
    | 'EXTRACURRICULAR'
    | 'INSCRIPTION'
    | 'MONTHLY_FEE'
    | 'OTHER'
    | 'PRE_DEBT'
    | 'REINSCRIPTION'
    | 'SPORTS'
    | 'TRANSPORT'
    | 'UNIFORMS_AND_MERCH'
  )[];
}

export function HeaderTable({
  title,
  handleFilter,
  handleClearFilter,
  filterParams,
  setSearch,
  search,
  setSelectedItemsCount,
  itemsCount,
  multiSelectChange,
  conceptTypes,
}: HeaderTableProps) {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchoolId();
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const getDelicuencyReport = async () =>
    ServiceClient.apiV1DashboardSchoolsStudentsDelinquencyXlsCreate(
      selectedSchool as string,
      {
        ...filterParams,
        ...(conceptTypes.length ? { concept_types: conceptTypes.join(',') as any } : undefined),
        search,
      },
      {
        headers: {
          Authorization: `Token ${session?.token}`,
        },
      }
    );
  const downloadInvoices = async (extension: 'xml' | 'pdf') => {
    sendTrackEvent('dashboard: Delinquency Downloaded', {
      Type: `Facturas ${extension.toUpperCase()}`,
      Source: 'Morosidad',
    });
    setIsWorking();

    return ServiceClient[
      extension === 'pdf'
        ? 'apiV1DashboardSchoolsStudentsDelinquencyPdfRetrieve'
        : 'apiV1DashboardSchoolsStudentsDelinquencyXmlRetrieve'
    ](
      selectedSchool as string,
      {
        ...filterParams,
        ...(conceptTypes.length ? { concept_types: conceptTypes.join(',') as any } : undefined),
        search,
      },
      {
        headers: {
          Authorization: `Token ${session?.token}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw Error(`Network Error Downloading Delinquency ${extension}`);
        }
        const data = res.data;
        addToQueue(data.id, ETypeFile.ZIP);
      })
      .catch(() => {
        setIsError();
        setTimeout(() => setToIdle(), 3000);
      });
  };

  const mutation = useMutation({
    mutationFn: getDelicuencyReport,
    async onSuccess(res) {
      if (!res.ok) {
        throw Error('Network error downloading delinquency Excel');
      }
      const data = res.data;
      addToQueue(data.id);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });
  const handleAdd = async () => {
    sendTrackEvent('dashboard: Delinquency Downloaded', { Type: 'Tabla', Source: 'Morosidad' });
    await mutation.mutate();
    setIsWorking();
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
  ];

  const { data: filtersData } = api.delinquency.getDelinquencyFilters.useQuery({ schoolId: selectedSchool as string });
  const schoolDelinquencyFilters = useMemo(() => {
    if (!filtersData) return undefined;
    return normalizeFilters(filtersData);
  }, [filtersData]);

  const filterItems = [
    {
      header: 'Colegiaturas vencidas',
      watchKey: 'due_monthly_concepts',
      contents: schoolDelinquencyFilters?.due_monthly_concepts,
    },
    {
      header: 'Concepto',
      watchKey: 'concepts',
      contents: schoolDelinquencyFilters?.concepts,
    },
    {
      header: 'Orden',
      watchKey: 'orders',
      contents: schoolDelinquencyFilters?.orders,
    },
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: schoolDelinquencyFilters?.levels,
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: schoolDelinquencyFilters?.sections,
    },
    {
      header: 'Estado de orden',
      watchKey: 'fulfillment_statuses',
      contents: schoolDelinquencyFilters?.fulfillment_statuses,
    },
    {
      header: 'Estado de estudiante',
      watchKey: 'is_active',
      contents: schoolDelinquencyFilters?.is_active,
    },
    {
      header: (
        <TooltipIcon message="Filtra los conceptos que pertenezcan al ciclo escolar de tu elección">
          Ciclo escolar
        </TooltipIcon>
      ),
      watchKey: 'school_cycles',
      contents: schoolDelinquencyFilters?.school_cycles.sort((a, b) => b.name.localeCompare(a.name)),
    },
  ];

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
            <GlobalSearch search={search} setSearch={setSearch} placeholder="Buscar por estudiante o matrícula" />
            <MultipleSelectionComponent
              items={
                schoolDelinquencyFilters?.concept_types?.map((ct) => ({
                  value: String(ct.id) as 'INSCRIPTION' | 'MONTHLY_FEE' | 'OTHER' | 'PRE_DEBT' | 'TRANSPORT',
                  label: ct.name,
                })) || []
              }
              onChange={multiSelectChange}
              label="Tipo de concepto"
              allSelectedLabel="Todos"
              className="max-w-[320px]"
              labelName="concepto"
              disableAll
            />
            <div className="flex justify-between gap-4 ml-auto w-fit">
              <div className="h-fit w-fit download-btn">
                <DownloadMenu items={DownloadMenuItems}>
                  <DownloadButton size="large" theme="blue" />
                </DownloadMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DelinquencyDetails({
  student_id,
  handleCloseDetails,
}: {
  student_id: string;
  handleCloseDetails: () => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const selectedSchool = useSelectedSchool();
  const {
    data: studentDelinquency,
    isLoading,
    refetch,
  } = api.delinquency.getDelinquencyByStudentId.useQuery(
    {
      student_id,
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );
  return (
    <>
      <div className="flex flex-col px-8">
        <div className="sticky top-0 z-10 w-full bg-white">
          <SidebarHeader title="Detalle de morosidad" onClose={handleCloseDetails} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold pb-1 text-gray-600 border-[rgba(145, 158, 171, 0.24)] border-solid border-b mb-6">
            ÓRDENES PAGADAS
          </label>
          <Grid columns={['grid-cols-4']} className="mb-5">
            <Title text="Estudiante:" />
            <div className="col-span-2">
              <LinkDetail
                href={`/student/detail/${student_id}`}
                text={`${studentDelinquency?.first_name} ${studentDelinquency?.last_name}`}
                message="Ver detalle del estudiante"
                loading={isLoading}
                className="w-fit"
              />
            </div>
          </Grid>
          <Grid columns={['grid-cols-4']} className="mb-5">
            <Title text="Matrícula:" />

            <Value text={studentDelinquency?.enrollment_code || ''} />
          </Grid>
          <Grid columns={['grid-cols-4']} className="mb-5">
            <Title text="Nivel y grado:" />
            <div className=" text-sm font-semibold divide-x divide-x-[rgba(145, 158, 171, 0.24)] w-fit text-secondary col-span-2">
              <span>{studentDelinquency?.level}</span> <span className="pl-1">{studentDelinquency?.section}</span>
            </div>
          </Grid>
        </div>
        <div className="flex flex-col mt-8">
          <label className="text-xs font-bold pb-1 text-gray-600 border-[rgba(145, 158, 171, 0.24)] border-solid border-b">
            TUTORES VINCULADOS
          </label>
          <div className="flex flex-col divide-y">
            {/* FIXME: Fix typing here */}
            {(studentDelinquency?.guardians as unknown as any[])?.map((guardian) => (
              <Link
                href={`/guardian/${guardian.id}`}
                key={guardian.id}
                className="py-5 px-3.5 items-start grid grid-cols-[1fr_auto] pb-6 border-b border-[rgba(145, 158, 171, 0.24)] border-solid last:border-none last:mb-6 hover:bg-blue-secondary-200/[0.04] hover:cursor-pointer"
              >
                <h4 className="col-start-1 row-start-1 mb-2 text-sm font-bold">
                  {guardian.first_name} {guardian.last_name}
                </h4>
                <div className="col-span-1 col-start-1 flex items-center divide-x divide-[#DFE3E8]">
                  <a className="flex items-center pr-4 text-xs">
                    <Mail className="w-4 mr-2 text-[#98A2B3]" /> {guardian.email}
                  </a>
                  <a className="flex items-center pl-4 text-xs">
                    <Phone className="w-4 mr-2 text-[#98A2B3]" />
                    {guardian.phone}
                  </a>
                </div>
                <Link_To className="row-start-1" />
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between px-4 py-5 font-bold rounded-lg bg-blue-secondary-200/[0.04]">
            <span>Deuda total</span>
            <span className="text-right">
              {studentDelinquency?.total_debt ? formatPrice(studentDelinquency?.total_debt) : '-'}
            </span>
          </div>
        </div>
        <div className="flex flex-col mt-8">
          <label className="text-xs font-bold pb-1 text-gray-600 border-[rgba(145, 158, 171, 0.24)] border-solid border-b">
            ÓRDENES VENCIDAS{' '}
            <span className="font-thin">({studentDelinquency?.number_of_past_due_orders} órdenes)</span>
          </label>
          <div className="mt-6 mb-6 border rounded-lg border-info border-opacity-[0.9]">
            {
              // FIXME: fix typing
              (studentDelinquency?.fulfillments as unknown as any[])?.map((fulfillment) => (
                <div
                  key={fulfillment.id}
                  className="grid grid-cols-4 gap-4 py-[22px] px-4 border-b border-gray-500 border-opacity-24 hover:bg-info hover:bg-opacity-[0.04] group hover:cursor-pointer"
                  onClick={() => {
                    sendTrackEvent('dashboard: delinquency table order open', { origin: 'sidepanel' });
                    setSelectedOrder(fulfillment.order.id);
                  }}
                >
                  <div className="flex items-center col-span-3">
                    <label className="pr-2 text-sm font-medium text-gray-500 border-r border-gray-500/24 ">
                      {fulfillment.correlative_id}
                    </label>
                    <div className="flex items-center text-[#FF4842] pl-2">
                      <span className="mr-1 text-sm font-semibold">
                        {formatDateShort(fulfillment.order.due, false, true)}
                      </span>
                      <Warning className="w-3.5 h-3" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="bg-transparent">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          className="group-hover:[transform:translate(2px,-2px)] transition-all duration-100 ease-in-out"
                          d="M16.6663 4.16683C16.6663 3.70659 16.2932 3.3335 15.833 3.3335H11.6663C11.2061 3.3335 10.833 3.70659 10.833 4.16683C10.833 4.62707 11.2061 5.00016 11.6663 5.00016H13.808L11.0746 7.74183C10.9169 7.8983 10.8281 8.1113 10.8281 8.3335C10.8281 8.55569 10.9169 8.76869 11.0746 8.92516C11.2311 9.08292 11.4441 9.17166 11.6663 9.17166C11.8885 9.17166 12.1015 9.08292 12.258 8.92516L14.9996 6.1835V8.3335C14.9996 8.79373 15.3727 9.16683 15.833 9.16683C16.2932 9.16683 16.6663 8.79373 16.6663 8.3335V4.16683Z"
                          fill="#3366FF"
                        />
                        <path
                          className="group-hover:[transform:translate(-2px,2px)] transition-all duration-100 ease-in-out"
                          d="M8.92467 11.0751C8.7682 10.9174 8.55521 10.8286 8.33301 10.8286C8.11081 10.8286 7.89781 10.9174 7.74134 11.0751L4.99967 13.8084V11.6668C4.99967 11.2065 4.62658 10.8334 4.16634 10.8334C3.7061 10.8334 3.33301 11.2065 3.33301 11.6668V15.8334C3.33301 16.2937 3.7061 16.6668 4.16634 16.6668H8.33301C8.79324 16.6668 9.16634 16.2937 9.16634 15.8334C9.16634 15.3732 8.79324 15.0001 8.33301 15.0001H6.18301L8.92467 12.2584C9.08243 12.102 9.17117 11.889 9.17117 11.6668C9.17117 11.4446 9.08243 11.2316 8.92467 11.0751V11.0751Z"
                          fill="#3366FF"
                        />
                      </svg>
                    </button>
                  </div>

                  <label className="col-span-3 text-sm font-semibold">{fulfillment.order.name}</label>
                  <div className="flex flex-col text-right">
                    <span className="text-sm text-[rgba(99, 115, 129, 1)]">Monto a pagar</span>
                    <span className="font-bold">{formatPrice(fulfillment.total_remaining)}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {selectedOrder && studentDelinquency?.id ? (
        <ManualPayDetail
          open={!!selectedOrder}
          onClose={() => {
            refetch();
            setSelectedOrder(null);
          }}
          orderId={selectedOrder}
          studentId={studentDelinquency?.id}
        />
      ) : null}
    </>
  );
}
