import { Button } from '@cometa/recreo/v2';
import { cn } from '@cometa/utils';
import type React from 'react';
import type { HTMLAttributes } from 'react';
import { Tooltip } from '~/components/atoms/guardians/Tooltips';
import Info from '~/public/icons/ic_info.svg';

interface CheckoutFooterProps {
  children: React.ReactNode;
  open?: boolean;
  className?: string;
}

const CheckoutFooter = ({ className, children, open = false }: CheckoutFooterProps) => {
  if (!open) return null;
  return (
    <div
      data-testId="checkout-footer"
      className={cn(
        'fixed inset-x-0 bottom-0 w-full max-w-md m-auto bg-[#22283A] px-6 py-5 flex items-center justify-between text-white font-bold',
        className
      )}
    >
      {children}
    </div>
  );
};
interface TotalAmountProps {
  amount: number;
  currency?: string;
  className?: string;
}
export const TotalAmount = ({ amount, currency = 'MXN', className }: TotalAmountProps) => {
  const formatter = Intl.NumberFormat('es-MX', { style: 'currency', currency });
  return <h4 className={cn('text-3xl', className)}>{formatter.format(amount)}</h4>;
};

interface LabelItemsCountProps extends HTMLAttributes<HTMLDivElement> {
  count: number;
}

export const LabelItemsCount = ({ count, children, className }: LabelItemsCountProps) => (
  <div className={cn('inline-flex items-center gap-x-2', className)}>
    {children || null}
    <span className="leading-[0] max-w-4 flex justify-center p-2 text-xs text-[#22283A] bg-white rounded-full">
      {count}
    </span>
  </div>
);

interface ContainerInfoProps {
  children: React.ReactNode;
  className?: string;
}
export const ContainerInfo = ({ children, className }: ContainerInfoProps) => (
  <div className={cn('flex flex-col gap-y-2', className)}>{children}</div>
);

export const CheckoutFooterButton = ({
  children,
  onClick,
  loading,
  blockedMessage,
  disabled: disabledProp,
  ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading: boolean;
  blockedMessage?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const isBlocked = !!blockedMessage;
  const isDisabled = Boolean(disabledProp);
  const className = cn(
    'bg-white hover:bg-white/30 text-base text-[#22283A] py-2 px-8 h-[unset]',
    isBlocked &&
      '!bg-[#F8F9FB] !text-[#22283A] hover:!bg-[#F8F9FB] disabled:!bg-[#F8F9FB] disabled:!text-[#22283A] disabled:!opacity-100 !opacity-100 px-3 py-1.5 text-xs font-semibold rounded-full border border-[#E2E6EF] shadow-[0_1px_2px_rgba(34,40,58,0.08)]'
  );

  const content = loading ? (
    'Cargando...'
  ) : isBlocked ? (
    <span className="flex items-center gap-0.5">
      Pagos no disponibles
      <span className="text-[#22283A] [&_path]:!fill-[#22283A]">
        <Info />
      </span>
    </span>
  ) : (
    children
  );

  const button = (
    <Button onClick={onClick} disabled={loading || isBlocked || isDisabled} className={className} {...props}>
      {content}
    </Button>
  );

  if (!isBlocked) return button;

  return (
    <Tooltip message={blockedMessage} align="center" disableHover={false}>
      <span className="inline-flex">{button}</span>
    </Tooltip>
  );
};

export default CheckoutFooter;
