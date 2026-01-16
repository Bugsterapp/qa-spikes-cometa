import CreditCard from '../../../../public/icons/credit-card.svg';
import Transfer from '../../../../public/icons/transfer.svg';
import Cash from '../../../../public/icons/cash.svg';
import Crediko from '../../../../public/icons/crediko.svg';
import IcInfo from '~/public/icons/ic_info_warning.svg';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { FEATURE_KUSHKI_CASH_IN, FEATURE_KUSHKI_CREDIT_CARD, FEATURE_KUSHKI_TRANSFER_IN } from '~/utils/featuresKeys';
import { FraudStatusEnum } from '@cometa/trpc';
import Info from '~/../dashboard/public/assets/icons/ic_info.svg';
import Head from 'next/head';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import Cookies from '~/lib/Cookies';
import { useSession } from 'next-auth/react';

import { encrypt } from '~/lib/base64';
import { useEffect, useState } from 'react';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { ProjectEnum, CartItem } from '@cometa/hooks';
import { useSelectedSchool, useSetSchools } from '~/stores/globalStore';
import Chevron from '~/public/icons/ic_arrow_right.svg';
import * as PaymentMethod from '~/components/PaymentMethodOption';
import { useForm, Controller } from 'react-hook-form';
import useFeatures from '~/hooks/useFeatures';
import LoadingButton from '~/components/ui/LoadingButton';
import { api } from '~/utils/api';
import { useStock } from '~/utils/stocks';
import { StockErrorAlert } from '~/components/StockErrorAlert';
import * as Drawer from '~/components/atoms/guardians/Drawer';
import { useCartItems, useSelectionStore } from '~/stores/selectionStorePersisted';
import { formatPrice, typeOfOrdersInStore } from '~/utils/orders';
import ThumbUp from '~/public/icons/material-symbols_thumb-up.svg';
import { useFlag } from '~/components/flags/FlagsProvider';
import { convertCartItemsToCredikoFulfillments } from '~/utils/crediko';
import { useCredikoPayment } from '~/hooks/useCredikoPayment';

// We only store formatted orders as we need to have this info on next pages
const saveOrdersToCookies = (selectedItems: CartItem[]) => {
  const savedValues = Cookies.get('COMMISSION_VALUES');
  // const constructedItems = selectedItems.map((item) => ({ order: item.order_id, student: item.student.id }));

  if (JSON.stringify(savedValues) !== JSON.stringify(selectedItems)) {
    Cookies.set('COMMISSION_VALUES', selectedItems);
  }
};

const MAX_TICKET_AMOUNT = 20000;

