import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { PayButton } from '~/components/PayButton';
import Navbar from '~/components/Navbar';
import PendingAlert from '~/components/PendingAlert';
import DialogRating from '~/components/molecules/guardians/dialogs/DialogRating';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import { SEGMENT_RATING_CSAT_PAYMENT } from '~/utils/segmentKeys';
import { FIRST_PAYMENT_JOYRIDE, FIRST_PAYMENT_PENDING_JOYRIDE } from '~/utils/joyride';
import { useRouter } from 'next/router';
import useCheckoutStore from '~/stores/checkoutStore';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import useSendTrackEvent from '~/hooks/useSendEvent';
import { useTour } from '~/hooks/useTour';
import { STATUS, type CallBackProps } from 'react-joyride';
import { api } from '~/utils/api';
import { type GuardianDependentFulfillment, type GuardianDependentOrder, StatusDc1Enum } from '@cometa/trpc/src/types';
import {
  ProjectEnum,
  useFulfillmentSelection,
  useOrderSelection,
  useSelectionStore,
  useStudentStore,
} from '@cometa/hooks';
import { cn } from '~/lib/cn';
import EmptyPageCardImage from '~/public/images/empty-page-orders.svg';
import { Tabs, TabsContent, TabsTrigger } from '~/components/Tabs';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import useDebounce from '~/hooks/useDebounce';
import { useSelectedSchool, useSelectedSchoolId } from '~/components/molecules/common/AuthGlobal';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useFlags } from '~/flags/client';
import { HolidayDialog } from '~/components/HolidayDialog';
import * as OrderCard from '~/components/OrderCard';
import {
  OrderCardDue,
  OrderCardInscription,
  OrderCardNotDue,
  OrderCardSubscription,
} from '~/components/OrderCard.Variants';
import { validateStock } from '~/utils/stocks';
import { Tooltip } from '~/components/atoms/guardians/Tooltips';
import { StockErrorAlert } from '~/components/StockErrorAlert';
import { Banner } from '~/components/Banner';
import { InformationDrawer } from '~/components/Drawer.Variants';
import { useUrlState } from '~/hooks/useUrlState';

const OrderList = dynamic(() => import('~/components/OrderList'), { ssr: false });
const JoyrideTooltip = dynamic(() => import('~/components/atoms/common/JoyrideTooltip'), { ssr: false });
const Tour = dynamic(() => import('~/components/atoms/common/Tour'), { ssr: false });

interface HomeProps {
  session: Session;
  guardianHash: string;
  tour: string;
  status: string;
  tab: 'subscriptions' | 'optionals';
}

const goToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

