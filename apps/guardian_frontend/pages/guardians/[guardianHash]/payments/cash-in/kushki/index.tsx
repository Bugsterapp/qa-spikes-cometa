import { Container, Box, Typography, IconButton, Divider } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import KushkiCashInCard from '~/components/molecules/guardians/KushkiCashInCard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAlert } from '~/hooks';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';
import useCheckoutStore from '~/stores/checkoutStore';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { GetServerSideProps } from 'next';
import { catchPaymentPage } from '~/utils/processCatch';
import { useSelectionStore } from '@cometa/hooks';
import LoadingButton from '~/components/molecules/LoadingButton';
import { DrawerAlert, DrawerAlertContent } from '~/components/organisms/guardians/DrawerAlert';
import IcClockBig from '~/public/icons/clock-big.svg';
import { Button } from '~/components/atoms/Button';
import { api } from '~/utils/api';
import { useSelectedSchoolId } from '~/components/molecules/common/AuthGlobal';
import { PreferenceTypeEnum, StatusDc1Enum } from '@cometa/trpc';
import { getCommissionValues } from '~/utils/kushkiCreditCard';

interface KushkiCashInProps {
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

function KushkiCashIn({ commissionValues }: KushkiCashInProps) {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const { selectedItems, setTotalToPay } = useSelectionStore();
  const currency = selectedItems?.[0]?.currency || 'MXN';
  const itemsQuantity = selectedItems?.length;
  const { setCashInData } = useCheckoutStore();
  const { setAlert } = useAlert();
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const selectedSchoolId = useSelectedSchoolId();

  useEffect(() => {
    if (!itemsQuantity) _router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity, _router, guardianHash]);

  useSendPageViewedEvent('Metodo de pago - Efectivo');

  const {
    isLoading,
    isSuccess,
    mutate: mutateCheckoutCashIn,
  } = api.kushki.checkoutCashIn.useMutation({
    onSuccess(data) {
      localStorage.removeItem(RATED_CSAT_PAYMENT);
      setTotalToPay(commissionValues.CASH_IN.total);
      setCashInData(data);
      utils.orders.getSchoolOrders.prefetch(
        {
          schoolId: selectedSchoolId ?? '',
          status: [StatusDc1Enum.NOT_PAID, StatusDc1Enum.WAITING_PAID, StatusDc1Enum.PARTIAL_PAID],
        },
        {
          retry: 3,
        }
      );
      utils.orders.getGuardiansOptionalOrders.prefetch({
        schoolId: selectedSchoolId ?? '',
      });
      _router.push({
        pathname: `/guardians/${guardianHash}/payments/cash-in/kushki/cash-in-pay-order`,
      });
    },
    onError() {
      setAlert('No es posible realizar esta acción en este momento');
    },
  });

  const onClickIWantToPay = () => {
    setOpen(false);
    if (itemsQuantity) {
      const storedCheckoutOrders = selectedItems?.map((item) => ({
        order: item.order_id,
        student: item.student.id,
      }));
      mutateCheckoutCashIn({
        items: storedCheckoutOrders,
      });
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
              disabled={isLoading || isSuccess}
              loading={isLoading}
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
                  <div className="self-stretch text-lg font-semibold text-center text-secondary">Recuerda que..</div>
                </div>
                <div className="flex flex-col items-center self-stretch justify-center gap-y-4">
                  <div className="max-w-[314px] text-base font-medium text-center text-gray-600">
                    <span>Esta orden de pago tiene vigencia hasta</span>{' '}
                    <span className="font-semibold">las 23:59 del día de hoy.</span>
                  </div>
                  <div className="border-b border-[#D0D0D0] h-px w-full" />
                  <div className="max-w-[314px] text-base font-medium text-center text-gray-600">
                    Recuerda <span className="font-semibold">pagar el monto exacto </span>{' '}
                    <span>que figura en la orden que generes y hacerlo en un solo pago.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch flex-col justify-start items-start gap-2.5 flex">
              <Button
                className="self-stretch px-8 py-3 text-sm font-medium"
                onClick={onClickIWantToPay}
                disabled={isLoading}
              >
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
    const commissionValues = await getCommissionValues(context, PreferenceTypeEnum.CASH_IN);

    return {
      props: {
        remoteAddress: context.req.socket.remoteAddress,
        commissionValues: commissionValues,
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
