import { VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '/src/utils/cn';

const StatusVariants = cva('col-span-2 px-2 w-fit text-xs font-bold rounded-md py-1', {
  variants: {
    variant: {
      success: 'text-[#229A16] border bg-[#54D62C] bg-opacity-16',
      info: 'text-info bg-info/12',
      muted: 'text-[#919EAB] bg-[#919EAB]/16',
      warning: 'text-[rgba(183,_129,_3,_1)] bg-[rgba(255,_193,_7,_0.16)]',
      error: 'text-[#D32F2F] bg-[#F44336]/16',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

export interface StatusProps extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof StatusVariants> {}

const Status = React.forwardRef<HTMLLabelElement, StatusProps>(({ className, variant, children, ...props }, ref) => (
  <label ref={ref} className={cn(StatusVariants({ variant }), className)} {...props}>
    {children}
  </label>
));

export default Status;
