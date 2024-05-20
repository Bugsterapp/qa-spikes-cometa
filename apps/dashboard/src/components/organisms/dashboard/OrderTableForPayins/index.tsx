import { useEffect, useMemo, useRef } from 'react';
import HeaderTittle from './HeaderTittle';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import ApiClient from '../../../../services/ApiClient';
import useToggle from '../../../../hooks/useToggle';
import { formatDateShortWithHour, formatDateWithUTCShort, PageSize } from '../../../../utils/general';
import { renderMoney, renderPaymentType } from '../../../../utils/datagridHeaders';
import { PATH_PORTAL } from '../../../../routes/paths';
import * as Sentry from '@sentry/nextjs';
import File from '/public/assets/icons/download/file.svg';
import XML from '/public/assets/icons/download/xml.svg';
import TableIcon from '/public/assets/icons/download/table.svg';
import { sendTrackEvent } from '../../../../utils/events';
import { Table } from '/src/components/Table';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { useMutation, useQuery } from '@tanstack/react-query';
import Price from '/src/components/atoms/Sum';
import {
  DownloadButton,
  DownloadMenu,
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '../../../BackgroundDownload/BackgroundDownload';
import { useIdToHighlight } from './SeePaymentStore';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import PayinSidepanel from '../PayinSidepanelDetail';
import { User } from '/src/interfaces/core';
import { BasicBankAccounts, PaymentMethods } from '/types/paid-orders';
import GuardianSelector from '../GuardianSelector';
import MultipleFilters, {
  FormFilterData,
  formFilterDataToParams,
  MultipleFiltersChips,
} from '../../../MultipleFilters';
import { UseFormReturn } from 'react-hook-form';
import DateRange, { transformDates } from '/src/components/DateRange';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import useDebounce from '/src/hooks/useDebounce';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';

export interface PayinsTableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Result[];
  total_amount: string;
}

export interface Result {
  id: string;
  type: string;
  total: string;
  total_currency: string;
  invoices_pdfs: any[];
  collected_at_school: boolean;
  guardian: Guardian;
  paid_date: string;
  manual_payment_account?: ManualPaymentAccount;
  correlative_id: string;
  created_by?: User;
  created?: string;
}

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
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchoolId();
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);
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

  const params = {
    ...paramsFromForm,
    multiple_search: searchDebounced,
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

  const getFilter = async () => {
    const data = (await ApiClient.getPayinFilters(session?.token, selectedSchool)) as IPayinFilters;
    return {
      ...data,
    };
  };

  const [startDatePayins, endDatePayins] = transformDates(selectedDates);

  const payinsSearch = async (page: number): Promise<PayinsTableResponse> =>
    await ApiClient.getIncomesPayins(
      session?.token,
      selectedSchool,
      page === 0 ? 1 : page + 1,
      selectedGuardian?.id,
      startDatePayins,
      endDatePayins,
      params
    );

  const { data: payinsFilters } = useQuery(['payinsFilters'], getFilter, {
    enabled: !!selectedSchool,
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
    isLoading,
  } = useQuery(
    ['schoolPayins', pageIndex, selectedSchool, selectedGuardian?.id, startDatePayins, endDatePayins, params],
    () => payinsSearch(pageIndex),
    {
      enabled: !!selectedSchool,
      retry: false,
      onError: () => {
        setPagination({ pageIndex: 0, pageSize: PageSize });
      },
    }
  );

  const handleOpen = (row: any) => {
    setPayinDetailId(row.id);
    onOpenTo();
    sendTrackEvent('dashboard: Direct Payment Detail Opened', {});
  };

  const columnHelper = createColumnHelper<PayinsTableResponse['results'][number]>();

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
    }),
    columnHelper.accessor('paid_date', {
      cell: (info) => formatDateWithUTCShort(info.getValue(), false, false),
      header: () => <span className="whitespace-nowrap">Fecha de pago</span>,
      size: 350,
    }),
    columnHelper.accessor('guardian', {
      cell: (info) => (
        <span className="font-semibold">
          {info.row.original.guardian.first_name} {info.row.original.guardian.last_name}
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
      footer: () => (
        <>
          <span className="flex items-center gap-2 min-h-[20px]">
            {payinsResponse && 'total_amount' in payinsResponse && payinsResponse?.total_amount !== 'None' && (
              <>
                <Price amount={payinsResponse?.total_amount} />
              </>
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
    }),
    columnHelper.accessor('created', {
      cell: (info) => <span className="mr-12">{formatDateShortWithHour(info.getValue() || '')}</span>,
      header: () => <span className="mr-12">Fecha de registro</span>,
    }),
  ];
  const getPayinsReport = async () =>
    ApiClient.generatePayinsReport(session?.token, selectedSchool, {
      startDate: startDatePayins,
      endDate: endDatePayins,
      guardians: selectedGuardian?.id,
      ids: null,
    });
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
    sendTrackEvent('dashboard: Direct Payments Downloaded', { PaymentType: 'complete', Type: 'Tabla' });
    await mutation.mutate();
    setIsWorking();
  };

  const downloadInvoices = async (extension: string) => {
    sendTrackEvent('dashboard: Direct Payments Downloaded', {
      PaymentType: 'complete',
      Type: `Facturas ${extension.toUpperCase()}`,
    });
    setIsWorking();
    return ApiClient.getSchoolRegisteredPaymentsInvoices(
      session?.token,
      selectedSchool,
      extension,
      {
        startDate: startDatePayins,
        endDate: endDatePayins,
        guardians: selectedGuardian?.id,
        ids: null,
      },
      { ...params }
    )
      .then((data: Record<string, any>) => {
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

  return (
    <div ref={ref}>
      <HeaderTittle
        title="Pagos registrados por el colegio"
        subtitle="Los pagos directos al colegio y registrados manualmente en Cometa se muestran en este listado."
        clickOnButton={() => {
          sendTrackEvent('dashboard: Manual Payment Initiated', {});
          location.href = PATH_PORTAL.pay.manual;
        }}
      />
      <div>
        <div className="flex justify-between px-12 mt-4 pb-4">
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
              />
              <GlobalSearch
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
              <DateRange selectedDates={selectedDates} onDatesChange={onDatesChange} />
            </div>
          </div>
          <DownloadMenu items={DownloadMenuItems}>
            <DownloadButton theme="blue" />
          </DownloadMenu>
        </div>
        <MultipleFiltersChips
          onChange={handleChangeChipFilter}
          formFilterData={formFilterData}
          itemsCount={itemsCount}
          setItemsCount={setItemsCount}
        />
      </div>
      <div className="rounded-3xl">
        <Table
          data={payinsResponse?.results || []}
          columns={columns}
          onRowClick={handleOpen}
          totalCount={payinsResponse?.count || 0}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
          isFetching={isFetching}
          highlightId={idToHightlight ? idToHightlight : undefined}
          key={idToHightlight}
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
