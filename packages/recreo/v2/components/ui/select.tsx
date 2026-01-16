'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from 'lucide-react';

import { cn } from '@cometa/utils';

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />;
}

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  isError?: boolean;
}

function SelectTrigger({ className, children, isError, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        // Base styles
        'flex h-12 w-full items-center justify-between gap-2 rounded-md border-2 border-transparent bg-transparent px-4 py-3',
        'text-base font-lota text-foreground font-normal leading-[150%] transition-colors',
        'data-[placeholder]:text-muted-foreground',
        // Shadow and hover states
        'shadow-[0_0_0_1px_hsl(var(--border))]',
        'hover:shadow-[0_0_0_1px_hsl(var(--ring))]',
        // Disabled state
        'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
        'disabled:shadow-[0_0_0_1px_hsl(var(--border))]',
        'disabled:hover:shadow-[0_0_0_1px_hsl(var(--border))]',
        // Focus and open states
        'focus:border-primary focus:shadow-none focus-visible:outline-none focus-visible:ring-0',
        'data-[state=open]:border-primary data-[state=open]:shadow-none',
        // Text alignment
        'text-left [&>span]:line-clamp-1',
        // Error state
        isError && [
          'border-transparent',
          'shadow-[0_0_0_1px_hsl(var(--destructive))]',
          'bg-destructive/[0.04]',
          'hover:shadow-[0_0_0_1px_hsl(var(--destructive))]',
          'focus:border-destructive focus:shadow-none',
          'data-[state=open]:border-destructive data-[state=open]:shadow-none',
        ],
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="h-5 w-5 text-muted-foreground opacity-70 transition-transform duration-200 data-[state=open]:rotate-180 flex-shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          // Base styles
          'relative z-50 max-h-[300px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
          // Animation
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2',
          // Positioning
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        sideOffset={2}
        style={{ width: 'var(--radix-select-trigger-width)' }}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-2',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('px-2 py-1.5 text-xs font-lota text-muted-foreground font-normal leading-[18px]', className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        // Base styles
        'relative flex w-full select-none items-center gap-2 rounded-md text-foreground',
        'py-2 pl-2 pr-8 text-sm font-lota font-normal leading-normal outline-none',
        'cursor-pointer mb-[2px] last:mb-0',
        // States
        'hover:bg-accent focus:bg-accent',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'data-[state=checked]:bg-primary/[0.08] data-[state=checked]:text-primary',
        'data-[state=checked]:font-semibold data-[state=checked]:rounded-lg',
        // Icon styles
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
