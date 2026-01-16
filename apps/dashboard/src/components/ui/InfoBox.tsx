import { PropsWithChildren, ReactNode } from 'react';

export function Root({ children }: PropsWithChildren) {
  return <div className="bg-white py-5 px-8 rounded-xl border border-[#E4EBF6]">{children}</div>;
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};
export function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <div className="flex justify-between items-center border-b pb-4 border-[#919EAB3D]">
      <div>
        <div className="font-bold text-lg text-[#212B36]">{title}</div>
        {subtitle ? <div className="text-sm text-[#717993] pb-2">{subtitle}</div> : null}
      </div>

      {children}
    </div>
  );
}

export function Content({ children }: PropsWithChildren) {
  return <div className="mb-4 mt-4">{children}</div>;
}
