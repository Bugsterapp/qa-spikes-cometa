import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@cometa/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 active:opacity-[0.8] disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-[#DDE1E5] bg-background hover:bg-accent hover:text-accent-foreground text-[#7E83B0] disabled:text-[#919EAB]/80 disabled:border-[#919EAB]/30',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        destroy:
          'text-[#FF4842] font-bold border border-[#FF4842] disabled:text-[#919EAB]/80 disabled:border-[#919EAB]/30',
        rounded: 'rounded-full',
        success:
          'bg-green hover:bg-green-800 text-white font-bold ripple-bg-green-500 disabled:text-[#919EABCC] disabled:bg-[#919EAB3D]',
        transparency: 'bg-transparent font-bold hover:text-opacity-60',
      },
      size: {
        default: 'h-13 px-4 py-4',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
      intent: {
        creation: 'bg-[#1890001A] text-[#00AB55]',
        destruction: 'bg-[#FD6262] text-white',
      },
    },
    compoundVariants: [
      {
        variant: 'rounded',
        size: 'sm',
        class: 'rounded-full',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, intent, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, intent, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
