import {
  useReactTable,
  getCoreRowModel,
  getFacetedRowModel,
  flexRender,
  TableState,
  Row,
  ColumnDef,
  getGroupedRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table';
import React, { useMemo, useRef } from 'react';
import { Tooltip } from './atoms/Tooltip';
import Button from './organisms/dashboard/Button';
import { Virtuoso } from 'react-virtuoso';
import CollapsableIcon from './atoms/CollapsableIcon';
import TableFooter from './atoms/TableFooter';
import TableEmptyPlaceholder from './atoms/TableEmptyPlaceholder';

interface TableProps<Data> {
  data: Data[] | undefined;
  columns: ColumnDef<Data, any>[];
  state?: Partial<TableState>;
  hideColumns?: string[];
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
  hideHeader?: boolean;
  hideSum?: boolean;
  emptyStateText?: string;
  showEmptyStateImage?: boolean;
  children?: (rows: Row<Data>) => JSX.Element | null;
  onExpandedChange?: (updater: any) => void;
}

export const TableInfinity = <T extends Record<string, any>>({
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
  onExpandedChange,
  hideHeader,
}: TableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    state: {
      ...state,
      columnVisibility: hideColumns.reduce((o, key) => ({ ...o, [key]: false }), {}),
    },
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
    onExpandedChange,
    getSubRows: (row) => row.subRows,
    enableExpanding: true,
    getExpandedRowModel: getExpandedRowModel(),
    autoResetExpanded: false,
  });
  const { rows } = table.getRowModel();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topLevelRows = useMemo(() => rows.filter((row) => row.depth === 0), [rows]);
  const isEmptyTable = topLevelRows.length === 0 && !isLoading;

  return (
    <div
      className={`pr-0.5 flex flex-col justify-between w-full bg-white ${isLoading ? 'opacity-25' : 'opacity-100'}`}
      style={{ height: `${maxHeight}px` }}
    >
      <div
        className={`relative ${isEmptyTable ? 'grid grid-cols-1 grid-rows-1' : ''}`}
        style={{ height: `${maxHeight}px` }}
        ref={tableContainerRef}
      >
        <div className={`text-sm ${isEmptyTable ? 'grid-area-1' : ''} min-h-[300px]`}>
          {!hideHeader && (
            <div className="sticky top-0 z-10 flex px-8 bg-gray-200">
              <div className="max-w-[calc(32px_+_1rem)]">
                <Tooltip message={table.getIsSomeRowsExpanded() ? 'Colapsar todo' : 'Expandir todo'}>
                  <Button
                    variant="icon"
                    size="small"
                    data-testid="collapsable-icon"
                    onClick={table.getToggleAllRowsExpandedHandler()}
                  >
                    <CollapsableIcon isExpanded={table.getIsAllRowsExpanded()} />
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
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="relative bg-white" style={{ height: `${maxHeight ? maxHeight - 104 : 0}px` }}>
            <Virtuoso
              overscan={20}
              data-testid="virtuoso-scroller-grid"
              style={{ height: `${maxHeight ? maxHeight - 104 : 0}px` }}
              data={topLevelRows}
              itemContent={(_index, data) => (children ? children(data) : <div>{JSON.stringify(data)}</div>)}
              endReached={() => {
                fetchNextPage();
              }}
              components={{ Footer: TableFooter, EmptyPlaceholder: TableEmptyPlaceholder } as any}
              context={{ hasNextPage, isFetchingNextPage, isEmptyTable, showEmptyStateImage, emptyStateText }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
