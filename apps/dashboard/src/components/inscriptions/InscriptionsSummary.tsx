import { TableVirtualized } from '../TableInfinityScroll';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { api } from '../../utils/api';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { InscriptionGradeSummaryDTO } from '@cometa/trpc/src/students/types';

export function InscriptionsSummary({ schoolCycle }: { schoolCycle?: SchoolCycleEntity | null }) {
  const {
    data,
    isPending: isLoading,
    isFetching,
  } = api.students.getInscriptionsSummaryList.useQuery(
    { schoolCycleId: schoolCycle?.id || '' },
    { enabled: !!schoolCycle?.id }
  );

  const summaryData = data || [];
  const hasAnyQuotaData = summaryData.some((item) => item.total_quotas !== null && item.total_quotas !== undefined);
  const hasAnyAdmissionsData = summaryData.some((item) => item.leads !== null && item.leads !== undefined);

  const columns = useMemo<ColumnDef<InscriptionGradeSummaryDTO, any>[]>(() => {
    const cols: ColumnDef<InscriptionGradeSummaryDTO, any>[] = [
      {
        accessorKey: 'grade',
        header: () => <span>Grado</span>,
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="text-sm text-neutral-800">{row.grade}</span>
            </div>
          );
        },
      },
    ];

    if (hasAnyQuotaData) {
      cols.push({
        accessorKey: 'total_quotas',
        header: () => <span>Cupos totales</span>,
        cell: (info) => <span>{info.getValue() ?? 0}</span>,
      });
    }

    cols.push(
      {
        accessorKey: 'reinscriptions',
        header: () => <span>Reinscritos</span>,
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col">
              <span>{row.reinscriptions}</span>
              {row.pending_reinscriptions > 0 ? (
                <span className="text-xs text-neutral-600">{row.pending_reinscriptions} pendientes</span>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'new_incomes',
        header: () => <span>Nuevos ingresos</span>,
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col">
              <span>{row.new_incomes}</span>
              {row.pending_incomes > 0 ? (
                <span className="text-xs text-neutral-600">{row.pending_incomes} pendientes</span>
              ) : null}
            </div>
          );
        },
      }
    );

    if (hasAnyQuotaData) {
      cols.push({
        accessorKey: 'free_quotas',
        header: () => <span>Cupos libres</span>,
        cell: (info) => <span>{info.getValue() ?? 0}</span>,
      });
    }

    if (hasAnyAdmissionsData) {
      cols.push({
        accessorKey: 'leads',
        header: () => <span>Prospectos</span>,
        cell: (info) => <span>{info.getValue() ?? 0}</span>,
      });
    }

    return cols;
  }, [hasAnyQuotaData, hasAnyAdmissionsData]);

  return (
    <div className="w-full px-8">
      <TableVirtualized
        data={summaryData}
        columns={columns}
        totalCount={summaryData.length}
        totalFetched={summaryData.length}
        isLoading={isLoading}
        isFetching={isFetching}
        maxHeight={summaryData.length * 76}
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={() => 0}
        addMorePaddingFirstRow
        rounded
        hideFooter
      />
    </div>
  );
}
