import { PropsWithChildren } from 'react';

export function CardLayout({ children }: PropsWithChildren) {
  return (
    <section className="max-w-xl bg-white w-full rounded-2xl flex flex-col gap-4 pb-8">
      <div className="h-24 md:h-14 bg-[#873aff] flex justify-end items-center gap-1 text-white text-xs px-4 sm:rounded-t-2xl bg-[url('/admissions/title-bg.svg')] -mt-4 sm:mt-0">
        <div className="-mb-2">Powered by</div>
        <img src="/admissions/logo.svg" alt="Logo Cometa" className="h-5" />
      </div>

      {children}
    </section>
  );
}