type FormValues = 'credit-card' | 'ticket' | 'bank-transfer' | 'crediko';
function Payments() {
  const selectedSchool = useSelectedSchool();
  const paymentPreferences = selectedSchool?.preferences;
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<{ paymentMethod: FormValues }>({
    defaultValues: paymentPreferences?.credit.is_active
      ? { paymentMethod: 'credit-card' }
      : { paymentMethod: undefined },
  });

  const { features } = useFeatures();
  const _router = useRouter();
  const { data: session } = useSession();
  const { guardianHash, error = null } = _router.query;
  const { selectedItems, totalToPay, clear, itemQuantities, ordersHaveDependents } = useSelectionStore();
  const cartItems = useCartItems<ProjectEnum.PORTAL>();
  const itemsQuantity = cartItems?.length;
  const setSchools = useSetSchools();
  const { data: guardian, isLoading } = api.guardian.me.useQuery();
  const [stockError, setStockError] = useState(false);
  const [showBlockedCashModal, setShowBlockedCashModal] = useState(false);
  const { validateStock } = useStock(selectedSchool?.id ?? session?.user.schools[0]?.id ?? '');

  const sendEvent = useSendEvent();
  const sendPageEvent = useSendPageEvent();
  const { optional, mandatory } = typeOfOrdersInStore(selectedItems);

  const [credikoFlag] = useFlag('enable_payment_method_crediko');

  const credikoVariables = credikoFlag?.variables as {
    school_id?: { equals?: string[] };
  };
  const allowedSchoolIds = credikoVariables?.school_id?.equals;

  const isCredikoEnabled =
    credikoFlag?.enabled &&
    selectedSchool?.id &&
    Array.isArray(allowedSchoolIds) &&
    allowedSchoolIds.includes(selectedSchool.id);

  const isAllHide = Object.values(paymentPreferences ?? {}).every((pref) => !pref.is_active) && !isCredikoEnabled;

  const { processCredikoPayment } = useCredikoPayment({
    onSuccess: () => setLoading(false),
    onError: () => setLoading(false),
  });

  useEffect(() => {
    sendPageEvent(TrackEvents.checkout.paymentMethods.pageViewed, PageViewedCategory, { optional, mandatory });
  }, []);

  const doesHasHighRiskProfile = session?.user.fraud_status === FraudStatusEnum.HighRisk;

  useEffect(() => {
    if (!itemsQuantity) _router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity]);

  useEffect(() => {
    if (guardian?.schools) {
      setSchools(guardian.schools);
    }
  }, [guardian]);

  useEffect(() => {
    _router.prefetch(`/guardians/${guardianHash}/payments/transfer-in/kushki`);
    _router.prefetch(`/guardians/${guardianHash}/payments/cash-in/kushki`);
    _router.prefetch(`/guardians/${guardianHash}/payments/credit-card/kushki`);
  }, [_router, guardianHash]);

  const goBack = () => _router.push(`/guardians/${guardianHash}`);

  const onSubmit = async (values: { paymentMethod: FormValues }) => {
    const notHaveStock = await validateStock(itemQuantities);
    if (notHaveStock) {
      setStockError(true);
      return;
    }
    setLoading(true);
    saveOrdersToCookies(cartItems);
    const query = new URLSearchParams({
      orders: encrypt(cartItems),
    }).toString();
    switch (values.paymentMethod) {
      case 'credit-card':
        if (features.some((feat) => feat.name === FEATURE_KUSHKI_CREDIT_CARD)) {
          sendEvent(TrackEvents.checkout.paymentMethods.payWithCard, { optional, mandatory });
          _router.push(`/guardians/${guardianHash}/payments/credit-card/kushki?${query}`);
        } else {
          setLoading(false);
        }
        break;
      case 'ticket':
        if (features.some((feat) => feat.name === FEATURE_KUSHKI_CASH_IN)) {
          sendEvent(TrackEvents.checkout.paymentMethods.payWithCash, { optional, mandatory });
          _router.push(`/guardians/${guardianHash}/payments/cash-in/kushki?${query}`);
        } else {
          setLoading(false);
        }
        break;
      case 'bank-transfer':
        if (features.some((feat) => feat.name === FEATURE_KUSHKI_TRANSFER_IN)) {
          sendEvent(TrackEvents.checkout.paymentMethods.payWithBankTransfer, { optional, mandatory });
          _router.push(`/guardians/${guardianHash}/payments/transfer-in/kushki?${query}`);
        } else {
          setLoading(false);
        }
        break;
      case 'crediko':
        if (isCredikoEnabled) {
          sendEvent(TrackEvents.checkout.paymentMethods.payWithCrediko, { optional, mandatory });
          const fulfillments = convertCartItemsToCredikoFulfillments(cartItems, selectedItems);
          processCredikoPayment(fulfillments);
        } else {
          setLoading(false);
        }
        break;
      default:
        setLoading(false);
        break;
    }
  };

  const disableTicket = totalToPay >= MAX_TICKET_AMOUNT;
  const isCashBlocked = paymentPreferences?.cash_ticket.is_active && guardian?.block_cash_payments;
  const shouldDisableCash = disableTicket || !ordersHaveDependents;

  return (
    <div className="flex flex-col h-screen bg-[#F6F5FA]">
      <header className="py-5 px-7 bg-[#F6F5FA] flex items-center gap-5 border-b border-[#E3E0FF] border-solid">
        <button className="flex justify-center items-center p-3 w-11 bg-white rounded-full" onClick={goBack}>
          <Chevron className="rotate-180 text-[#4A5CFF] w-3" />
        </button>
        <h2 className="text-[#213372] font-semibold">Método de pago</h2>
      </header>
      <section className="flex flex-col flex-1 px-5 py-9">
        <span className="text-[#344054] text-sm">Selecciona el método de pago que prefieras.</span>
        {doesHasHighRiskProfile && (
          <div className="bg-[#E8F4FF] text-[#0D4F8C] flex justify-between px-4 py-3 mt-6 rounded-[0.875rem]">
            <span>
              <Info className="text-[#1890FF] w-7 h-7" />
            </span>
            <div className="ml-3">
              <span className="text-[#0D4F8C] text-sm font-normal">
                Para el pago del contracargo solo puedes utilizar efectivo o transferencia.
              </span>
            </div>
          </div>
        )}
        <form className="flex flex-col flex-1 justify-between" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field, formState }) => (
              <PaymentMethod.Group
                onValueChange={(value) => {
                  sendEvent(TrackEvents.checkout.paymentMethods.paymentMethodSelected, {
                    paymentMethod: value,
                    optional,
                    mandatory,
                  });
                  field.onChange(value);
                }}
                value={field.value}
                className="mt-6"
                defaultValue={formState.defaultValues?.paymentMethod}
                disabled={loading}
              >
                {!doesHasHighRiskProfile && paymentPreferences?.credit.is_active && (
                  <PaymentMethod.Option value="credit-card">
                    <CreditCard color="primary" />
                    <div className="flex flex-col items-start">
                      <div className="inline-flex py-px px-[7px] rounded-[4px] bg-[#85E0A359] text-[#54AA70] gap-x-1 mb-1">
                        <ThumbUp />
                        <span className="font-bold text-[10px] leading-4">Recomendada</span>
                      </div>
                      <span className="text-[#344054] text-left font-medium">Tarjeta de débito o crédito</span>
                      <span className="text-[#344054] text-xs text-left">
                        Paga con tarjeta y obtén la validación del pago al instante.
                      </span>
                    </div>
                  </PaymentMethod.Option>
                )}
                {paymentPreferences?.cash_ticket.is_active && (
                  <>
                    {isCashBlocked ? (
                      <div
                        onClick={() => setShowBlockedCashModal(true)}
                        className="cursor-pointer items-center min-h-[83px] grid grid-cols-[30px_1fr_auto] gap-x-4 w-full bg-transparent p-4 rounded-2xl border-2 border-solid border-[#C4C4C4]"
                      >
                        <Cash color="#A6A6A6" />
                        <div className="flex flex-col items-start">
                          <div className="inline-flex py-px px-2 rounded-md bg-[#FFECB2] text-[#6B5103] gap-x-1 mb-1 items-center border border-transparent">
                            <IcInfo className="w-[12px] h-[12px] shrink-0 text-[#6B5103]" />
                            <span className="font-semibold text-xs">No disponible</span>
                          </div>
                          <span className="text-[#A6A6A6] text-left font-medium">Efectivo</span>
                          <span className="text-[#A6A6A6] text-xs text-left">
                            Pago en sucursales afiliadas. Puede tardar hasta 48 horas en ser validado
                          </span>
                        </div>
                        <div className="w-6 flex items-center justify-center h-6 border-2 border-solid border-[#C4C4C4] bg-white rounded-full" />
                      </div>
                    ) : (
                      <PaymentMethod.Option value="ticket" disabled={shouldDisableCash}>
                        <Cash color={shouldDisableCash ? '#57537A' : '#344054'} />
                        <div className="flex flex-col items-start">
                          <span className="text-[#344054] text-left font-medium">Efectivo</span>
                          <span className="text-[#344054] text-xs text-left">
                            Pago en sucursales afiliadas. Puede tardar hasta 48 horas en ser validado
                          </span>
                          {disableTicket && (
                            <span className="text-[#344054] text-sm text-left">
                              El monto límite para efectivo es de {formatPrice(MAX_TICKET_AMOUNT, 'MXN')}
                            </span>
                          )}
                        </div>
                      </PaymentMethod.Option>
                    )}
                  </>
                )}
                {paymentPreferences?.bank_transfer.is_active && (
                  <PaymentMethod.Option value="bank-transfer" disabled={!ordersHaveDependents}>
                    <Transfer color="primary" width="25px" height="25px" />
                    <div className="flex flex-col items-start">
                      <span className="text-[#344054] text-left font-medium">Transferencia</span>
                      <span className="text-[#344054] text-xs text-left">
                        Paga a través de transferencias. Puede tardar hasta 48 horas en ser validado
                      </span>
                    </div>
                  </PaymentMethod.Option>
                )}
                {isCredikoEnabled && (
                  <PaymentMethod.Option value="crediko">
                    <Crediko />
                    <div className="flex flex-col items-start">
                      <span className="text-[#344054] text-left font-medium">CredikoPay</span>
                    </div>
                  </PaymentMethod.Option>
                )}
              </PaymentMethod.Group>
            )}
          />
          <Drawer.Root open={showBlockedCashModal} onOpenChange={setShowBlockedCashModal}>
            <Drawer.Overlay />
            <Drawer.Content className="max-w-md left-1/2 -translate-x-1/2">
              <div className="px-6 py-8 flex flex-col space-y-5">
                <h2 className="text-[#212B36] text-base font-semibold">Opción "Efectivo" no disponible</h2>

                <div className="text-[#637381] text-sm leading-5 space-y-3">
                  <p>
                    Deshabilitamos esta opción debido a que detectamos intentos de pago previos en{' '}
                    <span className="font-semibold">BBVA en ventanillas o practicajas.</span>
                  </p>
                  <p>
                    Como te informamos, <span className="font-semibold">ya no aceptamos pagos por dicho canal</span>.
                  </p>
                  <p>
                    Para evitarte nuevos inconvenientes, por favor selecciona Tarjeta o Transferencia para continuar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBlockedCashModal(false);
                  }}
                  className="w-full py-3 px-8 bg-[#4A5CFF] text-white text-sm font-medium rounded-2xl shadow-[6px_6px_20px_rgba(85,112,255,0.3)] hover:bg-[#3A4CDF] transition-colors"
                >
                  Entendido
                </button>
              </div>
            </Drawer.Content>
          </Drawer.Root>

          <StockErrorAlert
            stockError={stockError || error === 'stock'}
            setStockError={setStockError}
            resetSelection={clear}
          />

          <LoadingButton
            loading={loading}
            disabled={(loading && isLoading) || isAllHide}
            className="mt-auto w-full font-medium"
          >
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
    <div className="bg-[#F6F5FA]">
      <Head>
        <title>Métodos de Pago</title>
      </Head>
      <div className="mx-auto max-w-md">{page}</div>
    </div>
  );
};

export default Payments;
