import Head from 'next/head';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { useEffect, useState, useRef } from 'react';
import KushkiCashInCard from '~/components/molecules/guardians/KushkiCashInCard';
import { useAlert } from '~/hooks';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';
import useCheckoutStore from '~/stores/checkoutStore';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import { GetServerSideProps } from 'next';
import { InformationDrawer } from '~/components/Drawer.Variants';
import { catchPaymentPage } from '~/utils/processCatch';
import { ProjectEnum } from '@cometa/hooks';
import LoadingButton from '~/components/ui/LoadingButton';
import { DrawerAlert, DrawerAlertContent } from '~/components/organisms/guardians/DrawerAlert';
import IcClockBig from '~/public/icons/clock-big.svg';
import { Button } from '~/components/ui/Button';
import { api } from '~/utils/api';
import { useSelectedSchoolId } from '~/stores/globalStore';
import { PreferenceTypeEnum, StatusDc1Enum, CreateRefundDashboardRequestDTOPaymentMethodEnum } from '@cometa/trpc';
import { getCommissionValues } from '~/utils/kushkiCreditCard';
import { useCartItems, useSelectionStore } from '~/stores/selectionStorePersisted';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import { appendUtmParameters } from '~/lib/destinationWithUTM';
import { useCheckoutPayment } from '~/hooks/usePayment';
import { useFlag } from '~/components/flags/FlagsProvider';
import { useSession } from 'next-auth/react';

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
  const cartItems = useCartItems<ProjectEnum.PORTAL>();
  const currency = selectedItems?.[0]?.currency || 'MXN';
  const itemsQuantity = selectedItems?.length;
  const { setCashInData } = useCheckoutStore();
  const { setAlert } = useAlert();
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const selectedSchoolId = useSelectedSchoolId();
  const sendPageEvent = useSendPageEvent();
  const sendEvent = useSendEvent();
  const { data: session } = useSession();
  const [displayAlert, setDisplayAlert] = useState(false);

  // Add feature flag
  const [newCheckoutFlag] = useFlag('new-checkout-method');
  const useNewCheckoutMethod = newCheckoutFlag?.variationKey === 'on';

  // Add the checkout payment hook
  const { checkoutMutation, pollPaymentStatus, isProcessing, getTimeToComplete, setPaymentInitiationTime } =
    useCheckoutPayment({
      onError() {
        setAlert('No es posible realizar esta acción en este momento');
      },
      onTimeout() {
        setDisplayAlert(true);
      },
    });

  useEffect(() => {
    sendPageEvent(TrackEvents.checkout.cash.pageViewed, PageViewedCategory);
  }, []);

  useEffect(() => {
    if (!itemsQuantity) _router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity, _router, guardianHash]);

  const handlePaymentStatusChange = useRef<() => void>(() => undefined);

  handlePaymentStatusChange.current = () => {
    if (pollPaymentStatus.data?.status === 'pending') {
      if (!pollPaymentStatus.data?.content) {
        setAlert('No es posible realizar esta acción en este momento');
        return;
      }
      const content = pollPaymentStatus.data.content as Record<string, any>;
      const timeToComplete = getTimeToComplete();
      const payinId = content.payin_id || checkoutMutation.data?.payment_id;

      sendEvent(TrackEvents.checkout.payment.success, {
        payin_id: payinId,
        amount: commissionValues.CASH_IN.total,
        payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.Cash,
        time_to_complete_seconds: timeToComplete,
        items_count: itemsQuantity,
      });

      setCashInData(content);
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
    } else if (pollPaymentStatus.data?.status === 'rejected') {
      const timeToComplete = getTimeToComplete();

      sendEvent(TrackEvents.checkout.payment.failed, {
        failure_reason: 'Cash payment rejected',
        error_code: 'cash_payment_rejected',
        amount: commissionValues.CASH_IN.total,
        payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.Cash,
        time_to_complete_seconds: timeToComplete,
      });

      setAlert('No es posible realizar esta acción en este momento');
    }
  };

  // Monitor payment status and redirect when payment is successful
  useEffect(() => {
    handlePaymentStatusChange.current();
  }, [pollPaymentStatus.data?.status]);

  const {
    isPending: isLoading,
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
    sendEvent(TrackEvents.checkout.cash.confirmCashPayment);
    setOpen(false);
    if (itemsQuantity) {
      setPaymentInitiationTime();

      if (useNewCheckoutMethod) {
        sendEvent(TrackEvents.checkout.payment.initiated, {
          guardian_id: session?.user.id,
          payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.Cash,
          amount: commissionValues.CASH_IN.total,
          session_id: session?.user.id,
          items_count: itemsQuantity,
        });
        checkoutMutation.mutate({
          items: cartItems,
          preferenceType: PreferenceTypeEnum.CASH_IN,
          guardian: session?.user.id || '',
        });
      } else {
        mutateCheckoutCashIn({
          items: cartItems,
        });
      }
    }
  };

  if (!itemsQuantity) return null;

  return (
    <>
      <InformationDrawer
        intent="error"
        open={displayAlert}
        title="Se produjo un error al procesar la operación"
        description=""
        onClick={() => {
          setDisplayAlert(false);
          _router.push(`/guardians/${guardianHash}`);
        }}
      />
      <Head>
        <title>Pago en efectivo</title>
      </Head>
      <div className="max-w-sm mx-auto px-0">
        <hr className="border-gray-200" />
        <div className="flex ml-2">
          <button
            onClick={() => _router.push(`/guardians/${guardianHash}/payments`)}
            className="bg-white mr-2 mt-2 mb-2 p-2 rounded-full hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <div className="flex items-center mt-2 mb-2 justify-center">
            <div>
              <h1 className="text-2xl font-semibold text-[#091A7A]">Pago en efectivo</h1>
            </div>
          </div>
        </div>
        <hr className="border-[#E3E0FF]" />

        <div className="mb-4 bg-[#ffecb2] px-5 py-3 flex flex-col gap-1 ">
          <p className="text-sm font-semibold text-[#212b36] leading-5">
            Aviso: Ya no aceptamos pagos en efectivo en BBVA
          </p>
          <p className="text-sm font-normal text-[#212b36] leading-5">
            Debido a incidencias con la verificación de estos pagos, esta opción fue desactivada. Para un pago seguro,
            consulta más opciones en "¿Dónde pagar?"
          </p>
        </div>

        <div className="ml-2 mr-2">
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
        </div>
        <div className="flex justify-center p-4 mb-12">
          <div className="mt-6">
            <PoweredByKushki />
          </div>
          <div className="fixed bottom-0 inset-x-0 m-auto w-full max-w-[600px] py-9 px-8 flex justify-center items-center">
            <LoadingButton
              className="w-full mt-auto font-medium"
              onClick={() => {
                sendEvent(TrackEvents.checkout.cash.cashPaymentInitiated);
                setOpen(true);
              }}
              disabled={isLoading || isSuccess || isProcessing}
              loading={isLoading || isProcessing}
            >
              Quiero pagar
            </LoadingButton>
          </div>
        </div>
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
                disabled={isLoading || isProcessing}
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
      </div>
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
        destination: appendUtmParameters(`/guardians/${guardianHash}`, context.query),
      },
    };
  }
};
KushkiCashIn.auth = true;
export default KushkiCashIn;
