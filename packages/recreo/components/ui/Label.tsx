import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@cometa/utils';

const labelVariants = cva(
  'text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

type LabelProps = {
  isError?: boolean;
};

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants> & LabelProps
>(({ className, isError, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className, { 'text-red-500': isError })} {...props} />
));
