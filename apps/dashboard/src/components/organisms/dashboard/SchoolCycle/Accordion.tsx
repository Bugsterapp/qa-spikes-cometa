import { cn } from '@cometa/utils';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { AccordionContent, AccordionTriggerVariants } from '/src/components/ui/Accordion';

const Accordion = AccordionPrimitive.Root;

const AccordionItemVariants = cva('', {
  variants: {
    variant: {
      default: '',
      card: 'border-[#1890FF] border border-solid rounded-lg',
    },
  },
});

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & VariantProps<typeof AccordionItemVariants>
>(({ className, variant, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn(AccordionItemVariants({ variant }), className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & VariantProps<typeof AccordionTriggerVariants>
>(({ variant, className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger ref={ref} className={cn(AccordionTriggerVariants({ variant }), className)} {...props}>
      {children}
      <ChevronDown className="w-5 h-5 transition-transform duration-200 shrink-0" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
