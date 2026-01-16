import { useState } from 'react';

export function useTreeExpansion(initialExpanded: string[] = []) {
  const [expandedIds, setExpandedIds] = useState<string[]>(initialExpanded);

  const toggleExpansion = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((expandedId) => expandedId !== id) : [...prev, id]));
  };

  const isExpanded = (id: string) => expandedIds.includes(id);

  const expandAll = (nodeIds: string[]) => {
    setExpandedIds((prev) => [...new Set([...prev, ...nodeIds])]);
  };

  const collapseAll = () => {
    setExpandedIds([]);
  };

  return {
    expandedIds,
    setExpandedIds,
    toggleExpansion,
    isExpanded,
    expandAll,
    collapseAll,
  };
}
