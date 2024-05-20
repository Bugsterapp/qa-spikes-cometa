import { Divider, Stack, Typography, Box as MuiBox } from '@mui/material';
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
      <Stack divider={<Divider sx={{ borderColor: 'grey' }} flexItem />} spacing={2}>
        <MuiBox
          px={3}
          pb={1}
          pt={1}
          textAlign="start"
          display="flex"
          flexDirection="column"
          justifyContent="space-around"
        >
          <Typography fontSize={18} fontWeight={500}>
            {guardianFirstName} {guardianLastName}
          </Typography>
        </MuiBox>

        <div className="flex flex-col justify-around gap-3 px-6 align-middle divide-y divide-gray-200">
          {prices.commissions > 0 ? (
            <div className="flex flex-col justify-around py-1 space-y-1 align-middle">
              <p className="text-sm text-gray-900">Subtotal a pagar</p>
              <div className="flex items-center gap-1">
                <p color="primary" className="self-end text-lg font-bold">
                  {formatPrice(prices.subtotal, currency) + ' '}
                </p>
                <span className="mt-1 text-xs font-bold">{currency}</span>
              </div>
              <p className="font-light text-xs text-[#637381]">+{prices.commissions} fee administrativo</p>
            </div>
          ) : null}

          <div className="py-3">
            <Typography fontSize={14} fontWeight={500}>
              Total a pagar
            </Typography>
            <MuiBox>
              <Typography color="primary" fontSize={24} fontWeight={600} display="inline">
                {formatPrice(prices.total, currency) + ' '}
              </Typography>
              <Typography color="primary" fontSize={14} fontWeight={600} display="inline">
                {currency}
              </Typography>
            </MuiBox>
          </div>
        </div>
        <MuiBox px={3}>
          <Stack>
            <AccordionKushkiWhereToPay priceTotal={prices.total} currency={currency} />
          </Stack>
        </MuiBox>
      </Stack>
    </Box>
  );
};

export default KushkiCashInCard;
