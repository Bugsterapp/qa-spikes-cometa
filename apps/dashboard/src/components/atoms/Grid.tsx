import React, { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';

type GridColsClass = `${ScreenQuery | ''}grid-cols-${GridCols}`;

type GridProps<T extends React.ElementType> = PropsWithChildren<{
  className?: string;
  as?: T;
  columns?: (GridColsClass | `grid-cols-[${string}]`)[];
}>;

function Grid<T extends React.ElementType = 'div'>({
  className,
  as,
  children,
  columns = ['grid-cols-1'],
}: GridProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof GridProps<T>>) {
  const Component = as || 'div';

  return <Component className={twMerge('grid', columns, className)}>{children}</Component>;
}

export default Grid;
