import { useSession } from 'next-auth/react';
import ApiClient from '/src/services/ApiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/nextjs';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { formatDateShort, formatPrice, renderStatus } from '/src/utils/general';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import LinkDetail from '/src/components/atoms/LinkDetail';
import { QUERY_KEY_DUE_ORDERS_STUDENT, QUERY_KEY_ORDERS_FOR_PAY_DETAIL } from '/src/utils/reactQueryKeys';
import { IDueOrder } from '/types/due-orders';
import {
  AmountTitle,
  BoxPartialPayin,
  Container,
  ContainerPaymentDetail,
  HeaderLabel,
  SkeletonText,
  Title,
  Value,
} from '../FulfillmentDetail';
import DiscountIcon from '/public/assets/icons/studentDetail/discountIcon.svg';
import AddIcon from 'public/assets/icons/studentDetail/addicon.svg';
import { Switch } from '/src/components/atoms/Switch';
import { TypeSpecialDiscount } from '/src/constants/specialDiscountTypes';
import { useRef, useState } from 'react';
import Dialog from '/src/components/atoms/Dialog';
import { DialogFormSpecialDiscount } from '../DialogFormSpecialDiscount';
import { sendTrackEvent } from '/src/utils/events';
import Button from '../Button';
import { AxiosError } from 'axios';
import useAlert from '/src/hooks/useAlert';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import { Events } from '/src/constants/events';
import { cn } from '/src/utils/cn';
import Sheet, { useValidateId } from '/src/components/atoms/Sheet';
import PayinSidepanel from '../PayinSidepanelDetail';
import { DeletePayinAlert } from '/src/pages/income';
import { trimId } from '/src/utils/trim-id';
import { api } from '/src/utils/api';
import IcAlert from '/public/assets/icons/ic_alert.svg';
import CAlert from '/src/components/atoms/CAlert';
import { TypeF30Enum } from '@cometa/trpc/src/types';
import { DetailsSpecialOrder } from './DetailsSpecialOrder';
import { FormSpecialOvercharge } from './FormSpecialOvercharge';
import { Tooltip } from '/src/components/atoms/Tooltip';

interface IManualPayDetailProps {
  onClose: () => void;
  orderId: string;
  studentId: string;
  open: boolean;
  onSwithSidepanel?: (order?: string) => void;
}

type Discount = {
  discountName?: string;
  discountValue?: string;
  discountType?: string;
};

