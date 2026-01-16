import { useState } from 'react';
import { useRouter } from 'next/router';
import { createColumnHelper } from '@tanstack/react-table';
import { Popover, PopoverTrigger, PopoverContent, Button } from '@cometa/recreo/v2';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import type { DocumentTemplateEntity } from '@cometa/trpc/src/students/types';

interface TemplatesTableProps {
  templates: DocumentTemplateEntity[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

function TemplateActions({ template, onDelete }: { template: DocumentTemplateEntity; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-1">
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              // No hace nada por ahora
            }}
          >
            <Pencil size={16} />
            Editar
          </button>

          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(template.id);
            }}
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TemplatesTableSkeleton() {
  return (
    <div className="w-full">
      <table
        className="w-full"
        style={{
          borderSpacing: '0px',
          overflowAnchor: 'none',
          width: '100%',
          tableLayout: 'initial',
          borderCollapse: 'collapse',
        }}
      >
        <thead className="z-20 sticky transition-all duration-1000 top-0">
          <tr>
            <th className="whitespace-nowrap py-4 text-sm text-foreground pr-2 pl-10">
              <div className="flex w-full">
                <Skeleton className="h-4 w-16" />
              </div>
            </th>
            <th className="whitespace-nowrap py-4 text-sm text-foreground pr-2 pl-6">
              <div className="flex w-full">
                <Skeleton className="h-4 w-32" />
              </div>
            </th>
            <th className="whitespace-nowrap py-4 text-sm text-foreground pr-2 pl-6" />
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="hover:bg-accent/50 group cursor-pointer">
              <td className="whitespace-nowrap py-4 text-sm text-foreground pr-2 pl-10">
                <div className="flex flex-row min-w-[500px]">
                  <Skeleton className="h-4 w-[300px]" />
                </div>
              </td>
              <td className="whitespace-nowrap py-4 text-sm text-foreground pr-2 pl-6">
                <div className="flex flex-row min-w-[150px]">
                  <Skeleton className="h-4 w-20" />
                </div>
              </td>
              <td className="whitespace-nowrap py-4 text-sm text-foreground pr-2 pl-6">
                <div className="flex justify-end pr-8">
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const columnHelper = createColumnHelper<DocumentTemplateEntity>();

export function TemplatesTable({ templates, onDelete, isLoading = false }: TemplatesTableProps) {
  const router = useRouter();

  if (isLoading) {
    return <TemplatesTableSkeleton />;
  }

  const handleRowClick = (templateId: string) => {
    router.push(`/signatures/${templateId}`);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-MX', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const templateColumns = [
    columnHelper.accessor('name', {
      cell: (info) => {
        const name = info.getValue();
        return (
          <div className="flex flex-row min-w-[500px]">
            <span className="text-sm font-normal truncate" title={name}>
              {name}
            </span>
          </div>
        );
      },
      header: () => <span>Título</span>,
    }),
    columnHelper.accessor('created_at', {
      cell: (info) => {
        const date = info.getValue();
        return (
          <div className="flex flex-row min-w-[150px]">
            <span className="text-sm font-normal truncate">{formatDate(date)}</span>
          </div>
        );
      },
      header: () => <span>Fecha de creación</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex justify-end pr-8">
          <TemplateActions template={info.row.original} onDelete={onDelete} />
        </div>
      ),
      header: () => null,
    }),
  ];

  return (
    <TableVirtualized
      data={templates}
      columns={templateColumns}
      maxHeight={500}
      totalCount={templates.length}
      totalFetched={templates.length}
      isLoading={isLoading}
      isFetching={isLoading}
      fetchNextPage={() => void 0}
      hasNextPage={false}
      isFetchingNextPage={false}
      tableLayout="initial"
      addMorePaddingFirstRow
      useWindowScroll
      hideSum
      rowClassName="hover:bg-accent/50 group cursor-pointer"
      onRowClick={(row) => handleRowClick(row.id)}
    />
  );
}
