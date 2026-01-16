import Head from 'next/head';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import Navbar from '~/components/Navbar';
import { PageHeader } from '~/components/PageHeader';
import { useCreditCardForm, type CardFormSchema } from '~/components/forms/CreditCardForm';
import { useSubscriptionSelection } from '@cometa/hooks';
import { api } from '~/utils/api';
import { useSelectedSchool } from '~/stores/globalStore';
import { useKushki } from '~/utils/kushkiCreditCard';
import { useEffect, useState } from 'react';
import { CardTypeEnum, FraudStatusEnum, PreferenceTypeEnum } from '@cometa/trpc';
import { FormProvider } from 'react-hook-form';
import { Drawer } from '@cometa/recreo';
import { Button } from '~/components/ui/Button';
import DoubleCards from '~/public/images/double-cards.svg';
import Tag from '~/components/Tag';
import { useSession } from 'next-auth/react';
import { formatPrice } from '~/utils/orders';
import dayjs from '~/lib/dayjs';
import { useAlert } from '~/hooks';
import { usePathname } from 'next/navigation';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import { KushkiCreditCardForm } from '~/components/forms/KushkiCreditCardForm';
import { InformationDrawer } from '~/components/Drawer.Variants';

function KushkiCreditCardSubscription() {
  const { data: session } = useSession();
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const kushkiInstance = useKushki();
  const [openAutoCheckoutDrawer, setOpenAutoCheckoutDrawer] = useState(false);
  const { selectedItems, resetSelection, totalToPay } = useSubscriptionSelection();
  const itemsQuantity = selectedItems?.length;
  const utils = api.useUtils();
  const { setAlert } = useAlert();
  const sendEvent = useSendEvent();
  const sendPageEvent = useSendPageEvent();
  const path = usePathname();
  const status = router.query.status as 'success' | 'error' | undefined;
  const methods = useCreditCardForm();
  const [isLoading, setIsLoading] = useState(false);

  const [currentCardBrandCode, setCurrentCardBrandCode] = useState<CardTypeEnum>();
  const [currentFormData, setCurrentFormData] = useState<CardFormSchema>();

  const show3DS = session?.user.fraud_status === FraudStatusEnum.HighRisk;

  useEffect(() => {
    sendPageEvent(TrackEvents.subscriptions.checkoutPageViewed, PageViewedCategory);
  }, []);

  useEffect(() => {
    if (status === 'success') {
      sendPageEvent(TrackEvents.subscriptions.checkoutSuccessPageViewed, PageViewedCategory);
    }
  }, [status]);

  const commissionValues = utils.kushki.getCommissionValues.getData({
    preference_type: PreferenceTypeEnum.CARD,
    items: selectedItems.map((item) => ({
      student: item.student_id,
      order: item.next_order_id,
    })),
  });

  const isAutoCheckout = dayjs().isSame(selectedItems?.[0]?.next_due, 'month');

  const mutation = api.subscriptions.subscribe.useMutation({
    onError(error) {
      const errorData = JSON.parse(error.message);
      if (isAutoCheckout && errorData.message === 'Student has no fulfillments') {
        resetSelection();
        router.push({ query: { ...router.query, status: 'last_fulfillment' } }, undefined, { shallow: true });
      } else if (errorData.code) {
        router.push({ query: { ...router.query, error: errorData.code } }, undefined, { shallow: true });
      } else {
        router.push({ query: { ...router.query, error: 'external' } }, undefined, { shallow: true });
      }
    },
    onSuccess() {
      resetSelection();
      router.push({ query: { ...router.query, status: 'success' } }, undefined, { shallow: true });
    },
  });

  const { mutateAsync: mutateCheckoutCard } = api.kushki.checkoutCard.useMutation({
    onSuccess() {
      setAlert('La orden del mes vigente fue cobrada con éxito.', 'success', true);
    },
  });

  const updateGuardianMutation = api.guardian.update.useMutation();

  const aceptTerms = async (amount: number) => {
    if (session?.user.id) {
      await updateGuardianMutation.mutateAsync({
        id: session.user.id,
        data: {
          terms_acceptance: {
            amount,
            signed_site: path,
          },
        },
        query: { force: true },
      });
    }
  };

  const handleSubscription = async ({
    cardInfo,
    cardBrandCode,
  }: {
    cardInfo: CardFormSchema;
    cardBrandCode: CardTypeEnum;
  }) => {
    if (!kushkiInstance || !itemsQuantity) return;

    try {
      const [expiryMonth, expiryYear] = cardInfo.expiryDate ? cardInfo.expiryDate.split('/') : ['', ''];
      const totalToPayWithCommission = commissionValues?.[cardBrandCode]?.total ?? totalToPay;

      // Store current values for auto-checkout
      setCurrentCardBrandCode(cardBrandCode);
      setCurrentFormData(cardInfo);

      await aceptTerms(totalToPayWithCommission);

      if (isAutoCheckout) {
        sendEvent(TrackEvents.subscriptions.subscription.submitted);
        setOpenAutoCheckoutDrawer(true);
        return;
      }

      kushkiInstance.requestSubscriptionToken(
        {
          currency: 'MXN',
          card: {
            name: cardInfo.name ?? '',
            number: cardInfo.number ? cardInfo.number.replaceAll(' ', '') : '',
            expiryMonth,
            expiryYear,
            cvc: cardInfo.cvv,
          },
        },
        (response) => {
          if ('code' in response) {
            sendEvent(TrackEvents.subscriptions.subscription.failed);
            router.push({ query: { ...router.query, error: response.code } }, undefined, { shallow: true });
            return;
          }

          sendEvent(TrackEvents.subscriptions.subscription.submitted);
          const startDate = dayjs(selectedItems[0].next_due).add(1, 'day');
          mutation.mutate({
            schoolId: selectedSchool?.id ?? '',
            data: {
              concept_id: selectedItems[0].concept_id,
              student_id: selectedItems[0].student_id,
              start_date: startDate.format('YYYY-MM-DD'),
              card_type: cardBrandCode,
              token: response.token,
            },
          });
        }
      );
    } catch (error) {
      sendEvent(TrackEvents.subscriptions.subscription.failed);
      router.push({ query: { ...router.query, error: 'external' } }, undefined, { shallow: true });
    }
  };

  const handleAutoCheckout = async (cardInfo: CardFormSchema, cardBrandCode: CardTypeEnum) => {
    setIsLoading(true);
    if (!kushkiInstance || !itemsQuantity) return;

    const [expiryMonth, expiryYear] = cardInfo.expiryDate ? cardInfo.expiryDate.split('/') : ['', ''];
    const totalToPayWithCommission = commissionValues?.[cardBrandCode]?.total ?? totalToPay;

    kushkiInstance.requestToken(
      {
        amount: totalToPayWithCommission,
        currency: 'MXN',
        card: {
          name: cardInfo.name ?? '',
          number: cardInfo.number ? cardInfo.number.replaceAll(' ', '') : '',
          expiryMonth,
          expiryYear,
          cvc: cardInfo.cvv ?? '',
        },
      },
      async (response) => {
        if ('code' in response) {
          router.push({ query: { ...router.query, error: response.code } }, undefined, { shallow: true });
          return;
        }

        const { token, secureId, security } = response;

        if (show3DS && security && secureId) {
          kushkiInstance.requestValidate3DS(
            {
              secureId,
              security: {
                authRequired: !!security.authRequired,
                acsURL: security.acsURL,
                authenticationTransactionId: security.authenticationTransactionId,
                paReq: security.paReq,
              },
            },
            async (response3DS) => {
              if ('code' in response3DS) {
                router.push({ query: { ...router.query, error: response3DS.code } }, undefined, { shallow: true });
                return;
              }

              if (!response3DS.isValid) {
                router.push({ query: { ...router.query, error: 'K3DS_INVALID' } }, undefined, { shallow: true });
                return;
              }

              await handleCurrentMonthCheckout(token, cardBrandCode);
              await handleSubscription({ cardInfo, cardBrandCode });
            }
          );
        } else {
          await handleCurrentMonthCheckout(token, cardBrandCode);
          await handleSubscription({ cardInfo, cardBrandCode });
        }
      }
    );
  };

  const handleCurrentMonthCheckout = async (token: string, cardBrandCode: CardTypeEnum) => {
    await mutateCheckoutCard({
      items: [
        {
          order: selectedItems[0].next_order_id,
          student: selectedItems[0].student_id,
        },
      ],
      cardType: cardBrandCode,
      kushkiToken: token,
    });
  };

  const student = session?.user?.dependents.find(
    (student) => selectedItems?.[0] && student.id === selectedItems[0].student_id
  );

  const getTotalWithCommission = (cardBrandCode: CardTypeEnum) =>
    commissionValues?.[cardBrandCode]?.total ?? totalToPay;

  const confirmSuccess = () => {
    router.push(`/guardians/${router.query.guardianHash}/subscriptions`);
  };

  return (
    <>
      <AutoCheckoutDrawer
        open={openAutoCheckoutDrawer}
        onClose={() => {
          sendEvent(TrackEvents.subscriptions.subscription.dismissed);
          setOpenAutoCheckoutDrawer(false);
          setIsLoading(false);
        }}
        onConfirm={() => {
          if (currentFormData && currentCardBrandCode) {
            handleAutoCheckout(currentFormData, currentCardBrandCode);
          }
          setOpenAutoCheckoutDrawer(false);
        }}
        student={student}
        selectedItems={selectedItems}
        totalToPayWithCommission={currentCardBrandCode ? getTotalWithCommission(currentCardBrandCode) : totalToPay}
      />

      <PageHeader
        onClickBack={() => router.replace(`/guardians/${router.query.guardianHash}/subscriptions`)}
        title="Datos de tarjeta"
        className="mb-9"
      />
      <InformationDrawer
        open={status === 'success'}
        onClose={confirmSuccess}
        title="Tu domiciliación fue creada con éxito."
        description="Tus pagos serán cobrados automáticamente. Podrás visualizarlos en tu historial de pagos una vez pagados."
        onClick={() => {
          const event = TrackEvents.subscriptions.subscription.dismissed;
          sendEvent(event);
          confirmSuccess();
        }}
        intent="success"
        minHeight="37vh"
      />

      <FormProvider {...methods}>
        <KushkiCreditCardForm
          onSubmit={handleSubscription}
          commissionValues={commissionValues}
          show3DS={isAutoCheckout && show3DS}
          allowedCards={selectedSchool?.preferences.credit.methods}
          controlledLoading={isLoading}
          onLoadingChange={setIsLoading}
          onError={(error) => {
            setIsLoading(false);
            if ('code' in error) {
              sendEvent(TrackEvents.subscriptions.subscription.failed, {
                error_code: error.code,
                error_message: error.message,
              });
              router.push({ query: { ...router.query, error: error.code } }, undefined, { shallow: true });
            }
          }}
        />
      </FormProvider>
    </>
  );
}

