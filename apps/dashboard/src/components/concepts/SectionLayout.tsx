import React from 'react';

interface SectionLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  edit?: React.ReactNode;
  actionButton?: React.ReactNode;
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({ title, description, children, edit, actionButton }) => (
  <div className="bg-white rounded-xl p-8 flex flex-col gap-8">
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#212B36] text-lg font-bold tracking-[-0.4px]">{title}</h2>
            {actionButton && <div className="ml-auto">{actionButton}</div>}
            {edit}
          </div>
          <div className="h-[1px] bg-[#91A0AB] bg-opacity-25" />
        </div>
        {description && <p className="text-[#637381] text-sm">{description}</p>}
      </div>
      {children}
    </div>
  </div>
);
