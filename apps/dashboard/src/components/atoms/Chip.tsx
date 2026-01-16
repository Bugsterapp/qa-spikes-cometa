import { type AnchorHTMLAttributes, type HTMLAttributes, type PropsWithChildren, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
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
  {
    intent: VariantProps<typeof ChipVariants>['variant'];
  } & Omit<VariantProps<typeof ChipVariants>, 'variant'> &
    ((HTMLAttributes<HTMLSpanElement> & { as?: 'span' }) | (AnchorHTMLAttributes<HTMLAnchorElement> & { as?: 'a' }))
>;

export const ChipVariants = cva('text-sm px-2 py-1 font-bold font-lota', {
  variants: {
    variant: {
      underline: 'text-[#229A16] bg-[#54D62C]/[0.12]',
      info: 'text-[#1890FF] bg-[#1890FF]/[0.12]',
      error: 'text-[#FF4842] bg-[#FF4842]/[0.12]',
      warning: 'text-[#B78103] bg-[#FFC107]/[0.12]',
      disabled: 'text-[#8B93A0] bg-[#8B93A014]',
      neutral: 'text-[#454F5B] bg-[#919EAB3D]/[0.24]',
      success: 'text-[#229A16] bg-[#54D62C]/[0.12]',
      darkInfo: 'text-[#0C53B7] bg-[#1890FF]/[0.16]',
      not_requested: 'text-[#0C53B7] bg-[#1890FF]/[0.16]',
      sponsored: 'text-[#0C53B7] bg-[#1890FF]/[0.16]',
      infoFixed: 'text-[#1890FF] bg-[#1890FF]/[0.12] w-[100px] h-[22px] py-0 font-semibold',
    },
    rounded: {
      full: 'rounded-full max-h-6 max-w-[24px] flex items-center justify-center text-center',
      default: 'rounded-md',
    },
    clamp: {
      line: 'line-clamp-1',
    },
  },
  defaultVariants: {
    variant: 'info',
    rounded: 'default',
  },
});

const InvoiceChip = forwardRef<any, Props>(
  ({ children, intent, rounded, clamp, as = 'span', className, ...props }, ref) => {
    const Tag = as;
    const classNames = cn(ChipVariants({ variant: intent, rounded, clamp }), className);
    return (
      <Tag className={classNames} ref={ref} {...props}>
        {children}
      </Tag>
    );
  }
);

export default InvoiceChip;
