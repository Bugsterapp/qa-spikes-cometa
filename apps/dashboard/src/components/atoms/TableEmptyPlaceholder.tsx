import React from 'react';
import EmptyState from '../../assets/EmptyState.svg';

interface EmptyPlaceholderProps {
  context: {
    showEmptyStateImage: boolean;
    emptyStateText: string;
  };
}

const TableEmptyPlaceholder = ({ context: { showEmptyStateImage, emptyStateText } }: EmptyPlaceholderProps) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center w-full gap-4 bg-white grid-area-1">
    {showEmptyStateImage && <EmptyState />}
    <p className={`text-[#919EAB] ${showEmptyStateImage ? 'text-xs' : 'text-sm'}`}>{emptyStateText}</p>
  </div>
);

export default TableEmptyPlaceholder;
