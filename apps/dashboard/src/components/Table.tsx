import {
  useReactTable,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  flexRender,
  TableState,
  Row,
  PaginationState,
  OnChangeFn,
  ColumnDef,
  Updater,
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
  onRowClick?: (row: Row<Data>['original']) => void;
  totalCount: number;
  pagination?: PaginationState;
  setPagination?: OnChangeFn<PaginationState>;
  isLoading: boolean;
  highlightId?: string;
  hideFooter?: boolean;
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

export const Table = <T extends Record<string, any>>({
  data = [],
  columns,
  state,
  stickyColumns,
  hideColumns = [],
  onRowClick,
  totalCount,
  pagination,
  setPagination,
  isLoading,
  highlightId,
  hideSum,
  emptyStateText = 'No tenemos resultados',
  showEmptyStateImage = false,
  studentsCount,
  className,
}: TableProps<T>) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const handlePagination = (data: Updater<PaginationState>) => {
    if (setPagination) {
      setPagination(data);
    }
    tableRef.current?.scrollTo(0, 0);
  };
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
      pagination,
      columnVisibility: hideColumns.reduce((o, key) => ({ ...o, [key]: false }), {}),
    },
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    pageCount: Math.ceil(totalCount / 50),
    manualPagination: true,
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
    onPaginationChange: handlePagination,
  });
  const isEmptyTable = table.getRowModel().rows.length === 0 && !isLoading;
  return (
    <div className="flex flex-col justify-between w-full h-full overflow-hidden bg-white">
      <div
        className={`max-h-[555px] min-h-[555px] scrollbar ${
          isEmptyTable ? 'grid grid-cols-1 grid-rows-1 overflow-hidden' : 'overflow-auto'
        }`}
      >
        <table
          className={cn(`text-sm border-collapse table-auto relative`, { 'grid-area-1': isEmptyTable }, className)}
        >
          <thead className="bg-gray-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-200">
                {headerGroup.headers.map((header, i) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      top: '0px',
                    }}
                    className={`font-semibold  ${
                      i === 0 ? 'pl-12' : 'pl-10'
                    } py-4 text-gray-600 sticky bg-gray-200 min-w-[125px] z-10 whitespace-nowrap`}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? `cursor-pointer select-none flex gap-1 items-end`
                              : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      </>
                    )}
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
                  'animate-background-color': 'id' in row.original && String(row.original.id) === highlightId,
                  'bg-white': !('id' in row.original) || String(row.original.id) !== highlightId,
                  'hover:bg-gray-50 hover:shadow-inner hover:cursor-pointer': true,
                })}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <td
                    key={cell.id}
                    className={cx('whitespace-nowrap py-4 text-sm text-secondary', {
                      'text-info font-semibold':
                        cell.column.id === 'scheduled_date' && row.original.status === 'SCHEDULED_STATUS',
                      'text-green font-semibold':
                        cell.column.id === 'scheduled_date' && row.original.status === 'APPROVED_STATUS',
                      'text-warning font-semibold':
                        cell.column.id === 'scheduled_date' && row.original.status === 'PROCESSING_STATUS',
                      'pl-12': i === 0,
                      'pl-10': i !== 0,
                      'text-right': cell.column.columnDef.meta?.numeric,
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
                    stroke-width="4.18256"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M82.2006 37.9923H74.8991C69.423 37.9923 67.5977 39.8177 67.5977 45.2938V52.5952L82.2006 37.9923Z"
                    fill="#FFC162"
                    stroke="#FFC162"
                    stroke-width="4.18256"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    opacity="0.4"
                    d="M54.8223 32.5171H65.7745"
                    stroke="white"
                    stroke-width="4.18256"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    opacity="0.4"
                    d="M54.8223 25.2139H62.1237"
                    stroke="white"
                    stroke-width="4.18256"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M69.6545 30.9002V19.864C69.6545 8.82786 65.24 4.41339 54.2038 4.41339H40.9604C29.9242 4.41339 25.5098 8.82786 25.5098 19.864V33.1075C25.5098 44.1436 29.9242 48.5581 40.9604 48.5581H51.9966"
                    fill="url(#paint2_linear_12611_280)"
                  />
                  <path
                    d="M69.6545 30.9002V19.864C69.6545 8.82786 65.24 4.41339 54.2038 4.41339H40.9604C29.9242 4.41339 25.5098 8.82786 25.5098 19.864V33.1075C25.5098 44.1436 29.9242 48.5581 40.9604 48.5581H51.9966"
                    stroke="url(#paint3_linear_12611_280)"
                    stroke-width="5.05756"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M69.654 30.9002H60.825C54.2033 30.9002 51.9961 33.1075 51.9961 39.7292V48.5581L69.654 30.9002Z"
                    fill="#FFC162"
                    stroke="#FFC162"
                    stroke-width="5.05756"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    opacity="0.4"
                    d="M36.5469 24.2798H49.7903"
                    stroke="white"
                    stroke-width="5.05756"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    opacity="0.4"
                    d="M36.5469 15.4492H45.3758"
                    stroke="white"
                    stroke-width="5.05756"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <mask id="path-11-inside-1_12611_280" fill="white">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M19.9683 36.5519C16.1914 32.6726 13.865 27.3742 13.865 21.5323C13.865 9.64036 23.5054 0 35.3973 0C47.2893 0 56.9297 9.64036 56.9297 21.5323C56.9297 33.4243 47.2893 43.0647 35.3973 43.0647C31.1491 43.0647 27.1883 41.8344 23.8516 39.7108C23.7905 39.8034 23.7227 39.8931 23.648 39.9791L7.50091 58.5583C5.90711 60.3922 3.0928 60.4906 1.37477 58.7726C-0.338863 57.059 -0.246002 54.2533 1.5772 52.6568L19.9683 36.5519ZM35.3973 37.8325C44.3997 37.8325 51.6975 30.5347 51.6975 21.5323C51.6975 12.53 44.3997 5.23216 35.3973 5.23216C26.395 5.23216 19.0972 12.53 19.0972 21.5323C19.0972 30.5347 26.395 37.8325 35.3973 37.8325Z"
                    />
                  </mask>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
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
                    stroke-width="1.05139"
                    stroke-linecap="round"
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
      </div>
      {!isEmptyTable && table.getState()?.pagination && 'pageIndex' in table.getState()?.pagination ? (
        <div className="sticky bottom-0 left-0 flex items-center justify-end gap-6 py-2 bg-white rounded-3xl">
          {studentsCount ? (
            <div className="absolute flex items-center gap-1 left-12">
              <span className="font-semibold">{studentsCount}</span>
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
          <span className="flex items-center gap-1 text-sm">
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
              </svg>{' '}
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
