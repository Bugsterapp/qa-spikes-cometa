import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import JoyrideTooltip from '~/components/atoms/common/JoyrideTooltip';
import { PayButton } from '~/components/atoms/guardians/PayButton';
import Tour from '~/components/atoms/common/Tour';
import Navbar from '~/components/organisms/guardians/Navbar';
import OrderCard from '~/components/molecules/guardians/OrderCard';
import PendingAlert from '~/components/PendingAlert';
import DialogRating from '~/components/molecules/guardians/dialogs/DialogRating';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import { SEGMENT_RATING_CSAT_PAYMENT } from '~/utils/segmentKeys';
import { FIRST_PAYMENT_JOYRIDE, FIRST_PAYMENT_PENDING_JOYRIDE } from '~/utils/joyride';
import { useRouter } from 'next/router';
import useCheckoutStore from '~/stores/checkoutStore';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import ToggleFeature from '~/components/molecules/common/ToggleFeature';
import { FEATURE_VERIFY_RFC } from '~/utils/featuresKeys';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import useSendTrackEvent from '~/hooks/useSendEvent';
import { useTour } from '~/hooks/useTour';
import { STATUS, type CallBackProps } from 'react-joyride';
import { api } from '~/utils/api';
import { GuardianDependentFulfillment, GuardianDependentOrder, StatusDc1Enum } from '@cometa/trpc/src/types';
import { ProjectEnum, useFulfillmentSelection, useOrderSelection } from '@cometa/hooks';
import { cn } from '~/lib/cn';
import EmptyPageCardImage from '~/public/images/empty-page-orders.svg';
import { Tabs, TabsContent, TabsTrigger } from '~/components/Tabs';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import OrderOptionalCard from '~/components/molecules/guardians/OrderOptionalCard';
import useDebounce from '~/hooks/useDebounce';
import { useSelectedSchoolId } from '~/components/molecules/common/AuthGlobal';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const OrderList = dynamic(() => import('~/components/OrderList'), { ssr: false });

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
function Home({ session, guardianHash, tour, status, tab }: HomeProps) {
  const [tabValue, setTabValue] = useState<'subscriptions' | 'optionals'>(tab);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [showFuture, setShowFuture] = useState(false);
  const router = useRouter();
  const [setCheckoutData] = useCheckoutStore((state) => [state.setCheckoutData]);
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const [hideTabs, setHideTabs] = useState(true);
  const selectedSchoolId = useSelectedSchoolId();
  const sendTrackEvent = useSendTrackEvent();

  const {
    data: fulfillments,
    isLoading,
    isError,
  } = api.orders.getSchoolOrders.useQuery(
    {
      schoolId: selectedSchoolId || session?.user.schools[0]?.id || '',
      status: [StatusDc1Enum.NOT_PAID, StatusDc1Enum.WAITING_PAID, StatusDc1Enum.PARTIAL_PAID],
    },
    {
      retry: 3,
    }
  );

  const { totalToPay, isDisabled, handleItemSelect, selectedItems } = useFulfillmentSelection(
    fulfillments || [],
    ProjectEnum.PORTAL
  );

  useEffect(() => {
    if (!isLoading && !fulfillments?.length) {
      sendTrackEvent('portal: No Orders', {
        user: session?.user?.id,
        schoolId: selectedSchoolId,
        isError,
      });
    }
  }, [fulfillments, isLoading]);

  const { data: optionalOrders, isLoading: isLoadingOptionalOrders } = api.orders.getGuardiansOptionalOrders.useQuery(
    {
      schoolId: selectedSchoolId ?? session?.user.schools[0]?.id ?? '',
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

  const onContinueToPayments = () => {
    setIsLoadingButton(true);
    setCheckoutData(totalToPay, fulfillments?.length ? fulfillments[0].currency : 'MXN', selectedItems.length);
    router.push(`/guardians/${guardianHash}/resume`);
  };

  const onContinueToVerifyRFC = () => {
    setIsLoadingButton(true);
    setCheckoutData(totalToPay, fulfillments?.length ? fulfillments[0].currency : 'MXN', selectedItems.length);
    router.push(`/guardians/${guardianHash}/verify_rfc`);
  };
  const pendingCount =
    fulfillments?.filter((f) => f.status === 'WAITING_PAID' || f.status === 'PARTIAL_PAID').length || 0;

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
  return (
    <>
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
            Otros conceptos
          </TabsTrigger>
          <TabsContent
            value="subscriptions"
            className="relative flex flex-col space-y-4 items-center px-5 data-[state='active']:pb-6 lg:mt-9 data-[state='inactive']:m-0 lg:data-[state='active']:min-h-[calc(100vh_-_250px)]"
          >
            <PendingAlert hash={guardianHash} pendings={!isLoading ? pendingCount : 0} />
            {isLoading || inscriptions?.length ? (
              <OrderList title="Inscripciones" loading={isLoading}>
                {inscriptions?.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    data={order}
                    session={session}
                    onChange={() => onChangeFulfillment(order)}
                    selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                    disabled={isDisabled(order)}
                    openDetails={index === 0}
                    sponsored={order.final_amount === '0.00'}
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
                {dueOrders?.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    data={order}
                    session={session}
                    onChange={() => onChangeFulfillment(order)}
                    selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                    disabled={isDisabled(order)}
                    openDetails={index === 0}
                    sponsored={order.final_amount === '0.00'}
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
                    ? outstandingOrders?.map((order, index) => (
                        <OrderCard
                          key={order.id}
                          data={order}
                          session={session}
                          onChange={() => onChangeFulfillment(order)}
                          selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                          disabled={isDisabled(order)}
                          openDetails={index === 0}
                          sponsored={order.final_amount === '0.00'}
                        />
                      ))
                    : null}
                  {(showFutureImmediately || !outstandingOrders?.length) &&
                    futureOrdersToShow?.map((order, index) => (
                      <OrderCard
                        key={order.id}
                        data={order}
                        session={session}
                        onChange={() => onChangeFulfillment(order)}
                        selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                        disabled={isDisabled(order)}
                        openDetails={index === 0}
                        sponsored={order.final_amount === '0.00'}
                      />
                    ))}
                  {showFuture &&
                    futureOrdersToHide?.map((order, index) => (
                      <OrderCard
                        key={order.id}
                        data={order}
                        session={session}
                        onChange={() => onChangeFulfillment(order)}
                        selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                        disabled={isDisabled(order)}
                        openDetails={index === 0}
                        sponsored={order.final_amount === '0.00'}
                      />
                    ))}
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
            <PendingAlert hash={guardianHash} pendings={!isLoading ? pendingCount : 0} />
            <p className="text-[#57537A] text-sm font-light mb-4 mt-[23px] w-full">
              Puedes buscar por el nombre del concepto.
            </p>
            <div
              onClick={() => sendTrackEvent('portal: Feature Used', { feature: 'Buscar órdenes' })}
              className="border-[#A2ABB9] border rounded-lg flex justify-between items-center px-4 py-3 w-full mb-[26px] gap-3"
            >
              <div className="w-6">
                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g clip-path="url(#a)">
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
              />
            </div>
            <div className="w-full">
              {isLoadingOptionalOrders || optionalOrders?.length ? (
                <OrderList loading={isLoading}>
                  {optionalOrders?.map((order, index) => (
                    <OrderOptionalCard
                      key={order.id}
                      data={order}
                      session={session}
                      onChange={() => onChangeOrder(order)}
                      selected={selectedItems.some((fulfillment) => fulfillment.id === order.id)}
                      openDetails={index === 0}
                      sponsored={order.final_amount === '0.00'}
                    />
                  ))}
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

        {!!totalToPay && (
          <>
            <ToggleFeature
              featureName={FEATURE_VERIFY_RFC}
              allowComponent={
                <PayButton
                  itemsQuantity={selectedItems.length}
                  priceTotal={totalToPay}
                  currency={fulfillments?.length ? fulfillments[0].currency : 'MXN'}
                  onClick={onContinueToVerifyRFC}
                  buttonText="CONTINUAR"
                  loading={isLoadingButton}
                />
              }
              lockComponent={
                <PayButton
                  itemsQuantity={selectedItems.length}
                  priceTotal={totalToPay}
                  currency={fulfillments?.length ? fulfillments[0].currency : 'MXN'}
                  onClick={onContinueToPayments}
                  buttonText="CONTINUAR"
                  loading={isLoadingButton}
                />
              }
            />
          </>
        )}

        <Tour
          run={Boolean(!!pendingCount && showTour !== null && !showTour?.pending && tour === 'pending')}
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
    </>
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
