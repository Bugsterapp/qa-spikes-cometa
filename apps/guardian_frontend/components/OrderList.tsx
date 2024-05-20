import {
  OrderCardSkeleton,
  OrderListInfoSkeleton,
  OrderListTitleSkeleton,
} from './molecules/guardians/OrderCardSkeleton';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';

const OrderList = ({
  title,
  info,
  children = [],
  loading,
  extraItems,
  onShowMore,
}: PropsWithChildren<{
  title?: string;
  info?: string;
  loading: boolean;
  extraItems?: boolean;
  onShowMore?: (state: boolean) => void;
}>) => {
  const [showMore, setShowMore] = useState(false);

  if (!loading && !children) return null;

  return (
    <section className="w-full">
      {title && (
        <div className="mb-4 space-y-2">
          <h3 className="text-[#14208C] text-xl font-semibold mb-1">{loading ? <OrderListTitleSkeleton /> : title}</h3>
          <div className="text-[#57537A] text-sm space-y-2">
            {loading ? (
              <>
                <OrderListInfoSkeleton />
                <OrderListInfoSkeleton />
              </>
            ) : (
              info
            )}
          </div>
        </div>
      )}
      <div className="flex flex-col space-y-2.5">
        {loading ? (
          <>
            <OrderCardSkeleton /> <OrderCardSkeleton /> <OrderCardSkeleton />
          </>
        ) : (
          children
        )}
      </div>
      {extraItems && (
        <button
          className="font-bold text-[#4A5CFF] flex items-center justify-between mx-auto space-x-1 my-4 bg-transparent"
          onClick={() => {
            if (onShowMore) {
              onShowMore(!showMore);
            }
            setShowMore(!showMore);
          }}
        >
          Ver {!showMore ? 'más' : 'menos'}{' '}
          {!showMore ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17 11H13V7C13 6.73478 12.8946 6.48043 12.7071 6.29289C12.5196 6.10536 12.2652 6 12 6C11.7348 6 11.4804 6.10536 11.2929 6.29289C11.1054 6.48043 11 6.73478 11 7V11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H11V17C11 17.2652 11.1054 17.5196 11.2929 17.7071C11.4804 17.8946 11.7348 18 12 18C12.2652 18 12.5196 17.8946 12.7071 17.7071C12.8946 17.5196 13 17.2652 13 17V13H17C17.2652 13 17.5196 12.8946 17.7071 12.7071C17.8946 12.5196 18 12.2652 18 12C18 11.7348 17.8946 11.4804 17.7071 11.2929C17.5196 11.1054 17.2652 11 17 11Z"
                fill="#4A5CFF"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17 10.9998H7C6.44772 10.9998 6 11.4475 6 11.9998C6 12.552 6.44772 12.9998 7 12.9998H17C17.5523 12.9998 18 12.552 18 11.9998C18 11.4475 17.5523 10.9998 17 10.9998Z"
                fill="#4A5CFF"
              />
            </svg>
          )}
        </button>
      )}
    </section>
  );
};

export default OrderList;
