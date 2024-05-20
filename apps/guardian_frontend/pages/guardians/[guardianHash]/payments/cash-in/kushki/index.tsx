import { Container, Box, Typography, IconButton, Divider } from '@mui/material';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import KushkiCashInCard from '~/components/molecules/guardians/KushkiCashInCard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ApiClient from '~/services/ApiClient';
import { useAlert } from '~/hooks';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';
import type { Session } from 'next-auth';
import useCheckoutStore from '~/stores/checkoutStore';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { GetServerSideProps } from 'next';
import { decrypt } from '~/lib/base64';
import * as Sentry from '@sentry/nextjs';
import { catchPaymentPage } from '~/utils/processCatch';
import { useSelectionStore } from '@cometa/hooks';
import LoadingButton from '~/components/molecules/LoadingButton';
import { DrawerAlert, DrawerAlertContent } from '~/components/organisms/guardians/DrawerAlert';
import IcClockBig from '~/public/icons/clock-big.svg';
import Button from '~/components/atoms/Button';
import { api } from '~/utils/api';

interface KushkiCashInProps {
  session: Session;
  commissionValues: {
    CASH_IN: {
      commission: number;
      subtotal: number;
      total: number;
      type: 'fixed';
      value: number;
    };
  };
}

function KushkiCashIn({ session, commissionValues }: KushkiCashInProps) {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedItems, setTotalToPay } = useSelectionStore();
  const currency = selectedItems?.[0]?.currency || 'MXN';
  const itemsQuantity = selectedItems?.length;
  const { setCashInData } = useCheckoutStore();
  const { setAlert } = useAlert();
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  useEffect(() => {
    if (!itemsQuantity) _router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity, _router, guardianHash]);

  useSendPageViewedEvent('Metodo de pago - Efectivo');

  const onClickIWantToPay = async () => {
    try {
      setOpen(false);
      if (itemsQuantity) {
        setIsSubmitting(true);
        const storedCheckoutOrders = selectedItems?.map((item) => ({
          order: item.order_id,
          student: item.student.id,
        }));
        const { data } = await ApiClient.postKushkiCashIn(
          session?.token,
          storedCheckoutOrders,
          session?.user?.id || ''
        );
        localStorage.removeItem(RATED_CSAT_PAYMENT);
        setTotalToPay(commissionValues.CASH_IN.total);
        setCashInData(data);
        utils.orders.getSchoolOrders.invalidate();
        utils.orders.getGuardiansOptionalOrders.invalidate();
        _router.push({
          pathname: `/guardians/${guardianHash}/payments/cash-in/kushki/cash-in-pay-order`,
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      setAlert('No es posible realizar esta acción en este momento');
    }
  };

  if (!itemsQuantity) return null;

  return (
    <>
      <Head>
        <title>Pago en efectivo</title>
      </Head>
      <Container maxWidth="sm" disableGutters>
        <Divider />
        <Box display="flex" ml={2}>
          <IconButton
            onClick={() => _router.back()}
            sx={{
              backgroundColor: 'white.main',
              mr: 2,
              mt: 2,
              mb: 2,
            }}
          >
            <ChevronLeftIcon color="primary" />
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2,
              mb: 2,
              justifyContent: 'center',
            }}
          >
            <Box>
              <Typography variant="heading2" color="#091A7A">
                Pago en efectivo
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mb: 4 }} />
        <Box sx={{ ml: 2, mr: 2 }}>
          {Boolean(itemsQuantity) && (
            <KushkiCashInCard
              currency={currency}
              prices={{
                subtotal: commissionValues.CASH_IN.subtotal,
                commissions: commissionValues.CASH_IN.commission,
                total: commissionValues.CASH_IN.total,
              }}
            />
          )}
        </Box>
        <Box display="flex" justifyContent="center" p={4} mb={12}>
          <Box mt={6}>
            <PoweredByKushki />
          </Box>
          <div className="fixed bottom-0 inset-x-0 m-auto w-full max-w-[600px] py-9 px-8 flex justify-center items-center">
            <LoadingButton
              className="w-full mt-auto font-medium"
              onClick={() => {
                setOpen(true);
              }}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Quiero pagar
            </LoadingButton>
          </div>
        </Box>
        <DrawerAlert open={open}>
          <DrawerAlertContent className="inline-flex flex-col items-center justify-start w-full gap-10 px-5 py-6 bg-white shadow max-w-[600px] rounded-tl-3xl rounded-tr-3xl">
            <div className="flex flex-col items-center self-stretch justify-start gap-10 ">
              <div className="flex flex-col items-center self-stretch justify-start gap-4 ">
                <div className="self-stretch flex-col justify-start items-center gap-2.5 flex">
                  <IcClockBig className="w-12 h-12" />
                  <div className="self-stretch text-lg font-semibold tracking-tight text-center text-gray-800">
                    Recuerda que..
                  </div>
                </div>
                <div className="self-stretch h-12 flex-col justify-center items-center gap-2.5 flex">
                  <div className="w-full text-base font-medium tracking-tight text-center text-gray-500 max-w-80">
                    Esta orden de pago tiene vigencia hasta las 23:59 del día de hoy.
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch flex-col justify-start items-start gap-2.5 flex">
              <Button className="self-stretch px-8 py-3 text-sm font-medium" onClick={onClickIWantToPay}>
                Entendido, generar orden
              </Button>
              <Button
                className="inline-flex items-center self-stretch justify-center py-3 text-sm font-medium text-center text-blue-100 bg-transparent shadow-none px-7 hover:text-blue-100/80 hover:bg-transparent active:bg-transparent active:text-blue-100/50"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Atrás
              </Button>
            </div>
          </DrawerAlertContent>
        </DrawerAlert>
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
      preference_type: 'CASH_IN',
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
    catchPaymentPage(err, context, 'GSSP Cash-in');
    return {
      redirect: {
        permanent: false,
        destination: `/guardians/${guardianHash}`,
      },
    };
  }
};
KushkiCashIn.auth = true;
export default KushkiCashIn;
