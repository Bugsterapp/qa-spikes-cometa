import * as React from 'react';

import { cn } from '@cometa/utils';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  isError?: boolean;
}

function Textarea({ className, isError, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles matching InputField v1 but with v2 variables
        'flex w-full min-h-20 px-4 py-3 items-start self-stretch rounded-md border bg-transparent text-base font-normal leading-[150%] transition-colors box-border resize-none',
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
      {...props}
    />
  );
}

export { Textarea };
