import { formatPrice } from '~/utils/orders';
import Button from '../../Button';
import IcArrowRight from '~/public/icons/ic_arrow_right.svg';
import { cn } from '~/lib/cn';

interface PayButtonProps {
  priceTotal: number;
  itemsQuantity: number;
  currency: string;
  onClick: () => void;
  buttonText: string;
  loading?: boolean;
}

export const PayButton = ({
  priceTotal,
  itemsQuantity,
  currency,
  onClick,
  buttonText,
  loading = false,
}: PayButtonProps) => (
  <div
    data-test-id="footer-total-amount"
    className="fixed inset-x-0 bottom-0 w-full max-w-md m-auto bg-blue-100 rounded-t-3xl"
  >
    <div className="flex items-center sm:justify-around justify-between pl-[39px] pr-[21px]">
      <div className="font-semibold mt-[21px] mb-[37px] mr-5">
        <div className="inline-flex gap-x-2">
          <span className="text-[#C2EDFF]">TOTAL</span>
          <span className="bg-[#E0EBFF] px-2 text-xs flex items-center justify-center rounded-full text-blue-100">
            {itemsQuantity}
          </span>
        </div>
        <h4 className="text-[26px] text-white mt-2">{formatPrice(priceTotal, currency)}</h4>
      </div>
      <Button
        className={cn(
          'px-[27px] flex flex-row items-center justify-end text-blue-100 bg-white mb-[30px] mt-6 sm:min-w-[208px] min-w-[162px] hover:bg-white active:bg-white',
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
            <span className="mr-6 font-semibold sm:mr-11" data-testid={buttonText}>
              {buttonText}
            </span>
            <IcArrowRight className="w-4" />
          </>
        )}
      </Button>
    </div>
  </div>
);
