import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { formatPrice } from '/src/utils/general';
import LinkDetail from '/src/components/atoms/LinkDetail';
import { AxiosError } from 'axios';
import { AmountTitle, Container, ContainerPaymentDetail, HeaderLabel, Title, Value } from '../FulfillmentDetail';
import Sheet from '/src/components/atoms/Sheet';
import { trimId } from '/src/utils/trim-id';
import { GuardianDependentOrder } from '@cometa/trpc/src/types';
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import useAlert from '/src/hooks/useAlert';
import ApiClient from '/src/services/ApiClient';
import { useSession } from 'next-auth/react';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import Dialog from '/src/components/atoms/Dialog';
import { DialogFormSpecialDiscount } from '../DialogFormSpecialDiscount';
import { TypeSpecialDiscount } from '/src/constants/specialDiscountTypes';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import { api } from '/src/utils/api';

type Discount = {
  discountName?: string;
  discountValue?: string;
  discountType?: string;
};

interface OptionalOrderDetailProps {
  onClose: () => void;
  orderOptional: GuardianDependentOrder | undefined;
  open: boolean;
  invalidate: () => void;
  isLoading: boolean;
}

export default function OptionalOrderDetail({
  onClose,
  orderOptional,
  open,
  invalidate,
  isLoading,
}: OptionalOrderDetailProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();

  const { setAlertState } = useAlert();

  const [openSpecialDiscount, setOpenSpecialDiscount] = useState(false);
  const defaultDeleteDiscount = { id: '', discount: 0 };
  const [deleteDiscount, setDeleteDiscount] = useState(defaultDeleteDiscount);
  const utils = api.useUtils();

  const mutationDeleteDiscount = api.schools.schoolsSpecialDiscountsDestroy.useMutation({
    onSuccess() {
      utils.manualPayments.fulfillments.invalidate();
      invalidate();
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
    },
  });

  const totalLabel = 'Total a pagar:';

  const totalPrice = Number(orderOptional?.final_amount);

  const key = trimId(orderOptional?.id || '');

  const addInterestForg = async (discount: Discount) =>
    await ApiClient.createSpecialDiscount(
      session?.token,
      selectedSchool?.id || '',
      discount.discountName || 'Recargo perdonado',
      discount.discountValue,
      orderOptional?.student.id,
      orderOptional?.order_id,
      discount.discountType
    );

  const mutationAddInterestForg = useMutation({
    mutationFn: addInterestForg,
    onSuccess: async () => {
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
      mutationAddInterestForg.mutate({ discountName: data.name, discountValue: data.discount.toString() });
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
                  {orderOptional?.student && (
                    <Container>
                      <Title text="Estudiante:" />
                      <div className="col-span-3 w-fit">
                        <LinkDetail
                          href={`/student/detail/${orderOptional.student.id}`}
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
              <ContainerPaymentDetail id="payment_amount_detail">
                <Container className="grid-cols-2">
                  <AmountTitle text="Monto original:" />
                  <label className="text-sm font-normal justify-self-end">
                    {orderOptional?.price ? formatPrice(orderOptional?.price, orderOptional?.currency) : '-'}
                  </label>
                </Container>
                {orderOptional?.discount_breakdown?.details?.early_bird?.total && (
                  <Container className="grid-cols-2">
                    <AmountTitle text="Descuento pronto pago:" />
                    <label className="text-sm font-normal justify-self-end">
                      -{formatPrice(orderOptional?.discount_breakdown.details.early_bird.total, 'MXN')}
                    </label>
                  </Container>
                )}
                {orderOptional?.discount_breakdown?.details?.scholarships?.details?.map((item) =>
                  item.active ? (
                    <Container key={`discount-breakdown-detail-${item.id}`} className="grid-cols-2">
                      <AmountTitle text={item?.name || ''} />
                      <label className="text-sm font-normal justify-self-end">
                        -{formatPrice(item?.discount || 0, 'MXN')}
                      </label>
                    </Container>
                  ) : null
                )}
                {orderOptional?.discount_breakdown?.details?.special?.details?.map((item) => (
                  <Container key={item.id} className="grid-cols-2">
                    <div className="flex">
                      <AmountTitle text={item.name || ''} loading={isLoading} />
                      {item.type !== TypeSpecialDiscount.INTEREST_FORG && (
                        <button
                          className="ml-1 bg-transparent"
                          disabled={isLoading}
                          onClick={() => {
                            const { id, discount } = item;
                            setDeleteDiscount({ id: id || '', discount: parseFloat(discount || '0') });
                          }}
                        >
                          <IcTrash className="text-error" />
                        </button>
                      )}
                    </div>
                    <label className="text-sm font-normal justify-self-end">
                      -{formatPrice(item?.discount || 0, 'MXN')}
                    </label>
                  </Container>
                ))}
                <Container className="grid-cols-2 pt-5 border-t border-t-gray-600">
                  <label className="text-base font-semibold">{totalLabel}</label>
                  <label className="text-base font-semibold justify-self-end">
                    {formatPrice(totalPrice || 0, 'MXN')}
                  </label>
                </Container>
              </ContainerPaymentDetail>
            </div>
          </div>
        </div>
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
      </Sheet.Content>
    </Sheet>
  );
}
