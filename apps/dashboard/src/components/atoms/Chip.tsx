import { AnchorHTMLAttributes, HTMLAttributes, PropsWithChildren, forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '/src/utils/cn';

export type Intent =
  | 'underline'
  | 'info'
  | 'error'
  | 'warning'
  | 'disabled'
  | 'neutral'
  | 'success'
  | 'not_requested'
  | 'sponsored';

export type Props = PropsWithChildren<
  | {
      intent: VariantProps<typeof ChipVariants>['variant'];
    } & Omit<VariantProps<typeof ChipVariants>, 'variant'> &
      ((HTMLAttributes<HTMLSpanElement> & { as?: 'span' }) | (AnchorHTMLAttributes<HTMLAnchorElement> & { as?: 'a' }))
>;

export const ChipVariants = cva('text-sm px-2 py-1 font-bold', {
  variants: {
    variant: {
      underline: 'text-[#229A16] bg-[#54D62C]/[0.12]',
      info: 'text-[#1890FF] bg-[#1890FF]/[0.12]',
      error: 'text-[#FF4842] bg-[#FF4842]/[0.12]',
      warning: 'text-[#B78103] bg-[#B78103]/[0.12]',
      disabled: 'text-[#919EAB] bg-[#919EAB]/[0.16]',
      neutral: 'text-[#454F5B] bg-[#919EAB3D]/[0.24]',
      success: 'text-[#229A16] bg-[#54D62C]/[0.12]',
      darkInfo: 'text-[#0C53B7] bg-[#1890FF]/[0.16]',
    },
    rounded: {
      full: 'rounded-full max-h-6 max-w-[24px] flex items-center justify-center text-center',
      default: 'rounded-md',
    },
  },
  defaultVariants: {
    variant: 'info',
    rounded: 'default',
  },
});

const InvoiceChip = forwardRef<any, Props>(({ children, intent, rounded, as = 'span', ...props }, ref) => {
  const Tag = as;
  const classNames = cn(ChipVariants({ variant: intent, rounded }));
  return (
    <Tag className={classNames} ref={ref} {...props}>
      {children}
    </Tag>
  );
});

export default InvoiceChip;
