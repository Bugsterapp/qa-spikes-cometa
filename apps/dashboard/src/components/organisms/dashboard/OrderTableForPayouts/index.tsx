import HeaderTable from './Header';
import { useSession } from 'next-auth/react';
import { useMemo, useRef, useState } from 'react';
import ApiClient from '../../../../services/ApiClient';
import useToggle from '../../../../hooks/useToggle';
import { PageSize, renderPayoutStatus } from '../../../../utils/general';
import { renderDate, renderMoney } from '../../../../utils/datagridHeaders';
import { sendTrackEvent } from '../../../../utils/events';
import * as Sentry from '@sentry/nextjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { Table } from '/src/components/Table';
import Price from '/src/components/atoms/Sum';
import {
  useSetIsWorking,
  useAddToQueue,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import PayoutDetail from '../PayoutSidebarDetail';
import { FormFilterData, formFilterDataToParams, MultipleFiltersChips } from '../../../MultipleFilters';
import { UseFormReturn } from 'react-hook-form';
import { transformDates } from '/src/components/DateRange';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import useDebounce from '/src/hooks/useDebounce';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';

export default function OrderTableForPayouts() {
  const { data: session } = useSession();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const selectedSchool = useSelectedSchoolId();
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const [payoutDetailId, setPayoutDetailId] = useState('');
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const handleOpen = (row: any) => {
    setPayoutDetailId(row.id);
    onOpenTo();
    sendTrackEvent('dashboard: Deposits Detail Opened', {});
  };
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);

  const params = {
    ...paramsFromForm,
    multiple_search: searchDebounced,
  };

  const [selectedDates, onDatesChange] = useState<Date[]>([]);

  const [startDatePayouts, endDatePayouts] = transformDates(selectedDates);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PageSize,
  });

  const fetchPayouts = async (pageIndex: number) =>
    await ApiClient.getIncomesPayouts(
      session?.token,
      selectedSchool,
      pageIndex === 0 ? 1 : pageIndex + 1,
      startDatePayouts,
      endDatePayouts,
      params
    );

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
    isLoading,
  } = useQuery(
    ['schoolPayout', pageIndex, selectedSchool, startDatePayouts, endDatePayouts, params],
    () => fetchPayouts(pageIndex),
    {
      enabled: !!selectedSchool,
      retry: false,
      onError: () => {
        setPagination({ pageIndex: 0, pageSize: PageSize });
      },
    }
  );

  const columnHelper = createColumnHelper<any>();

  const orderingData = useMemo(() => {
    const data = payoutResponse?.results || [];

    const scheduledOrders = data.filter((item: any) => item.transaction_started === null);
    const sortedByDepositedDate = scheduledOrders.sort((a: any, b: any) => {
      const dateA = new Date(a.deposit_date);
      const dateB = new Date(b.deposit_date);
      return dateA > dateB ? -1 : dateA < dateB ? 1 : 0;
    });
    return sortedByDepositedDate.concat(data.filter((item: any) => item.transaction_started !== null));
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
    }),
    columnHelper.accessor('deposit_date', {
      cell: (info) => {
        const payout = info.row.original;
        return renderDate(payout.deposit_date);
      },
      header: () => <span className="whitespace-nowrap">Fecha de abono</span>,
      size: 350,
    }),
    columnHelper.accessor('status', {
      cell: (info) => renderPayoutStatus(info.getValue()),
      header: () => <span className="whitespace-nowrap">Estado</span>,
    }),
    columnHelper.accessor('total_emitted', {
      cell: (info) => renderMoney(info.getValue()),
      header: () => <span className="whitespace-nowrap">Monto</span>,
      meta: {
        numeric: true,
      },
      footer: () => (
        <>
          {payoutResponse && payoutResponse?.total_emitted_amount !== 'None' && (
            <Price amount={payoutResponse?.total_emitted_amount} />
          )}
        </>
      ),
    }),
    columnHelper.accessor('bank_account', {
      cell: (info) => info.getValue(),
      header: () => <span className="whitespace-nowrap">Cuenta de abono</span>,
    }),
    columnHelper.accessor('orders_count', {
      cell: (info) => info.getValue(),
      header: () => <span className="whitespace-nowrap">Órdenes</span>,
    }),
  ];
  const getPayoutsReport = async () =>
    ApiClient.generatePayoutsReport(session?.token, selectedSchool, {
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
    sendTrackEvent('dashboard: Deposits Downloaded', { Type: 'Tabla' });
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
  return (
    <>
      <HeaderTable
        filters={{ start_date: startDatePayouts, end_date: endDatePayouts }}
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
      />
      <MultipleFiltersChips
        onChange={handleChangeChipFilter}
        formFilterData={formFilterData}
        itemsCount={itemsCount}
        setItemsCount={setItemsCount}
      />

      <div className={`${isFetching ? 'opacity-50 cursor-wait' : 'transition-opacity duration-300'}`}>
        <Table
          data={orderingData}
          columns={columns}
          onRowClick={handleOpen}
          totalCount={payoutResponse?.count || 0}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
          emptyStateText={`${
            search.length > 0 ? 'No hemos encontrado órdenes con esos criterios de búsqueda' : 'No tenemos resultados'
          }`}
          showEmptyStateImage
        />
      </div>
      <PayoutDetail openTo={openTo} onClose={onCloseTo} payoutId={payoutDetailId} />
    </>
  );
}
