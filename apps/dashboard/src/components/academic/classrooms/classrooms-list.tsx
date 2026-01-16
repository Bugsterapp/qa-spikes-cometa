import { Button } from '@cometa/recreo/v2';
import { createColumnHelper } from '@tanstack/react-table';
import { AlertTriangleIcon, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useMemo, useRef, useState } from 'react';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import MultipleFilters, {
  formFilterDataToParams,
  JsonData,
  MultipleFiltersChips,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { useFilters } from '/src/hooks/useFilters';
import { api } from '/src/utils/api';
import { useGetMembership, useSelectedSchool } from '/src/guards/AuthGuard';
import {
  ClassroomEntity,
  ClassroomListFilterValuesDTO,
  EvaluationPeriodStatusEnum,
} from '@cometa/trpc/src/students/types';
import { useSchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { NewClassroomDrawer } from './classroom-drawers';
import { cn } from '@cometa/utils';
import { differenceInDays, format, parse } from 'date-fns';
import { UserTeacherProfileType, useGetTeacherProfiles } from '../hooks';
import { canManageAcademicActions } from '../utils';

function ClassroomsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-48 px-4">
      <div className="flex flex-col justify-start">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-left">¡Aún no tienes clases creadas!</h3>
        <p className="text-gray-600 text-left max-w-sm">
          Ponte en contacto con nuestro equipo de soporte para crear tu primera clase.
        </p>
      </div>
    </div>
  );
}

const columnHelper = createColumnHelper<ClassroomEntity>();

function createClassroomColumns(
  teacherAssignmentsByClassroom: Map<string, Array<{ classroom_id: string; membership_id: string }>>,
  allUserTeacherProfiles?: UserTeacherProfileType[]
) {
  return [
    columnHelper.accessor('course.name', {
      cell: (info) => (
        <div className="flex flex-row">
          <span className="text-sm font-normal truncate" title={info.getValue()}>
            {info.getValue()} {info.row.original.variant}
          </span>
        </div>
      ),
      header: () => <span>Clase</span>,
    }),
    columnHelper.accessor('level.name', {
      cell: (info) => (
        <div className="flex flex-row">
          <span className="text-sm font-normal truncate" title={info.getValue()}>
            {info.getValue() ?? '-'}
          </span>
        </div>
      ),
      header: () => <span>Nivel</span>,
    }),
    columnHelper.accessor('group.name', {
      cell: (info) => {
        const text = `${info.row.original.grade?.name ?? '-'} ${info.getValue() ?? ''}`.trim();
        return (
          <div className="flex flex-row min-w-[100px]">
            <span className="text-sm font-normal truncate" title={info.getValue()}>
              {text}
            </span>
          </div>
        );
      },
      header: () => <span>Grupo</span>,
    }),
    columnHelper.display({
      id: 'teacher',
      cell: (info) => {
        const classroomId = info.row.original.id;
        const teacherAssignments = teacherAssignmentsByClassroom.get(classroomId) || [];
        const membershipIds = teacherAssignments.map((ta) => ta.membership_id);
        const userTeacherProfiles = allUserTeacherProfiles?.filter((utp) =>
          membershipIds.includes(utp.teacherProfile.membership_id)
        );
        const users = userTeacherProfiles?.map((utp) => utp.user) || [];

        const teacherText =
          users.length === 0
            ? 'Sin maestro asignado'
            : users.map((u) => `${u.first_name} ${u.last_name}`.trim()).join(', ');

        return (
          <div className="flex flex-row min-w-[150px]">
            <span
              className={cn('text-sm font-normal truncate', {
                'text-gray-500 italic': users.length === 0,
              })}
            >
              {teacherText}
            </span>
          </div>
        );
      },
      header: () => <span>Maestro</span>,
    }),
    columnHelper.display({
      id: 'student_assignment_count',
      cell: (info) => {
        const count = info.row.original.student_assignment_count ?? 0;
        const text = count > 0 ? `${count} estudiantes` : 'Sin estudiantes';
        return (
          <div className="flex flex-row min-w-[120px]">
            <span
              className={cn('text-sm font-normal truncate', {
                'text-gray-500 italic': count === 0,
              })}
            >
              {text}
            </span>
          </div>
        );
      },
      header: () => <span>Estudiantes</span>,
    }),
    // @TODO: this action needs a specific endpoint.
    // columnHelper.display({
    //   id: 'evaluationScore',
    //   cell: () => (
    //     <div className="flex flex-row min-w-[130px]">
    //       <span className="text-sm font-normal truncate text-gray-500 italic">Por definir</span>
    //     </div>
    //   ),
    //   header: () => <span>Calificaciones</span>,
    // }),
  ];
}

