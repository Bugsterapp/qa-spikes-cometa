import { useState, useEffect } from 'react';
import { HistoryChange } from '@cometa/trpc/src/types';

export type HistoryDataResponse = {
  results?: HistoryChange[];
  next?: string | null;
  count?: number;
};

export type UseHistoryDrawerParams = {
  historyData: HistoryDataResponse | undefined;
  showHistoryDrawer: boolean;
  historyPage: number;
};

export function useHistoryDrawer({
  historyData,
  showHistoryDrawer,
  historyPage,
}: UseHistoryDrawerParams): HistoryChange[] {
  const [accumulatedHistory, setAccumulatedHistory] = useState<HistoryChange[]>([]);

  useEffect(() => {
    if (historyData?.results) {
      setAccumulatedHistory((prev) => {
        if (historyPage === 1) {
          return historyData.results || [];
        }
        // Prevent duplicates by checking IDs
        const existingIds = new Set(prev.map((entry) => entry.id));
        const filteredNewEntries = (historyData.results || []).filter((entry) => !existingIds.has(entry.id));
        return [...prev, ...filteredNewEntries];
      });
    } else if (!showHistoryDrawer) {
      setAccumulatedHistory([]);
    }
  }, [historyData, historyPage, showHistoryDrawer]);

  return accumulatedHistory;
}
