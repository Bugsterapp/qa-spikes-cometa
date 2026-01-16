import { ProjectEnum, useStudentStore } from '@cometa/hooks';
import { FraudStatusEnum } from '@cometa/trpc';
import { ActionType } from '@cometa/trpc/src/announcements/types';
import {
  type GuardianDependentFulfillment,
  type GuardianDependentOrder,
  Status2B3Enum,
  StatusDc1Enum,
} from '@cometa/trpc/src/types';
import { keepPreviousData } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { getSession, useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type CallBackProps, LIFECYCLE, STATUS } from 'react-joyride';
import ResponsivePagination from 'react-responsive-pagination';
import { useAnnouncementsQuery } from '~/app/(guardians)/announcements/queries/announcements';
import AnnouncementsBanner from '~/components/announcements-banner';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import { Notice } from '~/components/atoms/guardians/Notice';
import { Tooltip } from '~/components/atoms/guardians/Tooltips';
import { Banner } from '~/components/Banner';
import BlockedPaymentsBanner, {
  BannerType,
  getBannerInfo,
  getBlockedPaymentsMessage,
} from '~/components/BlockedPaymentsBanner';
import CheckoutFooter, {
  CheckoutFooterButton,
  ContainerInfo,
  LabelItemsCount,
  TotalAmount,
} from '~/components/CheckoutFooter';
import { InformationDrawer } from '~/components/Drawer.Variants';
import { useFlag } from '~/components/flags/FlagsProvider';
import { HolidayDialog } from '~/components/HolidayDialog';
import DialogRating from '~/components/molecules/guardians/dialogs/DialogRating';
import Navbar from '~/components/Navbar';
import * as OrderCard from '~/components/OrderCard';
import {
  OrderCardDue,
  OrderCardInscription,
  OrderCardNotDue,
  OrderCardSubscription,
} from '~/components/OrderCard.Variants';
import ChipFilter from '~/components/Orders/ChipFilter';
import DialogTourToPay from '~/components/Orders/DialogTourToPay';
import PendingAlert from '~/components/PendingAlert';
import { StockErrorAlert } from '~/components/StockErrorAlert';
import { Tabs, TabsContent, TabsTrigger } from '~/components/Tabs';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import useDebounce from '~/hooks/useDebounce';
import { useSchoolInscriptionConfig } from '~/hooks/useSchoolInscriptionConf';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { useTour } from '~/hooks/useTour';
import { useUrlState } from '~/hooks/useUrlState';
import { cn } from '~/lib/cn';
import { appendUtmParameters } from '~/lib/destinationWithUTM';
import ICDoorbell from '~/public/icons/ic_doorbell.svg';
import ICSentIt from '~/public/icons/ic_send_it.svg';
import ICWarning from '~/public/icons/ic_warning.svg';
import IcWhatsApp from '~/public/icons/ic_whatsapp.svg';
import GreenCheck from '~/public/icons/success-check.svg';
import EmptyPageCardImage from '~/public/images/empty-page-orders.svg';
import useCheckoutStore from '~/stores/checkoutStore';
import { useGetWebview, useSelectedSchool, useSelectedSchoolId } from '~/stores/globalStore';
import { useCartItems, useOrderSelection, useSelectionStore } from '~/stores/selectionStorePersisted';
import ArrowLink from '~/ui/ArrowLink';
import { api } from '~/utils/api';
import { PAGE_SIZE } from '~/utils/constants';
import { extractConceptTypesFromOrders, typeOfOrdersInStore } from '~/utils/orders';
import { SEGMENT_RATING_CSAT_PAYMENT } from '~/utils/segmentKeys';
import { useStock } from '~/utils/stocks';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import { WHAT_CHARGEBACK_HELP } from '/utils/linksWhatsapp';
import { isDataCompleted } from './students';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

