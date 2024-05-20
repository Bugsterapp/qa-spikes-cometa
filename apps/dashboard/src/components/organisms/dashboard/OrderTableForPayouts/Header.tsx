import Header from '../../../molecules/dashboard/Header';
import {
  DownloadButton,
  DownloadMenu,
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import File from '/public/assets/icons/download/file.svg';
import XML from '/public/assets/icons/download/xml.svg';
import Table from '/public/assets/icons/download/table.svg';
import { useSession } from 'next-auth/react';
import ApiClient from '/src/services/ApiClient';
import { sendTrackEvent } from '/src/utils/events';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import MultipleFilters, { FilterItems, FormFilterData } from '../../../MultipleFilters';
import { useQuery } from '@tanstack/react-query';
import { BasicBankAccounts } from '/types/paid-orders';
import { UseFormReturn } from 'react-hook-form';
import DateRange from '/src/components/DateRange';
import { ReactElement } from 'react';

interface HeaderTableProps {
  title: string;
  clickOnButton?: () => void;
  handleAdd: () => Promise<void>;
  filters: any;
  handleFilter: (formFilterData: FormFilterData, methods: UseFormReturn<FormFilterData>) => void;
  handleClearFilter: () => void;
  onDatesChange(date: Date[]): void;
  selectedDates: Date[];
  globalSearchComponent: ReactElement;
  itemsCount: { watchKey: string; count: number }[];
  setSelectedItemsCount: (itemsCount: { watchKey: string; count: number }[]) => void;
}
interface IPayoutFilters {
  bank_accounts: BasicBankAccounts[];
  statuses: BasicBankAccounts[];
}
export default function HeaderTable({
  title,
  onDatesChange,
  handleAdd,
  filters,
  handleFilter,
  handleClearFilter,
  selectedDates,
  globalSearchComponent,
  setSelectedItemsCount,
  itemsCount,
}: HeaderTableProps) {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchoolId();
  const setIsWorking = useSetIsWorking();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const addToQueue = useAddToQueue();

  const getFilter = async () => {
    const data = (await ApiClient.getPayoutFilters(session?.token, selectedSchool)) as IPayoutFilters;
    return data;
  };

  const { data: payoutsFilters } = useQuery(['payoutsFilters'], getFilter, {
    enabled: !!selectedSchool,
  });

  const filterItems: FilterItems[] = [
    {
      header: 'Cuenta de abono',
      watchKey: 'bank_accounts',
      contents: payoutsFilters?.bank_accounts,
    },
    {
      header: 'Estado de pago',
      watchKey: 'statuses',
      contents: payoutsFilters?.statuses,
    },
  ];

  const downloadInvoices = async (extension: string) => {
    setIsWorking();
    sendTrackEvent('dashboard: Deposits Downloaded', { Type: `Facturas ${extension.toUpperCase()}` });

    return ApiClient.getSchoolPayoutsInvoices(session?.token, selectedSchool, extension, {
      ...filters,
    })
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
          <Table className="w-5" />
          <span>Descargar tabla</span>
        </>
      ),
      onClick: () => handleAdd(),
    },
  ];

  return (
    <div className="px-12">
      <Header
        title={title}
        subtitle="Los pagos realizados cada día a través del portal se acumulan y se transfieren en depósitos programados a la cuenta bancaria del colegio."
      />
      <div className="mt-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-4 items-center">
            <MultipleFilters
              filterItems={filterItems}
              handleFilter={handleFilter}
              onClearFilter={handleClearFilter}
              setItemsCount={setSelectedItemsCount}
              itemsCount={itemsCount}
            />
            {globalSearchComponent}
            <DateRange onDatesChange={onDatesChange} selectedDates={selectedDates} />
          </div>

          <DownloadMenu items={DownloadMenuItems}>
            <DownloadButton theme="blue" />
          </DownloadMenu>
        </div>
      </div>
    </div>
  );
}
