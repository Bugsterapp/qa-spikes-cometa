import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import Chevron from '~/public/icons/ic_arrow_right.svg';
import { ErrorBoundary } from '@sentry/nextjs';
import BoxError from '~/components/atoms/common/BoxError';
import { useEffect, useRef } from 'react';
import { getCommissionValues, useKushki } from '~/utils/kushkiCreditCard'; // Add useKushki
import { TrackEvents } from '~/constants/events';
import type { GetServerSideProps } from 'next';
import { catchPaymentPage } from '~/utils/processCatch';
import type { ProjectEnum } from '@cometa/hooks';
import { useSelectedSchool } from '~/stores/globalStore';
import { api } from '~/utils/api';
import { FraudStatusEnum, PreferenceTypeEnum, CreateRefundDashboardRequestDTOPaymentMethodEnum } from '@cometa/trpc';
import { isStockError } from '~/utils/stocks';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCartItems, useSelectionStore } from '~/stores/selectionStorePersisted';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { appendUtmParameters } from '~/lib/destinationWithUTM';
import { KushkiCreditCardForm, KushkiCreditCardFormProps } from '~/components/forms/KushkiCreditCardForm';
import { FormProvider } from 'react-hook-form';
import Cookies from 'lib/Cookies';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import type { ErrorResponse } from '@kushki/js/lib/types/error_response';
import { TokenResponse } from '@kushki/js/lib/types/remote/token_response';
import { Validate3DsResponse } from '@kushki/js/lib/types/validate_3ds_response';
import { typeOfOrdersInStore } from '~/utils/orders';
import { useCreditCardForm } from '~/components/forms/CreditCardForm';
import { useCheckoutPayment } from '~/hooks/usePayment';
import { useFlag } from '~/components/flags/FlagsProvider';

type CardCommission = {
  type: 'percentage';
  value: number;
  subtotal: number;
  commission: number;
  total: number;
};

type PageProps = {
  commissionValues: {
    DEBIT: CardCommission;
    CREDIT: CardCommission;
    AMEX: CardCommission;
  };
};

type FailedPayment = {
  code: string;
  message: string;
};

type PaymentContent = {
  payin_id?: string;
  code?: string;
  message?: string;
};

