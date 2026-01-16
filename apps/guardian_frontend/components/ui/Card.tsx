import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const CardVariants = cva('rounded-lg p-5', {
  variants: {
    appearance: {
      default: 'bg-[#FAFAFA] border-[#E2E2E2] border text-[#57537A]',
    },
  },
  defaultVariants: {
    appearance: 'default',
  },
});

type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof CardVariants> & {
    as?: React.ElementType;
  };

const Card = ({ children, className, appearance, as }: CardProps) => {
  const classNames = CardVariants({ appearance, className });
  const Element = as || 'div';
  return <Element className={classNames}>{children}</Element>;
};

export default Card;
