import type { ListStudentLeadDTO, SchoolStepEntity } from '@cometa/trpc/src/admissions/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from '@cometa/utils';
import { createColumnHelper } from '@tanstack/react-table';
import MultipleFilters, {
  formFilterDataToParams,
  MultipleFiltersChips,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import IcPlus from '/public/assets/icons/ic_plus.svg';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import Sheet from '/src/components/atoms/Sheet';
import { ColumnCustomizerAction } from '/src/components/ColumnCustomizer';
import { useColumnCustomizer } from '/src/components/ColumnCustomizer/hooks';
import Status from '/src/components/Status';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { useFilters } from '/src/hooks/useFilters';
import { api } from '/src/utils/api';
import { CompletedIcon, PendingIcon } from '/src/components/admissions/icons';
import { AdmissionForm, AdmissionsList, DownloadAction } from '/src/components/admissions/list';

export function Admissions() {
  const [showForm, setShowForm] = useState(false);
  const { setAlertState } = useAlert();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const [search, setSearch] = useState('');

  function handleCreateAdmission() {
    setAlertState({
      open: true,
      severity: 'success',
      message: 'El prospecto se ha creado exitosamente',
    });
    setShowForm(false);
  }

  const { data: schoolSteps } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });

  const { data: filters } = api.admissions.getAdmissionFilters.useQuery({ schoolId }, { enabled: !!schoolId });
  const { formFilterData, handleFilter, handleChangeChipFilter, handleClearFilter, itemsCount, setItemsCount } =
    useFilters();

  const params = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const hasFilters = Object.keys(formFilterData).length > 0;

  useEffect(() => {
    if (hasFilters) {
      handleClearFilter();
    }
  }, [schoolId]);

  const { filterItems } = useFilterItems({ filters });

  const { columns } = useColumns({ schoolSteps });
  const { tableColumns, visibleTableColumns, handleColumnsChange } = useColumnCustomizer({
    tableName: 'admissions',
    columns,
  });

  const { hideHeader } = useOffset();
  const { wrapperWidth } = useWrapperWidth({ wrapperRef });

  return (
    <div ref={wrapperRef} className="h-full relative w-full font-lota antialiased">
      <div className={cn('top-0 fixed z-10 bg-white', { hidden: hideHeader })} style={{ width: `${wrapperWidth}px` }}>
        <div className="flex justify-between items-center px-8 py-3 transition-all transform-gpu">
          <h1 className="text-[#212B36] text-2xl font-bold">Admisiones</h1>

          <button
            className="text-white hover:cursor-pointer bg-[#00AB55] font-bold text-sm flex items-center justify-center cursor-pointer whitespace-nowrap outline-none rounded-lg px-4 py-2 max-h-[45px]"
            data-testid="new-prospect-btn"
            onClick={() => setShowForm(true)}
          >
            <IcPlus fill="currentColor" />
            <label className="ml-1 hover:cursor-pointer">Nuevo prospecto</label>
          </button>
        </div>

        <div className="bg-white flex items-center justify-between opacity-100 transition-all duration-300 px-8">
          <div className="flex items-center gap-2">
            <MultipleFilters
              filterItems={filterItems}
              handleFilter={handleFilter}
              onClearFilter={handleClearFilter}
              itemsCount={itemsCount}
              setItemsCount={setItemsCount}
            />
            <GlobalSearch placeholder="Buscar" search={search} setSearch={setSearch} />
          </div>

          <div className="flex items-center gap-2">
            {!hideHeader && (
              <ColumnCustomizerAction
                columns={tableColumns}
                onColumnsChange={handleColumnsChange}
                tableName="admissions"
              />
            )}
            <DownloadAction filters={params} />
          </div>
        </div>

        <MultipleFiltersChips
          onChange={handleChangeChipFilter}
          formFilterData={formFilterData}
          itemsCount={itemsCount}
          setItemsCount={setItemsCount}
          className="px-8 py-2"
        />
      </div>

      <AdmissionsList
        clearFilters={handleClearFilter}
        hasFilters={hasFilters}
        search={search}
        params={params}
        setShowForm={setShowForm}
        columns={visibleTableColumns}
      />

      <Sheet
        open={showForm}
        onOpenChange={(open) => {
          if (!open) setShowForm(false);
        }}
      >
        <Sheet.Content>
          <AdmissionForm
            onClose={() => setShowForm(false)}
            sections={(filters as any)?.sections || []}
            onSuccess={handleCreateAdmission}
          />
        </Sheet.Content>
      </Sheet>
    </div>
  );
}

