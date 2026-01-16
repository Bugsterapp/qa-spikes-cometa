import { formatPrice } from '~/utils/orders';
import { useSession } from 'next-auth/react';
import AccordionKushkiWhereToPay from '~/components/atoms/guardians/AccordionKushkiWhereToPay';
import Box from '~/components/atoms/common/Box';

interface CashInCardProps {
  currency: string;
  prices: {
    subtotal: number;
    commissions: number;
    total: number;
  };
}

const KushkiCashInCard = ({ currency, prices }: CashInCardProps) => {
  const { data: session } = useSession();

  const guardianFirstName = session?.user?.first_name;
  const guardianLastName = session?.user?.last_name;

  return (
    <Box className="min-w-[321px]">
      <div className="flex flex-col gap-2 divide-y divide-gray-400">
        <div className="px-3 pb-1 pt-1 text-start flex flex-col justify-around">
          <p className="text-lg font-medium">
            {guardianFirstName} {guardianLastName}
          </p>
        </div>

        <div className="flex flex-col justify-around gap-3 px-6 align-middle divide-y divide-gray-200">
          {prices.commissions > 0 ? (
            <div className="flex flex-col justify-around py-1 space-y-1 align-middle">
              <p className="text-sm text-gray-900">Subtotal a pagar</p>
              <div className="flex items-center gap-1">
                <p className="self-end text-lg font-bold text-blue-600">
                  {formatPrice(prices.subtotal, currency) + ' '}
                </p>
                <span className="mt-1 text-xs font-bold">{currency}</span>
              </div>
              <p className="font-light text-xs text-[#637381]">+{prices.commissions} fee administrativo</p>
            </div>
          ) : null}

          <div className="py-3">
            <p className="text-sm font-medium">Total a pagar</p>
            <div>
              <span className="text-blue-600 text-2xl font-semibold">{formatPrice(prices.total, currency) + ' '}</span>
              <span className="text-blue-600 text-sm font-semibold">{currency}</span>
            </div>
          </div>
        </div>

        <div className="px-3 pt-2">
          <div>
            <AccordionKushkiWhereToPay priceTotal={prices.total} currency={currency} />
          </div>
        </div>
      </div>
    </Box>
  );
};

export default KushkiCashInCard;
