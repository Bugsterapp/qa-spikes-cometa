import { Box, Typography, Divider, Stack } from '@mui/material';
import { comerces } from '~/utils/whereToPay';
import Accordion from '~/components/atoms/guardians/Accordion';
import { formatPrice } from '~/utils/orders';
import Image from 'next/image';

interface AccordionKushkiWhereToPayProps {
  priceTotal: number;
  currency: string;
  showAgreements?: boolean;
}

export const AccordionKushkiWhereToPay = ({
  priceTotal,
  currency,
  showAgreements = false,
}: AccordionKushkiWhereToPayProps) => {
  const validComerces = comerces.filter((element) => element.maxAmountAllowed >= priceTotal);
  const invalidComerces = comerces.filter((element) => element.maxAmountAllowed < priceTotal);
  const comercesSorted = [...validComerces, ...invalidComerces];
  return (
    <Accordion
      tittle={
        <>
          <Box display="flex" flexDirection="column">
            <Typography color="#091A7A" fontSize={18} mb={1}>
              ¿Dónde pagar?
            </Typography>
            <Typography fontSize={12}>
              Podrás pagar en cualquiera de estas sucursales una vez generado tu PIN de pago.
            </Typography>
          </Box>
        </>
      }
    >
      <Stack divider={<Divider sx={{ borderColor: 'grey' }} flexItem />} spacing={2} mt={2}>
        {comercesSorted?.map((element) => (
          <Box
            key={`${element.name}`}
            display="flex"
            alignItems="center"
            height={56}
            sx={{
              opacity: element.maxAmountAllowed < priceTotal ? '40%' : '100%',
            }}
          >
            <Box mt={1}>
              <Image src={element.logo} alt={element.name} height={48} width={48} />
            </Box>
            <Box ml={2}>
              <Typography fontSize={14}>{element.name}</Typography>
              <Typography fontSize={10} color="gray">
                Monto máximo permitido: {formatPrice(element.maxAmountAllowed, currency)} {currency}
              </Typography>
              {showAgreements ? (
                <Typography fontSize={10} color="black">
                  Convenio: {element.agreement}
                </Typography>
              ) : null}
            </Box>
          </Box>
        ))}
      </Stack>
    </Accordion>
  );
};

export default AccordionKushkiWhereToPay;
