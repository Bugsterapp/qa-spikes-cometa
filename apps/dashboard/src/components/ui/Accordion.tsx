import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import ChevronRightIcon from '/public/assets/icons/ic_chevron_right.svg';
import { cn } from '/src/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const Accordion = AccordionPrimitive.Root;

const AccordionItemVariants = cva('', {
  variants: {
    variant: {
      default: 'border-b',
      card: 'my-2 rounded-xl overflow-hidden bg-[#F8F9FC] border border-[#F0F3F9]',
      onboarding:
        'bg-white rounded-xl border border-[#d0d8e9] overflow-hidden hover:bg-[#f8f9fb] transition-colors duration-200 mb-5 last:mb-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & VariantProps<typeof AccordionItemVariants>
>(({ className, variant, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn(AccordionItemVariants({ variant }), className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTriggerVariants = cva(
  'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:no-underline',
  {
    variants: {
      variant: {
        default: 'px-0 [&[data-state=open]>svg]:rotate-180',
        card: 'px-6 rounded-xl [&[data-state=open]]:bg-[#F8F9FC] [&[data-state=open]]:rounded-b-none [&[data-state=closed]]:bg-[#F8F9FC] [&[data-state=open]>.chevron-icon]:rotate-180',
        onboarding:
          'px-6 py-5 gap-5 [&[data-state=open]]:bg-[#f8f9fb] [&[data-state=closed]]:bg-white ' +
          '[&[data-state=open]>.chevron-icon]:rotate-[-90deg] [&[data-state=closed]>.chevron-icon]:rotate-90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & VariantProps<typeof AccordionTriggerVariants>
>(({ variant, className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger ref={ref} className={cn(AccordionTriggerVariants({ variant }), className)} {...props}>
      {children}
      {variant === 'default' ? (
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      ) : variant === 'onboarding' ? (
        <div className="w-4 h-4 transform transition-transform duration-200 chevron-icon">
          <ChevronRightIcon className="w-4 h-4 text-[#22283a]" />
        </div>
      ) : (
        <div className="h-8 w-8 bg-[#E9EEF7] rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 chevron-icon">
          <ChevronDown className="h-4 w-4 text-[#637381]" />
        </div>
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContentVariants = cva(
  'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
  {
    variants: {
      variant: {
        default: '',
        card: 'bg-transparent p-0 rounded-b-lg',
        onboarding: 'bg-white px-0 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & VariantProps<typeof AccordionContentVariants>
>(({ className, variant, children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className={cn(AccordionContentVariants({ variant }), className)} {...props}>
    <div className={cn(variant === 'onboarding' ? 'flex flex-col' : 'p-0')}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionItemVariants,
  AccordionTriggerVariants,
  AccordionContentVariants,
};
