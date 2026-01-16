import { useCallback, useEffect, useState, useRef } from 'react';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import KushkiTransferInCard from '~/components/molecules/guardians/KushkiTransferInCard';
import StepsToPay from '~/components/molecules/guardians/StepsToPay';
import { TRANSFER_IN_KUSHKI } from '~/utils/stepsToPay';
import Image from 'next/image';
import type { Session } from 'next-auth';
import { GetServerSideProps } from 'next';
import { InformationDrawer } from '~/components/Drawer.Variants';
import { catchPaymentPage } from '~/utils/processCatch';
import { ProjectEnum } from '@cometa/hooks';
import { getCommissionValues } from '~/utils/kushkiCreditCard';
import { PreferenceTypeEnum, CreateRefundDashboardRequestDTOPaymentMethodEnum } from '@cometa/trpc';
import { StockErrorAlert } from '~/components/StockErrorAlert';
import { isStockError } from '~/utils/stocks';
import { useCartItems, useSelectionStore } from '~/stores/selectionStorePersisted';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import { appendUtmParameters } from '~/lib/destinationWithUTM';
import { useFlag } from '~/components/flags/FlagsProvider';
import { useCheckoutPayment } from '~/hooks/usePayment';
import { useAlert } from '~/hooks';
import { Button } from '~/components/ui/Button';
import Chevron from '~/public/icons/ic_arrow_right.svg';

