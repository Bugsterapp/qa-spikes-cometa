import type { EntityLabels } from './entity-labels';

export type TreeNodeWarning = {
  show: boolean;
  text?: string;
  tooltip?: string;
};

export type TreeNode<TData = unknown> = {
  id: string;
  name: string;
  data: TData;
  children?: TreeNode<TData>[];
  metadata?: {
    count?: number;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    warning?: TreeNodeWarning;
    nodeType?: 'level' | 'section' | 'item';
  };
};

export type ColumnDefinition<TData = unknown> = {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  render: (node: TreeNode<TData>, level: number) => React.ReactNode;
};

export type SelectionMode = 'single' | 'multiple' | 'hierarchical';

export type AudienceSelectorProps<TData = unknown> = {
  data: TreeNode<TData>[];
  columns: ColumnDefinition<TData>[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  selectionMode?: SelectionMode;
  expandedIds?: string[];
  onExpansionChange?: (ids: string[]) => void;
  onNodeClick?: (node: TreeNode<TData>, level: number) => void;
  onNodeExpand?: (node: TreeNode<TData>, level: number) => void;
  onNodeCollapse?: (node: TreeNode<TData>, level: number) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  showCheckboxes?: boolean;
  showExpandIcons?: boolean;
  showMetadataCount?: boolean;
  showFooter?: boolean;
  entityLabels?: EntityLabels;
  className?: string;
  rowClassName?: (node: TreeNode<TData>, level: number) => string;
  cellClassName?: (column: ColumnDefinition<TData>, level: number) => string;
};
