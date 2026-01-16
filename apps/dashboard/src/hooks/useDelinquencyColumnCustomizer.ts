import { type ColumnDef } from '@tanstack/react-table';
import { useFixedColumnsCustomizer } from '/src/components/ColumnCustomizer/hooks';
import { DelinquentStudentExtended } from '../types';

export const useDelinquencyColumnCustomizer = ({
  tableName,
  columns,
}: {
  tableName: string;
  columns: ColumnDef<DelinquentStudentExtended, any>[];
}) => {
  const fixedColumnIds: string[] = [];
  return useFixedColumnsCustomizer({ tableName, columns, fixedColumnIds });
};
