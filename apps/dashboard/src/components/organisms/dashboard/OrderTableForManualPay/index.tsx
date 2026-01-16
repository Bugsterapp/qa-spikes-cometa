import {
  ProjectEnum,
  TOrderDashboard,
  TOrderDashboardEnriched,
  TOrderOptionalEnriched,
  useOrderSelection,
} from '@cometa/hooks';
import {
  DashboardDependentFulfillment,
  GuardianDependentOrder,
  OptionalOrder,
  RetrieveGuardian,
  StatusDc1Enum,
} from '@cometa/trpc/src/types';
import { SCHOLAR_OFFERINGS, ONLINE_STORE_OFFERINGS } from '/src/constants/offering';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CellContext, Row, createColumnHelper } from '@tanstack/react-table';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import IcAlert from '/public/assets/icons/ic_alert.svg';
import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import CAlert from '/src/components/atoms/CAlert';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { Switch } from '/src/components/atoms/Switch';
import { Tooltip } from '/src/components/atoms/Tooltip';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import { Table } from '/src/components/Table';
import Counter from '/src/components/ui/Counter';
import { Tab, TabList, TabTrigger, Tabs } from '/src/components/ui/Tabs';
import { Events } from '/src/constants/events';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import useDebounce from '/src/hooks/useDebounce';
import useToggle from '/src/hooks/useToggle';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { renderMoney } from '/src/utils/datagridHeaders';
import { formatDateShort, renderStatus } from '/src/utils/general';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { JOYRIDE_KEY, QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';

import CornerTooltip from '../CornerTooltip';
import OptionalOrderDetail from '../OrderOptionalDetail';
import OrderDetailSidepanel from '/src/components/order/OrderDetailSidepanel';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import SelectedOrdersDetail from './SelectedOrdersDetail';

export interface IOrderDetail {
  id: string;
  studentId: string;
  has_partial_payins: boolean;
}

interface OrderTableForManualPayProps {
  selectedStudent: any;
  selectedGuardian: RetrieveGuardian;
  totalToPartialPay: number;
  setTotalToPartialPay: (totalToPartialPay: number) => void;
  handlePartialPaymentSelected: (hasPartialPaymentSelected: boolean) => void;
  partialPayDisabled: boolean;
  setPartialPayDisabled: (disabled: boolean) => void;
  orderDetail: IOrderDetail | null;
  setOrderDetail: (orderDetail: IOrderDetail | null) => void;
}

export default function OrderTableForManualPay({
  selectedStudent,
  selectedGuardian,
  totalToPartialPay,
  setTotalToPartialPay,
  handlePartialPaymentSelected,
  partialPayDisabled,
  setPartialPayDisabled,
  orderDetail,
  setOrderDetail,
}: Readonly<OrderTableForManualPayProps>) {
  const [selectedTab, setSelectedTab] = useState<'subscription' | 'optionals' | 'online-store'>('subscription');
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const queryClient = useQueryClient();
  const selectedSchool = useSelectedSchoolId();
  const { toggle: openToModal, onOpen: onOpenToModal, onClose: onCloseToModal } = useToggle();
  const {
    toggle: openOptionalOrderModal,
    onOpen: onOpenOptionalOrderModal,
    onClose: onCloseOptionalOrderModal,
  } = useToggle();
  const { isEnabled: isOnlineStoreEnabled } = useFlagWithVariableMatching('enable_online_store_in_concepts');

  const { data: joyride } = useQuery({
    queryKey: [JOYRIDE_KEY],
    queryFn: async () => {
      const joyrideQuery = await ApiClient.getMe(selectedSchool);
      return joyrideQuery?.dashboard_joyride?.first_partial_payin ?? null;
    },
  });
  const [isOpen, setIsOpen] = useState(Boolean(!joyride));

  const {
    data: resFulfillments,
    isPending: isLoading,
    refetch: refetchFulfillments,
  } = api.manualPayments.fulfillments.useQuery(
    {
      guardian_id: selectedGuardian?.id,
      school_id: selectedSchool ?? '',
    },
    {
      enabled: Boolean(selectedGuardian?.id) && Boolean(selectedSchool),
    }
  );

  const fulfillments = resFulfillments?.results || [];

  const utils = api.useUtils();

  const fulfillmentFiltered =
    fulfillments && selectedStudent?.id
      ? fulfillments?.filter(
          (row: DashboardDependentFulfillment) =>
            row.student.id === selectedStudent?.id && parseFloat(row.pending_amount) > 0
        )
      : fulfillments.filter((row: DashboardDependentFulfillment) => parseFloat(row.pending_amount) > 0);

  const { data: resOptionalOrders, isPending: isLoadingOptionalOrders } =
    api.manualPayments.guardianOptionalOrders.useQuery(
      {
        guardian_id: selectedGuardian?.id || '',
        multiple_search: searchDebounced || undefined,
        school_id: selectedSchool ?? '',
        page_size: 100,
        offering: [...SCHOLAR_OFFERINGS],
      },
      {
        enabled: Boolean(selectedGuardian?.id) && Boolean(selectedSchool),
      }
    );

  const optionalOrders = resOptionalOrders?.results || [];

  const { data: resOnlineStoreOrders, isPending: isLoadingOnlineStoreOrders } =
    api.manualPayments.schoolOptionalOrders.useQuery(
      {
        school_id: selectedSchool ?? '',
        multiple_search: searchDebounced || undefined,
        page_size: 100,
        offering: [...ONLINE_STORE_OFFERINGS],
      },
      {
        enabled: Boolean(selectedSchool) && isOnlineStoreEnabled,
      }
    );

  const onlineStoreOrders = resOnlineStoreOrders?.results || [];

  const optionalOrdersFiltered =
    optionalOrders && selectedStudent?.id
      ? optionalOrders?.filter(
          (row: GuardianDependentOrder) => row.student.id === selectedStudent?.id && parseFloat(row.final_amount) > 0
        )
      : optionalOrders.filter((row: GuardianDependentOrder) => parseFloat(row.final_amount) > 0);

  const onlineStoreOrdersFiltered = onlineStoreOrders.filter((row: OptionalOrder) => parseFloat(row.final_amount) > 0);

  const invalidateOptionalOrder = async () => {
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
    await utils.manualPayments.guardianOptionalOrders.invalidate();
    await utils.manualPayments.schoolOptionalOrders.invalidate();
    await utils.manualPayments.fulfillments.invalidate();
    await utils.delinquency.getDelinquency.invalidate();
  };

  const {
    totalToPay,
    setSelectedItems,
    isDisabled,
    handleItemSelect,
    selectedItems,
    updateItems,
    getCartItems,
    removeItem,
  } = useOrderSelection(fulfillmentFiltered, ProjectEnum.DASHBOARD);

  const cartItems = getCartItems();

  const hasPartialPaymentSelected = useMemo(
    () => selectedItems.some((fulfillment) => 'has_partial_payins' in fulfillment && fulfillment.has_partial_payins),
    [selectedItems]
  );

  const handleJoyride = () => {
    setIsOpen(false);
  };
  // TODO: to remove this useEffect, need use FormProvider of react-hook-form
  useEffect(() => {
    if (!selectedItems.length) {
      setTotalToPartialPay(0.0);
      setPartialPayDisabled(true);
    } else {
      setPartialPayDisabled(true);
      setTotalToPartialPay(totalToPay);
    }
  }, [selectedItems, totalToPay]);

  const onOpenModal = (item: TOrderDashboard) => {
    sendTrackEventWithUserName(Events.manual_payment_order_detail_opened, {});
    setOrderDetail({
      id: item.order_id,
      studentId: 'student' in item && item.student ? item.student.id : '',
      has_partial_payins: 'has_partial_payins' in item ? item.has_partial_payins : false,
    });
    onOpenToModal();
  };
  const [optionalOrderDetail, setOptionalOrderDetail] = useState<string | undefined>(undefined);
  const onOpenModalOptionalOrder = (item: GuardianDependentOrder | OptionalOrder) => {
    sendTrackEventWithUserName(Events.manual_payment_order_detail_opened, {});
    setOptionalOrderDetail(item.id);
    onOpenOptionalOrderModal();
  };
  const onChangeTotalToPartialPay = (event: ChangeEvent<HTMLInputElement>) => {
    const inputText = event?.target?.value;
    const inputNumber = Number(inputText);
    const parsedTotal = parseFloat(String(totalToPay)).toFixed(2);
    sendTrackEventWithUserName(Events.partial_payment_edited, {});
    if (inputNumber > totalToPay) {
      setTotalToPartialPay(+parsedTotal);
    } else if (inputNumber < 0) {
      setTotalToPartialPay(0);
    } else {
      setTotalToPartialPay(inputNumber);
    }
  };

  const isInProcess = (order: DashboardDependentFulfillment) => order.status === StatusDc1Enum.WAITING_PAID;

  const haveStock = (order: TOrderDashboard) => {
    if ('stock' in order) {
      return !order.stock?.is_limited || (order.stock?.quantity ?? 0) > 0;
    }
    return true;
  };

  useEffect(() => {
    handlePartialPaymentSelected(hasPartialPaymentSelected || !partialPayDisabled);
  }, [hasPartialPaymentSelected, partialPayDisabled]);

  useEffect(() => {
    if (selectedItems.length === 0) return;

    const newSelectedItems = selectedItems
      .map((item) => {
        if ('status' in item) {
          return fulfillmentFiltered.find((it: DashboardDependentFulfillment) => it.id === item.id);
        } else {
          const updatedOptional = optionalOrdersFiltered.find((it: GuardianDependentOrder) => it.id === item.id);
          const updatedOnlineStore = onlineStoreOrdersFiltered.find((it: OptionalOrder) => it.id === item.id);
          return updatedOptional || updatedOnlineStore || item;
        }
      })
      .filter((item) => item !== undefined) as TOrderDashboard[];

    const hasChanges =
      newSelectedItems.length !== selectedItems.length ||
      newSelectedItems.some((newItem) => {
        const oldItem = selectedItems.find((item) => item.id === newItem.id);
        if (!oldItem) return true;
        if ('final_amount' in newItem && 'final_amount' in oldItem) {
          return newItem.final_amount !== oldItem.final_amount;
        }
        if ('pending_amount' in newItem && 'pending_amount' in oldItem) {
          return newItem.pending_amount !== oldItem.pending_amount;
        }
        return false;
      });

    if (hasChanges) {
      setSelectedItems(newSelectedItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfillmentFiltered, optionalOrdersFiltered, onlineStoreOrdersFiltered]);

  interface RowCheckBoxButtonProps {
    row: Row<TOrderDashboard>;
  }

  const RowCheckBoxButton = ({ row }: RowCheckBoxButtonProps) => {
    const disabled = isDisabled(row.original);
    const checked = selectedItems.some((fulfillment) => fulfillment.id === row.original.id);
    const disabledByStock = haveStock(row.original);
    const disabledBySubscription =
      'subscription' in row.original && row.original?.subscription?.payment_has_failed === false;
    return (
      <button
        type="button"
        className="bg-transparent rounded-md border-none hover:bg-gray-200"
        disabled={disabled}
        onClick={(event) => {
          if (!checked) sendTrackEventWithUserName(Events.manual_payment_orders_selected, {});
          event.stopPropagation();
          handleItemSelect(row.original);
          if (checked) removeItem(row.original);
        }}
      >
        <Tooltip
          message={
            disabledBySubscription
              ? 'No puedes seleccionar esta orden porque será cobrada de manera automática al ser una domiciliación.'
              : 'No puedes seleccionar esta orden porque no tiene stock disponible.'
          }
          disableHover={!disabledBySubscription && disabledByStock}
        >
          <input
            key={row.id}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            readOnly
            className={cn(
              'w-[18px] h-[18px] rounded cursor-pointer appearance-none border-2 transition-all duration-200',
              'checked:bg-[#00AB55] checked:border-[#00AB55] checked:hover:bg-[#00AB55] checked:hover:border-[#00AB55]',
              'focus:outline-none focus:ring-2 focus:ring-[#00AB55] focus:ring-opacity-50',
              'disabled:cursor-not-allowed disabled:opacity-40',
              'relative',
              {
                'border-[#919eab]': !checked && !disabled,
                'hover:border-[#919eab]': !checked && !disabled,
              }
            )}
          />
        </Tooltip>
      </button>
    );
  };

  const columnHelper = createColumnHelper<DashboardDependentFulfillment>();

  const handleRefreshOrderEdition = async () => {
    const { data: latest } = await refetchFulfillments();
    const newSelectedItems = selectedItems
      .map((item) => {
        if ('status' in item) {
          const newItem = latest?.results?.find((it: DashboardDependentFulfillment) => it.id === item.id);
          return newItem;
        }
        return item;
      })
      .filter((item) => item !== undefined) as TOrderDashboard[];
    if (newSelectedItems.length > 0) {
      setSelectedItems(newSelectedItems);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'selection',
        cell: ({ row }: CellContext<TOrderDashboardEnriched, string>) => <RowCheckBoxButton row={row} />,
      },
      columnHelper.accessor('name', {
        cell: (info) => (
          <OrderNameWithParcial name={info.row.original.name} isParcial={info.row.original.has_partial_payins} />
        ),
        header: () => <span className="-ml-6 w-[280px]">Orden</span>,
        size: 150,
      }),
      columnHelper.accessor('student', {
        cell: (info) => (
          <span>
            {info.row.original.student?.first_name || ''} {info.row.original.student?.last_name || ''}
          </span>
        ),
        header: () => <span>Estudiante</span>,
        size: 120,
      }),
      columnHelper.accessor('due', {
        cell: (info) => {
          const isPaid = info.row.original.status === StatusDc1Enum.PAID;
          const todayDateFormat = new Date().toISOString().split('T')[0];
          const isPastDate = info.row.original.due < todayDateFormat;
          const isDue = info.row.original.is_due;
          return (
            <div
              className={cn('flex flex-row text-center items-center gap-x-1.5', {
                'text-error': (!isPaid && isPastDate) || isDue,
              })}
            >
              <span>{formatDateShort(info.row.original.due)}</span>
              {(!isPaid && isPastDate && <IcAlert />) || (isDue && <IcAlert />)}
            </div>
          );
        },
        header: () => <span className="whitespace-nowrap">Fecha Vcto.</span>,
        size: 250,
      }),
      columnHelper.accessor('status', {
        cell: (info) => renderStatus(isInProcess(info.row.original)),
        header: () => <span>Estado</span>,
        size: 100,
      }),
      columnHelper.accessor('pending_amount', {
        cell: (info) => renderMoney(info.row.original.pending_amount),
        header: () => <span>Por Pagar</span>,
        meta: {
          numeric: true,
        },
      }),
      columnHelper.accessor('total_charge', {
        cell: (info) => renderMoney(info.row.original.total_charge),
        header: () => <span>Recargos</span>,
        meta: {
          numeric: true,
        },
      }),
      columnHelper.accessor('discount', {
        cell: (info) => renderMoney(info.row.original.discount),
        header: () => <span>Descuentos</span>,
        meta: {
          numeric: true,
        },
      }),
      columnHelper.accessor('id', {
        cell: () => <IcArrowRight />,
        header: () => null,
        size: 250,
      }),
    ],
    [selectedItems]
  );
  const columnHelperOptional = createColumnHelper<GuardianDependentOrder | OptionalOrder>();

  const columnsOptional = useMemo(
    () => [
      {
        id: 'selection',
        cell: ({ row }: CellContext<TOrderOptionalEnriched, string>) => <RowCheckBoxButton row={row} />,
      },
      columnHelperOptional.accessor('name', {
        cell: (info) => <OrderNameWithParcial name={info.row.original.name} />,
        header: () => <span className="-ml-6 w-[280px]">Orden</span>,
        size: 150,
      }),
      columnHelperOptional.accessor('student', {
        cell: (info) => {
          if ('student' in info.row.original && info.row.original.student) {
            return (
              <span>
                {info.row.original.student.first_name ?? ''} {info.row.original.student.last_name ?? ''}
              </span>
            );
          }
          return <span>-</span>;
        },
        header: () => <span>Estudiante</span>,
        size: 120,
      }),
      // //@ts-ignore
      // columnHelperOptional.accessor('discount_breakdown', {
      //   cell: (info) => renderMoney(info.row.original.discount_breakdown.total),
      //   header: () => <span>Dctos & Becas</span>,
      //   meta: {
      //     numeric: true,
      //   },
      //   size: 250,
      // }),
      columnHelperOptional.accessor('final_amount', {
        cell: (info) => renderMoney(info.row.original.final_amount),
        header: () => <span>Precio Uni.</span>,
        meta: {
          numeric: true,
        },
        size: 250,
      }),
      columnHelperOptional.accessor('stock', {
        cell: (info) => (!info.row.original.stock?.is_limited ? 'Ilimitado' : info.row.original?.stock?.quantity),
        header: () => <span>Stock</span>,
        meta: {
          numeric: true,
        },
        size: 250,
      }),
      columnHelperOptional.accessor('order_id', {
        cell: (info) => {
          const stockLimit = info.row.original.stock?.is_limited ? info.row.original.stock?.quantity : 999;
          const isSelected = Boolean(
            selectedItems.find((item) => {
              if ('student' in info.row.original && info.row.original.student) {
                return (
                  item.order_id === info.row.original.order_id &&
                  'student' in item &&
                  item.student.id === info.row.original.student.id
                );
              }
              return item.order_id === info.row.original.order_id;
            })
          );
          const itemQuantity = cartItems.filter((item) => {
            if ('student' in info.row.original && info.row.original.student) {
              return item.order === info.row.original.order_id && item.student === info.row.original.student.id;
            }
            return item.order === info.row.original.order_id && item.student === null;
          }).length;
          return (
            <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <Counter
                key={info.row.original.id}
                maxValue={stockLimit}
                initialValue={itemQuantity}
                minValue={isSelected ? 1 : 0}
                disabled={!isSelected}
                onChange={(val: number) => updateItems(info.row.original as TOrderOptionalEnriched, val)}
              />
            </div>
          );
        },
        header: () => <span>Cantidad</span>,
        size: 250,
      }),
      columnHelperOptional.accessor('id', {
        cell: () => <IcArrowRight />,
        header: () => null,
        size: 250,
      }),
    ],
    [selectedItems, cartItems]
  );

  const [sliderStyles, setSliderStyles] = useState<React.CSSProperties>({
    width: 0,
    transform: 'translate(0px)',
  });

  function calculateStyles() {
    const element =
      typeof window !== 'undefined' ? (document?.querySelector("button[data-state='active']") as HTMLElement) : null;

    setSliderStyles({
      width: `${element?.clientWidth ?? 0}px`,
      transform: `translate(calc(${element?.offsetLeft ?? 0}px - 3rem))`,
    });
  }

  useEffect(() => {
    calculateStyles();
    window.addEventListener('resize', calculateStyles);

    return () => window.removeEventListener('resize', calculateStyles);
  }, [selectedTab]);

  const countFulfillmentSelected = selectedItems.filter((item) => 'status' in item).length;

  const countOptionalSelected = selectedItems.filter((item) => {
    if ('status' in item) return false;
    const isOptionalOrder = optionalOrders.some((order: GuardianDependentOrder) => order.id === item.id);
    return isOptionalOrder;
  }).length;

  const countOnlineStoreSelected = selectedItems.filter((item) => {
    if ('status' in item) return false;
    const isOnlineStoreOrder = onlineStoreOrders.some((order: OptionalOrder) => order.id === item.id);
    return isOnlineStoreOrder;
  }).length;

  const shouldShowPartialPaymentOptions = useMemo(
    () => selectedItems.length === 1 && !countOptionalSelected && !countOnlineStoreSelected,
    [selectedItems.length, countOptionalSelected, countOnlineStoreSelected]
  );

  return (
    <>
      <>
        <Tabs
          asChild
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as 'subscription' | 'optionals' | 'online-store')}
        >
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              boxShadow: '0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.20)',
            }}
          >
            <TabList>
              <TabTrigger value="subscription">
                <div className="flex gap-2 items-center">
                  Conceptos escolares
                  {countFulfillmentSelected ? <SelectionCount count={countFulfillmentSelected} /> : null}
                </div>
              </TabTrigger>
              <TabTrigger value="optionals">
                <div className="flex gap-2 items-center" data-testid="optionalConcepts-tabOption">
                  Conceptos opcionales
                  {countOptionalSelected ? <SelectionCount count={countOptionalSelected} /> : null}
                </div>
              </TabTrigger>
              {isOnlineStoreEnabled && (
                <TabTrigger value="online-store">
                  <div className="flex gap-2 items-center">
                    Tienda online
                    {countOnlineStoreSelected ? <SelectionCount count={countOnlineStoreSelected} /> : null}
                  </div>
                </TabTrigger>
              )}
              <span
                className="absolute bottom-0 block h-1 bg-[#00AB55] transition-all duration-200 rounded-t-2xl"
                style={sliderStyles}
              />
            </TabList>
            <Tab value="subscription">
              <div className={`${isLoading ? 'opacity-50 cursor-wait' : 'transition-opacity duration-300'}`}>
                <Table
                  key={fulfillmentFiltered?.length}
                  // @ts-ignore fix types
                  columns={columns}
                  // @ts-ignore fix types
                  onRowClick={onOpenModal}
                  data={fulfillmentFiltered}
                  hideFooter
                  totalCount={fulfillmentFiltered?.length || 0}
                  isLoading={isLoading}
                  hideSum
                />
              </div>
            </Tab>
            <Tab value="optionals">
              <div className="flex gap-4 items-center px-11 py-6">
                <GlobalSearch placeholder="Buscar" search={search} setSearch={setSearch} typeButton="button" />
                <CAlert
                  type="info"
                  message="No se pueden realizar pagos parciales en esta sección"
                  className="bg-[#F4F6F8] italic text-[#212B36]"
                />
              </div>
              <div className="overflow-x-auto">
                <Table
                  key={optionalOrdersFiltered?.length}
                  // @ts-ignore fix types
                  columns={columnsOptional}
                  // @ts-ignore TODO: fix types
                  onRowClick={onOpenModalOptionalOrder}
                  data={optionalOrdersFiltered}
                  hideFooter
                  totalCount={optionalOrdersFiltered?.length || 0}
                  isLoading={isLoadingOptionalOrders}
                  className="w-full"
                  hideSum
                />
              </div>
            </Tab>
            {isOnlineStoreEnabled && (
              <Tab value="online-store">
                <div className="flex gap-4 items-center px-11 py-6">
                  <GlobalSearch placeholder="Buscar" search={search} setSearch={setSearch} typeButton="button" />
                  <CAlert
                    type="info"
                    message="No se pueden realizar pagos parciales en esta sección"
                    className="bg-[#F4F6F8] italic text-[#212B36]"
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table
                    key={onlineStoreOrdersFiltered?.length}
                    // @ts-ignore fix types
                    columns={columnsOptional}
                    // @ts-ignore TODO: fix types
                    onRowClick={onOpenModalOptionalOrder}
                    data={onlineStoreOrdersFiltered}
                    hideFooter
                    totalCount={onlineStoreOrdersFiltered?.length || 0}
                    isLoading={isLoadingOnlineStoreOrders}
                    className="w-full"
                    hideSum
                  />
                </div>
              </Tab>
            )}
          </div>
        </Tabs>
        <OptionalOrderDetail
          open={openOptionalOrderModal}
          onClose={onCloseOptionalOrderModal}
          orderOptional={
            optionalOrders.find((ord: GuardianDependentOrder) => ord.id === optionalOrderDetail) ||
            onlineStoreOrders.find((ord: OptionalOrder) => ord.id === optionalOrderDetail)
          }
          invalidate={invalidateOptionalOrder}
          isLoading={isLoadingOptionalOrders || isLoadingOnlineStoreOrders}
        />

        {orderDetail?.id && (
          <OrderDetailSidepanel
            open={openToModal}
            onClose={async () => {
              await handleRefreshOrderEdition();
              onCloseToModal();
              setOrderDetail(null);
            }}
            orderId={orderDetail.id}
            studentId={orderDetail.studentId}
            typeOfOrder="DUE"
          />
        )}
      </>
      {!!selectedItems.length && (
        <>
          <SelectedOrdersDetail
            selectedItems={selectedItems}
            cartItems={cartItems}
            totalToPay={totalToPay}
            onUpdateQuantity={updateItems}
            onRemoveItem={(item) => {
              handleItemSelect(item);
              removeItem(item);
            }}
            countFulfillmentSelected={countFulfillmentSelected}
            countOptionalSelected={countOptionalSelected}
            countOnlineStoreSelected={countOnlineStoreSelected}
          />
          {shouldShowPartialPaymentOptions && (
            <div className="flex relative items-center mt-4">
              <Tooltip
                message="Esta orden ya tiene un pago parcial previo. Por lo tanto, lo pendiente a pagar será registrado también como “Pago Parcial”"
                theme="white"
                disableHover={!hasPartialPaymentSelected}
              >
                <SwitchWithLabel
                  id="partial-pay"
                  label="Pago parcial"
                  disabled={hasPartialPaymentSelected}
                  checked={!partialPayDisabled || hasPartialPaymentSelected}
                  onCheckedChange={() => {
                    if (hasPartialPaymentSelected) return;
                    setPartialPayDisabled(!partialPayDisabled);
                  }}
                />
              </Tooltip>
              {!partialPayDisabled && !joyride && (
                <CornerTooltip
                  isOpen={isOpen}
                  title="Activaste la opción de Pago Parcial"
                  body="Esta opción es para los que van a pagar en partes. Si lo que deseas es perdonar un recargo o dar un descuento, lo puedes hacer desde el detalle de la orden, dándole clic a la orden misma."
                  actionText="Entendido"
                  actionMethod={handleJoyride}
                  corner="bl"
                  placement="bottom-[70px] left-[120px]"
                />
              )}
              <div className="ml-3">
                <TextField LeftIcon="$" label="Monto a pagar" value={totalToPartialPay}>
                  <CustomInput
                    onChange={onChangeTotalToPartialPay}
                    value={totalToPartialPay}
                    disabled={partialPayDisabled && !hasPartialPaymentSelected}
                    type="number"
                    defaultValue={totalToPartialPay}
                  />
                </TextField>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

const SelectionCount = ({ count }: { count: string | number }) => (
  <Tooltip message="Cantidad de órdenes seleccionadas">
    <span className="bg-[#00AB55] text-white font-bold p-1 rounded-full text-xs min-w-[16px] h-4 block leading-[8px] -mt-2">
      {count}
    </span>
  </Tooltip>
);

const SwitchWithLabel = ({
  id,
  onCheckedChange,
  checked,
  label,
  disabled,
}: {
  id: string;
  onCheckedChange: (checked: boolean) => void;
  checked: boolean;
  label: string;
  disabled?: boolean;
}) => (
  <div className="flex items-center">
    <label htmlFor={id} className="ml-3 text-sm font-semibold whitespace-nowrap text-[#637381] mx-2 cursor-pointer">
      {label}
    </label>
    <Switch id={id} onCheckedChange={onCheckedChange} checked={checked} disabled={disabled} />
  </div>
);