const OrderList = dynamic(() => import('~/components/OrderList'), {
  ssr: false,
});
const JoyrideTooltip = dynamic(() => import('~/components/ui/JoyrideTooltip'), {
  ssr: false,
});
const Tour = dynamic(() => import('~/components/atoms/common/Tour'), {
  ssr: false,
});
const DynamicOnlineStoreBanner = dynamic(() => import('~/components/OnlineStoreBanner'), {
  ssr: false,
});

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
  const sendPageEvent = useSendPageEvent();
  const [tabValue, setTabValue] = useState<'subscriptions' | 'optionals'>(tab);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [showFuture, setShowFuture] = useState(false);
  const router = useRouter();
  const [setCheckoutData] = useCheckoutStore((state) => [state.setCheckoutData]);
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const [hideTabs, setHideTabs] = useState(true);
  const { isInscriptionsEnabled, inscriptionSteps, schoolCycle } = useSchoolInscriptionConfig();
  const selectedSchool = useSelectedSchool();
  const sendTrackEvent = useSendEvent();
  const [stockError, setStockError] = useState(false);
  const [urlState, setUrlState] = useUrlState();
  const schoolId = selectedSchool?.id ?? session?.user.schools[0]?.id ?? '';
  const { validateStock } = useStock(schoolId ?? '');
  const [showTourFirstLogin, setShowTourFirstLogin] = useState(false);
  const { data: blockedPeriodData } = api.checkout.checkBlockedPeriods.useQuery({ schoolId }, { enabled: !!schoolId });

  const bannerInfo = getBannerInfo(blockedPeriodData);

  const blockedMessage =
    blockedPeriodData?.is_blocked && blockedPeriodData.start_date && blockedPeriodData.end_date
      ? getBlockedPaymentsMessage(blockedPeriodData.start_date, blockedPeriodData.end_date, BannerType.Active)
      : undefined;
  const doesHasHighRiskProfile = session?.user.fraud_status === FraudStatusEnum.HighRisk;
  const clientSideSession = useSession();
  const utils = api.useUtils();
  const guardianId = clientSideSession.data?.user.id as string;

  const { data: announcements = [] } = useAnnouncementsQuery(
    selectedSchool?.config_dashboard?.enable_announcements ? selectedSchool?.id ?? '' : '',
    guardianId ?? ''
  );

  const webview = useGetWebview();

  const pendingAnnouncements = announcements.filter(
    (announcement) => !Object.values(ActionType).includes(announcement.status as ActionType)
  );
  const pendingAnnouncementsCount = pendingAnnouncements.length;

  // Notify React Native WebView once the screen is actually ready (mounted + key data loaded).
  const webviewContentReadySentRef = useRef(false);

  const query = router.query;
  const setPage = (newPage: number) => {
    router.push(
      {
        query: {
          ...query,
          page: newPage,
        },
      },
      undefined,
      { shallow: true, scroll: true }
    );
  };

  const page = Number(query.page) || 1;

  const [decision, clientReady] = useFlag('lock_portal');

  if (session?.user.fraud_status !== clientSideSession?.data?.user.fraud_status) {
    router.reload();
  }

  useEffect(() => {
    sendPageEvent(TrackEvents.home.pageViewed, PageViewedCategory);
  }, []);

  const { data: fulfillments, isLoading } = api.orders.getSchoolOrders.useQuery(
    {
      schoolId: selectedSchool?.id ?? session?.user.schools[0]?.id ?? '',
      status: [StatusDc1Enum.NOT_PAID, StatusDc1Enum.WAITING_PAID, StatusDc1Enum.PARTIAL_PAID],
    },
    {
      retry: 3,
      select(data) {
        return data?.results;
      },
    }
  );

  const { data: optionalOrdersQuery, isLoading: isLoadingOptionalOrders } =
    api.orders.getGuardiansOptionalOrders.useQuery(
      {
        schoolId: selectedSchool?.id ?? session?.user.schools[0]?.id ?? '',
        multiple_search: searchDebounced,
        page,
        page_size: PAGE_SIZE,
      },
      {
        select(data) {
          return {
            results: data?.results?.filter((order: any) => order.concept?.concept_assignment_is_deleted !== true),
            count: data?.count,
            nextPage: page + 1,
          };
        },
        placeholderData: keepPreviousData,
      }
    );

  useEffect(() => {
    if (!webview) return;
    if (webviewContentReadySentRef.current) return;
    if (typeof window === 'undefined') return;

    // Wait until the main queries for the Home screen have resolved.
    if (isLoading || isLoadingOptionalOrders) return;

    // Post after paint to ensure layout is committed.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'WEBVIEW_CONTENT_READY' }));
        webviewContentReadySentRef.current = true;
      });
    });
  }, [webview, isLoading, isLoadingOptionalOrders]);

  useEffect(() => {
    const nextPage = optionalOrdersQuery?.nextPage;
    if (nextPage) {
      utils.orders.getGuardiansOptionalOrders.prefetch({
        schoolId: selectedSchool?.id ?? session?.user.schools[0]?.id ?? '',
        multiple_search: searchDebounced,
        page: nextPage,
        page_size: PAGE_SIZE,
      });
    }
  }, [page]);

  const optionalOrders = optionalOrdersQuery?.results;

  const showChargeBack = doesHasHighRiskProfile && optionalOrders ? optionalOrders?.length > 0 : false;

  const { data: payments } = api.payin.getGuardianPayins.useQuery(
    {
      schoolId: selectedSchool?.id ?? session?.user.schools[0]?.id ?? '',
      statuses: [StatusDc1Enum.WAITING_PAID],
    },
    {
      retry: 3,
    }
  );

  const { totalToPay, selectedItems, itemQuantities, clear, setItemQuantities } = useSelectionStore();

  const { isDisabled, handleItemSelect, resetSelection, updateItems } = useOrderSelection(
    fulfillments || [],
    ProjectEnum.PORTAL
  );
  const cartItems = useCartItems<ProjectEnum.PORTAL>();

  useEffect(() => {
    if (selectedItems.length) {
      clear();
      setItemQuantities([]);
    }
  }, []);

  const optionalOrderTypes = useMemo(() => extractConceptTypesFromOrders(optionalOrders ?? []), [optionalOrders]);
  const optionalOrdersFilter = router.query?.filter as string;
  const filteringAll = optionalOrdersFilter === 'all' || !optionalOrdersFilter;

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
  const outstandingOrders = fulfillments?.filter(
    (f) => f.order_type === 'outstanding' && !inscriptions?.includes(f) && !f.concept.optional
  );

  const trackOrderSelection = (isSelected: boolean, properties?: Record<string, unknown>) => {
    const event = isSelected ? TrackEvents.checkout.orderDeselected : TrackEvents.checkout.orderSelected;

    sendTrackEvent(event, properties);
  };

  const onChangeFulfillment = (fulfillment: GuardianDependentFulfillment) => {
    const alreadyInStore = selectedItems.find(
      (item) => item.order_id === fulfillment.order_id && item.student.id === fulfillment.student.id
    );

    trackOrderSelection(!!alreadyInStore, { mandatory: true, optional: false });

    handleItemSelect(fulfillment);
  };

  const onChangeOptionalOrder = (order: GuardianDependentOrder, counter = 1) => {
    const orderNotYetSelected =
      !selectedItems.find((item) => item.id === order.id && item.student.id === order.student.id) && counter > 0;
    const orderSelectedForRemoval =
      selectedItems.find((item) => item.id === order.id && item.student.id === order.student.id) && counter === 0;

    trackOrderSelection(!!orderSelectedForRemoval, {
      counter,
      mandatory: false,
      optional: true,
    });

    if (orderNotYetSelected || orderSelectedForRemoval) {
      handleItemSelect(order);
    }
    updateItems(order, counter);
  };

  const { showTour, handleShowTour } = useTour();

  useEffect(() => {
    if (tour === 'pending') goToTop();
  }, []);

  useEffect(() => {
    const ratedPayment = localStorage.getItem(RATED_CSAT_PAYMENT);
    if (status && !ratedPayment) setOpenRatingDialog(true);
  }, [status]);

  const changeTour = (callBack: CallBackProps, tour: string) => {
    if (callBack.status === STATUS.FINISHED || callBack.lifecycle === LIFECYCLE.COMPLETE) handleShowTour(tour);
  };

  const onContinueToVerifyRFC = async () => {
    setIsLoadingButton(true);
    const notHaveStock = await validateStock(itemQuantities);

    const { optional, mandatory } = typeOfOrdersInStore(selectedItems);

    sendTrackEvent(TrackEvents.checkout.cartOpened, {
      mandatory,
      optional,
    });

    if (notHaveStock) {
      setStockError(true);
    } else {
      setStockError(false);
      setIsLoadingButton(true);
      setCheckoutData(totalToPay, fulfillments?.length ? fulfillments[0].currency : 'MXN', selectedItems.length);
      router.push(`/guardians/${guardianHash}/payments/summary`);
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

  const hasDueOrders = dueOrders && dueOrders?.length > 0;
  const firstFutureOrder = outstandingOrders?.length ? outstandingOrders[0] : futureOrders?.[0];
  const firstOrder = hasDueOrders ? dueOrders[0] : firstFutureOrder;

  const sortedOptionalOrderTypes = useMemo(() => {
    const otherCategory = optionalOrderTypes.find((type) => type.value === 'OTHER');
    const otherCategories = optionalOrderTypes.filter((type) => type.value !== 'OTHER');
    return otherCategory ? [...otherCategories, otherCategory] : otherCategories;
  }, [optionalOrderTypes]);

  const orderFilterOptions = [{ value: 'all', displayValue: 'Todos' }, ...sortedOptionalOrderTypes];
  const hasPayin = session.user.has_payins;

  const { data: activeAdmissions } = api.admissions.getAdmissions.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: { external_guardian_id: [session.user.id], status: ['initial'] },
    },
    { enabled: !!selectedSchool?.id }
  );

  const { data: students } = api.students.getStudents.useQuery(
    { guardianId, schoolId: selectedSchool?.id as string },
    {
      enabled: !!guardianId && !!selectedSchool?.id,
    }
  );

  const hasAdmissions =
    selectedSchool?.config_portal?.enable_admissions_access &&
    activeAdmissions?.results &&
    activeAdmissions.results.length > 0;

  const isAllDataCompleted = students?.every((student) =>
    isDataCompleted(student, !!inscriptionSteps?.enable_consentments_step, schoolCycle?.id as string)
  );

  const hasInscriptions = isInscriptionsEnabled && !isAllDataCompleted;

  const totalPages = Math.ceil(optionalOrdersQuery?.count ? optionalOrdersQuery?.count / PAGE_SIZE : 0);

  const [onlineStore] = useFlag('enable_online_store_in_concepts');
  const onlineStoreEnabled = onlineStore?.enabled;

  return (
    <>
      <HolidayDialog open={Boolean(decision?.enabled && clientReady)} schoolId={selectedSchool?.id as string} />
      {bannerInfo.show && bannerInfo.type && bannerInfo.startDate && bannerInfo.endDate && (
        <div className="mb-6">
          <BlockedPaymentsBanner startDate={bannerInfo.startDate} endDate={bannerInfo.endDate} type={bannerInfo.type} />
        </div>
      )}
      {hasAdmissions && !webview ? (
        <Notice
          title="Tienes una solicitud de admisión en curso"
          description="Accede a la sección de admisiones para ver y completar tus solicitudes de admisión."
          actionLabel="Ir a admisiones"
          onClick={() => {
            router.push(`/guardians/${guardianHash}/admissions`);
          }}
          icon={<AdmissionsIcon />}
        />
      ) : null}

      {hasInscriptions && schoolCycle && !webview ? (
        <Notice
          title={`Reinscripciones ${schoolCycle?.name}`}
          description="Actualiza la información de tus estudiantes como parte del proceso de reinscripciones para el siguiente ciclo escolar."
          actionLabel="Empezar"
          onClick={() => router.push(`/guardians/${guardianHash}/students`)}
        />
      ) : null}

      <div className={cn({ 'pb-36': !!totalToPay })}>
        {showChargeBack ? (
          <div className="flex relative flex-col items-center px-5 pt-16">
            {payments && payments?.length > 0 ? (
              <>
                <div className="flex flex-col text-center p-5 mb-[10px] rounded-[14px] bg-[#FAFAFA] border border-[#919EAB3D] w-[350px]">
                  <div className="flex justify-center mb-5">
                    <ICSentIt />
                  </div>
                  <p className="font-semibold text-[22px] text-[#1C1C1C] mb-[10px]">Pago en proceso</p>
                  <span className="font-normal text-base text-[#57537A]">
                    Cuando se complete el pago de su contracargo podrá visualizar todas las órdenes asociadas a su
                    perfil nuevamente.
                  </span>
                </div>
                <div className="flex flex-col p-5 rounded-[14px] bg-[#FAFAFA] border border-[#919EAB3D] w-[350px]">
                  <div className="flex justify-center mb-[10px]">
                    <ICDoorbell />
                  </div>
                  <span className="font-normal text-base text-center text-[#57537A]">
                    Te notificaremos cuando el pago se haya completado.
                  </span>
                </div>
                <div className="flex justify-center items-center p-5 mt-14 w-[350px]">
                  <IcWhatsApp className="text-[#4A5CFF]" />
                  <a
                    className="text-center block py-4 px-6 appearance-none text-green text-base text-[#4A5CFF] pl-3 font-medium underline underline-offset-2"
                    type="button"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={WHAT_CHARGEBACK_HELP}
                  >
                    Contactar a soporte
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="bg-[#FFF9E6] text-[#946A0B] flex justify-between px-4 py-3 mb-8 rounded-[0.875rem] pending-alert w-[350px]">
                  <span>
                    <ICWarning />
                  </span>
                  <div className="ml-3">
                    <p className="text-[#8C6A04] text-base font-semibold">Contracargo pendiente.</p>
                    <span className="text-[#946A0B] text-sm font-normal">
                      Para habilitar el uso normal de la aplicación debes pagar el contracargo primero.
                    </span>
                  </div>
                </div>
                <OrderList loading={isLoading}>
                  {optionalOrders?.map((order) => {
                    const selected = selectedItems.some((fulfillment) => fulfillment.id === order.id);
                    return (
                      <OrderCard.Root
                        key={order.id}
                        status={order.acquired ? 'acquired' : 'valid'}
                        selected={selected}
                        isOptional={false}
                        onSelectChange={(selected) => onChangeOptionalOrder(order, selected ? 1 : 0)}
                      >
                        <OrderCard.Content>
                          <OrderCard.Info>
                            <OrderCard.OrderInfo
                              title={order.name}
                              tag={
                                <span className="text-[#575757] text-sm font-normal">
                                  {format(new Date(order.created), 'd/MM/yy')}
                                </span>
                              }
                            />
                            {order.concept.payment_only_in_dashboard && (
                              <Banner className="mt-3">Este item debe ser pagado directamente con el colegio.</Banner>
                            )}
                          </OrderCard.Info>
                          <OrderCard.PayFooter
                            testId={`card-footer-${order.name}`}
                            amount={order.final_amount}
                            pending={false}
                            needStock={'stock' in order}
                            hideButton={order.concept.payment_only_in_dashboard}
                            isOutOfStock={order.stock?.is_limited && (order?.stock?.quantity ?? 0) === 0}
                            quantity={
                              itemQuantities.find((itemQuantity) => itemQuantity.order_id === order.id)?.counter
                            }
                            onClickCounter={(counter) => onChangeOptionalOrder(order, counter)}
                          />
                        </OrderCard.Content>
                      </OrderCard.Root>
                    );
                  })}
                </OrderList>
              </>
            )}
          </div>
        ) : (
          <>
            {onlineStoreEnabled && !isLoading && (
              <div className="px-5 pb-3">
                <DynamicOnlineStoreBanner />
              </div>
            )}
            {pendingAnnouncementsCount > 0 && !webview && (
              <div className="my-4">
                <Link href="/announcements" onClick={() => sendTrackEvent(TrackEvents.announcements.homeLinkClicked)}>
                  <AnnouncementsBanner pendingCount={pendingAnnouncementsCount} />
                </Link>
              </div>
            )}
            <Tabs
              value={tabValue}
              className={cn(
                'w-full border-b-[#E3E0FF] border-b border-solid border-t-0 border-x-0 px-[20px] py-0 justify-between items-end sticky bg-[#fbfcfd] z-10',
                {
                  'top-0': webview,
                  'top-14': !webview,
                }
              )}
              onValueChange={(value) => {
                const event =
                  value === 'subscriptions'
                    ? TrackEvents.home.mandatoryOrdersTabClicked
                    : TrackEvents.home.optionalOrdersTabClicked;

                sendTrackEvent(event);
                setTabValue(value as 'subscriptions' | 'optionals');
                router.replace(`/guardians/${session.user.hash}?tab=${value}`);
              }}
              hideTabs={hideTabs}
            >
              <TabsTrigger
                value="subscriptions"
                className="px-0 py-[16px] w-full text-[14px] leading-[24px] tracking-[0.1px] text-center text-[#444C60]"
              >
                Conceptos escolares
              </TabsTrigger>
              <TabsTrigger
                value="optionals"
                className="px-0 py-[16px] w-full text-[14px] leading-[24px] tracking-[0.1px] text-center text-[#444C60]"
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
                    title="Vencidos"
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

                {!fulfillments?.length &&
                  !isLoading &&
                  (hasPayin ? (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh_-_6rem)]">
                      <EmptyPageCardImage className="mb-3 w-44" />
                      <p className="text-2xl text-center text-[#57537A]">
                        Has completado <br /> <span className="font-bold">todos tus pagos</span>
                      </p>
                      <ArrowLink
                        href={`/guardians/${guardianHash}/payments/history`}
                        label="Ver historial de pagos"
                        className="mt-12"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn('flex flex-col justify-center items-center h-[calc(100vh_-_6rem)]', {
                        'h-[calc(100vh-420px)]': hasAdmissions,
                      })}
                    >
                      <GreenCheck />
                      <h3 className="text-[22px] font-semibold text-center text-[#1C1C1C] mt-[22px]">
                        No hay nada que pagar por el momento
                      </h3>
                      <h4 className="mt-3 text-center text-[#57537A]">
                        El colegio no te ha asignado ningún concepto a pagar por el momento.
                      </h4>
                    </div>
                  ))}
              </TabsContent>
              <TabsContent
                value="optionals"
                className="flex relative flex-col pt-16 items-center data-[state='active']:pb-6 lg:items-start mt-5 data-[state='inactive']:m-0 lg:data-[state='active']:min-h-[calc(100vh_-_250px)]"
              >
                <div className="absolute top-0 left-0 right-0 mb-5 w-full">
                  <ChipFilter
                    options={orderFilterOptions}
                    className="px-5"
                    onChange={(val) => {
                      router.push(`/guardians/${guardianHash}?tab=optionals&filter=${val}`, undefined, {
                        scroll: false,
                      });
                    }}
                    value={optionalOrdersFilter ?? 'all'}
                  />
                </div>
                <div className="w-full px-5">
                  <PendingAlert className="mt-6 mb-2" hash={guardianHash} pendings={payments?.length ?? 0} />
                  <div className="border-[#A2ABB9] border rounded-lg flex justify-between items-center px-4 py-3 w-full mb-[26px] gap-3">
                    <div className="w-6">
                      <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Search Icon</title>
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
                      onClick={() =>
                        sendTrackEvent('portal: Feature Used', {
                          feature: 'Buscar órdenes',
                        })
                      }
                    />
                  </div>
                  <div className="w-full">
                    {isLoadingOptionalOrders || optionalOrders?.length ? (
                      <>
                        <OrderList loading={isLoading}>
                          {optionalOrders?.map((order) => {
                            if (!filteringAll && order.concept.type !== optionalOrdersFilter) return null;
                            const selected = selectedItems.some((fulfillment) => fulfillment.id === order.id);
                            const student = session.user.dependents.find((d) => d.id === order.student.id);

                            return (
                              <OrderCard.Root
                                key={order.id}
                                status={order.acquired ? 'acquired' : 'valid'}
                                disabled={isDisabled(order)}
                                selected={selected}
                                isOptional
                              >
                                <OrderCard.Content>
                                  {order.acquired ? (
                                    <OrderCard.Header>
                                      <div className="flex gap-2 items-center">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 13 12"
                                          className="w-3 h-3"
                                        >
                                          <title>Check Icon</title>
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
                                            className="ml-auto w-4 h-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 17 16"
                                          >
                                            <title>Question Icon</title>
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
                                      <Banner className="mt-3">
                                        Este item debe ser pagado directamente con el colegio.
                                      </Banner>
                                    )}
                                  </OrderCard.Info>
                                  <OrderCard.PayFooter
                                    testId={`card-footer-${order.name}`}
                                    amount={order.final_amount}
                                    pending={false}
                                    needStock={'stock' in order}
                                    hideButton={order.concept.payment_only_in_dashboard}
                                    isOutOfStock={order.stock?.is_limited && (order?.stock?.quantity ?? 0) === 0}
                                    quantity={
                                      itemQuantities.find((itemQuantity) => itemQuantity.order_id === order.id)?.counter
                                    }
                                    onClickCounter={(counter) => onChangeOptionalOrder(order, counter)}
                                  />
                                </OrderCard.Content>
                              </OrderCard.Root>
                            );
                          })}
                        </OrderList>
                        <ResponsivePagination
                          className="flex gap-x-1 justify-center items-center mt-8 tracking-wide leading-4 list-none text-center"
                          pageItemClassName="flex justify-center items-center w-7 h-7 text-sm font-medium text-[#57537A] border border-[#D6D5D9] rounded-md hover:border-blue-100 aria-[current=page]:text-[#3E3E3E]"
                          pageLinkClassName="w-7 h-7 display-block flex items-center justify-center aria-[label=Next]:bg-transparent aria-[label=Previous]:bg-transparent rounded-md"
                          activeItemClassName="border-blue-100 border-2 text-base font-semibold pointer-events-none"
                          disabledItemClassName="opacity-50 bg-opacity-0 cursor-not-allowed"
                          navClassName="border-none hover:text-[#3E3E3E]/70"
                          previousClassName="mr-[7px] border-none hover:text-[#3E3E3E]/70"
                          nextClassName="ml-[7px] border-none hover:text-[#3E3E3E]/70"
                          nextLabel={<ExpandMore className="-rotate-90 text-[#3E3E3E]" />}
                          previousLabel={<ExpandMore className="rotate-90 text-[#3E3E3E]" />}
                          total={totalPages}
                          current={page}
                          onPageChange={(selectedPage) => setPage(selectedPage)}
                        />
                      </>
                    ) : null}
                    {!isLoadingOptionalOrders && !optionalOrders?.length && (
                      <span className="block mx-auto text-sm font-light text-center text-slate-500">
                        No tenemos resultados en este momento.
                      </span>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
        <StockErrorAlert
          stockError={stockError}
          resetSelection={resetSelection}
          setIsLoadingButton={setIsLoadingButton}
          setStockError={setStockError}
        />
        <CheckoutFooter open={!!totalToPay}>
          <ContainerInfo>
            <LabelItemsCount count={cartItems.length}>Total</LabelItemsCount>
            <TotalAmount amount={totalToPay} />
          </ContainerInfo>
          <CheckoutFooterButton
            id="checkout-footer-button-home"
            onClick={onContinueToVerifyRFC}
            loading={isLoadingButton}
            blockedMessage={blockedMessage}
          >
            Pagar
          </CheckoutFooterButton>
        </CheckoutFooter>
        <Tour
          run={Boolean(showTour !== null && !showTour?.pay_first_order && showTourFirstLogin && !showChargeBack)}
          stepIndex={totalToPay ? 1 : 0}
          steps={[
            {
              target: `#select-button-${firstOrder?.id}`,
              title: `Selecciona esta orden${hasDueOrders ? ' vencida' : ''}`,
              content: 'Haz click aquí para seleccionar esta orden a pagar.',
              disableBeacon: true,
              spotlightClicks: true,
            },
            {
              target: '#checkout-footer-button-home',
              title: 'Pagar órdenes',
              spotlightClicks: true,
              content: (
                <span>
                  <strong className="font-semibold">Aquí visualiza </strong>tu total a pagar y accióna el botón para
                  continuar con el pago
                </span>
              ),
              disableBeacon: true,
            },
          ]}
          callback={(callback) => changeTour(callback, 'pay_first_order')}
          tooltipComponent={JoyrideTooltip}
        />
      </div>
      <DialogTourToPay
        hasDue={hasDueOrders}
        open={
          !showTourFirstLogin &&
          !!fulfillments?.length &&
          tab === 'subscriptions' &&
          showTour !== null &&
          !showTour?.pay_first_order &&
          !hasPayin
        }
        onSuccess={() => setShowTourFirstLogin(true)}
        onCancel={() => {
          handleShowTour('pay_first_order');
        }}
      />
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

function AdmissionsIcon() {
  return (
    <svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Admissions Icon</title>
      <path
        d="M22.0568 5.22982L14.6828 1.71682C13.0596 0.747262 11.0393 0.730059 9.39979 1.67182L1.94282 5.22982C1.91483 5.24384 1.88582 5.25884 1.85882 5.27482C0.0891931 6.28667 -0.525151 8.5415 0.486693 10.3111C0.829677 10.911 1.33419 11.4026 1.94282 11.7298L3.99983 12.7099V17.6098C4.00105 19.8009 5.42676 21.7367 7.51883 22.3879C8.97472 22.809 10.4843 23.0152 11.9998 22.9999C13.5151 23.0168 15.0247 22.8124 16.4809 22.3929C18.5729 21.7417 19.9986 19.8059 19.9999 17.6149V12.7078L21.9999 11.7518V19.9998C21.9999 20.5521 22.4476 20.9998 22.9999 20.9998C23.5521 20.9998 23.9998 20.5521 23.9998 19.9998V7.99981C24.0065 6.82554 23.0793 5.74076 22.0568 5.22982ZM17.9998 17.6149C18.0003 18.9254 17.15 20.0847 15.8998 20.4778C14.632 20.8401 13.3183 21.0159 11.9998 20.9998C10.6813 21.0159 9.36758 20.8401 8.0998 20.4778C6.8496 20.0847 5.99929 18.9254 5.9998 17.6149V13.6629L9.31682 15.2429C10.1353 15.7289 11.07 15.9843 12.0218 15.9819C12.9278 15.9883 13.8186 15.7484 14.5988 15.2879L17.9998 13.6628V17.6149ZM21.1998 9.92482L13.6578 13.5248C12.6062 14.1372 11.3028 14.1198 10.2678 13.4798L2.8888 9.96982C2.06629 9.52629 1.75907 8.49996 2.2026 7.6775C2.3526 7.39934 2.57751 7.16876 2.85182 7.01182L10.3468 3.43184C11.3987 2.82087 12.7015 2.83817 13.7368 3.47684L21.1108 6.98984C21.6531 7.29096 21.9924 7.85961 21.9998 8.47986C22.0008 9.06739 21.6982 9.61376 21.1998 9.92482Z"
        fill="#374957"
      />
    </svg>
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
          query: {
            ...router.query,
            id: order.subscription.id,
            school: selectedSchoolId,
          },
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
      <div className="mx-auto max-w-md">{page}</div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const schools = session?.user.schools;

  const { guardianHash, tour = null, status = null, tab = 'subscriptions' } = context?.query || { guardianHash: '' };

  if (schools && schools.length > 0 && schools.some((school) => school.status === Status2B3Enum.Onboarding)) {
    return {
      redirect: {
        destination: appendUtmParameters(`/guardians/${guardianHash}/school-unavailable`, context.query),
        permanent: false,
      },
    };
  }

  if (session?.user.onboarding_stage !== 'COMPLETED') {
    return {
      redirect: {
        destination: appendUtmParameters(`/guardians/${guardianHash}/onboarding`, context.query),
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      guardianHash,
      tour,
      status,
      tab,
    },
  };
};
Home.auth = true;
export default Home;
