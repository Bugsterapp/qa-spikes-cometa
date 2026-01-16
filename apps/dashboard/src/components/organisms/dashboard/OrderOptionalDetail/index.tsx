import { Button } from '@cometa/recreo';
import { GuardianDependentOrder, OptionalOrder } from '@cometa/trpc/src/types';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRef, useState } from 'react';

import Plus from '/public/assets/icons/studentDetail/plus.svg';
import Trash from '/public/assets/icons/trash.svg';
import Dialog from '/src/components/atoms/Dialog';
import LinkDetail from '/src/components/atoms/LinkDetail';
import Sheet from '/src/components/atoms/Sheet';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import {
  Container,
  ContainerPaymentDetail,
  HeaderLabel,
  Title,
  Value,
} from '/src/components/payments/FulfillmentDetail';
import { TypeSpecialDiscount } from '/src/constants/specialDiscountTypes';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';
import { formatPrice } from '/src/utils/general';
import { trimId } from '/src/utils/trim-id';

import { DialogFormSpecialDiscount } from '../DialogFormSpecialDiscount';
import ContainerPaymentRow from '../ManualPayPartial/ContainerPaymentRow';

type Discount = {
  discountName?: string;
  discountValue?: string;
  discountType?: string;
};

interface OptionalOrderDetailProps {
  onClose: () => void;
  orderOptional: GuardianDependentOrder | OptionalOrder | undefined;
  open: boolean;
  invalidate: () => Promise<void>;
  isLoading: boolean;
}

