import * as Accordion from '@radix-ui/react-accordion';
import * as React from 'react';
import { cn } from '../../utils/cn';
import Arrow from '../../../public/assets/icons/accordion_arrow.svg';

export const AccordionItem = React.forwardRef<HTMLDivElement, Accordion.AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Item
      className={cn('bg-[#F4F6F8] overflow-hidden first:mt-0 first:rounded-t-lg last:rounded-b-lg mx-1', className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Accordion.Item>
  )
);

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, Accordion.AccordionTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="flex data-[state=open] transition-all">
      <Accordion.Trigger
        className={cn(
          'bg-gray-200 group flex flex-1 px-5 py-4 items-center leading-none outline-none cursor-pointer',
          className
        )}
        {...props}
        ref={forwardedRef}
        asChild
      >
        <div>
          <Arrow className="text-[#3366FF] -rotate-90 group-data-[state=open]:rotate-0 transition-transform w-4 ease-[cubic-bezier(0.87,_0,_0.13,_1)] mr-3" />
          {children}
        </div>
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

export const AccordionContent = React.forwardRef<HTMLDivElement, Accordion.AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={cn(
        'px-5 pb-5 group pt-0 text-[15px] border-b-[#F4F6F8] border-solid border-b data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="bg-white py-4 px-[60px] transition-colors hover:bg-blue-secondary-200/[.04] rounded-lg content-center">
        {children}
      </div>
    </Accordion.Content>
  )
);