export default function ManualPayDetail({
  onClose,
  orderId,
  studentId,
  open,
  onSwithSidepanel,
}: IManualPayDetailProps) {
  const { data: session } = useSession();
  const [openDialog, setOpenDialog] = useState<{ open: boolean; type: 'SPECIAL' | 'INTEREST' | null; name?: string }>({
    open: false,
    type: null,
  });
  const permissions = useGetPermissions();

  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();
  const utils = api.useUtils();
  const { setAlertState } = useAlert();
  const [openSpecialDiscount, setOpenSpecialDiscount] = useState(false);
  const [openSpecialOvercharge, setOpenSpecialOvercharge] = useState(false);
  const [loadingOvercharge, setLoadingOvercharge] = useState(false);
  const defaultDeleteDiscount = { id: '', discount: 0 };
  const [deleteDiscount, setDeleteDiscount] = useState(defaultDeleteDiscount);
  const selectedSchool = useSelectedSchool();
  const queryManualPayDetail = async (): Promise<IDueOrder> => {
    const res = await ApiClient.getManualPayDetail(session?.token || '', studentId, orderId);
    return res.data as IDueOrder;
  };
  const checkId = useValidateId();

  const [selectedPayin, setSelectedPayin] = useState<{ id: string; partial: boolean } | null>(null);
  const [isPayinDeletedDone, setIsPayinDeletedDone] = useState(false);
  const [payinDeleted, setPayinDeleted] = useState<{ first_name: string; last_name: string; date: string } | null>(
    null
  );

  const { data: fulfillment, isLoading } = useQuery<IDueOrder>(
    [QUERY_KEY_ORDERS_FOR_PAY_DETAIL, orderId, studentId],
    queryManualPayDetail,
    {
      enabled: !!selectedSchool && !!orderId && !!studentId,
      onError(err) {
        Sentry.captureException(err);
      },
    }
  );

  const getIsInProcess = (order: IDueOrder) => order?.pending && !order?.has_partial_payins;
  const isInProcess = fulfillment && getIsInProcess(fulfillment);
  const discounts = fulfillment?.discount_breakdown?.details;
  const discountForgInterest = discounts?.special?.details.find(
    (detail) => detail.type === TypeSpecialDiscount.INTEREST_FORG
  );

  const addInterestForg = async (discount: Discount) =>
    await ApiClient.createSpecialDiscount(
      session?.token,
      selectedSchool?.id || '',
      discount.discountName || 'Recargo perdonado',
      discount.discountValue,
      studentId,
      orderId,
      discount.discountType
    );

  const mutationDeleteDiscount = api.schools.schoolsSpecialDiscountsDestroy.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
      queryClient.invalidateQueries({ queryKey: ['schoolFulfillments'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS_FOR_PAY_DETAIL] });
      utils.manualPayments.fulfillments.invalidate();
      utils.delinquency.getDelinquency.invalidate();
      sendTrackEvent(Events.manual_pay_discount_deleted, { source: 'dashboard' });
    },
    onError(err: AxiosError | Error | any, variables) {
      setAlertState({
        open: true,
        severity: 'error',
        message:
          err.response?.data?.detail === 'You do not have permission to perform this action.'
            ? 'No tienes permisos para realizar esta acción. Si necesitas activarlo, escríbenos por el chat de soporte.'
            : 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      sendTrackEvent(Events.manual_pay_discount_deleted_error, { source: 'dashboard' });
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          studentId: studentId,
          variables,
          session,
          selectedSchool,
        });
        return scope;
      });
    },
  });

  const mutationAddInterestForg = useMutation({
    mutationFn: addInterestForg,
    onSuccess: async (data) => {
      sendTrackEvent('dashboard: Manual Payment Add Interest Forget', {});
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS_FOR_PAY_DETAIL, orderId, studentId] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
      await utils.manualPayments.fulfillments.invalidate();
      await utils.delinquency.getDelinquency.invalidate();

      if (openDialog.open && onSwithSidepanel) {
        onSwithSidepanel(data?.data?.fulfillment_id);
      }
      setOpenDialog({ open: false, type: null });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
      setOpenSpecialDiscount(false);
    },
    onError(err: AxiosError | Error | any) {
      setAlertState({
        open: true,
        severity: 'error',
        message:
          err.response?.data?.detail === 'You do not have permission to perform this action.'
            ? 'No tienes permisos para realizar esta acción. Si necesitas activarlo, escríbenos por el chat de soporte.'
            : 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      sendTrackEvent('dashboard: Manual Payment Error Add Interest Forget', { error: err.message });
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          studentId,
          orderId,
          session,
          selectedSchool,
        });
        return scope;
      });
    },
  });

  const isDue = fulfillment?.status === 'DUE';

  const handleSwitchChange = (checked: boolean) => {
    if (!checked) {
      mutationDeleteDiscount.mutate({
        id: discountForgInterest?.id || '',
        school_id: selectedSchool?.id || '',
      });
    } else if (Number(fulfillment?.pending_amount) - Number(fulfillment?.interest) === 0) {
      setOpenDialog({ open: true, type: 'INTEREST' });
    } else {
      mutationAddInterestForg.mutate({ discountType: 'INTEREST_FORG' });
    }
  };

  const onSubmitSpecialDiscount = async (data: { name: string; discount: number }) => {
    const todayDate = new Date().toISOString().split('T')[0];
    const isDue = fulfillment?.due && fulfillment?.due < todayDate;
    if (data.discount === Number(fulfillment?.pending_amount) && isDue) {
      setOpenDialog({ open: true, type: 'SPECIAL', name: data.name });
    } else {
      mutationAddInterestForg.mutate({ discountName: data.name, discountValue: data.discount.toString() });
      sendTrackEvent('dashboard: Manual Discount Initiated', {});
    }
  };
  const createSpecialOvercharge = api.schools.schoolSpecialOverchargeCreate.useMutation();

  const onSubmitSpecialOvercharge = async (data: { name: string; specialValue: number; isVisible: boolean }) => {
    const { name, specialValue, isVisible } = data;
    setLoadingOvercharge(true);
    try {
      await createSpecialOvercharge.mutate(
        {
          school_id: selectedSchool?.id as string,
          is_visible: isVisible,
          order_id: orderId,
          student_id: studentId,
          type: TypeF30Enum.FIXED,
          value: specialValue.toString(),
          name: name,
          id: '',
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS_FOR_PAY_DETAIL, orderId, studentId] });
            await utils.manualPayments.fulfillments.invalidate();
            setLoadingOvercharge(false);
          },
          onError: (error: AxiosError | Error | any) => {
            setAlertState({
              open: true,
              severity: 'error',
              message:
                error.response?.data?.detail === 'You do not have permission to perform this action.'
                  ? 'No tienes permisos para realizar esta acción. Si necesitas activarlo, escríbenos por el chat de soporte.'
                  : 'Ocurrió un error inesperado, por favor intenta de nuevo.',
            });
            // eslint-disable-next-line no-console
            console.error(error);
          },
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };
  const destroyOvercharge = api.schools.schoolSpecialOverchargeDestroy.useMutation();
  const handleDestroyOvercharge = async (overcharge_id: string) => {
    try {
      await destroyOvercharge.mutate(
        { special_over_charge_id: overcharge_id, school_id: selectedSchool?.id as string, student_id: studentId },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS_FOR_PAY_DETAIL, orderId, studentId] });
            await utils.manualPayments.fulfillments.invalidate();
          },
          onError: (error: AxiosError | Error | any) => {
            setAlertState({
              open: true,
              severity: 'error',
              message:
                error.response?.data?.detail === 'You do not have permission to perform this action.'
                  ? 'No tienes permisos para realizar esta acción. Si necesitas activarlo, escríbenos por el chat de soporte.'
                  : 'Ocurrió un error inesperado, por favor intenta de nuevo.',
            });
            // eslint-disable-next-line no-console
            console.error(error);
          },
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const canAddInterestForg =
    (!!Number(fulfillment?.interest) && Number(fulfillment?.interest) <= Number(fulfillment?.pending_amount)) ||
    !!discountForgInterest;

  const canAddSpecialDiscount = fulfillment?.pending_amount === '0.00';

  const totalLabel = fulfillment?.has_partial_payins ? 'Pendiente a pagar:' : 'Total a pagar:';

  const totalPrice =
    !fulfillment?.has_partial_payins || fulfillment?.status === 'PAID'
      ? Number(fulfillment?.final_amount)
      : Number(fulfillment?.pending_amount);

  const key = trimId(orderId);
  const canAddDiscount = permissions?.can_add_discount;
  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
        id={key}
        key={key}
      >
        <Sheet.Content className="flex flex-col flex-auto h-full overflow-y-auto bg-white">
          <div className="flex flex-col flex-auto">
            <div className="sticky top-0 z-10 w-full px-8 bg-white">
              <SidebarHeader title="Detalle de la orden" onClose={onClose} />
              {!isLoading && !totalPrice && (
                <CAlert
                  className="my-4"
                  type="info"
                  message='Como el total a pagar es $0.00 esta orden pasará automaticamente a estado "Pagada" un día antes de la fecha de vencimiento.'
                />
              )}
            </div>
            <div className="flex flex-col justify-between h-full">
              <div className="px-8 mt-1 mb-2">
                <div id="order-data">
                  <HeaderLabel>DATOS DE LA ORDEN</HeaderLabel>
                  <div className="flex flex-col mt-8 gap-y-4">
                    <Container>
                      <Title text="Estado:" />
                      <div className="col-span-2">
                        {isLoading || fulfillment === undefined ? (
                          <SkeletonText className="h-4 w-28" />
                        ) : (
                          renderStatus(!!isInProcess)
                        )}
                      </div>
                    </Container>
                    {fulfillment?.dependent && (
                      <Container>
                        <Title text="Estudiante:" />
                        <div className="col-span-3 w-fit">
                          <LinkDetail
                            href={`/student/detail/${fulfillment.dependent.id}`}
                            text={`${fulfillment.dependent.first_name} ${fulfillment.dependent.last_name}`}
                            message="Ver detalle de estudiante"
                            loading={isLoading}
                          />
                        </div>
                      </Container>
                    )}
                    <Container>
                      <Title text="Concepto:" />
                      <Value text={fulfillment?.name || ''} loading={isLoading} />
                    </Container>
                    <Container>
                      <Title text="Fecha de vcto:" />
                      <div
                        className={cn(
                          'flex flex-row items-center gap-x-1.5 col-span-3 w-fit text-sm font-semibold text-secondary',
                          {
                            'text-error': isDue,
                          }
                        )}
                      >
                        <span>{formatDateShort(fulfillment?.due || '', true)}</span>
                        {isDue && <IcAlert />}
                      </div>
                    </Container>
                  </div>
                </div>
                {fulfillment?.has_partial_payins && (
                  <div id="payment_detail" className="mt-11">
                    <HeaderLabel>DETALLE DE PAGOS PARCIALES</HeaderLabel>
                    {fulfillment?.has_partial_payins &&
                      fulfillment?.payins?.map((partial) => (
                        <BoxPartialPayin
                          key={partial.id}
                          payin={partial}
                          isLoading={isLoading}
                          collectedAt={fulfillment?.payins?.[0]?.collected_at || ''}
                          schoolId={selectedSchool?.id || ''}
                          onClick={() =>
                            checkId(
                              trimId(partial.id as string),
                              'Ya tienes abierto este pago en un panel anterior.',
                              () => setSelectedPayin({ id: partial.id as string, partial: true })
                            )
                          }
                        />
                      ))}
                  </div>
                )}
              </div>
              <div>
                {!isInProcess && (
                  <div className="pt-[30px]">
                    {fulfillment?.interest && (
                      <Tooltip
                        message="Actualmente no tienes permisos para realizar esta acción"
                        disableHover={canAddDiscount}
                      >
                        <div className="flex flex-row items-center pl-1 ml-8 ">
                          <Switch
                            id="waive-surcharge"
                            checked={!!discountForgInterest || (openDialog.open && openDialog.type === 'INTEREST')}
                            onCheckedChange={(checked) => {
                              if (!canAddDiscount) return;
                              handleSwitchChange(checked);
                            }}
                            disabled={!canAddInterestForg || mutationAddInterestForg.isLoading || !canAddDiscount}
                            className={cn({
                              'cursor-not-allowed':
                                !canAddInterestForg || mutationAddInterestForg.isLoading || !canAddDiscount,
                            })}
                          />
                          <label
                            htmlFor="waive-surcharge"
                            className={cn('ml-2 cursor-pointer text-green font-bold text-sm', {
                              'opacity-50 cursor-not-allowed text-gray-600':
                                (fulfillment?.pending_amount === '0.00' && !discountForgInterest) || !canAddDiscount,
                            })}
                          >
                            Exonerar recargo por morosidad
                          </label>
                        </div>
                      </Tooltip>
                    )}
                    <span id="divider" className="border-b border-[#919EAB3D] w-full max-w-[500px] block my-4 mx-8" />
                    <div className="flex flex-row items-center mb-5 ml-8 text-sm font-bold divide-x divide-gray-500/24 text-green">
                      <Tooltip
                        message="Actualmente no tienes permisos para realizar esta acción"
                        disableHover={canAddDiscount}
                      >
                        <button
                          className="flex flex-row items-center p-1 pr-2 transition-colors bg-transparent hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => {
                            setOpenSpecialDiscount(true);
                          }}
                          disabled={canAddSpecialDiscount || !canAddDiscount}
                        >
                          <DiscountIcon className="w-5 mr-[5px]" /> Agregar descuento
                        </button>
                      </Tooltip>
                      <Tooltip
                        message="Actualmente no tienes permisos para realizar esta acción"
                        disableHover={canAddDiscount}
                      >
                        <button
                          className="flex flex-row items-center p-1 pr-2 transition-colors bg-transparent hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => {
                            setOpenSpecialOvercharge(true);
                          }}
                          disabled={canAddSpecialDiscount || !canAddDiscount}
                          id="add-overcharge"
                        >
                          <AddIcon className="w-5 mr-[5px]" /> Agregar recargo
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                )}
                <ContainerPaymentDetail id="payment_amount_detail">
                  <Container className="grid-cols-2">
                    <AmountTitle text="Monto original:" loading={isLoading} />
                    <label className="text-sm font-normal justify-self-end">
                      {fulfillment?.pre_tax_price_amount || fulfillment?.amount
                        ? formatPrice(fulfillment?.pre_tax_price_amount || fulfillment?.amount, 'MXN')
                        : '-'}
                    </label>
                  </Container>
                  {fulfillment?.interest && !!Number(fulfillment.interest) && (
                    <Container className="grid-cols-2">
                      <AmountTitle text="Recargo:" loading={isLoading} />
                      <label className="text-sm font-normal justify-self-end">
                        +{formatPrice(fulfillment.interest, 'MXN')}
                      </label>
                    </Container>
                  )}
                  {fulfillment?.tax_amount && fulfillment.tax_amount !== '0.00' && (
                    <Container className="grid-cols-2">
                      <AmountTitle text="IVA" loading={isLoading} />
                      <label className="text-sm font-normal justify-self-end">
                        +{formatPrice(fulfillment?.tax_amount, 'MXN')}
                      </label>
                    </Container>
                  )}
                  {fulfillment?.discount_breakdown?.details?.early_bird && (
                    <Container className="grid-cols-2">
                      <AmountTitle text="Descuento pronto pago:" loading={isLoading} />
                      <label className="text-sm font-normal justify-self-end">
                        -{formatPrice(fulfillment?.discount_breakdown.details.early_bird.total, 'MXN')}
                      </label>
                    </Container>
                  )}
                  {fulfillment?.discount_breakdown?.details?.scholarships?.details.map((item) =>
                    item.active ? (
                      <Container key={`discount-breakdown-detail-${item.id}`} className="grid-cols-2">
                        <AmountTitle text={item.name} loading={isLoading} />
                        <label className="text-sm font-normal justify-self-end">
                          -{formatPrice(item.discount, 'MXN')}
                        </label>
                      </Container>
                    ) : fulfillment?.status !== 'DUE' ? (
                      <Container key={item.id} className="grid-cols-2">
                        <AmountTitle
                          text={item.name}
                          loading={isLoading}
                          message="El beneficio de la beca se ha eliminado de esta orden debido a que se encuentra vencida."
                          lineThrough
                        />
                        <label className="text-sm font-normal line-through justify-self-end">
                          -{formatPrice(item.discount, 'MXN')}
                        </label>
                      </Container>
                    ) : null
                  )}
                  {fulfillment?.discount_breakdown?.details?.special?.details?.map((item) => (
                    <Container key={item.id} className="grid-cols-2">
                      <div className="flex items-center gap-2">
                        <AmountTitle text={item.name} loading={isLoading} />
                        {item.type !== TypeSpecialDiscount.INTEREST_FORG && (
                          <button
                            className="bg-transparent"
                            onClick={() => {
                              const { id, discount } = item;
                              setDeleteDiscount({ id, discount });
                            }}
                          >
                            <IcTrash className="text-error" />
                          </button>
                        )}
                      </div>
                      <label className="text-sm font-normal justify-self-end">
                        -{formatPrice(item.discount, 'MXN')}
                      </label>
                    </Container>
                  ))}
                  {fulfillment?.has_partial_payins &&
                    fulfillment?.payins?.map((partial) => (
                      <Container key={partial.id} className="grid-cols-2">
                        <AmountTitle
                          text={`Pago parcial (${formatDateShort(partial.paid_date, true)})`}
                          loading={isLoading}
                        />
                        <label className="text-sm font-normal justify-self-end">
                          -{formatPrice(partial.total, 'MXN')}
                        </label>
                      </Container>
                    ))}
                  {fulfillment?.interest && openDialog.open && openDialog?.type === 'INTEREST' && (
                    <div className="flex items-center justify-between font-semibold">
                      <h2 className="text-sm text-right">Recargo perdonado</h2>
                      <p className="text-sm">-{formatPrice(fulfillment?.interest, fulfillment?.currency)}</p>
                    </div>
                  )}
                  {openDialog.open && openDialog?.type === 'SPECIAL' && (
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex flex-row items-center">
                        <h2 className="mr-2 text-sm text-right">{openDialog.name}</h2>
                        <IcTrash className="text-error" />
                      </div>
                      <p className="text-sm">-{formatPrice(fulfillment?.pending_amount || 0, fulfillment?.currency)}</p>
                    </div>
                  )}
                  {fulfillment?.special_over_charges &&
                    fulfillment?.special_over_charges.map((item) => (
                      <DetailsSpecialOrder
                        key={item.id}
                        handleDestroyOrder={handleDestroyOvercharge}
                        name={item.name}
                        value={item.value}
                        is_visible={item.is_visible}
                        id={item.id}
                        disableDelete={Number(totalPrice) < Number(item.value)}
                      />
                    ))}
                  {loadingOvercharge && <SkeletonText className="w-24 bg-gray-400 dark:bg-gray-600" />}
                  <Container className="grid-cols-2 pt-5 border-t border-t-gray-600">
                    {isLoading ? (
                      <SkeletonText className="w-24" />
                    ) : (
                      <>
                        <label className="text-base font-semibold">{totalLabel}</label>
                        <label className="text-base font-semibold justify-self-end">
                          {Number(totalPrice) <= 0 ? '$0' : formatPrice(totalPrice || 0, 'MXN')}
                        </label>
                      </>
                    )}
                  </Container>
                </ContainerPaymentDetail>
              </div>
            </div>

            {/* Overcharge */}
            <Dialog.Root
              open={openSpecialOvercharge}
              position="right"
              centerWhenSidepanelIsOpen
              onOpenChange={(state) => {
                if (!state) {
                  setOpenSpecialOvercharge(false);
                }
              }}
            >
              <Dialog.Title>Agregar recargo</Dialog.Title>
              <Dialog.Description>Ingresa el motivo y monto de recargo por agregar.</Dialog.Description>
              <FormSpecialOvercharge
                onSubmitOvercharge={onSubmitSpecialOvercharge}
                setOpenSpecialOvercharge={setOpenSpecialOvercharge}
              />
            </Dialog.Root>

            {/* Discount */}
            <Dialog.Root
              open={openSpecialDiscount}
              position="right"
              centerWhenSidepanelIsOpen
              onOpenChange={(state) => {
                if (!state) {
                  setOpenSpecialDiscount(false);
                  sendTrackEvent('dashboard: Manual Payment Discount Canceled', {});
                }
              }}
            >
              <Dialog.Title>Agregar descuento</Dialog.Title>
              <DialogFormSpecialDiscount
                ref={formRef}
                finalAmount={fulfillment?.pending_amount || ''}
                setOpenSpecialDiscount={setOpenSpecialDiscount}
                onSubmitDiscount={onSubmitSpecialDiscount}
              />
            </Dialog.Root>
            <Dialog.Root
              open={!!deleteDiscount.id}
              position="right"
              centerWhenSidepanelIsOpen
              onOpenChange={(state) => {
                if (!state) setDeleteDiscount(defaultDeleteDiscount);
              }}
            >
              <Dialog.Title>¿Estás seguro que deseas eliminar este descuento?</Dialog.Title>
              <Dialog.Description>Se eliminará el descuento de ${deleteDiscount.discount}</Dialog.Description>
              <div className="flex justify-center gap-x-10">
                <Dialog.Close className="px-8 py-2 text-sm font-bold text-gray-600 bg-transparent hover:opacity-90 whitespace-nowrap">
                  Cancelar
                </Dialog.Close>
                <button
                  className="text-white  font-bold	py-2 px-8 rounded-lg	text-sm	hover:opacity-90  whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D]"
                  onClick={() => {
                    mutationDeleteDiscount.mutate(
                      {
                        id: deleteDiscount.id,
                        school_id: selectedSchool?.id || '',
                      },
                      {
                        onSuccess: () => {
                          setDeleteDiscount(defaultDeleteDiscount);
                        },
                        onError: () => {
                          setDeleteDiscount(defaultDeleteDiscount);
                        },
                      }
                    );
                  }}
                >
                  Eliminar
                </button>
              </div>
            </Dialog.Root>
            <Dialog.Root open={openDialog.open} position="right">
              <Dialog.Title>
                ¿Estás seguro que deseas{' '}
                {openDialog.type === 'SPECIAL' ? 'agregar este descuento' : 'exonerar el recargo'}?
              </Dialog.Title>
              <Dialog.Description>
                <p>
                  Esta orden tendrá un total a pagar de $0.00 y <strong>cambiará de estado a "Pagada".</strong> Ya no
                  podrás modificar sus descuentos ni recargos.
                </p>
              </Dialog.Description>
              <div className="flex justify-center gap-x-10">
                <button
                  id="dialog-in-drawer-cancel"
                  disabled={mutationAddInterestForg.isLoading}
                  className="px-8 py-2 text-sm font-bold text-gray-600 bg-transparent hover:opacity-90 whitespace-nowrap"
                  onClick={() => setOpenDialog({ open: false, type: null, name: undefined })}
                >
                  Cancelar
                </button>
                <Button
                  variant="primary"
                  size="tooltip"
                  disabled={mutationAddInterestForg.isLoading}
                  onClick={() => {
                    if (openDialog.type === 'SPECIAL') {
                      mutationAddInterestForg.mutate({
                        discountName: openDialog.name,
                        discountValue: fulfillment?.pending_amount,
                      });
                    } else {
                      mutationAddInterestForg.mutate({ discountType: 'INTEREST_FORG' });
                    }
                  }}
                >
                  {mutationAddInterestForg.isLoading
                    ? 'Cargando...'
                    : openDialog.type === 'SPECIAL'
                    ? 'Si, agregar'
                    : 'Si, exonerar recargo'}
                </Button>
              </div>
            </Dialog.Root>
          </div>
        </Sheet.Content>
      </Sheet>
      {selectedPayin ? (
        <PayinSidepanel
          setIsPayinDeletedDone={setIsPayinDeletedDone}
          open={Boolean(selectedPayin)}
          onClose={() => setSelectedPayin(null)}
          payinId={selectedPayin?.id || ''}
          setPayinDeleted={setPayinDeleted}
          keyToValidate={key}
        />
      ) : null}
      {isPayinDeletedDone ? (
        <DeletePayinAlert payinDeleted={payinDeleted} setIsPayinDeletedDone={setIsPayinDeletedDone} />
      ) : null}
    </>
  );
}
