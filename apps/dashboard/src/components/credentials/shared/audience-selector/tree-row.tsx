import { ChevronRight, ChevronDown } from 'lucide-react';
import type { TreeNode, ColumnDefinition } from './types';
import { IncompleteInfoBadge } from './incomplete-info-badge';
import { formatEntityCount, DEFAULT_ENTITY_LABELS, type EntityLabels } from './entity-labels';
import { shouldShowWarning } from './tree-utils';

type TreeRowProps<TData> = {
  node: TreeNode<TData>;
  level: number;
  columns: ColumnDefinition<TData>[];
  selectedIds: string[];
  isExpanded: boolean;
  isSelected: boolean;
  isIndeterminate: boolean;
  onToggleExpansion: () => void;
  onToggleSelection: () => void;
  onNodeClick?: () => void;
  showCheckboxes?: boolean;
  showExpandIcons?: boolean;
  showMetadataCount?: boolean;
  entityLabels?: EntityLabels;
  className?: string;
};

export function TreeRow<TData = unknown>({
  node,
  level,
  columns,
  selectedIds,
  isExpanded,
  isSelected,
  isIndeterminate,
  onToggleExpansion,
  onToggleSelection,
  showCheckboxes = true,
  showExpandIcons = true,
  showMetadataCount = false,
  entityLabels,
  className: _className,
}: TreeRowProps<TData>) {
  const hasChildren = node.children && node.children.length > 0;
  const labels = entityLabels ?? DEFAULT_ENTITY_LABELS;
  const showWarning = shouldShowWarning(node, selectedIds);
  const warning = showWarning ? node.metadata?.warning : undefined;

  // Generate grid template columns based on column widths
  const gridTemplateColumns = columns
    .map((col) => {
      if (col.width) return col.width;
      if (col.minWidth) return `minmax(${col.minWidth}, 1fr)`;
      return '1fr';
    })
    .join(' ');

  // Determine if this node should render as a level/section or as an item
  // Use nodeType from metadata to identify the type of node
  const nodeType = node.metadata?.nodeType;
  const isLevelOrSection = nodeType === 'level' || nodeType === 'section';

  // Render level/section nodes
  if (isLevelOrSection && level < 2) {
    const paddingLeft = level === 0 ? 'pl-6' : 'pl-12';
    const hasStudents = node.metadata?.count && node.metadata.count > 0;

    return (
      <div
        className={`
          flex items-center
          bg-white
          border-b border-neutral-200
          ${level === 0 ? 'border-t border-neutral-200' : ''}
          ${paddingLeft}
          pr-6 py-6
          ${hasStudents ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-not-allowed opacity-60'}
          transition-colors
        `}
        onClick={hasStudents ? onToggleExpansion : undefined}
      >
        {showExpandIcons && hasChildren ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2 text-[#7c3aed]" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-[#7c3aed]" />
            )}
          </>
        ) : null}

        {showCheckboxes ? (
          <input
            type="checkbox"
            className="mr-2 w-4 h-4 rounded border-gray-300 text-[#7c3aed] focus:ring-[#7c3aed] focus:ring-2 focus:ring-offset-0 cursor-pointer accent-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-50"
            checked={isSelected}
            disabled={!hasStudents}
            ref={(input) => {
              if (input) input.indeterminate = isIndeterminate;
            }}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelection();
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}

        <span className={level === 0 ? 'font-semibold text-sm text-gray-700' : 'text-sm text-gray-700'}>
          {node.name}
        </span>

        {warning ? <IncompleteInfoBadge warning={warning} className="ml-auto mr-3" /> : null}

        {showMetadataCount && node.metadata?.count !== undefined ? (
          <span className={`text-sm text-gray-500 ${!warning ? 'ml-auto' : ''}`}>
            {formatEntityCount(node.metadata.count, labels)}
          </span>
        ) : null}
      </div>
    );
  }

  // Render student nodes (without children) - with columns

  return (
    <div
      className="grid items-center bg-white border-b border-neutral-200 pl-24 pr-6 py-6 text-sm hover:bg-neutral-50 transition-colors"
      style={{ gridTemplateColumns }}
    >
      {columns.map((column, index) => (
        <div key={column.key} className={index === 0 ? 'flex items-center' : ''}>
          {index === 0 && showCheckboxes ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection();
              }}
              className="mr-4 w-4 h-4 rounded border-gray-300 text-[#7c3aed] focus:ring-[#7c3aed] focus:ring-2 focus:ring-offset-0 cursor-pointer accent-[#7c3aed]"
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}
          {column.render(node, level)}
        </div>
      ))}
    </div>
  );
}
