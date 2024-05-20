import React, { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

type HeadingProps = PropsWithChildren<{
  className?: string;
  as?: React.ElementType;
}>;
function Heading<T extends React.ElementType = 'h1'>({
  className,
  as,
  children,
}: HeadingProps & Omit<ComponentPropsWithoutRef<T>, keyof HeadingProps>) {
  const Component = as || 'h1';

  return <Component className={className}>{children}</Component>;
}

export default Heading;
