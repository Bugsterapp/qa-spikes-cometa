import type {
  DashboardStudentListDueOrderSerializerV4,
  InscriptionStatusEnum,
  StateEnum,
} from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';

import * as Sentry from '@sentry/nextjs';
import { keepPreviousData } from '@tanstack/react-query';
import { type PaginationState, createColumnHelper } from '@tanstack/react-table';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useStatePersist } from 'use-state-persist';

import IcPlus from '/public/assets/icons/ic_plus.svg';
import Sheet from '/src/components/atoms/Sheet';
import {
  DownloadButton,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import MultipleFilters, {
  type FormFilterData,
  MultipleFiltersChips,
  formFilterDataToParams,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import { Table, convertToOrdering } from '/src/components/Table';
import { Events } from '/src/constants/events';
import { useRoute } from '/src/contexts/RoutesProvider';
import { useGetPermissions, useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import useSearchStudents from '/src/hooks/useSearchStudents';
import useToggle from '/src/hooks/useToggle';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { renderMoney, render_due_orders } from '/src/utils/datagridHeaders';

import { PageSize, formatDateHourWithUTCShort } from '/src/utils/general';
import { buildObjectWithNonEmptyProps } from '/src/utils/object-util';
import type { Student } from '/types/paid-orders';

import GuardianSelector from '../GuardianSelector';
import type { Guardian } from '../OrderTableForPayins';
import StudentInscriptionStatusChip from '../student/StudentInscriptionStatusChip';
import StudentStateChip from '../student/StudentStateChip';
import StudentCreation from '../StudentCreation';
import StudentSelector from '../StudentSelector';
import { ColumnCustomizerAction } from '/src/components/ColumnCustomizer';
import { useColumnCustomizer } from '/src/components/ColumnCustomizer/hooks';
import { SchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { ShareTableAction } from '/src/components/ShareTable';

export interface StudentsTableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DashboardStudentListDueOrderSerializerV4[];
}

type Props = {
  selectedSchoolCycle: SchoolCycleEntity | null;
  schoolCycles?: SchoolCycleEntity[];
  setSelectedSchoolCycle: (value: SchoolCycleEntity | null) => void;
};

export default function OrderTableForStudents({ selectedSchoolCycle, setSelectedSchoolCycle, schoolCycles }: Props) {
  const router = useRouter();
  const route = useRoute();
  const selectedSchoolId = useSelectedSchoolId();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const selectedSchool = useSelectedSchool();
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchStudent, setSearchStudent] = useState('');
  const {
    data: studentsOnSchool,
    refetch,
    isLoading: loadingStudents,
  } = useSearchStudents(selectedSchoolId || '', searchStudent);
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [formFilterData, setFormFilterData] = useStatePersist<FormFilterData>('@StudentsFilter');
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const params = {
    ...paramsFromForm,
  };
  const { data: filters } = api.students.studentFilters.useQuery(
    { school_id: selectedSchoolId || '' },
    {
      staleTime: 60 * 1000 * 60,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

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

  const handleNewStudentClick = () => {
    openStudentCreation();
    sendTrackEventWithUserName(Events.new_student_started, {});
  };
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const { isEnabled: showStudentsNameBackwards } = useFlagWithVariableMatching('hk_show_students_name_backwards');
  const shouldShowAccountSections = Boolean(permissions.can_view_account_state_section);

  const [sorting, setSorting] = useState<string>();

  const {
    data,
    isFetching,
    isPending: isLoading,
    error,
  } = api.students.dashboardSchoolDueOrdersStudents.useQuery(
    {
      schoolId: selectedSchoolId || 'demo',
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
      enabled: !!selectedSchoolId,
      placeholderData: keepPreviousData,
      staleTime: 60 * 1000 * 60,
    }
  );

  useEffect(() => {
    if (error) {
      setPagination({ pageIndex: 0, pageSize: PageSize });
    }
  }, [error]);

  const cycleFormatted = useMemo(
    () => (isActive?: boolean) => {
      const cycleToFormat = isActive ? schoolCycles?.find((cycle) => cycle.is_active) : selectedSchoolCycle;
      if (cycleToFormat?.year_start && cycleToFormat?.year_end) {
        const yearStart = String(cycleToFormat?.year_start);
        const yearEnd = String(cycleToFormat?.year_end).slice(-2);
        return `${yearStart}-${yearEnd}`;
      }
      return null;
    },
    [schoolCycles, selectedSchoolCycle]
  );

  function getInscriptionSchoolCycle() {
    if (!selectedSchoolCycle) return '';

    let schoolCycle = selectedSchoolCycle;
    if (typeof selectedSchoolCycle === 'string' && selectedSchoolCycle === 'Todos') {
      schoolCycle = schoolCycles?.find((schoolCycle) => schoolCycle.is_active) as SchoolCycleEntity;
    }

    if (!schoolCycle) return '';
    const { year_start, year_end } = schoolCycle;

    const yearStart = year_start?.toString();
    const yearEnd = year_end?.toString().slice(-2);

    return `${yearStart}-${yearEnd}`;
  }

  const selectedCycleFormatted = cycleFormatted();

  const columnHelper = createColumnHelper<StudentsTableResponse['results'][number]>();
  const columns = [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: 'last_name',
      cell: (info) => (
        <span className="font-semibold min-w-[500px] truncate">{`${
          showStudentsNameBackwards
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
    columnHelper.accessor('state', {
      cell: (info) => (
        <span className="font-semibold">
          <StudentStateChip state={info.getValue() as StateEnum} />
        </span>
      ),
      header: () => <span>Estado</span>,
    }),
    columnHelper.accessor('section', {
      cell: (info) => (
        <div>
          <span
            className="font-normal truncate w-[120px] block text-right"
            title={info.row.original.section ?? 'Sin sección'}
          >
            {info.row.original.section ?? 'Sin sección'}
          </span>
          <span
            className="font-normal truncate w-[120px] block text-xs text-right text-[#454D64]"
            title={info.row.original.section ?? 'Sin sección'}
          >
            {info.row.original.level ?? ''}
          </span>
        </div>
      ),
      header: () => (
        <div className="flex flex-col">
          <span className="text-left">Sección actual</span>
          <span className="text-xs font-normal">Ciclo {cycleFormatted(true)}</span>
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
              (info.row.original as DashboardStudentListDueOrderSerializerV4).section_for_selected_school_cycle ??
              'Sin sección'
            }
          >
            {(info.row.original as DashboardStudentListDueOrderSerializerV4).section_for_selected_school_cycle ??
              'Sin sección'}
          </span>
          <span className="font-normal truncate w-[120px] block text-xs text-[#454D64]">
            {(info.row.original as DashboardStudentListDueOrderSerializerV4).level_for_selected_school_cycle ?? ''}
          </span>
        </div>
      ),
      header: () => (
        <div className="flex flex-col">
          <span className="text-left">Sección</span>
          <span className="text-xs font-normal text-center">Ciclo {selectedCycleFormatted}</span>
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor('next_inscription_status', {
      cell: (info) => (
        <span className="font-semibold">
          <StudentInscriptionStatusChip status={info.getValue() as InscriptionStatusEnum} />
        </span>
      ),
      header: () => (
        <div className="flex flex-col">
          <span className="text-left">Inscripción</span>
          <span className="text-xs font-normal">Ciclo {getInscriptionSchoolCycle()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('due_orders', {
      cell: (info) => render_due_orders(info.row.original.due_orders),
      header: () => <span className="whitespace-nowrap">Colegiaturas vencidas</span>,
    }),
    ...(shouldShowAccountSections
      ? [
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
        ]
      : []),
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

  const handleOpen = (row: DashboardStudentListDueOrderSerializerV4) => {
    sendTrackEventWithUserName(Events.student_detail_opened, { source: 'dashboard' });
    return router.push(`/students/${row?.id}`);
  };

  const { toggle: isOpenStudentCreation, onClose: closeStudentCreation, onOpen: openStudentCreation } = useToggle();
  const mutation = api.students.generateExcelReport.useMutation({
    async onSuccess(data) {
      addToQueue(data.id);
      sendTrackEventWithUserName(Events.download_students_list_report, {});
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
        state: cleanedParamsFromForm.state,
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
      header: 'Estado de estudiante',
      watchKey: 'state',
      contents: studentsDueOrdersFilter?.state,
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
    closeStudentCreation();
  };

  const { tableColumns, visibleTableColumns, handleColumnsChange } = useColumnCustomizer({
    tableName: 'students',
    columns,
  });

  const filteredColumns = visibleTableColumns.filter((column: any) => {
    if (column.accessorKey === 'due_total_price') {
      return permissions.can_view_student_total_debt;
    }
    if (column.accessorKey === 'section_for_selected_school_cycle') {
      return !selectedSchoolCycle?.is_active && (selectedSchoolCycle as unknown as string) !== 'Todos';
    }

    return true;
  });

  return (
    <>
      <div>
        <div className="w-full px-12 pt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <h4 className="font-bold text-[24px]">Lista de estudiantes</h4>
              {schoolCycles && schoolCycles.length > 0 && (
                <SchoolCycleSelector
                  cycles={schoolCycles}
                  selected={selectedSchoolCycle}
                  setFn={setSelectedSchoolCycle}
                />
              )}
            </div>

            <div className="py-2">
              {permissions?.can_add_student ? (
                <button
                  className="text-white hover:cursor-pointer bg-[#00AB55] font-bold text-sm flex items-center justify-center cursor-pointer whitespace-nowrap outline-none rounded-lg px-4 py-2 max-h-[45px]"
                  onClick={handleNewStudentClick}
                  type="button"
                >
                  <IcPlus fill="currentColor" />
                  <span className="ml-3 hover:cursor-pointer">Nuevo estudiante</span>
                </button>
              ) : null}
            </div>
          </div>
          <div className="flex w-full gap-4">
            <div className="translate-y-2">
              <MultipleFilters
                filterItems={filterItems}
                handleFilter={handleFilterChange}
                onClearFilter={() => setFormFilterData({})}
                itemsCount={itemsCount}
                setItemsCount={setItemsCount}
                selectedItems={formFilterData}
                tableName="students"
              />
            </div>
            <div className="max-w-[250px] w-full">
              <StudentSelector
                placeholder="Buscar por estudiante/matricula"
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

            <div className="flex items-center justify-end w-full gap-1 pb-4 pr-10">
              <ShareTableAction
                tableName="students"
                relativeUrl="student"
                filters={{
                  search: searchStudent,
                  school_cycle: selectedSchoolCycle
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
                tableName="students"
              />
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
            tableName="students"
          />
        </div>
        <div className="rounded-3xl shadow-card">
          <div className={cn({ 'opacity-50': isFetching && sorting })}>
            <Table
              data={data?.results || []}
              columns={filteredColumns as any}
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
