import { Button, Input } from '@cometa/recreo';
import { Popover, PopoverContent, PopoverTrigger } from '@cometa/recreo/components/ui/Popover';
import { cn } from '@cometa/utils';
import { Reorder } from 'framer-motion';
import { debounce } from 'lodash';
import { GripVertical, SearchIcon, X } from 'lucide-react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import useSendTrackEventWithUserName from '../../hooks/useSendTrackEventWithUserName';
import { Checkbox } from '../atoms/RadixCheckbox';
import { Tooltip } from '../atoms/Tooltip';
import { Button as LegacyButton } from '../ui/Button';

export type ColumnCustomizerColumn = {
  columnId: string;
  columnName: string;
  isVisible: boolean;
  order: number;
  isFixed?: boolean;
};

type ColumnCustomizerProps = {
  columns: ColumnCustomizerColumn[];
  onColumnsChange: (columns: ColumnCustomizerColumn[]) => void;
  isLegacy?: boolean;
  fixedColumnIds?: string[];
  tableName?: string;
};

const MemoizedCheckbox = memo(Checkbox);

export function ColumnCustomizerAction({
  columns,
  onColumnsChange,
  isLegacy = true,
  fixedColumnIds,
  tableName = 'unknown',
}: ColumnCustomizerProps) {
  const safeColumns = useMemo(() => columns || [], [columns]);
  const [isOpen, setIsOpen] = useState(false);
  const initialColumnsRef = useRef<ColumnCustomizerColumn[]>([]);
  const sendTrackEvent = useSendTrackEventWithUserName();

  // Create a wrapper for onColumnsChange that doesn't trigger events on each change
  const handleColumnsChange = useCallback(
    (newColumns: ColumnCustomizerColumn[]) => {
      onColumnsChange(newColumns);
    },
    [onColumnsChange]
  );

  // Handle popover open/close and track events
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        initialColumnsRef.current = JSON.parse(JSON.stringify(safeColumns));
      } else {
        const initialColumns = initialColumnsRef.current;
        const currentColumns = safeColumns;

        if (initialColumns.length > 0) {
          const initialColumnsMap = new Map(initialColumns.map((col) => [col.columnId, col]));
          const currentColumnsMap = new Map(currentColumns.map((col) => [col.columnId, col]));

          const commonColumnIds = [...initialColumnsMap.keys()].filter((id) => currentColumnsMap.has(id));

          const hasVisibilityChanged = commonColumnIds.some((id) => {
            const initialCol = initialColumnsMap.get(id);
            const currentCol = currentColumnsMap.get(id);
            return initialCol?.isVisible !== currentCol?.isVisible;
          });

          if (hasVisibilityChanged) {
            const changedColumns = commonColumnIds
              .filter((id) => {
                const initialCol = initialColumnsMap.get(id);
                const currentCol = currentColumnsMap.get(id);
                return initialCol?.isVisible !== currentCol?.isVisible;
              })
              .map((id) => currentColumnsMap.get(id)?.columnName || '')
              .filter(Boolean)
              .join(', ');

            sendTrackEvent(`dashboard: ${tableName} | ColumnCustomizer`, {
              visible_columns: currentColumns.filter((col) => col.isVisible).length,
              hidden_columns: currentColumns.filter((col) => !col.isVisible).length,
              total_columns: currentColumns.length,
              changed_columns: changedColumns,
            });
          }
        }
      }

      setIsOpen(open);
    },
    [safeColumns, sendTrackEvent, tableName]
  );

  return (
    <Popover onOpenChange={handleOpenChange} open={isOpen}>
      {isLegacy ? (
        <PopoverTrigger asChild>
          <LegacyButton variant="outline" size="icon" className="border-none rounded-full hover:bg-[#E4EBF6]">
            <ColumnCustomizerIcon />
          </LegacyButton>
        </PopoverTrigger>
      ) : (
        <Tooltip message="Columnas">
          <PopoverTrigger asChild>
            <Button variant="solid-light" color="black" size="medium" className="px-4">
              <ColumnCustomizerIcon />
            </Button>
          </PopoverTrigger>
        </Tooltip>
      )}
      <PopoverContent className="w-80 p-0 border-none shadow-none" align="end">
        <ColumnCustomizer columns={safeColumns} onColumnsChange={handleColumnsChange} fixedColumnIds={fixedColumnIds} />
      </PopoverContent>
    </Popover>
  );
}

