import type { TreeNode } from './types';

export function hasSelectedDescendants<TData>(node: TreeNode<TData>, selectedIds: string[]): boolean {
  if (selectedIds.includes(node.id)) {
    return true;
  }

  if (node.children) {
    return node.children.some((child) => hasSelectedDescendants(child, selectedIds));
  }

  return false;
}

export function hasSelectedDescendantsWithWarning<TData>(node: TreeNode<TData>, selectedIds: string[]): boolean {
  if (selectedIds.includes(node.id) && node.metadata?.warning?.show) {
    return true;
  }

  if (node.children) {
    return node.children.some((child) => hasSelectedDescendantsWithWarning(child, selectedIds));
  }

  return false;
}

export function shouldShowWarning<TData>(node: TreeNode<TData>, selectedIds: string[]): boolean {
  if (!node.metadata?.warning?.show) {
    return false;
  }

  const hasChildren = node.children && node.children.length > 0;
  const isStudent = !hasChildren;

  if (isStudent) {
    return selectedIds.includes(node.id);
  }

  return hasSelectedDescendantsWithWarning(node, selectedIds);
}
