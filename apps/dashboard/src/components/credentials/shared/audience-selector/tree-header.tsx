import type { ColumnDefinition } from './types';

type TreeHeaderProps<TData> = {
  columns: ColumnDefinition<TData>[];
  showCheckboxes?: boolean;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
  onToggleAll?: () => void;
};

export function TreeHeader<TData = unknown>({
  columns,
  showCheckboxes = true,
  isAllSelected = false,
  isSomeSelected = false,
  onToggleAll,
}: TreeHeaderProps<TData>) {
  // Generate grid template columns based on column widths
  const gridTemplateColumns = columns
    .map((col) => {
      if (col.width) return col.width;
      if (col.minWidth) return `minmax(${col.minWidth}, 1fr)`;
      return '1fr';
    })
    .join(' ');

  return (
    <div className="bg-gray-50 border-b border-neutral-200 px-6 py-6 font-medium text-sm text-gray-600">
      <div className="flex items-center">
        {showCheckboxes && onToggleAll ? (
          <input
            type="checkbox"
            className="mr-3 w-4 h-4 rounded border-gray-300 text-[#7c3aed] focus:ring-[#7c3aed] focus:ring-2 focus:ring-offset-0 cursor-pointer accent-[#7c3aed]"
            checked={isAllSelected}
            ref={(input) => {
              if (input) input.indeterminate = isSomeSelected;
            }}
            onChange={(e) => {
              e.stopPropagation();
              onToggleAll();
            }}
          />
        ) : null}
        <div className="grid flex-1" style={{ gridTemplateColumns }}>
          {columns.map((column) => (
            <div key={column.key}>{column.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
