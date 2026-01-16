'use client';

import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { cn } from '@cometa/utils';
import type { ChatStatus } from 'ai';
import { Loader2Icon, SendIcon, SquareIcon, XIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes, KeyboardEventHandler } from 'react';
import { Children } from 'react';

export type PromptInputProps = HTMLAttributes<HTMLFormElement>;

export const PromptInput = ({ className, ...props }: PromptInputProps) => (
  <form
    className={cn(
      'w-full overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors dark:bg-gray-950',
      className
    )}
    {...props}
  />
);

export type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
};

export const PromptInputTextarea = ({
  onChange,
  className,
  placeholder = 'What would you like to know?',
  // minHeight = 48,
  // maxHeight = 164,
  ...props
}: PromptInputTextareaProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter') {
      // Don't submit if IME composition is in progress
      if (e.nativeEvent.isComposing) {
        return;
      }

      if (e.shiftKey) {
        // Allow newline
        return;
      }

      // Submit on Enter (without Shift)
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Textarea
      className={cn(
        'w-full resize-none border-0 bg-transparent px-4 py-3 text- outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400',
        'focus:outline-none focus:ring-0 focus-visible:ring-0',
        className
      )}
      name="message"
      onChange={(e) => {
        onChange?.(e);
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      {...props}
    />
  );
};

export type PromptInputToolbarProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputToolbar = ({ className, ...props }: PromptInputToolbarProps) => (
  <div className={cn('flex items-center justify-between px-3 pb-3', className)} {...props} />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({ className, ...props }: PromptInputToolsProps) => (
  <div className={cn('flex items-center gap-1', '[&_button:first-child]:rounded-bl-xl', className)} {...props} />
);

export type PromptInputButtonProps = ComponentProps<typeof Button>;

export const PromptInputButton = ({ variant = 'ghost', className, size, ...props }: PromptInputButtonProps) => {
  const newSize = size ?? Children.count(props.children) > 1 ? 'default' : 'icon';

  return (
    <Button
      className={cn(
        'shrink-0 gap-1.5 rounded-lg',
        variant === 'ghost' && 'text-muted-foreground',
        newSize === 'default' && 'px-3',
        className
      )}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  );
};

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: ChatStatus;
};

export const PromptInputSubmit = ({
  className,
  variant = 'default',
  size = 'icon',
  status,
  children,
  ...props
}: PromptInputSubmitProps) => {
  let Icon = <SendIcon className="size-4" />;

  if (status === 'submitted') {
    Icon = <Loader2Icon className="size-4 animate-spin" />;
  } else if (status === 'streaming') {
    Icon = <SquareIcon className="size-4" />;
  } else if (status === 'error') {
    Icon = <XIcon className="size-4" />;
  }

  return (
    <Button
      className={cn(
        'size-8 rounded-full transition-all',
        status === 'streaming' && 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600',
        className
      )}
      size={size}
      type="submit"
      variant={variant}
      {...props}
    >
      {children ?? Icon}
    </Button>
  );
};

export type PromptInputModelSelectProps = ComponentProps<typeof Select>;

export const PromptInputModelSelect = (props: PromptInputModelSelectProps) => <Select {...props} />;

export type PromptInputModelSelectTriggerProps = ComponentProps<typeof SelectTrigger>;

export const PromptInputModelSelectTrigger = ({ className, ...props }: PromptInputModelSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      "'border-none bg-transparent font-medium text-gray-500 shadow-none transition-colors' dark:text-gray-400",
      "'hover:bg-gray-100 hover:text-gray-950 [&[aria-expanded=true]]:bg-gray-100 [&[aria-expanded=true]]:text-foreground' dark:'hover:bg-gray-800 dark:hover:text-gray-50 dark:[&[aria-expanded=true]]:bg-gray-800",
      className
    )}
    {...props}
  />
);

export type PromptInputModelSelectContentProps = ComponentProps<typeof SelectContent>;

export const PromptInputModelSelectContent = ({ className, ...props }: PromptInputModelSelectContentProps) => (
  <SelectContent className={cn(className)} {...props} />
);

export type PromptInputModelSelectItemProps = ComponentProps<typeof SelectItem>;

export const PromptInputModelSelectItem = ({ className, ...props }: PromptInputModelSelectItemProps) => (
  <SelectItem className={cn(className)} {...props} />
);

export type PromptInputModelSelectValueProps = ComponentProps<typeof SelectValue>;

export const PromptInputModelSelectValue = ({ className, ...props }: PromptInputModelSelectValueProps) => (
  <SelectValue className={cn(className)} {...props} />
);
