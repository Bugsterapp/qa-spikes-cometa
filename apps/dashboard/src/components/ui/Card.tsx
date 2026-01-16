import { cn } from '@cometa/utils';

export const Root = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div className={cn('rounded-xl py-6 px-8 border', className)} {...props}>
    {children}
  </div>
);

export const Title = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  <div className="pb-4 border-b border-b-[#919EAB3D]">
    <h2 className={cn('text-lg font-bold leading-5', className)} {...props}>
      {children}
    </h2>
  </div>
);

export const Content = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div className={cn('mt-6', className)} {...props}>
    {children}
  </div>
);

export const Row = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div className={cn('grid grid-cols-5 gap-6 py-2', className)} {...props}>
    {children}
  </div>
);
