import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ColumnDef } from '@tanstack/react-table';
import { api } from '/src/utils/api';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { convertToOrdering } from '../Table';
import { cn } from '@cometa/utils/src/cn';
import { TableVirtualized } from '../TableInfinityScroll';
import { GroupOption } from './GroupAction';
import { InscriptionGroup, InscriptionsGroup } from './InscriptionsGroup';
import { InscriptionType } from './InscriptionTypeFilter';
import { GetInscriptionsFilterParams } from '/src/server/api/routers/students';
import { InscriptionEntity } from '@cometa/trpc/src/students/types-mapping';

export function InscriptionsList({
  schoolCycle,
  clearFilters,
  hasFilters,
  search,
  params,
  columns,
  groupBy,
  inscriptionType,
  onFiltersChange,
  selectedInscriptions,
  selectedInscriptionIds,
  onUpdateSelections,
}: {
  schoolCycle: SchoolCycleEntity | null | undefined;
  clearFilters: () => void;
  hasFilters: boolean;
  search: string;
  params: Record<string, boolean | string[]>;
  columns: ColumnDef<any, any>[];
  groupBy: GroupOption;
  inscriptionType: InscriptionType;
  onFiltersChange: (filters: GetInscriptionsFilterParams) => void;
  selectedInscriptions?: InscriptionEntity[];
  selectedInscriptionIds?: string[];
  onUpdateSelections?: (inscriptions: InscriptionEntity[]) => void;
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState<string>();

  const isAssignedParams = params.is_assigned as string[];
  const isAssigned = isAssignedParams?.length > 0 ? isAssignedParams[0] === 'True' : undefined;

  const isDataCompletedParams = params.is_data_completed as string[];
  const isDataCompleted = isDataCompletedParams?.length > 0 ? isDataCompletedParams[0] === 'True' : undefined;

  const areConsenmentsCompletedParams = params.are_consentments_completed as string[];
  const areConsenmentsCompleted =
    areConsenmentsCompletedParams?.length > 0 ? areConsenmentsCompletedParams[0] === 'True' : undefined;

  const filters = useMemo(
    () => ({
      school_cycle_id: schoolCycle?.id as string,
      ...params,
      is_assigned: isAssigned,
      is_data_completed: isDataCompleted,
      are_consentments_completed: areConsenmentsCompleted,
      search: search ? search.trim() : undefined,
      order_by: sorting || undefined,
      group_by: groupBy || undefined,
      tab: inscriptionType || undefined,
    }),
    [
      schoolCycle?.id,
      params,
      isAssigned,
      isDataCompleted,
      areConsenmentsCompleted,
      search,
      sorting,
      groupBy,
      inscriptionType,
    ]
  );

  const {
    data,
    isFetching,
    isPending: isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.students.getInscriptions.useInfiniteQuery(filters, {
    enabled: !!schoolCycle?.id,
    staleTime: 1000 * 15,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return;
      const { page_number, total_pages } = lastPage;
      if (typeof page_number !== 'number' || typeof total_pages !== 'number') return;
      if (isNaN(page_number) || isNaN(total_pages)) return;
      return page_number < total_pages ? String(page_number + 1) : undefined;
    },
    retry: false,
  });

  useEffect(() => {
    onFiltersChange(filters);
  }, [onFiltersChange, filters]);

  const inscriptions = useMemo(() => data?.pages.flatMap((page) => page?.results ?? []), [data]);
  const totalCount = useMemo(() => (data?.pages[0]?.total_records as number) || 0, [data]);

  useEffect(() => {
    if (!selectedInscriptionIds?.length || !inscriptions || !onUpdateSelections) return;

    const visibleSelections = inscriptions.filter((inscription) =>
      selectedInscriptionIds.includes(inscription.id as string)
    );

    if (!selectedInscriptions?.length) {
      onUpdateSelections(visibleSelections);
      return;
    }

    const existingMap = new Map(selectedInscriptions.map((item) => [item.id, item]));

    visibleSelections.forEach((item) => existingMap.set(item.id as string, item));

    const preserved = Array.from(existingMap.values()).filter((item) =>
      selectedInscriptionIds.includes(item.id as string)
    );

    onUpdateSelections(preserved);
  }, [inscriptions, selectedInscriptionIds]);

  const noInscriptions = totalCount === 0;
  const hasSearch = search.trim().length > 0;

  const noResults = noInscriptions && !hasSearch && !hasFilters;
  const noResultsWithFilters = noInscriptions && (hasSearch || hasFilters);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center px-4 py-2 bg-white border-t border-gray-200 w-[calc(100vw-255px) h-[95vh]">
        <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
      </div>
    );
  }

  if (noResults) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
        <div className="w-96 flex flex-col gap-2">
          <span>Aún no hay inscripciones</span>
        </div>
      </div>
    );
  }

  if (noResultsWithFilters) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-372px)] flex-col">
        <div className="w-96 flex flex-col gap-2">
          <span className="font-bold text-xl">No hemos encontrado resultados</span>
          <span>Prueba cambiando los filtros que has ingresado para hacer una nueva búsqueda.</span>

          {!hasSearch ? (
            <button className="flex text-green items-center gap-2" onClick={clearFilters}>
              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13.7379 4.76274C12.5154 3.54024 10.7829 2.83524 8.87794 3.03024C6.12544 3.30774 3.86044 5.54274 3.55294 8.29524C3.14044 11.9327 5.95294 15.0002 9.50044 15.0002C11.8929 15.0002 13.9479 13.5977 14.9079 11.5802C15.1479 11.0777 14.7879 10.5002 14.2329 10.5002C13.9554 10.5002 13.6929 10.6502 13.5729 10.8977C12.7254 12.7202 10.6929 13.8752 8.47294 13.3802C6.80794 13.0127 5.46544 11.6552 5.11294 9.99024C4.48294 7.08024 6.69544 4.50024 9.50044 4.50024C10.7454 4.50024 11.8554 5.01774 12.6654 5.83524L11.5329 6.96774C11.0604 7.44024 11.3904 8.25024 12.0579 8.25024H14.7504C15.1629 8.25024 15.5004 7.91274 15.5004 7.50024V4.80774C15.5004 4.14024 14.6904 3.80274 14.2179 4.27524L13.7379 4.76274Z"
                  fill="#00AB55"
                />
              </svg>
              <span className="font-bold">Limpiar filtros</span>
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  const studentPath = (studentId: string) => `/students/${studentId}?prev=/inscriptions`;

  return (
    <div className={cn('pb-20 overflow-x-auto', { 'pt-5': hasFilters, 'pb-16': groupBy })}>
      {groupBy ? (
        <InscriptionsGroup groups={inscriptions as InscriptionGroup[]} totalCount={totalCount} columns={columns} />
      ) : (
        <TableVirtualized
          data={inscriptions}
          columns={columns}
          onRowClick={(row) => router.push(studentPath(row.student.id))}
          onSortingChange={(sorting) => {
            const ordering = convertToOrdering(sorting);
            const orderingWithoutPrefix = ordering.replace('student_', '');
            setSorting(orderingWithoutPrefix);
          }}
          totalCount={totalCount}
          totalFetched={totalCount}
          isLoading={isLoading}
          isFetching={isFetching}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage || false}
          isFetchingNextPage={isFetchingNextPage}
          addMorePaddingFirstRow
          useWindowScroll
          selectedRowsToHighlight={selectedInscriptions
            ?.map((inscription) => inscription.id)
            .filter((id): id is string => id != null)}
        />
      )}

      <div className="fixed flex w-full items-center bg-white gap-1 bottom-0 text-gray-600 px-8 py-5 z-10 shadow-[0px_0px_2px_0px_rgba(145,158,171,0.20),_0px_-12px_24px_-4px_rgba(145,158,171,0.12)]">
        <span className="font-semibold">{totalCount}</span> estudiantes
      </div>
    </div>
  );
}
