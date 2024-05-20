import React, { ReactElement } from 'react';
import { cn } from 'lib/cn';

interface PaymentCardOptionProps {
  action: () => void;
  icon: ReactElement;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}

const PaymentCardOption = ({ action, icon, title, subtitle, disabled }: PaymentCardOptionProps) => (
  <div
    className={cn('bg-white rounded-2xl shadow-sm px-5 py-7 cursor-pointer', {
      'bg-[#F6F6F6] border-solid border-[#C4C4C4] cursor-not-allowed border': disabled,
    })}
    onClick={!disabled ? action : undefined}
  >
    <div className="grid grid-cols-[25px_1fr] gap-x-4 items-center">
      <div>{icon}</div>

      <div className="flex">
        <span
          className={cn('font-semibold text-lg text-[#14208C]', {
            'text-[#57537A]': disabled,
          })}
        >
          {title}
        </span>
      </div>
      {subtitle && <span className="text-sm mt-2 text-[#344054] col-start-2">{subtitle}</span>}
    </div>
  </div>
);

export default PaymentCardOption;
