import React, { ReactNode } from 'react';
import { CheckIcon } from 'lucide-react';
import * as RCheckbox from '@radix-ui/react-checkbox';
import { cn } from '@cometa/utils';
import { ContainerError } from './ContainerError';

type CheckBoxGroup = {
  children: ReactNode;
  className?: string;
  error?: string;
};

function CheckBoxGroup({ className, children, error, ...props }: CheckBoxGroup) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn('flex flex-col gap-1', className)} {...props}>
        {children}
      </div>
      <ContainerError error={error} />
    </div>
  );
}

const CheckBoxItem = React.forwardRef<
  React.ElementRef<typeof RCheckbox.Root>,
  React.ComponentPropsWithoutRef<typeof RCheckbox.Root> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <>
    <RCheckbox.Root
      ref={ref}
      className={cn(
        'bg-white w-6 h-6 rounded border-2 focus:border-green border-gray-600 outline-none cursor-default text-green disabled:cursor-not-allowed disabled:border-gray-400',
        className,
        { 'border-red-500': error }
      )}
      {...props}
    >
      <RCheckbox.Indicator className="flex items-center justify-center">
        <CheckIcon className="w-3 h-3" />
      </RCheckbox.Indicator>
    </RCheckbox.Root>
  </>
));

const CheckBox = { Group: CheckBoxGroup, Item: CheckBoxItem };
export { CheckBox };
