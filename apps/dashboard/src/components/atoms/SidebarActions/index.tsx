import { PropsWithChildren } from 'react';

type SidebarActionsProps = PropsWithChildren<{
  className?: string;
}>;

export default function SidebarActions({ children, className }: SidebarActionsProps) {
  return (
    <div
      className={`flex justify-between py-6 px-8 gap-4 sticky bottom-0 bg-white shadow-[inset_0_1px_0_rgba(145,158,171,0.24)] ${className}`}
    >
      {children}
    </div>
  );
}
