import { TreeNodeComponent } from './tree-node';
import type { TreeNode, ColumnDefinition } from './types';
import type { EntityLabels } from './entity-labels';

type TreeViewProps<TData> = {
  nodes: TreeNode<TData>[];
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

export function TreeView<TData = unknown>({
  nodes,
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
}: TreeViewProps<TData>) {
  return (
    <div className="flex flex-col">
      {nodes.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
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
      ))}
    </div>
  );
}
