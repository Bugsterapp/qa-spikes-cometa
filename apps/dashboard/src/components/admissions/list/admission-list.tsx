import { cn } from '@cometa/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useState, useRef, useMemo } from 'react';
import { convertToOrdering } from '/src/components/Table';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import IcPlus from '/public/assets/icons/ic_plus.svg';

export function AdmissionsList({
  clearFilters,
  hasFilters,
  search,
  params,
  setShowForm,
  columns,
}: {
  clearFilters: () => void;
  hasFilters: boolean;
  search: string;
  params: Record<string, boolean | string[]>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  columns: ColumnDef<any, any>[];
}) {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const [sorting, setSorting] = useState<string>();
  const [headerVisible, setHeaderVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isFetching,
    isPending: isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.admissions.getAdmissions.useInfiniteQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        search,
        sorting,
        ...params,
      },
    },
    {
      enabled: !!selectedSchool?.id,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 15,
      getNextPageParam: (lastPage) => {
        if (!lastPage) return undefined;
        const { page_number, total_pages } = lastPage;
        return page_number < total_pages ? String(page_number + 1) : undefined;
      },
      retry: false,
    }
  );

  const admissions = useMemo(() => data?.pages.flatMap((page) => page?.results ?? []), [data]);
  const totalCount = useMemo(() => data?.pages[0]?.total_records || 0, [data]);

  const noAdmissions = totalCount === 0;
  const hasSearch = search.trim().length > 0;

  const noResults = noAdmissions && !hasSearch && !hasFilters;
  const noResultsWithFilters = noAdmissions && (hasSearch || hasFilters);

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
        <div className="w-[350px] flex flex-col gap-2">
          <span className="font-bold text-xl">¡Aún no tienes prospectos creados!</span>
          <span>Comparte tu formulario de admisión o crea un nuevo prospecto por tu cuenta.</span>

          <button
            className="bg-white text-[#00AB55] border-[#00AB55] hover:cursor-pointer font-bold text-sm flex items-center cursor-pointer whitespace-nowrap outline-none rounded-lg px-4 py-2 max-h-[45px]"
            onClick={() => setShowForm(true)}
          >
            <IcPlus fill="currentColor" />
            <label className="ml-1 hover:cursor-pointer">Nuevo prospecto</label>
          </button>
        </div>
      </div>
    );
  }

  if (noResultsWithFilters) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-372px)] flex-col">
        <div className="w-[350px] flex flex-col gap-2">
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

  const studentPath = (externalId: string) => `/students/${externalId}?prev=/admissions`;
  const admissionPath = (admissionId: string) => `/admissions/${admissionId}`;

  return (
    <div ref={wrapperRef} className={cn('w-full transition-opacity duration-300 pb-28 pt-28', { 'pt-36': hasFilters })}>
      <TableVirtualized
        data={admissions}
        columns={columns}
        onRowClick={({ external_id, status, id }) =>
          router.push(status === 'admitted' ? studentPath(external_id) : admissionPath(id))
        }
        onSortingChange={(sorting) => setSorting(convertToOrdering(sorting))}
        maxHeight={wrapperRef?.current?.offsetHeight || 500}
        totalCount={totalCount}
        totalFetched={totalCount}
        isLoading={isLoading}
        isFetching={isFetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage || false}
        isFetchingNextPage={isFetchingNextPage}
        setHeaderVisible={setHeaderVisible}
        headerVisible={headerVisible}
        tableLayout="auto"
        addMorePaddingFirstRow
        useWindowScroll
        hideSum
      />

      <div className="fixed flex w-full items-center bg-white gap-1 bottom-0 text-gray-600 px-8 py-5 z-10">
        <span className="font-semibold">{totalCount}</span> prospectos
      </div>
    </div>
  );
}
