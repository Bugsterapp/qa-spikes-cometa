import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@cometa/utils';

const chipVariants = cva('py-1 px-2 rounded-lg font-bold w-max', {
  variants: {
    variant: {
      default: 'bg-[#F3F6FB] text-[#1C1C1D]',
      blue: 'bg-[#3366FF1F] text-[#3366FF]',
      green: 'bg-[#4BC7661F] text-[#44B55D]',
      warning: 'bg-[#FFF7CD] text-[#B78100]',
      success: 'bg-[#E9FCD4] text-[#54AD68]',
      error: 'bg-[#FFEBEE] text-[#C62828]',
    },
    size: {
      default: 'text-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ChipProps = HTMLAttributes<HTMLButtonElement> & VariantProps<typeof chipVariants>;

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(({ className, children, ...props }, ref) => {
  const styles = cn(chipVariants({ variant: props.variant, size: props.size }), className);

  return (
    <span ref={ref} className={styles} {...props}>
      {children}
    </span>
  );
});
