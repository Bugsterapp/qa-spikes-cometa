import CreditCard from '../../../../public/icons/credit-card.svg';
import Transfer from '../../../../public/icons/transfer.svg';
import Cash from '../../../../public/icons/cash.svg';
import { useMercadopago } from 'react-sdk-mercadopago/lib';
import ApiClient from '~/services/ApiClient';
import { useRouter } from 'next/router';
import { theme } from '~/theme';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import { useAlert } from '~/hooks';
import {
  FEATURE_KUSHKI_CASH_IN,
  FEATURE_KUSHKI_CREDIT_CARD,
  FEATURE_KUSHKI_TRANSFER_IN,
  FEATURE_MERCADO_PAGO_CASH_IN,
  FEATURE_MERCADO_PAGO_CREDIT_CARD,
  FEATURE_MERCADO_PAGO_TRANSFER_IN,
} from '~/utils/featuresKeys';
import Head from 'next/head';
import { Events } from '~/constants/events';
import Cookies from '~/lib/Cookies';
import { useSession } from 'next-auth/react';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { encrypt } from '~/lib/base64';
import { useEffect, useState } from 'react';
import useSendTrackEvent from '~/hooks/useSendEvent';
import { DependentFulfillmentOrder, useSelectionStore } from '@cometa/hooks';
import { defineTypeForOder } from '~/pages/api/orders';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import Chevron from '~/public/icons/ic_arrow_right.svg';
import * as PaymentMethod from '~/components/PaymentMethodOption';
import { useForm, Controller } from 'react-hook-form';
import useFeatures from '~/hooks/useFeatures';
import LoadingButton from '~/components/molecules/LoadingButton';

// We only store formatted orders as we need to have this info on next pages
const saveOrdersToCookies = (selectedItems: DependentFulfillmentOrder[]) => {
  const savedValues = Cookies.get('COMMISSION_VALUES');
  const constructedItems = selectedItems.map((item) => ({ order: item.order_id, student: item.student.id }));

  if (JSON.stringify(savedValues) !== JSON.stringify(constructedItems)) {
    Cookies.set('COMMISSION_VALUES', constructedItems);
  }
};

const MAX_TICKET_AMOUNT = 20000;

