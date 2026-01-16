import type { PayinListResponseDTO, SlimGuardian } from '@cometa/trpc';
import * as Sentry from '@sentry/nextjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { type PaginationState, ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import useToggle from '../../../../hooks/useToggle';
import { PATH_PORTAL } from '../../../../routes/paths';
import ApiClient from '../../../../services/ApiClient';
import { renderMoney, renderPaymentType } from '../../../../utils/datagridHeaders';

import { PageSize, formatDateShortWithHour, formatDateWithUTCShort } from '../../../../utils/general';
import useSendTrackEventWithUserName from '../../../../hooks/useSendTrackEventWithUserName';
import { Events } from '../../../../constants/events';
import {
  DownloadButton,
  DownloadMenu,
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '../../../BackgroundDownload/BackgroundDownload';
import GuardianSelector from '../GuardianSelector';
import PayinSidepanel from '../PayinSidepanelDetail';
import HeaderTittle from './HeaderTittle';
import { useIdToHighlight } from './SeePaymentStore';
import File from '/public/assets/icons/download/file.svg';
import TableIcon from '/public/assets/icons/download/table.svg';
import XML from '/public/assets/icons/download/xml.svg';
import DateRange, { transformDates } from '/src/components/DateRange';
import MultipleFilters, {
  type FormFilterData,
  MultipleFiltersChips,
  formFilterDataToParams,
} from '/src/components/MultipleFilters';
import { Table } from '/src/components/Table';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';
import Price from '/src/components/atoms/Sum';
import { SchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import useDebounce from '/src/hooks/useDebounce';
import type { User } from '/src/interfaces/core';
import { api } from '/src/utils/api';
import type { BasicBankAccounts, PaymentMethods } from '/types/paid-orders';
import { ColumnCustomizerAction } from 'src/components/ColumnCustomizer';
import { useFixedColumnsCustomizer } from 'src/components/ColumnCustomizer/hooks';
import { ShareTableAction } from '/src/components/ShareTable';
import { convertToOrdering } from '/src/components/Table';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';

const PAYINS_FIXED_COLUMN_IDS = ['correlative_id', 'paid_date', 'total', 'guardian'];
const STORE_KEY_REPORT_CONFIG = 'payins' as const;

export interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dependents_count: number;
}

export interface ManualPaymentAccount {
  id: string;
  account_type: string;
  owner: string;
  nickname: string;
  bank_name: string;
  public_summary: string;
}
interface UserInFilter extends User {
  name: string;
}
interface IPayinFilters {
  bank_accounts: BasicBankAccounts[];
  types: PaymentMethods[];
  users: UserInFilter[];
}

export default function OrderTableForIncome({
  setIsPayinDeletedDone,
  setPayinDeleted,
}: {
  setIsPayinDeletedDone: (done: boolean) => void;
  setPayinDeleted: (payin: { first_name: string; last_name: string; date: string } | null) => void;
}) {
  const selectedSchoolId = useSelectedSchoolId();
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [selectedGuardian, setSelectedGuardian] = useState<SlimGuardian | null>(null);

  const [selectedDates, onDatesChange] = useState<Date[]>([]);
  const [payinDetailId, setPayinDetailId] = useState<string | null>(null);
  const [didItRun, setDidItRun] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const [search, setSearch] = useState('');

  const searchDebounced = useDebounce(search, 1200);
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  const [sorting, setSorting] = useState<string>();

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    {
      school_id: selectedSchoolId as string,
    },
    {
      enabled: !!selectedSchoolId,
    }
  );
  const [selectedSchoolCycle, setSelectedSchoolCycle] = useState<SchoolCycleEntity | null>(null);

  const params = {
    ...paramsFromForm,
    multiple_search: searchDebounced,
    school_cycles: selectedSchoolCycle ? [selectedSchoolCycle.id as string] : undefined,
    ordering: sorting ? [sorting] : undefined,
  };

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PageSize,
  });
  const idToHightlight = useIdToHighlight();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  useEffect(() => {
    if (idToHightlight && !didItRun) {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
      setDidItRun(true);
    }
  }, [idToHightlight, didItRun]);

  const [startDatePayins, endDatePayins] = transformDates(selectedDates);

  const { data: payinsFilters } = useQuery({
    queryKey: ['payinsFilters'],
    queryFn: async () => {
      const data = (await ApiClient.getPayinFilters(selectedSchoolId)) as IPayinFilters;
      return {
        ...data,
      };
    },
    enabled: !!selectedSchoolId,
  });

  const filterItems = [
    {
      header: 'Cuenta de abono',
      watchKey: 'bank_accounts',
      contents: payinsFilters?.bank_accounts,
    },
    {
      header: 'Medio de pago',
      watchKey: 'types',
      contents: payinsFilters?.types,
    },
    {
      header: 'Registrado por',
      watchKey: 'users',
      contents: payinsFilters?.users,
    },
  ];

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const {
    data: payinsResponse,
    isFetching,
    isPending: isLoading,
    error: payinsError,
  } = api.payins.list.useQuery(
    {
      schoolId: selectedSchoolId as string,
      query: {
        end_date: endDatePayins,
        page: pageIndex === 0 ? 1 : pageIndex + 1,
        page_size: pageSize,
        start_date: startDatePayins,
        guardians: selectedGuardian ? [selectedGuardian.id] : undefined,
        ...params,
      },
    },
    {
      enabled: !!selectedSchoolId,
      retry: false,
    }
  );

  useEffect(() => {
    if (payinsError) {
      setPagination({ pageIndex: 0, pageSize: PageSize });
    }
  }, [payinsError]);

  const handleOpen = (row: PayinListResponseDTO) => {
    setPayinDetailId(row.id);
    onOpenTo();
    sendTrackEventWithUserName(Events.direct_payment_detail_opened, {});
  };

  const columnHelper = createColumnHelper<PayinListResponseDTO>();

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
      header: () => <span className="whitespace-nowrap">ID de pago</span>,
      size: 350,
      enableSorting: true,
    }),
    columnHelper.accessor('paid_date', {
      cell: (info) => formatDateWithUTCShort(info.getValue(), false, false),
      header: () => <span className="whitespace-nowrap">Fecha de pago</span>,
      size: 350,
      enableSorting: true,
    }),
    columnHelper.accessor('guardian', {
      cell: (info) => (
        <span className="font-semibold">
          {info.row.original.guardian
            ? `${info.row.original.guardian.first_name || ''} ${info.row.original.guardian.last_name || ''}`.trim()
            : '-'}
        </span>
      ),
      header: () => <span>Pagador</span>,
    }),
    columnHelper.accessor('total', {
      cell: (info) => renderMoney(info.getValue()),
      meta: {
        numeric: true,
      },
      header: () => <span>Total pagado</span>,
      enableSorting: true,
      footer: () => (
        <>
          <span className="flex items-center gap-2 min-h-[20px]">
            {payinsResponse?.total_amount && payinsResponse?.total_amount !== 'None' && (
              <Price amount={payinsResponse?.total_amount} />
            )}
          </span>
        </>
      ),
    }),
    columnHelper.accessor('type', {
      cell: (info) => renderPaymentType(info.getValue()),
      header: () => <span>Medio de pago</span>,
    }),
    columnHelper.accessor('manual_payment_account', {
      cell: (info) => {
        const manual_payment_account = info.row.original?.manual_payment_account;
        return (
          <div className="whitespace-normal w-52">
            {manual_payment_account
              ? manual_payment_account?.public_summary ||
                `${manual_payment_account.bank_name} - ${manual_payment_account.owner}`
              : '-'}
          </div>
        );
      },
      header: () => <span>Cuenta de abono</span>,
    }),
    columnHelper.accessor('created_by', {
      cell: (info) => (
        <span>
          {info.row.original?.created_by?.first_name || info.row.original?.created_by?.last_name
            ? `${info.row.original.created_by?.first_name || ''} ${
                info.row.original.created_by?.last_name || ''
              }`.trim()
            : info.row.original?.created_by?.email || '-'}
        </span>
      ),
      header: () => <span>Registrado por</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('created', {
      cell: (info) => <span className="mr-12">{formatDateShortWithHour(info.getValue() || '')}</span>,
      header: () => <span className="mr-12">Fecha de registro</span>,
      enableSorting: true,
    }),
  ];
  const getPayinsReport = async () => {
    sendTrackEventWithUserName(Events.payins_report_downloaded, {
      report_type: 'complete',
      has_guardian_filter: !!selectedGuardian?.id,
      has_date_filter: !!(startDatePayins && endDatePayins),
      has_filters: Object.keys(params || {}).length > 0,
    });
    return ApiClient.generatePayinsReport(selectedSchoolId, {
      startDate: startDatePayins,
      endDate: endDatePayins,
      guardians: selectedGuardian?.id,
      ids: null,
      filters: params,
    });
  };
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const mutation = useMutation({
    mutationFn: getPayinsReport,
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
    sendTrackEventWithUserName(Events.direct_payments_downloaded, { PaymentType: 'complete', Type: 'Tabla' });
    await mutation.mutate();
    setIsWorking();
  };

  const downloadInvoices = async (extension: string) => {
    sendTrackEventWithUserName(Events.direct_payments_downloaded, {
      PaymentType: 'complete',
      Type: `Facturas ${extension.toUpperCase()}`,
    });
    setIsWorking();
    return ApiClient.getSchoolRegisteredPaymentsInvoices(
      selectedSchoolId,
      extension,
      {
        startDate: startDatePayins,
        endDate: endDatePayins,
        guardians: selectedGuardian?.id,
        ids: null,
      },
      { ...params }
    )
      .then((data: Record<string, string>) => {
        addToQueue(data.id, ETypeFile.ZIP);
      })
      .catch(() => {
        setIsError();
        setTimeout(() => setToIdle(), 3000);
      });
  };

  const DownloadMenuItems = [
    {
      key: 'invoices-zip',
      children: (
        <>
          <File className="w-4" />
          <span>Descargar facturas PDF</span>
        </>
      ),
      onClick: () => downloadInvoices('pdf'),
    },
    {
      key: 'invoices-xml',
      children: (
        <>
          <XML className="w-4" />
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

  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };
  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
  };

  const { tableColumns, visibleTableColumns, handleColumnsChange } = usePayinsColumnCustomizer({
    tableName: STORE_KEY_REPORT_CONFIG,
    columns,
  });

  return (
    <div ref={ref}>
      <HeaderTittle
        title="Pagos registrados por el colegio"
        subtitle="Los pagos directos al colegio y registrados manualmente en Cometa se muestran en este listado."
        clickOnButton={() => {
          sendTrackEventWithUserName(Events.manual_payment_initiated, {});
          location.href = PATH_PORTAL.pay.manual;
        }}
      />
      <div>
        <div className="flex justify-between px-12 pb-4 mt-4">
          <div className="flex flex-col flex-wrap space-y-4">
            <div className="flex items-center gap-4">
              <MultipleFilters
                filterItems={filterItems}
                handleFilter={handleFilter}
                onClearFilter={() => {
                  setFormFilterData({});
                }}
                itemsCount={itemsCount}
                setItemsCount={setItemsCount}
                tableName={STORE_KEY_REPORT_CONFIG}
              />
              {schoolCycles && schoolCycles.length > 0 ? (
                <SchoolCycleSelector
                  selected={selectedSchoolCycle ?? null}
                  setFn={setSelectedSchoolCycle}
                  cycles={schoolCycles || []}
                />
              ) : null}
              <GlobalSearch
                tableName={STORE_KEY_REPORT_CONFIG}
                search={search}
                setSearch={setSearch}
                placeholder="Buscar ID de pagos u órdenes asociadas"
              />
            </div>
            <div className="flex gap-4">
              <GuardianSelector
                selectedGuardian={selectedGuardian}
                setSelectedGuardian={setSelectedGuardian}
                guardianFilterText="Seleccionar el pagador"
              />
              <DateRange
                tableName={STORE_KEY_REPORT_CONFIG}
                selectedDates={selectedDates}
                onDatesChange={onDatesChange}
              />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <ShareTableAction
              tableName={STORE_KEY_REPORT_CONFIG}
              relativeUrl="income"
              filters={{
                search: searchDebounced,
                school_cycles: selectedSchoolCycle
                  ? { id: selectedSchoolCycle.id, name: selectedSchoolCycle.name }
                  : null,
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
              tableName={STORE_KEY_REPORT_CONFIG}
              fixedColumnIds={PAYINS_FIXED_COLUMN_IDS}
            />
            <DownloadMenu items={DownloadMenuItems}>
              <DownloadButton theme="blue" />
            </DownloadMenu>
          </div>
        </div>
        <MultipleFiltersChips
          onChange={handleChangeChipFilter}
          formFilterData={formFilterData}
          itemsCount={itemsCount}
          setItemsCount={setItemsCount}
          tableName={STORE_KEY_REPORT_CONFIG}
        />
      </div>
      <div className="rounded-3xl">
        <Table
          data={payinsResponse?.results || []}
          columns={visibleTableColumns as ColumnDef<PayinListResponseDTO>[]}
          onRowClick={handleOpen}
          totalCount={payinsResponse?.count || 0}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
          isFetching={isFetching}
          highlightId={idToHightlight ? idToHightlight : undefined}
          key={idToHightlight}
          onSortingChange={(sorting) => {
            const text = convertToOrdering(sorting);
            setSorting(text);
          }}
          emptyStateText={`${
            search.length > 0 ? 'No hemos encontrado órdenes con esos criterios de búsqueda' : 'No tenemos resultados'
          }`}
          showEmptyStateImage
        />
      </div>
      <PayinSidepanel
        setIsPayinDeletedDone={setIsPayinDeletedDone}
        open={openTo}
        onClose={onCloseTo}
        payinId={payinDetailId || ''}
        setPayinDeleted={setPayinDeleted}
      />
    </div>
  );
}

const usePayinsColumnCustomizer = ({ tableName, columns }: { tableName: string; columns: ColumnDef<any, any>[] }) =>
  useFixedColumnsCustomizer({
    tableName,
    columns,
    fixedColumnIds: PAYINS_FIXED_COLUMN_IDS,
  });
