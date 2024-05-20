import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '/src/utils/cn';
import React from 'react';
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-testid="generic-checkbox"
    className={cn(
      'peer h-5 w-5 shrink-0 rounded-[4px] border-2 border-[#667280] ring-offset-background focus-visible:outline-none focus-viible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green data-[state=checked]:text-white data-[state=indeterminate]:bg-green data-[state=indeterminate]:text-white data-[state=checked]:border-transparent data-[state=indeterminate]:border-transparent',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      {props.checked === 'indeterminate' ? (
        <svg width="8" height="2" viewBox="0 0 8 2" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="8" height="2" rx="1" fill="white" />
        </svg>
      ) : null}
      {props.checked === true ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', top: '1px' }}
        >
          <path
            d="M4.5 7.5L7.5 10.5L13.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
