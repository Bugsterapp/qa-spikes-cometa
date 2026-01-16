import { Button } from '@cometa/recreo';
import { SchoolTypeEnum } from '@cometa/trpc';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { InscriptionFiltersResponseDTO } from '@cometa/trpc/src/students/types';
import { InscriptionEntity } from '@cometa/trpc/src/students/types-mapping';
import { cn } from '@cometa/utils/src/cn';
import { createColumnHelper } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { GenericRowCheckBoxButton } from '/src/components/organisms/dashboard/StudentAssignedTable';
import MultipleFilters, {
  formFilterDataToParams,
  JsonData,
  MultipleFiltersChips,
  normalizeFilters,
} from '../../components/MultipleFilters';
import { SummaryCards } from '../../components/inscriptions/SummaryCards';
import {
  INSCRIPTION_STATUS_TYPE,
  InscriptionStatus,
  STUDENT_STATUS,
  STUDENT_STATUS_TYPE,
  StudentStatus,
} from '../../components/inscriptions/types';
import { ColumnCustomizerAction } from '/src/components/ColumnCustomizer';
import { useFixedColumnsCustomizer } from '/src/components/ColumnCustomizer/hooks';
import Status from '/src/components/Status';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { InscriptionTypeFilter, InscriptionType } from '../../components/inscriptions/InscriptionTypeFilter';
import { TabsWrapper as Tabs, useTab } from '/src/components/ui/Tabs';
import { InscriptionsSummary } from '../../components/inscriptions/InscriptionsSummary';
import { GroupAction, GroupOption } from '/src/components/inscriptions/GroupAction';
import { CompletedIcon, PartialCompletedIcon, PendingIcon } from '/src/components/inscriptions/Icons';
import { InscriptionsList } from '/src/components/inscriptions/InscriptionsList';
import Layout from '/src/components/layouts';
import { SchoolCycleSelector, useSchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import { useFilters } from '/src/hooks/useFilters';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import { api } from '/src/utils/api';
import { useDownload } from '/src/components/DownloadManager';
import { GetInscriptionsFilterParams } from '/src/server/api/routers/students';
import IcDownload from '/public/assets/icons/ic_download.svg';
import { useSchoolInscriptionConfig } from '/src/hooks/useSchoolInscriptionConf';
import { useRouter } from 'next/navigation';
import { EditSectionDialog } from '/src/components/inscriptions/edit-section-dialog';
import { useIntegrationsBlockedFields } from '/src/hooks/useIntegrationsBlockedFields';

const TABLE_NAME = 'inscriptions';

export default function InscriptionsPage() {
  const router = useRouter();

  const selectedSchool = useSelectedSchool();

  const { tab, handleChangeTab } = useTab('summary');

  useSendPageViewedEvent('Inscripciones', selectedSchool);

  const { activeCycle, schoolCycles, selectedSchoolCycle, setSelectedSchoolCycle } = useSchoolCycleSelector(TABLE_NAME);

  const permissions = useGetPermissions();
  const canViewInscriptions = permissions.can_view_inscriptions_page;
  const isK12 = selectedSchool?.school_type === SchoolTypeEnum.K12;

  if (!canViewInscriptions && !isK12) {
    router.push('/student');
  }

  let schoolCycle = null;
  if (selectedSchoolCycle) {
    schoolCycle = selectedSchoolCycle;
  } else if (activeCycle) {
    if (activeCycle.next_id) {
      schoolCycle = schoolCycles?.find((cycle) => cycle.id === activeCycle.next_id) as SchoolCycleEntity;
    } else {
      schoolCycle = activeCycle;
    }
  }

  const tabs = [
    { value: 'summary', label: 'Resumen' },
    { value: 'inscriptions', label: 'Detalle de inscripciones' },
  ];

  return (
    <section className="h-full relative w-full font-lota">
      <div>
        <div className="flex items-center px-8 pt-6 pb-2 gap-4">
          <h1 className="text-[#212B36] text-2xl font-bold">Inscripciones</h1>

          {schoolCycles?.length ? (
            <SchoolCycleSelector
              cycles={schoolCycles}
              selected={schoolCycle}
              setFn={setSelectedSchoolCycle}
              hideTodos
            />
          ) : null}
        </div>

        <div className="px-8 py-4">
          <SummaryCards schoolCycleId={schoolCycle?.id} />
        </div>
      </div>

      <Tabs
        tabs={tabs}
        tab={tab}
        handleChangeTab={handleChangeTab}
        defaultValue="summary"
        tabsListClassName="pl-0 px-8 border-b border-b-[#D5DEED]"
        tabsTriggerClassName="text-sm text-[#8B93A0] py-3"
      />

      <div className="py-6">
        {tab === 'summary' ? <InscriptionsSummary schoolCycle={schoolCycle} /> : null}
        {tab === 'inscriptions' ? <Inscriptions schoolCycle={schoolCycle} /> : null}
      </div>
    </section>
  );
}

InscriptionsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Inscripciones" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

InscriptionsPage.auth = true;

function Inscriptions({ schoolCycle }: { schoolCycle: SchoolCycleEntity | null }) {
  const selectedSchool = useSelectedSchool();
  const { inscriptionSteps } = useSchoolInscriptionConfig();

  const schoolId = selectedSchool?.id as string;

  const [search, setSearch] = useState('');

  const [selectedInscriptionIds, setSelectedInscriptionIds] = useState<string[]>([]);
  const [selectedInscriptions, setSelectedInscriptions] = useState<InscriptionEntity[]>([]);

  function handleOnSelectRow(row: InscriptionEntity) {
    const inscriptionId = row.id;

    if (!inscriptionId) return;

    const isSelected = selectedInscriptionIds.includes(inscriptionId);
    if (isSelected) {
      const selectedIds = selectedInscriptionIds.filter((id) => id !== inscriptionId);
      setSelectedInscriptionIds(selectedIds);
    } else {
      setSelectedInscriptionIds([...selectedInscriptionIds, inscriptionId]);
    }

    const isInscriptionSelected = selectedInscriptions.some((inscription) => inscription.id === inscriptionId);
    if (isInscriptionSelected) {
      const selected = selectedInscriptions.filter((inscription) => inscription.id !== inscriptionId);
      setSelectedInscriptions(selected);
    } else {
      setSelectedInscriptions([...selectedInscriptions, row]);
    }
  }

  function clearSelections() {
    setSelectedInscriptionIds([]);
    setSelectedInscriptions([]);
  }

  function canSelectStudent(inscription: InscriptionEntity): { canSelect: boolean; reason?: string } {
    if (selectedInscriptions.length === 0) {
      return { canSelect: true };
    }

    const firstSelected = selectedInscriptions[0];
    const firstSectionId = firstSelected.section?.id;
    const currentSectionId = inscription.section?.id;

    if (firstSectionId !== currentSectionId) {
      return {
        canSelect: false,
        reason: 'No puedes editar estudiantes de distintos niveles o grados',
      };
    }

    return { canSelect: true };
  }

  const { data: filters } = api.students.getInscriptionsFilters.useQuery({ schoolId }, { enabled: !!schoolId });
  const { formFilterData, handleFilter, handleChangeChipFilter, handleClearFilter, itemsCount, setItemsCount } =
    useFilters();

  const params = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const hasFilters = Object.keys(formFilterData).length > 0;

  useEffect(() => {
    if (hasFilters) handleClearFilter();
  }, [selectedSchool?.id]);

  const inscriptionFilters = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters as JsonData<InscriptionFiltersResponseDTO>);
  }, [filters]);

  let filterItems = [
    {
      header: 'Sección asignada',
      watchKey: 'section_ids',
      contents: inscriptionFilters?.sections,
    },
    {
      header: 'Estado',
      watchKey: 'student_state',
      contents: inscriptionFilters?.student_state,
    },
    {
      header: 'Estado de inscripción',
      watchKey: 'inscription_status',
      contents: inscriptionFilters?.inscription_status,
    },
    {
      header: 'Inscripción asignada',
      watchKey: 'is_assigned',
      contents: inscriptionFilters?.is_assigned,
    },
    {
      header: 'Inscripción pagada',
      watchKey: 'payment_status',
      contents: inscriptionFilters?.payment_status,
    },
    {
      header: 'Datos actualizados',
      watchKey: 'is_data_completed',
      contents: inscriptionFilters?.is_data_completed,
    },
    {
      header: 'Consentimientos completados',
      watchKey: 'are_consentments_completed',
      contents: inscriptionFilters?.are_consentments_completed,
    },
  ];

  if (!inscriptionSteps?.enable_consentments_step) {
    filterItems = filterItems.filter((item) => item.header !== 'Consentimientos completados');
  }

  const columnHelper = createColumnHelper<InscriptionEntity>();

  let columns = [
    columnHelper.display({
      id: 'select',
      header: () => <span className="flex items-center" />,
      cell: ({ row }) => {
        const isSelected = row.original.id ? selectedInscriptionIds.includes(row.original.id) : false;
        const { canSelect, reason } = canSelectStudent(row.original);
        const isDisabled = !canSelect && !isSelected;

        if (isDisabled && reason) {
          return (
            <div>
              <Tooltip message={reason}>
                <GenericRowCheckBoxButton onClick={undefined} checked={false} disabled />
              </Tooltip>
            </div>
          );
        }

        return (
          <div>
            <GenericRowCheckBoxButton
              onClick={() => handleOnSelectRow(row.original)}
              checked={isSelected}
              disabled={false}
            />
          </div>
        );
      },
      size: 96,
    }),
    columnHelper.accessor('student.first_name', {
      cell: (info) => {
        const name = `${info.row.original.student?.first_name} ${info.row.original.student?.last_name}`;
        return (
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-sm text-neutral-800 truncate">{name}</span>
            <span className="text-xs text-neutral-600 truncate">{info.row.original.student?.enrollment_code}</span>
          </div>
        );
      },
      header: () => <span>Estudiante</span>,
      enableSorting: true,
      size: 320,
    }),
    columnHelper.accessor('section.grade', {
      cell: (info) => {
        if (!info.row.original.section) {
          return <span className="text-sm text-neutral-500 italic">Sin sección</span>;
        }

        return (
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-sm text-neutral-800 truncate">
              {info.row.original.section?.grade} - {info.row.original.section?.group}
            </span>
            <span className="text-xs text-neutral-600 truncate">{info.row.original.section?.level_name}</span>
          </div>
        );
      },
      header: () => <span>Sección asignada</span>,
      size: 200,
    }),
    columnHelper.accessor('student.state', {
      cell: (info) => {
        const value = info.getValue() as StudentStatus;
        return (
          <div className="flex justify-center">
            <Status variant={STUDENT_STATUS_TYPE[value]}>{STUDENT_STATUS[value]}</Status>
          </div>
        );
      },
      header: () => <span>Estado</span>,
      size: 100,
    }),
    columnHelper.accessor('status', {
      cell: (info) => {
        const value = info.getValue() as InscriptionStatus;
        return (
          <div className="flex justify-center">
            <Status variant={INSCRIPTION_STATUS_TYPE[value]}>{value}</Status>
          </div>
        );
      },
      header: () => <span>Estado de inscripción</span>,
      size: 186,
    }),
    columnHelper.accessor('is_assigned', {
      cell: (info) => {
        const isAssigned = info.getValue();
        return (
          <div className="flex justify-center" title={isAssigned ? 'Asignada' : 'Pendiente'}>
            <span className="text-sm font-normal truncate">{isAssigned ? <CompletedIcon /> : <PendingIcon />}</span>
          </div>
        );
      },
      header: () => <span>Inscripción asignada</span>,
      size: 182,
    }),
    columnHelper.accessor('payment_status', {
      cell: (info) => {
        const paymentStatus = info.getValue()?.toLowerCase();

        if (paymentStatus === 'paid') {
          return (
            <div className="flex justify-center">
              <Tooltip message="El estudiante ha pagado la inscripción en su totalidad">
                <span className="text-sm font-normal truncate">
                  <CompletedIcon />
                </span>
              </Tooltip>
            </div>
          );
        }

        if (paymentStatus === 'partial_paid') {
          return (
            <div className="flex justify-center">
              <Tooltip message="El estudiante ha pagado una parte del concepto de inscripción">
                <span className="text-sm font-normal truncate">
                  <PartialCompletedIcon />
                </span>
              </Tooltip>
            </div>
          );
        }

        return (
          <div className="flex justify-center" title="Pendiente">
            <span className="text-sm font-normal truncate">
              <PendingIcon />
            </span>
          </div>
        );
      },
      header: () => <span>Inscripción pagada</span>,
      size: 172,
    }),
    columnHelper.accessor('personal_step_completed_at', {
      cell: (info) => {
        const isDataCompleted = info.getValue() && info.row.original.medical_step_completed_at;
        return (
          <div className="flex justify-center" title={isDataCompleted ? 'Completado' : 'Pendiente'}>
            <span className="text-sm font-normal truncate">
              {isDataCompleted ? <CompletedIcon /> : <PendingIcon />}
            </span>
          </div>
        );
      },
      header: () => <span>Datos actualizados</span>,
      size: 170,
    }),
    columnHelper.accessor('consentments_step_completed_at', {
      cell: (info) => {
        const consentmentsStepCompletedAt = info.getValue();
        return (
          <div className="flex justify-center" title={consentmentsStepCompletedAt ? 'Completado' : 'Pendiente'}>
            <span className="text-sm font-normal truncate">
              {consentmentsStepCompletedAt ? <CompletedIcon /> : <PendingIcon />}
            </span>
          </div>
        );
      },
      header: () => <span>Consentimientos completados</span>,
      size: 228,
    }),
  ];

  if (!inscriptionSteps?.enable_consentments_step) {
    columns = columns.filter((column) => {
      if ('accessorKey' in column) {
        return column.accessorKey !== 'consentments_step_completed_at';
      }
      return true;
    });
  }

  const [selectedGroup, setSelectedGroup] = useState<GroupOption>(null);
  const [inscriptionType, setInscriptionType] = useState<InscriptionType>(null);

  const { tableColumns, visibleTableColumns, handleColumnsChange } = useFixedColumnsCustomizer({
    tableName: TABLE_NAME,
    columns,
    fixedColumnIds: ['select', 'student.first_name'],
    hiddenColumnIds: ['select'],
  });

  const [requestFilters, setRequestFilters] = useState<GetInscriptionsFilterParams>({
    school_cycle_id: schoolCycle?.id as string,
  });

  return (
    <>
      <div className="bg-white flex items-center justify-between px-8 pb-2">
        <div className="flex items-center gap-3">
          <MultipleFilters
            filterItems={filterItems}
            handleFilter={handleFilter}
            onClearFilter={handleClearFilter}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
            isLegacy={false}
            tableName="inscriptions"
          />
          <InscriptionTypeFilter selected={inscriptionType} onChange={setInscriptionType} />
        </div>

        <div className="flex items-center gap-2">
          <GlobalSearch placeholder="Buscar estudiantes" search={search} setSearch={setSearch} isLegacy={false} />
          <GroupAction selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} />
          <ColumnCustomizerAction
            columns={tableColumns}
            onColumnsChange={handleColumnsChange}
            isLegacy={false}
            tableName={TABLE_NAME}
            fixedColumnIds={['select', 'student.first_name']}
          />
          <DownloadAction filters={requestFilters} />
        </div>
      </div>

      <MultipleFiltersChips
        onChange={handleChangeChipFilter}
        formFilterData={formFilterData}
        itemsCount={itemsCount}
        setItemsCount={setItemsCount}
        className={cn('', { 'px-8 py-0': hasFilters })}
        tableName="inscriptions"
      />

      <InscriptionsList
        schoolCycle={schoolCycle}
        clearFilters={handleClearFilter}
        hasFilters={hasFilters}
        search={search}
        params={params}
        columns={visibleTableColumns}
        groupBy={selectedGroup}
        inscriptionType={inscriptionType}
        onFiltersChange={setRequestFilters}
        selectedInscriptions={selectedInscriptions}
        selectedInscriptionIds={selectedInscriptionIds}
        onUpdateSelections={setSelectedInscriptions}
      />

      <EditSectionAction selectedInscriptions={selectedInscriptions} clearSelections={clearSelections} />
    </>
  );
}

