'use client';

import { formatPrice } from '/src/utils/general';

export type SimulationDisplayProps = {
  finalTotal?: string;
  variant?: 'default' | 'integrated' | 'standalone';
};

export function SimulationDisplay({ finalTotal = '0.00', variant = 'standalone' }: SimulationDisplayProps) {
  if (variant === 'integrated') {
    return (
      <>
        <div className="h-px w-full bg-[#d0d8e9]" />
        <div className="flex items-start justify-between leading-none text-lg whitespace-pre w-full">
          <p className="font-['Lota_Grotesque'] font-semibold text-[#22283a]">Total a pagar:</p>
          <p className="font-['Lota_Grotesque'] font-semibold text-[#22283a] text-right">{formatPrice(finalTotal)}</p>
        </div>
      </>
    );
  }

  if (variant === 'default') {
    return (
      <div className="bg-[#eceff6] -mx-4 -mb-4 w-[calc(100%+2rem)] rounded-b-lg">
        <div className="h-px w-full bg-[#d0d8e9]" />
        <div className="flex items-start justify-between leading-none text-lg whitespace-pre w-full px-4 py-3">
          <p className="font-['Lota_Grotesque'] font-semibold text-[#22283a]">Total a pagar:</p>
          <p className="font-['Lota_Grotesque'] font-semibold text-[#22283a] text-right">{formatPrice(finalTotal)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center w-full">
      <div className="flex-1 bg-white border border-[#d0d8e9] rounded-lg px-4 py-3">
        <div className="flex items-center justify-between leading-none text-center whitespace-pre">
          <p className="font-['Lota_Grotesque'] font-semibold text-base text-[#22283a]">Total a pagar:</p>
          <p className="font-['Lota_Grotesque'] font-bold text-xl text-[#22283a]">{formatPrice(finalTotal)}</p>
        </div>
      </div>
    </div>
  );
}
