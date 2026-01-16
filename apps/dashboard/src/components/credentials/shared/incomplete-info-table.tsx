export type ColumnConfig<T> = {
  header: string;
  accessor: (row: T) => React.ReactNode;
  width?: string;
};

type IncompleteInfoTableProps<T> = {
  data: T[];
  columns: ColumnConfig<T>[];
  getRowId: (row: T) => string;
};

export function IncompleteInfoTable<T>({ data, columns, getRowId }: IncompleteInfoTableProps<T>) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <table className="w-full table-fixed">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-sm font-semibold text-neutral-700 relative"
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
                {index < columns.length - 1 ? (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-neutral-200" />
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {data.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((column, index) => (
                <td key={index} className="px-6 py-4 text-sm text-neutral-900 truncate">
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
