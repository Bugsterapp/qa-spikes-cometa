import { ProjectEnum } from '@cometa/hooks';
import { OfferingEnum, type OptionalOrder } from '@cometa/trpc/src/types';
import { cn } from '@cometa/utils';
import { keepPreviousData } from '@tanstack/react-query';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import ResponsivePagination from 'react-responsive-pagination';
import CheckoutFooter, {
  CheckoutFooterButton,
  ContainerInfo,
  LabelItemsCount,
  TotalAmount,
} from '~/components/CheckoutFooter';
import * as OrderCard from '~/components/OrderCard';
import OrderList from '~/components/OrderList';
import ChipFilter from '~/components/Orders/ChipFilter';
import { StockErrorAlert } from '~/components/StockErrorAlert';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { TrackEvents } from '~/constants/events';
import { useSendEvent } from '~/hooks/useSendEvent';
import Chevron from '~/public/icons/ic_arrow_right.svg';
import useCheckoutStore from '~/stores/checkoutStore';
import { useSelectedSchool } from '~/stores/globalStore';
import { useOrderSelection, useSelectionStore } from '~/stores/selectionStorePersisted';
import { api } from '~/utils/api';
import { PAGE_SIZE } from '~/utils/constants';
import { extractConceptTypesFromOrders, typeOfOrdersInStore } from '~/utils/orders';
import { useStock } from '~/utils/stocks';
import BlockedPaymentsBanner, {
  BannerType,
  getBannerInfo,
  getBlockedPaymentsMessage,
} from '~/components/BlockedPaymentsBanner';

