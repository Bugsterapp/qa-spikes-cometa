import React, { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import { cn } from '~/lib/cn';

type BoxProps<T extends React.ElementType> = PropsWithChildren<{
  className?: string;
  as?: T;
}>;

function Box<T extends React.ElementType = 'div'>({
  className,
  as,
  children,
  ...props
}: BoxProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof BoxProps<T>>) {
  const Component = as || 'div';

  return (
    <Component {...props} className={cn('p-6 bg-white rounded-2xl', className)}>
      {children}
    </Component>
  );
}

export default Box;
