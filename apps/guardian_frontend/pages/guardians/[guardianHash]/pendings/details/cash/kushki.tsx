import { Container, Box, Typography, Divider, IconButton } from '@mui/material';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import KushkiCashInPayOrderCard from '~/components/molecules/guardians/KushkiCashInPayOrderCard';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import useCheckoutStore from '~/stores/checkoutStore';
import { GetServerSideProps } from 'next';

function CashInPayOrder() {
  const _router = useRouter();
  const { guardianHash } = _router.query;

  const { cashIn } = useCheckoutStore();

  const goToHome = () => {
    _router.push(`/guardians/${guardianHash}`);
  };

  const goBack = () => _router.back();

  useEffect(() => {
    const storedCashInData = Object.keys(cashIn).keys;
    if (!storedCashInData) goToHome();
  }, []);

  return (
    <>
      <Head>
        <title>Orden de pago</title>
      </Head>
      <Divider />
      <Container maxWidth="sm" disableGutters>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 2,
            mb: 2,
          }}
        >
          <IconButton
            onClick={goBack}
            sx={{
              backgroundColor: 'white.main',
              m: 2,
            }}
          >
            <ChevronLeftIcon color="primary" />
          </IconButton>
          <Typography variant="heading2" color="#091A7A">
            Orden de pago
          </Typography>
        </Box>
        <Divider orientation="horizontal" sx={{ mb: 4 }} />
        <Box mb={4} ml={2} mr={2}>
          <Typography color="#57537A" fontWeight={600} mb={1}>
            Orden de pago creada.
          </Typography>
          <Typography color="#57537A">
            Ya puedes acercarte a pagar a la sucursal de tu preferencia usando estos datos.
          </Typography>
        </Box>
        <Box ml={2} mr={2}>
          {cashIn && (
            <KushkiCashInPayOrderCard
              currency={cashIn.currency ?? ''}
              priceTotal={cashIn.total ?? 0}
              ticketNumber={cashIn.ticket_number ?? ''}
              pin={cashIn.pin ?? ''}
              pdfURL={cashIn.pdf_url ?? ''}
              pinBarCode={cashIn.pin_barcode ?? ''}
            />
          )}
        </Box>
        <Box mt={6} mb={6}>
          <PoweredByKushki />
        </Box>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    session: await getSession(context),
    remoteAddress: context.req.socket.remoteAddress,
  },
});

CashInPayOrder.auth = true;
export default CashInPayOrder;
