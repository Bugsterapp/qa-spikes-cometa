import React from 'react';
import { cn } from '~/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-2xl bg-white', className)} {...props}>
    {children}
  </div>
));

Card.displayName = 'Card';

export default Card;
