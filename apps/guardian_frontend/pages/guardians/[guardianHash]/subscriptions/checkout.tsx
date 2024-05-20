import Head from 'next/head';
import { useRouter } from 'next/router';

import Navbar from '~/components/Navbar';

import { InformationDrawer } from '~/components/Drawer.Variants';

import { PageHeader } from '~/components/PageHeader';
import CreditCardForm, { useCreditCardForm, type CardFormSchema } from '~/components/forms/CreditCardForm';
import { useSubscriptionSelection } from '@cometa/hooks';
import { api } from '~/utils/api';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import { useKushki } from '~/utils/kushkiCreditCard';
import { BinInfoResponse } from '@kushki/js/lib/types/bin_info_response';
import { useState } from 'react';
import { CardTypeEnum } from '@cometa/trpc';
import { SubscriptionTokenRequest } from '@kushki/js/lib/types/subscription_token_request';
import { ErrorResponse } from '@kushki/js/lib/types/error_response';
import { sendTrackEvent } from '~/utils/events';
import * as Sentry from '@sentry/nextjs';
import { getCardBrand } from '~/lib/getCardBrand';
import { FormProvider } from 'react-hook-form';

function KushkiCreditCardSubscription() {
  const methods = useCreditCardForm();
  const { getValues } = methods;
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const kushkiInstance = useKushki();

  const [cardInfoByKushki, setCardInfoByKushki] = useState<BinInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { selectedItems, resetSelection } = useSubscriptionSelection();
  const itemsQuantity = selectedItems?.length;

  const mutation = api.subscriptions.subscribe.useMutation({
    onError() {
      resetSelection();
      setIsLoading(false);
      router.push({ query: { ...router.query, status: 'error' } }, undefined, { shallow: true });
    },
    onSuccess() {
      resetSelection();
      router.push({ query: { ...router.query, status: 'success' } }, undefined, { shallow: true });
    },
  });

  const cardData = getCardBrand(getValues().number ?? '');

  const getCardBrandCode = () => {
    const { AMEX, CREDIT, DEBIT } = CardTypeEnum;
    if (cardData?.card?.type === 'american-express') {
      return AMEX;
    } else if (cardInfoByKushki?.cardType === 'debit') {
      return DEBIT;
    } else {
      return CREDIT;
    }
  };

  const cardBrandCode = getCardBrandCode();

  const catchErrorCardInfo = (error: ErrorResponse, showError = false) => {
    if (showError) {
      router.push({ query: { ...router.query, status: 'error' } }, undefined, { shallow: true });
    }
    if (error.message !== 'Bin no válido.') {
      sendTrackEvent('portal: Subscription Failed', {
        code: error.code,
        message: error.message,
        method: 'requestBinInfo',
        type: 'Credit',
      });
      Sentry.setContext('Subscription requestBinInfo catch Error', {
        message: error.message,
        code: error.code,
      });
      Sentry.captureEvent({ message: `Subscription requestBinInfo catch ${JSON.stringify(error)}` });
    }
  };

  const checkout = ({ name, number, expiryMonth, expiryYear, cvv }: SubscriptionTokenRequest['card']) => {
    kushkiInstance?.requestSubscriptionToken(
      {
        currency: 'MXN',
        card: {
          number,
          name,
          expiryMonth,
          expiryYear,
          cvc: cvv,
        },
      },
      (response) => {
        if (!('code' in response) && Boolean(itemsQuantity)) {
          const subscriptionData = selectedItems[0];
          const mutateData = {
            concept_id: subscriptionData.concept_id,
            student_id: subscriptionData.student_id,
            start_date: subscriptionData.next_due,
            card_type: cardBrandCode,
            token: response.token,
          };

          mutation.mutate({
            schoolId: selectedSchool?.id ?? '',
            data: mutateData,
          });
        } else {
          router.push({ query: { ...router.query, status: 'error' } }, undefined, { shallow: true });
          setIsLoading(false);
        }
      }
    );
  };

  const handleSubmit = ({ cvv, expiryDate, name, number }: CardFormSchema) => {
    const [expiryMonth, expiryYear] = expiryDate.split('/');
    setIsLoading(true);

    if (!cardInfoByKushki) {
      kushkiInstance?.requestBinInfo({ bin: number }, (response) => {
        if (!('code' in response)) {
          setCardInfoByKushki(response);
          checkout({ name, number: number.replaceAll(' ', ''), expiryMonth, expiryYear, cvv });
        } else {
          setCardInfoByKushki(null);
          catchErrorCardInfo(response, true);
        }
      });
    } else {
      checkout({ name, number: number.replaceAll(' ', ''), expiryMonth, expiryYear, cvv });
    }
  };

  const status = router.query.status as 'success' | 'error' | undefined;

  const onCloseDrawer = () => {
    if (status === 'success') {
      router.push({
        pathname: '/guardians/[guardianHash]/subscriptions',
        query: { guardianHash: router.query.guardianHash },
      });
    } else {
      router.push({ query: { ...router.query, status: undefined } }, undefined, { shallow: true });
    }
  };

  return (
    <>
      <InformationDrawer
        open={status !== undefined}
        onClose={onCloseDrawer}
        title={
          status === 'success'
            ? 'Tu domiciliación fue creada con éxito.'
            : 'Hubo un error en el alta de tu domiciliación.'
        }
        description={
          status === 'success'
            ? 'Tus pagos serán cobrados automáticamente. Podrás visualizarlos en tu historial de pagos una vez pagados.'
            : 'Hubo un error con tu pago'
        }
        onClick={onCloseDrawer}
        intent={status ?? 'error'}
        minHeight="37vh"
      />
      <PageHeader onClickBack={() => router.back()} title="Datos de tarjeta" className="mb-9" />
      <FormProvider {...methods}>
        <CreditCardForm onSubmit={handleSubmit} disabled={isLoading} isLoading={isLoading} />
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
