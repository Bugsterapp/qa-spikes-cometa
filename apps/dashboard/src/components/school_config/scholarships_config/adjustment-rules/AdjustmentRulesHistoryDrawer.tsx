'use client';

import { useMemo, useState } from 'react';
import Sheet from '/src/components/atoms/Sheet';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { Button } from '@cometa/recreo/v2';
import { api } from '/src/utils/api';
import type { ConfigurationHistory } from '@cometa/trpc/src/types';
import { getUserNameInitials, formatHistoryDate, formatHistoryTime } from '@cometa/utils';

type AdjustmentRulesHistoryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
};

const HistoryItem = ({ entry }: { entry: ConfigurationHistory }) => {
  const userName = entry.user ? `${entry.user.first_name} ${entry.user.last_name}` : 'Sistema';
  const initials = entry.user ? getUserNameInitials(entry.user.first_name, entry.user.last_name) : 'SI';

  const formatDescription = (description: string) => {
    const colonIndex = description.indexOf(':');
    if (colonIndex === -1) return description;

    const beforeColon = description.substring(0, colonIndex + 1);
    const afterColon = description.substring(colonIndex + 1).trim();

    return (
      <>
        {beforeColon} <span className="font-semibold text-[#22283a]">{afterColon}</span>
      </>
    );
  };

  return (
    <div className="bg-[#f8f9fb] rounded-lg p-4 border border-[#d0d8e9]">
      <div className="flex items-start gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
          style={{ backgroundColor: '#22283a' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-['Lota_Grotesque'] text-sm leading-5 text-[#22283a]">{userName}</span>
            <span className="font-['Lota_Grotesque'] text-xs leading-4 text-[#697086]">
              {formatHistoryTime(entry.timestamp)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[#697086] flex items-start gap-2">
              <span className="text-[#22283a] mt-0.5">•</span>
              <span className="font-['Lota_Grotesque'] text-xs leading-4">{formatDescription(entry.description)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function AdjustmentRulesHistoryDrawer({ isOpen, onClose, schoolId }: AdjustmentRulesHistoryDrawerProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: historyData,
    isLoading,
    isFetching,
  } = api.adjustmentRules.configurationHistory.useQuery(
    {
      schoolId,
      page: currentPage,
      page_size: 10,
    },
    {
      enabled: isOpen,
    }
  );

  const flatData = useMemo(() => historyData?.results || [], [historyData]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, ConfigurationHistory[]> = {};

    flatData.forEach((entry) => {
      const date = new Date(entry.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return Object.entries(groups).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  }, [flatData]);

  const hasNextPage = !!historyData?.next;
  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setCurrentPage(1);
        }
      }}
    >
      <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
        <SidebarHeader
          title="Historial de cambios"
          onClose={onClose}
          boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
          titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
        />
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {isLoading && flatData.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="font-['Lota_Grotesque'] text-sm text-[#697086]">Cargando historial...</div>
            </div>
          ) : flatData.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="font-['Lota_Grotesque'] text-sm text-[#697086]">No hay cambios registrados</div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {groupedEntries.map(([date, entries]) => (
                <div key={date} className="flex flex-col gap-4">
                  <div className="font-['Lota_Grotesque'] text-sm leading-none text-[#697086]">
                    {formatHistoryDate(entries[0].timestamp)}
                  </div>
                  {entries.map((entry, entryIdx) => (
                    <HistoryItem key={`${date}-${entryIdx}`} entry={entry} />
                  ))}
                </div>
              ))}

              {hasNextPage && (
                <div className="flex justify-center pt-2">
                  <Button onClick={handleLoadMore} variant="outline" size="default" disabled={isFetching}>
                    {isFetching ? 'Cargando...' : 'Cargar más'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Sheet.Content>
    </Sheet>
  );
}