type AdmissionStatus = 'initial' | 'admitted' | 'dropped_out' | 'not_admitted';

const PHASES: Record<AdmissionStatus, string> = {
  initial: 'Prospecto',
  admitted: 'Admitido',
  dropped_out: 'Abandono',
  not_admitted: 'No admitido',
};

const STATUS_TYPE: Record<AdmissionStatus, 'error' | 'success' | 'info' | 'muted' | 'warning'> = {
  initial: 'info',
  admitted: 'success',
  dropped_out: 'error',
  not_admitted: 'error',
};

function useFilterItems({ filters }: { filters: object | undefined }) {
  const admissionFilters: any = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);

  const filterItems = [
    {
      header: 'Etapa',
      watchKey: 'status',
      contents: admissionFilters?.status,
    },
    {
      header: 'Checklist de admisión',
      watchKey: 'completed_school_step_ids',
      contents: admissionFilters?.school_steps,
    },
    {
      header: 'Grado de postulación',
      watchKey: 'section_id',
      contents: admissionFilters?.sections,
    },
    {
      header: 'Ciclo escolar',
      watchKey: 'school_cycle_id',
      contents: admissionFilters?.school_cycles,
    },
  ];
  return { filterItems };
}

function useColumns({ schoolSteps }: { schoolSteps: SchoolStepEntity[] | undefined }) {
  const columnHelper = createColumnHelper<ListStudentLeadDTO>();
  const filteredSchoolSteps = useMemo(() => (schoolSteps ?? []).filter((s) => s.status === 'active'), [schoolSteps]);

  const generateStepAccessor = useCallback(
    (step: SchoolStepEntity) =>
      columnHelper.accessor((row) => row.admission_steps.find((s) => s.school_step_id === step.id)?.status, {
        id: `admission_step_${step.id}`,
        cell: (info) => {
          const status = info.getValue();
          return (
            <div className="flex justify-center" title={status === 'completed' ? 'Completado' : 'Pendiente'}>
              <span className="text-sm font-normal truncate">
                {status === 'completed' ? <CompletedIcon /> : <PendingIcon />}
              </span>
            </div>
          );
        },
        header: () => (
          <span className="truncate block w-full" title={step.name as string}>
            {step.name}
          </span>
        ),
        enableSorting: false,
      }),
    [columnHelper]
  );

  const schoolStepColumns = useMemo(
    () => filteredSchoolSteps.map(generateStepAccessor),
    [filteredSchoolSteps, generateStepAccessor]
  );

  const columns = [
    columnHelper.accessor('first_name', {
      cell: (info) => (
        <div className="flex flex-row w-[280px]">
          <span
            className="text-sm font-normal truncate w-full block"
            title={`${info.row.original.first_name} ${info.row.original.last_name}`}
          >
            {info.row.original.first_name} {info.row.original.last_name}
          </span>
        </div>
      ),
      header: () => <span>Prospecto</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('status', {
      cell: (info) => {
        const value = info.getValue() as AdmissionStatus;
        return (
          <div className="flex flex-row min-w-[150px]">
            <Status variant={STATUS_TYPE[value]}>{PHASES[value]}</Status>
          </div>
        );
      },
      header: () => <span>Etapa</span>,
    }),
    columnHelper.accessor('section_name', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate max-w-[800px]" title={info.getValue()}>
            {info.getValue()}
            <br />
            {info.row.original.level}
          </span>
        </div>
      ),
      header: () => <span>Grado postulado</span>,
    }),
    columnHelper.accessor('school_cycle_name', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate max-w-[800px]" title={info.getValue()}>
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => <span>Ciclo escolar</span>,
    }),
    columnHelper.accessor('created_at', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate max-w-[800px]" title={info.getValue() as string}>
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => <span className="pl-6">Fecha de creación</span>,
      enableSorting: true,
    }),
    ...schoolStepColumns,
  ];

  return { columns };
}

function useOffset() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hideHeader = useMemo(() => offset > 500, [offset]);

  return { hideHeader };
}

function useWrapperWidth({ wrapperRef }: { wrapperRef: React.RefObject<HTMLDivElement> }) {
  const [wrapperWidth, setWrapperWidth] = useState(0);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    if (!wrapperElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWrapperWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(wrapperElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { wrapperWidth };
}
