import {
  DashboardDependentOrderDetail,
  Payin,
  Status259Enum,
  StatusDc1Enum,
  TypeF30Enum,
} from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { VariantProps } from 'class-variance-authority';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRef, useState } from 'react';

import IcAlert from '/public/assets/icons/ic_alert.svg';
import CalendarIcon from '/public/assets/icons/ic_calendar.svg';
import Download from '/public/assets/icons/ic_download.svg';
import Link_To from '/public/assets/icons/ic_link_to.svg';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import Pencil from '/public/assets/icons/pencil.svg';
import AddIcon from '/public/assets/icons/studentDetail/addicon.svg';
import DiscountIcon from '/public/assets/icons/studentDetail/discountIcon.svg';
import Trash from '/public/assets/icons/trash.svg';
import InvoiceChip, { ChipVariants } from '/src/components/atoms/Chip';
import Dialog from '/src/components/atoms/Dialog';
import LinkDetail from '/src/components/atoms/LinkDetail';
import PlaceToPay from '/src/components/atoms/PlaceToPay';
import { useValidateId } from '/src/components/atoms/Sheet';
import { Switch } from '/src/components/atoms/Switch';
import { Tooltip } from '/src/components/atoms/Tooltip';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { ScholarshipItem } from '/src/components/molecules/ScholarshipItem';
import {
  Container,
  ContainerPaymentDetail,
  HeaderLabel,
  Title,
  Value,
} from '/src/components/payments/FulfillmentDetail';
import { Skeleton as SkeletonText } from '/src/components/ui/Skeleton';
import { Events } from '/src/constants/events';
import { TypeSpecialDiscount } from '/src/constants/specialDiscountTypes';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { DeletePayInAlert } from '/src/pages/income';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { formatDateShort, formatPrice, payMethods, renderStatus } from '/src/utils/general';
import { QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';
import { trimId } from '/src/utils/trim-id';
import { PayinFulfillment } from '/types/due-orders';
import { Status } from '/types/paid-orders';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';

import Button from '../Button';
import { DialogFormSpecialDiscount } from '../DialogFormSpecialDiscount';
import { FulfillmentPriceEditDialog } from '../fulfillments/FulfillmentPriceEditDialog';
import PayinSidepanel from '../PayinSidepanelDetail';
import ContainerPaymentRow from './ContainerPaymentRow';
import { DetailsSpecialOrder } from './DetailsSpecialOrder';
import { FormEditDueDate } from './FormEditDueDate';
import { FormSpecialOvercharge } from './FormSpecialOvercharge';
import Alert from '/src/components/ui/Alert';

interface IManualPayDetailProps {
  onClose: () => void;
  orderId: string;
  studentId: string;
  open: boolean;
  onSwitchSidePanel?: (order?: string) => void;
  order: DashboardDependentOrderDetail | undefined;
  isLoading: boolean;
}

type Discount = {
  discountName?: string;
  discountValue?: string;
  discountType?: string;
};

const findMatchingPayinFulfillment = (pfs: any, fulfillmentId: string, valueKey: string, defaultValue: any): any => {
  if (pfs && Array.isArray(pfs)) {
    const match = pfs.find((pf) => pf.fulfillment === fulfillmentId);
    return match ? match[valueKey] : defaultValue;
  }
  return defaultValue;
};

export default function ManualPayDetail({
  onClose,
  orderId,
  studentId,
  onSwitchSidePanel,
  order,
  isLoading,
}: IManualPayDetailProps) {
  const { data: session } = useSession();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
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
  const [openEditFulfillmentPriceDialog, setOpenEditFulfillmentPriceDialog] = useState(false);
  const [openSpecialOvercharge, setOpenSpecialOvercharge] = useState(false);
  const [loadingOvercharge, setLoadingOvercharge] = useState(false);
  const defaultDeleteDiscount = { id: '', discount: '0' };
  const [deleteDiscount, setDeleteDiscount] = useState(defaultDeleteDiscount);
  const selectedSchool = useSelectedSchool();
  const checkId = useValidateId();

  const [selectedPayin, setSelectedPayin] = useState<{ id: string; partial: boolean } | null>(null);
  const [isPayinDeletedDone, setIsPayinDeletedDone] = useState(false);
  const [payinDeleted, setPayinDeleted] = useState<{ first_name: string; last_name: string; date: string } | null>(
    null
  );

  const [openEditDateDialog, setOpenEditDateDialog] = useState(false);
  const [sponsoredPaymentError, setSponsoredPaymentError] = useState<{
    show: boolean;
    message: string;
    details: any;
  }>({ show: false, message: '', details: null });
  const editFulfillmentDueDate = api.payments.editFulfillmentDueDate.useMutation({
    onSuccess: async () => {
      await utils.students.orderDetail.invalidate();
      setOpenEditDateDialog(false);
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Fecha de vencimiento actualizada correctamente',
        alertTime: 3000,
      });
      await utils.students.invalidate();
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error al actualizar la fecha de vencimiento',
      });
    },
  });

  const forgiveInterest = api.payments.forgiveInterest.useMutation({
    onSuccess: async () => {
      await utils.students.orderDetail.invalidate();
      await utils.manualPayments.fulfillments.invalidate();
      await utils.manualPayments.guardianOptionalOrders.invalidate();
      await utils.manualPayments.schoolOptionalOrders.invalidate();
      setOpenEditDateDialog(false);
      setAlertState({
        open: true,
        severity: 'success',
        message: '¡Recargo actualizado con éxito! ',
        alertTime: 3000,
      });
      await utils.students.invalidate();
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error al actualizar el recargo',
      });
    },
  });

  const handleEditDate = (data: { newDueDate: Date; comment?: string | undefined }) => {
    editFulfillmentDueDate.mutate({
      fulfillmentId: order?.fulfillment_id || '',
      schoolId: selectedSchool?.id || '',
      newDueDate: format(data.newDueDate, 'yyyy-MM-dd'),
      comment: data.comment,
    });
  };

  const getIsInProcess = (order: DashboardDependentOrderDetail) => order?.pending && !order?.has_partial_payins;
  const isInProcess = order && getIsInProcess(order);
  const isInterestForgiven = order?.is_interest_forgiven;

  const createSpecialDiscount = async (discount: Discount) =>
    await ApiClient.createSpecialDiscount(
      selectedSchool?.id || '',
      discount.discountName || 'Recargo perdonado',
      discount.discountValue,
      studentId,
      orderId,
      discount.discountType
    );

  const mutationDeleteDiscount = api.schools.schoolsSpecialDiscountsDestroy.useMutation({
    async onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
      queryClient.invalidateQueries({ queryKey: ['schoolFulfillments'] });
      await utils.students.orderDetail.invalidate({ orderId, studentId });
      await utils.manualPayments.fulfillments.invalidate();
      await utils.delinquency.getDelinquency.invalidate();
      sendTrackEventWithUserName(Events.manual_pay_discount_deleted, { source: 'dashboard' });
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
      sendTrackEventWithUserName(Events.manual_pay_discount_deleted_error, { source: 'dashboard' });
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

  const createSpecialDiscountMutation = useMutation({
    mutationFn: createSpecialDiscount,
    onSuccess: async (data) => {
      sendTrackEventWithUserName(Events.manual_payment_add_interest_forget, {});
      await utils.payments.retrieveFulfillment.invalidate({
        schoolId: selectedSchool?.id || '',
        fulfillmentId: order?.fulfillment_id || '',
      });
      await utils.students.orderDetail.invalidate({ orderId, studentId });
      await utils.students.studentsOrdersList.invalidate({ student_id: studentId });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
      await utils.manualPayments.fulfillments.invalidate();
      await utils.delinquency.getDelinquency.invalidate();

      if (openDialog.open && onSwitchSidePanel) {
        onSwitchSidePanel(data?.fulfillment_id);
      }
      setOpenDialog({ open: false, type: null });
      setOpenSpecialDiscount(false);
      onClose();
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
      sendTrackEventWithUserName(Events.manual_payment_error_add_interest_forget, { error: err.message });
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

  const isDue = order?.status === Status259Enum.DUE;

  const handleSwitchChange = () => {
    forgiveInterest.mutate({
      schoolId: selectedSchool?.id || '',
      fulfillmentId: order?.fulfillment_id || '',
    });
  };

  const onSubmitSpecialDiscount = async (data: { name: string; discount: number }) => {
    const todayDate = new Date().toISOString().split('T')[0];
    const isDue = order?.due && order?.due < todayDate;
    if (data.discount === Number(order?.pending_amount) && isDue) {
      setOpenDialog({ open: true, type: 'SPECIAL', name: data.name });
    } else {
      createSpecialDiscountMutation.mutate({ discountName: data.name, discountValue: data.discount.toString() });
      sendTrackEventWithUserName(Events.manual_discount_initiated, {});
    }
  };

  const editFulfillmentBasePrice = api.payments.editFulfillmentBasePrice.useMutation({
    onSuccess: async () => {
      setSponsoredPaymentError({ show: false, message: '', details: null });
      setOpenEditFulfillmentPriceDialog(false);

      setAlertState({
        open: true,
        severity: 'success',
        message: 'Precio actualizado correctamente.',
      });

      await Promise.all([
        utils.students.orderDetail.invalidate({ orderId, studentId }),
        utils.students.studentsOrdersList.invalidate({ student_id: studentId }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] }),
        utils.manualPayments.fulfillments.invalidate(),
        utils.payments.retrieveFulfillment.invalidate({
          schoolId: selectedSchool?.id || '',
          fulfillmentId: order?.fulfillment_id || '',
        }),
        utils.delinquency.getDelinquency.invalidate(),
      ]);
    },
    onError(err: AxiosError | Error | any) {
      const sponsoredData =
        err.data?.customData?.sponsoredPayment || err.data?.sponsoredPaymentData || err.cause || err.response?.data;

      if (sponsoredData?.requires_confirmation) {
        setSponsoredPaymentError({
          show: true,
          message: sponsoredData.message || sponsoredData.detail || 'Estás a punto de generar un pago patrocinado.',
          details: sponsoredData.details,
        });
        return;
      }

      if (err.response?.status === 400 && err.response?.data?.requires_confirmation) {
        setSponsoredPaymentError({
          show: true,
          message:
            err.response.data.message || err.response.data.detail || 'Estás a punto de generar un pago patrocinado.',
          details: err.response.data.details,
        });
        return;
      }

      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se pudo actualizar el precio de la orden, por favor intenta de nuevo.',
      });
      sendTrackEventWithUserName(Events.fulfillment_price_edit_error, { error: err.message });
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          studentId,
          orderId,
          session,
          selectedSchool,
        });
        return scope;
      });
      setOpenEditFulfillmentPriceDialog(false);
    },
  });

  const onFulfillmentPriceEdit = async (
    data: { newAmount: number; comment?: string },
    skipSponsoredValidation = false
  ) => {
    editFulfillmentBasePrice.mutate({
      schoolId: selectedSchool?.id || '',
      fulfillmentId: order?.fulfillment_id || '',
      params: {
        comment: data.comment,
        base: data.newAmount.toString(),
        ...(skipSponsoredValidation && { skip_sponsored_validation: true }),
      },
    });
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
            await utils.students.orderDetail.invalidate({ orderId, studentId });
            await utils.students.studentsOrdersList.invalidate({ student_id: studentId });
            await utils.manualPayments.fulfillments.invalidate();
            await utils.payments.retrieveFulfillment.invalidate({
              schoolId: selectedSchool?.id || '',
              fulfillmentId: order?.fulfillment_id || '',
            });
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

  const validateOverchargeDeletionMutation = api.schools.schoolSpecialOverchargeValidateDeletion.useMutation();
  const destroyOvercharge = api.schools.schoolSpecialOverchargeDestroy.useMutation();

  const handleValidateOverchargeDeletion = async (overcharge_id: string) => {
    try {
      const validationResult = await validateOverchargeDeletionMutation.mutateAsync({
        special_over_charge_id: overcharge_id,
        school_id: selectedSchool?.id as string,
        student_id: studentId,
      });

      return !!validationResult?.would_create_sponsored_payment;
    } catch (error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se pudo validar la eliminación del recargo. Por favor intenta de nuevo.',
      });
      throw error;
    }
  };

  const handleDestroyOvercharge = async (overcharge_id: string, skipValidation = false) => {
    try {
      await destroyOvercharge.mutate(
        {
          special_over_charge_id: overcharge_id,
          school_id: selectedSchool?.id as string,
          student_id: studentId,
          ...(skipValidation && { sponsored_confirmation: true }),
        },
        {
          onSuccess: async () => {
            await utils.students.orderDetail.invalidate({ orderId, studentId });
            await utils.students.studentsOrdersList.invalidate({ student_id: studentId });
            await utils.manualPayments.fulfillments.invalidate();
            await utils.payments.retrieveFulfillment.invalidate({
              schoolId: selectedSchool?.id || '',
              fulfillmentId: order?.fulfillment_id || '',
            });
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
    (!!Number(order?.interest) && Number(order?.interest) <= Number(order?.pending_amount)) || !!isInterestForgiven;

  const canAddSpecialDiscount = order?.pending_amount === '0.00';

  const totalLabel = order?.has_partial_payins ? 'Pendiente a pagar:' : 'Total a pagar:';

  const totalPrice =
    !order?.has_partial_payins || order?.status === Status259Enum.PAID
      ? Number(order?.final_amount)
      : Number(order?.pending_amount);

  const key = trimId(orderId);
  const canAddDiscount = permissions?.can_add_discount;

  const originalAmount = order?.pre_tax_price_amount || order?.amount;
  const originalAmountText = originalAmount ? formatPrice(originalAmount, 'MXN') : '-';
  const originalAmountValue = originalAmount !== undefined ? Number(originalAmount) : undefined;

  const showEditFulfillmentPrice = StatusDc1Enum.PAID != order?.fulfillment_status && canAddDiscount;
  const shouldShowInterestTooltip = (order: DashboardDependentOrderDetail | undefined) => {
    if (!order?.interest) return false;
    if (Number(order.interest) === 0 && !order.is_interest_forgiven) return false;
    return true;
  };
  const disabledEditFulfillmentPrice = StatusDc1Enum.WAITING_PAID == order?.fulfillment_status;
  const isPriceEdited = order?.amount != order?.fulfillment_base_amount;
  const isDueDateEdited = order?.due != order?.original_due;

  const studentPath = (studentId: string) => `/students/${studentId}?prev=/delinquency`;

  const isLateSurchargeForgivenessDisabled =
    !canAddInterestForg ||
    forgiveInterest.isPending ||
    !canAddDiscount ||
    order?.fulfillment_status === StatusDc1Enum.WAITING_PAID;

  return (
    <>
      <div className="flex flex-col flex-auto">
        <div className="sticky top-0 z-10 px-8 w-full bg-white">
          <SidebarHeader title="Detalle de la orden" onClose={onClose} />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className="px-8 mt-1 mb-2">
            <div id="order-data">
              <HeaderLabel>DATOS DE LA ORDEN</HeaderLabel>
              <div className="flex flex-col gap-y-4 mt-8">
                <Container>
                  <Title text="Estado:" />
                  <div className="col-span-2">
                    {isLoading || order === undefined ? (
                      <SkeletonText className="w-28 h-4" />
                    ) : (
                      renderStatus(!!isInProcess)
                    )}
                  </div>
                </Container>
                {order?.dependent && (
                  <Container>
                    <Title text="Estudiante:" />
                    <div className="col-span-3 w-fit">
                      <LinkDetail
                        href={studentPath(order.dependent.id)}
                        text={`${order.dependent.first_name} ${order.dependent.last_name}`}
                        message="Ver detalle de estudiante"
                        loading={isLoading}
                      />
                    </div>
                  </Container>
                )}
                <Container>
                  <Title text="Concepto:" />
                  <Value text={order?.name || ''} loading={isLoading} />
                </Container>
                <Container>
                  <Title text="Fecha de vcto:" />
                  <div className="flex min-w-[350px] gap-3">
                    <div>
                      <div className="flex gap-5 mb-2">
                        <div
                          className={cn(
                            'flex flex-row items-center gap-x-1.5 col-span-3 w-fit text-sm font-semibold text-foreground',
                            {
                              'text-error': isDue && !isDueDateEdited && !editFulfillmentDueDate.isSuccess,
                            }
                          )}
                        >
                          {order?.due && isDueDateEdited ? (
                            <span>{formatDateShort(order?.due || '', true)} </span>
                          ) : (
                            <span>{formatDateShort(order?.due || '', true)}</span>
                          )}
                          {isDue && !isDueDateEdited && <IcAlert />}
                        </div>
                        <Tooltip
                          message="No se puede editar la fecha de una orden que tiene un pago en proceso"
                          side="top"
                          disableHover={order?.fulfillment_status !== StatusDc1Enum.WAITING_PAID}
                        >
                          <button
                            onClick={() => setOpenEditDateDialog(true)}
                            className={cn(
                              'flex items-center font-bold text-green hover:underline',
                              order?.fulfillment_status === StatusDc1Enum.WAITING_PAID &&
                                'cursor-not-allowed text-gray-400 hover:no-underline'
                            )}
                            id="edit-due-date"
                            disabled={order?.fulfillment_status === StatusDc1Enum.WAITING_PAID}
                          >
                            <CalendarIcon
                              className={cn(
                                'w-4 h-4 mr-1 fill-green',
                                order?.fulfillment_status === StatusDc1Enum.WAITING_PAID && 'fill-gray-400'
                              )}
                            />
                            Editar fecha
                          </button>
                        </Tooltip>
                      </div>
                      {order?.due && isDueDateEdited && (
                        <p className="text-xs font-light text-[#637381] italic flex gap-2">
                          Fecha original: {formatDateShort(order?.original_due || '', true)}{' '}
                          <Tooltip message="La fecha de vencimiento fue cambiada manualmente">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g clip-path="url(#clip0_25205_47654)">
                                <path
                                  d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0V0ZM8 14.6667C6.68146 14.6667 5.39253 14.2757 4.2962 13.5431C3.19987 12.8106 2.34539 11.7694 1.84081 10.5512C1.33622 9.33305 1.2042 7.99261 1.46144 6.6994C1.71867 5.40619 2.35361 4.21831 3.28596 3.28596C4.21831 2.35361 5.4062 1.71867 6.6994 1.46143C7.99261 1.2042 9.33305 1.33622 10.5512 1.8408C11.7694 2.34539 12.8106 3.19987 13.5431 4.2962C14.2757 5.39253 14.6667 6.68146 14.6667 8C14.6647 9.76752 13.9617 11.4621 12.7119 12.7119C11.4621 13.9617 9.76752 14.6647 8 14.6667Z"
                                  fill="#A2ABB9"
                                />
                                <path
                                  d="M8.00065 3.33203C7.82384 3.33203 7.65427 3.40227 7.52925 3.52729C7.40422 3.65232 7.33398 3.82189 7.33398 3.9987V9.33203C7.33398 9.50884 7.40422 9.67841 7.52925 9.80344C7.65427 9.92846 7.82384 9.9987 8.00065 9.9987C8.17747 9.9987 8.34704 9.92846 8.47206 9.80344C8.59709 9.67841 8.66733 9.50884 8.66733 9.33203V3.9987C8.66733 3.82189 8.59709 3.65232 8.47206 3.52729C8.34704 3.40227 8.17747 3.33203 8.00065 3.33203Z"
                                  fill="#A2ABB9"
                                />
                                <path
                                  d="M8.66733 11.9987C8.66733 11.6305 8.36885 11.332 8.00065 11.332C7.63246 11.332 7.33398 11.6305 7.33398 11.9987C7.33398 12.3669 7.63246 12.6654 8.00065 12.6654C8.36885 12.6654 8.66733 12.3669 8.66733 11.9987Z"
                                  fill="#A2ABB9"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_25205_47654">
                                  <rect width="16" height="16" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                          </Tooltip>
                        </p>
                      )}
                    </div>
                  </div>
                </Container>
              </div>
            </div>
            {order?.has_partial_payins && (
              <div id="payment_detail" className="mt-11">
                <HeaderLabel>DETALLE DE PAGOS PARCIALES</HeaderLabel>
                {order?.has_partial_payins &&
                  order?.payins?.map((partial) => (
                    <BoxPartialPayin
                      key={partial.id}
                      payin={partial}
                      isLoading={isLoading}
                      fulfillmentId={order?.fulfillment_id}
                      collectedAt={order?.payins?.[0]?.collected_at || ''}
                      schoolId={selectedSchool?.id || ''}
                      onClick={() =>
                        checkId(trimId(partial.id as string), 'Ya tienes abierto este pago en un panel anterior.', () =>
                          setSelectedPayin({ id: partial.id as string, partial: true })
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
                {shouldShowInterestTooltip(order) ? (
                  <Tooltip
                    message={
                      order?.fulfillment_status === StatusDc1Enum.WAITING_PAID
                        ? 'No se puede exonerar el recargo de una orden que tiene un pago en proceso'
                        : !canAddDiscount
                        ? 'Actualmente no tienes permisos para realizar esta acción'
                        : 'No es posible exonerar el recargo ya que el monto pendiente de pago es menor al recargo a exonerar'
                    }
                    disableHover={!isLateSurchargeForgivenessDisabled}
                  >
                    <div className="flex flex-row items-center pl-1 ml-8">
                      <Switch
                        id="waive-surcharge"
                        checked={!!isInterestForgiven || (openDialog.open && openDialog.type === 'INTEREST')}
                        onCheckedChange={() => {
                          if (!canAddDiscount) return;
                          handleSwitchChange();
                        }}
                        disabled={isLateSurchargeForgivenessDisabled}
                        className={cn({
                          'cursor-not-allowed': isLateSurchargeForgivenessDisabled,
                        })}
                      />
                      <label
                        htmlFor="waive-surcharge"
                        className={cn('ml-2 text-sm font-bold cursor-pointer text-green', {
                          'text-gray-600': isLateSurchargeForgivenessDisabled,
                        })}
                      >
                        Exonerar recargo por morosidad
                      </label>
                    </div>
                  </Tooltip>
                ) : null}
                <span id="divider" className="border-b border-[#919EAB3D] w-full max-w-[500px] block my-4 mx-8" />
                <div className="flex flex-row items-center mb-5 ml-8 text-sm font-bold divide-x divide-gray-500/24 text-green">
                  <Tooltip
                    message="Actualmente no tienes permisos para realizar esta acción"
                    disableHover={canAddDiscount}
                  >
                    <button
                      className="flex flex-row items-center p-1 pr-2 bg-transparent transition-colors hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="flex flex-row items-center p-1 pr-2 bg-transparent transition-colors hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <ContainerPaymentRow
                label="Monto original"
                value={originalAmountText}
                isLoading={isLoading}
                labelExtra={isPriceEdited ? 'Editado' : undefined}
                labelExtraTooltip={`El precio original (${order?.amount}) ha sido modificado`}
                message={
                  disabledEditFulfillmentPrice
                    ? 'No puedes editar esta orden porque tiene un pago en proceso'
                    : undefined
                }
                action={
                  showEditFulfillmentPrice &&
                  !isLoading && (
                    <Button
                      variant="ghost"
                      disabled={disabledEditFulfillmentPrice}
                      className="h-1 bg-transparent rounded-full shadow-none"
                      onClick={() => setOpenEditFulfillmentPriceDialog(true)}
                    >
                      <Pencil className="w-3" />
                    </Button>
                  )
                }
              />

              {order?.interest && !!Number(order.interest) && order.interest !== '0.00' && (
                <ContainerPaymentRow
                  label="Recargo"
                  isLoading={isLoading}
                  value={`+${formatPrice(order.interest, 'MXN')}`}
                />
              )}

              {order?.forgiven_interest && !!Number(order.forgiven_interest) && isInterestForgiven ? (
                <ContainerPaymentRow
                  lineThrough={isInterestForgiven}
                  showLineThroughInNumber={isInterestForgiven}
                  message="Este recargo por morosidad ha sido exonerado y no se considera en el total a pagar"
                  label="Recargo"
                  isLoading={isLoading}
                  value={`+${formatPrice(order.forgiven_interest, 'MXN')}`}
                />
              ) : null}

              {order?.tax_amount && order.tax_amount !== '0.00' ? (
                <ContainerPaymentRow
                  label="IVA"
                  isLoading={isLoading}
                  value={`+${formatPrice(order?.tax_amount, 'MXN')}`}
                />
              ) : null}

              {order?.discount_breakdown?.details?.early_bird && (
                <ContainerPaymentRow
                  label="Descuento pronto pago"
                  isLoading={isLoading}
                  value={`-${formatPrice(order?.discount_breakdown.details.early_bird.total, 'MXN')}`}
                />
              )}

              {order?.discount_breakdown?.details?.scholarships?.details.map((item) => (
                <ScholarshipItem
                  key={item.id}
                  item={item}
                  fulfillmentId={order.fulfillment_id}
                  fulfillmentStatus={order.fulfillment_status as StatusDc1Enum}
                  isDue={order.due ? new Date() > new Date(order.due) : false}
                  isLoading={isLoading}
                />
              ))}

              {order?.discount_breakdown?.details?.special?.details?.map((item) => (
                <ContainerPaymentRow
                  key={`discount-breakdown-detail-special-${item.id}`}
                  label={item.name}
                  isLoading={isLoading}
                  value={`-${formatPrice(item.discount, 'MXN')}`}
                  action={
                    item.type !== TypeSpecialDiscount.INTEREST_FORG &&
                    order.fulfillment_status != StatusDc1Enum.WAITING_PAID && (
                      <Button
                        variant="ghost"
                        className="bg-transparent rounded-full shadow-none"
                        onClick={() => {
                          const { id, discount } = item;
                          setDeleteDiscount({ id, discount });
                        }}
                        disabled={isLoading}
                      >
                        <Trash />
                      </Button>
                    )
                  }
                />
              ))}

              {order?.has_partial_payins &&
                order?.payins?.map((partial) => (
                  <ContainerPaymentRow
                    key={`partial_payins_${partial.id}`}
                    isLoading={isLoading}
                    value={`-${formatPrice(
                      findMatchingPayinFulfillment(
                        partial.payin_fullfillments,
                        order.fulfillment_id,
                        'total_paid',
                        partial.total
                      ),
                      'MXN'
                    )}`}
                    label={`Pago parcial (${formatDateShort(
                      findMatchingPayinFulfillment(
                        partial.payin_fullfillments,
                        order.fulfillment_id,
                        'paid_date',
                        partial.paid_date
                      ),
                      true
                    )})`}
                  />
                ))}

              {order?.interest && openDialog.open && openDialog?.type === 'INTEREST' && (
                <div className="flex justify-between items-center font-semibold">
                  <h2 className="text-sm text-right">Recargo perdonado</h2>
                  <p className="text-sm">-{formatPrice(order?.interest, order?.currency)}</p>
                </div>
              )}

              {openDialog.open && openDialog?.type === 'SPECIAL' && (
                <div className="flex justify-between items-center font-semibold">
                  <div className="flex flex-row items-center">
                    <h2 className="mr-2 text-sm text-right">{openDialog.name}</h2>
                    <IcTrash className="text-error" />
                  </div>
                  <p className="text-sm">-{formatPrice(order?.pending_amount || 0, order?.currency)}</p>
                </div>
              )}

              {order?.special_over_charges &&
                order?.special_over_charges.map((item) => (
                  <DetailsSpecialOrder
                    key={item.id}
                    handleDestroyOrder={handleDestroyOvercharge}
                    name={item.name as string}
                    value={item.value ?? undefined}
                    is_visible={item.is_visible}
                    id={item.id}
                    disableDelete={Number(totalPrice) < Number(item.value)}
                    onValidateBeforeDelete={handleValidateOverchargeDeletion}
                    paidAmount={order?.paid_amount ? Number(order.paid_amount) : undefined}
                    pendingAmount={order?.pending_amount ? Number(order.pending_amount) : undefined}
                  />
                ))}
              {loadingOvercharge && <SkeletonText className="w-24 bg-gray-400 dark:bg-gray-600" />}
              <Container className="grid-cols-2 pt-5 border-t border-t-gray-600">
                {isLoading ? (
                  <SkeletonText className="w-24" />
                ) : (
                  <>
                    <label className="text-base font-semibold">{totalLabel}</label>
                    <label className="justify-self-end text-base font-semibold">
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

        {/* Edit fulflillment price */}
        <Dialog.Root
          open={openEditFulfillmentPriceDialog}
          position="right"
          centerWhenSidepanelIsOpen
          onOpenChange={(state) => {
            if (!state) {
              setOpenEditFulfillmentPriceDialog(false);
              setSponsoredPaymentError({ show: false, message: '', details: null });
              sendTrackEventWithUserName(Events.edit_fulfillment_price_canceled, {});
            }
          }}
        >
          <Dialog.Title>Editar precio</Dialog.Title>
          <FulfillmentPriceEditDialog
            ref={formRef}
            amount={totalPrice}
            originalAmount={originalAmountValue}
            setOpen={setOpenEditFulfillmentPriceDialog}
            onDone={onFulfillmentPriceEdit}
            sponsoredPaymentError={sponsoredPaymentError}
            isLoading={editFulfillmentBasePrice.isPending}
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
              sendTrackEventWithUserName(Events.manual_payment_discount_canceled, {});
            }
          }}
        >
          <Dialog.Title>Agregar descuento</Dialog.Title>
          <DialogFormSpecialDiscount
            ref={formRef}
            finalAmount={order?.pending_amount || ''}
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
          <div className="flex gap-x-10 justify-center">
            <Dialog.Close className="px-8 py-2 text-sm font-bold text-gray-600 whitespace-nowrap bg-transparent hover:opacity-90">
              Cancelar
            </Dialog.Close>
            <button
              className="text-white font-bold	py-2 px-8 rounded-lg	text-sm hover:bg-red-700 whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D]"
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
            {openDialog.type === 'SPECIAL'
              ? 'agregar este descuento y marcar la orden como pagada'
              : 'exonerar el recargo'}
            ?
          </Dialog.Title>
          <Dialog.Description>
            <p className="mt-3 mb-3">Al hacerlo, el total a pagar será de $0.00 y se marcará como pagada.</p>
            {order?.has_partial_payins ? (
              <Alert message="Una vez aplicado, esta orden ya no podrá ser modificada." variant="warning" />
            ) : (
              <Alert message="Podrás eliminar este descuento posteriormente si lo necesitas." variant="info" />
            )}
          </Dialog.Description>
          <div className="flex gap-x-10 justify-center">
            <button
              id="dialog-in-drawer-cancel"
              disabled={createSpecialDiscountMutation.isPending}
              className="px-4 py-2 text-sm font-bold text-gray-600 whitespace-nowrap bg-transparent hover:opacity-90"
              onClick={() => setOpenDialog({ open: false, type: null, name: undefined })}
            >
              Cancelar
            </button>
            <Button
              variant="primary"
              size="tooltip"
              disabled={createSpecialDiscountMutation.isPending}
              onClick={() => {
                if (openDialog.type === 'SPECIAL') {
                  createSpecialDiscountMutation.mutate({
                    discountName: openDialog.name,
                    discountValue: order?.pending_amount,
                  });
                } else {
                  createSpecialDiscountMutation.mutate({ discountType: 'INTEREST_FORG' });
                }
              }}
            >
              {createSpecialDiscountMutation.isPending
                ? 'Cargando...'
                : openDialog.type === 'SPECIAL'
                ? 'Agregar y marcar como pagada'
                : 'Si, exonerar recargo'}
            </Button>
          </div>
        </Dialog.Root>

        {/* Edit date */}
        <Dialog.Root
          open={openEditDateDialog}
          position="right"
          centerWhenSidepanelIsOpen
          onOpenChange={(state) => {
            if (!state) {
              setOpenEditDateDialog(false);
            }
          }}
        >
          <Dialog.Title>Editar fecha de vencimiento</Dialog.Title>
          <Dialog.Description>Ingresa la nueva fecha de esta orden.</Dialog.Description>
          <FormEditDueDate
            ref={formRef}
            currentDueDate={order?.original_due ? new Date(order.original_due + 'T00:00:00') : undefined}
            onSubmitDueDate={handleEditDate}
            setOpenEditDateDialog={setOpenEditDateDialog}
            isLoading={editFulfillmentDueDate.isPending}
          />
        </Dialog.Root>
      </div>
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
        <DeletePayInAlert payinDeleted={payinDeleted} setIsPayinDeletedDone={setIsPayinDeletedDone} />
      ) : null}
    </>
  );
}

interface BoxPartialPayinProps {
  payin: Payin;
  isLoading?: boolean;
  schoolId: string;
  fulfillmentId: string;
  onClick?: () => void;
  payinFulfillment?: PayinFulfillment;
  collectedAt: string;
  failOriginMessage?: Record<string, string>;
}

const BoxPartialPayin = ({
  payin,
  isLoading,
  schoolId,
  onClick,
  fulfillmentId,
  payinFulfillment,
  failOriginMessage,
  collectedAt,
}: BoxPartialPayinProps) => {
  const atSchool = collectedAt === 'collected_at_school';
  const invoiceStatus = {
    success: 'success',
    pending: 'info',
    canceled: 'error',
    canceling: 'error',
    not_requested: 'disabled',
    failed: 'warning',
    multiple: 'neutral',
    sponsored: 'disabled',
  } as const;

  const invoiceStatusI18N: Record<Status, { status: string; tooltip?: string }> = {
    success: {
      status: 'Emitida',
    },
    pending: {
      status: 'Por emitir',
      tooltip: `La factura se emitirá hoy a las ${useSelectedSchool()?.config_dashboard?.emit_invoice_time || '11:59'}`,
    },
    canceled: {
      status: 'Cancelada',
      tooltip: 'Esta factura ha sido cancelada manualmente',
    },
    canceling: {
      status: 'Por cancelar',
      tooltip: 'Se ha solicitado la cancelación de esta factura',
    },
    not_requested: {
      status: 'Sin factura',
      tooltip: 'No se ha solicitado la emisión de una factura',
    },
    failed: {
      status: 'En revisión',
      tooltip: 'Hemos detectado inconsistencias con esta factura.',
    },
    multiple: {
      status: 'Múltiples',
      tooltip: 'Esta orden ha recibido múltiples pagos parciales',
    },
    sponsored: {
      status: 'Sin factura',
    },
  };

  return (
    <div className="p-4 mt-4 rounded-lg border border-info">
      <Container className="mt-2">
        <Title text="Pagador:" />
        <div className="col-span-3 w-fit">
          <LinkDetail
            href={`/guardian/${payin.guardian.id}`}
            text={`${payin.guardian.first_name} ${payin.guardian.last_name}`}
            message="Ver detalle de tutor"
            loading={isLoading}
          />
        </div>
      </Container>
      <div className="flex flex-col gap-y-4 mt-4">
        <Container>
          {isLoading ? (
            <SkeletonText />
          ) : (
            <>
              <Title text="Fecha de pago:" />
              <div className="flex col-span-2 w-fit">
                <Value text={formatDateShort(payin.paid_date, true)} />
              </div>
            </>
          )}
        </Container>
        <Container>
          <Title text="Medio de pago:" />
          <Value text={payMethods.find((method) => method.id === payin.type)?.label || ''} loading={isLoading} />
        </Container>
        {payinFulfillment?.invoice?.status === 'failed' ? (
          <>
            <div className="flex flex-row">
              <Title text="Estado de factura:" />
              <InvoiceChip
                intent={
                  invoiceStatus?.[payinFulfillment?.invoice?.status] as VariantProps<typeof ChipVariants>['variant']
                }
              >
                {invoiceStatusI18N?.[payinFulfillment?.invoice?.status]?.status}
              </InvoiceChip>
            </div>
            <Container>
              <Title text="" />
              <span className="text-[#637381] text-xs font-normal col-span-3 pr-6">
                {failOriginMessage?.[payinFulfillment?.invoice?.fail_origin ?? 'cometa']}
              </span>
            </Container>
          </>
        ) : (
          <div className="flex flex-row gap-y-4">
            <Title text="Estado de factura:" />
            <Tooltip message={invoiceStatusI18N?.[payinFulfillment?.invoice?.status || 'not_requested'].tooltip}>
              <InvoiceChip
                intent={
                  invoiceStatus?.[payinFulfillment?.invoice?.status ?? 'not_requested'] as VariantProps<
                    typeof ChipVariants
                  >['variant']
                }
              >
                {invoiceStatusI18N?.[payinFulfillment?.invoice?.status ?? 'not_requested'].status}
              </InvoiceChip>
            </Tooltip>
          </div>
        )}
        <Container className="mr-7">
          <Title text="Folio de factura:" />
          {isLoading ? (
            <SkeletonText />
          ) : payinFulfillment?.invoice &&
            payinFulfillment?.invoice?.fiscal_identifier &&
            payinFulfillment?.invoice?.pdf_url ? (
            <a
              href={payinFulfillment?.invoice?.pdf_url}
              className="flex col-span-3 items-center cursor-pointer w-fit"
              rel="noreferrer noopener"
              target="_blank"
            >
              <label className="ml-2 text-sm cursor-pointer">{payinFulfillment?.invoice?.fiscal_identifier}</label>
              <Download fill="currentColor" className="text-blue-secondary-200" />
            </a>
          ) : (
            <label className="ml-2 text-sm">-</label>
          )}
        </Container>
        <Container className="mt-4">
          <Title text="Facturado a:" />
          <span className="col-span-3">
            <p className="text-sm font-bold">{payinFulfillment?.invoice?.billing_name || ''}</p>
            <p className="text-xs">{payinFulfillment?.invoice?.tax_id || ''}</p>
          </span>
        </Container>
        <Container>
          <Title text="Lugar de pago:" />
          <PlaceToPay at_school={atSchool} loading={!!isLoading} />
        </Container>
        {payin.correlative_id && (
          <Container>
            <Title text="ID de pago:" />
            <Value text={payin.correlative_id} loading={isLoading} loaderWidth={30} onClick={onClick} />
          </Container>
        )}
        <Container>
          <Title text="Monto pagado:" />
          {isLoading ? (
            <SkeletonText className="w-24" />
          ) : (
            formatPrice(
              findMatchingPayinFulfillment(payin.payin_fullfillments, fulfillmentId, 'total_paid', payin.total),
              'MXN'
            )
          )}
        </Container>
        <Container>
          <Title text="Recibo:" />
          <LinkToReceipt href={`/receipt?school_id=${schoolId}&payin_id=${payin.id}`} />
        </Container>
      </div>
    </div>
  );
};

export const LinkToReceipt = ({ href }: { href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex gap-x-2 items-center bg-transparent cursor-pointer"
  >
    <label className="text-sm font-bold cursor-pointer text-blue-secondary-200">Ver recibo</label>
    <Link_To />
  </a>
);
