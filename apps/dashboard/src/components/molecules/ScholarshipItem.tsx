import React from 'react';
import { Tooltip } from '/src/components/atoms/Tooltip';
import Trash from '/public/assets/icons/trash.svg';
import { formatPrice } from '/src/utils/general';
import { StatusDc1Enum } from '@cometa/trpc/src/types';
import { useScholarshipItem } from '/src/hooks/useScholarshipItem';
import Dialog from '/src/components/atoms/Dialog';
import ContainerPaymentRow from '../organisms/dashboard/ManualPayPartial/ContainerPaymentRow';

interface ScholarshipItemProps {
  item: {
    id: string;
    name: string;
    discount: string;
    active: boolean;
  };
  fulfillmentId: string;
  fulfillmentStatus: StatusDc1Enum;
  isLoading: boolean;
  isDue: boolean;
  isSponsored?: boolean;
}

export const ScholarshipItem: React.FC<ScholarshipItemProps> = ({
  item,
  fulfillmentId,
  fulfillmentStatus,
  isDue,
  isLoading,
  isSponsored = true,
}) => {
  const {
    deleteScholarship,
    handleDeleteScholarship,
    isScholarshipLoading,
    setDeleteScholarship,
    isForced,
    isAvoided,
  } = useScholarshipItem(fulfillmentId);

  const canModifyFulfillment = fulfillmentStatus !== StatusDc1Enum.PAID || isSponsored;

  const isDisabled =
    isLoading ||
    (item.id === deleteScholarship?.id && isScholarshipLoading) ||
    fulfillmentStatus === StatusDc1Enum.WAITING_PAID ||
    !canModifyFulfillment;

  return (
    <>
      {item.active ? (
        <ContainerPaymentRow
          key={`discount-breakdown-detail-${item.id}`}
          label={item.name}
          isLoading={isLoading || (item.id === deleteScholarship?.id && isScholarshipLoading)}
          value={`-${formatPrice(item.discount, 'MXN')}`}
          message={isForced ? 'Esta beca o descuento ha sido reactivado manualmente' : ''}
          action={
            <Tooltip
              message={
                fulfillmentStatus === StatusDc1Enum.WAITING_PAID
                  ? 'No puedes modificar esta orden porque tiene un pago en proceso'
                  : canModifyFulfillment
                  ? 'Eliminar la beca de esta orden'
                  : 'No puedes eliminar becas de una orden pagada por un tutor'
              }
              side="left"
            >
              <button
                className="flex cursor-pointer p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() =>
                  setDeleteScholarship({
                    id: item.id,
                    discount: item.discount,
                    is_active: item.active,
                    showDialog: true,
                  })
                }
                disabled={isDisabled}
              >
                <Trash />
              </button>
            </Tooltip>
          }
        />
      ) : (
        <ContainerPaymentRow
          key={`discount-breakdown-detail-${item.id}`}
          label={item.name}
          isLoading={isLoading || (item.id === deleteScholarship?.id && isScholarshipLoading)}
          message={
            isAvoided
              ? 'El beneficio de la beca ha sido eliminado manualmente.'
              : isDue
              ? 'El beneficio de la beca se ha eliminado de esta orden debido a que se encuentra vencida.'
              : ''
          }
          showLineThroughInNumber
          lineThrough
          value={`-${formatPrice(item.discount, 'MXN')}`}
          action={
            <Tooltip message="Reactivar en esta orden" side="left">
              <button
                disabled={isDisabled}
                onClick={() => {
                  setDeleteScholarship({
                    id: item.id,
                    discount: item.discount,
                    is_active: item.active,
                    showDialog: false,
                  });
                  handleDeleteScholarship({ id: item.id, is_active: item.active });
                }}
                className="flex cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11.7667 4.23317C10.68 3.1465 9.13999 2.51983 7.44666 2.69317C4.99999 2.93983 2.98666 4.9265 2.71333 7.37317C2.34666 10.6065 4.84666 13.3332 7.99999 13.3332C10.1267 13.3332 11.9533 12.0865 12.8067 10.2932C13.02 9.8465 12.7 9.33317 12.2067 9.33317C11.96 9.33317 11.7267 9.4665 11.62 9.6865C10.8667 11.3065 9.05999 12.3332 7.08666 11.8932C5.60666 11.5665 4.41333 10.3598 4.09999 8.87983C3.53999 6.29317 5.50666 3.99983 7.99999 3.99983C9.10666 3.99983 10.0933 4.45983 10.8133 5.1865L9.80666 6.19317C9.38666 6.61317 9.67999 7.33317 10.2733 7.33317H12.6667C13.0333 7.33317 13.3333 7.03317 13.3333 6.6665V4.27317C13.3333 3.67983 12.6133 3.37983 12.1933 3.79983L11.7667 4.23317Z"
                    fill="#212B36"
                  />
                </svg>
              </button>
            </Tooltip>
          }
        />
      )}
      <Dialog.Root
        open={!!deleteScholarship && deleteScholarship.showDialog}
        position="right"
        centerWhenSidepanelIsOpen
        onOpenChange={() => setDeleteScholarship(null)}
      >
        <Dialog.Title>¿Estás seguro que deseas eliminar esta beca o descuento?</Dialog.Title>
        <Dialog.Description>
          Al eliminarlo, el estudiante perderá el beneficio únicamente para esta orden. Podrás reactivarlo luego si lo
          necesitas.
        </Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Dialog.Close className="px-8 py-2 text-sm font-bold text-gray-600 bg-transparent hover:opacity-90 whitespace-nowrap">
            Cancelar
          </Dialog.Close>
          <button
            disabled={isLoading}
            className="text-white font-bold py-2 px-8 rounded-lg text-sm hover:opacity-90 whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D] w-[120px] disabled:opacity-50 disabled:cursor-wait"
            onClick={() => {
              if (deleteScholarship?.id) {
                handleDeleteScholarship({ id: deleteScholarship.id, is_active: deleteScholarship.is_active });
              }
            }}
          >
            {isLoading ? <img src="/assets/oval.svg" alt="loading" className="mx-auto h-4" /> : 'Eliminar'}
          </button>
        </div>
      </Dialog.Root>
    </>
  );
};
