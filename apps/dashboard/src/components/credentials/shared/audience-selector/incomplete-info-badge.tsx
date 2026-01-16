import { AlertTriangle } from 'lucide-react';
import type { TreeNodeWarning } from './types';

type IncompleteInfoBadgeProps = {
  warning: TreeNodeWarning;
  className?: string;
};

export function IncompleteInfoBadge({ warning, className = '' }: IncompleteInfoBadgeProps) {
  if (!warning.show) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 ${className}`}
      title={warning.tooltip}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
      {warning.text && <span className="text-xs font-medium text-amber-700">{warning.text}</span>}
    </div>
  );
}
