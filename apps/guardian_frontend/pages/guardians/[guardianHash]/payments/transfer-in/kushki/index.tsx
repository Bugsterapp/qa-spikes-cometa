import { useCallback, useEffect, useState } from 'react';
import { Container, Box, Typography, IconButton, Divider, Button } from '@mui/material';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import KushkiTransferInCard from '~/components/molecules/guardians/KushkiTransferInCard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StepsToPay from '~/components/molecules/guardians/StepsToPay';
import { TRANSFER_IN_KUSHKI } from '~/utils/stepsToPay';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';
import Image from 'next/image';
import type { Session } from 'next-auth';
import ApiClient from '~/services/ApiClient';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import * as Sentry from '@sentry/nextjs';
import { decrypt } from '~/lib/base64';
import { GetServerSideProps } from 'next';
import { catchPaymentPage } from '~/utils/processCatch';
import { useSelectionStore } from '@cometa/hooks';

interface KushkiTransferProps {
  session: Session;
  commissionValues: {
    TRANSFER_IN: {
      commission: number;
      subtotal: number;
      total: number;
      type: 'fixed';
      value: number;
    };
  };
}

function KushkiTransfer({ session, commissionValues }: KushkiTransferProps) {
  const router = useRouter();
  const { guardianHash } = router.query;
  const [hasClabe, setHasClabe] = useState(false);
  const { selectedItems, clear } = useSelectionStore();
  const currency = selectedItems?.[0]?.currency || 'MXN';
  const itemsQuantity = selectedItems?.length;

  const handlerClabe = () => {
    setHasClabe(true);
  };

  const goToHome = useCallback(() => {
    if (hasClabe) {
      router.push({
        pathname: `/guardians/${guardianHash}/`,
        query: { tour: 'pending', status: 'pending', type: 'transfer' },
      });
    } else {
      router.push(`/guardians/${guardianHash}`);
    }
  }, [hasClabe, router, guardianHash]);

  useSendPageViewedEvent('Metodo de pago - Transferencia - Kushki');

  useEffect(() => {
    if (!itemsQuantity) goToHome();
  }, [itemsQuantity, goToHome]);

  // clear on unmount
  useEffect(
    () => () => {
      if (hasClabe) clear();
    },
    [clear, hasClabe]
  );

  const items = selectedItems?.map((item) => ({
    order: item.order_id,
    student: item.student.id,
  }));

  if (!itemsQuantity) return null;

  return (
    <>
      <Head>
        <title>Transferencia</title>
      </Head>
      <Container maxWidth="sm">
        <Divider />
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={() => router.back()}
            sx={{
              backgroundColor: 'white.main',
              m: 2,
            }}
          >
            <ChevronLeftIcon color="primary" />
          </IconButton>
          <Box>
            <Typography variant="heading2" color="#091A7A">
              Transferencia
            </Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ p: 2.5 }}>
          <Typography color="#212B36" variant="h6">
            Instrucciones
          </Typography>
          &nbsp;
          <Typography color="#637381" paragraph variant="body1">
            Para poder realizar la transferencia, debes primero generar la CLABE. Una vez generada debes seguir las
            instrucciones para completar la transferencia.
          </Typography>
        </Box>
        <Divider orientation="horizontal" sx={{ mb: 4, mr: 2, ml: 2 }} />
        {Boolean(itemsQuantity) && (
          <KushkiTransferInCard
            hasCommission={!!commissionValues.TRANSFER_IN.commission}
            handlerClabe={handlerClabe}
            guardian={session?.user?.id || ''}
            token={session?.token}
            currency={currency}
            items={items}
            prices={{
              subtotal: commissionValues.TRANSFER_IN.subtotal,
              commissions: commissionValues.TRANSFER_IN.commission,
              total: commissionValues.TRANSFER_IN.total,
            }}
          />
        )}
        <Box
          sx={{
            pt: 3,
            pr: 1,
            pl: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography color="#091A7A" variant="h6" align="center">
            ¿Cómo Pagar?
          </Typography>
          &nbsp;
          <StepsToPay steps={TRANSFER_IN_KUSHKI} />
        </Box>
        {hasClabe && (
          <Box display="flex" justifyContent="center" pt={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={goToHome}
              sx={{
                height: 56,
                width: '100%',
                borderRadius: 16,
              }}
            >
              <Typography>Finalizar</Typography>
            </Button>
          </Box>
        )}
        <Box mb={5} mt={16}>
          <PoweredByKushki />
        </Box>
        <Divider orientation="horizontal" sx={{ mb: 4, mr: 2, ml: 2 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
            mb: 8,
            mr: 2,
            ml: 2,
            alignItems: 'center',
          }}
        >
          <Image src="/images/pci-dss-compliant-logo.svg" alt="PCIDSS-logo" height={50} width={120} />
          <Typography color="#919EAB" variant="caption" fontWeight={400} sx={{ ml: 1 }}>
            Este pago es procesado de forma segura por Kushki, un proveedor de pagos PCI de nivel 1.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { guardianHash } = context.query;
  try {
    let selectedOrders = '';
    const cookiesOrders = context.req.cookies['COMMISSION_VALUES'];

    if (!cookiesOrders) {
      Sentry.setContext('SSR Cookies', context.req.cookies);
      Sentry.captureEvent({ message: 'COMMISSION_VALUES cookies not defined' });
      const query = context.query.orders;

      selectedOrders = decrypt(query as string);
    } else {
      selectedOrders = cookiesOrders;
    }

    const session = await getSession(context);
    const commissionValues = await ApiClient.getValuesWithCommission({
      orders: JSON.parse(selectedOrders),
      guardian: session?.user.id || '',
      preference_type: 'TRANSFER_IN',
      token: session?.token || '',
    });

    return {
      props: {
        session: await getSession(context),
        remoteAddress: context.req.socket.remoteAddress,
        commissionValues: commissionValues.data,
      },
    };
  } catch (err) {
    catchPaymentPage(err, context, 'GSSP Transfer-in');
    return {
      redirect: {
        permanent: false,
        destination: `/guardians/${guardianHash}`,
      },
    };
  }
};
KushkiTransfer.auth = true;
export default KushkiTransfer;
