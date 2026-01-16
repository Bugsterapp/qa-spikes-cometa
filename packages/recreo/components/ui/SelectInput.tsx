import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@cometa/utils';

const SelectInput = SelectPrimitive.Root;

const SelectInputGroup = SelectPrimitive.Group;

const SelectInputValue = SelectPrimitive.Value;

const SelectInputTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { isError?: boolean }
>(({ className, children, isError, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-12 w-full items-center justify-between rounded-md border-2 border-transparent bg-transparent px-4 py-3 text-base font-lota text-neutral-800 font-normal leading-[150%] transition-colors gap-2 data-[placeholder]:text-neutral-400',
      'shadow-[0_0_0_1px_theme(colors.neutral.300)] hover:shadow-[0_0_0_1px_theme(colors.neutral.500)]',
      'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 disabled:shadow-[0_0_0_1px_theme(colors.neutral.300)] disabled:hover:shadow-[0_0_0_1px_theme(colors.neutral.300)]',
      'focus:border-galaxy-500 focus:shadow-none focus-visible:outline-none focus-visible:ring-0',
      'data-[state=open]:border-galaxy-500 data-[state=open]:shadow-none',
      'text-left [&>span]:line-clamp-1',
      isError &&
        'border-transparent shadow-[0_0_0_1px_theme(colors.error.500)] bg-error-500/[0.04] hover:shadow-[0_0_0_1px_theme(colors.error.500)] focus:border-error-500 focus:shadow-none data-[state=open]:border-error-500 data-[state=open]:shadow-none',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-5 w-5 opacity-70 text-neutral-500 transition-transform duration-200 data-[state=open]:rotate-180 flex-shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectInputTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectInputScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4 text-neutral-500" />
  </SelectPrimitive.ScrollUpButton>
));
SelectInputScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectInputScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4 text-neutral-500" />
  </SelectPrimitive.ScrollDownButton>
));
SelectInputScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectInputContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-[300px] overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-800 shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      sideOffset={2}
      style={{ width: 'var(--radix-select-trigger-width)' }}
      {...props}
    >
      <SelectInputScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-2',
          position === 'popper' && 'h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectInputScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectInputContent.displayName = SelectPrimitive.Content.displayName;

const SelectInputLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-neutral-600 font-lota text-xs font-normal leading-[18px]', className)}
    {...props}
  />
));
SelectInputLabel.displayName = SelectPrimitive.Label.displayName;

const SelectInputItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-md text-neutral-800 py-2 px-2 min-h-10 text-base font-lota font-normal outline-none hover:bg-neutral-50 focus:bg-neutral-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mb-[2px] last:mb-0',
      'data-[state=checked]:bg-galaxy-500/[0.08] data-[state=checked]:text-galaxy-500 data-[state=checked]:font-semibold data-[state=checked]:rounded-lg',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="py-1 whitespace-normal break-words">{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectInputItem.displayName = SelectPrimitive.Item.displayName;

const SelectInputSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-neutral-200', className)} {...props} />
));
SelectInputSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  SelectInput,
  SelectInputGroup,
  SelectInputValue,
  SelectInputTrigger,
  SelectInputContent,
  SelectInputLabel,
  SelectInputItem,
  SelectInputSeparator,
  SelectInputScrollUpButton,
  SelectInputScrollDownButton,
};
