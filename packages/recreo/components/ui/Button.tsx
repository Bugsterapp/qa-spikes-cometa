import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@cometa/utils';
import '@flaticon/flaticon-uicons/css/all/all.css';

const LoadingSpinner = () => (
  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Loading spinner</title>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <path
      className="opacity-100"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      d="M 12 2 A 10 10 0 0 1 20 6"
    />
  </svg>
);

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1 whitespace-nowrap font-lota transition-colors rounded-[100px] focus:outline-none relative',
  {
    variants: {
      variant: {
        solid: ['solid', 'text-white'].join(' '),
        outline: ['btn-outline', 'bg-transparent'].join(' '),
        'solid-light': ['solid-light', 'bg-transparent'].join(' '),
        text: ['text', 'bg-transparent'].join(' '),
        secondary: [
          'bg-neutral-100',
          'text-neutral-900',
          'shadow-sm',
          'hover:bg-neutral-200',
          'active:bg-neutral-300',
          'focus-visible:bg-neutral-200',
          'focus-visible:ring-4',
          'focus-visible:ring-neutral-300/20',
          'disabled:bg-neutral-200',
          'disabled:text-neutral-400',
          'disabled:hover:bg-neutral-200',
        ].join(' '),
      },
      color: {
        galaxy: [
          // Solid variant
          '[&.solid]:bg-galaxy-500 [&.solid]:text-white',
          '[&.solid]:hover:bg-galaxy-400',
          '[&.solid]:active:bg-galaxy-600',
          '[&.solid]:focus-visible:ring-4 [&.solid]:focus-visible:ring-[#873AFF]/20',
          '[&.solid]:disabled:bg-neutral-300 [&.solid]:disabled:text-white [&.solid]:disabled:border-0',

          // Outline variant
          '[&.btn-outline]:border-2',
          '[&.btn-outline]:border-galaxy-500',
          '[&.btn-outline]:text-galaxy-500',
          '[&.btn-outline]:bg-transparent',
          '[&.btn-outline]:hover:bg-galaxy-50',
          '[&.btn-outline]:active:bg-galaxy-100',
          '[&.btn-outline]:focus-visible:bg-galaxy-50',
          '[&.btn-outline]:disabled:border-neutral-300 [&.btn-outline]:disabled:text-neutral-300 [&.btn-outline]:disabled:hover:bg-transparent',

          // Solid-light variant
          '[&.solid-light]:bg-galaxy-50',
          '[&.solid-light]:text-galaxy-500',
          '[&.solid-light]:hover:bg-galaxy-100',
          '[&.solid-light]:active:bg-galaxy-200',
          '[&.solid-light]:focus-visible:ring-4 [&.solid-light]:focus-visible:ring-[#873AFF]/20',
          '[&.solid-light]:disabled:bg-neutral-300 [&.solid-light]:disabled:text-white [&.solid-light]:disabled:border-0',

          // Text variant
          '[&.text]:text-galaxy-500',
          '[&.text]:bg-transparent',
          '[&.text]:hover:bg-galaxy-50',
          '[&.text]:active:bg-galaxy-100',
          '[&.text]:focus-visible:bg-galaxy-50',
          '[&.text]:disabled:text-neutral-300 [&.text]:disabled:hover:bg-transparent',
        ].join(' '),
        black: [
          // Solid variant (default)
          '[&.solid]:bg-neutral-900 [&.solid]:text-white',
          '[&.solid]:hover:bg-neutral-700',
          '[&.solid]:active:bg-neutral-600',
          '[&.solid]:focus-visible:ring-4 [&.solid]:focus-visible:ring-[#1C1C1D]/20',
          '[&.solid]:disabled:bg-neutral-300 [&.solid]:disabled:text-white [&.solid]:disabled:border-0',

          // Outline variant
          '[&.btn-outline]:border-2 [&.btn-outline]:border-neutral-900',
          '[&.btn-outline]:text-neutral-900',
          '[&.btn-outline]:bg-transparent',
          '[&.btn-outline]:hover:bg-neutral-100',
          '[&.btn-outline]:active:bg-neutral-200',
          '[&.btn-outline]:focus-visible:bg-neutral-100',
          '[&.btn-outline]:disabled:border-neutral-300 [&.btn-outline]:disabled:text-neutral-300 [&.btn-outline]:disabled:hover:bg-transparent',

          // Solid-light variant
          '[&.solid-light]:bg-neutral-50',
          '[&.solid-light]:text-neutral-900',
          '[&.solid-light]:hover:bg-neutral-200',
          '[&.solid-light]:active:bg-neutral-300',
          '[&.solid-light]:focus-visible:ring-4 [&.solid-light]:focus-visible:ring-[#1C1C1D]/20',
          '[&.solid]:disabled:bg-neutral-300 [&.solid]:disabled:text-white [&.solid]:disabled:border-0',

          // Text variant
          '[&.text]:text-neutral-900',
          '[&.text]:bg-transparent',
          '[&.text]:hover:bg-neutral-100',
          '[&.text]:active:bg-neutral-200',
          '[&.text]:focus-visible:bg-neutral-100',
          '[&.text]:disabled:text-neutral-300 [&.text]:disabled:hover:bg-transparent',
        ].join(' '),
        legacy: [
          // Solid variant
          '[&.solid]:bg-legacy text-white',
          '[&.solid]:hover:bg-[#00CC65]',
          '[&.solid]:active:bg-[#007B55]',
          '[&.solid]:focus-visible:ring-4 [&.solid]:focus-visible:ring-[#00AB553D]',
          '[&.solid]:disabled:bg-neutral-300 [&.solid]:disabled:text-white [&.solid]:disabled:border-0',

          // Outline variant
          '[&.btn-outline]:border-2',
          '[&.btn-outline]:border-legacy',
          '[&.btn-outline]:text-legacy',
          '[&.btn-outline]:bg-transparent',
          '[&.btn-outline]:hover:bg-[#EBF8F1]',
          '[&.btn-outline]:active:bg-[#D6F2E4]',
          '[&.btn-outline]:focus-visible:bg-[#EBF8F1]',
          '[&.btn-outline]:disabled:border-neutral-300 [&.btn-outline]:disabled:text-neutral-300 [&.btn-outline]:disabled:hover:bg-transparent',

          // Solid-light variant
          '[&.solid-light]:bg-[#E0F5EB]',
          '[&.solid-light]:text-[#007B55]',
          '[&.solid-light]:hover:bg-[#C2EBD6]',
          '[&.solid-light]:active:bg-[#ADE4C9]',
          '[&.solid-light]:focus-visible:ring-4 [&.solid-light]:focus-visible:ring-[#C2EBD6]',
          '[&.solid-light]:disabled:bg-neutral-300 [&.solid-light]:disabled:text-white [&.solid-light]:disabled:border-0',

          // Text variant
          '[&.text]:text-legacy',
          '[&.text]:bg-transparent',
          '[&.text]:hover:bg-[#E0F5EB]',
          '[&.text]:active:bg-[#C2EBD6]',
          '[&.text]:focus-visible:bg-[#E0F5EB]',
          '[&.text]:disabled:text-neutral-300 [&.text]:disabled:hover:bg-transparent',
        ].join(' '),
      },
      size: {
        large: 'h-[52px] px-[22px] py-3.5 text-base font-bold leading-normal',
        medium: 'h-10 px-5 py-2.5 text-sm font-semibold leading-tight',
        small: 'h-8 px-4 py-1.5 text-sm font-semibold leading-tight',
      },
      hasIcon: {
        true: 'gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'medium',
      hasIcon: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  color?: 'galaxy' | 'black' | 'legacy';
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      color,
      variant,
      size,
      hasIcon,
      asChild = false,
      leftIcon,
      rightIcon,
      disabled,
      isLoading,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, color, size, hasIcon, className }))}
        disabled={disabled || isLoading}
        ref={ref}
        type={props.type || 'button'}
        {...props}
      >
        {leftIcon ? <span className={cn({ invisible: isLoading })}>{leftIcon}</span> : null}
        <span className={cn('contents', { invisible: isLoading })}>{children}</span>
        {rightIcon ? <span className={cn({ invisible: isLoading })}>{rightIcon}</span> : null}

        {isLoading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </span>
        ) : null}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