function EditSectionAction({
  selectedInscriptions,
  clearSelections,
}: {
  selectedInscriptions: InscriptionEntity[];
  clearSelections: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const utils = api.useUtils();
  const { isActionBlocked, getBlockedTooltip } = useIntegrationsBlockedFields();

  if (selectedInscriptions.length === 0) return null;

  const hasOneSelectedInscription = selectedInscriptions.length === 1;

  const isButtonDisabled = isActionBlocked(['inscription.grade', 'inscription.group']);
  const tooltipMessage = getBlockedTooltip(isButtonDisabled);

  function handleSuccess() {
    utils.students.getInscriptions.invalidate();
    clearSelections();
  }

  return (
    <>
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white rounded-xl border border-neutral-100 p-4 min-w-[450px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.20),0px_12px_24px_-4px_rgba(145,158,171,0.12)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedInscriptions.length} estudiante{hasOneSelectedInscription ? '' : 's'} seleccionado
                {hasOneSelectedInscription ? '' : 's'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip message={tooltipMessage}>
                <Button
                  variant="solid-light"
                  size="small"
                  color="black"
                  className={`text-white px-6 ${
                    isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={isButtonDisabled}
                  onClick={() => setIsDialogOpen(true)}
                >
                  Editar sección
                </Button>
              </Tooltip>
              <button
                onClick={clearSelections}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar selección"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isDialogOpen ? (
        <EditSectionDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          selectedInscriptions={selectedInscriptions}
          onSuccess={handleSuccess}
        />
      ) : null}
    </>
  );
}

type DownloadActionProps = {
  filters: GetInscriptionsFilterParams;
};

function DownloadAction({ filters: initialFilters }: DownloadActionProps) {
  const { addDownload, downloadCompleted, downloadFailed } = useDownload();
  const { mutateAsync: downloadReport } = api.students.getInscriptionsReport.useMutation();
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  async function handleDownload() {
    const downloadId = addDownload({
      reportName: 'Reporte de inscripciones.xlsx',
    });

    try {
      const report = await downloadReport(filters);

      if (!report?.data) {
        downloadFailed('Error al descargar el reporte: No hay datos.');
        return;
      }

      const uint8Array = new Uint8Array(report?.data);
      const blob = new Blob([uint8Array], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);

      downloadCompleted(downloadId, url);
    } catch (error) {
      downloadFailed(`Error al descargar el reporte: ${(error as Error).message}`);
    }
  }

  return (
    <Tooltip message="Descargar reporte">
      <Button variant="solid-light" size="medium" color="black" className="px-4" onClick={handleDownload}>
        <IcDownload width={20} height={20} />
      </Button>
    </Tooltip>
  );
}
