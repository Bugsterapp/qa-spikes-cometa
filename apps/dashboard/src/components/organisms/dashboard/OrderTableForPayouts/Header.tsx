import type { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import type { ReactElement } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import File from '/public/assets/icons/download/file.svg';
import Table from '/public/assets/icons/download/table.svg';
import XML from '/public/assets/icons/download/xml.svg';
import {
  DownloadButton,
  DownloadMenu,
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import DateRange from '/src/components/DateRange';
import Header from '/src/components/molecules/dashboard/Header';
import MultipleFilters, { type FilterItems, type FormFilterData } from '/src/components/MultipleFilters';
import { SchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { ColumnCustomizerAction } from 'src/components/ColumnCustomizer';
import type { ColumnCustomizerColumn } from 'src/components/ColumnCustomizer';
import { ShareTableAction } from '/src/components/ShareTable';

interface HeaderTableProps {
  title: string;
  clickOnButton?: () => void;
  handleAdd: () => Promise<void>;
  filters: any;
  formFilterData?: FormFilterData;
  handleFilter: (formFilterData: FormFilterData, methods: UseFormReturn<FormFilterData>) => void;
  handleClearFilter: () => void;
  onDatesChange(date: Date[]): void;
  selectedDates: Date[];
  globalSearchComponent: ReactElement;
  itemsCount: { watchKey: string; count: number }[];
  setSelectedItemsCount: (itemsCount: { watchKey: string; count: number }[]) => void;
  setSchoolCycle: (value: SchoolCycleEntity | null) => void;
  schoolCycle: SchoolCycleEntity | null;
  schoolCycles: SchoolCycleEntity[];
  tableColumns?: ColumnCustomizerColumn[];
  onColumnsChange?: (columns: ColumnCustomizerColumn[]) => void;
  tableName?: string;
  fixedColumnIds?: string[];
}
export default function HeaderTable({
  title,
  onDatesChange,
  handleAdd,
  filters,
  formFilterData = {},
  handleFilter,
  handleClearFilter,
  selectedDates,
  globalSearchComponent,
  setSelectedItemsCount,
  itemsCount,
  setSchoolCycle,
  schoolCycle,
  schoolCycles,
  tableColumns = [],
  onColumnsChange = (_columns: ColumnCustomizerColumn[]) => void 0,
  tableName = 'unknown',
  fixedColumnIds = [],
}: HeaderTableProps) {
  const selectedSchool = useSelectedSchoolId();
  const setIsWorking = useSetIsWorking();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const addToQueue = useAddToQueue();

  const { data: payoutsFilters } = api.schools.schoolsPayoutsFiltersList.useQuery(
    {
      school_id: selectedSchool as string,
    },
    {
      enabled: !!selectedSchool,
    }
  );

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
    sendTrackEventWithUserName(Events.deposits_downloaded, { Type: `Facturas ${extension.toUpperCase()}` });

    return ApiClient.getSchoolPayoutsInvoices(selectedSchool, extension, {
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
    <div className="px-12 pb-4">
      <Header
        title={title}
        subtitle="Los pagos realizados cada día a través del portal se acumulan y se transfieren en depósitos programados a la cuenta bancaria del colegio."
      />
      <div className="mt-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <MultipleFilters
              filterItems={filterItems}
              handleFilter={handleFilter}
              onClearFilter={handleClearFilter}
              setItemsCount={setSelectedItemsCount}
              itemsCount={itemsCount}
              tableName={tableName}
            />
            {schoolCycles && schoolCycles.length > 0 ? (
              <SchoolCycleSelector selected={schoolCycle} setFn={setSchoolCycle} cycles={schoolCycles || []} />
            ) : null}
            {globalSearchComponent}
            <DateRange tableName={tableName} onDatesChange={onDatesChange} selectedDates={selectedDates} />
          </div>

          <div className="flex items-center gap-4">
            <ShareTableAction
              tableName={tableName}
              relativeUrl="income"
              filters={{
                school_cycles: schoolCycle ? { id: schoolCycle.id, name: schoolCycle.name } : null,
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
              onColumnsChange={onColumnsChange}
              tableName={tableName}
              fixedColumnIds={fixedColumnIds}
            />
            <DownloadMenu items={DownloadMenuItems}>
              <DownloadButton theme="blue" data-testid="download-button" />
            </DownloadMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
