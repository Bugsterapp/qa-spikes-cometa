import { Checkbox } from '@mui/material';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { renderMoney } from '../../../../utils/datagridHeaders';
import useToggle from '../../../../hooks/useToggle';
import ApiClient from '../../../../services/ApiClient';
import { useSession } from 'next-auth/react';
import { formatDateShort, formatPrice, renderStatus } from '../../../../utils/general';
import { sendTrackEvent } from '../../../../utils/events';
import { Events } from '/src/constants/events';
import CornerTooltip from '../CornerTooltip';
import { useQuery } from '@tanstack/react-query';
import { JOYRIDE_KEY } from '/src/utils/reactQueryKeys';
import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import { Tooltip } from '../../../atoms/Tooltip';
import { Switch } from '../../../atoms/Switch';
import { Table } from '/src/components/Table';
import { CellContext, Row, createColumnHelper } from '@tanstack/react-table';
import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import IcAlert from '/public/assets/icons/ic_alert.svg';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { create } from 'zustand';
import ManualPayDetail from '../ManualPayPartial';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import FulfillmentDetail from '../FulfillmentDetail';
import {
  DashboardDependentFulfillment,
  GuardianDependentOrder,
  RetrieveGuardian,
  StatusDc1Enum,
} from '@cometa/trpc/src/types';
import { ProjectEnum, useFulfillmentSelection } from '@cometa/hooks';
import { Tab, TabList, TabTrigger, Tabs } from '/src/components/atoms/Tabs';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import CAlert from '/src/components/atoms/CAlert';
import useDebounce from '/src/hooks/useDebounce';
import OptionalOrderDetail from '../OrderOptionalDetail';
import { useFlags } from '/flags/client';

export interface IOrderDetail {
  id: string;
  studentId: string;
  has_partial_payins: boolean;
}

interface PayState {
  orderDetail: IOrderDetail;
  partialPayDisabled: boolean;
}

interface PayStore extends PayState {
  setState: (state: Partial<PayState>) => void;
  setOrderDetail: (orderDetail: IOrderDetail) => void;
  setPartialPayDisabled: (partialPayDisabled: boolean) => void;
}

const InitialPayState: PayState = {
  orderDetail: { id: '', studentId: '', has_partial_payins: false },
  partialPayDisabled: false,
};

export const usePayStore = create<PayStore>((set) => ({
  ...InitialPayState,
  setState: (state) => set(state),
  setOrderDetail: (state) => set({ orderDetail: state }),
  setPartialPayDisabled: (state) => set({ partialPayDisabled: state }),
}));
const useSetPartialPayDisabled = () => usePayStore((state) => state.setPartialPayDisabled);
const useSetOrderDetail = () => usePayStore((state) => state.setOrderDetail);

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

interface OrderTableForManualPayProps {
  selectedStudent: any;
  selectedGuardian: RetrieveGuardian;
  totalToPartialPay: number;
  setTotalToPartialPay: (totalToPartialPay: number) => void;
  handlePartialPaymentSelected: (hasPartialPaymentSelected: boolean) => void;
}

