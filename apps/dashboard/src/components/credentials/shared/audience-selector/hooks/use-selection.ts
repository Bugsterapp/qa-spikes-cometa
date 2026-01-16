import { useState, useCallback } from 'react';
import type { SelectionMode } from '../types';

export function useSelection(mode: SelectionMode = 'multiple') {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback(
    (id: string, allChildIds?: string[]) => {
      if (mode === 'single') {
        setSelectedIds([id]);
        return;
      }

      if (mode === 'hierarchical' && allChildIds) {
        setSelectedIds((prev) => {
          const isSelected = prev.includes(id);
          if (isSelected) {
            return prev.filter((selectedId) => ![id, ...allChildIds].includes(selectedId));
          }
          return [...prev, id, ...allChildIds];
        });
        return;
      }

      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]));
    },
    [mode]
  );

  const areAllSelected = (ids: string[]) => ids.length > 0 && ids.every((id) => selectedIds.includes(id));

  const areSomeSelected = (ids: string[]) =>
    ids.length > 0 && ids.some((id) => selectedIds.includes(id)) && !areAllSelected(ids);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    areAllSelected,
    areSomeSelected,
    clearSelection: () => setSelectedIds([]),
  };
}
