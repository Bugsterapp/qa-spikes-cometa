import { useCallback } from 'react';
import { cn } from '@cometa/utils';
import { TreeHeader } from './tree-header';
import { TreeView } from './tree-view';
import { useTreeExpansion } from './hooks/use-tree-expansion';
import type { AudienceSelectorProps, TreeNode } from './types';
import { formatEntityCount, DEFAULT_ENTITY_LABELS } from './entity-labels';

function DefaultLoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-galaxy-500" />
    </div>
  );
}

function DefaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
      <p className="text-sm">No hay datos disponibles</p>
    </div>
  );
}

export function AudienceSelector<TData = unknown>({
  data,
  columns,
  selectedIds,
  onSelectionChange,
  selectionMode: _selectionMode = 'multiple',
  expandedIds: controlledExpandedIds,
  onExpansionChange,
  onNodeClick,
  onNodeExpand,
  onNodeCollapse,
  isLoading = false,
  emptyState,
  loadingState,
  showCheckboxes = true,
  showExpandIcons = true,
  showMetadataCount = false,
  showFooter = false,
  entityLabels,
  className,
  rowClassName,
}: AudienceSelectorProps<TData>) {
  const internalExpansion = useTreeExpansion();
  const expandedIds = controlledExpandedIds ?? internalExpansion.expandedIds;
  const toggleExpansion = useCallback(
    (id: string) => {
      if (!onExpansionChange) {
        internalExpansion.toggleExpansion(id);
        return;
      }

      const newExpanded = expandedIds.includes(id) ? expandedIds.filter((eid) => eid !== id) : [...expandedIds, id];
      onExpansionChange(newExpanded);
    },
    [onExpansionChange, expandedIds, internalExpansion]
  );

  const getAllChildIds = useCallback((node: TreeNode<TData>): string[] => {
    if (!node.children) return [];
    return node.children.flatMap((child) => [child.id, ...getAllChildIds(child)]);
  }, []);

  const collectStudentIds = useCallback((node: TreeNode<TData>, level: number, accumulator: string[]) => {
    const isStudent = level >= 2 || (level === 1 && (!node.children || node.children.length === 0));

    if (isStudent) {
      accumulator.push(node.id);
    }
    if (node.children) {
      node.children.forEach((child) => collectStudentIds(child, level + 1, accumulator));
    }
  }, []);

  const getStudentIdsFromNode = useCallback(
    (node: TreeNode<TData>, level: number): string[] => {
      const ids: string[] = [];
      collectStudentIds(node, level, ids);
      return ids;
    },
    [collectStudentIds]
  );

  const areAllSelected = useCallback(
    (ids: string[]) => ids.length > 0 && ids.every((id) => selectedIds.includes(id)),
    [selectedIds]
  );

  const areSomeSelected = useCallback(
    (ids: string[]) => ids.length > 0 && ids.some((id) => selectedIds.includes(id)) && !areAllSelected(ids),
    [selectedIds, areAllSelected]
  );

  const handleNodeToggle = useCallback(
    (node: TreeNode<TData>, level: number) => {
      if (node.children && node.children.length > 0) {
        toggleExpansion(node.id);
        const isExpanding = !expandedIds.includes(node.id);
        if (isExpanding) {
          onNodeExpand?.(node, level);
        } else {
          onNodeCollapse?.(node, level);
        }
      }
    },
    [toggleExpansion, expandedIds, onNodeExpand, onNodeCollapse]
  );

  const getAllStudentIds = useCallback(
    (nodes: TreeNode<TData>[]): string[] => {
      const ids: string[] = [];
      nodes.forEach((node) => collectStudentIds(node, 0, ids));
      return ids;
    },
    [collectStudentIds]
  );

  const handleSelectionToggle = useCallback(
    (node: TreeNode<TData>, level: number) => {
      const studentIds = getStudentIdsFromNode(node, level);

      if (studentIds.length === 0) return;

      const allSelected = studentIds.every((id) => selectedIds.includes(id));
      const newSelection = allSelected
        ? selectedIds.filter((id) => !studentIds.includes(id))
        : [...selectedIds, ...studentIds.filter((id) => !selectedIds.includes(id))];

      onSelectionChange(newSelection);
    },
    [selectedIds, onSelectionChange, getStudentIdsFromNode]
  );

  const handleSelectAll = useCallback(() => {
    const allStudentIds = getAllStudentIds(data);
    const allSelected = areAllSelected(allStudentIds);

    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allStudentIds);
    }
  }, [data, getAllStudentIds, areAllSelected, onSelectionChange]);

  if (isLoading) {
    return loadingState ?? <DefaultLoadingState />;
  }

  if (!data || data.length === 0) {
    return emptyState ?? <DefaultEmptyState />;
  }

  const allStudentIds = getAllStudentIds(data);
  const isAllSelected = areAllSelected(allStudentIds);
  const isSomeSelected = areSomeSelected(allStudentIds);

  return (
    <>
      <div className={cn('rounded-xl shadow', className)}>
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <TreeHeader
            columns={columns}
            showCheckboxes={showCheckboxes}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onToggleAll={handleSelectAll}
          />

          <TreeView
            nodes={data}
            columns={columns}
            selectedIds={selectedIds}
            expandedIds={expandedIds}
            onSelectionToggle={handleSelectionToggle}
            onNodeToggle={handleNodeToggle}
            onNodeClick={onNodeClick}
            showCheckboxes={showCheckboxes}
            showExpandIcons={showExpandIcons}
            showMetadataCount={showMetadataCount}
            entityLabels={entityLabels}
            rowClassName={rowClassName}
            getAllChildIds={getAllChildIds}
            areAllSelected={areAllSelected}
            areSomeSelected={areSomeSelected}
          />
        </div>
      </div>

      {showFooter ? (
        <div className="p-4 border bg-gray-100 border-gray-200 rounded-lg flex items-center justify-between text-sm">
          <p className="font-semibold">Total</p>
          <p>{formatEntityCount(selectedIds.length, entityLabels ?? DEFAULT_ENTITY_LABELS)}</p>
        </div>
      ) : null}
    </>
  );
}
