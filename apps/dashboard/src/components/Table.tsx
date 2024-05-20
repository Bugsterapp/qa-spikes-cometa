import {
  useReactTable,
  getCoreRowModel,
  getFacetedRowModel,
  flexRender,
  TableState,
  Row,
  PaginationState,
  OnChangeFn,
  ColumnDef,
  Updater,
  SortingState,
} from '@tanstack/react-table';
import React, { useRef } from 'react';
import cx from 'classnames';
import { cn } from '../utils/cn';

interface TableProps<Data> {
  data: Data[] | undefined;
  columns: ColumnDef<Data, any>[];
  state?: TableState;
  stickyColumns?: string[];
  hideColumns?: string[];
  selectedRowsToHighlight?: string[];
  onSortingChange?: (sorting: SortingState) => void;
  onRowClick?: (row: Row<Data>['original']) => void;
  totalCount: number;
  pagination?: PaginationState;
  setPagination?: OnChangeFn<PaginationState>;
  isLoading: boolean;
  isFetching: boolean;
  highlightId?: string;
  hideFooter?: boolean;
  maxHeight?: number;
  hideSum?: boolean;
  emptyStateText?: string;
  showEmptyStateImage?: boolean;
  studentsCount?: number;
  className?: string;
}

declare module '@tanstack/table-core' {
  // eslint-disable-next-line
  interface ColumnMeta<TData extends unknown, TValue> {
    numeric?: boolean;
  }
}

export const convertToOrdering = (sortingState: SortingState): string =>
  sortingState.map((obj) => (obj.desc ? `-${obj.id}` : obj.id)).join(',');

