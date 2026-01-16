import { Button } from '@cometa/recreo/v2';
import { createColumnHelper } from '@tanstack/react-table';
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useMemo, useRef, useState } from 'react';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { NewTeacherDrawer, ROLE_OPTIONS } from './teacher-drawer';
import MultipleFilters, { formFilterDataToParams, MultipleFiltersChips } from '/src/components/MultipleFilters';
import { useFilters } from '/src/hooks/useFilters';
import { debounce } from 'lodash';
import { UserTeacherProfileType, useGetTeacherProfiles } from '../hooks';
import { cn } from '@cometa/utils';
import { api } from '/src/utils/api';
import { useGetMembership } from '/src/guards/AuthGuard';
import { canManageAcademicActions } from '../utils';

function TeachersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-48 px-4">
      <div className="flex flex-col justify-start">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-left">¡Aún no tienes maestros creados!</h3>
        <p className="text-gray-600 text-left max-w-sm">
          Ponte en contacto con nuestro equipo de soporte para crear tu primer maestro.
        </p>
      </div>
    </div>
  );
}

type ClassroomCountProps = {
  membership_id: string;
};

function ClassroomCount({ membership_id }: ClassroomCountProps) {
  const { data } = api.students.countClassroomTeacherAssignments.useQuery({
    membership_id,
  });

  const count = data?.count;
  const classroomText = count ? `${count} clases` : 'Sin clases asignadas';
  return (
    <div className="flex flex-row min-w-[150px]">
      <span
        className={cn('text-sm font-normal truncate', {
          'text-gray-500 italic': !count,
        })}
      >
        {classroomText}
      </span>
    </div>
  );
}

const columnHelper = createColumnHelper<UserTeacherProfileType>();
const teacherColumns = [
  columnHelper.accessor('user', {
    cell: (info) => {
      const user = info.getValue();
      const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : '-';
      return (
        <div className="flex flex-row min-w-[500px]">
          <span className="text-sm font-normal truncate" title={fullName}>
            {fullName}
          </span>
        </div>
      );
    },
    header: () => <span>Nombre</span>,
  }),
  columnHelper.accessor('teacherProfile', {
    cell: (info) => {
      const role = info.getValue().role;
      const displayRole = role || '-';
      return (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate" title={displayRole}>
            {displayRole}
          </span>
        </div>
      );
    },
    header: () => <span>Rol</span>,
  }),
  columnHelper.display({
    id: 'classroom_assignment_count',
    cell: (info) => <ClassroomCount membership_id={info.row.original.teacherProfile.membership_id} />,
    header: () => <span>Clases</span>,
  }),
];

export function TeachersList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [showNewDrawer, setShowNewDrawer] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debouncedSetSearch = useMemo(() => debounce(setDebouncedSearch, 300), []);
  const membership = useGetMembership();
  const canCreateTeacher = canManageAcademicActions(membership);

  const { formFilterData, handleFilter, handleChangeChipFilter, handleClearFilter, itemsCount, setItemsCount } =
    useFilters();
  const params = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const filterItems = [
    {
      header: 'Rol',
      watchKey: 'role',
      contents: ROLE_OPTIONS.map((role) => ({
        id: role.value,
        name: role.value,
      })),
    },
  ];

  const { data: userTeacherProfiles, isLoading } = useGetTeacherProfiles({
    filters: {
      search: debouncedSearch.trim(),
      role: params.role && Array.isArray(params.role) && params.role.length > 0 ? params.role : undefined,
    },
  });

  return (
    <div className="h-full relative w-full font-lota antialiased">
      <div className="w-full px-8">
        <div className="flex flex-col py-3 gap-1">
          <h1 className="text-[#212B36] text-2xl font-bold">Maestros</h1>
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
              placeholder="Buscar maestro por nombre o rol"
              search={search}
              setSearch={(value) => {
                setSearch(value);
                debouncedSetSearch(value);
              }}
              className="focus:ring-primary focus:border-primary mb-1"
            />
          </div>

          {canCreateTeacher ? (
            <Button onClick={() => setShowNewDrawer(true)}>
              <PlusIcon size={14} />
              Nuevo maestro
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

      <div ref={wrapperRef} className="w-full mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-48">
            <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
          </div>
        ) : userTeacherProfiles.length === 0 && (!!debouncedSearch || !!params.role) ? (
          <div className="flex justify-center items-center py-24">
            <p className="text-gray-500 text-sm">No se encontraron maestros con los filtros aplicados</p>
          </div>
        ) : !userTeacherProfiles || userTeacherProfiles.length === 0 ? (
          <TeachersEmptyState />
        ) : (
          <TableVirtualized
            data={userTeacherProfiles}
            columns={teacherColumns}
            onRowClick={(row) => router.push(`/academic/teachers/${row.teacherProfile.id}`)}
            maxHeight={wrapperRef?.current?.offsetHeight || 500}
            totalCount={userTeacherProfiles.length}
            totalFetched={userTeacherProfiles.length}
            isLoading={isLoading}
            isFetching={false}
            fetchNextPage={() => void 0}
            hasNextPage={false}
            isFetchingNextPage={false}
            setHeaderVisible={setHeaderVisible}
            headerVisible={headerVisible}
            tableLayout="auto"
            addMorePaddingFirstRow
            useWindowScroll
            hideSum
            rowClassName="hover:bg-accent/50"
          />
        )}
      </div>

      <NewTeacherDrawer open={showNewDrawer} onOpenChange={setShowNewDrawer} />
    </div>
  );
}
