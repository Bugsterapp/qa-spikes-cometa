import React, { useState } from 'react';
import Dialog from '/src/components/atoms/Dialog';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import { Tooltip } from '/src/components/atoms/Tooltip';

type IDeleteModalSpecialOrder = {
  setDeleteOrder: (openDeleteModal: boolean) => void;
  openDeleteModal: boolean;
  orderDataValue: number;
  handleDelete: () => void;
  loading: boolean;
  isSponsoredMode: boolean;
};

type IDetailsSpecialOrder = {
  name: string;
  id: string;
  value?: string;
  is_visible?: boolean;
  handleDestroyOrder?: (orderData_id: string, skipValidation?: boolean) => void;
  disableDelete: boolean;
  onValidateBeforeDelete?: (overcharge_id: string) => Promise<boolean>;
  paidAmount?: number;
  pendingAmount?: number;
};

export const DetailsSpecialOrder = ({
  name,
  id,
  value,
  is_visible,
  handleDestroyOrder,
  disableDelete,
  onValidateBeforeDelete,
  paidAmount,
  pendingAmount,
}: IDetailsSpecialOrder) => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [deletionContext, setDeletionContext] = useState<{ isSponsored: boolean } | null>(null);

  const handleTrashClick = async () => {
    const overchargeValue = value ? Number(value) : 0;

    let isNowSponsored = false;

    const canSkipValidation =
      (paidAmount !== undefined && paidAmount > 0) ||
      (pendingAmount !== undefined && overchargeValue > 0 && pendingAmount > overchargeValue);

    if (!canSkipValidation && onValidateBeforeDelete) {
      setValidating(true);
      try {
        isNowSponsored = await onValidateBeforeDelete(id);
      } catch (error) {
        setValidating(false);
        return;
      }
      setValidating(false);
    }

    setDeletionContext({ isSponsored: isNowSponsored });
  };

  return (
    <div>
      <div className="flex items-center justify-between font-semibold">
        <div className="flex flex-col w-96">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2
                className="text-sm flex-wrap flex gap-2 items-center max-w-[300px]"
                data-testid={`${name}-discountName`}
              >
                "{name}"{' '}
                {!is_visible ? <p className="text-xs text-[#637381]">Recargo no visible para el tutor</p> : <></>}
              </h2>
              {handleDestroyOrder && (
                <Tooltip
                  message="No puedes eliminar este recargo porque es mayor al monto pendiente a pagar. Ajusta el precio agregando otros recargos o descuentos."
                  disableHover={!disableDelete}
                >
                  <button
                    className="align-middle bg-transparent disabled:cursor-not-allowed"
                    data-testid={`${name}-trashIcon`}
                    onClick={handleTrashClick}
                    disabled={disableDelete || validating}
                  >
                    {validating ? (
                      <div className="flex items-center justify-center w-5 h-5 bg-gray-400 rounded-full">
                        <img src="/assets/oval.svg" alt="loading" className="h-3 w-3" />
                      </div>
                    ) : (
                      <IcTrash className={disableDelete ? 'text-gray-400' : 'text-error'} />
                    )}
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm" data-testid={`${name}-discountValue`}>
            +${value}
          </p>
        </div>
      </div>
      {deletionContext && (
        <DeleteModalSpecialOrder
          openDeleteModal={!!deletionContext}
          setDeleteOrder={() => setDeletionContext(null)}
          orderDataValue={Number(value)}
          loading={loading}
          isSponsoredMode={deletionContext.isSponsored}
          handleDelete={() => {
            setLoading(true);
            handleDestroyOrder?.(id, deletionContext.isSponsored);
            setTimeout(() => {
              setDeletionContext(null);
              setLoading(false);
            }, 5000);
          }}
        />
      )}
    </div>
  );
};
export const DeleteModalSpecialOrder = ({
  setDeleteOrder,
  openDeleteModal,
  orderDataValue,
  handleDelete,
  loading,
  isSponsoredMode,
}: IDeleteModalSpecialOrder) => (
  <>
    <Dialog.Root open={openDeleteModal} position="right" centerWhenSidepanelIsOpen>
      <Dialog.Title>
        {isSponsoredMode
          ? '¿Estás seguro que deseas eliminar este recargo y patrocinar la orden?'
          : '¿Estás seguro que deseas eliminar este recargo?'}
      </Dialog.Title>
      <Dialog.Description>
        {isSponsoredMode ? (
          <p>
            Al eliminar el recargo de ${orderDataValue}, esta orden será patrocinada, por lo que este estudiante no
            tendrá que pagar nada.
          </p>
        ) : (
          <p>Se eliminará el recargo de ${orderDataValue}</p>
        )}
      </Dialog.Description>
      <div className="flex justify-center gap-x-10">
        <Dialog.Close
          onClick={() => setDeleteOrder(!openDeleteModal)}
          className="px-8 py-2 text-sm font-bold text-gray-600 bg-transparent hover:opacity-90 whitespace-nowrap"
          data-testid="cancel-button"
        >
          Cancelar
        </Dialog.Close>
        <button
          className="text-white font-bold	py-2 px-8 rounded-lg text-sm	hover:opacity-90 whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleDelete}
          disabled={loading}
          data-testid="delete-button"
        >
          {isSponsoredMode ? 'Eliminar y patrocinar orden' : 'Eliminar'}
        </button>
      </div>
    </Dialog.Root>
  </>
);