const OnlineStorePage = () => {
  const _router = useRouter();
  const searchParams = useSearchParams();
  const { guardianHash } = _router.query;
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();

  const page = Number(searchParams?.get('page')) || 1;
  const search = searchParams?.get('search') || '';
  const category = searchParams?.get('category') || 'all';

  const { selectedItems, itemQuantities, clear, totalToPay, setItemQuantities } =
    useSelectionStore<ProjectEnum.ONLINE_STORE>();
  const { handleItemSelect, updateItems, isDisabled } = useOrderSelection([], ProjectEnum.ONLINE_STORE);
  const [stockError, setStockError] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  const schoolId = selectedSchool?.id ?? session?.user?.schools?.[0]?.id ?? '';

  const { validateStock } = useStock(schoolId);
  const { optional, mandatory } = typeOfOrdersInStore(selectedItems);
  const { data: blockedPeriodData } = api.checkout.checkBlockedPeriods.useQuery(
    { schoolId },
    { enabled: Boolean(schoolId) }
  );

  const bannerInfo = getBannerInfo(blockedPeriodData);

  const blockedMessage =
    blockedPeriodData?.is_blocked && blockedPeriodData.start_date && blockedPeriodData.end_date
      ? getBlockedPaymentsMessage(blockedPeriodData.start_date, blockedPeriodData.end_date, BannerType.Active)
      : undefined;
  const sendTrackEvent = useSendEvent();
  const [setCheckoutData] = useCheckoutStore((state) => [state.setCheckoutData]);

  const updateSearchParams = (updates: Record<string, string | number>) => {
    _router.push({ query: { ..._router.query, ...updates } }, undefined, {
      shallow: true,
    });
  };

  const setSearch = (newSearch: string) => {
    updateSearchParams({ search: newSearch, page: 1 });
  };

  const setCategory = (newCategory: string) => {
    updateSearchParams({ category: newCategory, page: 1 });
  };

  const setPage = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  const { data: optionalOrdersQuery, isLoading } = api.orders.getOnlineStore.useQuery(
    {
      schoolId: schoolId || '',
      multiple_search: search,
      page,
      page_size: PAGE_SIZE,
      offering: [OfferingEnum.OPEN_LOOP, OfferingEnum.MIX],
    },
    {
      placeholderData: keepPreviousData,
      enabled: !!schoolId,
    }
  );

  useEffect(() => {
    if (selectedItems.length) {
      clear();
      setItemQuantities([]);
    }
  }, []);

  const optionalOrders = useMemo(() => optionalOrdersQuery?.results || [], [optionalOrdersQuery?.results]);
  const totalPages = Math.ceil((optionalOrdersQuery?.count || 0) / PAGE_SIZE);

  const categories = useMemo(
    () => [{ value: 'all', displayValue: 'Todos' }, ...extractConceptTypesFromOrders(optionalOrders)],
    [optionalOrders]
  );

  const filteredOrders = useMemo(() => {
    if (category === 'all') return optionalOrders;
    return optionalOrders.filter((order) => order.concept.type === category);
  }, [optionalOrders, category]);

  const goBack = () => _router.push(`/guardians/${guardianHash}`);

  const onChangeOptionalOrder = (order: OptionalOrder, counter = 1) => {
    const orderNotYetSelected = !selectedItems.find((item) => item.id === order.id) && counter > 0;
    const orderSelectedForRemoval = selectedItems.find((item) => item.id === order.id) && counter === 0;
    if (orderNotYetSelected || orderSelectedForRemoval) {
      handleItemSelect(order);
    }
    updateItems(order, counter);
  };

  const onContinueToVerifyRFC = async () => {
    setIsLoadingButton(true);
    const notHaveStock = await validateStock(itemQuantities);

    sendTrackEvent(TrackEvents.checkout.cartOpened, {
      mandatory,
      optional,
    });

    if (notHaveStock) {
      setStockError(true);
    } else {
      setStockError(false);
      setIsLoadingButton(true);
      setCheckoutData(totalToPay, 'MXN', selectedItems.length);
      _router.push(`/guardians/${guardianHash}/payments/summary`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-5 px-4 bg-[#F6F5FA] flex items-center gap-4 border-b border-[#E3E0FF] border-solid">
        <button className="flex justify-center items-center p-3 w-11 bg-white rounded-full" onClick={goBack}>
          <Chevron className="rotate-180 text-[#4A5CFF] w-3" />
        </button>
        <h2 className="text-[#283877] font-semibold text-lg">Tienda en línea</h2>
      </header>
      <main className={cn('flex-1 px-4 pb-6', { 'pb-36': !!totalToPay })}>
        <div className="mt-6 mb-2">
          {bannerInfo.show && bannerInfo.type && bannerInfo.startDate && bannerInfo.endDate && (
            <div className="mb-6 -mx-4">
              <BlockedPaymentsBanner
                startDate={bannerInfo.startDate}
                endDate={bannerInfo.endDate}
                type={bannerInfo.type}
              />
            </div>
          )}
          <h1 className="mb-2 text-2xl font-bold text-blue-800">Bienvenido a la tienda en línea</h1>
          <p className="text-[#57537A] text-base mb-4">
            Aquí podrás encontrar todos los productos y servicios que tenemos para ti.
          </p>
          <div className="flex gap-2 mb-4">
            <ChipFilter options={categories} value={category} onChange={setCategory} className="w-full" />
          </div>
          <div className="border-[#A2ABB9] border rounded-lg flex items-center px-4 py-3 w-full mb-4 gap-3">
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
            <input
              className="flex-1 bg-transparent outline-none placeholder:text-[#B4B8C6] placeholder:font-light"
              placeholder="Nombre del concepto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-[#57537A] text-sm mb-4">{filteredOrders.length} artículos disponibles</div>
        </div>
        <OrderList loading={isLoading}>
          {filteredOrders.map((order) => {
            const selected = selectedItems.some((item) => item.id === order.id);
            return (
              <OrderCard.Root
                key={order.id}
                status={order.acquired ? 'acquired' : 'valid'}
                selected={selected}
                isOptional
                onSelectChange={(selected) => onChangeOptionalOrder(order, selected ? 1 : 0)}
                disabled={isDisabled(order)}
              >
                <OrderCard.Content>
                  <OrderCard.Info>
                    <OrderCard.OrderInfo title={order.name} />
                    {order.concept.payment_only_in_dashboard && (
                      <div className="mt-3 text-[#F46F6F] text-sm">
                        Este item debe ser pagado directamente con el colegio.
                      </div>
                    )}
                  </OrderCard.Info>
                  <OrderCard.PayFooter
                    testId={`card-footer-${order.name}`}
                    amount={order.final_amount}
                    pending={false}
                    needStock={'stock' in order}
                    hideButton={order.concept.payment_only_in_dashboard}
                    isOutOfStock={order.stock?.is_limited && (order.stock?.quantity ?? 0) === 0}
                    quantity={itemQuantities.find((itemQuantity) => itemQuantity.order_id === order.id)?.counter ?? 0}
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
          nextLabel={<span>&gt;</span>}
          previousLabel={<span>&lt;</span>}
          total={totalPages}
          current={page}
          onPageChange={setPage}
        />
        <StockErrorAlert
          stockError={stockError}
          setStockError={setStockError}
          resetSelection={() => {
            clear();
            setItemQuantities([]);
          }}
          setIsLoadingButton={setIsLoadingButton}
        />
        <CheckoutFooter open={!!selectedItems.length}>
          <ContainerInfo>
            <LabelItemsCount count={selectedItems.length}>TOTAL</LabelItemsCount>
            <TotalAmount amount={totalToPay} />
          </ContainerInfo>
          <CheckoutFooterButton
            id="checkout-footer-button-online-store"
            onClick={onContinueToVerifyRFC}
            loading={isLoadingButton}
            blockedMessage={blockedMessage}
            disabled={!selectedItems.length}
          >
            Continuar
          </CheckoutFooterButton>
        </CheckoutFooter>
      </main>
    </div>
  );
};

OnlineStorePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <div className="bg-[#F6F5FA]">
      <Head>
        <title>Tienda en línea</title>
      </Head>
      <div className="mx-auto max-w-md">{page}</div>
    </div>
  );
};

OnlineStorePage.auth = true;

export default OnlineStorePage;