type PaymentContent = {
  payin_id?: string;
  clabe?: string;
};

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
  const cartItems = useCartItems<ProjectEnum.PORTAL>();
  const currency = selectedItems?.[0]?.currency || 'MXN';
  const itemsQuantity = selectedItems?.length;
  const [stockError, setStockError] = useState(false);
  const sendEvent = useSendEvent();
  const sendPageEvent = useSendPageEvent();
  const { data: sessionData } = useSession();
  const { setAlert } = useAlert();
  const [displayAlert, setDisplayAlert] = useState(false);

  const [newCheckoutFlag] = useFlag('new-checkout-method');
  const useNewCheckoutMethod = newCheckoutFlag?.variationKey === 'on';

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
    sendPageEvent(TrackEvents.checkout.bankTransfer.pageViewed, PageViewedCategory);
  }, []);

  const handlerClabe = () => {
    setHasClabe(true);
  };

  const goToHome = useCallback(() => {
    if (hasClabe) {
      sendEvent(TrackEvents.checkout.bankTransfer.bankTransferFinished);
      router.push({
        pathname: `/guardians/${guardianHash}/`,
        query: { tour: 'pending', status: 'pending', type: 'transfer' },
      });
    } else {
      router.push(`/guardians/${guardianHash}`);
    }
  }, [hasClabe, router, guardianHash]);

  useEffect(() => {
    if (!itemsQuantity) goToHome();
  }, [itemsQuantity, goToHome]);

  const handlePaymentStatusChange = useRef<() => void>(() => undefined);

  handlePaymentStatusChange.current = () => {
    if (pollPaymentStatus.data?.status === 'pending') {
      const timeToComplete = getTimeToComplete();
      const payinId =
        (pollPaymentStatus.data?.content as PaymentContent)?.payin_id || checkoutMutation.data?.payment_id;

      sendEvent(TrackEvents.checkout.payment.success, {
        payin_id: payinId,
        amount: commissionValues.TRANSFER_IN.total,
        payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.Transfer,
        time_to_complete_seconds: timeToComplete,
        items_count: itemsQuantity,
      });

      setHasClabe(true);
    } else if (pollPaymentStatus.data?.status === 'rejected') {
      const timeToComplete = getTimeToComplete();

      sendEvent(TrackEvents.checkout.payment.failed, {
        failure_reason: 'Bank transfer rejected',
        error_code: 'bank_transfer_rejected',
        amount: commissionValues.TRANSFER_IN.total,
        payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.Transfer,
        time_to_complete_seconds: timeToComplete,
      });

      setAlert('No es posible realizar esta acción en este momento');
    }
  };

  // Monitor payment status and redirect when payment is successful
  useEffect(() => {
    handlePaymentStatusChange.current();
  }, [pollPaymentStatus.data, setAlert]);

  // clear on unmount
  useEffect(
    () => () => {
      if (hasClabe) clear();
    },
    [clear, hasClabe]
  );

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
          router.push(`/guardians/${guardianHash}`);
        }}
      />
      <div className="max-w-[600px] mx-auto">
        <div className="border-b" />
        <header className="py-5 px-7  flex items-center gap-5 border-b border-[#E3E0FF] border-solid">
          <button
            className="flex items-center justify-center p-3 bg-white rounded-full w-11"
            onClick={() => router.push(`/guardians/${guardianHash}/payments`)}
          >
            <Chevron className="rotate-180 text-[#4A5CFF] w-3" />
          </button>
          <h2 className="text-[#213372] font-semibold">Transferencia</h2>
        </header>
        <div className="p-2.5">
          <h3 className="text-[#212B36] text-lg font-semibold">Instrucciones</h3>
          &nbsp;
          <p className="text-[#637381]">
            Para poder realizar la transferencia, debes primero generar la CLABE. Una vez generada debes seguir las
            instrucciones para completar la transferencia.
          </p>
        </div>
        {Boolean(itemsQuantity) && useNewCheckoutMethod ? (
          pollPaymentStatus.data?.content ? (
            <KushkiTransferInCard
              hasCommission={!!commissionValues.TRANSFER_IN.commission}
              handlerClabe={() => void 0}
              guardian={session?.user?.id || ''}
              currency={currency}
              items={cartItems}
              setStockError={setStockError}
              prices={{
                subtotal: commissionValues.TRANSFER_IN.subtotal,
                commissions: commissionValues.TRANSFER_IN.commission,
                total: commissionValues.TRANSFER_IN.total,
              }}
              disableMutation
              clabeData={{ clabe: (pollPaymentStatus.data.content as Record<string, string>).clabe }}
            />
          ) : (
            <Button
              className="h-14 rounded-full w-full mx-auto max-w-[500px] px-6 mb-3 block"
              onClick={() => {
                sendEvent(TrackEvents.checkout.bankTransfer.bankTransferInitiated);
                setPaymentInitiationTime();
                sendEvent(TrackEvents.checkout.payment.initiated, {
                  guardian_id: sessionData?.user.id,
                  payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.Transfer,
                  amount: commissionValues.TRANSFER_IN.total,
                  session_id: sessionData?.user.id,
                  items_count: itemsQuantity,
                });
                checkoutMutation.mutate({
                  items: cartItems,
                  preferenceType: PreferenceTypeEnum.TRANSFER_IN,
                  guardian: sessionData?.user.id || '',
                });
              }}
              disabled={isProcessing}
            >
              {isProcessing ? 'Generando CLABE...' : 'Generar CLABE'}
            </Button>
          )
        ) : (
          <KushkiTransferInCard
            hasCommission={!!commissionValues.TRANSFER_IN.commission}
            handlerClabe={handlerClabe}
            guardian={session?.user?.id || ''}
            currency={currency}
            items={cartItems}
            setStockError={setStockError}
            prices={{
              subtotal: commissionValues.TRANSFER_IN.subtotal,
              commissions: commissionValues.TRANSFER_IN.commission,
              total: commissionValues.TRANSFER_IN.total,
            }}
          />
        )}
        <div className="pt-3 px-1 flex flex-col">
          <h3 className="text-[#091A7A] text-lg font-semibold text-center">¿Cómo Pagar?</h3>
          &nbsp;
          <StepsToPay steps={TRANSFER_IN_KUSHKI} />
        </div>
        {hasClabe && (
          <div className="flex justify-center pt-4">
            <Button className="h-14 rounded-full w-full mx-auto max-w-[500px] px-6" onClick={goToHome}>
              Finalizar
            </Button>
          </div>
        )}
        <div className="mb-5 mt-16 flex justify-center">
          <Image src="/images/kushki-logo.svg" alt="Kushki" width={103} height={24} />
        </div>
        <div className="border-b mx-2 mb-4" />
        <div className="flex justify-center items-center mt-2 mb-8 mx-2">
          <Image src="/images/pci-dss-compliant-logo.svg" alt="PCIDSS-logo" height={50} width={120} />
          <p className="text-[#919EAB] text-xs ml-1">
            Este pago es procesado de forma segura por Kushki, un proveedor de pagos PCI de nivel 1.
          </p>
        </div>
        <StockErrorAlert stockError={stockError} setStockError={setStockError} resetSelection={clear} />
      </div>
    </>
  );
}

KushkiTransfer.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Transferencia</title>
      </Head>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { guardianHash } = context.query;
  try {
    const commissionValues = await getCommissionValues(context, PreferenceTypeEnum.TRANSFER_IN);

    return {
      props: {
        session: await getSession(context),
        remoteAddress: context.req.socket.remoteAddress,
        commissionValues: commissionValues,
      },
    };
  } catch (err) {
    catchPaymentPage(err, context, 'GSSP Credit Card');
    isStockError(err, guardianHash, context.query);
    return {
      redirect: {
        permanent: false,
        destination: appendUtmParameters(`/guardians/${guardianHash}`, context.query),
      },
    };
  }
};
KushkiTransfer.auth = true;
export default KushkiTransfer;