function ColumnCustomizer({
  columns: initialColumns,
  onColumnsChange: externalOnColumnsChange,
  fixedColumnIds = [],
}: ColumnCustomizerProps): JSX.Element {
  const [search, setSearch] = useState('');
  const [columns, setColumns] = useState(initialColumns);
  const debouncedSetSearch = useMemo(() => debounce(setSearch, 300), []);

  const debouncedExternalOnColumnsChange = useMemo(
    () => debounce(externalOnColumnsChange, 300),
    [externalOnColumnsChange]
  );

  const onColumnsChange = useCallback(
    (newColumns: ColumnCustomizerColumn[]) => {
      setColumns(newColumns);
      debouncedExternalOnColumnsChange(newColumns);
    },
    [debouncedExternalOnColumnsChange]
  );

  const columnsWithFixed = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        isFixed:
          fixedColumnIds.includes(col.columnId) ||
          (fixedColumnIds.length === 0 &&
            columns.findIndex((c) => c.isVisible) === columns.findIndex((c) => c.columnId === col.columnId)),
        isVisible: fixedColumnIds.includes(col.columnId) ? true : col.isVisible,
        order: fixedColumnIds.includes(col.columnId) ? fixedColumnIds.indexOf(col.columnId) : col.order,
      })),
    [columns, fixedColumnIds]
  );

  const uniqueColumns = useMemo(() => {
    const fixedColumnNames = columnsWithFixed.filter((col) => col.isFixed).map((col) => col.columnName);

    return columnsWithFixed.filter((col) => col.isFixed || !fixedColumnNames.includes(col.columnName));
  }, [columnsWithFixed]);

  const visibleColumns = useMemo(() => uniqueColumns.filter((col) => col.isVisible), [uniqueColumns]);
  const hiddenColumns = useMemo(() => uniqueColumns.filter((col) => !col.isVisible), [uniqueColumns]);

  const fixedColumns = useMemo(() => visibleColumns.filter((col) => col.isFixed), [visibleColumns]);
  const reorderableColumns = useMemo(() => visibleColumns.filter((col) => !col.isFixed), [visibleColumns]);

  // Helper function to sort columns based on fixed status and order
  const sortColumns = (columns: ColumnCustomizerColumn[]) =>
    [...columns].sort((a, b) => {
      if (a.isFixed && b.isFixed) {
        return fixedColumnIds.indexOf(a.columnId) - fixedColumnIds.indexOf(b.columnId);
      }
      if (a.isFixed) return -1;
      if (b.isFixed) return 1;
      return a.order - b.order;
    });

  // Helper function to update column visibility
  const updateColumnsVisibility = (columns: ColumnCustomizerColumn[], setVisible: boolean) => {
    const updatedColumns = columns.map((col) => {
      if (col.isFixed) {
        return {
          ...col,
          isVisible: true, // Fixed columns are always visible
          order: fixedColumnIds.indexOf(col.columnId),
        };
      }
      return {
        ...col,
        isVisible: setVisible,
        order: col.order || fixedColumnIds.length + (col.order || 0),
      };
    });

    return sortColumns(updatedColumns);
  };

  function handleToggleColumn(columnId: string) {
    if (fixedColumnIds.includes(columnId)) return;

    const updatedColumns = uniqueColumns.map((col) => {
      if (col.columnId === columnId) {
        return {
          ...col,
          isVisible: !col.isVisible,
          order: !col.isVisible ? fixedColumnIds.length + (col.order || 0) : col.order,
        };
      }
      return col;
    });

    onColumnsChange(sortColumns(updatedColumns));
  }

  function handleReorder(reorderedColumns: ColumnCustomizerColumn[]) {
    const sortedFixedColumns = [...fixedColumns].sort((a, b) => {
      const aIndex = fixedColumnIds.indexOf(a.columnId);
      const bIndex = fixedColumnIds.indexOf(b.columnId);
      return aIndex - bIndex;
    });

    const allColumns = [
      ...sortedFixedColumns,
      ...reorderedColumns.map((col, index) => ({
        ...col,
        order: sortedFixedColumns.length + index,
      })),
      ...hiddenColumns,
    ];
    onColumnsChange(allColumns);
  }

  function handleShowAll() {
    onColumnsChange(updateColumnsVisibility(uniqueColumns, true));
  }

  function handleHideAll() {
    onColumnsChange(updateColumnsVisibility(uniqueColumns, false));
  }

  const filteredHiddenColumns = useMemo(
    () => hiddenColumns.filter((col) => col.columnName.toLowerCase().includes(search.toLowerCase())),
    [hiddenColumns, search]
  );

  const filteredReorderableColumns = useMemo(
    () => reorderableColumns.filter((col) => col.columnName.toLowerCase().includes(search.toLowerCase())),
    [reorderableColumns, search]
  );

  return (
    <div className="w-80 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto bg-white rounded-lg flex flex-col gap-4 p-2 pb-4 font-lota antialiased border border-[#E9EEF7] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.20),0px_12px_24px_-4px_rgba(145,158,171,0.12)]">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#919EAB] pointer-events-none z-10" />
        <Input
          placeholder="Buscar"
          onChange={(e) => debouncedSetSearch(e.target.value)}
          className="pl-9 bg-[#F4F6F8] border-0 h-10 text-sm placeholder:text-[#919EAB] pr-8"
        />
        {search && (
          <LegacyButton
            variant="ghost"
            size="icon"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent z-10"
          >
            <X className="h-4 w-4 text-[#919EAB]" />
          </LegacyButton>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xs font-semibold text-[#717993] uppercase">Columnas visibles</h3>
          <LegacyButton
            variant="link"
            size="sm"
            onClick={handleHideAll}
            className="text-[#873AFF] text-xs hover:text-[#6029B5] p-0 h-auto"
          >
            Ocultar todo
          </LegacyButton>
        </div>

        {fixedColumns.map((column) => (
          <div
            key={column.columnId}
            className="flex items-center p-2 pb-0 transition-colors rounded-lg cursor-not-allowed"
          >
            <MemoizedCheckbox
              checked
              className="mr-3 data-[state=checked]:bg-[#C0C9D8] data-[state=checked]:border-[#C0C9D8] cursor-not-allowed"
            />
            <span className="truncate flex-1 text-sm text-[#C0C9D8]">{column.columnName}</span>
            <LegacyButton variant="ghost" size="icon" className="p-0 h-auto cursor-not-allowed">
              <GripVertical className="h-4 w-4 text-[#A2ABB9]" />
            </LegacyButton>
          </div>
        ))}

        <Reorder.Group axis="y" values={reorderableColumns} onReorder={handleReorder}>
          {filteredReorderableColumns.map((column) => (
            <Reorder.Item
              key={column.columnId}
              value={column}
              className={cn('group', {
                'opacity-50 cursor-not-allowed': visibleColumns.length <= fixedColumns.length,
              })}
              whileDrag={{
                backgroundColor: 'white',
                boxShadow: '0px 0px 2px 0px rgba(145, 158, 171, 0.24), -20px 20px 40px -4px rgba(145, 158, 171, 0.24)',
                zIndex: 30,
              }}
              transition={{
                duration: 0.2,
              }}
              dragListener
            >
              <div className="flex items-center p-2 text-[#1C1C1D] hover:text-[#873AFF] hover:bg-[#873AFF]/8 transition-colors rounded-lg">
                <MemoizedCheckbox
                  checked={column.isVisible}
                  onCheckedChange={() => handleToggleColumn(column.columnId)}
                  className="mr-3 data-[state=checked]:bg-[#873AFF] data-[state=checked]:border-[#6E42E5]"
                />
                <span className="truncate flex-1 text-sm">{column.columnName}</span>
                <LegacyButton
                  variant="ghost"
                  size="icon"
                  className="cursor-grab active:cursor-grabbing p-0 h-auto hover:bg-transparent"
                >
                  <GripVertical className="h-4 w-4 text-[#A2ABB9]" />
                </LegacyButton>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {hiddenColumns.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-semibold text-[#717993] uppercase">Columnas ocultas</h3>
            <LegacyButton
              variant="link"
              size="sm"
              onClick={handleShowAll}
              className="text-[#873AFF] text-xs hover:text-[#6029B5] p-0 h-auto"
            >
              Mostrar todo
            </LegacyButton>
          </div>
          <div className="overflow-y-auto">
            {filteredHiddenColumns.map((column) => (
              <div
                key={column.columnId}
                className="flex items-center p-2 text-[#1C1C1D] hover:text-[#873AFF] hover:bg-[#873AFF]/8 transition-colors rounded-lg"
              >
                <MemoizedCheckbox
                  checked={column.isVisible}
                  onCheckedChange={() => handleToggleColumn(column.columnId)}
                  className="mr-3 data-[state=checked]:bg-[#873AFF] data-[state=checked]:border-[#6E42E5]"
                  disabled={column.isFixed}
                />
                <span className="truncate flex-1 text-sm">{column.columnName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ColumnCustomizerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M0 1.4C0 0.902944 0.373096 0.5 0.833333 0.5H1.66667C2.1269 0.5 2.5 0.902944 2.5 1.4V8.6C2.5 9.09706 2.1269 9.5 1.66667 9.5H0.833333C0.373096 9.5 0 9.09706 0 8.6V1.4Z"
        fill="#1C1C1D"
      />
      <path
        d="M3.75 1.4C3.75 0.902944 4.1231 0.5 4.58333 0.5H5.41667C5.8769 0.5 6.25 0.902944 6.25 1.4V8.6C6.25 9.09706 5.8769 9.5 5.41667 9.5H4.58333C4.1231 9.5 3.75 9.09706 3.75 8.6V1.4Z"
        fill="#1C1C1D"
      />
      <path
        d="M7.5 1.4C7.5 0.902944 7.8731 0.5 8.33333 0.5H9.16667C9.6269 0.5 10 0.902944 10 1.4V8.6C10 9.09706 9.6269 9.5 9.16667 9.5H8.33333C7.8731 9.5 7.5 9.09706 7.5 8.6V1.4Z"
        fill="#1C1C1D"
      />
    </svg>
  );
}