export const Table = <T extends Record<string, any>>({
  data = [],
  columns,
  state,
  stickyColumns,
  hideColumns = [],
  onRowClick,
  selectedRowsToHighlight,
  totalCount,
  onSortingChange,
  pagination,
  setPagination,
  isLoading,
  highlightId,
  hideSum,
  emptyStateText = 'No tenemos resultados',
  showEmptyStateImage = false,
  studentsCount,
  className,
  maxHeight = 550,
  isFetching,
}: TableProps<T>) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const handlePagination = (data: Updater<PaginationState>) => {
    if (setPagination) {
      setPagination(data);
    }
    tableRef.current?.scrollTo(0, 0);
  };
  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
      setSorting(newSorting);
      if (onSortingChange) {
        onSortingChange(newSorting);
        setPagination?.({ pageIndex: 0, pageSize: 50 });
      }
    },
    [onSortingChange, setSorting, sorting]
  );
  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 50,
        pageIndex: 0,
      },
    },
    state: {
      ...state,
      sorting,
      pagination,
      columnVisibility: hideColumns.reduce((o, key) => ({ ...o, [key]: false }), {}),
    },
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    pageCount: Math.ceil(totalCount / 50),
    manualPagination: true,
    onPaginationChange: handlePagination,
    onSortingChange: handleSortingChange,
    manualSorting: true,
    enableSorting: true,
    defaultColumn: {
      enableSorting: false,
    },
  });
  const isEmptyTable = table.getRowModel().rows.length === 0 && !isLoading;

  return (
    <div className="flex flex-col justify-between w-full h-full overflow-hidden bg-white relative">
      <div
        className={`h-[2px] bg-green transition-all duration-500 ease-linear animate-pulse ${
          isFetching ? 'w-full' : 'w-0'
        }`}
      />
      <div
        className={`max-h-[555px] scrollbar overflow-auto w-full ${
          isEmptyTable ? 'grid grid-cols-1 grid-rows-1' : 'overflow-auto'
        }`}
        style={{ height: `${maxHeight}px` }}
      >
        <table
          className={cn(
            `text-sm border-collapse table-auto relative`,
            { 'grid-area-1': isEmptyTable, 'opacity-50': isLoading, 'opacity-60': isFetching },
            className
          )}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[#FBFCFD] w-full">
                {headerGroup.headers.map((header, i) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      top: '0px',
                    }}
                    className={cn(
                      'whitespace-nowrap text-sm font-semibold py-4 text-[#637381] sticky bg-[#FBFCFD] min-w-[125px] z-10 pl-4',
                      {
                        'pl-12': i === 0,
                      }
                    )}
                  >
                    <div
                      className={cn('py-1', {
                        'pl-6 border-l-2 border-[#919EAB3D]': i !== 0,
                      })}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? `cursor-pointer select-none flex justify-between gap-3 items-center pr-4 ${
                                    header.column.columnDef.meta?.numeric && header.column.id ? 'justify-end' : ''
                                  }`
                                : 'flex',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M14.7585 8.23348L11.1752 4.65848C10.8629 4.34806 10.4405 4.17383 10.0002 4.17383C9.55986 4.17383 9.13744 4.34806 8.82517 4.65848L5.24184 8.23348C5.08663 8.38962 4.99951 8.60083 4.99951 8.82098C4.99951 9.04114 5.08663 9.25235 5.24184 9.40848C5.31931 9.48659 5.41148 9.54858 5.51302 9.59089C5.61457 9.6332 5.7235 9.65498 5.83351 9.65498C5.94352 9.65498 6.05244 9.6332 6.15399 9.59089C6.25554 9.54858 6.3477 9.48659 6.42517 9.40848L9.16684 6.66682V15.8335C9.16684 16.0545 9.25464 16.2665 9.41092 16.4227C9.5672 16.579 9.77916 16.6668 10.0002 16.6668C10.2212 16.6668 10.4331 16.579 10.5894 16.4227C10.7457 16.2665 10.8335 16.0545 10.8335 15.8335V6.66682L13.5752 9.40848C13.731 9.5654 13.9428 9.654 14.1639 9.65478C14.385 9.65556 14.5974 9.56846 14.7543 9.41265C14.9113 9.25683 14.9999 9.04507 15.0006 8.82393C15.0014 8.60279 14.9143 8.3904 14.7585 8.23348Z"
                                    fill="#637381"
                                  />
                                </svg>
                              ),
                              desc: (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M14.7585 10.5915C14.681 10.5134 14.5889 10.4514 14.4873 10.4091C14.3858 10.3668 14.2768 10.345 14.1668 10.345C14.0568 10.345 13.9479 10.3668 13.8464 10.4091C13.7448 10.4514 13.6526 10.5134 13.5752 10.5915L10.8335 13.3332V4.99984C10.8335 4.77882 10.7457 4.56686 10.5894 4.41058C10.4331 4.2543 10.2212 4.1665 10.0002 4.1665C9.77916 4.1665 9.5672 4.2543 9.41092 4.41058C9.25464 4.56686 9.16684 4.77882 9.16684 4.99984V13.3332L6.42517 10.5915C6.3477 10.5134 6.25554 10.4514 6.15399 10.4091C6.05244 10.3668 5.94352 10.345 5.83351 10.345C5.7235 10.345 5.61457 10.3668 5.51302 10.4091C5.41148 10.4514 5.31931 10.5134 5.24184 10.5915C5.08663 10.7476 4.99951 10.9588 4.99951 11.179C4.99951 11.3992 5.08663 11.6104 5.24184 11.7665L8.82517 15.3415C9.1363 15.6545 9.55886 15.8313 10.0002 15.8332C10.4386 15.8291 10.8578 15.6525 11.1668 15.3415L14.7502 11.7665C14.9065 11.6115 14.9951 11.4009 14.9967 11.1807C14.9982 10.9606 14.9126 10.7487 14.7585 10.5915Z"
                                    fill="#637381"
                                  />
                                </svg>
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                            {header.column.getCanSort() && !header.column.getIsSorted() && (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M5.24402 3.57766C5.40029 3.42144 5.61221 3.33367 5.83318 3.33367C6.05415 3.33367 6.26608 3.42144 6.42235 3.57766L9.75568 6.911C9.90748 7.06816 9.99148 7.27867 9.98958 7.49716C9.98768 7.71566 9.90004 7.92467 9.74553 8.07918C9.59103 8.23369 9.38202 8.32133 9.16352 8.32322C8.94502 8.32512 8.73452 8.24113 8.57735 8.08933L6.66652 6.1785V15.8335C6.66652 16.0545 6.57872 16.2665 6.42244 16.4228C6.26616 16.579 6.0542 16.6668 5.83318 16.6668C5.61217 16.6668 5.40021 16.579 5.24393 16.4228C5.08765 16.2665 4.99985 16.0545 4.99985 15.8335V6.1785L3.08902 8.08933C2.93185 8.24113 2.72135 8.32512 2.50285 8.32322C2.28435 8.32133 2.07534 8.23369 1.92084 8.07918C1.76633 7.92467 1.67869 7.71566 1.67679 7.49716C1.67489 7.27867 1.75889 7.06816 1.91068 6.911L5.24402 3.57766ZM13.3332 13.8218V4.16683C13.3332 3.94582 13.421 3.73385 13.5773 3.57757C13.7335 3.42129 13.9455 3.3335 14.1665 3.3335C14.3875 3.3335 14.5995 3.42129 14.7558 3.57757C14.9121 3.73385 14.9999 3.94582 14.9999 4.16683V13.8218L16.9107 11.911C17.0679 11.7592 17.2784 11.6752 17.4969 11.6771C17.7153 11.679 17.9244 11.7666 18.0789 11.9211C18.2334 12.0757 18.321 12.2847 18.3229 12.5032C18.3248 12.7217 18.2408 12.9322 18.089 13.0893L14.7557 16.4227C14.5994 16.5789 14.3875 16.6667 14.1665 16.6667C13.9455 16.6667 13.7336 16.5789 13.5774 16.4227L10.244 13.0893C10.0922 12.9322 10.0082 12.7217 10.0101 12.5032C10.012 12.2847 10.0997 12.0757 10.2542 11.9211C10.4087 11.7666 10.6177 11.679 10.8362 11.6771C11.0547 11.6752 11.2652 11.7592 11.4224 11.911L13.3332 13.8218Z"
                                  fill="#919EAB"
                                />
                              </svg>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cx({
                  'animate-background-color': 'id' in row.original && highlightId?.includes(String(row.original.id)),
                  'bg-[rgba(0,171,85,0.08)]':
                    'id' in row.original && selectedRowsToHighlight?.includes(String(row.original.id)),
                  'bg-white': !('id' in row.original) || !highlightId?.includes(String(row.original.id)),
                  'hover:bg-green/5 hover:cursor-pointer': true,
                })}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <td
                    key={cell.id}
                    className={cx('whitespace-nowrap py-6 text-sm text-secondary border-b border-[#E4EBF6]', {
                      'text-info font-semibold':
                        cell.column.id === 'scheduled_date' && row.original.status === 'SCHEDULED_STATUS',
                      'text-green font-semibold':
                        cell.column.id === 'scheduled_date' && row.original.status === 'APPROVED_STATUS',
                      'text-warning font-semibold':
                        cell.column.id === 'scheduled_date' && row.original.status === 'PROCESSING_STATUS',
                      'pl-12': i === 0,
                      'pl-10': i !== 0,
                      'text-right pr-6': cell.column.columnDef.meta?.numeric,
                      'sticky z-10': stickyColumns?.includes(cell.id.split('_')[1]),
                    })}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {!hideSum && (
            <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id} className="sticky bottom-0 bg-gray-200">
                  {footerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 text-sm font-normal text-right pl-7 whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
          {isEmptyTable && (
            <div className="absolute flex flex-col items-center justify-center w-full bg-white">
              {showEmptyStateImage && (
                <svg width="86" height="60" viewBox="0 0 86 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M82.2007 37.9923V28.8655C82.2007 19.7386 78.5499 16.0879 69.4231 16.0879H58.4709C49.3441 16.0879 45.6934 19.7386 45.6934 28.8655V39.8177C45.6934 48.9445 49.3441 52.5952 58.4709 52.5952H67.5977"
                    fill="url(#paint0_linear_12611_280)"
                  />
                  <path
                    d="M82.2007 37.9923V28.8655C82.2007 19.7386 78.5499 16.0879 69.4231 16.0879H58.4709C49.3441 16.0879 45.6934 19.7386 45.6934 28.8655V39.8177C45.6934 48.9445 49.3441 52.5952 58.4709 52.5952H67.5977"
                    stroke="url(#paint1_linear_12611_280)"
                    strokeWidth="4.18256"
                    strokeLinecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M82.2006 37.9923H74.8991C69.423 37.9923 67.5977 39.8177 67.5977 45.2938V52.5952L82.2006 37.9923Z"
                    fill="#FFC162"
                    stroke="#FFC162"
                    strokeWidth="4.18256"
                    strokeLinecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    opacity="0.4"
                    d="M54.8223 32.5171H65.7745"
                    stroke="white"
                    strokeWidth="4.18256"
                    strokeLinecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    opacity="0.4"
                    d="M54.8223 25.2139H62.1237"
                    stroke="white"
                    strokeWidth="4.18256"
                    strokeLinecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M69.6545 30.9002V19.864C69.6545 8.82786 65.24 4.41339 54.2038 4.41339H40.9604C29.9242 4.41339 25.5098 8.82786 25.5098 19.864V33.1075C25.5098 44.1436 29.9242 48.5581 40.9604 48.5581H51.9966"
                    fill="url(#paint2_linear_12611_280)"
                  />
                  <path
                    d="M69.6545 30.9002V19.864C69.6545 8.82786 65.24 4.41339 54.2038 4.41339H40.9604C29.9242 4.41339 25.5098 8.82786 25.5098 19.864V33.1075C25.5098 44.1436 29.9242 48.5581 40.9604 48.5581H51.9966"
                    stroke="url(#paint3_linear_12611_280)"
                    strokeWidth="5.05756"
                    strokeLinecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M69.654 30.9002H60.825C54.2033 30.9002 51.9961 33.1075 51.9961 39.7292V48.5581L69.654 30.9002Z"
                    fill="#FFC162"
                    stroke="#FFC162"
                    strokeWidth="5.05756"
                    strokeLinecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    opacity="0.4"
                    d="M36.5469 24.2798H49.7903"
                    stroke="white"
                    strokeWidth="5.05756"
                    strokeLinecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    opacity="0.4"
                    d="M36.5469 15.4492H45.3758"
                    stroke="white"
                    strokeWidth="5.05756"
                    strokeLinecap="round"
                    stroke-linejoin="round"
                  />
                  <mask id="path-11-inside-1_12611_280" fill="white">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19.9683 36.5519C16.1914 32.6726 13.865 27.3742 13.865 21.5323C13.865 9.64036 23.5054 0 35.3973 0C47.2893 0 56.9297 9.64036 56.9297 21.5323C56.9297 33.4243 47.2893 43.0647 35.3973 43.0647C31.1491 43.0647 27.1883 41.8344 23.8516 39.7108C23.7905 39.8034 23.7227 39.8931 23.648 39.9791L7.50091 58.5583C5.90711 60.3922 3.0928 60.4906 1.37477 58.7726C-0.338863 57.059 -0.246002 54.2533 1.5772 52.6568L19.9683 36.5519ZM35.3973 37.8325C44.3997 37.8325 51.6975 30.5347 51.6975 21.5323C51.6975 12.53 44.3997 5.23216 35.3973 5.23216C26.395 5.23216 19.0972 12.53 19.0972 21.5323C19.0972 30.5347 26.395 37.8325 35.3973 37.8325Z"
                    />
                  </mask>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19.9683 36.5519C16.1914 32.6726 13.865 27.3742 13.865 21.5323C13.865 9.64036 23.5054 0 35.3973 0C47.2893 0 56.9297 9.64036 56.9297 21.5323C56.9297 33.4243 47.2893 43.0647 35.3973 43.0647C31.1491 43.0647 27.1883 41.8344 23.8516 39.7108C23.7905 39.8034 23.7227 39.8931 23.648 39.9791L7.50091 58.5583C5.90711 60.3922 3.0928 60.4906 1.37477 58.7726C-0.338863 57.059 -0.246002 54.2533 1.5772 52.6568L19.9683 36.5519ZM35.3973 37.8325C44.3997 37.8325 51.6975 30.5347 51.6975 21.5323C51.6975 12.53 44.3997 5.23216 35.3973 5.23216C26.395 5.23216 19.0972 12.53 19.0972 21.5323C19.0972 30.5347 26.395 37.8325 35.3973 37.8325Z"
                    fill="#B78103"
                  />
                  <path
                    d="M19.9683 36.5519L20.5516 35.9839L21.1504 36.5989L20.5046 37.1644L19.9683 36.5519ZM23.8516 39.7108L23.1717 39.2629L23.6125 38.5935L24.2887 39.0239L23.8516 39.7108ZM23.648 39.9791L24.2625 40.5131L24.2625 40.5131L23.648 39.9791ZM7.50091 58.5583L8.11543 59.0924L7.50091 58.5583ZM1.5772 52.6568L1.04083 52.0443L1.5772 52.6568ZM14.6792 21.5323C14.6792 27.1536 16.9167 32.2506 20.5516 35.9839L19.3849 37.1198C15.466 33.0947 13.0508 27.5948 13.0508 21.5323H14.6792ZM35.3973 0.814163C23.955 0.814163 14.6792 10.09 14.6792 21.5323H13.0508C13.0508 9.19071 23.0557 -0.814163 35.3973 -0.814163V0.814163ZM56.1155 21.5323C56.1155 10.09 46.8397 0.814163 35.3973 0.814163V-0.814163C47.739 -0.814163 57.7439 9.19071 57.7439 21.5323H56.1155ZM35.3973 42.2505C46.8397 42.2505 56.1155 32.9747 56.1155 21.5323H57.7439C57.7439 33.874 47.739 43.8789 35.3973 43.8789V42.2505ZM24.2887 39.0239C27.4987 41.0669 31.3085 42.2505 35.3973 42.2505V43.8789C30.9897 43.8789 26.8779 42.602 23.4144 40.3976L24.2887 39.0239ZM23.0334 39.445C23.0844 39.3864 23.1304 39.3255 23.1717 39.2629L24.5315 40.1586C24.4507 40.2813 24.361 40.3998 24.2625 40.5131L23.0334 39.445ZM6.88639 58.0243L23.0334 39.445L24.2625 40.5131L8.11543 59.0924L6.88639 58.0243ZM1.95047 58.1969C3.33471 59.5811 5.60225 59.5018 6.88639 58.0243L8.11543 59.0924C6.21198 61.2826 2.85089 61.4001 0.799068 59.3483L1.95047 58.1969ZM2.11357 53.2693C0.644588 54.5557 0.569767 56.8162 1.95047 58.1969L0.799068 59.3483C-1.24749 57.3017 -1.13659 53.951 1.04083 52.0443L2.11357 53.2693ZM20.5046 37.1644L2.11357 53.2693L1.04083 52.0443L19.4319 35.9393L20.5046 37.1644ZM52.5117 21.5323C52.5117 30.9843 44.8493 38.6467 35.3973 38.6467V37.0184C43.95 37.0184 50.8834 30.085 50.8834 21.5323H52.5117ZM35.3973 4.418C44.8493 4.418 52.5117 12.0804 52.5117 21.5323H50.8834C50.8834 12.9797 43.95 6.04632 35.3973 6.04632V4.418ZM18.283 21.5323C18.283 12.0804 25.9453 4.418 35.3973 4.418V6.04632C26.8446 6.04632 19.9113 12.9797 19.9113 21.5323H18.283ZM35.3973 38.6467C25.9453 38.6467 18.283 30.9843 18.283 21.5323H19.9113C19.9113 30.085 26.8446 37.0184 35.3973 37.0184V38.6467Z"
                    fill="white"
                    mask="url(#path-11-inside-1_12611_280)"
                  />
                  <path
                    d="M35.398 7.89508C37.1889 7.89508 38.9622 8.24781 40.6167 8.93314C42.2713 9.61847 43.7746 10.623 45.0409 11.8893C46.3073 13.1556 47.3118 14.659 47.9971 16.3135C48.6824 17.9681 49.0352 19.7414 49.0352 21.5322"
                    stroke="#FFF7CD"
                    strokeWidth="1.05139"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_12611_280"
                      x1="96.3765"
                      y1="89.1112"
                      x2="20.7847"
                      y2="45.3005"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FFB84D" />
                      <stop offset="1" stop-color="#FFE4BB" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_12611_280"
                      x1="96.3765"
                      y1="89.1112"
                      x2="20.7847"
                      y2="45.3005"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FFB84D" />
                      <stop offset="1" stop-color="#FFE4BB" />
                    </linearGradient>
                    <linearGradient
                      id="paint2_linear_12611_280"
                      x1="86.7959"
                      y1="92.7134"
                      x2="-4.60985"
                      y2="39.7373"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FFB84D" />
                      <stop offset="1" stop-color="#FFE4BB" />
                    </linearGradient>
                    <linearGradient
                      id="paint3_linear_12611_280"
                      x1="86.7959"
                      y1="92.7134"
                      x2="-4.60985"
                      y2="39.7373"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FFB84D" />
                      <stop offset="1" stop-color="#FFE4BB" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
              <p className={`text-[#919EAB] ${showEmptyStateImage ? 'text-xs' : 'text-sm'}`}>{emptyStateText}</p>
            </div>
          )}
        </table>
        {isLoading && (
          <div className="absolute top-0 left-0 flex items-center justify-center w-full h-[90%] z-50">
            <img src="/assets/loading.svg" alt="loading" data-state="show" className="mx-auto" />
          </div>
        )}
      </div>
      {!isEmptyTable && table.getState()?.pagination && 'pageIndex' in table.getState()?.pagination ? (
        <div className="sticky bottom-0 left-0 flex items-center justify-end gap-6 py-2 bg-white rounded-3xl">
          {studentsCount ? (
            <div className="absolute flex items-center gap-1 left-12">
              <span className="font-semibold" data-testid="studentsCountFooter-span">
                {studentsCount}
              </span>
              <span className="text-sm">Total alumnos</span>
            </div>
          ) : null}
          <span className="flex items-center gap-1 text-sm">
            Ir a la página:
            <input
              type="number"
              defaultValue={table.getState().pagination?.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="w-12 p-2 text-sm border border-gray-200 rounded-xl focus:outline-1 outline-gray-300"
            />
          </span>
          <span className="flex items-center gap-1 text-sm min-w-[80px]" data-testid="pageCounterTxt-span">
            {table.getState().pagination?.pageIndex + 1} de {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-2 pr-4">
            <button
              className="flex p-1 px-3 bg-white rounded-full hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.52473 11.8333C5.27257 11.8341 5.03359 11.7207 4.87473 11.5249L0.849729 6.52492C0.596965 6.21742 0.596965 5.77409 0.849729 5.46659L5.0164 0.46659C5.31095 0.112207 5.83701 0.0637047 6.1914 0.358257C6.54578 0.652808 6.59428 1.17887 6.29973 1.53326L2.57473 5.99992L6.17473 10.4666C6.38281 10.7164 6.42664 11.0643 6.28702 11.3579C6.14739 11.6515 5.84979 11.8371 5.52473 11.8333Z"
                  fill="#212B36"
                  fillOpacity="0.8"
                />
              </svg>
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.52473 11.8333C5.27257 11.8341 5.03359 11.7207 4.87473 11.5249L0.849729 6.52492C0.596965 6.21742 0.596965 5.77409 0.849729 5.46659L5.0164 0.46659C5.31095 0.112207 5.83701 0.0637047 6.1914 0.358257C6.54578 0.652808 6.59428 1.17887 6.29973 1.53326L2.57473 5.99992L6.17473 10.4666C6.38281 10.7164 6.42664 11.0643 6.28702 11.3579C6.14739 11.6515 5.84979 11.8371 5.52473 11.8333Z"
                  fill="#212B36"
                  fillOpacity="0.8"
                />
              </svg>
            </button>
            <button
              className="px-4 py-2 bg-white rounded-full hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.52473 11.8333C5.27257 11.8341 5.03359 11.7207 4.87473 11.5249L0.849729 6.52492C0.596965 6.21742 0.596965 5.77409 0.849729 5.46659L5.0164 0.46659C5.31095 0.112207 5.83701 0.0637047 6.1914 0.358257C6.54578 0.652808 6.59428 1.17887 6.29973 1.53326L2.57473 5.99992L6.17473 10.4666C6.38281 10.7164 6.42664 11.0643 6.28702 11.3579C6.14739 11.6515 5.84979 11.8371 5.52473 11.8333Z"
                  fill="#212B36"
                  fillOpacity="0.8"
                />
              </svg>
            </button>
            <button
              className="px-3 py-2 bg-white rounded-full hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.33285 11.8331C1.13814 11.8335 0.949443 11.7657 0.799516 11.6415C0.629094 11.5002 0.521893 11.2969 0.501569 11.0764C0.481245 10.856 0.549467 10.6365 0.691183 10.4665L4.42452 5.99979L0.824516 1.52479C0.684707 1.35263 0.619292 1.13184 0.642753 0.911306C0.666214 0.690771 0.776616 0.488686 0.949516 0.349791C1.12382 0.196425 1.35421 0.122728 1.58516 0.146457C1.81612 0.170185 2.0267 0.289187 2.16618 0.474791L6.19118 5.47479C6.44395 5.78229 6.44395 6.22562 6.19118 6.53312L2.02452 11.5331C1.85496 11.7377 1.59805 11.8491 1.33285 11.8331Z"
                  fill="#212B36"
                />
              </svg>
            </button>
            <button
              className="flex p-2 px-3 bg-white rounded-full hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.33285 11.8331C1.13814 11.8335 0.949443 11.7657 0.799516 11.6415C0.629094 11.5002 0.521893 11.2969 0.501569 11.0764C0.481245 10.856 0.549467 10.6365 0.691183 10.4665L4.42452 5.99979L0.824516 1.52479C0.684707 1.35263 0.619292 1.13184 0.642753 0.911306C0.666214 0.690771 0.776616 0.488686 0.949516 0.349791C1.12382 0.196425 1.35421 0.122728 1.58516 0.146457C1.81612 0.170185 2.0267 0.289187 2.16618 0.474791L6.19118 5.47479C6.44395 5.78229 6.44395 6.22562 6.19118 6.53312L2.02452 11.5331C1.85496 11.7377 1.59805 11.8491 1.33285 11.8331Z"
                  fill="#212B36"
                />
              </svg>
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.33285 11.8331C1.13814 11.8335 0.949443 11.7657 0.799516 11.6415C0.629094 11.5002 0.521893 11.2969 0.501569 11.0764C0.481245 10.856 0.549467 10.6365 0.691183 10.4665L4.42452 5.99979L0.824516 1.52479C0.684707 1.35263 0.619292 1.13184 0.642753 0.911306C0.666214 0.690771 0.776616 0.488686 0.949516 0.349791C1.12382 0.196425 1.35421 0.122728 1.58516 0.146457C1.81612 0.170185 2.0267 0.289187 2.16618 0.474791L6.19118 5.47479C6.44395 5.78229 6.44395 6.22562 6.19118 6.53312L2.02452 11.5331C1.85496 11.7377 1.59805 11.8491 1.33285 11.8331Z"
                  fill="#212B36"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Table;
