import { cn } from '@cometa/utils';

interface ItemProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
  colLabelSpan?: number; // Column span for the label
  colValueSpan?: number; // Column span for the value
}

export const List = ({
  children,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => <ul {...props}>{children}</ul>;

export const Item: React.FC<ItemProps> = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLLIElement>, HTMLLIElement>) => (
  <li className={cn('flex content-center gap-6 py-2', className)} {...props}>
    {children}
  </li>
);
