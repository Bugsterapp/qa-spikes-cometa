import { Box, Typography, Stack, Button } from '@mui/material';
import { useRouter } from 'next/router';
import useCheckoutStore from '~/stores/checkoutStore';
interface CashDetailsProps {
  duration: string;
  guardianName: string;
  paymentExpiryFormatted: string;
  transactionDetails: any;
  totalAmount: number;
  currency: string;
}

const CashDetails = ({
  duration,
  guardianName,
  paymentExpiryFormatted,
  transactionDetails,
  currency,
  totalAmount,
}: CashDetailsProps) => {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const goToCashInPayOrder = () => {
    _router.push({
      pathname: `/guardians/${guardianHash}/pendings/details/cash/kushki`,
    });
  };

  const setCashIn = useCheckoutStore((state) => state.setCashInData);
  const pdfURL = transactionDetails?.pdfUrl || '';
  const handleClickPaymentOrder = () => {
    const data = {
      expiration_date: paymentExpiryFormatted,
      ticket_number: transactionDetails?.ticketNumber,
      pin: transactionDetails?.pin,
      pdf_url: pdfURL,
      pin_barcode: transactionDetails?.getPinBarCode,
    };
    setCashIn({ ...data, total: totalAmount, currency });
    goToCashInPayOrder();
  };
  return (
    <Box display="flex" flexDirection="column">
      <Stack spacing={0.75} mb={2}>
        <Typography color="neutralDark.main" variant="body3">
          {`Creado hace ${duration}`}
        </Typography>
        <Typography color="neutralDark.main" variant="body3">
          Creado por: {guardianName}
        </Typography>
      </Stack>
      <Stack spacing={0.75}>
        <Typography color="neutralDark.main" variant="body3" fontWeight={600}>
          Vence el: {paymentExpiryFormatted}
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Button variant="contained" color="buttonYellow" onClick={handleClickPaymentOrder} fullWidth>
            VER ORDEN DE PAGO
          </Button>

          <a href={pdfURL} target="_blank" rel="noopener noreferrer">
            <Button sx={{ borderRadius: 0.5, pl: 1 }}>
              <Typography fontSize={12} fontWeight={600} ml={1}>
                DESCARGAR ORDEN DE PAGO
              </Typography>
            </Button>
          </a>
        </Box>
      </Stack>
    </Box>
  );
};

export default CashDetails;
