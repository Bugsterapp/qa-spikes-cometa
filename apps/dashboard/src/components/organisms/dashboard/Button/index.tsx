import React, { forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '/src/utils/cn';

const buttonClasses = cva(
  'flex items-center justify-center rounded-lg leading-tight focus:outline-none focus:ring-0 transition duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:shadow-inner active:opacity-[0.8]',
  {
    variants: {
      variant: {
        primary:
          'bg-green hover:bg-green-800 shadow-[0_8px_16px_0_rgba(0,171,85,0.24)] text-white text-sm font-bold tracking-wide ripple-bg-green-500',
        secondary:
          'bg-blue-secondary hover:bg-blue-800 shadow-[0_8px_16px_0px_rgba(51,102,255,0.24)] text-white text-sm font-bold tracking-wide ripple-bg-blue-600',
        cancel:
          'text-white font-bold rounded-lg text-sm hover:opacity-90 whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D] ripple-bg-error-600',
        ghost: 'text-[#637381] bg-transparent font-bold text-sm	hover:opacity-90 whitespace-nowrap',
        icon: 'rounded-full bg-transparent hover:bg-blue-secondary-200/[12%]',
        outline:
          'bg-opacity-0 hover:bg-opacity-[0.08] transition-colors shadow-none rounded-[100px] font-semibold border-2 disabled:text-[#C0C9D8] disabled:border-[#C0C9D8] disabled:bg-transparent disabled:opacity-100',
      },

      intent: {
        danger: '',
      },
      size: {
        small: 'p-2 text-sm',
        medium: 'h-12 px-4 py-1.5',
        large: 'h-14 px-6 py-3 text-base',
        tooltip: 'px-8 py-2',
      },
    },
    compoundVariants: [
      { variant: 'outline', size: 'large', class: 'border-[3px] font-bold' },
      { variant: 'outline', intent: 'danger', class: 'bg-error text-error border-error' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonClasses> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, leftIcon, rightIcon, ...props }, ref) => {
  const styles = cn(buttonClasses({ variant: props.variant, size: props.size, intent: props.intent }), props.className);

  return (
    <button
      ref={ref}
      {...props}
      onClick={props.onClick}
      className={cn(styles, props.className)}
      type={props.type || 'button'}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