export default function OptionalOrderDetail({ onClose, orderOptional, open, invalidate }: OptionalOrderDetailProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const selectedSchool = useSelectedSchool();
  const [loadingDeleteDiscount, setLoadingDeleteDiscount] = useState(false);
  const { setAlertState } = useAlert();

  const [openSpecialDiscount, setOpenSpecialDiscount] = useState(false);
  const defaultDeleteDiscount = { id: '', discount: 0 };
  const [deleteDiscount, setDeleteDiscount] = useState(defaultDeleteDiscount);
  const utils = api.useUtils();

  const hasStudent = (order: GuardianDependentOrder | OptionalOrder | undefined): order is GuardianDependentOrder =>
    order !== undefined && 'student' in order;

  const mutationDeleteDiscount = api.schools.schoolsSpecialDiscountsDestroy.useMutation({
    async onSuccess() {
      await utils.manualPayments.fulfillments.invalidate();
      await utils.payments.retrieveFulfillment.invalidate();
      await invalidate();
      setLoadingDeleteDiscount(false);
    },
    onError(err: AxiosError | Error | any) {
      setLoadingDeleteDiscount(false);
      setAlertState({
        open: true,
        severity: 'error',
        message:
          err.response?.data?.detail === 'You do not have permission to perform this action.'
            ? 'No tienes permisos para realizar esta acción. Si necesitas activarlo, escríbenos por el chat de soporte.'
            : 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
    },
  });

  const totalLabel = 'Total a pagar:';

  const totalPrice = Number(orderOptional?.final_amount);

  const key = trimId(orderOptional?.id || '');

  const createSpecialDiscount = async (discount: Discount) => {
    if (!hasStudent(orderOptional)) {
      throw new Error('Cannot create special discount for orders without student');
    }
    return await ApiClient.createSpecialDiscount(
      selectedSchool?.id || '',
      discount.discountName || 'Recargo perdonado',
      discount.discountValue,
      orderOptional.student.id,
      orderOptional?.order_id,
      discount.discountType
    );
  };

  const createSpecialDiscountMutation = useMutation({
    mutationFn: createSpecialDiscount,
    onSuccess: async () => {
      if (hasStudent(orderOptional)) {
        await utils.students.orderDetail.invalidate({
          orderId: orderOptional?.order_id,
          studentId: orderOptional.student.id,
        });
      }
      invalidate();
      setOpenSpecialDiscount(false);
    },
    onError(error: AxiosError | Error | any) {
      setAlertState({
        open: true,
        severity: 'error',
        message:
          error.response?.data?.detail === 'You do not have permission to perform this action.'
            ? 'No tienes permisos para realizar esta acción. Si necesitas activarlo, escríbenos por el chat de soporte.'
            : 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
    },
  });

  const onSubmitSpecialDiscount = async (data: { name: string; discount: number }) => {
    if (data.discount === Number(orderOptional?.final_amount)) {
      setOpenSpecialDiscount(false);
    } else {
      createSpecialDiscountMutation.mutate({ discountName: data.name, discountValue: data.discount.toString() });
    }
  };

  return (
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
          </div>
          <div className="flex flex-col justify-between h-full">
            <div className="px-8 mt-1 mb-2">
              <div id="order-data">
                <HeaderLabel>DATOS DE LA ORDEN</HeaderLabel>
                <div className="flex flex-col mt-8 gap-y-4">
                  {hasStudent(orderOptional) && (
                    <Container>
                      <Title text="Estudiante:" />
                      <div className="col-span-3 w-fit">
                        <LinkDetail
                          href={`/students/${orderOptional.student.id}`}
                          text={`${orderOptional.student.first_name} ${orderOptional.student.last_name}`}
                          message="Ver detalle de estudiante"
                        />
                      </div>
                    </Container>
                  )}
                  <Container>
                    <Title text="Concepto:" />
                    <Value text={orderOptional?.name || ''} />
                  </Container>
                </div>
              </div>
            </div>
            <div>
              {hasStudent(orderOptional) && (
                <div className="pt-[30px]">
                  <div className="flex flex-row items-center mb-5 ml-8 text-sm font-bold divide-x divide-gray-500/24 text-green">
                    <button
                      className="flex flex-row items-center p-1 pr-2 transition-colors bg-transparent hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        setOpenSpecialDiscount(true);
                      }}
                    >
                      <Plus className="w-3 mr-[11px]" /> Agregar descuento
                    </button>
                  </div>
                </div>
              )}
              <ContainerPaymentDetail id="payment_amount_detail">
                <ContainerPaymentRow
                  label="Monto original:"
                  value={orderOptional?.price ? formatPrice(orderOptional?.price, orderOptional?.currency) : '-'}
                />

                {orderOptional?.discount_breakdown?.details?.special?.details?.map((item) => (
                  <ContainerPaymentRow
                    key={`discount-breakdown-detail-special-${item.id}`}
                    label={item.name}
                    value={`-${formatPrice(item.discount, 'MXN')}`}
                    action={
                      item.type !== TypeSpecialDiscount.INTEREST_FORG && (
                        <Button
                          className="px-1 py-1 bg-transparent rounded-full shadow-none"
                          onClick={() => {
                            const { id, discount } = item;
                            setDeleteDiscount({ id, discount: parseFloat(discount) });
                          }}
                          disabled={loadingDeleteDiscount}
                        >
                          <Trash />
                        </Button>
                      )
                    }
                  />
                ))}

                <Container className="grid-cols-2 pt-5 border-t border-t-gray-600">
                  <label className="text-base font-semibold">{totalLabel}</label>
                  <label className="text-base font-semibold justify-self-end">
                    {Number(totalPrice) <= 0 ? '$0' : formatPrice(totalPrice || 0, 'MXN')}
                  </label>
                </Container>
              </ContainerPaymentDetail>
            </div>
          </div>
        </div>
        {hasStudent(orderOptional) && (
          <Dialog.Root
            open={openSpecialDiscount}
            position="right"
            onOpenChange={(state) => {
              if (!state) {
                setOpenSpecialDiscount(false);
              }
            }}
          >
            <Dialog.Title>Agregar descuento</Dialog.Title>
            <DialogFormSpecialDiscount
              ref={formRef}
              finalAmount={orderOptional?.final_amount || ''}
              onSubmitDiscount={onSubmitSpecialDiscount}
              setOpenSpecialDiscount={setOpenSpecialDiscount}
              optional
            />
          </Dialog.Root>
        )}
        <Dialog.Root
          open={!!deleteDiscount.id}
          position="right"
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
            <Button
              disabled={loadingDeleteDiscount}
              className="text-white font-bold	py-2 px-8 rounded-lg text-sm	hover:opacity-90  whitespace-nowrap shadow-[0_8px_16px_#FF48423D] bg-red-500 hover:bg-red-700"
              onClick={() => {
                setLoadingDeleteDiscount(true);
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
            </Button>
          </div>
        </Dialog.Root>
      </Sheet.Content>
    </Sheet>
  );
}
