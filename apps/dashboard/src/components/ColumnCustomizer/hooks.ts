import { ColumnDef } from '@tanstack/react-table';
import { debounce } from 'lodash';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnCustomizerColumn } from './index';
import { getColumnHeader, getColumnId } from './utils';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';

export function useColumnCustomizer({ tableName, columns }: { tableName: string; columns: ColumnDef<any, any>[] }) {
  const visibleColumns = useMemo(() => columns.map(getColumnId), [columns]);

  const session = useSession();
  const userId = session.data?.user.id as string;

  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const generateColumn = useCallback(
    (column: any, index: number) => ({
      columnId: getColumnId(column),
      columnName: getColumnHeader(column),
      isVisible: visibleColumns.includes(getColumnId(column)),
      order: index,
    }),
    [visibleColumns]
  );

  const initialTableColumns = useMemo(() => columns.map(generateColumn), [columns, generateColumn]);

  const { data: tableConfig } = api.students.getTableConfig.useQuery({
    userId,
    tableName,
    schoolId,
  });

  useEffect(() => {
    if (tableConfig && tableConfig.length > 0) {
      const defaultColumns =
        tableConfig[0].columns_config?.map((column: any) => ({
          columnId: column.column_id,
          columnName: column.column_name,
          isVisible: column.is_visible,
          order: column.order,
        })) || [];

      const newColumns = columns.map(generateColumn);
      const missingColumns = newColumns.filter((col) => !defaultColumns.some((dc) => dc.columnId === col.columnId));

      setTableColumns((prev) => {
        const mergedColumns = [...defaultColumns, ...missingColumns];
        return JSON.stringify(prev) === JSON.stringify(mergedColumns) ? prev : mergedColumns;
      });
    } else {
      setTableColumns(initialTableColumns);
    }
  }, [tableConfig]);

  const upsertTableConfig = api.students.upsertTableConfig.useMutation();
  const [tableColumns, setTableColumns] = useState<ColumnCustomizerColumn[]>(initialTableColumns);
  const visibleTableColumns = useVisibleTableColumns({ columns, tableColumns });

  // Memoize the debounced mutation function
  const debouncedUpsertTableConfig = useMemo(
    () =>
      debounce((cols: ColumnCustomizerColumn[]) => {
        upsertTableConfig.mutate({
          id: tableConfig?.[0]?.id,
          userId,
          tableName,
          schoolId,
          columnsConfig: cols.map((column) => ({
            columnId: column.columnId,
            columnName: column.columnName,
            isVisible: column.isVisible,
            order: column.order,
          })),
        });
      }, 300),
    [upsertTableConfig, tableConfig, userId, tableName, schoolId]
  );

  const handleColumnsChange = useCallback(
    (columns: ColumnCustomizerColumn[]) => {
      setTableColumns(columns);
      debouncedUpsertTableConfig(columns);
    },
    [setTableColumns, debouncedUpsertTableConfig]
  );

  return { tableColumns, visibleTableColumns, handleColumnsChange };
}

export function useVisibleTableColumns({
  columns,
  tableColumns,
}: {
  columns: ColumnDef<any, any>[];
  tableColumns: ColumnCustomizerColumn[];
}) {
  const tableColumnsMap = useMemo(() => {
    const map = new Map();
    tableColumns.forEach((tc) => map.set(tc.columnId, tc));
    return map;
  }, [tableColumns]);

  return useMemo(
    () =>
      columns
        .filter((col) => tableColumnsMap.get(getColumnId(col))?.isVisible)
        .sort((a, b) => {
          const aOrder = tableColumnsMap.get(getColumnId(a))?.order || 0;
          const bOrder = tableColumnsMap.get(getColumnId(b))?.order || 0;
          return aOrder - bOrder;
        }),
    [columns, tableColumnsMap]
  );
}

export function useFixedColumnsCustomizer({
  tableName,
  columns,
  fixedColumnIds,
  hiddenColumnIds = [],
}: {
  tableName: string;
  columns: ColumnDef<any, any>[];
  fixedColumnIds: string[];
  hiddenColumnIds?: string[];
}) {
  const {
    tableColumns,
    visibleTableColumns: originalVisibleTableColumns,
    handleColumnsChange,
  } = useColumnCustomizer({
    tableName,
    columns,
  });

  // Filter out hidden columns from the tableColumns for the ColumnCustomizer component
  const displayTableColumns = useMemo(() => {
    if (!tableColumns) return [];
    return tableColumns.filter((column) => !hiddenColumnIds.includes(column.columnId));
  }, [tableColumns, hiddenColumnIds]);

  // Ensure hidden columns are always included in visibleTableColumns
  const visibleTableColumns = useMemo(() => {
    if (!originalVisibleTableColumns || !tableColumns) return originalVisibleTableColumns;

    const alwaysVisibleColumns = columns.filter((col) => hiddenColumnIds.includes(getColumnId(col)));

    if (alwaysVisibleColumns.length === 0) return originalVisibleTableColumns;

    const visibleColumnIds = new Set(originalVisibleTableColumns.map((col) => getColumnId(col)));
    const missingColumns = alwaysVisibleColumns.filter((col) => !visibleColumnIds.has(getColumnId(col)));

    if (missingColumns.length === 0) return originalVisibleTableColumns;

    return [...originalVisibleTableColumns, ...missingColumns];
  }, [originalVisibleTableColumns, columns, hiddenColumnIds]);

  const getHiddenColumns = useCallback(
    (currentTableColumns: ColumnCustomizerColumn[]) =>
      currentTableColumns?.filter((column) => hiddenColumnIds.includes(column.columnId)) || [],
    [hiddenColumnIds]
  );

  const mapNewColumns = useCallback(
    (newColumns: ColumnCustomizerColumn[]) =>
      newColumns.map((column) => (fixedColumnIds.includes(column.columnId) ? { ...column, isVisible: true } : column)),
    [fixedColumnIds]
  );

  const mapHiddenColumns = useCallback(
    (hiddenColumns: ColumnCustomizerColumn[]) =>
      hiddenColumns.map((column) => ({
        ...column,
        isVisible: true,
      })),
    []
  );

  const handleCustomColumnsChange = useCallback(
    (newColumns: ColumnCustomizerColumn[]) => {
      const hiddenColumns = getHiddenColumns(tableColumns || []);
      const updatedColumns = [...mapNewColumns(newColumns), ...mapHiddenColumns(hiddenColumns)].map((column) => {
        if (fixedColumnIds.includes(column.columnId) || hiddenColumnIds.includes(column.columnId)) {
          column = { ...column, isVisible: true };
        }
        return column;
      });

      handleColumnsChange(updatedColumns);
    },
    [handleColumnsChange, fixedColumnIds, hiddenColumnIds, tableColumns]
  );

  return {
    tableColumns: displayTableColumns,
    visibleTableColumns,
    handleColumnsChange: handleCustomColumnsChange,
    fixedColumnIds,
  };
}
