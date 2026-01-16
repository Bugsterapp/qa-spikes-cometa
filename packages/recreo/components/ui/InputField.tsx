import * as React from 'react';

import { cn } from '@cometa/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, type, isError, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex w-full h-12 px-4 py-3 items-center justify-center self-stretch rounded-md border border-neutral-300 bg-transparent text-neutral-800 font-lota text-base font-normal leading-[150%] align-middle transition-colors box-border file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 hover:border-neutral-500 focus:border-galaxy-500 focus:border-2 focus-visible:outline-none focus-visible:ring-0 focus:py-[11px] disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:opacity-100',
        isError && 'border-error-500 bg-error-500/[0.04] hover:border-error-500 focus:border-error-500',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
InputField.displayName = 'InputField';

export { InputField };
