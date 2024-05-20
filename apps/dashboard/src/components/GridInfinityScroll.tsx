import {
  useReactTable,
  getCoreRowModel,
  getFacetedRowModel,
  flexRender,
  TableState,
  Row,
  ColumnDef,
  ExpandedState,
  getGroupedRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table';
import React from 'react';
import { cn } from '../utils/cn';
import { Tooltip } from './atoms/Tooltip';
import Button from './organisms/dashboard/Button';
import { Virtuoso } from 'react-virtuoso';

interface TableProps<Data> {
  data: Data[] | undefined;
  columns: ColumnDef<Data, any>[];
  state?: Partial<TableState>;
  stickyColumns?: string[];
  hideColumns?: string[];
  onRowClick?: (row: Row<Data>['original']) => void;
  totalCount: number;
  isFetching?: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  totalFetched: number;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  highlightId?: string;
  maxHeight?: number;
  hideFooter?: boolean;
  hideSum?: boolean;
  emptyStateText?: string;
  showEmptyStateImage?: boolean;
  children?: (rows: Row<Data>) => JSX.Element | null;
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
  hideColumns = [],
  hasNextPage,
  maxHeight,
  fetchNextPage,

  isLoading,
  isFetchingNextPage,
  emptyStateText = 'No tenemos resultados',
  showEmptyStateImage = false,
  children,
}: TableProps<T>) => {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      ...state,
      expanded,
      columnVisibility: hideColumns.reduce((o, key) => ({ ...o, [key]: false }), {}),
    },
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
    onExpandedChange: (state) => {
      setExpanded(state);
    },
    getSubRows: (row) => row.subRows,
    enableExpanding: true,
    getExpandedRowModel: getExpandedRowModel(),
    autoResetExpanded: false,
  });
  const { rows } = table.getRowModel();
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const purgedRows = React.useMemo(() => rows.filter((row) => Boolean(row.subRows.length)), [rows]);

  const isEmptyTable = purgedRows.length === 0 && !isLoading;

  React.useEffect(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  React.useEffect(() => {
    table.toggleAllRowsExpanded();
  }, []);

  return (
    <div
      className={`pr-0.5 flex flex-col justify-between w-full bg-white ${isLoading ? 'opacity-25' : 'opacity-100'}`}
      style={{ height: `${maxHeight}px` }}
    >
      <div
        className={cn('relative', {
          'grid grid-cols-1 grid-rows-1': isEmptyTable,
        })}
        style={{ height: `${maxHeight}px` }}
        ref={tableContainerRef}
      >
        <div className={`text-sm ${isEmptyTable ? 'grid-area-1' : ''} min-h-[300px]`}>
          <div className="sticky top-0 z-30 flex items-center px-8 bg-gray-200">
            <div className="max-w-[calc(32px_+_1rem)]">
              <Tooltip message={table.getIsSomeRowsExpanded() ? 'Colapsar todo' : 'Expandir todo'}>
                <Button variant="icon" size="small" onClick={table.getToggleAllRowsExpandedHandler()}>
                  <svg viewBox="0 0 16 20" fill="none" className="w-4 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.00006 12.9998C0.999598 12.7662 1.08097 12.5397 1.23005 12.3598C1.3996 12.1553 1.64356 12.0267 1.90808 12.0023C2.17261 11.9779 2.43597 12.0598 2.64006 12.2298L8.00006 16.7098L13.3701 12.3898C13.5766 12.222 13.8416 12.1435 14.1062 12.1717C14.3709 12.1998 14.6134 12.3323 14.7801 12.5398C14.9641 12.749 15.0525 13.0254 15.0241 13.3026C14.9956 13.5797 14.8528 13.8324 14.6301 13.9998L8.63006 18.8298C8.26105 19.1331 7.72906 19.1331 7.36006 18.8298L1.36005 13.8298C1.11461 13.6263 0.980887 13.318 1.00006 12.9998Z"
                      fill="#3366FF"
                      className={cn('transition-transform origin-center', {
                        'rotate-0 -translate-y-2.5': table.getIsAllRowsExpanded(),
                        'rotate-180': !table.getIsAllRowsExpanded(),
                      })}
                    />
                    <path
                      d="M1.00006 7.05585C0.999598 7.28951 1.08097 7.51594 1.23005 7.69585C1.3996 7.90036 1.64356 8.029 1.90808 8.05339C2.17261 8.07778 2.43597 7.99591 2.64006 7.82585L8.00006 3.34585L13.3701 7.66585C13.5766 7.83362 13.8416 7.91212 14.1062 7.88397C14.3709 7.85582 14.6134 7.72333 14.7801 7.51585C14.9641 7.30669 15.0525 7.03023 15.0241 6.75308C14.9956 6.47593 14.8528 6.22323 14.6301 6.05585L8.63006 1.22585C8.26105 0.922537 7.72906 0.922537 7.36006 1.22585L1.36005 6.22585C1.11461 6.42932 0.980887 6.73762 1.00006 7.05585Z"
                      fill="#3366FF"
                      className={cn('transition-transform origin-center', {
                        'rotate-0 translate-y-2.5': table.getIsAllRowsExpanded(),
                        'rotate-180': !table.getIsAllRowsExpanded(),
                      })}
                    />
                  </svg>
                </Button>{' '}
              </Tooltip>
            </div>
            {table.getHeaderGroups().map((headerGroup) => (
              <div
                key={headerGroup.id}
                className="grid grid-cols-[repeat(7,_minmax(auto,1fr))] items-center pl-8 pr-16 2xl:pr-8 w-full gap-2 "
              >
                {headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    className="top-0 z-10 py-4 font-semibold text-gray-600 bg-gray-200 whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? `cursor-pointer select-none flex gap-1 items-end sticky`
                              : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="relative bg-white" style={{ height: `${maxHeight ? maxHeight - 104 : 0}px` }}>
            <Virtuoso
              overscan={20}
              style={{ height: `${maxHeight ? maxHeight - 104 : 0}px` }}
              data={purgedRows}
              itemContent={(_index, data) => (children ? <div>{children(data)}</div> : null)}
              endReached={fetchNextPage}
              components={{ Footer, EmptyPlaceholder } as any}
              context={{ hasNextPage, isFetchingNextPage, isEmptyTable, showEmptyStateImage, emptyStateText }}
            />
          </div>
          {isEmptyTable && (
            <div className="bg-white w-[75%] grid-area-1 flex items-center justify-center flex-col gap-4 absolute ">
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
              <p
                className={`text-[#919EAB] ${showEmptyStateImage ? 'text-xs' : 'text-sm'}`}
                data-testid="emptyState-text"
              >
                {emptyStateText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Footer = ({
  context: { hasNextPage, isEmptyTable },
}: {
  context: { hasNextPage: boolean; isEmptyTable: boolean };
}) => {
  if (isEmptyTable) return null;

  if (!hasNextPage) {
    return (
      <div className=" bottom-[52px] w-full">
        <div className="mx-auto w-full py-8 text-[#919EAB] text-center">No hay más alumnos con morosidad</div>
      </div>
    );
  }
  return (
    <div className=" bottom-[52px] w-full">
      <div className="mx-auto w-full py-16 text-[#919EAB] text-center">
        {' '}
        <img src="/assets/loading.svg" alt="loading" data-state="show" className="mx-auto" />
      </div>
    </div>
  );
};

const EmptyPlaceholder = ({
  context: { showEmptyStateImage, emptyStateText },
}: {
  context: { showEmptyStateImage: boolean; emptyStateText: string };
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center w-full gap-4 bg-white grid-area-1">
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
);
