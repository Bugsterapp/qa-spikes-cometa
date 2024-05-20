import { useState, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { PageSize } from '../../../../utils/general';
import { renderMoney, render_due_orders } from '../../../../utils/datagridHeaders';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { Table } from '/src/components/Table';
import { Events } from '/src/constants/events';
import { sendTrackEvent } from '/src/utils/events';
import { useGetPermissions, useOrinocoSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
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
import { DashboardStudentList } from '@cometa/trpc/src/types';
import Status from '/src/components/Status';
import MultipleFilters, {
  FormFilterData,
  MultipleFiltersChips,
  formFilterDataToParams,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import { UseFormReturn } from 'react-hook-form';
import Header from '../../../molecules/dashboard/Header';
import StudentSelector from '../StudentSelector';
import GuardianSelector from '../GuardianSelector';
import { useSendTrackEvent } from '@cometa/utils';
import { Tooltip } from '/src/components/atoms/Tooltip';

export interface StudentsTableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DashboardStudentList[];
}

type Inscriptions = 'Reinscrito' | 'Inscrito' | 'No inscrito' | 'Pendiente';

export default function OrderTableForStudents(selectedSchoolCycle: any) {
  const router = useRouter();
  const { data: session } = useSession();
  const selectedSchoolId = useSelectedSchoolId();
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchStudent, setSearchStudent] = useState('');
  const {
    data: studentsOnSchool,
    refetch,
    isLoading: loadingStudents,
  } = useSearchStudents(session?.token, selectedSchoolId || '', searchStudent);
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;

  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const params = {
    ...paramsFromForm,
  };
  const { data: filters } = api.students.studentFilters.useQuery({ school_id: selectedSchoolId || '' });
  const studentsDueOrdersFilter = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);
  const isOrinoco = useOrinocoSchool();
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PageSize,
  });
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
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

  const { data: schoolarCycles } = api.schools.schoolsCycles.useQuery(
    { school_id: selectedSchoolId || '', is_active: true },
    {
      enabled: !!selectedSchoolId,
    }
  );

  const { data, isFetching, isLoading } = api.students.dashboardSchoolDueOrdersStudents.useQuery(
    {
      schoolId: selectedSchoolId || 'demo',
      query: {
        page: pageIndex === 0 ? 1 : pageIndex + 1,
        guardian: [selectedGuardian?.id ? selectedGuardian?.id : ''],
        search: selectedStudent ? `${selectedStudent?.first_name} ${selectedStudent?.last_name}` : undefined,
        school_cycle: selectedSchoolCycle?.selectedSchoolCycle.id,
        ...params,
      },
    },
    {
      enabled: !!selectedSchoolId,
      retry: false,
      onError: () => {
        setPagination({ pageIndex: 0, pageSize: PageSize });
      },
    }
  );

  const yearStartLastTwoDigits =
    schoolarCycles && String(schoolarCycles[0]?.year_start && schoolarCycles[0]?.year_start + 1).slice(-2);
  const yearEndLastTwoDigits =
    schoolarCycles && String(schoolarCycles[0]?.year_end && schoolarCycles[0]?.year_end + 1).slice(-2);

  const activeCycle = `${yearStartLastTwoDigits} - ${yearEndLastTwoDigits}`;

  const columnHelper = createColumnHelper<StudentsTableResponse['results'][number]>();
  const columns = [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: 'Estudiantes',
      cell: (info) => (
        <span className="font-semibold">{`${info.row.original.first_name} ${info.row.original.last_name}`}</span>
      ),
      size: 350,
      header: () => <span className="whitespace-nowrap">Estudiantes</span>,
    }),
    columnHelper.accessor('level', {
      cell: (info) => <span className="font-semibold">{info.row.original.level ?? 'Sin asignar'}</span>,
      header: () => <span>Nivel</span>,
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
      header: () => <span>Estado actual</span>,
    }),
    columnHelper.accessor('inscription_status', {
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
              <Status variant={status}>{info.getValue()}</Status>
            </Tooltip>
          </span>
        );
      },
      header: () => <span>Inscripción {activeCycle ?? null}</span>,
    }),
    columnHelper.accessor('section', {
      cell: (info) => <span className="font-semibold">{info.row.original.section ?? 'Sin asignar'}</span>,
      header: () => <span>Sección</span>,
    }),
    columnHelper.accessor('due_orders', {
      cell: (info) => render_due_orders(info.row.original.due_orders),
      header: () => <span className="whitespace-nowrap">Colegiaturas vencidas</span>,
    }),
    columnHelper.accessor('due_total_price', {
      cell: (info) => <div className="text-left">{renderMoney(info.row.original.due_total_price) || '0'}</div>,
      meta: {
        numeric: true,
      },
      header: () => <span className="whitespace-nowrap">Deuda Total</span>,
    }),
  ];

  const handleOpen = (row: DashboardStudentList) => {
    sendTrackEvent(Events.student_detail_opened, { source: 'dashboard' });
    router.push(`/student/detail/${row.id}`);
  };

  const { toggle: isOpenStudentCreation, onClose: closeStudentCreation, onOpen: openStudentCreation } = useToggle();
  const mutation = api.students.generateExcelReport.useMutation({
    async onSuccess(data) {
      addToQueue(data.id);
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
        school_cycle: selectedSchoolCycle?.selectedSchoolCycle?.id,
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
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: studentsDueOrdersFilter?.sections,
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
  if (isOrinoco) {
    filterItems = filterItems.filter((item) => item.header !== 'Estado de inscripción');
  }

  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };
  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };
  const columnsToHide = permissions?.can_view_student_status ? [] : ['is_active'];
  if (!isOrinoco) {
    columnsToHide.push('inscription_status');
  }
  return (
    <>
      <div>
        <div className="w-full px-12 pt-4">
          <div className="flex items-center justify-between">
            {selectedSchoolCycle?.selectedSchoolCycle !== 'Todos' ? (
              <Header title="Lista de estudiantes" label={selectedSchoolCycle?.selectedSchoolCycle.name} />
            ) : (
              <Header title="Lista de estudiantes" />
            )}
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
          <div className="flex w-full gap-2">
            <MultipleFilters
              filterItems={filterItems}
              handleFilter={handleFilter}
              onClearFilter={() => {
                setFormFilterData({});
              }}
              itemsCount={itemsCount}
              setItemsCount={setItemsCount}
            />
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
        <div className="px-6">
          <MultipleFiltersChips
            onChange={handleChangeChipFilter}
            formFilterData={formFilterData}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
          />
        </div>
        <div className='className="rounded-3xl shadow-card"'>
          <div className={`${isFetching ? 'opacity-25 cursor-wait' : 'transition-opacity duration-300 py-2'}`}>
            <Table
              data={data?.results || []}
              columns={columns}
              onRowClick={handleOpen}
              totalCount={data?.count || 0}
              pagination={pagination}
              setPagination={setPagination}
              hideSum
              isLoading={isLoading || isFetching}
              hideColumns={columnsToHide}
              studentsCount={data?.count || 0}
              className="w-full"
            />
          </div>
        </div>
      </div>
      <Sheet
        open={isOpenStudentCreation}
        onOpenChange={(open) => {
          if (!open) closeStudentCreation();
        }}
      >
        <Sheet.Content className="bg-white">
          <StudentCreation onClose={closeStudentCreation} />
        </Sheet.Content>
      </Sheet>
    </>
  );
}