type FormValues = 'credit-card' | 'ticket' | 'bank-transfer';
function Payments() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<{ paymentMethod: FormValues }>({
    defaultValues: { paymentMethod: 'credit-card' },
  });
  const { features } = useFeatures();
  const selectedSchool = useSelectedSchool();
  const _router = useRouter();
  const { data: session } = useSession();
  const { guardianHash } = _router.query;
  const { selectedItems, totalToPay } = useSelectionStore();
  const itemsQuantity = selectedItems?.length;
  const mercadopago = useMercadopago.v2(process.env.NEXT_PUBLIC_MERCADO_PAGO_TOKEN || '', {
    locale: process.env.NEXT_PUBLIC_MERCADO_PAGO_LOCALE || '',
  });
  const paymentPreferences = selectedSchool?.preferences;

  const { setAlert } = useAlert();
  const sendTrackEvent = useSendTrackEvent();

  useEffect(() => {
    if (!itemsQuantity) _router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity]);

  useEffect(() => {
    _router.prefetch(`/guardians/${guardianHash}/payments/transfer-in/kushki`);
    _router.prefetch(`/guardians/${guardianHash}/payments/cash-in/kushki`);
    _router.prefetch(`/guardians/${guardianHash}/payments/credit-card/kushki`);
  }, [_router, guardianHash]);

  useSendPageViewedEvent('Metodo de pago');

  const backUrlBase = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/guardians/${guardianHash}`;

  const initMPCheckout = async () => {
    let preferenceId;

    const constructedOrderTuples = selectedItems.map((item) => ({
      order: item.order_id,
      student: item.student.id,
    }));
    const selectedWithType = selectedItems.map((item) => {
      const type = 'status' in item ? defineTypeForOder(item) : 'outstanding';
      return { order: item.order_id, student: item.student.id, type: type };
    });
    const defeatedOrdersSelected = selectedWithType.filter((item) => item.type === 'due').length;
    const outstandingOrdersSelected = selectedWithType.filter((item) => item.type === 'outstanding').length;
    const futureOrdersSelected = selectedWithType.filter((item) => item.type === 'future').length;

    sendTrackEvent('portal: Checkout started', {
      orders: itemsQuantity,
      defeatedOrdersSelected,
      outstandingOrdersSelected,
      futureOrdersSelected,
    });

    await ApiClient.createMerPagoPreferenceMultiOrders(
      session?.user.id || '',
      constructedOrderTuples,
      backUrlBase,
      session?.token || ''
    )
      .then((res) => {
        preferenceId = res.data.id;
      })
      .catch((error) => {
        if (error?.response?.data?.message === 'metadata field is invalid; it must be less than 4000 chars length') {
          setAlert(`No es posible hacer el pago.\n Seleccione menos órdenes`, 'warning');
        } else if (error?.response?.data?.items) {
          setAlert(error?.response?.data?.items[0]?.non_field_errors[0], 'warning');

          _router.push(`/guardians/${guardianHash}`);
        } else {
          setAlert('No es posible realizar esta acción en este momento');
        }
      });
    localStorage.removeItem(RATED_CSAT_PAYMENT);

    const checkoutOptions = {
      preference: {
        id: preferenceId,
      },
      theme: {
        headerColor: theme.palette.primary.main,
        elementsColor: theme.palette.primary.main,
      },
    };
    mercadopago?.checkout(checkoutOptions).open();
  };

  const goBack = () => _router.back();

  const onSubmit = (values: { paymentMethod: FormValues }) => {
    setLoading(true);
    saveOrdersToCookies(selectedItems);
    const query = new URLSearchParams({
      orders: encrypt(selectedItems.map((item) => ({ order: item.order_id, student: item.student.id }))),
    }).toString();
    switch (values.paymentMethod) {
      case 'credit-card':
        if (
          features.some((feat) => feat.name === FEATURE_KUSHKI_CREDIT_CARD) &&
          features.every((feat) => feat.name !== FEATURE_MERCADO_PAGO_CREDIT_CARD)
        ) {
          sendTrackEvent(Events.pay_with_card);
          _router.push(`/guardians/${guardianHash}/payments/credit-card/kushki?${query}`);
        } else {
          initMPCheckout();
          setLoading(false);
        }
        break;
      case 'ticket':
        if (
          features.some((feat) => feat.name === FEATURE_KUSHKI_CASH_IN) &&
          features.every((feat) => feat.name !== FEATURE_MERCADO_PAGO_CASH_IN)
        ) {
          sendTrackEvent('portal: Pay With Cash Selected');
          _router.push(`/guardians/${guardianHash}/payments/cash-in/kushki?${query}`);
        } else {
          initMPCheckout();
          setLoading(false);
        }
        break;
      case 'bank-transfer':
        if (
          features.some((feat) => feat.name === FEATURE_KUSHKI_TRANSFER_IN) &&
          features.every((feat) => feat.name !== FEATURE_MERCADO_PAGO_TRANSFER_IN)
        ) {
          sendTrackEvent(Events['pay_with_bank_transfer']);
          _router.push(`/guardians/${guardianHash}/payments/transfer-in/kushki?${query}`);
        } else {
          initMPCheckout();
          setLoading(false);
        }
        break;
    }
  };

  const disableTicket = totalToPay >= MAX_TICKET_AMOUNT;
  return (
    <div className="flex flex-col h-screen bg-[#F6F5FA]">
      <header className="py-5 px-7 bg-[#F6F5FA] flex items-center gap-5 border-b border-[#E3E0FF] border-solid">
        <button className="flex items-center justify-center p-3 bg-white rounded-full w-11" onClick={goBack}>
          <Chevron className="rotate-180 text-[#4A5CFF] w-3" />
        </button>
        <h2 className="text-[#213372] font-semibold">Método de pago</h2>
      </header>
      <section className="flex flex-col flex-1 px-5 py-9">
        <span className="text-[#344054] text-sm">Selecciona el método de pago que prefieras.</span>
        <form className="flex flex-col justify-between flex-1" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field, formState }) => (
              <PaymentMethod.Group
                onValueChange={field.onChange}
                value={field.value}
                className="mt-6"
                defaultValue={formState.defaultValues?.paymentMethod}
                disabled={loading}
              >
                {paymentPreferences?.credit.is_active && (
                  <PaymentMethod.Option value="credit-card">
                    <CreditCard color="primary" />
                    <div className="flex flex-col items-start">
                      <span className="text-[#344054] text-left font-medium">Tarjeta de débito o crédito</span>
                      <span className="text-[#344054] text-sm font-light text-left">Visa, Mastercard, etc.</span>
                    </div>
                  </PaymentMethod.Option>
                )}
                {paymentPreferences?.cash_ticket.is_active && (
                  <PaymentMethod.Option value="ticket" disabled={disableTicket}>
                    <Cash color={disableTicket ? '#57537A' : '#344054'} />
                    <div className="flex flex-col items-start">
                      <span className="text-[#344054] text-left font-medium">Efectivo</span>
                      {disableTicket && (
                        <span className="text-[#344054] text-sm text-left">
                          El monto límite para efectivo es de $20,000.00 MXN
                        </span>
                      )}
                    </div>
                  </PaymentMethod.Option>
                )}
                {paymentPreferences?.bank_transfer.is_active && (
                  <PaymentMethod.Option value="bank-transfer">
                    <Transfer color="primary" width="25px" height="25px" />
                    <span className="text-[#344054] text-left font-medium">Transferencia</span>
                  </PaymentMethod.Option>
                )}
              </PaymentMethod.Group>
            )}
          />

          <LoadingButton loading={loading} disabled={loading} className="w-full mt-auto font-medium">
            Continuar
          </LoadingButton>
        </form>
      </section>
    </div>
  );
}

Payments.auth = true;

Payments.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Métodos de Pago</title>
      </Head>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

export default Payments;