export default function OrderTableForManualPay({
  selectedStudent,
  selectedGuardian,
  totalToPartialPay,
  setTotalToPartialPay,
  handlePartialPaymentSelected,
}: OrderTableForManualPayProps) {
  const [selectedTab, setSelectedTab] = useState<'subscription' | 'optionals'>('subscription');
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);

  const setPartialPayDisabled = useSetPartialPayDisabled();
  const setOrderDetail = useSetOrderDetail();

  const { partialPayDisabled, orderDetail } = usePayStore();

  const { data: session } = useSession();
  const selectedSchool = useSelectedSchoolId();
  const { toggle: openToModal, onOpen: onOpenToModal, onClose: onCloseToModal } = useToggle();
  const {
    toggle: openOptionalOrderModal,
    onOpen: onOpenOptionalOrderModal,
    onClose: onCloseOptionalOrderModal,
  } = useToggle();
  const [selectedOrderModal, setSelectedOrderModal] = useState<string | undefined>('DUE');
  const flags = useFlags({ traits: { email: session?.user.email, school_id: selectedSchool } }).flags;
  const isConceptActive = flags?.optionals_payment ?? false;

  const joyrideQuery = async () => {
    const joyrideQuery = await ApiClient.getMe(session?.token, selectedSchool);
    return joyrideQuery?.data?.dashboard_joyride?.first_partial_payin ?? null;
  };

  const { data: joyride } = useQuery([JOYRIDE_KEY], joyrideQuery);
  const [isOpen, setIsOpen] = useState(Boolean(!joyride));

  const { data: resFulfillments, isLoading } = api.manualPayments.fulfillments.useQuery(
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
      ? fulfillments?.filter((row) => row.student.id === selectedStudent?.id && parseFloat(row.pending_amount) > 0)
      : fulfillments.filter((row) => parseFloat(row.pending_amount) > 0);

  const { data: resOptionalOrders, isLoading: isLoadingOptionalOrders } = api.manualPayments.optionalOrders.useQuery(
    {
      guardian_id: selectedGuardian?.id || '',
      multiple_search: searchDebounced || undefined,
      school_id: selectedSchool || '',
      page_size: 100,
    },
    {
      enabled: Boolean(selectedGuardian?.id) && Boolean(selectedSchool),
    }
  );

  const optionalOrders = resOptionalOrders?.results || [];

  const optionalOrdersFiltered =
    optionalOrders && selectedStudent?.id
      ? optionalOrders?.filter(
          (row: { student: { id: any }; final_amount: string }) =>
            row.student.id === selectedStudent?.id && parseFloat(row.final_amount) > 0
        )
      : optionalOrders.filter((row: { final_amount: string }) => parseFloat(row.final_amount) > 0);

  const invalidateOptionalOrder = () => utils.manualPayments.optionalOrders.invalidate();

  const { totalToPay, isDisabled, handleItemSelect, selectedItems } = useFulfillmentSelection(
    fulfillmentFiltered,
    ProjectEnum.DASHBOARD
  );

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
  }, [selectedItems]);

  const onOpenModal = (item: DashboardDependentFulfillment | GuardianDependentOrder) => {
    sendTrackEvent('dashboard: Manual Payment Order Detail Opened', {});
    setOrderDetail({
      id: item.order_id,
      studentId: item.student.id,
      has_partial_payins: 'has_partial_payins' in item ? item.has_partial_payins : false,
    });
    onOpenToModal();
  };
  const [optionalOrderDetail, setOptionalOrderDetail] = useState<string | undefined>(undefined);
  const onOpenModalOptionalOrder = (item: GuardianDependentOrder) => {
    sendTrackEvent('dashboard: Manual Payment Order Detail Opened', {});
    setOptionalOrderDetail(item.id);
    onOpenOptionalOrderModal();
  };
  const onChangeTotalToPartialPay = (event: ChangeEvent<HTMLInputElement>) => {
    const inputText = event?.target?.value;
    const inputNumber = Number(inputText);
    const parsedTotal = parseFloat(String(totalToPay)).toFixed(2);
    sendTrackEvent(Events.partial_payment_edit, {});
    if (inputNumber > totalToPay) {
      setTotalToPartialPay(+parsedTotal);
    } else if (inputNumber < 0) {
      setTotalToPartialPay(0);
    } else {
      setTotalToPartialPay(inputNumber);
    }
  };

  const isInProcess = (order: DashboardDependentFulfillment) => order.status === StatusDc1Enum.WAITING_PAID;

  const onSwitchSidePanel = (order?: string) => {
    setSelectedOrderModal(order);
  };

  const haveStock = (order: GuardianDependentOrder | DashboardDependentFulfillment) => {
    if ('stock' in order) {
      return !order.stock?.is_limited || (order.stock?.quantity ?? 0) > 0;
    }
    return true;
  };

  useEffect(() => {
    handlePartialPaymentSelected(hasPartialPaymentSelected || !partialPayDisabled);
  }, [hasPartialPaymentSelected, partialPayDisabled]);

  interface RowCheckBoxButtonProps {
    row: Row<DashboardDependentFulfillment | GuardianDependentOrder>;
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
        className="bg-transparent border-none rounded-md hover:bg-gray-200"
        disabled={disabled}
        onClick={(event) => {
          if (!checked) sendTrackEvent('dashboard: Manual Payment Orders Selected', {});
          event.stopPropagation();
          handleItemSelect(row.original);
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
          <Checkbox key={row.id} disabled={disabled} checked={checked} disableRipple />
        </Tooltip>
      </button>
    );
  };

  const columnHelper = createColumnHelper<DashboardDependentFulfillment>();

  const columns = useMemo(
    () => [
      {
        id: 'selection',
        cell: ({ row }: CellContext<DashboardDependentFulfillment, string>) => <RowCheckBoxButton row={row} />,
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
  const columnHelperOptional = createColumnHelper<GuardianDependentOrder>();

  const columnsOptional = useMemo(
    () => [
      {
        id: 'selection',
        cell: ({ row }: CellContext<GuardianDependentOrder, string>) => <RowCheckBoxButton row={row} />,
      },
      columnHelperOptional.accessor('name', {
        cell: (info) => <OrderNameWithParcial name={info.row.original.name} />,
        header: () => <span className="-ml-6 w-[280px]">Orden</span>,
        size: 150,
      }),
      columnHelperOptional.accessor('student', {
        cell: (info) => (
          <span>
            {info.row.original.student?.first_name || ''} {info.row.original.student?.last_name || ''}
          </span>
        ),
        header: () => <span>Estudiante</span>,
        size: 120,
      }),
      columnHelperOptional.accessor('discount_breakdown', {
        cell: (info) => renderMoney(info.row.original.discount_breakdown.total),
        header: () => <span>Dctos & Becas</span>,
        meta: {
          numeric: true,
        },
        size: 250,
      }),
      columnHelperOptional.accessor('final_amount', {
        cell: (info) => renderMoney(info.row.original.final_amount),
        header: () => <span>Por Pagar</span>,
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
      columnHelperOptional.accessor('id', {
        cell: () => <IcArrowRight />,
        header: () => null,
        size: 250,
      }),
    ],
    [selectedItems]
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
  const countOptionalSelected = selectedItems.filter((item) => !('status' in item)).length;
  return (
    <>
      <>
        <Tabs
          asChild
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as 'subscription' | 'optionals')}
        >
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              boxShadow: '0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.20)',
            }}
          >
            <TabList>
              <TabTrigger value="subscription">
                <div className="flex items-center gap-2">
                  Conceptos escolares
                  {countFulfillmentSelected ? <SelectionCount count={countFulfillmentSelected} /> : null}
                </div>
              </TabTrigger>
              {isConceptActive ? (
                <TabTrigger value="optionals">
                  <div className="flex items-center gap-2" data-testid="optionalConcepts-tabOption">
                    Conceptos opcionales
                    {countOptionalSelected ? <SelectionCount count={countOptionalSelected} /> : null}
                  </div>
                </TabTrigger>
              ) : null}
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
              <div className="flex items-center gap-4 py-6 px-11">
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
          </div>
        </Tabs>
        <OptionalOrderDetail
          open={openOptionalOrderModal}
          onClose={onCloseOptionalOrderModal}
          orderOptional={optionalOrders.find((ord) => ord.id === optionalOrderDetail)}
          invalidate={invalidateOptionalOrder}
          isLoading={isLoadingOptionalOrders}
        />
        {selectedOrderModal === 'DUE' ? (
          <ManualPayDetail
            open={openToModal}
            onSwithSidepanel={onSwitchSidePanel}
            onClose={onCloseToModal}
            orderId={orderDetail.id}
            studentId={orderDetail.studentId}
          />
        ) : (
          <FulfillmentDetail
            onClose={() => {
              onCloseToModal();
              setSelectedOrderModal('DUE');
            }}
            paymentId={selectedOrderModal || ''}
            open={openToModal}
            sponsored
          />
        )}
      </>
      {!!selectedItems.length && (
        <div className="flex items-center content-center gap-4 mt-9 flex-nowrap rounded-2xl">
          <div className="flex bg-[#1890FF14] rounded-2xl px-10 py-4 items-start flex-col">
            {selectedItems.length > 1 ? (
              <span className="text-xs font-medium">{selectedItems.length} órdenes seleccionadas</span>
            ) : null}
            <div className="flex items-center">
              <span className="text-lg font-bold whitespace-nowrap">Total a pagar</span>
              <span className="text-lg font-medium ml-[14px]">{formatPrice(totalToPay, 'MXN')}</span>
            </div>
          </div>
          {selectedItems.length === 1 && !countOptionalSelected && (
            <div className="relative flex items-center">
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
        </div>
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
