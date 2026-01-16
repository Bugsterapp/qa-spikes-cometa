import { ReactNode } from 'react';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';

type LegalDocumentDetailsDrawerProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function LegalDocumentDetailsDrawer({ title, onClose, children }: Readonly<LegalDocumentDetailsDrawerProps>) {
  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title={title}
        onClose={onClose}
        boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
        titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
      />
      <div className="flex-1 overflow-y-auto px-8">
        <div className="flex flex-col gap-8 mb-6 pt-8">{children}</div>
      </div>
    </div>
  );
}
