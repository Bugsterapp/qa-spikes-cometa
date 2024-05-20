import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { forwardRef } from 'react';
import { cn } from '~/lib/cn';

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef<HTMLDivElement, AccordionPrimitive.AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <AccordionPrimitive.Item className={cn('overflow-hidden', className)} {...props} ref={forwardedRef}>
      {children}
    </AccordionPrimitive.Item>
  )
);

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionPrimitive.AccordionTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <AccordionPrimitive.Trigger
      className={cn('group leading-none outline-none cursor-pointer', className)}
      {...props}
      ref={forwardedRef}
      asChild
    >
      {children}
    </AccordionPrimitive.Trigger>
  )
);

export const AccordionContent = forwardRef<HTMLDivElement, AccordionPrimitive.AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <AccordionPrimitive.Content
      className={cn(
        'group overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </AccordionPrimitive.Content>
  )
);
