import { useState, useMemo, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useStatePersist } from 'use-state-persist';
import { PageSize, formatDateHourWithUTCShort } from '../../../../utils/general';
import { renderMoney, render_due_orders } from '../../../../utils/datagridHeaders';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { Table, convertToOrdering } from '/src/components/Table';
import { Events } from '/src/constants/events';
import { sendTrackEvent } from '/src/utils/events';
import { useGetPermissions, useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import { useRouter } from 'next/router';
import useToggle from '/src/hooks/useToggle';
import StudentCreation from '../StudentCreation';
import { Guardian } from '../OrderTableForPayins';
import { Student } from '/types/paid-orders';
import useSearchStudents from '/src/hooks/useSearchStudents';
import IcPlus from '/public/assets/icons/ic_plus.svg';
import {
  DownloadButton,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import { api } from '../../../../utils/api';
import * as Sentry from '@sentry/nextjs';
import { buildObjectWithNonEmptyProps } from '/src/utils/object-util';
import Sheet from '/src/components/atoms/Sheet';
import {
  DashboardStudentListDueOrderSerializerV2,
  DashboardStudentListDueOrderSerializerV3,
} from '@cometa/trpc/src/types';
import Status from '/src/components/Status';
import MultipleFilters, {
  FormFilterData,
  MultipleFiltersChips,
  formFilterDataToParams,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import { UseFormReturn } from 'react-hook-form';
import StudentSelector from '../StudentSelector';
import GuardianSelector from '../GuardianSelector';
import { useSendTrackEvent } from '@cometa/utils';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { useFlags } from '/flags/client';
import { useRoute } from '/src/contexts/RoutesProvider';
import { StudentFilter } from '../StudentsFilter';
import { cn } from '/src/utils/cn';
import { useSetDrawerState } from '/src/components/AssignTutorDrawer';

export interface StudentsTableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DashboardStudentListDueOrderSerializerV3[] | DashboardStudentListDueOrderSerializerV2[];
}
type Inscriptions = 'Reinscrito' | 'Inscrito' | 'No inscrito' | 'Pendiente';

export default function OrderTableForStudents(props: any) {
  const router = useRouter();
  const { data: session } = useSession();
  const route = useRoute();
  const { selectedSchoolCycle, setSelectedSchoolCycle, schoolCycles } = props;
  const selectedSchoolId = useSelectedSchoolId();
  const selectedSchool = useSelectedSchool();
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchStudent, setSearchStudent] = useState('');
  const {
    data: studentsOnSchool,
    refetch,
    isLoading: loadingStudents,
  } = useSearchStudents(session?.token, selectedSchoolId || '', searchStudent);
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const setDrawerState = useSetDrawerState();
  const [formFilterData, setFormFilterData] = useStatePersist<FormFilterData>('@StudentsFilter');
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const params = {
    ...paramsFromForm,
  };
  const { data: filters } = api.students.studentFilters.useQuery({ school_id: selectedSchoolId || '' });
  const studentsDueOrdersFilter = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PageSize,
  });
  const [itemsCount, setItemsCount] = useStatePersist<{ watchKey: string; count: number }[]>('@FiltersItemsCount', []);
  const permissions = useGetPermissions();

  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const sentTrackEventWithName = useSendTrackEvent();

  const handleNewStudentClick = () => {
    openStudentCreation();
    sentTrackEventWithName('dashboard: New Student Started', session);
  };
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const { flags } = useFlags({ traits: { email: session?.user.email, schoolName: selectedSchool?.name } });
  const [sorting, setSorting] = useState<string>();
  const { data, isFetching, isLoading } = api.students.dashboardSchoolDueOrdersStudents.useQuery(
    {
      schoolId: selectedSchoolId || 'demo',
      v3: flags?.inscriptions || false,
      query: {
        page: pageIndex === 0 ? 1 : pageIndex + 1,
        guardian: [selectedGuardian?.id ? selectedGuardian?.id : ''],
        search: selectedStudent ? `${selectedStudent?.first_name} ${selectedStudent?.last_name}` : undefined,
        school_cycle: selectedSchoolCycle?.id || '',
        ordering: sorting ? [sorting] : undefined,
        ...params,
      },
    },
    {
      enabled: !!selectedSchoolId && (!!selectedSchoolCycle?.id || selectedSchoolCycle === 'Todos'),
      keepPreviousData: true,
      staleTime: 60 * 1000 * 60,
      onError: () => {
        setPagination({ pageIndex: 0, pageSize: PageSize });
      },
    }
  );
  const cycleFormatted = (isActive?: any) => {
    const cycleToFormat = isActive ? schoolCycles?.find((cycle: any) => cycle.is_active) : selectedSchoolCycle;
    if (cycleToFormat && cycleToFormat?.year_start && cycleToFormat?.year_end) {
      const yearStart = String(cycleToFormat?.year_start);
      const yearEnd = String(cycleToFormat?.year_end).slice(-2);
      return `${yearStart}-${yearEnd}`;
    }
    return null;
  };

  const selectedCycleFormatted = cycleFormatted();

  const columnHelper = createColumnHelper<StudentsTableResponse['results'][number]>();
  const columns = [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: 'last_name',
      cell: (info) => (
        <span className="font-semibold min-w-[500px] truncate">{`${
          flags?.show_students_name_backwards
            ? `${info.row.original.last_name}, ${info.row.original.first_name}`
            : `${info.row.original.first_name} ${info.row.original.last_name}`
        }`}</span>
      ),
      header: () => <span className="whitespace-nowrap min-w-[220px] text-left">Estudiantes</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('enrollment_code', {
      cell: (info) => (
        <span className="font-semibold block truncate w-[80px]" title={info.row.original.enrollment_code || ''}>
          {info.row.original.enrollment_code || ''}
        </span>
      ),
      header: () => <span className="min-w-[80px] text-left">Matrícula</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('is_active', {
      cell: (info) => (
        <span className="font-semibold">
          {info.getValue() ? (
            <Tooltip message="Este alumno tiene conceptos del ciclo actual">
              <Status variant="success">Activo</Status>
            </Tooltip>
          ) : (
            <Tooltip message="Este alumno fue dado de baja o no tiene conceptos del ciclo actual">
              <Status variant="muted">Inactivo</Status>
            </Tooltip>
          )}
        </span>
      ),
      header: () => <span>Estado</span>,
    }),
    columnHelper.accessor('section', {
      cell: (info) => (
        <div>
          <span className="font-normal truncate w-[120px] block" title={info.row.original.section ?? 'Sin sección'}>
            {info.row.original.section ?? 'Sin sección'}
          </span>
          <span
            className="font-normal truncate w-[120px] block text-xs text-[#454D64]"
            title={info.row.original.section ?? 'Sin sección'}
          >
            {info.row.original.level ?? ''}
          </span>
        </div>
      ),
      header: () => (
        <div className="flex flex-col">
          <span className="text-left">Sección</span>
          {flags?.inscriptions && <span className="text-xs font-normal">Ciclo {cycleFormatted(true)}</span>}
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor('section_for_selected_school_cycle', {
      cell: (info) => (
        <div>
          <span
            className="font-normal truncate w-[120px] block"
            title={
              (info.row.original as DashboardStudentListDueOrderSerializerV3).section_for_selected_school_cycle ??
              'Sin sección'
            }
          >
            {(info.row.original as DashboardStudentListDueOrderSerializerV3).section_for_selected_school_cycle ??
              'Sin sección'}
          </span>
          <span className="font-normal truncate w-[120px] block text-xs text-[#454D64]">
            {(info.row.original as DashboardStudentListDueOrderSerializerV3).level_for_selected_school_cycle ?? ''}
          </span>
        </div>
      ),
      header: () => (
        <div className="flex flex-col">
          <span className="text-left">Sección</span>
          {flags?.inscriptions && <span className="text-xs font-normal">Ciclo {selectedCycleFormatted}</span>}
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor(flags?.inscriptions ? 'status_for_selected_school_cycle' : 'inscription_status', {
      cell: (info) => {
        const inscription_status = info.getValue();
        const getInscriptionStatus = (status: 'Reinscrito' | 'Inscrito' | 'No inscrito' | 'Pendiente') => {
          switch (status) {
            case 'Reinscrito':
              return {
                status: 'success',
                tooltip: 'El alumno ha realizado el pago de su reinscripción al siguiente ciclo escolar',
              } as const;
            case 'Inscrito':
              return {
                status: 'info',
                tooltip: 'El alumno ha realizado el pago de su inscripción al siguiente ciclo escolar',
              } as const;
            case 'Pendiente':
              return {
                status: 'warning',
                tooltip: 'El alumno aún tiene pendiente el pago de su inscripción al siguiente ciclo escolar.',
              } as const;
            default:
              return {
                status: 'muted',
                tooltip: 'El alumno no tiene asignado un concepto de inscripción para el siguiente ciclo escolar.',
              } as const;
          }
        };

        const { status, tooltip } = getInscriptionStatus(inscription_status as Inscriptions);

        return (
          <span className="font-semibold">
            <Tooltip message={tooltip}>
              <Status variant={status}>{String(info.getValue())}</Status>
            </Tooltip>
          </span>
        );
      },
      header: () => (
        <div className="flex flex-col">
          <span className="text-left">Inscripción </span>
          {flags?.inscriptions && (
            <span className="text-xs font-normal">Ciclo {cycleFormatted(selectedSchoolCycle === 'Todos')}</span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('due_orders', {
      cell: (info) => render_due_orders(info.row.original.due_orders),
      header: () => <span className="whitespace-nowrap">Colegiaturas vencidas</span>,
    }),
    // this field is named like this because that's how the ordering requires it, we are using
    // the same field to display the due_total_price
    // @ts-ignore
    columnHelper.accessor('due_total', {
      cell: (info) => <span>{renderMoney(info.row.original.due_total_price) || '0'}</span>,
      meta: {
        numeric: true,
      },
      header: () => <span className="whitespace-nowrap min-w-[100px] text-right">Deuda Total</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('created', {
      cell: (info) => (
        <span className="font-semibold">
          {info.getValue() ? formatDateHourWithUTCShort(info.getValue() || '') : '-'}
        </span>
      ),
      header: () => <span>Fecha de creación</span>,
      enableSorting: true,
    }),
  ];

  const filteredColumns = columns.filter((column: any) => {
    if (column.accessorKey === 'due_total_price') {
      return permissions.can_view_student_total_debt;
    }
    if (column.accessorKey === 'section_for_selected_school_cycle') {
      return flags?.inscriptions && !selectedSchoolCycle?.is_active && selectedSchoolCycle !== 'Todos';
    }

    return true;
  });

  const handleOpen = (row: DashboardStudentListDueOrderSerializerV2 | DashboardStudentListDueOrderSerializerV3) => {
    sendTrackEvent(Events.student_detail_opened, { source: 'dashboard' });
    router.push(`/student/detail/${row?.id}`);
  };

  const { toggle: isOpenStudentCreation, onClose: closeStudentCreation, onOpen: openStudentCreation } = useToggle();
  const mutation = api.students.generateExcelReport.useMutation({
    async onSuccess(data) {
      addToQueue(data.id);
      sentTrackEventWithName(Events.download_students_list_report, session);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });
  const handleDownload = async () => {
    if (selectedSchoolId) {
      const { is_active, ...restParamsFromForm } = paramsFromForm;
      const cleanedParamsFromForm = buildObjectWithNonEmptyProps(restParamsFromForm);
      const data = {
        sections: cleanedParamsFromForm.sections,
        levels: cleanedParamsFromForm.levels,
        delinquency: cleanedParamsFromForm.due_orders,
        inscription_status: cleanedParamsFromForm.inscription_status,
        school_cycle: selectedSchoolCycle?.id,
        concepts: cleanedParamsFromForm.concepts,
        scholarships: cleanedParamsFromForm.scholarships,
      };
      const payload = buildObjectWithNonEmptyProps({
        search: searchStudent,
        guardian: selectedGuardian?.id ? [selectedGuardian?.id] : undefined,
        ...data,
        is_active: is_active,
      });
      // @ts-ignore
      await mutation.mutate({ school_id: selectedSchoolId, ...payload, is_active });
      setIsWorking();
    }
  };

  let filterItems = [
    {
      header: 'Estado de alumno',
      watchKey: 'is_active',
      contents: studentsDueOrdersFilter?.active,
    },
    {
      header: 'Colegiaturas vencidas',
      watchKey: 'due_orders',
      contents: studentsDueOrdersFilter?.due_orders,
    },
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: studentsDueOrdersFilter?.levels,
      message: 'Filtra estudiantes por el nivel que tienen en el ciclo seleccionado',
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: studentsDueOrdersFilter?.sections,
      message: 'Filtra estudiantes por la sección que tienen en el ciclo seleccionado',
    },
    {
      header: 'Concepto',
      watchKey: 'concepts',
      contents: studentsDueOrdersFilter?.concepts,
    },
    {
      header: 'Beca asignada',
      watchKey: 'scholarships',
      contents: studentsDueOrdersFilter?.scholarships,
    },
    {
      header: 'Estado de inscripción',
      watchKey: 'inscription_status',
      contents: studentsDueOrdersFilter?.inscription_status,
    },
  ];
  if (!permissions?.can_view_student_status) {
    filterItems = filterItems.filter((item) => item.header !== 'Estado de alumno');
  }
  if (!selectedSchool?.config_dashboard?.display_inscriptions_status) {
    filterItems = filterItems.filter((item) => item.header !== 'Estado de inscripción');
  }
  const handleFilterChange = (newFilterData: FormFilterData, methods: UseFormReturn<FormFilterData>): void => {
    let filters = {};
    if (formFilterData && Object.values(formFilterData).filter((value) => value.checked).length > 0) {
      filters = { ...formFilterData, ...newFilterData };
    } else {
      filters = newFilterData;
    }

    formRef.current = methods;
    setFormFilterData(filters);
  };

  const handleChangeChipFilter = (data: FormFilterData): void => {
    setFormFilterData(data);
    formRef.current?.reset(data);
  };
  useEffect(() => {
    if (!route.previousRoute.includes('student/detail')) {
      setFormFilterData({});
    }
  }, []);

  const columnsToHide = permissions?.can_view_student_status ? [] : ['is_active'];
  if (!selectedSchool?.config_dashboard?.display_inscriptions_status) {
    columnsToHide.push('inscription_status');
  }

  const schoolCycleName = selectedSchoolCycle?.name;
  const schoolCycleText = schoolCycleName ? `en el ${schoolCycleName}` : '';
  const emptyStateText = `No hemos encontrado estudiantes con esos criterios ${schoolCycleText}. Prueba cambiando los filtros o el ciclo escolar.`;

  const onCloseCreation = () => {
    setDrawerState({ guardian: null, selectedTab: null });
    closeStudentCreation();
  };

  return (
    <>
      <div>
        <div className="w-full px-12 pt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <h4 className="font-bold text-[24px]">Lista de estudiantes</h4>
              {schoolCycles && schoolCycles.length > 0 && (
                <StudentFilter
                  selectedSchoolCycle={selectedSchoolCycle}
                  setSelectedSchoolCycle={setSelectedSchoolCycle}
                  schoolCycles={schoolCycles}
                />
              )}
            </div>

            <div className="py-2">
              {permissions?.can_add_student ? (
                <button
                  className="text-white hover:cursor-pointer bg-[#00AB55] font-bold text-sm flex items-center justify-center cursor-pointer whitespace-nowrap outline-none rounded-lg px-4 py-2 max-h-[45px]"
                  onClick={handleNewStudentClick}
                >
                  <IcPlus fill="currentColor" />
                  <label className="ml-3 hover:cursor-pointer">Nuevo estudiante</label>
                </button>
              ) : null}
            </div>
          </div>
          <div className="flex w-full gap-4">
            <div className="translate-y-2">
              <MultipleFilters
                filterItems={filterItems}
                handleFilter={handleFilterChange}
                onClearFilter={() => {
                  setFormFilterData({});
                }}
                itemsCount={itemsCount}
                setItemsCount={setItemsCount}
                selectedItems={formFilterData}
              />
            </div>
            <div className="max-w-[250px] w-full">
              <StudentSelector
                placeholder="Buscar por alumno/matricula"
                selectedStudent={selectedStudent}
                setSelectedStudent={setSelectedStudent}
                width="100%"
                students={studentsOnSchool || []}
                setSearchStudent={setSearchStudent}
                searchStudent={searchStudent}
                getStudentsOnSchool={refetch}
                loading={loadingStudents}
              />
            </div>
            <div className="flex w-full gap-2">
              <div className="max-w-[250px] w-full">
                <GuardianSelector
                  placeholder="Buscar por tutor"
                  selectedGuardian={selectedGuardian}
                  setSelectedGuardian={setSelectedGuardian}
                  width="100%"
                />
              </div>
            </div>

            <div className="flex items-center justify-end w-full pb-4 pr-10">
              <DownloadButton theme="blue" handleAdd={() => handleDownload()} />
            </div>
          </div>
        </div>

        <div className="p-6">
          <MultipleFiltersChips
            onChange={handleChangeChipFilter}
            formFilterData={formFilterData}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
          />
        </div>
        <div className="rounded-3xl shadow-card">
          <div className={cn({ 'opacity-50': isFetching && sorting })}>
            <Table
              data={data?.results || []}
              columns={filteredColumns}
              onRowClick={handleOpen}
              totalCount={data?.count || 0}
              pagination={pagination}
              setPagination={setPagination}
              onSortingChange={(sorting) => {
                const text = convertToOrdering(sorting);
                setSorting(text);
              }}
              isLoading={isLoading}
              isFetching={isFetching}
              hideColumns={columnsToHide}
              emptyStateText={emptyStateText}
              studentsCount={data?.count || 0}
              hideSum
            />
          </div>
        </div>
      </div>
      <Sheet
        open={isOpenStudentCreation}
        onOpenChange={(open) => {
          if (!open) onCloseCreation();
        }}
      >
        <Sheet.Content className="bg-white">
          <StudentCreation onClose={closeStudentCreation} />
        </Sheet.Content>
      </Sheet>
    </>
  );
}
