import { AnchorHTMLAttributes, HTMLAttributes, PropsWithChildren, forwardRef } from 'react';
import cx from 'classnames';

export type Intent = 'PAID' | 'PARTIAL_PAID' | 'DUE';

type Props = PropsWithChildren<
  | {
      intent: Intent;
      loading?: boolean;
    } & ((HTMLAttributes<HTMLSpanElement> & { as?: 'span' }) | (AnchorHTMLAttributes<HTMLAnchorElement> & { as?: 'a' }))
>;

const FulfillmentChip = forwardRef<any, Props>(({ children, intent, as = 'span', loading, ...props }, ref) => {
  const Tag = as;
  const classNames = cx('text-sm px-2 py-1 rounded-md font-bold', {
    'text-[#B78103] bg-[#FFC107] bg-opacity-[0.16]': intent === 'PARTIAL_PAID',
    'text-[#229A16] bg-[#54D62C] bg-opacity-[0.12]': intent === 'PAID',
  });
  return (
    <div>
      {loading ? (
        <div role="status" className="max-w-sm animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-400 w-28" />
        </div>
      ) : (
        <Tag className={classNames} ref={ref} {...props}>
          {children}
        </Tag>
      )}
    </div>
  );
});

export default FulfillmentChip;
