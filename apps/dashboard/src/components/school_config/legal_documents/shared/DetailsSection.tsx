import { ReactNode } from 'react';

type DetailsSectionProps = {
  title: string;
  children: ReactNode;
};

export function DetailsSection({ title, children }: Readonly<DetailsSectionProps>) {
  return (
    <div className="content-stretch flex flex-col gap-2 items-start justify-start relative shrink-0 w-full">
      <div className="font-lota leading-[0] min-w-full not-italic relative shrink-0 text-[#22283a] text-base font-semibold">
        <p className="leading-6">{title}</p>
      </div>
      <div className="relative rounded-lg shrink-0 w-full">
        <div className="content-stretch flex flex-col items-start justify-center overflow-clip relative">
          {children}
        </div>
        <div
          aria-hidden="true"
          className="absolute border border-[#eceff6] border-solid inset-0 pointer-events-none rounded-lg"
        />
      </div>
    </div>
  );
}
