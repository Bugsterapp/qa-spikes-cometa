import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@cometa/utils';
import { ContainerError } from './ContainerError';

type ExtendedProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
  error?: string;
};

const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, ExtendedProps>(
  ({ className, error, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      <RadioGroupPrimitive.Root className={cn('flex flex-col gap-1', className)} {...props} ref={ref} />
      <ContainerError error={error} />
    </div>
  )
);

const RadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'bg-white min-w-6 min-h-6 rounded-full border-2 focus:border-green border-gray-600 outline-none cursor-default text-green disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400',
      className,
      { 'border-red-500': error }
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <Circle className="w-3 h-3 text-current fill-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));

const Radio = { Group: RadioGroup, Item: RadioItem };
export { Radio };
