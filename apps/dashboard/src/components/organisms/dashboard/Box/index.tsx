import React, { forwardRef } from 'react';
import { cn } from '/src/utils/cn';

interface BoxProps {
  children: React.ReactNode;
  className?: string;
}

const Box = forwardRef<HTMLDivElement, BoxProps>(({ children, className }, ref) => (
  <div ref={ref} className={cn('bg-white rounded-lg shadow-card', className)}>
    {children}
  </div>
));

export default Box;
