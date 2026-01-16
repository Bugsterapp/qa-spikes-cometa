import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '~/lib/cn';

const buttonVariants = cva('inline-flex items-center justify-center disabled:cursor-not-allowed', {
  variants: {
    variant: {
      default:
        'py-4 px-6 appearance-none bg-blue-100 rounded-full text-white text-base font-normal outline-none shadow-[6px_6px_20px_rgba(85,112,255,0.3)] cursor-pointer hover:bg-[#364AFD] transition-colors hover:shadow-[6px_6px_35px_rgba(85, 112, 255, 0.42)] active:bg-blue-100 disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6]',
      ghost: 'bg-[#7E83B01A] rounded-lg px-4 py-1.5 text-[#4A5CFF]',
      icon: 'bg-white rounded-full p-2 border border-[#E3E0FF]',
      selection:
        'px-[18px] py-[8px] border border-solid font-semibold text-[12px] leading-[16px] tracking-[0.2px] uppercase border-[#22283A] shadow-[4px_4px_15px_0px_#5570FF29] bg-white text-[#22283A] disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-[12px]',
      clear:
        'py-1 self-baseline bg-transparent text-[#4A5CFF] font-medium leading-4 shadow-[6px 6px 20px 0px #5570FF4D] tracking-[0.2px]',
      transparent: 'font-medium text-blue-100 bg-transparent',
      border:
        'bg-transparent text-blue-100 border-[1.5px] border-blue-100 rounded-full hover:bg-blue-100/5 active:bg-blue-100/20 w-full font-medium',
      outline:
        'px-1.5 py-2 bg-transparent text-blue-100 border-[1.5px] border-blue-100 hover:bg-blue-100/5 active:bg-blue-100/20 font-medium rounded-lg',
    },
    selected: {
      true: '',
    },
    size: {
      xs: 'text-xs',
      small: 'text-sm py-3',
    },
    theme: {
      recreo: '',
      old: 'bg-blue-100 text-white',
    },
  },
  compoundVariants: [
    {
      variant: 'selection',
      selected: true,
      class: 'bg-[#22283A] text-white',
    },
    {
      variant: 'default',
      theme: 'recreo',
      class:
        'bg-[#2B2D30] text-white shadow-none font-semibold active:bg-[#2B2D30] hover:bg-[#2B2D30] hover:opacity-90',
    },
    {
      variant: 'border',
      theme: 'recreo',
      class: 'text-[#2B2D30] border-[#2B2D30] py-4 px-6 bg-transparent font-semibold',
    },
  ],
  defaultVariants: {
    variant: 'default',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, selected, theme, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, selected, theme, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
