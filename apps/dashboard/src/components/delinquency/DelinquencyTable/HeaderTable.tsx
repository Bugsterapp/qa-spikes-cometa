import { useSession } from 'next-auth/react';
import { useSelectedSchool } from '../../../guards/AuthGuard';
import {
  useSetIsWorking,
  useAddToQueue,
  useSetToError,
  useSetToIdle,
  ETypeFile,
  DownloadButton,
} from '../../BackgroundDownload/BackgroundDownload';
import { useToggle } from '@cometa/hooks';
import { useReportConfig } from '../../../hooks/useReportConfig';
import { api, ServiceClient } from '../../../utils/api';
import useSendTrackEventWithUserName from '../../../hooks/useSendTrackEventWithUserName';
import * as Sentry from '@sentry/nextjs';
import MultipleFilters, { FormFilterData, normalizeFilters } from '../../MultipleFilters';
import { SchoolCycleSelector } from '../../organisms/dashboard/SchoolCycleSelector';
import { GlobalSearch } from '../../atoms/GlobalSearch';
import MultipleSelectionComponent from '../../organisms/dashboard/MultiSelect';
import { ShareTableAction } from '../../ShareTable';
import { ColumnCustomizerAction, ColumnCustomizerColumn } from '../../ColumnCustomizer';
import { DownloadReport, DownloadReportOptions } from '../../DownloadReport';
import Header from '../../molecules/dashboard/Header';
import { ColumnsResponse, ConceptTypesEnum } from '@cometa/trpc';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { UseFormReturn } from 'react-hook-form';
import React from 'react';
import { TrackEvents } from '../../../constants/events';
import { DelinquencyGroupAction, DelinquencyGroupOption } from '/src/components/delinquency/DelinquencyGroupAction';

const STORE_KEY_REPORT_CONFIG = 'delinquency' as const;

interface HeaderTableProps {
  filterParams: Record<string, boolean | string[]>;
  title: string;
  handleFilter: (formFilterData: FormFilterData, methods: UseFormReturn<FormFilterData>) => void;
  handleClearFilter: () => void;
  setSearch: (search: string) => void;
  search: string;
  itemsCount: { watchKey: string; count: number }[];
  setSelectedItemsCount: (itemsCount: { watchKey: string; count: number }[]) => void;
  multiSelectChange: (items: { value: ConceptTypesEnum; label: string }[]) => void;
  conceptTypes: ConceptTypesEnum[];
  setSchoolCycle: (value: SchoolCycleEntity | null) => void;
  schoolCycle: SchoolCycleEntity | null;
  schoolCycles: SchoolCycleEntity[];
  tableColumns: ColumnCustomizerColumn[];
  handleColumnsChange: (columns: ColumnCustomizerColumn[]) => void;
  searchDebounced: string;
  selectedSchoolCycle: SchoolCycleEntity | undefined;
  formFilterData: FormFilterData;
  grouping: string;
  setGrouping: (grouping: string) => void;
}

