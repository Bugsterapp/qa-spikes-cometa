import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@cometa/utils';

type ExtendedProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
  error?: string;
};

const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, ExtendedProps>(
  ({ className, error, ...props }, ref) => (
    <>
      <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </>
  )
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'bg-white w-6 h-6 rounded-full border-2 focus:border-green border-gray-600 outline-none cursor-default text-green disabled:cursor-not-allowed disabled:border-gray-400',
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
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
