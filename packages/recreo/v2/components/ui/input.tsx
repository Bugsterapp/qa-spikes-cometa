import * as React from 'react';

import { cn } from '@cometa/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, isError, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      // Base styles matching InputField v1 but with v2 variables
      'flex w-full h-12 px-4 py-3 items-center self-stretch rounded-md border bg-transparent text-base font-normal leading-[150%] transition-colors box-border text-left',
      // Password specific padding for icon space
      type === 'password' && 'pr-12',
      // File input styles
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      // Placeholder and text colors using v2 variables
      'border-input text-foreground placeholder:text-muted-foreground',
      // Hover state
      'hover:border-ring',
      // Focus state - matching InputField focus behavior
      'focus:border-primary focus:border-2 focus-visible:outline-none focus-visible:ring-0 focus:py-[11px]',
      // Disabled state using v2 variables
      'disabled:cursor-not-allowed disabled:border-input disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50',
      // Error state using v2 variables
      isError && 'border-destructive bg-destructive/[0.04] hover:border-destructive focus:border-destructive',
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
