import { cn } from '@cometa/utils';
import React from 'react';

interface EmptyStateProps {
  readonly imageSrc: string;
  readonly title: string;
  readonly subtitle: string;
  size?: 'md' | 'lg';
}

export function EmptyState({ imageSrc, title, subtitle, size = 'lg' }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center gap-2', size === 'md' ? 'px-10' : '')}>
      <div className="flex flex-col items-center gap-3 w-full">
        <div className={cn('relative shrink-0', size === 'md' ? 'w-[120px] h-[120px]' : 'size-40')}>
          <img src={imageSrc} alt="" className="size-full object-cover" />
        </div>
        <p className="text-[#1c1c1d] text-xl font-semibold text-center leading-normal whitespace-pre-wrap">{title}</p>
      </div>
      <div className="flex flex-col justify-center w-full">
        <p className="text-[#535765] text-base font-normal text-center leading-5 whitespace-pre-wrap">{subtitle}</p>
      </div>
    </div>
  );
}
