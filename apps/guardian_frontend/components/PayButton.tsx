import { formatPrice } from '~/utils/orders';
import { Button } from './atoms/Button';
import IcArrowRight from '~/public/icons/ic_arrow_right.svg';
import { cn } from '~/lib/cn';

interface PayButtonProps {
  priceTotal: number;
  itemsQuantity: number;
  currency: string;
  onClick: () => void;
  buttonText: string;
  loading?: boolean;
  label?: string;
  hidePrice?: boolean;
}

export const PayButton = ({
  priceTotal,
  itemsQuantity,
  currency,
  onClick,
  buttonText,
  loading = false,
  label = 'TOTAL',
  hidePrice,
}: PayButtonProps) => (
  <div
    data-testId="footer-total-amount"
    className="fixed inset-x-0 bottom-0 w-full max-w-md m-auto bg-[#4A5CFF] rounded-t-[2rem]"
  >
    <div className="flex items-center justify-between gap-5 px-5 sm:justify-around">
      <div className="font-medium">
        <div className="inline-flex gap-x-2">
          <span className="text-[#C2EDFF]">{label}</span>
          <span className="flex items-center justify-center px-2 min-w-[1.5rem] text-xs text-blue-100 bg-white rounded-full">
            {itemsQuantity}
          </span>
        </div>
        {hidePrice ? null : <h4 className="text-[26px] text-white mt-2">{formatPrice(priceTotal, currency)}</h4>}
      </div>
      <Button
        className={cn(
          'px-[27px] flex flex-row items-center justify-evenly text-blue-100 bg-white mb-[30px] mt-6 min-w-[162px] hover:bg-white active:bg-white',
          {
            'justify-center': loading,
          }
        )}
        onClick={onClick}
        disabled={loading}
      >
        {loading ? (
          <div
            className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-100 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          />
        ) : (
          <>
            <span className="mr-1 font-semibold text-center" data-testid={buttonText}>
              {buttonText}
            </span>
            <IcArrowRight className="w-2" />
          </>
        )}
      </Button>
    </div>
  </div>
);
