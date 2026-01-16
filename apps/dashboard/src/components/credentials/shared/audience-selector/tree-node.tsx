import { TreeRow } from './tree-row';
import type { TreeNode, ColumnDefinition } from './types';
import type { EntityLabels } from './entity-labels';

type TreeNodeProps<TData> = {
  node: TreeNode<TData>;
  level: number;
  columns: ColumnDefinition<TData>[];
  selectedIds: string[];
  expandedIds: string[];
  onSelectionToggle: (node: TreeNode<TData>, level: number) => void;
  onNodeToggle: (node: TreeNode<TData>, level: number) => void;
  onNodeClick?: (node: TreeNode<TData>, level: number) => void;
  showCheckboxes?: boolean;
  showExpandIcons?: boolean;
  showMetadataCount?: boolean;
  entityLabels?: EntityLabels;
  rowClassName?: (node: TreeNode<TData>, level: number) => string;
  getAllChildIds: (node: TreeNode<TData>) => string[];
  areAllSelected: (ids: string[]) => boolean;
  areSomeSelected: (ids: string[]) => boolean;
};

export function TreeNodeComponent<TData = unknown>({
  node,
  level,
  columns,
  selectedIds,
  expandedIds,
  onSelectionToggle,
  onNodeToggle,
  onNodeClick,
  showCheckboxes,
  showExpandIcons,
  showMetadataCount,
  entityLabels,
  rowClassName,
  getAllChildIds,
  areAllSelected,
  areSomeSelected,
}: TreeNodeProps<TData>) {
  const isExpanded = expandedIds.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  const getStudentIds = (n: TreeNode<TData>, lvl: number): string[] => {
    const ids: string[] = [];
    const traverse = (node: TreeNode<TData>, currentLevel: number) => {
      // A node is a student if:
      // 1. It's at level >= 2 (standard hierarchy: level → section → students)
      // 2. OR it's at level === 1 AND has no children (special case: "Sin sección" → students)
      const isStudent = currentLevel >= 2 || (currentLevel === 1 && (!node.children || node.children.length === 0));

      if (isStudent) {
        ids.push(node.id);
      }
      if (node.children) {
        node.children.forEach((child) => traverse(child, currentLevel + 1));
      }
    };
    traverse(n, lvl);
    return ids;
  };

  const studentIds = getStudentIds(node, level);
  // Check if this node itself is a student
  const isStudentNode = level >= 2 || (level === 1 && !hasChildren);
  const isSelected = isStudentNode ? selectedIds.includes(node.id) : areAllSelected(studentIds);
  const isIndeterminate = isStudentNode ? false : areSomeSelected(studentIds);

  return (
    <>
      <TreeRow
        node={node}
        level={level}
        columns={columns}
        selectedIds={selectedIds}
        isExpanded={isExpanded}
        isSelected={isSelected}
        isIndeterminate={isIndeterminate}
        onToggleExpansion={() => onNodeToggle(node, level)}
        onToggleSelection={() => onSelectionToggle(node, level)}
        onNodeClick={() => onNodeClick?.(node, level)}
        showCheckboxes={showCheckboxes}
        showExpandIcons={showExpandIcons}
        showMetadataCount={showMetadataCount}
        entityLabels={entityLabels}
        className={rowClassName?.(node, level)}
      />

      {isExpanded && hasChildren
        ? node.children?.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              columns={columns}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              onSelectionToggle={onSelectionToggle}
              onNodeToggle={onNodeToggle}
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
          ))
        : null}
    </>
  );
}
