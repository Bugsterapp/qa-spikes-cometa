import { ColumnDef } from '@tanstack/react-table';
import { isValidElement, ReactElement } from 'react';

export function getColumnId<T>(column: ColumnDef<T, any>): string {
  if ('accessorKey' in column && column.accessorKey) {
    return String(column.accessorKey);
  }
  if ('columnId' in column && column.columnId) {
    return String(column.columnId);
  }
  if ('accessorFn' in column && column.accessorFn?.name) {
    return String(column.accessorFn?.name);
  }

  return String(column.id);
}

export function getColumnHeader<T>(column: ColumnDef<T, any>): string {
  const header = column.header;

  if (typeof header !== 'function') {
    return String(header || getColumnId(column));
  }

  const result = header({ column } as any);
  if (!isValidElement(result)) {
    return String(result);
  }

  const props = result.props as { children: ReactElement | ReactElement[] };
  if (Array.isArray(props.children)) {
    const headerElement = props.children[0];
    return String(headerElement.props.children);
  }

  return String(props.children);
}
