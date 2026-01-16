import type { DashboardSchoolPayouts } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';
import { type PaginationState, ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import useToggle from '../../../../hooks/useToggle';
import ApiClient from '../../../../services/ApiClient';
import { renderDate, renderMoney } from '../../../../utils/datagridHeaders';
import { PageSize, renderPayoutStatus } from '../../../../utils/general';
import useSendTrackEventWithUserName from '../../../../hooks/useSendTrackEventWithUserName';
import { Events } from '../../../../constants/events';
import { type FormFilterData, formFilterDataToParams, MultipleFiltersChips } from '../../../MultipleFilters';
import PayoutDetail from '../PayoutSidebarDetail';
import HeaderTable from './Header';
import {
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import { transformDates } from '/src/components/DateRange';
import { Table } from '/src/components/Table';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';
import Price from '/src/components/atoms/Sum';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import useDebounce from '/src/hooks/useDebounce';
import { api } from '/src/utils/api';
import { useFixedColumnsCustomizer } from 'src/components/ColumnCustomizer/hooks';
import { convertToOrdering } from '/src/components/Table';

const PAYOUTS_FIXED_COLUMN_IDS = ['correlative_id', 'deposit_date', 'status', 'total_emitted'];
const STORE_KEY_REPORT_CONFIG = 'payouts' as const;

export default function OrderTableForPayouts() {
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const selectedSchoolId = useSelectedSchoolId();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const [payoutDetailId, setPayoutDetailId] = useState('');
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const handleOpen = (row: DashboardSchoolPayouts) => {
    setPayoutDetailId(row.id);
    onOpenTo();
    sendTrackEventWithUserName(Events.payouts_detail_opened, {});
  };
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  const [sorting, setSorting] = useState<string>();

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    {
      school_id: selectedSchoolId as string,
    },
    {
      enabled: Boolean(selectedSchoolId),
      staleTime: 60 * 1000 * 60,
    }
  );

  const [schoolCycle, setSchoolCycle] = useState<SchoolCycleEntity | null>(null);

  const params = {
    ...paramsFromForm,
    multiple_search: searchDebounced,
    school_cycles: schoolCycle?.id ? [schoolCycle.id] : undefined,
    ordering: sorting ? [sorting] : undefined,
  };

  const [selectedDates, onDatesChange] = useState<Date[]>([]);

  const [startDatePayouts, endDatePayouts] = transformDates(selectedDates);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PageSize,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const {
    data: payoutResponse,
    isFetching,
    isPending: isLoading,
    error: payoutsError,
  } = api.payouts.list.useQuery(
    {
      schoolId: selectedSchoolId as string,
      query: {
        end_date: endDatePayouts,
        page: pageIndex === 0 ? 1 : pageIndex + 1,
        page_size: pageSize,
        start_date: startDatePayouts,
        ...params,
      },
    },
    {
      enabled: !!selectedSchoolId,
      retry: false,
    }
  );

  useEffect(() => {
    if (payoutsError) {
      setPagination({ pageIndex: 0, pageSize: PageSize });
    }
  }, [payoutsError]);

  const columnHelper = createColumnHelper<DashboardSchoolPayouts>();

  const orderingData = useMemo(() => {
    const data = payoutResponse?.results || [];

    const scheduledOrders = data.filter((item) => item.transaction_started === null);
    const sortedByDepositedDate = scheduledOrders.sort((a, b) => {
      const dateA = new Date(a.deposit_date);
      const dateB = new Date(b.deposit_date);
      return dateA > dateB ? -1 : dateA < dateB ? 1 : 0;
    });
    return sortedByDepositedDate.concat(data.filter((item) => item.transaction_started !== null));
  }, [payoutResponse]);

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
      header: () => <span className="whitespace-nowrap">ID de depósito</span>,
      size: 350,
      enableSorting: true,
    }),
    columnHelper.accessor('deposit_date', {
      cell: (info) => {
        const payout = info.row.original;
        return renderDate(payout.deposit_date);
      },
      header: () => <span className="whitespace-nowrap">Fecha de abono</span>,
      size: 350,
      enableSorting: true,
    }),
    columnHelper.accessor('status', {
      cell: (info) => renderPayoutStatus(info.getValue()),
      header: () => <span className="whitespace-nowrap">Estado</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('discounts', {
      cell: (info) => renderMoney(info.getValue()),
      header: () => <span className="whitespace-nowrap">Descuentos</span>,
      meta: {
        numeric: true,
      },
    }),
    columnHelper.accessor('surcharges', {
      cell: (info) => renderMoney(info.getValue()),
      header: () => <span className="whitespace-nowrap">Recargos</span>,
      meta: {
        numeric: true,
      },
    }),
    columnHelper.accessor('total_emitted', {
      cell: (info) => renderMoney(info.getValue()),
      header: () => <span className="whitespace-nowrap">Monto</span>,
      enableSorting: true,
      meta: {
        numeric: true,
      },
      footer: () => (
        <>{payoutResponse?.total_emitted_amount && <Price amount={payoutResponse.total_emitted_amount} />}</>
      ),
    }),
    columnHelper.accessor('bank_account', {
      cell: (info) => info.getValue(),
      header: () => <span className="whitespace-nowrap">Cuenta de abono</span>,
    }),
    columnHelper.accessor('orders_count', {
      cell: (info) => info.getValue(),
      header: () => <span className="whitespace-nowrap">Órdenes</span>,
      enableSorting: true,
    }),
  ];
  const getPayoutsReport = async () =>
    ApiClient.generatePayoutsReport(selectedSchoolId, {
      startDate: startDatePayouts,
      endDate: endDatePayouts,
      ids: null,
      ...params,
    });
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const mutation = useMutation({
    mutationFn: getPayoutsReport,
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
    sendTrackEventWithUserName(Events.payouts_report_downloaded, { Type: 'Tabla' });
    await mutation.mutate();
    setIsWorking();
  };
  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };
  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
  };

  const { tableColumns, visibleTableColumns, handleColumnsChange } = usePayoutsColumnCustomizer({
    tableName: STORE_KEY_REPORT_CONFIG,
    columns,
  });

  return (
    <>
      <HeaderTable
        filters={{ start_date: startDatePayouts, end_date: endDatePayouts, ...params }}
        formFilterData={formFilterData}
        title="Depósitos de Cometa al colegio"
        selectedDates={selectedDates}
        onDatesChange={onDatesChange}
        handleAdd={handleAdd}
        handleFilter={handleFilter}
        handleClearFilter={() => setFormFilterData({})}
        globalSearchComponent={
          <GlobalSearch search={search} setSearch={setSearch} placeholder="Buscar ID de pagos u órdenes asociadas" />
        }
        itemsCount={itemsCount}
        setSelectedItemsCount={setItemsCount}
        schoolCycle={schoolCycle}
        setSchoolCycle={setSchoolCycle}
        schoolCycles={schoolCycles ?? []}
        tableColumns={tableColumns}
        onColumnsChange={handleColumnsChange}
        tableName={STORE_KEY_REPORT_CONFIG}
        fixedColumnIds={PAYOUTS_FIXED_COLUMN_IDS}
      />
      <MultipleFiltersChips
        onChange={handleChangeChipFilter}
        formFilterData={formFilterData}
        itemsCount={itemsCount}
        setItemsCount={setItemsCount}
      />

      <Table
        data={orderingData}
        columns={visibleTableColumns as ColumnDef<DashboardSchoolPayouts>[]}
        onRowClick={handleOpen}
        totalCount={payoutResponse?.count || 0}
        pagination={pagination}
        setPagination={setPagination}
        isLoading={isLoading}
        isFetching={isFetching}
        onSortingChange={(sorting) => {
          const text = convertToOrdering(sorting);
          setSorting(text);
        }}
        emptyStateText={`${
          search.length > 0 ? 'No hemos encontrado órdenes con esos criterios de búsqueda' : 'No tenemos resultados'
        }`}
        showEmptyStateImage
      />
      <PayoutDetail openTo={openTo} onClose={onCloseTo} payoutId={payoutDetailId} />
    </>
  );
}

const usePayoutsColumnCustomizer = ({ tableName, columns }: { tableName: string; columns: ColumnDef<any, any>[] }) =>
  useFixedColumnsCustomizer({
    tableName,
    columns,
    fixedColumnIds: PAYOUTS_FIXED_COLUMN_IDS,
  });
