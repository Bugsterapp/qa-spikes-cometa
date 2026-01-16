import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '~/lib/cn';

const LinearProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white [--progress-color:#4A5CFF]', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="flex-1 w-full h-full transition-all bg-[var(--progress-color)] rounded-full"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
LinearProgress.displayName = ProgressPrimitive.Root.displayName;

export default LinearProgress;