export const HeaderTable = React.memo(function HeaderTable({
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
  setSchoolCycle,
  schoolCycle,
  schoolCycles,
  tableColumns,
  handleColumnsChange,
  searchDebounced,
  selectedSchoolCycle,
  formFilterData,
  grouping,
  setGrouping,
}: HeaderTableProps) {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
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

  const [selectedRows] = useReportConfig(STORE_KEY_REPORT_CONFIG);

  const { data: columnsData } = api.delinquency.retrieveInvoiceReportColumns.useQuery(
    { schoolId: selectedSchool?.id as string },
    { staleTime: Number.POSITIVE_INFINITY }
  );
  const downloadInvoices = async (extension: 'xml' | 'pdf') => {
    sendTrackEventWithUserName(TrackEvents.delinquency.delinquency_downloaded, {
      Type: `Facturas ${extension.toUpperCase()}`,
      Source: 'Morosidad',
    });
    setIsWorking();

    return ServiceClient[
      extension === 'pdf'
        ? 'apiV1DashboardSchoolsStudentsDelinquencyPdfRetrieve'
        : 'apiV1DashboardSchoolsStudentsDelinquencyXmlRetrieve'
    ](
      selectedSchool?.id as string,
      {
        school_cycle: schoolCycle?.id ?? undefined,
        ...filterParams,
        ...(conceptTypes.length ? { concept_types: conceptTypes } : undefined),
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

  const mutation = api.delinquency.getReport.useMutation({
    async onSuccess(data) {
      if (!data) throw new Error('Network error downloading delinquency Excel');
      addToQueue(data.id);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });

  const getDelinquencyReport = async (isConfig = false) =>
    mutation.mutate({
      schoolId: selectedSchool?.id as string,
      data: {
        school_cycles: schoolCycle ? [schoolCycle.id as string] : undefined,
        ...filterParams,
        concept_types: conceptTypes as ConceptTypesEnum[],
        search,
      },
      config: isConfig ? selectedRows : undefined,
    });

  const handleAdd = async () => {
    sendTrackEventWithUserName(TrackEvents.delinquency.delinquency_downloaded, { Type: 'Tabla', Source: 'Morosidad' });
    await getDelinquencyReport();
    setIsWorking();
  };

  const { data: filtersData } = api.delinquency.getDelinquencyFilters.useQuery({
    schoolId: selectedSchool?.id as string,
  });
  const schoolDelinquencyFilters = React.useMemo(() => {
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
      watchKey: 'state',
      contents: schoolDelinquencyFilters?.state,
    },
  ];

  const handleOpenDownloadReportMenu = () => {
    onOpenDownloadReportMenu();
  };

  const handleDownloadReportPersonalized = async () => {
    await getDelinquencyReport(true);
    setIsWorking();
    sendTrackEventWithUserName(TrackEvents.delinquency.delinquency_downloaded, {
      Type: 'Tabla Personalizada',
      Source: 'Morosidad',
      ColumnasSeleccionadas: Array.isArray(selectedRows) ? selectedRows : [],
    });
  };

  const mappedConceptTypes = conceptTypes.map((ct) => {
    const label = schoolDelinquencyFilters?.concept_types?.find((filter) => filter.id === ct)?.name || ct;
    return {
      value: String(ct) as ConceptTypesEnum,
      label: label,
    };
  });

  return (
    <div className="px-10">
      <Header title={title} />
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col w-full gap-4 md:gap-4">
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-wrap items-center w-full gap-4">
              <MultipleFilters
                filterItems={filterItems}
                handleFilter={handleFilter}
                onClearFilter={handleClearFilter}
                itemsCount={itemsCount}
                setItemsCount={setSelectedItemsCount}
                tableName={STORE_KEY_REPORT_CONFIG}
              />
              {schoolCycles && schoolCycles.length > 0 ? (
                <SchoolCycleSelector
                  tableName={STORE_KEY_REPORT_CONFIG}
                  selected={schoolCycle}
                  setFn={setSchoolCycle}
                  cycles={schoolCycles || []}
                />
              ) : null}

              <GlobalSearch
                tableName={STORE_KEY_REPORT_CONFIG}
                search={search}
                setSearch={setSearch}
                placeholder="Buscar por estudiante o matrícula"
              />
              <DelinquencyGroupAction
                selectedGroup={grouping as DelinquencyGroupOption}
                setSelectedGroup={setGrouping as (value: DelinquencyGroupOption) => void}
              />
              <MultipleSelectionComponent
                tableName={STORE_KEY_REPORT_CONFIG}
                items={
                  schoolDelinquencyFilters?.concept_types?.map((ct) => ({
                    value: String(ct.id) as ConceptTypesEnum,
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
            </div>
            <div className="flex justify-between gap-4 ml-auto w-fit">
              <ShareTableAction
                tableName="delinquency"
                relativeUrl="delinquency"
                filters={{
                  search: searchDebounced,
                  selected_items: mappedConceptTypes,
                  school_cycles: selectedSchoolCycle
                    ? { id: selectedSchoolCycle.id, name: selectedSchoolCycle.name }
                    : null,
                  filters: formFilterData,
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
                tableName="delinquency"
              />
              <div className="h-fit w-fit download-btn" data-testid="download-button">
                <DownloadButton size="large" theme="blue" onClick={handleOpenDownloadReportMenu} />
                <DownloadReport
                  open={openDownloadReportMenu}
                  setOpen={setToggleDownloadReportMenu}
                  onOpen={onOpenDownloadReportMenu}
                  onClose={onCloseDownloadReportMenu}
                  openDownloadReportMenuOptions={setToggleDownloadReportMenuOptions}
                  reportHeaderTitle="morosidad"
                  completeReportSubtitle="los estudiantes con morosidad"
                  zipReportSubtitle="de los pagos parciales no completados"
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
                  storeKey={STORE_KEY_REPORT_CONFIG}
                />
                <DownloadReportOptions
                  open={openDownloadReportMenuOptions}
                  setOpen={setToggleDownloadReportMenuOptions}
                  onClose={onCloseDownloadReportMenuOptions}
                  onOpen={onOpenDownloadReportMenuOptions}
                  columnsData={columnsData as unknown as ColumnsResponse['columns']}
                  storeKey={STORE_KEY_REPORT_CONFIG}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