KushkiCreditCardSubscription.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Datos de tarjeta</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

KushkiCreditCardSubscription.auth = true;
export default KushkiCreditCardSubscription;

interface AutoCheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student?: {
    first_name: string;
    color?: {
      background: string;
      text: string;
    };
  };
  selectedItems: Array<{
    concept_name: string;
  }>;
  totalToPayWithCommission: number;
}

function AutoCheckoutDrawer({
  open,
  onClose,
  onConfirm,
  student,
  selectedItems,
  totalToPayWithCommission,
}: AutoCheckoutDrawerProps) {
  if (!student || selectedItems.length === 0) return null;

  return (
    <Drawer.Root className="md:min-h-[30%] space-y-2.5" open={open} dismissible={false}>
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-y-4">
          <DoubleCards />
          <span className="text-xl font-semibold text-center">La orden del mes vigente se cobrará automáticamente</span>
        </div>
        <div className="h-0 border border-[#e2e2e2]" />
        <div className="bg-[#f9f9f9] w-full rounded-lg border border-[#e2e2e2] flex-col justify-center items-start inline-flex">
          <div className="self-stretch px-5 py-4 border-b border-[#e2e2e2] justify-between items-center inline-flex">
            <div className="text-[#1c1c1d] text-lg font-semibold font-lota">{selectedItems[0].concept_name}</div>

            <Tag
              bgcolor={student.color?.background}
              color={student.color?.text}
              text={student.first_name}
              size="medium"
            />
          </div>
          <div className="inline-flex items-center self-stretch justify-start px-5 py-4">
            <div className="text-[#1c1c1d] text-lg font-semibold font-lota">
              {formatPrice(totalToPayWithCommission)}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-2.5">
        <Button className="w-full" onClick={onConfirm}>
          Entendido
        </Button>
        <Button className="w-full py-3 px-[30px]" variant="transparent" onClick={onClose}>
          No por el momento
        </Button>
      </div>
    </Drawer.Root>
  );
}
