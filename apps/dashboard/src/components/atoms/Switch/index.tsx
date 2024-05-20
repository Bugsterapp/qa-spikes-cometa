import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { twMerge } from 'tailwind-merge';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={twMerge(
      'peer mx-1 inline-flex h-3.5 w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-[#ADE4C9] dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=unchecked]:bg-gray-300 dark:data-[state=checked]:bg-[#ADE4C9]',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={twMerge(
        'pointer-events-none block h-5 w-5 rounded-full bg-[#00AB55] shadow-lg ring-0 transition-transform data-[state=unchecked]:-translate-x-1 data-[state=unchecked]:bg-gray-500 data-[state=checked]:translate-x-4'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