function Home({ session, guardianHash, tour, status, tab }: Readonly<HomeProps>) {
  const [tabValue, setTabValue] = useState<'subscriptions' | 'optionals'>(tab);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [showFuture, setShowFuture] = useState(false);
  const router = useRouter();
  const [setCheckoutData] = useCheckoutStore((state) => [state.setCheckoutData]);
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const [hideTabs, setHideTabs] = useState(true);
  const selectedSchool = useSelectedSchool();
  const sendTrackEvent = useSendTrackEvent();
  const { flags } = useFlags({ traits: { schoolId: selectedSchool?.id } });
  const [stockError, setStockError] = useState(false);
  const [urlState, setUrlState] = useUrlState();
  const {
    data: fulfillments,
    isLoading,
    isError,
  } = api.orders.getSchoolOrders.useQuery(
    {
      schoolId: selectedSchool?.id ?? session?.user.schools[0]?.id ?? '',
      status: [StatusDc1Enum.NOT_PAID, StatusDc1Enum.WAITING_PAID, StatusDc1Enum.PARTIAL_PAID],
    },
    {
      retry: 3,
    }
  );

  const { data: payments } = api.payin.getGuardianPayins.useQuery(
    {
      schoolId: selectedSchool?.id ?? session?.user.schools[0]?.id ?? '',
      statuses: [StatusDc1Enum.WAITING_PAID],
    },
    {
      retry: 3,
    }
  );

  const { totalToPay, isDisabled, handleItemSelect, selectedItems, resetSelection } = useFulfillmentSelection(
    fulfillments || [],
    ProjectEnum.PORTAL
  );

  useEffect(() => {
    if (!isLoading && !fulfillments?.length) {
      sendTrackEvent('portal: No Orders', {
        user: session?.user?.id,
        schoolId: selectedSchool?.id,
        isError,
      });
    }
  }, [fulfillments, isLoading]);

  const { data: optionalOrders, isLoading: isLoadingOptionalOrders } = api.orders.getGuardiansOptionalOrders.useQuery(
    {
      schoolId: selectedSchool?.id ?? session?.user.schools[0]?.id ?? '',
      multiple_search: searchDebounced,
    },
    {
      select(data) {
        return data?.filter((order: any) => order.concept?.concept_assignment_is_deleted !== true);
      },
    }
  );

  useEffect(() => {
    if (optionalOrders?.length && fulfillments?.length) setHideTabs(false);
    if (optionalOrders?.length && !fulfillments?.length) {
      setTabValue('optionals');
    }
  }, [optionalOrders, fulfillments]);

  const inscriptions = fulfillments?.filter(
    (f) => f.concept.type === 'INSCRIPTION' || f.concept.type === 'REINSCRIPTION'
  );
  /**
   * @description We will filter the fulfillments by type and exclude the inscriptions from the due & outstanding orders.
   * @see https://cometa.atlassian.net/browse/PAD-508
   */
  const dueOrders = fulfillments?.filter((f) => f.order_type === 'due' && !inscriptions?.includes(f));
  const futureOrders = fulfillments?.filter((f) => f.order_type === 'future' && !inscriptions?.includes(f));
  const outstandingOrders = fulfillments?.filter((f) => f.order_type === 'outstanding' && !inscriptions?.includes(f));

  const { handleOrderSelect } = useOrderSelection(optionalOrders || [], ProjectEnum.PORTAL);

  const onChangeFulfillment = (fulfillment: GuardianDependentFulfillment) => {
    sendTrackEvent('portal: Order Selected', {
      type: fulfillment.status,
    });
    handleItemSelect(fulfillment);
  };

  const onChangeOrder = (fulfillment: GuardianDependentOrder) => {
    sendTrackEvent('portal: Order Selected', {
      type: fulfillment.concept.type,
    });
    handleOrderSelect(fulfillment);
  };

  const { showTour, handleShowTour } = useTour();

  useSendPageViewedEvent('Home — por pagar / ordenes pasadas');

  useEffect(() => {
    if (tour === 'pending') goToTop();
  }, []);

  useEffect(() => {
    const ratedPayment = localStorage.getItem(RATED_CSAT_PAYMENT);
    if (status && !ratedPayment) setOpenRatingDialog(true);
  }, [status]);

  const changeTour = (callBack: CallBackProps, tour: string) => {
    if (callBack.status === STATUS.FINISHED) handleShowTour(tour);
  };

  const onContinueToVerifyRFC = async () => {
    setIsLoadingButton(true);
    const hasStock = await validateStock(
      selectedSchool?.id ?? session?.user.schools[0]?.id ?? '',
      session.token,
      selectedItems
    );
    if (!hasStock) {
      setStockError(true);
    } else {
      setStockError(false);
      setIsLoadingButton(true);
      setCheckoutData(totalToPay, fulfillments?.length ? fulfillments[0].currency : 'MXN', selectedItems.length);
      router.push(`/guardians/${guardianHash}/verify_rfc`);
    }
  };

  /**
   * @description We will render incoming orders (not due) list if there are outstanding orders or future orders. If there are no outstanding orders,
   * we will only render future orders without a `show more` button, else we will render outstanding orders initially and future orders below the `show more` button.
   */
  const shouldRenderIncomingList = Boolean(
    outstandingOrders?.length || (!outstandingOrders?.length && futureOrders?.length)
  );

  const showFutureImmediately = outstandingOrders?.length === 1;
  const futureOrdersToShow = showFutureImmediately ? futureOrders?.slice(0, 3) : futureOrders;
  const futureOrdersToHide = showFutureImmediately ? futureOrders?.slice(3) : futureOrders;

  const canPayPartial = selectedSchool?.config_dashboard?.partial_payins_payment_portal;

  const isSelectButtonDisabled = (order: GuardianDependentFulfillment) =>
    !!isDisabled(order) || order.concept.payment_only_in_dashboard;

  return (
    <>
      <HolidayDialog
        open={Boolean(flags?.lock_dialog)}
        brillamont={selectedSchool?.id === '0ff7bba2-ac51-4108-bb76-2dad89f80875'}
      />
      <div className={cn({ 'pb-36': !!totalToPay })}>
        <Tabs
          value={tabValue}
          className="w-full border-b-[#E3E0FF] border-b border-solid border-t-0 border-x-0"
          onValueChange={(value) => {
            setTabValue(value as 'subscriptions' | 'optionals');
            router.replace(`/guardians/${session.user.hash}?tab=${value}`);
          }}
          hideTabs={hideTabs}
        >
          <TabsTrigger
            value="subscriptions"
            className="flex-col w-full py-6 text-xs font-light xl:text-sm lg:flex-row lg:font-normal"
          >
            Conceptos escolares
          </TabsTrigger>
          <TabsTrigger
            value="optionals"
            className="flex-col w-full py-6 text-xs font-light xl:text-sm lg:flex-row lg:font-normal"
          >
            Conceptos opcionales
          </TabsTrigger>
          <TabsContent
            value="subscriptions"
            className="relative flex flex-col space-y-4 items-center px-5 data-[state='active']:pb-6 lg:mt-9 data-[state='inactive']:m-0 lg:data-[state='active']:min-h-[calc(100vh_-_250px)]"
          >
            <PendingAlert hash={guardianHash} pendings={payments?.length ?? 0} />
            {isLoading || inscriptions?.length ? (
              <OrderList title="Inscripciones" loading={isLoading}>
                {inscriptions?.map((order) => (
                  <OrderCardInscription
                    canPayPartial={canPayPartial}
                    disabled={isSelectButtonDisabled(order)}
                    order={order}
                    onChangeFulfillment={onChangeFulfillment}
                    selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                    student={session.user.dependents.find((d) => d.id === order.student.id)}
                    key={order.id}
                  />
                ))}
              </OrderList>
            ) : null}
            {isLoading || dueOrders?.length ? (
              <OrderList
                title="Pagos vencidos"
                info="Selecciona las colegiaturas más antiguas primero para poder habilitar las siguientes."
                loading={isLoading}
              >
                {dueOrders?.map((order) => (
                  <OrderCardDue
                    canPayPartial={canPayPartial}
                    disabled={isSelectButtonDisabled(order)}
                    order={order}
                    onChangeFulfillment={onChangeFulfillment}
                    selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                    student={session.user.dependents.find((d) => d.id === order.student.id)}
                    key={order.id}
                  />
                ))}
              </OrderList>
            ) : null}

            {shouldRenderIncomingList ? (
              <OrderList
                title="Pagos por vencer"
                loading={isLoading}
                extraItems={Boolean(
                  (outstandingOrders?.length && futureOrders?.length) ||
                    (outstandingOrders?.length === 1 && futureOrders?.length && futureOrders?.length > 3)
                )}
                onShowMore={(state) => setShowFuture(state)}
              >
                <>
                  {outstandingOrders?.length
                    ? outstandingOrders?.map((order) => (
                        <OrderCardToPay
                          onPaymentFailInfo={() => {
                            setUrlState({ paymentFailInfo: true });
                          }}
                          canPayPartial={canPayPartial}
                          disabled={isSelectButtonDisabled(order)}
                          order={order}
                          onChangeFulfillment={onChangeFulfillment}
                          selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                          student={session.user.dependents.find((d) => d.id === order.student.id)}
                          key={order.id}
                        />
                      ))
                    : null}
                  {showFutureImmediately || !outstandingOrders?.length
                    ? futureOrdersToShow?.map((order) => (
                        <OrderCardToPay
                          onPaymentFailInfo={() => {
                            setUrlState({ paymentFailInfo: true });
                          }}
                          canPayPartial={canPayPartial}
                          disabled={isSelectButtonDisabled(order)}
                          order={order}
                          onChangeFulfillment={onChangeFulfillment}
                          selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                          student={session.user.dependents.find((d) => d.id === order.student.id)}
                          key={order.id}
                        />
                      ))
                    : null}
                  {showFuture
                    ? futureOrdersToHide?.map((order) => (
                        <OrderCardToPay
                          onPaymentFailInfo={() => {
                            setUrlState({ paymentFailInfo: true });
                          }}
                          canPayPartial={canPayPartial}
                          disabled={isSelectButtonDisabled(order)}
                          order={order}
                          onChangeFulfillment={onChangeFulfillment}
                          selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                          student={session.user.dependents.find((d) => d.id === order.student.id)}
                          key={order.id}
                        />
                      ))
                    : null}
                </>
              </OrderList>
            ) : null}

            {!fulfillments?.length && !isLoading && (
              <div className="flex flex-col items-center justify-center h-[calc(100vh_-_6rem)]">
                <EmptyPageCardImage className="mb-3 w-44" />
                <p className="text-2xl text-center text-[#57537A]">
                  Has completado <br /> <span className="font-bold">todos tus pagos</span>
                </p>
                <Link
                  href={`/guardians/${guardianHash}/payments/history`}
                  className="flex items-center gap-4 text-[#4A5CFF] mt-12"
                >
                  <span>Ver historial de pagos</span>
                  <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14 6.9773C13.9951 6.45119 13.7832 5.9482 13.41 5.5773L9.12 1.2773C8.93264 1.09105 8.67919 0.986511 8.415 0.986511C8.15081 0.986511 7.89736 1.09105 7.71 1.2773C7.61627 1.37027 7.54188 1.48087 7.49111 1.60273C7.44034 1.72459 7.4142 1.85529 7.4142 1.9873C7.4142 2.11931 7.44034 2.25002 7.49111 2.37188C7.54188 2.49374 7.61627 2.60434 7.71 2.6973L11 5.9773H1C0.734784 5.9773 0.48043 6.08266 0.292893 6.27019C0.105357 6.45773 0 6.71208 0 6.9773C0 7.24251 0.105357 7.49687 0.292893 7.6844C0.48043 7.87194 0.734784 7.9773 1 7.9773H11L7.71 11.2673C7.5217 11.4543 7.41538 11.7084 7.41444 11.9738C7.41351 12.2391 7.51802 12.494 7.705 12.6823C7.89198 12.8706 8.1461 12.9769 8.41146 12.9778C8.67683 12.9788 8.9317 12.8743 9.12 12.6873L13.41 8.3873C13.7856 8.01395 13.9978 7.50687 14 6.9773Z"
                      fill="#4A5CFF"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </TabsContent>
          <TabsContent
            value="optionals"
            className="flex flex-col items-center px-5 data-[state='active']:pb-6 lg:items-start lg:mt-9 mt-0 data-[state='inactive']:m-0 lg:data-[state='active']:min-h-[calc(100vh_-_250px)]"
          >
            <PendingAlert className="mt-6" hash={guardianHash} pendings={payments?.length ?? 0} />
            <p className="text-[#57537A] text-sm font-light mb-4 mt-[23px] w-full">
              Puedes buscar por el nombre del concepto.
            </p>
            <div className="border-[#A2ABB9] border rounded-lg flex justify-between items-center px-4 py-3 w-full mb-[26px] gap-3">
              <div className="w-6">
                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g clipPath="url(#a)">
                    <path
                      d="m23.707 22.294-5.97-5.97a10.016 10.016 0 1 0-1.413 1.415l5.969 5.969a1 1 0 0 0 1.414-1.414ZM10 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Z"
                      fill="#A2ABB9"
                    />
                  </g>
                  <defs>
                    <clipPath id="a">
                      <path fill="#fff" d="M0 0h24v24H0z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <CustomInput
                className="p-0 bg-transparent placeholder:text-[#B4B8C6] placeholder:font-light"
                placeholder="Nombre del concepto"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={() => sendTrackEvent('portal: Feature Used', { feature: 'Buscar órdenes' })}
              />
            </div>
            <div className="w-full">
              {isLoadingOptionalOrders || optionalOrders?.length ? (
                <OrderList loading={isLoading}>
                  {optionalOrders?.map((order) => {
                    const selected = selectedItems.some((fulfillment) => fulfillment.id === order.id);
                    const student = session.user.dependents.find((d) => d.id === order.student.id);
                    const { scholarships, special } = order.discount_breakdown?.details ?? {
                      scholarships: null,
                      special: null,
                    };

                    const hasPriceModifiers =
                      Number(order?.discount_breakdown?.details?.scholarships?.total) > 0 ||
                      Number(order?.discount_breakdown?.details?.special?.total) > 0;

                    return (
                      <OrderCard.Root
                        key={order.id}
                        status={order.acquired ? 'acquired' : 'valid'}
                        disabled={isDisabled(order)}
                        selected={selected}
                        onSelectChange={() => onChangeOrder(order)}
                      >
                        <OrderCard.Content>
                          {order.acquired ? (
                            <OrderCard.Header>
                              <div className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 13 12"
                                  className="w-3 h-3"
                                >
                                  <circle cx="6.5" cy="6" r="6" fill="currentColor" />
                                  <path
                                    fill="#fff"
                                    fillRule="evenodd"
                                    d="M9.582 3.73c.267.238.29.648.053.915L5.897 8.838 3.68 6.832a.648.648 0 1 1 .87-.962L5.799 7l2.868-3.218a.648.648 0 0 1 .915-.052Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                ADQUIRIDO
                                <Tooltip message="Ya lo adquiriste previamente,  puedes volver a comprarlo si lo necesitas.">
                                  <svg
                                    className="w-4 h-4 ml-auto"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 17 16"
                                  >
                                    <g fill="#57537A" clipPath="url(#a)">
                                      <path d="M8.5 0a8 8 0 1 0 8 8 8.009 8.009 0 0 0-8-8Zm0 14.667A6.666 6.666 0 1 1 15.167 8 6.674 6.674 0 0 1 8.5 14.667Z" />
                                      <path d="M8.978 3.375A2.667 2.667 0 0 0 5.834 6a.667.667 0 1 0 1.333 0 1.333 1.333 0 0 1 2.276-.943 1.333 1.333 0 0 1-.296 2.111 2.636 2.636 0 0 0-1.314 2.336V10a.667.667 0 0 0 1.334 0v-.496a1.321 1.321 0 0 1 .62-1.168 2.667 2.667 0 0 0-.809-4.96ZM9.167 12a.667.667 0 1 0-1.334 0 .667.667 0 0 0 1.334 0Z" />
                                    </g>
                                    <defs>
                                      <clipPath id="a">
                                        <path fill="#fff" d="M.5 0h16v16H.5z" />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                </Tooltip>
                              </div>
                            </OrderCard.Header>
                          ) : null}
                          <OrderCard.Info>
                            <OrderCard.OrderInfo
                              title={order.name}
                              student={{
                                name: student?.first_name as string,
                                background: student?.color?.background as string,
                                textColor: student?.color?.text as string,
                              }}
                            />
                            {order.concept.payment_only_in_dashboard && (
                              <Banner className="mt-3">Este item debe ser pagado directamente con el colegio.</Banner>
                            )}
                          </OrderCard.Info>
                          {hasPriceModifiers && (
                            <OrderCard.Details>
                              <OrderCard.DetailsTrigger>Ver detalles</OrderCard.DetailsTrigger>
                              <OrderCard.DetailsContent>
                                <OrderCard.PriceDetails
                                  subtotal={order.price}
                                  discounts={[
                                    ...((scholarships?.details as Record<string, string>[]) ?? []),
                                    ...(special?.details ?? []),
                                  ]}
                                />
                              </OrderCard.DetailsContent>
                            </OrderCard.Details>
                          )}
                          <OrderCard.PayFooter
                            testId={`card-footer-${order.name}`}
                            amount={order.final_amount}
                            pending={false}
                            needStock={'stock' in order}
                            isOutOfStock={
                              order.stock !== null && order.stock?.is_limited && (order?.stock?.quantity ?? 0) === 0
                            }
                          />
                        </OrderCard.Content>
                      </OrderCard.Root>
                    );
                  })}
                </OrderList>
              ) : null}
              {!isLoadingOptionalOrders && !optionalOrders?.length && (
                <span className="block mx-auto text-sm font-light text-center text-slate-500">
                  No tenemos resultados en este momento.
                </span>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <StockErrorAlert
          stockError={stockError}
          resetSelection={resetSelection}
          setIsLoadingButton={setIsLoadingButton}
          setStockError={setStockError}
        />
        {!!totalToPay && (
          <PayButton
            itemsQuantity={selectedItems.length}
            priceTotal={totalToPay}
            currency={fulfillments?.length ? fulfillments[0].currency : 'MXN'}
            onClick={onContinueToVerifyRFC}
            buttonText="CONTINUAR"
            loading={isLoadingButton}
          />
        )}

        <Tour
          run={Boolean(!!payments?.length && showTour !== null && !showTour?.pending && tour === 'pending')}
          steps={FIRST_PAYMENT_PENDING_JOYRIDE}
          tooltipComponent={JoyrideTooltip}
          callback={(callback) => changeTour(callback, 'pending')}
        />

        <Tour
          run={Boolean(showTour !== null && !showTour?.history && tour === 'history')}
          steps={FIRST_PAYMENT_JOYRIDE}
          tooltipComponent={JoyrideTooltip}
          callback={(callback) => changeTour(callback, 'history')}
        />
      </div>
      <DialogRating
        open={openRatingDialog}
        onClose={() => {
          setOpenRatingDialog(false);
        }}
        text="¿Cómo calificarías tu experiencia de pago?"
        statusPayment={status}
        segmentName={SEGMENT_RATING_CSAT_PAYMENT}
      />
      <InformationDrawer
        open={urlState?.paymentFailInfo === 'true'}
        intent="warning"
        title="No se pudo realizar el cobro"
        description={
          <div className="flex flex-col gap-y-1">
            <span>No se puedo realizar el cobro por errores con la tarjeta asociada.</span>
            <span>
              Debes pagar manualmente esta orden antes de la fecha de vencimiento, de lo contrario la domiciliación se
              dará de baja automáticamente.
            </span>
          </div>
        }
        onClick={() => {
          setUrlState({ paymentFailInfo: false });
        }}
      />
    </>
  );
}

interface OrderCardToPayProps {
  order: GuardianDependentFulfillment;
  onChangeFulfillment: (fulfillment: GuardianDependentFulfillment) => void;
  student?: Session['user']['dependents'][number];
  disabled: boolean;
  canPayPartial: boolean;
  selected: boolean;
  onPaymentFailInfo: () => void;
}

function OrderCardToPay({
  order,
  onChangeFulfillment,
  student,
  disabled,
  canPayPartial,
  selected,
  onPaymentFailInfo,
}: Readonly<OrderCardToPayProps>) {
  const selectedSchoolId = useSelectedSchoolId();
  const router = useRouter();
  const { setStudentIds } = useStudentStore();
  const { clear } = useSelectionStore();

  if (order?.subscription?.id) {
    const onClickInfo = () => {
      clear();
      setStudentIds([order.student.id]);
    };
    return (
      <OrderCardSubscription
        disabled={disabled}
        order={order}
        onChangeFulfillment={onChangeFulfillment}
        selected={selected}
        student={student}
        hrefInfo={{
          pathname: '/guardians/[guardianHash]/subscriptions/[id]',
          query: { ...router.query, id: order.subscription.id, school: selectedSchoolId },
        }}
        onClickInfo={onClickInfo}
        onPaymentFailInfo={onPaymentFailInfo}
      />
    );
  }

  return (
    <OrderCardNotDue
      canPayPartial={canPayPartial}
      disabled={disabled}
      order={order}
      onChangeFulfillment={onChangeFulfillment}
      selected={selected}
      student={student}
    />
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  const { guardianHash, tour = null, status = null, tab = 'subscriptions' } = context?.query || { guardianHash: '' };

  if (session?.user.onboarding_stage !== 'COMPLETED') {
    return {
      redirect: {
        destination: `/guardians/${guardianHash}/onboarding`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      guardianHash,
      tour: !session?.user?.tour_completed?.first_login ? 'first_login' : tour,
      status,
      tab,
    },
  };
};
Home.auth = true;
export default Home;
