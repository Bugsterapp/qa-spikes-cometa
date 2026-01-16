import { cn } from '@cometa/utils';
import { PropsWithChildren } from 'react';

type SidebarActionsProps = PropsWithChildren<{
  className?: string;
  variant?: 'default' | 'form';
}>;

export default function SidebarActions({ children, className, variant = 'default' }: SidebarActionsProps) {
  const baseClasses = 'flex gap-4 sticky bottom-0 z-10 bg-white';

  const variantClasses = {
    default: 'justify-between py-6 px-8 shadow-[inset_0_1px_0_rgba(145,158,171,0.24)]',
    form: 'justify-end px-8 py-4 border-t border-[#d0d8e9] rounded-bl-[8px] rounded-br-[8px] shrink-0 gap-2 items-center',
  };

  return <div className={cn(baseClasses, variantClasses[variant], className)}>{children}</div>;
}
