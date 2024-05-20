import { gray } from 'tailwindcss/colors';
import { cn } from '~/lib/cn';
import { cva, VariantProps } from 'class-variance-authority';

const TagVariants = cva(
  'px-[7px] rounded-[4px] inline-flex bg-[var(--box-color-text-bg)] text-[var(--box-color-text)] font-bold',
  {
    variants: {
      size: {
        small: 'text-[10px]',
        medium: 'text-sm font-semibold rounded-lg py-1',
      },
    },
    defaultVariants: {
      size: 'small',
    },
  }
);

interface BoxColorTextProps extends VariantProps<typeof TagVariants> {
  bgcolor?: string;
  color?: string;
  text: string;
  className?: string;
}

const Tag = ({ bgcolor, color, text, className, size }: BoxColorTextProps) => (
  <span
    className={cn(TagVariants({ size }), className)}
    style={
      { '--box-color-text-bg': bgcolor || gray[100], '--box-color-text': color || gray[800] } as React.CSSProperties
    }
  >
    {text}
  </span>
);

export default Tag;