export function ClassroomsList() {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showNewDrawer, setShowNewDrawer] = useState(false);
  const { activeCycle } = useSchoolCycleSelector();
  const membership = useGetMembership();
  const canCreateClassroom = canManageAcademicActions(membership);

  const { formFilterData, handleFilter, handleChangeChipFilter, handleClearFilter, itemsCount, setItemsCount } =
    useFilters();
  const params = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const { data: filters } = api.students.getClassroomFilters.useQuery(
    { school_id: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );
  const utils = api.useUtils();
  const { data: classroomCountResult } = api.students.countClassrooms.useQuery(
    {
      school_cycle_id: activeCycle?.id as string,
    },
    {
      enabled: !!activeCycle?.id,
    }
  );
  const {
    data: classroomsData,
    isPending: isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.students.listClassrooms.useInfiniteQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        ...params,
        school_cycle_id: activeCycle?.id,
        search,
        limit: 50,
        include: ['course', 'level', 'grade', 'group', 'student_assignment_count'],
      },
    },
    {
      enabled: !!selectedSchool?.id && !!activeCycle?.id,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 15,
      getNextPageParam: (lastPage) => {
        if (!lastPage) return undefined;

        const { has_more, page } = lastPage;
        if (!has_more) return undefined;

        return String(page + 1);
      },
      retry: false,
    }
  );
  const classrooms = useMemo(
    () => classroomsData?.pages.flatMap((page) => page?.results ?? []) || [],
    [classroomsData]
  );

  const classroomIds = useMemo(() => classrooms.map((c) => c.id), [classrooms]);
  const { data: allTeacherAssignments } = api.students.listClassroomTeacherAssignments.useQuery(
    {
      classroom_id: classroomIds,
    },
    {
      enabled: classroomIds.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 15,
    }
  );

  const teacherAssignmentsByClassroom = useMemo(() => {
    if (!allTeacherAssignments) return new Map();

    const map = new Map<string, typeof allTeacherAssignments>();
    allTeacherAssignments.forEach((assignment) => {
      const classroomId = assignment.classroom_id;
      if (!map.has(classroomId)) {
        map.set(classroomId, []);
      }
      map.get(classroomId)?.push(assignment);
    });

    return map;
  }, [allTeacherAssignments]);

  const { data: allUserTeacherProfiles } = useGetTeacherProfiles();

  const { data: periods } = api.students.listEvaluationPeriods.useQuery(
    {
      school_cycle_id: activeCycle?.id as string,
    },
    {
      enabled: !!activeCycle?.id,
    }
  );
  // @TODO: check post-MVP
  // for the MVP all periods are grouped by name and has the same start and end date; thats why is get the first in progress period
  // in the future this logic will be more complex, but for now we will use the first one
  const periodInProgress = periods?.find((period) => period.status === EvaluationPeriodStatusEnum.InProgress);

  function periodIsCloseToEnd(date?: string | null) {
    if (!date) return false;
    const endDate = parse(date, 'yyyy-MM-dd', new Date());
    const daysUntilEnd = differenceInDays(endDate, new Date());
    return daysUntilEnd <= 10 && daysUntilEnd >= 0;
  }

  function prettifyDate(date?: string | null) {
    if (!date) return null;
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    return format(parsedDate, 'dd/MM/yyyy');
  }

  const classroomFilters = normalizeFilters((filters ?? {}) as JsonData<ClassroomListFilterValuesDTO>);
  const filterItems = [
    {
      header: 'Materia',
      watchKey: 'course_id',
      contents: classroomFilters?.courses,
    },
    {
      header: 'Nivel',
      watchKey: 'level_id',
      contents: classroomFilters?.levels,
    },
    {
      header: 'Grado',
      watchKey: 'grade_id',
      contents: classroomFilters?.grades,
    },
    {
      header: 'Grupo',
      watchKey: 'group_id',
      contents: classroomFilters?.groups,
    },
  ];

  function handleCreateSuccess() {
    utils.students.listClassrooms.invalidate();
  }

  const classroomColumns = useMemo(
    () => createClassroomColumns(teacherAssignmentsByClassroom, allUserTeacherProfiles),
    [teacherAssignmentsByClassroom, allUserTeacherProfiles]
  );

  return (
    <div className="h-full relative w-full font-lota antialiased">
      <div className="w-full px-8">
        <div className="flex flex-col py-3 gap-1">
          <h1 className="text-[#212B36] text-2xl font-bold">Clases</h1>
          <span className="text-gray-500 text-sm">{activeCycle?.name}</span>

          {periodIsCloseToEnd(periodInProgress?.end_date) ? (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-600">
                  Tienes hasta el {prettifyDate(periodInProgress?.end_date)} para registrar calificaciones. Después de
                  esa fecha el periodo se cierra.
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <MultipleFilters
              filterItems={filterItems}
              handleFilter={handleFilter}
              onClearFilter={handleClearFilter}
              itemsCount={itemsCount}
              setItemsCount={setItemsCount}
              isLegacy={false}
            />
            <GlobalSearch
              placeholder="Buscar por materia"
              search={search}
              setSearch={setSearch}
              className="focus:ring-primary focus:border-primary mb-1"
            />
          </div>

          {canCreateClassroom ? (
            <Button onClick={() => setShowNewDrawer(true)}>
              <PlusIcon size={14} />
              Nueva clase
            </Button>
          ) : null}
        </div>
      </div>

      <MultipleFiltersChips
        onChange={handleChangeChipFilter}
        formFilterData={formFilterData}
        itemsCount={itemsCount}
        setItemsCount={setItemsCount}
        className="ml-2"
      />

      <div ref={wrapperRef} className="w-full mt-4 pb-28">
        {isLoading ? (
          <div className="flex justify-center items-center py-48">
            <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
          </div>
        ) : classrooms.length === 0 ? (
          <ClassroomsEmptyState />
        ) : (
          <TableVirtualized
            data={classrooms}
            columns={classroomColumns}
            onRowClick={(classroom) => router.push(`/academic/classrooms/${classroom.id}`)}
            maxHeight={wrapperRef?.current?.offsetHeight ?? 500}
            totalCount={0}
            totalFetched={classrooms.length}
            isLoading={isLoading}
            isFetching={isFetching}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            initialHeaderPosition={0}
            addMorePaddingFirstRow
            useWindowScroll
            hideSum
            rowClassName="hover:bg-accent/50"
          />
        )}

        <div className="fixed flex w-full items-center bg-white gap-1 bottom-0 text-gray-600 px-8 py-5 z-10 shadow-[0px_0px_2px_0px_rgba(145,158,171,0.20),_0px_-12px_24px_-4px_rgba(145,158,171,0.12)]">
          <span className="font-semibold">{classroomCountResult?.count ?? 0}</span> clases
        </div>
      </div>

      <NewClassroomDrawer open={showNewDrawer} onOpenChange={setShowNewDrawer} onSuccess={handleCreateSuccess} />
    </div>
  );
}
