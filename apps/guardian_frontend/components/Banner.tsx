import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '~/lib/cn';

const BannerVariants = cva('text-sm font-medium py-2 px-4', {
  variants: {
    intent: {
      warning: 'rounded-[10px] bg-[#FFF3D9] text-[#57537A]',
      info: 'rounded-[10px] flex text-[#57537A]  bg-[#E0E1FA] gap-2.5',
      error: 'rounded-[10px] bg-[#F46F6F]/20 text-[#57537A]',
    },
    size: {
      hero: 'rounded-none w-full',
    },
  },
  defaultVariants: {
    intent: 'warning',
  },
});

export const Banner = ({
  children,
  intent,
  size,
  className,
}: { children: React.ReactElement | React.ReactNode; className?: string } & VariantProps<typeof BannerVariants>) => (
  <div className={cn(BannerVariants({ intent, size, className }))}>{children}</div>
);
