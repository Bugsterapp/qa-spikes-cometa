import { useRouter } from 'next/router';

import { useMemo, useRef, useState } from 'react';
import IcPlus from '/public/assets/icons/ic_plus.svg';

import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import { BaseConcept } from '@cometa/trpc';
import { cn } from '@cometa/utils';
import { Header } from '@radix-ui/react-accordion';
import { createColumnHelper } from '@tanstack/react-table';
import { Button } from 'react-day-picker';
import { UseFormReturn } from 'react-hook-form';
import { GlobalSearch } from '../../atoms/GlobalSearch';
import MultipleFilters, {
  formFilterDataToParams,
  normalizeFilters,
  TooltipIcon,
  MultipleFiltersChips,
} from '../../MultipleFilters';
import { TableVirtualized } from '../../TableInfinityScroll';
import useGetActiveSchoolCycleElement from '/src/hooks/useActiveSchoolCycle';
import { api } from '/src/utils/api';
import { renderMoney } from '/src/utils/datagridHeaders';
import { extractPageFromURL } from '/src/utils/object-util';
import useDebounce from '/src/hooks/useDebounce';
export function ConceptsTable({
  handleOpenConceptsCreation,
}: {
  handleOpenConceptsCreation: () => void;
  showOnlyAFewElements?: boolean;
}) {
  const selectedSchool = useSelectedSchool();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const permissions = useGetPermissions();
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  type FormFilterData = Record<string, { checked: boolean; name: string }>;
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const params = {
    multiple_search: searchDebounced,
    ...paramsFromForm,
  };
  const { data: filters } = api.schools.schoolsConceptsFilters.useQuery({ school_id: selectedSchool?.id as string });
  const schoolsConceptFilter = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);

  const filterItems = [
    {
      header: (
        <TooltipIcon message="Filtra los conceptos que pertenezcan al ciclo escolar de tu elección">
          Ciclo escolar
        </TooltipIcon>
      ),
      watchKey: 'school_cycles',
      contents: schoolsConceptFilter?.school_cycles.sort((a, b) => b.name.localeCompare(a.name)),
    },
    {
      header: 'Tipo de concepto',
      watchKey: 'type',
      contents: schoolsConceptFilter?.type,
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
  const handleOpen = (row: Record<string, any>) => {
    router.push(`/concepts/${row.id}`);
  };

  const {
    data: conceptsTable,
    isPending: isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.schools.schoolsConceptsList.useInfiniteQuery(
    {
      school_id: selectedSchool?.id as string,
      page_size: 50,
      ...params,
    },
    {
      enabled: !!selectedSchool?.id,
      refetchOnWindowFocus: false,
      getNextPageParam: (currentPage) => extractPageFromURL((currentPage as any)?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => extractPageFromURL((firstPage as any)?.previous as string) ?? undefined,
    }
  );
  const flatData = useMemo(() => conceptsTable?.pages.flatMap((page: any) => page?.results ?? []), [conceptsTable]);
  const totalCount = useMemo(() => (conceptsTable as any)?.pages[0]?.count || 0, [conceptsTable]);
  const columnHelper = createColumnHelper<BaseConcept>();
  const { data: categories } = api.schools.schoolsConceptsFilters.useQuery({ school_id: selectedSchool?.id as string });

  const columns = [
    columnHelper.accessor('name', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate whitespace-break-spaces">{info.getValue()}</span>
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Nombre</span>,
      size: 250,
    }),
    // @ts-ignore
    columnHelper.accessor('school_cycle.name', {
      cell: (info) => <div className="text-sm font-normal">{info.getValue() as string}</div>,
      header: () => <span className="whitespace-nowrap">Ciclo escolar</span>,
    }),
    columnHelper.accessor('type', {
      cell: (info) => (
        <div className="text-sm font-normal">
          {categories?.type.find((category) => category.id === info.getValue())?.name}
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Tipo de concepto</span>,
    }),
    columnHelper.accessor('last_order_price', {
      cell: (info) => (
        <div className={cn('text-sm', { 'font-semibold': info.row.original.unique_price })}>
          {info.row.original.unique_price ? renderMoney(info.getValue()) : 'Múltiples precios'}
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Precio</span>,
      meta: {
        numeric: true,
      },
    }),
    columnHelper.accessor('students_assigned_count', {
      cell: (info) => <div className="text-sm font-normal">{info.getValue()}</div>,
      header: () => <span className="whitespace-nowrap">Estudiantes asignados</span>,
    }),
  ];

  const schoolCycleChip = useGetActiveSchoolCycleElement;
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full">
      <div>
        <div className="flex flex-row items-center justify-between pb-3">
          <div>
            <div className="ml-10">
              <Header title="Conceptos" />
              <div className="flex items-center gap-2">
                <MultipleFilters
                  filterItems={filterItems}
                  handleFilter={handleFilter}
                  onClearFilter={() => {
                    setFormFilterData({});
                  }}
                  itemsCount={itemsCount}
                  setItemsCount={setItemsCount}
                  postFixElement={schoolCycleChip}
                />
                <GlobalSearch
                  search={search}
                  setSearch={setSearch}
                  placeholder="Buscar conceptos"
                  typeButton="button"
                />
              </div>
            </div>
            <div className="px-4">
              <MultipleFiltersChips
                onChange={handleChangeChipFilter}
                formFilterData={formFilterData}
                itemsCount={itemsCount}
                setItemsCount={setItemsCount}
              />
            </div>
          </div>
          {permissions?.can_add_concept && (
            <div className="mr-20">
              <Button onClick={handleOpenConceptsCreation} className="max-w-[300px]" data-testid="createConcept-button">
                <IcPlus fill="currentColor" />
                Nuevo concepto
              </Button>
            </div>
          )}
        </div>
      </div>
      <div
        ref={wrapperRef}
        className={cn(
          'h-[calc(100vh-190px)]',
          { 'cursor-wait ': isLoading || isFetching },
          'transition-opacity duration-300'
        )}
      >
        <TableVirtualized
          data={flatData || []}
          columns={columns as any[]}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage || false}
          fetchNextPage={fetchNextPage}
          onRowClick={handleOpen}
          maxHeight={wrapperRef?.current?.offsetHeight || 500}
          totalCount={totalCount || 0}
          totalFetched={flatData?.length || 0}
          isLoading={isLoading}
          isFetching={isFetching}
          hideSum
          addMorePaddingFirstRow
          showEmptyStateImage
          emptyEndText="No hay más conceptos para mostrar"
          emptyStateText="No hay conceptos para mostrar"
        />
      </div>
    </div>
  );
}
