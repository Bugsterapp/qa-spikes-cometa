import React, { useMemo, useRef, useState } from 'react';
import MultipleFilters, {
  FormFilterData,
  MultipleFiltersChips,
  formFilterDataToParams,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import { createColumnHelper } from '@tanstack/react-table';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { SchoolCycleSelector } from '../SchoolCycleSelector';
import { UseFormReturn } from 'react-hook-form';
import { api } from '/src/utils/api';
import { DashboardStudentSearch } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import Sheet from '/src/components/atoms/Sheet';
import ScholarshipAssignmentDetailV2 from '../scholarship/ScholarshipAssigmentDetailV2';
import { extractPageFromURL } from '/src/utils/object-util';
import useDebounce from '/src/hooks/useDebounce';
import { convertToOrdering } from '/src/components/Table';
import { keepPreviousData } from '@tanstack/react-query';

interface ScholarshipsStudentsProps {
  scholarshipId: string;
}

const ScholarshipsStudentsTable: React.FC<ScholarshipsStudentsProps> = ({ scholarshipId }) => {
  const columnHelper = createColumnHelper<DashboardStudentSearch>();
  const [search, setSearch] = useState('');
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [schoolCycle, setSchoolCycle] = useState<SchoolCycleEntity | null>(null);
  const [studentForDetail, setStudentForDetail] = useState<DashboardStudentSearch | null>(null);
  const [sorting, setSorting] = useState<string>();
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const searchDebounced = useDebounce(search, 800);
  const schoolId = useSelectedSchoolId();

  const { data: schoolCycles } = api.charge.schoolCycleList.useQuery(
    {
      schoolId: schoolId as string,
    },
    {
      enabled: Boolean(schoolId),
      staleTime: 60 * 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );

  const params = {
    search: searchDebounced,
    ...paramsFromForm,
    ordering: sorting ? [sorting] : undefined,
  };

  const {
    data: studentsAssigned,
    isPending: isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.schools.schoolsStudentsScholarships.useInfiniteQuery(
    {
      school_id: schoolId || '',
      query: {
        page_size: 100,
        scholarships: [scholarshipId],
        scholarship_school_cycle: schoolCycle?.id,
        ...params,
      },
    },
    {
      getNextPageParam: (lastPage) => extractPageFromURL(lastPage?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => extractPageFromURL((firstPage as any)?.previous as string) ?? undefined,
      enabled: Boolean(schoolId),
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    }
  );
  const { data: filters } = api.schools.schoolsStudentsScholarshipsFilters.useQuery(
    { school_id: schoolId as string },
    {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000 * 60,
    }
  );

  const flatData = useMemo(() => studentsAssigned?.pages.flatMap((page) => page?.results ?? []), [studentsAssigned]);
  const closeScholarshipAssignmentDetail = () => {
    setStudentForDetail(null);
  };
  const columns = [
    // {
    //   header: () => (
    //     <span className="flex items-center">
    //       <GenericRowCheckBoxButton onClick={() => null} checked={false} />
    //     </span>
    //   ),
    //   id: 'select',
    //   cell: ({ row }: { row: Row<any> }) => (
    //     <div>
    //       <Tooltip
    //         message="No se puede desasignar este estudiante porque todos sus meses se encuentran pagados"
    //         disableHover={row.original.can_be_deassigned as unknown as boolean}
    //       >
    //         <GenericRowCheckBoxButton
    //           key={row.original.id}
    //           // onClick={() => handleOnSelectRow(row.original)}
    //           disabled={!row.original.can_be_deassigned}
    //           checked={
    //             // !row.original.can_be_deassigned
    //             //   ? false
    //             //   : selectedAll
    //             //     ? !deselectedStudents.some((student) => student.id === row.original.id)
    //             //     : selectedStudents.some((student) => student.id === row.original.id)
    //             false
    //           }
    //         />
    //       </Tooltip>
    //     </div>
    //   ),
    //   size: 12,
    // },
    columnHelper.accessor('first_name', {
      cell: (info) => (
        <div className="flex flex-col gap-1">
          <span
            className="text-sm text-[#212B36] truncate"
            title={`${info.row.original.first_name} ${info.row.original.last_name}`}
          >
            <HighlightMatch query={search}>
              {info.row.original.first_name} {info.row.original.last_name}
            </HighlightMatch>
          </span>
          <span className="text-xs text-[#454D64]">
            <HighlightMatch query={search}>{info.row.original.enrollment_code}</HighlightMatch>
          </span>
        </div>
      ),
      size: 118.56,
      header: () => <span className="font-semibold">Estudiante</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('section', {
      cell: (info) => (
        <div className="flex flex-col gap-[4px]">
          <span className="text-left text-[#1C1C1D] truncate" title={info.row.original.section || 'Sin sección'}>
            {info.row.original.section || 'Sin sección'}
          </span>
          <span className="text-left text-xs text-[#454D64]">{info.row.original.level}</span>
        </div>
      ),
      size: 125,
      header: () => <span>Sección actual</span>,
      enableSorting: true,
    }),
    // {
    //   id: 'delete',
    //   cell: () => (
    //     <div className="flex flex-col gap-[4px]">
    //       <Tooltip message="Desasignar estudiante">
    //         <button disabled>
    //           <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    //             <g clip-path="url(#clip0_2376_17148)">
    //               <path
    //                 d="M13.9999 2.66667H11.9333C11.7785 1.91428 11.3691 1.23823 10.7741 0.752479C10.179 0.266727 9.43472 0.000969683 8.66658 0L7.33325 0C6.56511 0.000969683 5.8208 0.266727 5.22575 0.752479C4.63071 1.23823 4.22132 1.91428 4.06659 2.66667H1.99992C1.82311 2.66667 1.65354 2.7369 1.52851 2.86193C1.40349 2.98695 1.33325 3.15652 1.33325 3.33333C1.33325 3.51014 1.40349 3.67971 1.52851 3.80474C1.65354 3.92976 1.82311 4 1.99992 4H2.66659V12.6667C2.66764 13.5504 3.01917 14.3976 3.64407 15.0225C4.26896 15.6474 5.11619 15.9989 5.99992 16H9.99992C10.8836 15.9989 11.7309 15.6474 12.3558 15.0225C12.9807 14.3976 13.3322 13.5504 13.3333 12.6667V4H13.9999C14.1767 4 14.3463 3.92976 14.4713 3.80474C14.5963 3.67971 14.6666 3.51014 14.6666 3.33333C14.6666 3.15652 14.5963 2.98695 14.4713 2.86193C14.3463 2.7369 14.1767 2.66667 13.9999 2.66667ZM7.33325 1.33333H8.66658C9.0801 1.33384 9.48334 1.46225 9.82099 1.70096C10.1587 1.93967 10.4142 2.27699 10.5526 2.66667H5.44725C5.58564 2.27699 5.84119 1.93967 6.17884 1.70096C6.5165 1.46225 6.91974 1.33384 7.33325 1.33333ZM11.9999 12.6667C11.9999 13.1971 11.7892 13.7058 11.4141 14.0809C11.0391 14.456 10.5304 14.6667 9.99992 14.6667H5.99992C5.46949 14.6667 4.96078 14.456 4.58571 14.0809C4.21063 13.7058 3.99992 13.1971 3.99992 12.6667V4H11.9999V12.6667Z"
    //                 fill="#1C1C1D"
    //               />
    //               <path
    //                 d="M6.66667 11.9993C6.84348 11.9993 7.01304 11.9291 7.13807 11.8041C7.26309 11.6791 7.33333 11.5095 7.33333 11.3327V7.33268C7.33333 7.15587 7.26309 6.9863 7.13807 6.86128C7.01304 6.73625 6.84348 6.66602 6.66667 6.66602C6.48985 6.66602 6.32029 6.73625 6.19526 6.86128C6.07024 6.9863 6 7.15587 6 7.33268V11.3327C6 11.5095 6.07024 11.6791 6.19526 11.8041C6.32029 11.9291 6.48985 11.9993 6.66667 11.9993Z"
    //                 fill="#1C1C1D"
    //               />
    //               <path
    //                 d="M9.33317 11.9993C9.50999 11.9993 9.67956 11.9291 9.80458 11.8041C9.92961 11.6791 9.99984 11.5095 9.99984 11.3327V7.33268C9.99984 7.15587 9.92961 6.9863 9.80458 6.86128C9.67956 6.73625 9.50999 6.66602 9.33317 6.66602C9.15636 6.66602 8.98679 6.73625 8.86177 6.86128C8.73674 6.9863 8.6665 7.15587 8.6665 7.33268V11.3327C8.6665 11.5095 8.73674 11.6791 8.86177 11.8041C8.98679 11.9291 9.15636 11.9993 9.33317 11.9993Z"
    //                 fill="#98A2B3"
    //               />
    //             </g>
    //             <defs>
    //               <clipPath id="clip0_2376_17148">
    //                 <rect width="16" height="16" fill="white" />
    //               </clipPath>
    //             </defs>
    //           </svg>
    //         </button>
    //       </Tooltip>
    //     </div>
    //   ),
    //   size: 20,
    // },
  ];

  const schoolsStudentsFilter = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters as any);
  }, [filters]) as any;

  const filterItems = [
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: schoolsStudentsFilter?.levels,
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: schoolsStudentsFilter?.sections,
    },
    {
      header: 'Concepto',
      watchKey: 'concepts',
      contents: schoolsStudentsFilter?.concepts,
    },
    {
      header: 'Beca asignada',
      watchKey: 'scholarships',
      contents: schoolsStudentsFilter?.scholarships,
    },
  ];

  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };
  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };

  const handleOpen = (row: DashboardStudentSearch) => {
    setStudentForDetail(row);
  };
  const totalStudentsAssigned = useMemo(
    () => studentsAssigned?.pages.flatMap((page) => page?.results ?? []).length || 0,
    [studentsAssigned]
  );
  return (
    <div className="bg-white">
      <div className="flex pt-4 pb-2 items-start px-10 sticky top-[175px] z-30 bg-white flex-col">
        <div className="flex items-center">
          <MultipleFilters
            filterItems={filterItems as any}
            handleFilter={handleFilter}
            onClearFilter={() => {
              setFormFilterData({});
            }}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
          />
          <div id="divider" className="h-8 w-px bg-[#E5E8EB] ml-4 mr-2" />
          <div>
            <GlobalSearch
              search={search}
              setSearch={setSearch}
              placeholder="Buscar estudiantes"
              typeButton="button"
              className="min-w-[400px]"
              variant="classic"
            />
          </div>
          <div className="ml-4">
            <SchoolCycleSelector selected={schoolCycle} setFn={setSchoolCycle} cycles={schoolCycles ?? []} />
          </div>
        </div>
      </div>
      <div className="sticky px-4 pb-2 mt-2 bg-white">
        <MultipleFiltersChips
          onChange={handleChangeChipFilter}
          formFilterData={formFilterData}
          itemsCount={itemsCount}
          setItemsCount={setItemsCount}
        />
      </div>
      <div>
        <TableVirtualized
          data={flatData || []}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage || false}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          isFetching={isFetching || isFetchingNextPage}
          columns={columns}
          totalCount={studentsAssigned?.pages.flatMap((page) => page?.results ?? []).length || 0}
          hideSum
          onRowClick={handleOpen}
          emptyStateText="No hay ningún estudiante asignado"
          emptyEndText="No hay más estudiantes asignados."
          totalFetched={totalStudentsAssigned}
          selectedRowsToHighlight={[]}
          onSortingChange={(sortingState) => {
            const text = convertToOrdering(sortingState);
            setSorting(text);
          }}
        />
        <Sheet
          open={!!studentForDetail}
          onOpenChange={(open) => {
            if (!open) closeScholarshipAssignmentDetail();
          }}
        >
          <Sheet.Content>
            <ScholarshipAssignmentDetailV2
              onClose={closeScholarshipAssignmentDetail}
              studentId={studentForDetail?.id as string}
              scholarshipId={scholarshipId}
            />
          </Sheet.Content>
        </Sheet>
      </div>
    </div>
  );
};

export default ScholarshipsStudentsTable;