function KushkiCreditCard({ commissionValues }: Readonly<PageProps>) {
  const selectedSchool = useSelectedSchool();
  const router = useRouter();
  const { guardianHash } = router.query;
  const { selectedItems, totalToPay } = useSelectionStore();
  const cartItems = useCartItems<ProjectEnum.PORTAL>();
  const itemsQuantity = selectedItems?.length;
  const schoolCardsAllowed = selectedSchool?.preferences.credit.methods;
  const { data: session } = useSession();
  const sendPageEvent = useSendPageEvent();
  const path = usePathname();
  const kushkiInstance = useKushki();
  const sendEvent = useSendEvent();
  const { optional, mandatory } = typeOfOrdersInStore(selectedItems);

  const show3DS = session?.user.fraud_status === FraudStatusEnum.HighRisk;

  const updateGuardianMutation = api.guardian.update.useMutation();
  const methods = useCreditCardForm();

  const [newCheckoutFlag] = useFlag('new-checkout-method');
  const useNewCheckoutMethod = newCheckoutFlag?.variationKey === 'on';

  useEffect(() => {
    sendPageEvent(TrackEvents.checkout.card.pageViewed);
  }, [sendPageEvent]);

  useEffect(() => {
    if (!itemsQuantity) router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity, router, guardianHash]);

  const { mutate: mutateCheckoutCard } = api.kushki.checkoutCard.useMutation({
    onSuccess() {
      router.push({ pathname: `/guardians/${guardianHash}/success`, query: { status: 'paid' } });
    },
    onError(error) {
      let message: string | Record<string, unknown> = '';

      try {
        message = JSON.parse(error.message);
      } catch (e) {
        message = error.message;
      }
      if (typeof message == 'object' && 'code' in message) {
        router.push({ query: { ...router.query, error: String(message.code) } }, undefined, { shallow: true });
      } else {
        router.push({ query: { ...router.query, error: 'external' } }, undefined, { shallow: true });
      }
    },
  });

  const { checkoutMutation, pollPaymentStatus, getTimeToComplete, setPaymentInitiationTime } = useCheckoutPayment({
    onError(error) {
      let message: string | Record<string, unknown> = '';

      try {
        message = JSON.parse(error.message);
      } catch (e) {
        message = error.message;
      }
      if (typeof message == 'object' && 'code' in message) {
        router.push({ query: { ...router.query, error: String(message.code) } }, undefined, { shallow: true });
      } else {
        router.push({ query: { ...router.query, error: 'external' } }, undefined, { shallow: true });
      }
    },
    onTimeout() {
      router.push({ query: { ...router.query, error: 'payment_failed_timeout' } }, undefined, { shallow: true });
    },
  });

  const handlePaymentStatusChange = useRef<() => void>(() => undefined);

  handlePaymentStatusChange.current = () => {
    if (pollPaymentStatus.data?.status === 'approved') {
      const timeToComplete = getTimeToComplete();
      const payinId =
        (pollPaymentStatus.data?.content as PaymentContent)?.payin_id || checkoutMutation.data?.payment_id;

      sendEvent(TrackEvents.checkout.payment.success, {
        payin_id: payinId,
        amount: totalToPay,
        payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.CreditCard,
        time_to_complete_seconds: timeToComplete,
        items_count: itemsQuantity,
        optional,
        mandatory,
      });

      router.push({ pathname: `/guardians/${guardianHash}/success`, query: { status: 'paid' } });
    } else if (pollPaymentStatus.data?.status === 'rejected') {
      const error = pollPaymentStatus.data?.content as FailedPayment;
      const timeToComplete = getTimeToComplete();

      sendEvent(TrackEvents.checkout.payment.failed, {
        failure_reason: error.message || 'Payment rejected',
        error_code: error.code !== '-' ? error.code : 'payment_failed',
        amount: totalToPay,
        payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.CreditCard,
        time_to_complete_seconds: timeToComplete,
        optional,
        mandatory,
      });

      router.push(
        { query: { ...router.query, error: error.code !== '-' ? error.code : 'payment_failed' } },
        undefined,
        { shallow: true }
      );
    }
  };

  // Monitor payment status and redirect when payment is successful
  useEffect(() => {
    handlePaymentStatusChange.current();
  }, [pollPaymentStatus.data]);

  const aceptTerms = async () => {
    if (session?.user.id) {
      await updateGuardianMutation.mutateAsync({
        id: session?.user.id,
        data: {
          terms_acceptance: {
            amount: totalToPay,
            signed_site: path,
          },
        },
        query: { force: true },
      });
    }
  };

  const handleSubmit: KushkiCreditCardFormProps['onSubmit'] = async ({ cardInfo, cardBrandCode, cardBrand }) => {
    if (!kushkiInstance) return;

    try {
      sendEvent(TrackEvents.checkout.card.pay, { optional, mandatory });
      Cookies.set('FULLFILMENT_VALUES', commissionValues[cardBrandCode]);
      localStorage.removeItem(RATED_CSAT_PAYMENT);

      const [expiryMonth, expiryYear] = cardInfo.expiryDate ? cardInfo.expiryDate.split('/') : ['', ''];

      await aceptTerms();

      kushkiInstance.requestToken(
        {
          amount: commissionValues[cardBrandCode].total,
          currency: 'MXN',
          card: {
            name: cardInfo.name ?? '',
            number: cardInfo.number ? cardInfo.number.replaceAll(' ', '') : '',
            expiryMonth,
            expiryYear,
            cvc: cardInfo.cvv ?? '',
          },
        },
        (response: TokenResponse | ErrorResponse) => {
          if ('code' in response) {
            router.push({ query: { ...router.query, error: response.code } }, undefined, { shallow: true });
            return;
          }

          if (!itemsQuantity) return;

          const { token, secureId, security } = response;

          if (show3DS && security && secureId) {
            kushkiInstance.requestValidate3DS(
              {
                secureId: secureId,
                security: {
                  authRequired: !!security.authRequired,
                  acsURL: security.acsURL,
                  authenticationTransactionId: security.authenticationTransactionId,
                  paReq: security.paReq,
                },
              },
              (response3DS: Validate3DsResponse | ErrorResponse) => {
                if ('code' in response3DS) {
                  router.push({ query: { ...router.query, error: response3DS.code } }, undefined, { shallow: true });
                  return;
                }

                if (response3DS.isValid) {
                  setPaymentInitiationTime();

                  if (useNewCheckoutMethod) {
                    sendEvent(TrackEvents.checkout.payment.initiated, {
                      guardian_id: session?.user.id,
                      payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.CreditCard,
                      amount: totalToPay,
                      session_id: session?.user.id,
                      items_count: itemsQuantity,
                      optional,
                      mandatory,
                    });
                    checkoutMutation.mutate({
                      items: cartItems,
                      cardType: cardBrandCode,
                      token: token,
                      preferenceType: PreferenceTypeEnum.CARD,
                      guardian: session?.user.id || '',
                      cardBrand: cardBrand,
                    });
                  } else {
                    sendEvent(TrackEvents.checkout.payment.initiatedLegacy, {
                      guardian_id: session?.user.id,
                      payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.CreditCard,
                      amount: totalToPay,
                      session_id: session?.user.id,
                      items_count: itemsQuantity,
                      optional,
                      mandatory,
                    });
                    mutateCheckoutCard({
                      items: cartItems,
                      cardType: cardBrandCode,
                      kushkiToken: token,
                    });
                  }
                } else {
                  router.push({ query: { ...router.query, error: 'K3DS_INVALID' } }, undefined, { shallow: true });
                }
              }
            );
          } else {
            setPaymentInitiationTime();

            if (useNewCheckoutMethod) {
              sendEvent(TrackEvents.checkout.payment.initiated, {
                guardian_id: session?.user.id,
                payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.CreditCard,
                amount: totalToPay,
                session_id: session?.user.id,
                items_count: itemsQuantity,
                optional,
                mandatory,
              });
              checkoutMutation.mutate({
                items: cartItems,
                cardType: cardBrandCode,
                token: token,
                preferenceType: PreferenceTypeEnum.CARD,
                guardian: session?.user.id || '',
                cardBrand: cardBrand,
              });
            } else {
              sendEvent(TrackEvents.checkout.payment.initiatedLegacy, {
                guardian_id: session?.user.id,
                payment_method: CreateRefundDashboardRequestDTOPaymentMethodEnum.CreditCard,
                amount: totalToPay,
                session_id: session?.user.id,
                items_count: itemsQuantity,
                optional,
                mandatory,
              });
              mutateCheckoutCard({
                items: cartItems,
                cardType: cardBrandCode,
                kushkiToken: token,
              });
            }
          }
        }
      );
    } catch (error) {
      router.push({ query: { ...router.query, error: 'external' } }, undefined);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center my-4 ml-2">
        <button
          className="flex items-center justify-center w-10 h-10 p-3 mr-4 bg-white rounded-full hover:bg-black/5"
          onClick={() => router.push(`/guardians/${guardianHash}/payments`)}
        >
          <Chevron className="rotate-180 text-[#4A5CFF] w-2" />
        </button>
        <div className="flex items-center justify-center m-2">
          <h2 className="text-[#091A7A] font-bold text-xl">Tarjeta Crédito o Débito</h2>
        </div>
      </div>
      <hr className="border-gray-200 mb-4" />

      <ErrorBoundary fallback={BoxError}>
        <FormProvider {...methods}>
          <KushkiCreditCardForm
            onSubmit={handleSubmit}
            commissionValues={commissionValues}
            show3DS={show3DS}
            allowedCards={schoolCardsAllowed}
            onError={(error) => {
              if ('code' in error) {
                router.push({ query: { ...router.query, error: error.code } }, undefined, { shallow: true });
              }
            }}
          />
        </FormProvider>
      </ErrorBoundary>
    </div>
  );
}

KushkiCreditCard.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Tarjeta Crédito o Débito</title>
      </Head>
      <div className="mx-auto max-w-[600px]">{page}</div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { guardianHash } = context.query;
  const session = await getSession(context);
  try {
    const doesHasHighRiskProfile = session?.user.fraud_status === FraudStatusEnum.HighRisk;
    if (doesHasHighRiskProfile) {
      return {
        redirect: {
          permanent: false,
          destination: appendUtmParameters(`/guardians/${guardianHash}/payments?card-now-allowed=true`, context.query),
        },
      };
    }

    const commissionValues = await getCommissionValues(context, PreferenceTypeEnum.CARD);

    return {
      props: {
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
KushkiCreditCard.auth = true;
export default KushkiCreditCard;
